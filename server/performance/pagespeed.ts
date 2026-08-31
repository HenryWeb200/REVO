import { REVO_CONFIG } from '../config.js';

export interface PageSpeedMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcp: string;
  lcp: string;
  cls: string;
  tbt: string;
  speedIndex: string;
}

export type PageSpeedStatus = 'succeeded' | 'timed_out' | 'failed' | 'unavailable';

export interface PageSpeedFetchResult {
  status: PageSpeedStatus;
  durationMs: number;
  metrics: PageSpeedMetrics | null;
  reason?: string;
}

export async function fetchPageSpeed(targetUrl: string): Promise<PageSpeedFetchResult> {
  const start = Date.now();
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    console.log('[REVO PageSpeed] status=UNAVAILABLE reason=NO_API_KEY duration=0ms action=CONTINUE_WITHOUT_PAGESPEED');
    return {
      status: 'unavailable',
      durationMs: 0,
      metrics: null,
      reason: 'No PAGESPEED_API_KEY configured',
    };
  }

  const timeoutMs = REVO_CONFIG.PAGESPEED_TIMEOUT_MS || 3000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const urlEncoded = encodeURIComponent(targetUrl);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${urlEncoded}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo&key=${apiKey}`;

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'REVO-Analyzer-Instrument/1.0',
      },
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - start;

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.log(`[REVO PageSpeed] status=FAILED statusCode=${res.status} duration=${durationMs}ms action=CONTINUE_WITHOUT_PAGESPEED`);
      return {
        status: 'failed',
        durationMs,
        metrics: null,
        reason: `HTTP ${res.status}: ${errorText.slice(0, 100)}`,
      };
    }

    const data = await res.json();
    const lighthouse = data?.lighthouseResult;
    if (!lighthouse) {
      console.log(`[REVO PageSpeed] status=FAILED reason=NO_LIGHTHOUSE_DATA duration=${durationMs}ms action=CONTINUE_WITHOUT_PAGESPEED`);
      return {
        status: 'failed',
        durationMs,
        metrics: null,
        reason: 'Missing lighthouseResult in API response',
      };
    }

    const categories = lighthouse.categories || {};
    const audits = lighthouse.audits || {};

    const performance = Math.round((categories.performance?.score || 0) * 100);
    const accessibility = Math.round((categories.accessibility?.score || 0) * 100);
    const bestPractices = Math.round((categories['best-practices']?.score || 0) * 100);
    const seo = Math.round((categories.seo?.score || 0) * 100);

    const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';
    const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
    const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
    const tbt = audits['total-blocking-time']?.displayValue || 'N/A';
    const speedIndex = audits['speed-index']?.displayValue || 'N/A';

    const metrics: PageSpeedMetrics = {
      performance,
      accessibility,
      bestPractices,
      seo,
      fcp,
      lcp,
      cls,
      tbt,
      speedIndex,
    };

    console.log(`[REVO PageSpeed] status=SUCCESS duration=${durationMs}ms score=${performance} action=INCLUDED_IN_EVIDENCE`);
    return {
      status: 'succeeded',
      durationMs,
      metrics,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const durationMs = Date.now() - start;
    const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'));

    if (isAbort) {
      console.log(`[REVO PageSpeed] status=TIMEOUT duration=${durationMs}ms action=CONTINUE_WITHOUT_PAGESPEED`);
      return {
        status: 'timed_out',
        durationMs,
        metrics: null,
        reason: `Operation timed out after ${timeoutMs}ms`,
      };
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    console.log(`[REVO PageSpeed] status=FAILED error="${errorMsg}" duration=${durationMs}ms action=CONTINUE_WITHOUT_PAGESPEED`);
    return {
      status: 'failed',
      durationMs,
      metrics: null,
      reason: errorMsg,
    };
  }
}

