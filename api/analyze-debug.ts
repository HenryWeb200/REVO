import { GoogleGenAI } from '@google/genai';
import { getSupabaseAdminClient } from '../server/database/supabase.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const debugResults: Record<string, { stage: string; ok: boolean; message?: string; error?: string }> = {};

  // TEST 1: Function start
  debugResults.test1_functionStart = {
    stage: 'FUNCTION_START',
    ok: true,
    message: 'Function started successfully',
  };

  // TEST 2: GEMINI_API_KEY presence
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  debugResults.test2_geminiKey = {
    stage: 'GEMINI_ENV_CHECK',
    ok: hasGeminiKey,
    message: hasGeminiKey ? 'GEMINI_API_KEY is present' : 'GEMINI_API_KEY is missing',
  };

  // TEST 3: SUPABASE_URL presence
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  debugResults.test3_supabaseUrl = {
    stage: 'SUPABASE_URL_CHECK',
    ok: hasSupabaseUrl,
    message: hasSupabaseUrl ? 'SUPABASE_URL is present' : 'SUPABASE_URL is missing',
  };

  // TEST 4: SUPABASE_SERVICE_ROLE_KEY presence
  const hasSupabaseServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  debugResults.test4_supabaseKey = {
    stage: 'SUPABASE_KEY_CHECK',
    ok: hasSupabaseServiceKey,
    message: hasSupabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY is present' : 'SUPABASE_SERVICE_ROLE_KEY is missing',
  };

  // TEST 5: Supabase initialization
  try {
    const supabase = getSupabaseAdminClient();
    debugResults.test5_supabaseInit = {
      stage: 'SUPABASE_INITIALIZATION',
      ok: !!supabase,
      message: supabase ? 'Supabase client initialized' : 'Supabase credentials missing',
    };
  } catch (err: unknown) {
    debugResults.test5_supabaseInit = {
      stage: 'SUPABASE_INITIALIZATION',
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // TEST 6: Gemini initialization
  let aiClient: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      debugResults.test6_geminiInit = {
        stage: 'GEMINI_INITIALIZATION',
        ok: true,
        message: 'GoogleGenAI client initialized',
      };
    } else {
      debugResults.test6_geminiInit = {
        stage: 'GEMINI_INITIALIZATION',
        ok: false,
        error: 'GEMINI_API_KEY not configured',
      };
    }
  } catch (err: unknown) {
    debugResults.test6_geminiInit = {
      stage: 'GEMINI_INITIALIZATION',
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // TEST 7: Minimal Gemini request
  if (aiClient) {
    try {
      const candidateModels = [
        process.env.GEMINI_MODEL,
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.7-flash',
      ].filter(Boolean) as string[];

      let text = '';
      let usedModel = '';
      let lastErr: unknown = null;

      for (const model of candidateModels) {
        try {
          const response = await aiClient.models.generateContent({
            model,
            contents: 'Respond with the exact word PONG.',
          });
          text = response.text || '';
          if (text.trim()) {
            usedModel = model;
            break;
          }
        } catch (e) {
          lastErr = e;
        }
      }

      if (text.trim()) {
        debugResults.test7_geminiPing = {
          stage: 'GEMINI_MINIMAL_REQUEST',
          ok: true,
          message: `${text.trim().slice(0, 50)} (via ${usedModel})`,
        };
      } else {
        debugResults.test7_geminiPing = {
          stage: 'GEMINI_MINIMAL_REQUEST',
          ok: false,
          error: lastErr instanceof Error ? lastErr.message : String(lastErr),
        };
      }
    } catch (err: unknown) {
      debugResults.test7_geminiPing = {
        stage: 'GEMINI_MINIMAL_REQUEST',
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } else {
    debugResults.test7_geminiPing = {
      stage: 'GEMINI_MINIMAL_REQUEST',
      ok: false,
      error: 'Skipped because Gemini client could not initialize',
    };
  }

  // TEST 8: Playwright import
  let playwrightModule: typeof import('playwright') | null = null;
  try {
    playwrightModule = await import('playwright');
    debugResults.test8_playwrightImport = {
      stage: 'PLAYWRIGHT_IMPORT',
      ok: !!playwrightModule?.chromium,
      message: 'Playwright imported dynamically',
    };
  } catch (err: unknown) {
    debugResults.test8_playwrightImport = {
      stage: 'PLAYWRIGHT_IMPORT',
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // TEST 9: Playwright browser launch
  let browser: any = null;
  if (playwrightModule?.chromium) {
    try {
      browser = await playwrightModule.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        timeout: 8000,
      });
      debugResults.test9_browserLaunch = {
        stage: 'PLAYWRIGHT_BROWSER_LAUNCH',
        ok: true,
        message: 'Chromium launched successfully',
      };
    } catch (err: unknown) {
      debugResults.test9_browserLaunch = {
        stage: 'PLAYWRIGHT_BROWSER_LAUNCH',
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } else {
    debugResults.test9_browserLaunch = {
      stage: 'PLAYWRIGHT_BROWSER_LAUNCH',
      ok: false,
      error: 'Playwright chromium module not available in this runtime',
    };
  }

  // TEST 10: Browser navigation
  if (browser) {
    let context: any = null;
    let page: any = null;
    try {
      context = await browser.newContext();
      page = await context.newPage();
      page.setDefaultTimeout(8000);
      const navRes = await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 8000 });
      const pageTitle = await page.title();
      debugResults.test10_navigation = {
        stage: 'PLAYWRIGHT_NAVIGATION',
        ok: !!navRes && pageTitle.length > 0,
        message: `Navigated to example.com: "${pageTitle}"`,
      };
    } catch (err: unknown) {
      debugResults.test10_navigation = {
        stage: 'PLAYWRIGHT_NAVIGATION',
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      if (page) await page.close().catch(() => {});
      if (context) await context.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    }
  } else {
    debugResults.test10_navigation = {
      stage: 'PLAYWRIGHT_NAVIGATION',
      ok: false,
      error: 'Skipped because browser could not launch (DOM fallback used in production)',
    };
  }

  return res.status(200).json({
    ok: true,
    service: 'revo',
    environment: process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'production' : 'development',
    tests: debugResults,
  });
}
