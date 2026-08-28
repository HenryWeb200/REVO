import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Compass,
  GitBranch,
  Eye,
  Zap,
  Wand2,
  Columns,
  MessageSquare,
  Terminal,
  Layers,
  History,
} from 'lucide-react';
import {
  StructuredAnalysisResponse,
  AnalysisState,
  DimensionScore,
} from './types';

// V2 Modular Components
import { ExecutiveSummarySection } from './components/ExecutiveSummarySection';
import { DesignDnaView } from './components/DesignDnaView';
import { ShowMeWhyInspector } from './components/ShowMeWhyInspector';
import { RootCauseGraphView } from './components/RootCauseGraphView';
import { RoadmapAndQuickWinsView } from './components/RoadmapAndQuickWinsView';
import { VarietyEngineView } from './components/VarietyEngineView';
import { BeforeAfterCompareView } from './components/BeforeAfterCompareView';
import { AskRevoDrawer } from './components/AskRevoDrawer';
import { AiInstructionModal } from './components/AiInstructionModal';
import { ProjectMemoryBar } from './components/ProjectMemoryBar';

type V2Tab =
  | 'overview'
  | 'executive'
  | 'dna'
  | 'root_causes'
  | 'show_me_why'
  | 'roadmap'
  | 'variety'
  | 'compare';

