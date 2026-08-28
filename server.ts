import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { analyzeWebsitePipeline } from './server/analyzer.js';
import { getAnalysisRecord } from './server/database/storage.js';
import { rateLimitMiddleware } from './server/security/rateLimiter.js';
import { validateAndNormalizeUrl } from './server/security/urlValidator.js';
import analyzeHandler from './api/analyze.js';
import debugHandler from './api/analyze-debug.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      service: 'revo',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // Diagnostic Analyzer Endpoint
  app.all('/api/analyze-debug', async (req, res) => {
    try {
      return await debugHandler(req, res);
    } catch (err: unknown) {
      return res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // Security test & self-audit endpoint
  app.post('/api/security-audit', async (req, res) => {
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

  // Main website analysis endpoint with rate limiting & owner association
  app.post('/api/analyze', rateLimitMiddleware, async (req, res) => {
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

  // Retrieve analysis by ID with authorization / RLS check
  app.get('/api/analysis/:id', async (req, res) => {
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
