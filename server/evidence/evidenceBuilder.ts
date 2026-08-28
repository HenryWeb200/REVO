import { WebsiteEvidencePackage } from '../../src/types.js';
import { observeWithBrowser } from '../browser/playwright.js';
import { fetchPageSpeed } from '../performance/pagespeed.js';

export interface EvidenceBuildTimings {
  playwrightDurationMs: number;
  pageSpeedDurationMs: number;
  totalDurationMs: number;
}

export async function buildEvidencePackageConcurrent(targetUrl: string, analysisId?: string): Promise<{
  evidence: WebsiteEvidencePackage;
  timings: EvidenceBuildTimings;
}> {
  const reqId = analysisId || 'revo_direct';
  const overallStart = Date.now();

  console.log(`[REVO] analysis=${reqId} stage=EVIDENCE_COLLECTION Concurrent evidence gathering initiated for: ${targetUrl}`);

  // Run Playwright Browser Observation & PageSpeed concurrently via Promise.allSettled
  let playwrightDurationMs = 0;
  let pageSpeedDurationMs = 0;

  const browserPromise = (async () => {
    const start = Date.now();
    try {
      const result = await observeWithBrowser(targetUrl, reqId);
      playwrightDurationMs = Date.now() - start;
      return result;
    } catch (err) {
      playwrightDurationMs = Date.now() - start;
      console.warn(`[REVO] analysis=${reqId} stage=PLAYWRIGHT_START error (${(playwrightDurationMs / 1000).toFixed(1)}s):`, err instanceof Error ? err.message : err);
      throw err;
    }
  })();

  const pageSpeedPromise = (async () => {
    const start = Date.now();
    try {
      console.log(`[REVO] analysis=${reqId} stage=PAGESPEED_MEASURE starting...`);
      const result = await fetchPageSpeed(targetUrl);
      pageSpeedDurationMs = Date.now() - start;
      console.log(`[REVO] analysis=${reqId} stage=PAGESPEED_MEASURE (${(pageSpeedDurationMs / 1000).toFixed(1)}s): ${result ? 'Metrics Acquired' : 'Unavailable/Skipped'}`);
      return result;
    } catch (err) {
      pageSpeedDurationMs = Date.now() - start;
      console.warn(`[REVO] analysis=${reqId} stage=PAGESPEED_MEASURE skipped (${(pageSpeedDurationMs / 1000).toFixed(1)}s):`, err instanceof Error ? err.message : err);
      return null;
    }
  })();

  const [browserSettled, pageSpeedSettled] = await Promise.allSettled([
    browserPromise,
    pageSpeedPromise,
  ]);

  let evidence: WebsiteEvidencePackage;

  if (browserSettled.status === 'fulfilled' && browserSettled.value) {
    evidence = browserSettled.value;
  } else {
    // If Playwright completely failed, create a minimal fallback evidence container
    console.warn('[REVO Evidence] Playwright failed, constructing basic evidence container');
    evidence = {
      url: targetUrl,
      resolvedUrl: targetUrl,
      title: 'Target Site',
      metaDescription: '',
      viewport: { width: 1440, height: 900 },
      headings: [],
      primaryCtas: [],
      visibleTextSummary: '',
      navigationItems: [],
      totalButtons: 0,
      totalLinks: 0,
      totalImages: 0,
      dominantColors: [],
      loadTimeMs: playwrightDurationMs,
      consoleErrors: [],
    };
  }

  if (pageSpeedSettled.status === 'fulfilled' && pageSpeedSettled.value) {
    const ps = pageSpeedSettled.value;
    evidence.pageSpeedMetrics = {
      performance: ps.performance,
      accessibility: ps.accessibility,
      bestPractices: ps.bestPractices,
      seo: ps.seo,
      fcp: ps.fcp,
      lcp: ps.lcp,
      cls: ps.cls,
    };
  }

  const totalDurationMs = Date.now() - overallStart;
  console.log(`[EVIDENCE] ${(totalDurationMs / 1000).toFixed(1)}s (Evidence Package Assembled)`);

  return {
    evidence,
    timings: {
      playwrightDurationMs,
      pageSpeedDurationMs,
      totalDurationMs,
    },
  };
}
