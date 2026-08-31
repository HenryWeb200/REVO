import React from 'react';
import { Zap, Clock, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { QuickWinItemV2, PriorityOpportunity } from '../types';

interface RoadmapAndQuickWinsViewProps {
  quickWins?: QuickWinItemV2[];
  roadmapTiers?: {
    immediate: PriorityOpportunity[];
    highImpact: PriorityOpportunity[];
    structural: PriorityOpportunity[];
    experimental: PriorityOpportunity[];
  };
  siteName: string;
}

export const RoadmapAndQuickWinsView: React.FC<RoadmapAndQuickWinsViewProps> = ({
  quickWins = [],
  roadmapTiers,
  siteName,
}) => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E4E4E7] pb-6">
        <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Actionable Engineering Roadmap</span>
        </div>
        <h3 className="font-display text-3xl font-extrabold text-[#111827]">
          Quick Wins & 4-Tier Improvement Roadmap
        </h3>
        <p className="text-sm text-[#71717A] max-w-3xl">
          Prioritized modifications organized by implementation effort and conversion impact. Fix quick wins in minutes before scheduling deeper structural improvements.
        </p>
      </div>

      {/* Quick Wins Bar */}
      {quickWins.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Quick Wins (Low Effort · High Impact · Immediate Yield)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickWins.map((qw) => (
              <div
                key={qw.id}
                className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-5 space-y-3 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Effort: {qw.effort}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {qw.impact} Impact
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#111827]">
                  {qw.issue}
                </h4>
                <div className="pt-2 border-t border-emerald-200/60 text-xs space-y-1.5">
                  <span className="font-semibold text-emerald-900 block">Exact Code Fix:</span>
                  <p className="text-[#374151] leading-relaxed font-mono text-[11px] bg-white/80 p-2 rounded border border-emerald-200/40">
                    {qw.fix}
                  </p>
                  <div className="text-[11px] text-emerald-800 font-medium pt-1">
                    Expected: {qw.expectedResult}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4-Tier Improvement Roadmap */}
      {roadmapTiers && (
        <div className="space-y-8">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
            4-Tier Execution Roadmap
          </span>

          <div className="space-y-6">
            {/* Tier 1: Immediate */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <h4 className="font-bold text-sm text-[#111827] uppercase tracking-wider">
                    Tier 1: Immediate Action Items (Day 1)
                  </h4>
                </div>
                <span className="text-xs text-[#71717A]">Highest ROI & Low Friction</span>
              </div>
              <div className="space-y-3">
                {(roadmapTiers.immediate || []).map((item, idx) => (
                  <div key={idx} className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#111827]">{item.problem}</span>
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded text-[10px]">
                        Priority 0{item.priority}
                      </span>
                    </div>
                    <p className="text-[#52525B]">{item.recommendation}</p>
                    <span className="text-[#1D63ED] font-medium block">Expected Effect: {item.expectedEffect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier 2: High Impact */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1D63ED]"></span>
                  <h4 className="font-bold text-sm text-[#111827] uppercase tracking-wider">
                    Tier 2: High-Impact Upgrades (Week 1–2)
                  </h4>
                </div>
                <span className="text-xs text-[#71717A]">Conversion & Performance Accelerators</span>
              </div>
              <div className="space-y-3">
                {(roadmapTiers.highImpact || []).map((item, idx) => (
                  <div key={idx} className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#111827]">{item.problem}</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-[#1D63ED] font-bold rounded text-[10px]">
                        Priority 0{item.priority}
                      </span>
                    </div>
                    <p className="text-[#52525B]">{item.recommendation}</p>
                    <span className="text-[#1D63ED] font-medium block">Expected Effect: {item.expectedEffect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier 3: Structural */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h4 className="font-bold text-sm text-[#111827] uppercase tracking-wider">
                    Tier 3: Structural System Architecture (Month 1)
                  </h4>
                </div>
                <span className="text-xs text-[#71717A]">Design System & Scalable Tokens</span>
              </div>
              <div className="space-y-3">
                {(roadmapTiers.structural || []).map((item, idx) => (
                  <div key={idx} className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#111827]">{item.problem}</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded text-[10px]">
                        Priority 0{item.priority}
                      </span>
                    </div>
                    <p className="text-[#52525B]">{item.recommendation}</p>
                    <span className="text-[#1D63ED] font-medium block">Expected Effect: {item.expectedEffect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier 4: Experimental */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <h4 className="font-bold text-sm text-[#111827] uppercase tracking-wider">
                    Tier 4: Experimental & Brand Distinction
                  </h4>
                </div>
                <span className="text-xs text-[#71717A]">Delight & Memorable Craft</span>
              </div>
              <div className="space-y-3">
                {(roadmapTiers.experimental || []).map((item, idx) => (
                  <div key={idx} className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#111827]">{item.problem}</span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded text-[10px]">
                        Priority 0{item.priority}
                      </span>
                    </div>
                    <p className="text-[#52525B]">{item.recommendation}</p>
                    <span className="text-[#1D63ED] font-medium block">Expected Effect: {item.expectedEffect}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
