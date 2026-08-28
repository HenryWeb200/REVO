import React, { useState } from 'react';
import { Eye, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle, Layers } from 'lucide-react';
import { ShowMeWhyItemV2, WebsiteEvidencePackage } from '../types';

interface ShowMeWhyInspectorProps {
  items?: ShowMeWhyItemV2[];
  evidence: WebsiteEvidencePackage;
  siteName: string;
}

export const ShowMeWhyInspector: React.FC<ShowMeWhyInspectorProps> = ({
  items = [],
  evidence,
  siteName,
}) => {
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || '');

  if (!items || items.length === 0) return null;

  const activeItem = items.find((i) => i.id === selectedId) || items[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E4E4E7] pb-6">
        <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
          <Eye className="w-4 h-4" />
          <span>Interactive Evidence Inspector</span>
        </div>
        <h3 className="font-display text-3xl font-extrabold text-[#111827]">
          "Show Me Why" — Evidence Grounding
        </h3>
        <p className="text-sm text-[#71717A] max-w-3xl">
          Click any diagnostic claim below to inspect the verified DOM evidence, metric telemetry, affected visual viewport, and full 7-step reasoning chain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Claims Selector */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
            Diagnostic Claims ({items.length})
          </span>
          {items.map((item) => {
            const isSelected = item.id === activeItem.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-white border-[#1D63ED] ring-1 ring-[#1D63ED] shadow-sm'
                    : 'bg-[#FAFAFA] border-[#E4E4E7] hover:border-[#D4D4D8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F4F4F5] text-[#52525B]">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-semibold text-[#1D63ED] capitalize">
                    {item.confidence} Confidence
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#111827] leading-snug">
                  {item.claim}
                </h4>
                <div className="flex items-center space-x-1.5 text-[11px] text-[#71717A]">
                  <span>Region: {item.affectedRegion.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Grounded Evidence & 7-Step Reasoning Inspector */}
        <div className="lg:col-span-7 bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Active Claim Header */}
          <div className="space-y-2 border-b border-[#E4E4E7] pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#1D63ED] font-semibold uppercase">
                Claim Verification ID: {activeItem.id}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#111827] text-white text-[11px] font-bold">
                Priority: {activeItem.reasoningChain.priority}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-[#111827]">
              {activeItem.claim}
            </h3>
          </div>

          {/* Observed Proof & Metrics */}
          <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#111827]">
              <Layers className="w-4 h-4 text-[#1D63ED]" />
              <span>Verified DOM & Telemetry Proof</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#52525B]">
              {activeItem.observedProof.map((proof, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{proof}</span>
                </li>
              ))}
            </ul>
            {activeItem.affectedRegion && (
              <div className="mt-3 pt-3 border-t border-[#F4F4F5] text-[11px] text-[#71717A]">
                <span className="font-semibold text-[#111827]">Affected Region: </span>
                <span>{activeItem.affectedRegion.label} &bull; {activeItem.affectedRegion.viewportDescription}</span>
              </div>
            )}
          </div>

          {/* 7-Step Reasoning Chain */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
              Step-by-Step Diagnostic Chain
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border border-[#E4E4E7] rounded-lg">
                <span className="font-bold text-[#EF4444] block mb-0.5">1. Observed Problem</span>
                <span className="text-[#52525B]">{activeItem.reasoningChain.problem}</span>
              </div>

              <div className="p-3 bg-white border border-[#E4E4E7] rounded-lg">
                <span className="font-bold text-[#71717A] block mb-0.5">2. Concrete Evidence</span>
                <span className="text-[#52525B]">{activeItem.reasoningChain.evidence}</span>
              </div>

              <div className="p-3 bg-white border border-[#E4E4E7] rounded-lg">
                <span className="font-bold text-amber-700 block mb-0.5">3. Why It Matters</span>
                <span className="text-[#52525B]">{activeItem.reasoningChain.whyItMatters}</span>
              </div>

              <div className="p-3 bg-white border border-[#E4E4E7] rounded-lg">
                <span className="font-bold text-indigo-700 block mb-0.5">4. Root Cause</span>
                <span className="text-[#52525B]">{activeItem.reasoningChain.rootCause}</span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-bold text-[#1D63ED] block mb-0.5">5. Recommended Action</span>
                <span className="text-[#111827] font-medium">{activeItem.reasoningChain.recommendedChange}</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-800 block mb-0.5">6. Expected Effect</span>
                <span className="text-emerald-900">{activeItem.reasoningChain.expectedEffect}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
