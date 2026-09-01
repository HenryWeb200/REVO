import React, { useState } from 'react';
import {
  StructuredAnalysisResponse,
  AwardIntelligenceV2,
  AwardJudgingDimension,
  AwardJudgingDimensionKey,
} from '../types';
import {
  Trophy,
  Award,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Zap,
  Target,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  Compass,
  Layers,
  Info,
} from 'lucide-react';

interface Props {
  result?: StructuredAnalysisResponse;
  awardData?: AwardIntelligenceV2;
  siteName?: string;
}

export const AwardIntelligenceView: React.FC<Props> = ({ result, awardData, siteName }) => {
  const award = awardData || result?.awardIntelligence;
  const displayName = siteName || result?.siteName || 'this project';

  if (!award) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
        <Trophy className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
        <h3 className="text-lg font-semibold text-zinc-200 mb-1">Award Intelligence Loading</h3>
        <p className="text-sm text-zinc-400">Award evaluation data is being synthesized for this experience.</p>
      </div>
    );
  }

  const [filterGroup, setFilterGroup] = useState<string>('all');

  const filteredDimensions = award.judgingDimensions.filter((dim) => {
    if (filterGroup === 'strongest') return dim.status === 'strongest';
    if (filterGroup === 'limiting') return dim.status === 'limiting';
    if (filterGroup === 'idea') return dim.categoryGroup === 'Creative Idea';
    if (filterGroup === 'craft') return dim.categoryGroup === 'Craft & Execution';
    if (filterGroup === 'experience') return dim.categoryGroup === 'Experience & Emotion';
    return true;
  });

  const getQualitativeColor = (level: string) => {
    switch (level) {
      case 'Groundbreaking':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Exceptional':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Award-Caliber Potential':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Distinctive':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Promising':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return 'bg-purple-500';
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 55) return 'bg-amber-500';
    if (score >= 40) return 'bg-blue-500';
    return 'bg-zinc-600';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO BANNER & DUAL METRICS */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Award Intelligence V2
              </span>
              <span className="text-xs text-zinc-500 font-mono">REVO International Benchmark</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
              Creative Award Potential Evaluation
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Evaluating <span className="text-zinc-200 font-medium">{displayName}</span> against international digital and design award judging criteria.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getQualitativeColor(award.qualitativeLevel)} flex items-center gap-2 shadow-sm`}>
              <Award className="w-4 h-4" />
              {award.qualitativeLevel}
            </span>
          </div>
        </div>

        {/* DUAL METRICS COMPARISON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Website Quality Card */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Website Quality Score
              </span>
              <span className="text-2xl font-extrabold text-sky-400 font-mono">
                {award.websiteQualityScore}<span className="text-xs text-zinc-500 font-sans font-normal"> / 100</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Measures functional usability, clarity, performance, accessibility, SEO, and technical stability.
            </p>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${award.websiteQualityScore}%` }}
              />
            </div>
          </div>

          {/* Award Potential Card */}
          <div className="bg-zinc-900/80 border border-amber-500/20 bg-amber-500/[0.02] rounded-xl p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Award Potential Score
              </span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {award.awardPotentialScore}<span className="text-xs text-zinc-500 font-sans font-normal"> / 100</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Evaluates original creative concept, visual craft, motion purpose, storytelling, and distinctiveness.
            </p>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${award.awardPotentialScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* QUALITY VS AWARD RATIONALE BANNER */}
        <div className="mt-4 bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-4 text-xs text-zinc-300 leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 mr-1.5">Quality vs. Award Potential Rationale:</span>
            {award.qualityVsAwardRationale}
          </div>
        </div>
      </div>

      {/* 2. CATEGORY EXPECTATIONS & VERDICT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Classification */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-indigo-400" />
            Website Classification
          </div>
          <div className="text-lg font-bold text-zinc-100 flex items-center justify-between">
            {award.typeDisplayName}
            <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
              {award.websiteType}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-3">
            <span className="text-zinc-300 font-medium">Category Expectations: </span>
            {award.categoryExpectationsSummary}
          </p>
        </div>

        {/* REVO Strategic Verdict */}
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              REVO's Authoritative Verdict
            </div>
            <blockquote className="text-sm italic text-zinc-200 leading-relaxed border-l-2 border-amber-500/60 pl-3 my-1">
              {award.verdict}
            </blockquote>
          </div>
          <div className="text-xs text-zinc-500 pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-3">
            <span>Level Benchmark: <span className="text-zinc-300 font-medium">{award.qualitativeLevel}</span></span>
            <span className="font-mono">{award.percentileStatement}</span>
          </div>
        </div>
      </div>

      {/* 3. THE 14 GENERALIZED AWARD JUDGING DIMENSIONS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              14 International Award Judging Principles
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Evaluated against judging criteria from Awwwards, FWA, Webby Awards, CSS Design Awards, Red Dot, and D&AD.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            {[
              { id: 'all', label: 'All 14' },
              { id: 'strongest', label: 'Strongest' },
              { id: 'limiting', label: 'Limiting' },
              { id: 'idea', label: 'Idea' },
              { id: 'craft', label: 'Craft' },
              { id: 'experience', label: 'Experience' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterGroup(tab.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterGroup === tab.id
                    ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Judging Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDimensions.map((dim) => (
            <div
              key={dim.key}
              className={`p-4 rounded-xl border transition-all ${
                dim.status === 'strongest'
                  ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                  : dim.status === 'limiting'
                  ? 'bg-amber-500/[0.02] border-amber-500/20'
                  : 'bg-zinc-950/50 border-zinc-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">{dim.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {dim.categoryGroup}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {dim.status === 'strongest' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Strongest
                    </span>
                  )}
                  {dim.status === 'limiting' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Limiting
                    </span>
                  )}
                  <span className="text-base font-extrabold text-zinc-100 font-mono">
                    {dim.score}<span className="text-xs text-zinc-500 font-normal">/100</span>
                  </span>
                </div>
              </div>

              {/* Score Bar */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden my-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(dim.score)}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mt-2">{dim.assessment}</p>

              {dim.evidence && dim.evidence.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
                  {dim.evidence.map((ev, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {ev}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. POSITIVE VS NEGATIVE AWARD SIGNALS & MINIMALISM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Award Signals */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Positive Award-Caliber Highlights ({award.positiveSignals.length})
          </h3>
          {award.positiveSignals.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No standout positive award signals detected.</p>
          ) : (
            <div className="space-y-3">
              {award.positiveSignals.map((sig) => (
                <div key={sig.id} className="p-3 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-300">{sig.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      +{sig.bonusPoints} bonus
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{sig.description}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Observed: {sig.evidence}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Negative Signals */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Detected Negative Award Signals ({award.negativeSignals.length})
          </h3>
          {award.negativeSignals.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">No penalizing negative signals detected.</p>
          ) : (
            <div className="space-y-3">
              {award.negativeSignals.map((sig) => (
                <div key={sig.id} className="p-3 bg-amber-500/[0.03] border border-amber-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-300">{sig.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                      -{sig.penaltyPoints} penalty
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{sig.description}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Observed: {sig.evidence}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MINIMALISM EVALUATION CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Minimalism & Spatial Execution Assessment
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
            {award.minimalismAssessment.verdict}
          </p>
          <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg shrink-0">
            {award.minimalismAssessment.impactOnScore}
          </span>
        </div>
      </div>

      {/* 5. HIGHEST CREATIVE IMPACT ACTION PLAN */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Highest-Impact Creative Improvements
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prioritized recommendations to elevate Award Potential to the next qualitative level.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {award.highestImpactImprovements.map((imp) => (
            <div key={imp.id} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-mono">
                    #{imp.priority}
                  </span>
                  {imp.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {imp.category}
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                <span className="text-zinc-500 font-medium">Problem: </span>{imp.problem}
              </p>

              <p className="text-xs text-zinc-200">
                <span className="text-amber-400 font-medium">Recommendation: </span>{imp.recommendation}
              </p>

              <div className="text-[11px] text-emerald-400 font-medium bg-emerald-500/[0.05] border border-emerald-500/10 px-2.5 py-1 rounded-md mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {imp.expectedCreativeImpact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
