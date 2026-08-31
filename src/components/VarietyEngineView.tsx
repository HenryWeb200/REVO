import React, { useState } from 'react';
import { Sparkles, Layers, CheckCircle2, ArrowRight, Wand2, ShieldCheck } from 'lucide-react';
import { VarietyOptionV2, DesignNewDirectionV2 } from '../types';

interface VarietyEngineViewProps {
  varietyOptions?: VarietyOptionV2[];
  designNew?: DesignNewDirectionV2;
  siteName: string;
}

export const VarietyEngineView: React.FC<VarietyEngineViewProps> = ({
  varietyOptions = [],
  designNew,
  siteName,
}) => {
  const [activeTab, setActiveTab] = useState<'variations' | 'design_new'>('variations');
  const [selectedDirection, setSelectedDirection] = useState<string>('Minimal');

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E4E4E7] pb-6">
        <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
          <Wand2 className="w-4 h-4" />
          <span>Generative Aesthetic Directions</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-display text-3xl font-extrabold text-[#111827]">
            Variety Engine & Next-Gen Direction
          </h3>
          <div className="flex items-center space-x-1 bg-[#FAFAFA] border border-[#E4E4E7] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('variations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'variations'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#71717A] hover:text-[#111827]'
              }`}
            >
              5 Design Variations
            </button>
            <button
              onClick={() => setActiveTab('design_new')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'design_new'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#71717A] hover:text-[#111827]'
              }`}
            >
              Design New Blueprint
            </button>
          </div>
        </div>
        <p className="text-sm text-[#71717A] max-w-3xl">
          Explore controlled architectural evolutions of {siteName}'s brand DNA — from radical reduction to high-craft editorial storytelling.
        </p>
      </div>

      {activeTab === 'variations' && (
        <div className="space-y-8">
          {/* Variety Options Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {varietyOptions.map((opt) => {
              const isSelected = selectedDirection === opt.name;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDirection(opt.name)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-[#111827] text-white border-[#111827] shadow-sm'
                      : 'bg-[#FAFAFA] border-[#E4E4E7] hover:border-[#D4D4D8] text-[#111827]'
                  }`}
                >
                  <span className="font-display font-bold text-sm block">{opt.name}</span>
                  <span
                    className={`text-[10px] block line-clamp-1 ${
                      isSelected ? 'text-[#A1A1AA]' : 'text-[#71717A]'
                    }`}
                  >
                    {opt.aestheticDirection}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Variation Detail Panel */}
          {(() => {
            const currentOpt = varietyOptions.find((o) => o.name === selectedDirection) || varietyOptions[0];
            if (!currentOpt) return null;

            return (
              <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E4E7] pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#1D63ED] uppercase tracking-wider block">
                      Aesthetic Archetype
                    </span>
                    <h4 className="font-display text-2xl font-bold text-[#111827]">
                      {currentOpt.name} Evolution
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-white border border-[#E4E4E7] rounded-lg text-xs text-[#52525B] font-medium">
                    {currentOpt.aestheticDirection}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#111827] leading-relaxed">
                  {currentOpt.tagline}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Key Architectural Shifts */}
                  <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-[#111827]">
                      <Sparkles className="w-4 h-4 text-[#1D63ED] shrink-0" />
                      <span>What Changes (Transformations)</span>
                    </div>
                    <ul className="space-y-2">
                      {(currentOpt.keyChanges || []).map((change, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-[#52525B]">
                          <ArrowRight className="w-3.5 h-3.5 text-[#1D63ED] shrink-0 mt-0.5" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preserved Identity */}
                  <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-[#111827]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>What Stays (Preserved Brand DNA)</span>
                    </div>
                    <ul className="space-y-2">
                      {(currentOpt.preservedIdentity || []).map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-[#52525B]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#52525B]">
                  <span className="font-bold text-[#111827]">Strategic Fit: </span>
                  <span>{currentOpt.recommendedWhen}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'design_new' && designNew && (
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="space-y-2 border-b border-[#E4E4E7] pb-4">
            <span className="text-xs text-[#1D63ED] font-semibold uppercase tracking-wider block">
              Architectural Vision Blueprint
            </span>
            <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
              {designNew.visionTitle}
            </h4>
            <p className="text-sm text-[#52525B] leading-relaxed max-w-4xl">
              {designNew.visionSummary}
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
              Strategic Transformation Pillars
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(designNew.corePillars || []).map((pillar, idx) => (
                <div key={idx} className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3 text-xs">
                  <span className="font-bold text-sm text-[#111827] block border-b border-[#F4F4F5] pb-2">
                    {pillar.area}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[#EF4444] font-semibold text-[11px] block">Current Friction:</span>
                    <p className="text-[#71717A]">{pillar.currentLimitation}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#1D63ED] font-semibold text-[11px] block">New Direction:</span>
                    <p className="text-[#111827] font-medium">{pillar.newDirection}</p>
                  </div>
                  <div className="pt-2 border-t border-[#F4F4F5] text-[11px] text-[#52525B]">
                    <span className="font-semibold">Why: </span>
                    <span>{pillar.strategicWhy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Blueprint Codebox */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
              Direct Implementation Blueprint
            </span>
            <pre className="bg-[#111827] text-[#E4E4E7] p-5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-[#27272A]">
              {designNew.implementationBlueprint}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
