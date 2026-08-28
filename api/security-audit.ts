import { validateAndNormalizeUrl } from '../server/security/urlValidator.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

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
  return res.status(200).json({
    status: allPassed ? 'all_passed' : 'failures_detected',
    totalTests: results.length,
    passedTests: results.filter((r) => r.passed).length,
    auditResults: results,
  });
}
