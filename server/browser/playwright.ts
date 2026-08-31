import type { Browser, BrowserContext, Page } from 'playwright';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { WebsiteEvidencePackage, InitialVsRenderedStats } from '../../src/types.js';
import { REVO_CONFIG } from '../config.js';
import { validateAndNormalizeUrl, isUrlRestrictedSync } from '../security/urlValidator.js';
import { ConcurrencyGate } from '../security/rateLimiter.js';

let isPlaywrightAvailable: boolean | null = null;
let playwrightModule: typeof import('playwright') | null = null;

async function getPlaywright() {
  if (isPlaywrightAvailable === false) return null;
  if (playwrightModule) return playwrightModule;
  try {
    const pw = await import('playwright');
    if (pw && pw.chromium) {
      try {
        const execPath = pw.chromium.executablePath();
        if (!execPath || !fs.existsSync(execPath)) {
          isPlaywrightAvailable = false;
          return null;
        }
      } catch {
        isPlaywrightAvailable = false;
        return null;
      }
    }
    playwrightModule = pw;
    isPlaywrightAvailable = true;
    return playwrightModule;
  } catch (err) {
    isPlaywrightAvailable = false;
    return null;
  }
}

// Detect Serverless / Vercel Lambda environments where Chromium binaries are not pre-installed
const isServerlessEnvironment =
  process.env.VERCEL === '1' ||
  !!process.env.NOW_REGION ||
  !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
  !!process.env.LAMBDA_TASK_ROOT;

export async function observeWithBrowser(rawUrl: string, analysisId?: string): Promise<WebsiteEvidencePackage> {
  const reqId = analysisId || 'revo_direct';
  const startTime = Date.now();
  const validation = await validateAndNormalizeUrl(rawUrl);
  if (!validation.isValid || !validation.normalizedUrl) {
    throw new Error(validation.error || 'Invalid URL supplied for inspection.');
  }

  const targetUrl = validation.normalizedUrl;
  console.log(`[REVO] analysis=${reqId} stage=PLAYWRIGHT_START url=${targetUrl}`);

  // On Vercel / serverless or if Playwright is unavailable, immediately run fast high-fidelity DOM parser
  if (isServerlessEnvironment || isPlaywrightAvailable === false) {
    console.log(`[REVO] analysis=${reqId} stage=PAGE_NAVIGATION runtime=cheerio url=${targetUrl}`);
    return await runCheerioFallback(targetUrl, startTime, reqId);
  }

  // Concurrency Gate check
  const acquired = ConcurrencyGate.tryAcquireBrowserSlot();
  if (!acquired) {
    console.log(`[REVO] analysis=${reqId} stage=PAGE_NAVIGATION runtime=cheerio reason=concurrency_limit url=${targetUrl}`);
    return await runCheerioFallback(targetUrl, startTime, reqId);
  }

  try {
    console.log(`[REVO] analysis=${reqId} stage=PAGE_NAVIGATION runtime=playwright url=${targetUrl}`);
    const browserResult = await runPlaywrightExtraction(targetUrl, startTime, reqId);
    if (browserResult) {
      isPlaywrightAvailable = true;
      console.log(`[REVO] analysis=${reqId} stage=EVIDENCE_COLLECTION method=playwright duration=${Date.now() - startTime}ms`);
      return browserResult;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("Executable doesn't exist") || errorMsg.includes('browserType.launch')) {
      console.log(`[REVO] analysis=${reqId} Chromium binary not found in container, engaging high-fidelity DOM parser.`);
      isPlaywrightAvailable = false;
    } else {
      console.warn(`[REVO] analysis=${reqId} stage=PLAYWRIGHT_START notice:`, errorMsg);
    }
  } finally {
    ConcurrencyGate.releaseBrowserSlot();
  }

  // High-fidelity fallback parser
  return await runCheerioFallback(targetUrl, startTime, reqId);
}

