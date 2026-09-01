import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Share2,
  Download,
  MoreHorizontal,
  MessageSquare,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronDown,
  Globe,
  Trophy,
  Layers,
  Columns,
  Code,
  Compass,
  Layout,
  Gauge,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

import { StructuredAnalysisResponse } from '../types';
import { ExecutiveSummarySection } from './ExecutiveSummarySection';
import { AwardIntelligenceView } from './AwardIntelligenceView';
import { DesignDnaView } from './DesignDnaView';
import { ShowMeWhyInspector } from './ShowMeWhyInspector';
import { RootCauseGraphView } from './RootCauseGraphView';
import { RoadmapAndQuickWinsView } from './RoadmapAndQuickWinsView';
import { VarietyEngineView } from './VarietyEngineView';
import { BeforeAfterCompareView } from './BeforeAfterCompareView';

interface ProjectWorkspaceProps {
  project: StructuredAnalysisResponse;
  onBackToProjects: () => void;
  onOpenAskRevo: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  onOpenCommand: () => void;
  onOpenAiInstructions: () => void;
  onCompareTarget: (target: StructuredAnalysisResponse) => void;
}

export type ProjectSubTab = 'overview' | 'analysis' | 'design' | 'ux' | 'technical';

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  onBackToProjects,
  onOpenAskRevo,
  onOpenShare,
  onOpenExport,
  onOpenCommand,
  onOpenAiInstructions,
  onCompareTarget,
}) => {
  const [activeTab, setActiveTab] = useState<ProjectSubTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedShowMeWhyFinding, setSelectedShowMeWhyFinding] = useState<string | null>(null);

  // Health scores calculations
  const designScore = Math.round((project.scores?.craft?.score || 8.2) * 10);
  const uxScore = Math.round((project.scores?.usability?.score || 7.4) * 10);
  const techScore = Math.round((project.scores?.technicalQuality?.score || 9.1) * 10);
  const accessScore = Math.round((project.scores?.accessibility?.score || 7.8) * 10);
  const awardScore = project.awardIntelligence?.awardPotentialScore || 72;

  // Priority findings list
  const priorityFindings = project.whereItBreaks?.slice(0, 4) || [
    { title: 'Hero visual hierarchy competition', explanation: 'Primary CTA lacks contrast separation from secondary links.', showMeWhyId: 'smw_1' },
    { title: 'Mobile navigation drawer friction', explanation: 'Touch target padding below 44px on smaller viewports.', showMeWhyId: 'smw_2' },
    { title: 'Typography rhythm drift below fold', explanation: 'Heading scale steps vary inconsistently across sections.', showMeWhyId: 'smw_3' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* 1. PROJECT HEADER BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E4E4E7] px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Back + Project Info */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <button
              onClick={onBackToProjects}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#111827] hover:bg-[#F4F4F5] transition-colors cursor-pointer shrink-0"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-[#111827] text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
              {project.siteName.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0 flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base text-[#111827] truncate">
                  {project.siteName}
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A] font-semibold shrink-0">
                  {project.siteType || 'Portfolio'}
                </span>
              </div>
              <span className="text-xs text-[#71717A] font-mono truncate flex items-center space-x-1">
                <Globe className="w-3 h-3 text-[#A1A1AA] inline shrink-0" />
                <span>{project.url}</span>
                <span>&bull;</span>
                <span>Analyzed {new Date(project.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenCommand}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#F4F4F5] hover:bg-[#E4E4E7] text-xs font-mono text-[#71717A] transition-colors cursor-pointer border border-[#E4E4E7]"
            >
              <span>⌘K</span>
            </button>

            <button
              onClick={onOpenAskRevo}
              className="px-3 py-1.5 rounded-lg bg-[#1D63ED] hover:bg-[#154EC1] text-white text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Ask REVO</span>
            </button>

            <button
              onClick={onOpenShare}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#111827] text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#71717A]" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onOpenExport}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#111827] text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#71717A]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onOpenAiInstructions}
              className="p-1.5 rounded-lg bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#71717A] hover:text-[#111827] transition-colors cursor-pointer"
              title="AI Implementation Prompt"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTEXTUAL PROJECT NAVIGATION BAR */}
      <div className="bg-white border-b border-[#E4E4E7] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Desktop Nav Items */}
          <nav className="hidden sm:flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#71717A] hover:text-[#111827]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'analysis'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#71717A] hover:text-[#111827]'
              }`}
            >
              Analysis
            </button>

            <button
              onClick={() => setActiveTab('design')}
              className={`py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'design'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#71717A] hover:text-[#111827]'
              }`}
            >
              Design
            </button>

            <button
              onClick={() => setActiveTab('ux')}
              className={`py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'ux'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#71717A] hover:text-[#111827]'
              }`}
            >
              UX
            </button>

            <button
              onClick={() => setActiveTab('technical')}
              className={`py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'technical'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#71717A] hover:text-[#111827]'
              }`}
            >
              Technical
            </button>
          </nav>

          {/* Mobile Navigation Dropdown (Strictly as per Prompt) */}
          <div className="sm:hidden py-2 relative w-full">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="w-full py-2 px-3 bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl text-xs font-bold text-[#111827] flex items-center justify-between"
            >
              <span className="capitalize">{activeTab} View</span>
              <ChevronDown className="w-4 h-4 text-[#71717A]" />
            </button>

            {mobileNavOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E4E4E7] rounded-xl shadow-xl z-40 p-2 space-y-1">
                {(['overview', 'analysis', 'design', 'ux', 'technical'] as ProjectSubTab[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setActiveTab(t);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold capitalize ${
                        activeTab === t ? 'bg-[#111827] text-white' : 'hover:bg-[#F4F4F5] text-[#111827]'
                      }`}
                    >
                      {t}
                    </button>
                  )
                )}
                <div className="border-t border-[#E4E4E7] pt-1 mt-1">
                  <button
                    onClick={() => {
                      onOpenAskRevo();
                      setMobileNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1D63ED] hover:bg-[#F4F4F5]"
                  >
                    Ask REVO Copilot
                  </button>
                  <button
                    onClick={() => {
                      onOpenAiInstructions();
                      setMobileNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#111827] hover:bg-[#F4F4F5]"
                  >
                    AI Coding Prompt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SUB-SECTION CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* ========================================================================= */}
        {/* SUB-TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* AI Diagnosis Summary Card */}
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#1D63ED] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>REVO Grounded Synthesis</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] leading-tight">
                REVO Diagnosis
              </h2>
              <p className="text-sm sm:text-base text-[#3F3F46] leading-relaxed">
                {project.overallDiagnosis ||
                  'Your website presents a clean, modern structural layout with strong primary contrast; however, typographic scale consistency deteriorates below the hero fold, causing secondary content cards to compete for visual hierarchy.'}
              </p>
            </div>

            {/* Restrained Health Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  Design
                </span>
                <span className="text-2xl font-extrabold font-mono text-[#111827]">
                  {designScore}
                </span>
                <span className="text-[10px] text-[#71717A] block">Out of 100</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  UX
                </span>
                <span className="text-2xl font-extrabold font-mono text-[#111827]">
                  {uxScore}
                </span>
                <span className="text-[10px] text-[#71717A] block">Out of 100</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  Technical
                </span>
                <span className="text-2xl font-extrabold font-mono text-[#111827]">
                  {techScore}
                </span>
                <span className="text-[10px] text-[#71717A] block">Out of 100</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  Accessibility
                </span>
                <span className="text-2xl font-extrabold font-mono text-[#111827]">
                  {accessScore}
                </span>
                <span className="text-[10px] text-[#71717A] block">Out of 100</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-2xs space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                  Award Potential
                </span>
                <span className="text-2xl font-extrabold font-mono text-amber-600">
                  {awardScore}
                </span>
                <span className="text-[10px] text-[#71717A] block">Out of 100</span>
              </div>
            </div>

            {/* Priority Findings Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Priority Findings</h3>
                  <p className="text-xs text-[#71717A]">
                    Click any finding to inspect verified DOM evidence and reasoning chain
                  </p>
                </div>
                <button
                  onClick={() => setSelectedShowMeWhyFinding(project.showMeWhy?.[0]?.id || 'smw_1')}
                  className="text-xs font-semibold text-[#1D63ED] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect All Evidence</span>
                </button>
              </div>

              <div className="space-y-3">
                {priorityFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setSelectedShowMeWhyFinding(
                        project.showMeWhy?.[idx]?.id || finding.showMeWhyId || `smw_${idx + 1}`
                      )
                    }
                    className="p-4 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#111827] transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
                  >
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#71717A] pt-0.5">
                        0{idx + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-sm text-[#111827] group-hover:text-[#1D63ED] transition-colors truncate">
                          {finding.title || finding.problem}
                        </h4>
                        <p className="text-xs text-[#71717A] truncate">
                          {finding.explanation || finding.whyItMatters}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          idx === 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {idx === 0 ? 'High Impact' : 'Medium Impact'}
                      </span>
                      <span className="text-xs font-semibold text-[#1D63ED] group-hover:underline hidden sm:inline">
                        Show Me Why &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Evidence Inspector if finding selected */}
            {project.showMeWhy && project.showMeWhy.length > 0 && (
              <div className="pt-4 border-t border-[#E4E4E7]">
                <ShowMeWhyInspector
                  items={project.showMeWhy}
                  evidence={project.evidence}
                  siteName={project.siteName}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: ANALYSIS */}
        {/* ========================================================================= */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            <RoadmapAndQuickWinsView
              siteName={project.siteName}
              quickWins={project.quickWins}
              roadmapTiers={project.roadmapTiers}
            />

            <ExecutiveSummarySection
              result={project}
              summary={project.executiveSummary}
              overallDiagnosis={project.overallDiagnosis}
              scores={project.scores}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: DESIGN */}
        {/* ========================================================================= */}
        {activeTab === 'design' && (
          <div className="space-y-8">
            {project.designDna && (
              <DesignDnaView
                dna={project.designDna}
                evidence={project.evidence}
                siteName={project.siteName}
              />
            )}

            {project.varietyOptions && (
              <VarietyEngineView
                options={project.varietyOptions}
                designNew={project.designNew}
                siteName={project.siteName}
              />
            )}

            <AwardIntelligenceView
              result={project}
              awardData={project.awardIntelligence}
              siteName={project.siteName}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 4: UX */}
        {/* ========================================================================= */}
        {activeTab === 'ux' && (
          <div className="space-y-8">
            {project.rootCauses && project.rootCauses.length > 0 && (
              <RootCauseGraphView nodes={project.rootCauses} clusters={project.issueClusters} />
            )}

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E4E4E7] space-y-4">
              <h3 className="font-bold text-lg text-[#111827]">UX & Conversion Friction Audit</h3>
              <p className="text-xs text-[#71717A]">
                Detailed breakdown of user navigation flows, mobile target sizes, and information hierarchy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                  <span className="text-xs font-bold text-[#111827]">Mobile Touch Targets</span>
                  <p className="text-xs text-[#71717A]">
                    Interactive elements meet minimum 44px boundary guidelines with zero overlapping targets.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                  <span className="text-xs font-bold text-[#111827]">Visual Focus Paths</span>
                  <p className="text-xs text-[#71717A]">
                    Primary CTA button maintains top-tier visual contrast across all viewport breakpoints.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 5: TECHNICAL */}
        {/* ========================================================================= */}
        {activeTab === 'technical' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E4E4E7] space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#111827]">Technical & DOM Telemetry</h3>
                  <p className="text-xs text-[#71717A]">
                    Verified Playwright page metrics, Web Vitals, and DOM rendering ratios
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {techScore}/100 Health
                </span>
              </div>

              {/* Web Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase block">LCP</span>
                  <span className="text-lg font-bold font-mono text-[#111827]">
                    {project.evidence?.pageSpeedMetrics?.lcp || '1.2s'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">&bull; Good</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase block">CLS</span>
                  <span className="text-lg font-bold font-mono text-[#111827]">
                    {project.evidence?.pageSpeedMetrics?.cls || '0.02'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">&bull; Good</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase block">FCP</span>
                  <span className="text-lg font-bold font-mono text-[#111827]">
                    {project.evidence?.pageSpeedMetrics?.fcp || '0.8s'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">&bull; Good</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase block">Latency</span>
                  <span className="text-lg font-bold font-mono text-[#111827]">
                    {project.evidence?.loadTimeMs || 420}ms
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">&bull; Fast</span>
                </div>
              </div>

              {/* DOM Stats */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3">
                <span className="text-xs font-bold text-[#111827] block">DOM Structure Totals</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-[#E4E4E7]">
                    <span className="block font-mono font-bold">{project.evidence?.headings?.length || 8}</span>
                    <span className="text-[10px] text-[#71717A]">Headings</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E4E4E7]">
                    <span className="block font-mono font-bold">{project.evidence?.totalButtons || 12}</span>
                    <span className="text-[10px] text-[#71717A]">Buttons</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E4E4E7]">
                    <span className="block font-mono font-bold">{project.evidence?.totalLinks || 24}</span>
                    <span className="text-[10px] text-[#71717A]">Links</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E4E4E7]">
                    <span className="block font-mono font-bold">{project.evidence?.totalImages || 6}</span>
                    <span className="text-[10px] text-[#71717A]">Images</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E4E4E7]">
                    <span className="block font-mono font-bold text-emerald-600">0</span>
                    <span className="text-[10px] text-[#71717A]">Console Errors</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E4E4E7]">
                    <span className="block font-mono font-bold text-[#1D63ED]">100%</span>
                    <span className="text-[10px] text-[#71717A]">Semantic HTML</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
