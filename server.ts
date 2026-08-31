import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { analyzeWebsitePipeline } from './server/analyzer.js';
import { getAnalysisRecord } from './server/database/storage.js';
import {
  analysisLimiter,
  askLimiter,
  compareLimiter,
  readLimiter,
  auditLimiter,
} from './server/security/rateLimiter.js';
import { validateAndNormalizeUrl } from './server/security/urlValidator.js';
import { handleAskRevo } from './server/intelligence/askRevo.js';
import { compareTwoAnalyses } from './server/intelligence/compare.js';
import {
  getUserCredits,
  deductCreditsAtomic,
  topUpCredits,
  CREDIT_COSTS,
} from './server/security/creditManager.js';
import {
  canRunWatchMode,
  acquireWatchLock,
  releaseWatchLock,
  computeEvidenceHash,
  hasSiteChanged,
  recordWatchJobResult,
} from './server/security/watchModeGuard.js';
import analyzeHandler from './api/analyze.js';
import debugHandler from './api/analyze-debug.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // 2. Body Parsing Limits
  app.use(express.json({ limit: '5mb' }));

  // 3. Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      service: 'revo',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Diagnostic Analyzer Endpoint (Rate limited)
  app.all('/api/analyze-debug', auditLimiter, async (req, res) => {
    try {
      return await debugHandler(req, res);
    } catch (err: unknown) {
      return res.status(500).json({
        ok: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err instanceof Error ? err.message : String(err),
      });
    }
  });

  // 5. Security Test & Self-Audit Endpoint (Rate limited)
  app.post('/api/security-audit', auditLimiter, async (req, res) => {
    const testCases = [
      { input: 'http://localhost:3000', expected: false, label: 'localhost rejection' },
      { input: 'http://127.0.0.1/admin', expected: false, label: 'loopback 127.0.0.1 rejection' },
      { input: 'http://169.254.169.254/latest/meta-data', expected: false, label: 'AWS/GCP metadata endpoint' },
      { input: 'http://10.0.0.1/internal', expected: false, label: 'private 10.0.0.0/8 network' },
      { input: 'http://192.168.1.1/router', expected: false, label: 'private 192.168.0.0/16 network' },
      { input: 'file:///etc/passwd', expected: false, label: 'file protocol rejection' },
      { input: 'ftp://files.example.com', expected: false, label: 'ftp protocol rejection' },
      { input: 'javascript:alert(1)', expected: false, label: 'javascript scheme rejection' },
      { input: 'https://apple.com', expected: true, label: 'public HTTPS domain acceptance' },
      { input: 'stripe.com', expected: true, label: 'auto-normalization of public domain' },
    ];

    const results = await Promise.all(
      testCases.map(async (tc) => {
        const check = await validateAndNormalizeUrl(tc.input);
        const passed = check.isValid === tc.expected;
        return {
          test: tc.label,
          input: tc.input,
          allowed: check.isValid,
          expectedAllowed: tc.expected,
          passed,
          error: check.error || null,
        };
      })
    );

    const allPassed = results.every((r) => r.passed);
    res.json({
      status: allPassed ? 'all_passed' : 'failures_detected',
      totalTests: results.length,
      passedTests: results.filter((r) => r.passed).length,
      auditResults: results,
    });
  });

  // 6. User Credit Balance & Status
  app.get('/api/credits', readLimiter, (req, res) => {
    const ownerId = (req.headers['x-user-id'] as string) || (req.query.ownerId as string) || 'guest_default';
    const credits = getUserCredits(ownerId);
    res.json({
      ownerId,
      credits,
      costs: CREDIT_COSTS,
    });
  });

  app.post('/api/credits/topup', auditLimiter, (req, res) => {
    const ownerId = (req.headers['x-user-id'] as string) || req.body?.ownerId || 'guest_default';
    const amount = Number(req.body?.amount) || 50;
    const newBalance = topUpCredits(ownerId, amount, 'Manual developer top-up');
    res.json({
      ownerId,
      credits: newBalance,
      added: amount,
    });
  });

  // 7. Main Website Analysis Endpoint
  app.post('/api/analyze', analysisLimiter, async (req, res) => {
    try {
      return await analyzeHandler(req, res);
    } catch (err: unknown) {
      console.error('[REVO Pipeline Error]:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during website analysis.';
      const stage = (err as any)?.stage || 'UNKNOWN_STAGE';
      const analysisId = (err as any)?.analysisId || undefined;
      return res.status(500).json({
        status: 'error',
        analysisId,
        stage,
        errorName: err instanceof Error ? err.name : 'ServerError',
        error: message,
      });
    }
  });

  // 8. Retrieve Analysis by ID
  app.get('/api/analysis/:id', readLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const requestingUserId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;

      const record = await getAnalysisRecord(id, requestingUserId);
      if (!record) {
        return res.status(404).json({ error: 'Analysis record not found.' });
      }

      return res.json(record);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unauthorized or record error.';
      return res.status(403).json({ error: message });
    }
  });

  // 9. Interactive Contextual Q&A (Ask REVO with credit check)
  app.post('/api/ask', askLimiter, async (req, res) => {
    try {
      const { question, analysis, conversationHistory } = req.body;
      const ownerId = (req.headers['x-user-id'] as string) || req.body?.ownerId || 'guest_default';

      if (!question || !analysis) {
        return res.status(400).json({ error: 'Question and active analysis are required.' });
      }

      const creditCheck = deductCreditsAtomic(ownerId, 'ASK_REVO');
      if (!creditCheck.success) {
        return res.status(402).json({
          error: creditCheck.error,
          remainingCredits: creditCheck.balance,
          requiredCredits: creditCheck.cost,
        });
      }

      const response = await handleAskRevo({ question, analysis, conversationHistory, ownerId });
      return res.json({
        ...response,
        remainingCredits: creditCheck.balance,
      });
    } catch (err: unknown) {
      console.error('[Ask REVO Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate contextual answer.';
      return res.status(500).json({ error: message });
    }
  });

  // 10. Website Comparison & DNA Fusion (with credit check)
  app.post('/api/compare', compareLimiter, async (req, res) => {
    try {
      const { baseAnalysis, comparisonAnalysis } = req.body;
      const ownerId = (req.headers['x-user-id'] as string) || req.body?.ownerId || 'guest_default';

      if (!baseAnalysis || !comparisonAnalysis) {
        return res.status(400).json({ error: 'Both base and comparison analysis packages are required.' });
      }

      const creditCheck = deductCreditsAtomic(ownerId, 'COMPARE');
      if (!creditCheck.success) {
        return res.status(402).json({
          error: creditCheck.error,
          remainingCredits: creditCheck.balance,
          requiredCredits: creditCheck.cost,
        });
      }

      const comparison = compareTwoAnalyses(baseAnalysis, comparisonAnalysis);
      return res.json({
        ...comparison,
        remainingCredits: creditCheck.balance,
      });
    } catch (err: unknown) {
      console.error('[Compare Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to compare websites.';
      return res.status(500).json({ error: message });
    }
  });

  // 11. Watch Mode Scheduled Run Handler (Protected & Change-Detected)
  app.post('/api/watch/run', compareLimiter, async (req, res) => {
    const { projectId, url } = req.body || {};
    const ownerId = (req.headers['x-user-id'] as string) || req.body?.ownerId || 'guest_default';

    if (!projectId || !url) {
      return res.status(400).json({ error: 'projectId and url parameters are required for Watch Mode run.' });
    }

    const guard = canRunWatchMode(projectId, url, ownerId);
    if (!guard.allowed) {
      return res.status(429).json({ error: guard.reason });
    }

    const acquired = acquireWatchLock(projectId, ownerId);
    if (!acquired) {
      return res.status(409).json({ error: 'Watch Mode execution lock active. Another run is currently processing.' });
    }

    // Deduct Watch Run credits
    const creditCheck = deductCreditsAtomic(ownerId, 'WATCH_RUN');
    if (!creditCheck.success) {
      releaseWatchLock(projectId, ownerId);
      return res.status(402).json({ error: creditCheck.error });
    }

    try {
      const result = await analyzeWebsitePipeline(url, { ownerId });
      const ev = result.evidence;
      const currentHash = computeEvidenceHash(
        ev?.visibleTextSummary || '',
        (ev?.headings || []).map((h) => h.text).join(' ')
      );

      const siteChanged = hasSiteChanged(projectId, ownerId, currentHash);
      recordWatchJobResult(projectId, ownerId, true, currentHash);

      return res.json({
        status: 'success',
        projectId,
        siteChanged,
        remainingCredits: creditCheck.balance,
        analysis: result,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Watch Mode execution failed.';
      recordWatchJobResult(projectId, ownerId, false, undefined, errorMsg);
      return res.status(500).json({ error: errorMsg });
    } finally {
      releaseWatchLock(projectId, ownerId);
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`REVO Engine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