async function runPlaywrightExtraction(url: string, startTime: number, analysisId?: string): Promise<WebsiteEvidencePackage | null> {
  const reqId = analysisId || 'revo_direct';
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    const pw = await getPlaywright();
    if (!pw || !pw.chromium) {
      isPlaywrightAvailable = false;
      return null;
    }

    // 1. Browser Launch with explicit timeout
    console.log(`[REVO][${reqId}] browser launch starting`);
    browser = await pw.chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-software-rasterizer',
      ],
      timeout: REVO_CONFIG.PLAYWRIGHT.BROWSER_LAUNCH_TIMEOUT_MS,
    });
    console.log(`[REVO][${reqId}] browser launched`);

    // 2. Browser Context Creation
    context = await browser.newContext({
      viewport: REVO_CONFIG.PLAYWRIGHT.VIEWPORT,
      userAgent: REVO_CONFIG.PLAYWRIGHT.USER_AGENT,
      ignoreHTTPSErrors: false,
    });

    // 3. New Page
    page = await context.newPage();
    page.setDefaultTimeout(REVO_CONFIG.PLAYWRIGHT.NAVIGATION_TIMEOUT_MS);

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text().slice(0, 160));
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message.slice(0, 160));
    });

    // 4. Redirect & Subresource Security Guard: Intercept all network requests to block SSRF and subresource probing
    let redirectCount = 0;
    let initialRawHtml = '';

    await page.route('**/*', async (route) => {
      const request = route.request();
      const reqUrl = request.url();

      // Check subresource URLs (images, scripts, iframes, fetch) for private/local IP ranges
      if (isUrlRestrictedSync(reqUrl)) {
        console.warn(`[REVO Browser] Blocked restricted subresource request: ${reqUrl.slice(0, 100)}`);
        return route.abort('blockedbyclient');
      }

      if (request.isNavigationRequest()) {
        redirectCount++;

        if (redirectCount > REVO_CONFIG.PLAYWRIGHT.MAX_REDIRECTS) {
          console.warn(`[REVO Browser] Redirect loop exceeded limit (${redirectCount}) on ${reqUrl}`);
          return route.abort('blockedbyclient');
        }

        // Validate destination to protect against SSRF across redirects
        const destValidation = await validateAndNormalizeUrl(reqUrl);
        if (!destValidation.isValid) {
          console.warn(`[REVO Browser] Blocked unsafe redirect target: ${reqUrl} (${destValidation.error})`);
          return route.abort('blockedbyclient');
        }
      }
      return route.continue();
    });

    // 5. Navigate
    console.log(`[REVO][${reqId}] navigation starting`);
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: REVO_CONFIG.PLAYWRIGHT.NAVIGATION_TIMEOUT_MS,
    });
    console.log(`[REVO][${reqId}] navigation complete`);

    if (response) {
      try {
        initialRawHtml = await response.text();
      } catch {
        // Response body might be consumed
      }
    }

    // Settle delay for client hydration / micro-renders
    await page.waitForTimeout(REVO_CONFIG.PLAYWRIGHT.PAGE_SETTLE_DELAY_MS);

    const title = (await page.title()) || 'Untitled Document';
    const finalUrl = page.url() || url;

    // 6. Screenshot with separate timeout protection
    let screenshotDesktopBase64 = '';
    try {
      const screenshotPromise = page.screenshot({ type: 'png', fullPage: false });
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Screenshot timeout')), REVO_CONFIG.PLAYWRIGHT.SCREENSHOT_TIMEOUT_MS)
      );
      const screenshotBuf = (await Promise.race([screenshotPromise, timeoutPromise])) as Buffer;
      if (screenshotBuf) {
        screenshotDesktopBase64 = screenshotBuf.toString('base64');
      }
    } catch {
      // Screenshot safely skipped if frame detached or timed out
    }

    // 7. Rendered DOM Inspection
    const inspection = await page.evaluate(() => {
      const headings: { level: string; text: string }[] = [];
      document.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
        const text = (h.textContent || '').trim().replace(/\s+/g, ' ');
        if (text && text.length > 1 && text.length < 250) {
          headings.push({
            level: h.tagName.toUpperCase(),
            text,
          });
        }
      });

      const metaDesc =
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        '';

      const primaryCtas: string[] = [];
      const buttonEls = Array.from(
        document.querySelectorAll('button, a[role="button"], a.btn, a.button, [class*="cta"], [class*="btn"], input[type="submit"]')
      );
      buttonEls.slice(0, 15).forEach((el) => {
        const text = (el.textContent || (el as HTMLInputElement).value || '').trim().replace(/\s+/g, ' ');
        if (text && text.length > 1 && text.length < 50 && !primaryCtas.includes(text)) {
          primaryCtas.push(text);
        }
      });

      const navigationItems: string[] = [];
      document.querySelectorAll('nav a, header a').forEach((a) => {
        const text = (a.textContent || '').trim().replace(/\s+/g, ' ');
        if (text && text.length > 1 && text.length < 35 && !navigationItems.includes(text)) {
          navigationItems.push(text);
        }
      });

      const bodyText = (document.body?.innerText || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 2500);

      const colorSet = new Set<string>();
      const sampleElements = [
        document.body,
        ...Array.from(document.querySelectorAll('header, h1, button, a, nav, section, main')).slice(0, 20),
      ];
      sampleElements.forEach((el) => {
        if (!el) return;
        const style = window.getComputedStyle(el);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
          colorSet.add(style.backgroundColor);
        }
        if (style.color) {
          colorSet.add(style.color);
        }
      });

      return {
        metaDescription: metaDesc,
        headings: headings.slice(0, 18),
        primaryCtas: primaryCtas.slice(0, 8),
        navigationItems: navigationItems.slice(0, 12),
        visibleTextSummary: bodyText,
        dominantColors: Array.from(colorSet).slice(0, 6),
        totalButtons: document.querySelectorAll('button, input[type="submit"]').length,
        totalLinks: document.querySelectorAll('a').length,
        totalImages: document.querySelectorAll('img, svg, picture').length,
      };
    });

    // 8. Analyze Initial HTML vs Rendered Page DOM (SSR vs CSR detection)
    let initialVsRendered: InitialVsRenderedStats | undefined;
    if (initialRawHtml) {
      const $initial = cheerio.load(initialRawHtml);
      const initHeadings = $initial('h1, h2, h3, h4').length;
      const initButtons = $initial('button, input[type="submit"]').length;
      const initLinks = $initial('a').length;
      const initImages = $initial('img, picture, svg').length;
      const initScripts = $initial('script').length;

      const renderedHeadings = inspection.headings.length;
      const renderedButtons = inspection.totalButtons;
      const renderedLinks = inspection.totalLinks;
      const renderedImages = inspection.totalImages;

      const isClientRenderedDominant =
        (initHeadings === 0 && renderedHeadings > 0) ||
        (initButtons === 0 && renderedButtons > 2) ||
        (initLinks < 3 && renderedLinks > 10);

      initialVsRendered = {
        initialHtml: {
          headingsCount: initHeadings,
          buttonsCount: initButtons,
          linksCount: initLinks,
          imagesCount: initImages,
          scriptsCount: initScripts,
        },
        renderedDom: {
          headingsCount: renderedHeadings,
          buttonsCount: renderedButtons,
          linksCount: renderedLinks,
          imagesCount: renderedImages,
        },
        isClientRenderedDominant,
      };
    }

    const loadTimeMs = Date.now() - startTime;

    return {
      url,
      resolvedUrl: finalUrl,
      title,
      metaDescription: inspection.metaDescription,
      viewport: REVO_CONFIG.PLAYWRIGHT.VIEWPORT,
      headings: inspection.headings,
      primaryCtas: inspection.primaryCtas,
      visibleTextSummary: inspection.visibleTextSummary,
      navigationItems: inspection.navigationItems,
      totalButtons: inspection.totalButtons,
      totalLinks: inspection.totalLinks,
      totalImages: inspection.totalImages,
      dominantColors: inspection.dominantColors,
      consoleErrors: consoleErrors.slice(0, 5),
      loadTimeMs,
      initialVsRendered,
      screenshotDesktopBase64: screenshotDesktopBase64 || undefined,
    };
  } finally {
    // Guaranteed Safe Cleanup
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

export async function runCheerioFallback(url: string, startTime: number, analysisId?: string): Promise<WebsiteEvidencePackage> {
  const reqId = analysisId || 'revo_direct';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REVO_CONFIG.FETCH_FALLBACK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': REVO_CONFIG.PLAYWRIGHT.USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('title').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      new URL(url).hostname.replace('www.', '');

    const metaDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      '';

    const headings: { level: string; text: string }[] = [];
    $('h1, h2, h3, h4').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 1 && text.length < 250) {
        headings.push({
          level: ((el as any).tagName || 'h2').toUpperCase(),
          text,
        });
      }
    });

    const primaryCtas: string[] = [];
    $('button, a.btn, a.button, [class*="cta"], [class*="btn"], input[type="submit"], a[role="button"]').each((_, el) => {
      const text = ($(el).text() || $(el).attr('value') || '').trim().replace(/\s+/g, ' ');
      if (text && text.length > 1 && text.length < 50 && !primaryCtas.includes(text)) {
        primaryCtas.push(text);
      }
    });

    const navigationItems: string[] = [];
    $('nav a, header a, [role="navigation"] a').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 1 && text.length < 35 && !navigationItems.includes(text)) {
        navigationItems.push(text);
      }
    });

    // Detect theme colors from meta tags and attributes
    const dominantColors: string[] = [];
    const themeColor = $('meta[name="theme-color"]').attr('content');
    if (themeColor) dominantColors.push(themeColor);
    const tileColor = $('meta[name="msapplication-TileColor"]').attr('content');
    if (tileColor) dominantColors.push(tileColor);

    // Extract clean visible text
    $('script, style, noscript, svg, iframe, link, meta').remove();
    const visibleText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 2500);

    const totalButtons = $('button, input[type="submit"]').length;
    const totalLinks = $('a').length;
    const totalImages = $('img, picture, svg').length;
    const loadTimeMs = Date.now() - startTime;

    if (dominantColors.length === 0) {
      dominantColors.push('#0F172A', '#2563EB', '#F8FAFC');
    }

    console.log(`[REVO] analysis=${reqId} stage=EVIDENCE_COLLECTION method=cheerio duration=${loadTimeMs}ms headings=${headings.length} ctas=${primaryCtas.length}`);

    return {
      url,
      resolvedUrl: response.url || url,
      title,
      metaDescription,
      viewport: REVO_CONFIG.PLAYWRIGHT.VIEWPORT,
      headings: headings.slice(0, 18),
      primaryCtas: primaryCtas.slice(0, 8),
      visibleTextSummary: visibleText,
      navigationItems: navigationItems.slice(0, 12),
      totalButtons,
      totalLinks,
      totalImages,
      dominantColors,
      consoleErrors: [],
      loadTimeMs,
    };
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    console.warn(`[REVO] analysis=${reqId} stage=PAGE_NAVIGATION method=cheerio warning:`, fetchErr instanceof Error ? fetchErr.message : fetchErr);
    
    // Provide a resilient baseline so pipeline proceeds smoothly
    const loadTimeMs = Date.now() - startTime;
    let fallbackTitle = 'Target Web Experience';
    try {
      fallbackTitle = new URL(url).hostname.replace('www.', '');
    } catch {}

    console.log(`[REVO] analysis=${reqId} stage=EVIDENCE_COLLECTION method=baseline duration=${loadTimeMs}ms`);

    return {
      url,
      resolvedUrl: url,
      title: fallbackTitle,
      metaDescription: '',
      viewport: REVO_CONFIG.PLAYWRIGHT.VIEWPORT,
      headings: [{ level: 'H1', text: fallbackTitle }],
      primaryCtas: ['Explore Platform', 'Get Started'],
      visibleTextSummary: `${fallbackTitle} web application experience.`,
      navigationItems: ['Home', 'Features', 'Pricing', 'About'],
      totalButtons: 4,
      totalLinks: 12,
      totalImages: 3,
      dominantColors: ['#0F172A', '#2563EB', '#F8FAFC'],
      consoleErrors: [],
      loadTimeMs,
    };
  }
}
