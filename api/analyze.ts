import { analyzeWebsitePipeline } from '../server/analyzer.js';

export const config = {
  maxDuration: 60,
};

interface ParsedRequestData {
  url?: string;
  ownerId?: string;
  idempotencyKey?: string;
}

async function extractRequestBody(req: any): Promise<ParsedRequestData> {
  // If already parsed by Vercel or Express middleware
  if (req && req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  // If string body
  if (req && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return { url: req.body };
    }
  }

  // If buffer body
  if (req && Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf-8'));
    } catch {}
  }

  // If Web standard Request object
  if (req && typeof req.json === 'function') {
    try {
      return await req.json();
    } catch {}
  }

  // If Node.js readable stream
  if (req && typeof req.on === 'function') {
    const chunks: Buffer[] = [];
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve({}), 3000);
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        clearTimeout(timer);
        try {
          const raw = Buffer.concat(chunks).toString('utf-8');
          if (!raw || !raw.trim()) {
            resolve({});
            return;
          }
          resolve(JSON.parse(raw));
        } catch {
          resolve({});
        }
      });
      req.on('error', () => {
        clearTimeout(timer);
        resolve({});
      });
    });
  }

  return {};
}

function mapStageToStatusCode(stage: string, err: any): number {
  if (stage === 'REQUEST_VALIDATION') return 400;
  if (stage === 'URL_VALIDATION') return 422;
  if (stage === 'CREDIT_CHECK' || err?.isCreditError === true) return 402;
  if (stage === 'CONCURRENCY_LIMIT' || stage === 'RATE_LIMIT' || stage === 'QUOTA_EXHAUSTION') return 429;
  if (err?.isTimeout === true || stage === 'TIMEOUT') return 504;
  if (stage === 'AUTHENTICATION') return 401;
  if (stage === 'PERMISSION') return 403;
  if (
    stage === 'GEMINI_ANALYSIS' ||
    stage === 'GEMINI_INITIALIZATION' ||
    stage === 'PAGE_NAVIGATION' ||
    stage === 'PAGE_INSPECTION' ||
    stage === 'EVIDENCE_EXTRACTION'
  ) {
    return 502;
  }
  return 500;
}

export default async function handler(req: any, res: any) {
  const analysisId = 'revo_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

  console.log(`[REVO][${analysisId}] POST /api/analyze entered`);

  // CORS Headers
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-User-Id',
  };

  // Safe helper to set headers and send response
  const sendResponse = (statusCode: number, data: any) => {
    if (res && typeof res.status === 'function') {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(statusCode).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  };

  const method = req?.method || 'POST';

  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).end();
    }
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (method !== 'POST') {
    return sendResponse(405, {
      status: 'error',
      analysisId,
      stage: 'REQUEST_VALIDATION',
      errorName: 'MethodNotAllowed',
      error: 'Method Not Allowed. Please use POST.',
    });
  }

  try {
    // Stage: REQUEST_VALIDATION
    console.log(`[REVO][${analysisId}] stage=REQUEST_VALIDATION START`);
    const body = await extractRequestBody(req);
    const headerOwnerId = req.headers?.['x-user-id'] as string;
    const headerIdempotency = req.headers?.['x-idempotency-key'] as string;

    const { url, ownerId: bodyOwnerId, idempotencyKey: bodyIdempotency } = body || {};
    const effectiveOwnerId = headerOwnerId || bodyOwnerId || 'guest_default';
    const effectiveIdempotencyKey = headerIdempotency || bodyIdempotency || analysisId;

    if (!url || typeof url !== 'string' || !url.trim()) {
      console.warn(`[REVO][${analysisId}] stage=REQUEST_VALIDATION FAILED error=URL parameter is required`);
      return sendResponse(400, {
        status: 'error',
        analysisId,
        stage: 'REQUEST_VALIDATION',
        errorName: 'MissingUrlError',
        error: 'URL parameter is required.',
      });
    }
    console.log(`[REVO][${analysisId}] stage=REQUEST_VALIDATION SUCCESS url=${url.trim()} owner=${effectiveOwnerId}`);

    // Stage: ENVIRONMENT_VALIDATION
    console.log(`[REVO][${analysisId}] stage=ENVIRONMENT_VALIDATION START`);
    console.log(
      `[REVO][${analysisId}] stage=ENVIRONMENT_VALIDATION SUCCESS (GEMINI_API_KEY=${
        process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING'
      }, SUPABASE_URL=${process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING'}, SUPABASE_SERVICE_ROLE_KEY=${
        process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING'
      })`
    );

    // Execute Analysis Pipeline
    const finalReport = await analyzeWebsitePipeline(
      url.trim(),
      { ownerId: effectiveOwnerId, idempotencyKey: effectiveIdempotencyKey },
      analysisId
    );

    // Stage: RESPONSE_SERIALIZATION
    console.log(`[REVO][${analysisId}] stage=RESPONSE_SERIALIZATION START`);
    const responsePayload = {
      status: 'success',
      analysisId,
      data: finalReport,
      ...finalReport,
    };
    console.log(`[REVO][${analysisId}] stage=RESPONSE_SERIALIZATION SUCCESS`);

    return sendResponse(200, responsePayload);
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : 'AnalysisError';
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during website analysis.';
    const stage = (err as any)?.stage || 'UNKNOWN_STAGE';
    const errAnalysisId = (err as any)?.analysisId || analysisId;
    const statusCode = mapStageToStatusCode(stage, err);

    console.error(`[REVO][${errAnalysisId}] stage=${stage} FAILED errorName=${errorName} error:`, message);

    return sendResponse(statusCode, {
      status: 'error',
      analysisId: errAnalysisId,
      stage,
      errorName,
      error: message,
    });
  }
}