export default function App() {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<StructuredAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<V2Tab>('overview');

  // Modals & Drawers
  const [isAskRevoOpen, setIsAskRevoOpen] = useState(false);
  const [isAiInstructionsOpen, setIsAiInstructionsOpen] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const sampleTargets = [
    { label: 'linear.app', fullUrl: 'https://linear.app' },
    { label: 'stripe.com', fullUrl: 'https://stripe.com' },
    { label: 'resend.com', fullUrl: 'https://resend.com' },
  ];

  // Save history to localStorage
  const saveToHistory = (item: StructuredAnalysisResponse) => {
    try {
      const stored = localStorage.getItem('revo_analysis_history');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter((x: any) => x.id !== item.id);
      filtered.unshift({
        id: item.id,
        url: item.url,
        siteName: item.siteName,
        timestamp: item.analyzedAt,
      });
      localStorage.setItem('revo_analysis_history', JSON.stringify(filtered.slice(0, 10)));
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) return;

    setErrorMessage(null);
    setAnalysisState('VALIDATING');
    setStatusMessage('Validating target URI...');

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 65000);

    const timer1 = setTimeout(() => {
      setAnalysisState('OBSERVING');
      setStatusMessage('Browser observing DOM structure, visual hierarchy & assets...');
    }, 600);

    const timer2 = setTimeout(() => {
      setAnalysisState('MEASURING');
      setStatusMessage('Measuring performance, typography & layout geometry...');
    }, 1600);

    const timer3 = setTimeout(() => {
      setAnalysisState('REASONING');
      setStatusMessage('Gemini reasoning over Design DNA & root causes...');
    }, 2800);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
        signal: controller.signal,
      });

      clearTimeout(fetchTimeout);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!res.ok) {
        let msg = `Server responded with status ${res.status}`;
        let stage: string | undefined = undefined;
        try {
          const rawText = await res.text();
          try {
            const errData = JSON.parse(rawText);
            msg = errData.error || errData.message || msg;
            stage = errData.stage;
          } catch {
            if (rawText && rawText.length < 300) {
              msg = rawText;
            }
          }
        } catch {
          // fallback msg
        }

        if (typeof msg === 'string' && msg.trim().startsWith('{')) {
          try {
            const parsedErr = JSON.parse(msg);
            if (parsedErr?.error?.message) {
              msg = parsedErr.error.message;
            } else if (parsedErr?.message) {
              msg = parsedErr.message;
            }
          } catch {
            // Keep original msg
          }
        }
        if (stage && !msg.includes(stage)) {
          msg = `[${stage}] ${msg}`;
        }
        throw new Error(msg);
      }

      const resPayload = await res.json();
      const data: StructuredAnalysisResponse = (resPayload && resPayload.data && resPayload.data.scores) ? resPayload.data : resPayload;

      setAnalysisState('SYNTHESIZING');
      setStatusMessage('Structuring V2 Diagnostic Intelligence & Design DNA...');

      setTimeout(() => {
        setResult(data);
        saveToHistory(data);
        setAnalysisState('COMPLETE');
        setStatusMessage('');

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }, 350);
    } catch (err: unknown) {
      clearTimeout(fetchTimeout);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      console.error('Analysis error:', err);
      setAnalysisState('ERROR');
      
      let displayMsg = 'Failed to inspect website. Please check the URL and try again.';
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('aborted') || err.message.includes('signal is aborted')) {
          displayMsg = 'Analysis timed out. The target website took too long to respond. Please try again.';
        } else if (err.message === 'Failed to fetch' || err.message.includes('Failed to fetch')) {
          displayMsg = 'Could not reach analysis service. Please check your connection or retry in a moment.';
        } else if (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE')) {
          displayMsg = 'The AI diagnostic engine is currently experiencing high traffic. Please retry in a moment.';
        } else if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
          displayMsg = 'Rate limit reached. Please wait a few moments before running another analysis.';
        } else {
          displayMsg = err.message;
        }
      }
      setErrorMessage(displayMsg);
    }
  };

  const handlePresetSelect = (presetUrl: string) => {
    setUrl(presetUrl);
    handleAnalyze(undefined, presetUrl);
  };

  const handleReset = () => {
    setUrl('');
    setAnalysisState('IDLE');
    setResult(null);
    setErrorMessage(null);
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAnalyzing = ['VALIDATING', 'OBSERVING', 'READING', 'MEASURING', 'REASONING', 'SYNTHESIZING'].includes(analysisState);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          01 — ONE VIEWPORT HOMEPAGE COMPOSITION (Fits 100svh cleanly)
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full h-[100svh] min-h-0 flex flex-col justify-between px-4 sm:px-8 lg:px-12 pt-3 sm:pt-4 pb-3 sm:pb-4 max-w-[1360px] mx-auto select-none overflow-hidden">
        {/* Header / Brand */}
        <header className="w-full flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={handleReset}>
            <div className="w-6.5 h-6.5 bg-[#111827] rounded-[5px] flex items-center justify-center text-white font-display font-bold text-xs tracking-wider">
              R
            </div>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-[#111827]">
              REVO
            </span>
          </div>

          <div className="flex items-center space-x-2.5 text-xs text-[#71717A]">
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] font-medium text-[11px]">
              V2 Reasoning Platform
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED]"></span>
            <span className="text-[#52525B] font-medium text-xs">Live</span>
          </div>
        </header>

        {/* 02 — Hero Heading */}
        <div className="w-full flex-1 flex flex-col justify-center my-auto py-2 sm:py-4">
          <div className="w-full max-w-[1040px] mx-auto flex flex-col items-center justify-center text-center px-3 sm:px-6">
            <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[108px] tracking-[-0.045em] text-[#111827] leading-[0.92] select-none">
              See why it matters
            </h1>

            {/* Explainer Text */}
            <p className="text-sm sm:text-base md:text-lg text-[#71717A] font-medium tracking-tight leading-relaxed mt-4 sm:mt-5 max-w-2xl mx-auto">
              The AI reasoning layer between websites and developers. Diagnostic evidence, Design DNA, root causes, and architectural blueprints observed in real-time.
            </p>
          </div>
        </div>

        {/* 04 — URL Input Instrument */}
        <div className="w-full max-w-[760px] mx-auto shrink-0 mt-auto pt-0.5">
          <form
            onSubmit={handleAnalyze}
            className={`w-full bg-white rounded-xl sm:rounded-2xl border transition-all p-3 sm:p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${
              isFocused
                ? 'border-[#71717A] ring-1 ring-[#E4E4E7]'
                : 'border-[#E4E4E7] hover:border-[#D4D4D8]'
            }`}
          >
            {/* Input Row */}
            <div className="flex items-center space-x-2.5 w-full px-1">
              <Globe className="w-4.5 h-4.5 text-[#A1A1AA] shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste a website URL (e.g. https://linear.app)..."
                disabled={isAnalyzing}
                className="w-full bg-transparent text-[#111827] placeholder:text-[#A1A1AA] text-sm sm:text-base font-normal focus:outline-none disabled:opacity-60"
              />
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-2.5 pt-2.5 border-t border-[#F4F4F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Preset Targets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#A1A1AA] mr-1 hidden sm:inline font-medium">
                  Samples:
                </span>
                {sampleTargets.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => handlePresetSelect(sample.fullUrl)}
                    disabled={isAnalyzing}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#52525B] hover:text-[#111827] text-[11px] sm:text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Primary Analyze Action & Live Status */}
              <div className="flex items-center space-x-3 justify-end">
                {isAnalyzing && (
                  <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-medium animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED]"></span>
                    <span>{statusMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAnalyzing || !url.trim()}
                  className="h-9 px-4 sm:px-5 bg-[#1D63ED] hover:bg-[#1855D0] active:bg-[#154BB8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl inline-flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  <span>{isAnalyzing ? 'Reasoning...' : 'Analyze'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-700 hover:text-red-900 font-medium underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Minimal Footnote */}
        {!result && (
          <div className="mt-1 text-center text-[10px] sm:text-[11px] text-[#A1A1AA] select-none shrink-0">
            REVO V2 &mdash; Evidence &bull; Understanding &bull; Reasoning &bull; Design DNA &bull; Roadmap &bull; Action
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02 — PROJECT MEMORY & RECENT SESSIONS BAR
          ───────────────────────────────────────────────────────────── */}
      {result && <ProjectMemoryBar currentId={result.id} />}

      {/* ─────────────────────────────────────────────────────────────
          03 — POST-ANALYSIS REVO V2 REASONING WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {result && (
        <section
          ref={resultRef}
          className="w-full border-t border-[#E4E4E7] bg-white py-12 sm:py-16"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
            {/* Header: Target Diagnostic Overview */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E4E4E7] pb-8 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-[#52525B]">
                  <span className="w-2 h-2 rounded-full bg-[#1D63ED]"></span>
                  <span className="font-semibold text-[#111827]">V2 Intelligence Synthesis</span>
                  <span>•</span>
                  <span>{result.siteType}</span>
                  <span>•</span>
                  <span className="text-[#71717A]">ID: {result.id}</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight">
                  {result.siteName}
                </h2>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1D63ED] hover:underline font-medium inline-flex items-center space-x-1"
                >
                  <span>{result.url}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Ask REVO Trigger */}
                <button
                  onClick={() => setIsAskRevoOpen(true)}
                  className="px-4 py-2.5 bg-[#1D63ED] hover:bg-[#1855D0] text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask REVO</span>
                </button>

                {/* Export Brief / AI Prompts */}
                <button
                  onClick={() => setIsAiInstructionsOpen(true)}
                  className="px-4 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#111827] rounded-xl text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#1D63ED]" />
                  <span>AI Prompt & Brief</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-[#111827] hover:bg-[#27272A] text-white rounded-xl text-xs font-medium inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New URL</span>
                </button>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                04 — V2 WORKSPACE NAVIGATION TAB BAR
                ───────────────────────────────────────────────────────────── */}
            <div className="w-full overflow-x-auto border-b border-[#E4E4E7] pb-1 no-scrollbar">
              <nav className="flex items-center space-x-2 min-w-max">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Overview & Evidence</span>
                </button>

                <button
                  onClick={() => setActiveTab('executive')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'executive'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Diagnosis</span>
                </button>

                <button
                  onClick={() => setActiveTab('dna')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'dna'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Design DNA & Familiarity</span>
                </button>

                <button
                  onClick={() => setActiveTab('root_causes')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'root_causes'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Root Cause Graph</span>
                </button>

                <button
                  onClick={() => setActiveTab('show_me_why')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'show_me_why'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Me Why</span>
                </button>

                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'roadmap'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quick Wins & Roadmap</span>
                </button>

                <button
                  onClick={() => setActiveTab('variety')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'variety'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Variety Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'compare'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#111827] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Compare & DNA Fusion</span>
                </button>
              </nav>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                TAB 1: OVERVIEW & EVIDENCE
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-16">
                {/* Executive Summary High-Level Strip */}
                <ExecutiveSummarySection result={result} />

                {/* 01: WHAT REVO SEES */}
                <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-10 space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs text-[#1D63ED] uppercase font-semibold block tracking-wider">
                      Observation Layer
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
                      What REVO Sees
                    </h3>
                  </div>

                  <p className="text-base sm:text-xl font-normal text-[#111827] leading-relaxed max-w-4xl">
                    {result.whatRevoSees.summary}
                  </p>

                  {result.whatRevoSees.keyObservations && result.whatRevoSees.keyObservations.length > 0 && (
                    <div className="pt-4 border-t border-[#E4E4E7] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.whatRevoSees.keyObservations.map((obs, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#52525B] leading-relaxed flex items-start space-x-2.5"
                        >
                          <span className="font-semibold text-[#111827] shrink-0">0{idx + 1}</span>
                          <span>{obs}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visual Viewport Screenshot */}
                {result.evidence.screenshotDesktopBase64 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#71717A]">
                      <span className="font-medium text-[#111827]">Observed Desktop Viewport (1440 × 900)</span>
                      <span>Captured via Playwright Observation Layer</span>
                    </div>

                    <div className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl overflow-hidden p-4 sm:p-8 flex items-center justify-center">
                      <div className="w-full max-w-5xl bg-white border border-[#E4E4E7] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="bg-[#F4F4F5] border-b border-[#E4E4E7] px-4 py-2.5 flex items-center justify-between text-xs text-[#71717A]">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E4E4E7]"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E4E4E7]"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E4E4E7]"></span>
                          </div>
                          <div className="px-3 py-0.5 bg-white rounded border border-[#E4E4E7] text-xs text-[#52525B] truncate max-w-[300px]">
                            {result.url}
                          </div>
                          <span className="text-[11px] text-[#A1A1AA]">Desktop 100%</span>
                        </div>

                        <img
                          src={`data:image/png;base64,${result.evidence.screenshotDesktopBase64}`}
                          alt={`Visual inspection of ${result.siteName}`}
                          className="w-full h-auto max-h-[580px] object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 02: WHY IT WORKS & WHERE IT BREAKS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Why It Works */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs text-[#1D63ED] uppercase font-semibold block tracking-wider">
                        Core Strengths
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#111827]">
                        Why It Works
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {result.whyItWorks.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5 space-y-3"
                        >
                          <div className="flex items-center space-x-2 text-[#111827] font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#1D63ED] shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          <p className="text-xs text-[#52525B] leading-relaxed">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Where It Breaks */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs text-[#EF4444] uppercase font-semibold block tracking-wider">
                        Friction & Bottlenecks
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#111827]">
                        Where It Breaks
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {result.whereItBreaks.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5 space-y-3"
                        >
                          <div className="flex items-center space-x-2 text-[#111827] font-bold text-sm">
                            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          <p className="text-xs text-[#52525B] leading-relaxed">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 04: INDEPENDENT MULTIDIMENSIONAL PROFILE */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E4E4E7] pb-4 gap-2">
                    <div className="space-y-1">
                      <span className="text-xs text-[#1D63ED] uppercase font-semibold block tracking-wider">
                        Diagnostic Dimensions
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
                        Multidimensional Profile
                      </h3>
                    </div>
                    <span className="text-xs text-[#52525B] font-medium">
                      {Object.keys(result.scores).length} Independent Dimensions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Object.entries(result.scores) as [string, DimensionScore][]).map(([key, dim]) => {
                      const formatName = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase());

                      return (
                        <div
                          key={key}
                          className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5 space-y-3 hover:border-[#D4D4D8] transition-colors"
                        >
                          <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2.5">
                            <span className="font-bold text-sm text-[#111827]">{formatName}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-0.5 rounded bg-white border border-[#E4E4E7] text-[#71717A] capitalize">
                                {dim.confidence} conf
                              </span>
                              <span className="font-display text-lg font-extrabold text-[#111827]">
                                {dim.score.toFixed(1)}
                                <span className="text-xs font-normal text-[#71717A]">/10</span>
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[#52525B] leading-relaxed">{dim.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 2: EXECUTIVE SUMMARY
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'executive' && (
              <div className="space-y-8">
                <ExecutiveSummarySection result={result} />
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 3: DESIGN DNA & FAMILIARITY
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'dna' && (
              <DesignDnaView
                dna={result.designDna}
                familiarity={result.familiarity}
                evidence={result.evidence}
                siteName={result.siteName}
              />
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 4: ROOT CAUSE GRAPH
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'root_causes' && (
              <RootCauseGraphView
                rootCauses={result.rootCauses}
                issueClusters={result.issueClusters}
                siteName={result.siteName}
              />
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 5: SHOW ME WHY
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'show_me_why' && (
              <ShowMeWhyInspector
                items={result.showMeWhy}
                evidence={result.evidence}
                siteName={result.siteName}
              />
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 6: ROADMAP & QUICK WINS
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'roadmap' && (
              <RoadmapAndQuickWinsView
                quickWins={result.quickWins}
                roadmapTiers={result.roadmapTiers}
                siteName={result.siteName}
              />
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 7: VARIETY ENGINE & DESIGN NEW
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'variety' && (
              <VarietyEngineView
                varietyOptions={result.varietyOptions}
                designNew={result.designNew}
                siteName={result.siteName}
              />
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 8: BEFORE / AFTER & COMPARATOR
                ───────────────────────────────────────────────────────────── */}
            {activeTab === 'compare' && (
              <BeforeAfterCompareView currentAnalysis={result} />
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-8 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
              <div>REVO V2 Reasoning Engine &bull; Senior Architectural Diagnosis</div>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-[#111827] hover:bg-[#27272A] text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                Inspect New Website ↑
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS & COPILOT DRAWERS
          ───────────────────────────────────────────────────────────── */}
      {result && (
        <>
          <AskRevoDrawer
            isOpen={isAskRevoOpen}
            onClose={() => setIsAskRevoOpen(false)}
            analysis={result}
          />
          <AiInstructionModal
            isOpen={isAiInstructionsOpen}
            onClose={() => setIsAiInstructionsOpen(false)}
            aiInstructions={result.aiInstructions}
            designBrief={result.designBrief}
            siteName={result.siteName}
          />
        </>
      )}
    </div>
  );
}
