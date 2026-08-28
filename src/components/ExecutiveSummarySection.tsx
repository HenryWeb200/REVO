import React from 'react';
import { ShieldCheck, AlertOctagon, TrendingUp, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface ExecutiveSummaryProps {
  result: StructuredAnalysisResponse;
}

export const ExecutiveSummarySection: React.FC<ExecutiveSummaryProps> = ({ result }) => {
  const exec = result.executiveSummary;
  if (!exec) return null;

  return (
    <div className="space-y-6">
      {/* "The So What?" Master Strategic Takeaway Banner */}
      <div className="bg-[#111827] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-[#27272A] shadow-lg">
        <div className="flex items-center space-x-2 text-xs text-[#93C5FD] font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-[#60A5FA]" />
          <span>The "So What?" Strategic Diagnosis</span>
        </div>
        <p className="text-base sm:text-xl font-normal text-[#F4F4F5] leading-relaxed max-w-4xl">
          {exec.theSoWhatTakeaway}
        </p>
        <div className="mt-4 pt-4 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3 text-xs text-[#A1A1AA]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[#E4E4E7] font-medium">{exec.overallHealth}</span>
          </div>
          <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#1F2937] text-[#93C5FD] border border-[#374151]">
            {exec.designDnaSummary}
          </span>
        </div>
      </div>

      {/* 4 Pillars of Executive Diagnostic Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Strength */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5 space-y-2 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="uppercase tracking-wider">Top Strength</span>
          </div>
          <h4 className="font-bold text-sm text-[#111827]">{exec.biggestStrength}</h4>
          <p className="text-xs text-[#52525B] leading-relaxed">
            Observed mechanism with strongest user engagement and clarity anchor.
          </p>
        </div>

        {/* Top Weakness */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5 space-y-2 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-700">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="uppercase tracking-wider">Top Friction</span>
          </div>
          <h4 className="font-bold text-sm text-[#111827]">{exec.biggestWeakness}</h4>
          <p className="text-xs text-[#52525B] leading-relaxed">
            Primary cognitive bottleneck diluting user conversion velocity.
          </p>
        </div>

        {/* Top Opportunity */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5 space-y-2 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#1D63ED]">
            <TrendingUp className="w-4 h-4 text-[#1D63ED] shrink-0" />
            <span className="uppercase tracking-wider">Highest Yield Fix</span>
          </div>
          <h4 className="font-bold text-sm text-[#111827]">{exec.biggestOpportunity}</h4>
          <p className="text-xs text-[#52525B] leading-relaxed">
            High-confidence structural shift with fastest projected conversion lift.
          </p>
        </div>

        {/* Technical Risk */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5 space-y-2 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700">
            <Cpu className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="uppercase tracking-wider">Technical Factor</span>
          </div>
          <h4 className="font-bold text-sm text-[#111827]">{exec.mostSignificantTechnicalRisk}</h4>
          <p className="text-xs text-[#52525B] leading-relaxed">
            Underlying engineering parameter directly impacting visual stabilization.
          </p>
        </div>
      </div>
    </div>
  );
};
