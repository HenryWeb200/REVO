/**
 * REVO Analysis Engine Configuration
 * Hardened timeouts, concurrency gates, security constants, and rate limits.
 */

export const REVO_CONFIG = {
  // Overall Pipeline Timeout (Hard deadline)
  ANALYSIS_HARD_DEADLINE_MS: Number(process.env.ANALYSIS_TIMEOUT_MS) || 60000,

  // Playwright Fine-Grained Timeouts
  PLAYWRIGHT: {
    BROWSER_LAUNCH_TIMEOUT_MS: 5000,
    PAGE_CREATION_TIMEOUT_MS: 4000,
    NAVIGATION_TIMEOUT_MS: 12000,
    PAGE_SETTLE_DELAY_MS: 600,
    DOM_EVALUATION_TIMEOUT_MS: 4000,
    SCREENSHOT_TIMEOUT_MS: 3000,
    MAX_REDIRECTS: 5,
    VIEWPORT: { width: 1440, height: 900 },
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },

  // Fallback High-Fidelity Parser Timeout
  FETCH_FALLBACK_TIMEOUT_MS: 12000,

  // PageSpeed API Timeout (Bounded to prevent delaying evidence collection)
  PAGESPEED_TIMEOUT_MS: 3000,

  // Gemini Intelligence Timeouts & Retries
  GEMINI: {
    DEFAULT_MODEL: 'gemini-3.5-flash-lite',
    CANDIDATE_MODELS: ['gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.6-flash'],
    REQUEST_TIMEOUT_MS: 25000,
    MAX_REPAIR_ATTEMPTS: 1,
    MAX_EVIDENCE_TEXT_CHARS: 3500,
    MAX_HEADINGS_COUNT: 20,
    MAX_CTAS_COUNT: 8,
    MAX_NAV_ITEMS_COUNT: 12,
  },

  // Retry & Concurrency Controls
  RETRY: {
    MAX_ATTEMPTS: 2,
    BACKOFF_INITIAL_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
  },

  CONCURRENCY: {
    MAX_CONCURRENT_BROWSER_SESSIONS: 4,
    MAX_CONCURRENT_GEMINI_REQUESTS: 6,
  },

  RATE_LIMITING: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS_PER_IP: 15,
  },

  SECURITY: {
    ALLOWED_PROTOCOLS: ['http:', 'https:'],
    MAX_URL_LENGTH: 2048,
  },
};
