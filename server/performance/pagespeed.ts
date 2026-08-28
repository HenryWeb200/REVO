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

export async function fetchPageSpeed(targetUrl: string): Promise<PageSpeedMetrics | null> {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY;
    const urlEncoded = encodeURIComponent(targetUrl);
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${urlEncoded}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    if (apiKey) {
      apiUrl += `&key=${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutMs = REVO_CONFIG.PAGESPEED_TIMEOUT_MS || 4500;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'REVO-Analyzer-Instrument/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const lighthouse = data?.lighthouseResult;
    if (!lighthouse) return null;

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

    return {
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
  } catch (err) {
    console.warn('[REVO PageSpeed] Metric collection skipped or timed out:', err instanceof Error ? err.message : err);
    return null;
  }
}
