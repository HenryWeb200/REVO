import React, { useState } from 'react';
import { Columns, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StructuredAnalysisResponse, BeforeAfterComparisonV2 } from '../types';

interface BeforeAfterCompareViewProps {
  currentAnalysis: StructuredAnalysisResponse;
}

export const BeforeAfterCompareView: React.FC<BeforeAfterCompareViewProps> = ({
  currentAnalysis,
}) => {
  const [compareUrl, setCompareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<BeforeAfterComparisonV2 | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleComparisonTargets = [
    { name: 'Stripe', url: 'https://stripe.com' },
    { name: 'Linear', url: 'https://linear.app' },
    { name: 'Resend', url: 'https://resend.com' },
  ];

  const handleRunComparison = async (targetOverrideUrl?: string) => {
    const targetUrl = (targetOverrideUrl || compareUrl).trim();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Analyze comparison site
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!analyzeRes.ok) {
        throw new Error(`Failed to analyze comparison website (${analyzeRes.status})`);
      }

      const analyzePayload = await analyzeRes.json();
      const comparisonAnalysis: StructuredAnalysisResponse = analyzePayload.data || analyzePayload;

      // 2. Compute comparison & DNA fusion
      const compareRes = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseAnalysis: currentAnalysis,
          comparisonAnalysis,
        }),
      });

      if (!compareRes.ok) {
        throw new Error('Failed to compute DNA comparison matrix');
      }

      const compData: BeforeAfterComparisonV2 = await compareRes.json();
      setComparisonResult(compData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during comparison.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E4E4E7] pb-6">
        <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
          <Columns className="w-4 h-4" />
          <span>Cross-Site Benchmark & DNA Fusion</span>
        </div>
        <h3 className="font-display text-3xl font-extrabold text-[#111827]">
          Before / After & Reference Comparator
        </h3>
        <p className="text-sm text-[#71717A] max-w-3xl">
          Compare {currentAnalysis.siteName} against a benchmark site (e.g. Stripe, Linear) or a previous version snapshot to discover shared principles, distinct advantages, and DNA fusion opportunities.
        </p>
      </div>

      {/* Comparison Input Bar */}
      <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block mb-1.5">
              Enter Reference / Competitor URL
            </span>
            <input
              type="text"
              value={compareUrl}
              onChange={(e) => setCompareUrl(e.target.value)}
              placeholder="e.g. https://stripe.com or https://linear.app"
              disabled={loading}
              className="w-full bg-white border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#1D63ED]"
            />
          </div>

          <div className="sm:pt-5">
            <button
              onClick={() => handleRunComparison()}
              disabled={loading || !compareUrl.trim()}
              className="h-10 px-5 bg-[#1D63ED] hover:bg-[#1855D0] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl inline-flex items-center space-x-2 cursor-pointer transition-colors shadow-xs"
            >
              <span>{loading ? 'Analyzing & Fusing...' : 'Compare DNA'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center space-x-2 text-xs pt-1">
          <span className="text-[#A1A1AA] font-medium">Quick Reference Benchmarks:</span>
          {sampleComparisonTargets.map((samp) => (
            <button
              key={samp.name}
              onClick={() => {
                setCompareUrl(samp.url);
                handleRunComparison(samp.url);
              }}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-white border border-[#E4E4E7] text-[#52525B] hover:text-[#111827] text-[11px] font-medium cursor-pointer transition-colors"
            >
              {samp.name}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Strategic Verdict Card */}
          <div className="bg-[#111827] text-white rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center space-x-2 text-xs text-[#93C5FD] font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>REVO Strategic Verdict</span>
            </div>
            <p className="text-sm sm:text-lg text-[#F4F4F5] leading-relaxed">
              {comparisonResult.strategicVerdict}
            </p>
          </div>

          {/* Side by Side DNA Fingerprints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base Site */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#71717A] block">Base Site</span>
                  <h4 className="font-bold text-lg text-[#111827]">{comparisonResult.baseSite.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#71717A] block">Clarity Score</span>
                  <span className="font-display font-extrabold text-lg text-[#111827]">
                    {comparisonResult.baseSite.clarityScore.toFixed(1)}/10
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#52525B] font-mono bg-white p-3 rounded-lg border border-[#E4E4E7]">
                {comparisonResult.baseSite.dnaSummary}
              </p>
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-emerald-700 block">Unique Strengths:</span>
                {comparisonResult.strengthsComparison.baseAdvantage.map((adv, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-[#52525B]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Site */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#71717A] block">Benchmark Site</span>
                  <h4 className="font-bold text-lg text-[#111827]">{comparisonResult.comparisonSite.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#71717A] block">Clarity Score</span>
                  <span className="font-display font-extrabold text-lg text-[#111827]">
                    {comparisonResult.comparisonSite.clarityScore.toFixed(1)}/10
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#52525B] font-mono bg-white p-3 rounded-lg border border-[#E4E4E7]">
                {comparisonResult.comparisonSite.dnaSummary}
              </p>
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-emerald-700 block">Benchmark Advantages:</span>
                {comparisonResult.strengthsComparison.comparisonAdvantage.map((adv, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-[#52525B]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DNA Fusion Opportunities */}
          <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#1D63ED] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>DNA Fusion & Cross-Pollination Opportunities</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {comparisonResult.fusionOpportunities.map((opp, idx) => (
                <div key={idx} className="bg-white border border-[#E4E4E7] rounded-xl p-4 space-y-1.5">
                  <span className="font-bold text-[#111827] block">Fusion Opportunity 0{idx + 1}</span>
                  <p className="text-[#52525B] leading-relaxed">{opp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
