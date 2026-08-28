import {
  createAnalysisRecord,
  updateAnalysisStatus,
  initStorage,
} from './database/storage.js';
import { buildEvidencePackageConcurrent } from './evidence/evidenceBuilder.js';
import { reasonOverEvidence } from './intelligence/gemini.js';
import { buildFinalReport } from './reports/reportBuilder.js';
import { StructuredAnalysisResponse, AnalysisProcessingTimings } from '../src/types.js';
import { validateAndNormalizeUrl } from './security/urlValidator.js';
import { REVO_CONFIG } from './config.js';

// In-memory analysis cache (TTL: 15 minutes)
const analysisCache = new Map<string, { timestamp: number; report: StructuredAnalysisResponse }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

// Initialize Storage (Supabase / In-Memory)
initStorage().catch((err) => {
  console.warn('[REVO Storage] Non-blocking storage init notice:', err);
});

export interface AnalyzePipelineOptions {
  ownerId?: string;
}

export async function analyzeWebsitePipeline(
  rawUrl: string,
  options?: AnalyzePipelineOptions,
  analysisIdOverride?: string
): Promise<StructuredAnalysisResponse> {
  const requestStartedAt = Date.now();
  const timings: AnalysisProcessingTimings = {};
  let currentStage = 'URL_VALIDATION';
  let recordId = analysisIdOverride || ('revo_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7));

  // 1. URL & SSRF Validation Check
  console.log(`[REVO][${recordId}] validating URL: ${rawUrl}`);
  const validation = await validateAndNormalizeUrl(rawUrl);
  if (!validation.isValid || !validation.normalizedUrl) {
    const errorMsg = validation.error || 'Invalid or restricted website URL.';
    console.warn(`[REVO][${recordId}] URL validation failed: ${errorMsg}`);
    const err = new Error(errorMsg);
    (err as any).stage = 'URL_VALIDATION';
    (err as any).analysisId = recordId;
    throw err;
  }

  const cleanUrl = validation.normalizedUrl;
  console.log(`[REVO][${recordId}] URL validated`);
  const normalizedKey = cleanUrl.toLowerCase().replace(/\/+$/, '');

  // 2. Cache Lookup Check
  const cached = analysisCache.get(normalizedKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[REVO][${recordId}] stage=CACHE_HIT key=${normalizedKey}. Returning instant diagnosis.`);
    return cached.report;
  }

  // 3. Create Analysis Record with unique ID and owner association
  currentStage = 'SUPABASE_INITIALIZATION';
  console.log(`[REVO][${recordId}] stage=SUPABASE_INITIALIZATION START`);
  const dbInitStart = Date.now();
  try {
    recordId = await createAnalysisRecord(rawUrl, cleanUrl, options?.ownerId, recordId);
    timings.dbPersistence = Date.now() - dbInitStart;
    console.log(`[REVO][${recordId}] stage=SUPABASE_INITIALIZATION SUCCESS (${timings.dbPersistence}ms)`);
  } catch (dbInitErr) {
    console.warn(`[REVO][${recordId}] stage=SUPABASE_INITIALIZATION FAILED (in-memory storage used):`, dbInitErr);
  }

  // 4. Hard Overall Deadline Execution Wrapper
  let timeoutTimer: NodeJS.Timeout | null = null;

  const hardTimeoutPromise = new Promise<never>((_, reject) => {
    timeoutTimer = setTimeout(() => {
      const err = new Error(
        'REVO could not complete the analysis because the target website did not respond within the processing window.'
      );
      (err as any).isTimeout = true;
      (err as any).stage = currentStage;
      (err as any).analysisId = recordId;
      reject(err);
    }, REVO_CONFIG.ANALYSIS_HARD_DEADLINE_MS);
  });

  const executionPromise = (async () => {
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt < REVO_CONFIG.RETRY.MAX_ATTEMPTS) {
      attempt++;
      try {
        // Step A: Evidence Collection (Browser Observation & PageSpeed concurrently)
        currentStage = 'EVIDENCE_EXTRACTION';
        console.log(`[REVO][${recordId}] stage=EVIDENCE_EXTRACTION START`);
        await updateAnalysisStatus(recordId, 'observing').catch(() => {});
        const evidenceStart = Date.now();
        const { evidence, timings: evidenceTimings } = await buildEvidencePackageConcurrent(cleanUrl, recordId);
        timings.evidenceCollection = Date.now() - evidenceStart;
        timings.browserLaunch = evidenceTimings.playwrightDurationMs;
        console.log(`[REVO][${recordId}] stage=EVIDENCE_EXTRACTION SUCCESS (${timings.evidenceCollection}ms)`);

        // Step B: AI Reasoning
        currentStage = 'GEMINI_ANALYSIS';
        console.log(`[REVO][${recordId}] stage=GEMINI_ANALYSIS START`);
        await updateAnalysisStatus(recordId, 'reasoning', {
          site: {
            title: evidence.title,
            description: evidence.metaDescription,
            type: 'Web Experience',
            primaryGoal: 'Synthesizing...',
          },
          evidence: {
            playwright: {
              viewport: evidence.viewport,
              headingsCount: evidence.headings.length,
              primaryCtas: evidence.primaryCtas,
              hasScreenshot: !!evidence.screenshotDesktopBase64,
              loadTimeMs: evidence.loadTimeMs,
            },
            pageSpeed: evidence.pageSpeedMetrics,
            content: {
              visibleTextLength: evidence.visibleTextSummary.length,
              dominantColors: evidence.dominantColors,
            },
            initialVsRendered: evidence.initialVsRendered,
          },
        }).catch(() => {});

        const geminiStart = Date.now();
        const reasoning = await reasonOverEvidence(evidence, recordId);
        timings.gemini = Date.now() - geminiStart;
        console.log(`[REVO][${recordId}] stage=GEMINI_ANALYSIS SUCCESS (${timings.gemini}ms)`);

        // Step C: Result Validation & Report Composition
        currentStage = 'RESULT_VALIDATION';
        console.log(`[REVO][${recordId}] stage=RESULT_VALIDATION START`);
        await updateAnalysisStatus(recordId, 'composing').catch(() => {});
        const synthesisStart = Date.now();
        const finalReport = buildFinalReport(recordId, reasoning, evidence);
        timings.synthesis = Date.now() - synthesisStart;
        console.log(`[REVO][${recordId}] stage=RESULT_VALIDATION SUCCESS (${timings.synthesis}ms)`);

        // Step D: Supabase Final Persistence
        currentStage = 'SUPABASE_PERSISTENCE';
        console.log(`[REVO][${recordId}] stage=SUPABASE_PERSISTENCE START`);
        const totalDurationMs = Date.now() - requestStartedAt;
        timings.totalDurationMs = totalDurationMs;

        finalReport.processingMetadata = {
          timings,
          attempts: attempt,
        };

        try {
          await updateAnalysisStatus(recordId, 'completed', {
            site: {
              title: evidence.title,
              description: evidence.metaDescription,
              type: finalReport.siteType,
              primaryGoal: finalReport.primaryGoal,
            },
            analysis: {
              whatRevoSees: finalReport.whatRevoSees,
              whyItWorks: finalReport.whyItWorks,
              whereItBreaks: finalReport.whereItBreaks,
              scores: finalReport.scores,
              opportunities: finalReport.topOpportunities,
              overallDiagnosis: finalReport.overallDiagnosis,
            },
            metadata: {
              timings,
              attempts: attempt,
            },
            completedAt: new Date(),
          });
          console.log(`[REVO][${recordId}] stage=SUPABASE_PERSISTENCE SUCCESS`);
        } catch (dbErr) {
          console.warn(`[REVO][${recordId}] stage=SUPABASE_PERSISTENCE FAILED (non-fatal, continuing):`, dbErr);
        }

        console.log(`[REVO][${recordId}] stage=COMPLETED totalDuration=${(totalDurationMs / 1000).toFixed(1)}s`);

        analysisCache.set(normalizedKey, {
          timestamp: Date.now(),
          report: finalReport,
        });

        return finalReport;
      } catch (err: unknown) {
        lastError = err;
        console.warn(`[REVO][${recordId}] stage=${currentStage} attempt=${attempt} error:`, err instanceof Error ? err.message : err);

        // Do not retry SSRF or permanent validation errors
        if (validation.isSsrfViolation || (err as any)?.isSsrfViolation) {
          throw err;
        }

        if (attempt < REVO_CONFIG.RETRY.MAX_ATTEMPTS) {
          const delay = REVO_CONFIG.RETRY.BACKOFF_INITIAL_MS * Math.pow(REVO_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    const finalErr = lastError instanceof Error ? lastError : new Error('Website analysis failed after maximum attempts.');
    (finalErr as any).stage = currentStage;
    (finalErr as any).analysisId = recordId;
    throw finalErr;
  })();

  try {
    const result = await Promise.race([executionPromise, hardTimeoutPromise]);
    if (timeoutTimer) clearTimeout(timeoutTimer);
    return result;
  } catch (err: unknown) {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    const totalDurationMs = Date.now() - requestStartedAt;
    const isTimeout = (err as any)?.isTimeout === true;
    const failureStatus = isTimeout ? 'timed_out' : 'failed';
    const failedStage = (err as any)?.stage || currentStage;
    const errorMsg = isTimeout
      ? 'REVO could not complete the analysis because the target website did not respond within the processing window.'
      : err instanceof Error
      ? err.message
      : 'An unexpected error occurred during website analysis.';

    console.error(`[REVO] analysis=${recordId} stage=${failedStage} status=FAILED totalDuration=${(totalDurationMs / 1000).toFixed(1)}s error:`, errorMsg);

    await updateAnalysisStatus(recordId, failureStatus, {
      errors: [`[Stage: ${failedStage}] ${errorMsg}`],
      metadata: {
        timings: { ...timings, totalDurationMs },
        attempts: 1,
        failedStage,
      },
    }).catch(() => {});

    const errorToThrow = new Error(errorMsg);
    (errorToThrow as any).stage = failedStage;
    (errorToThrow as any).analysisId = recordId;
    throw errorToThrow;
  }
}
