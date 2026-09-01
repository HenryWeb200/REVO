import React, { useState } from 'react';
import {
  ArrowRight,
  Globe,
  ExternalLink,
  Plus,
  Layers,
  ChevronRight,
  Building2,
  FolderKanban,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface HomeViewProps {
  onAnalyze: (url: string, websiteType: string) => void;
  isAnalyzing: boolean;
  statusMessage?: string;
  history: StructuredAnalysisResponse[];
  onSelectProject: (project: StructuredAnalysisResponse) => void;
  onNavigateToProjects: () => void;
  user: { name: string; email: string; avatar: string; role: string };
  hasEnvironments: boolean;
  activeEnvironmentName?: string;
  onCreateEnvironmentClick: () => void;
  onCreateProjectClick: () => void;
}

const WEBSITE_TYPES = [
  { id: 'saas', label: 'SaaS App' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'agency', label: 'Agency' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'developer_tool', label: 'Developer Tool' },
  { id: 'marketing', label: 'Marketing Landing' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'experimental', label: 'Experimental' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onAnalyze,
  isAnalyzing,
  statusMessage,
  history,
  onSelectProject,
  onNavigateToProjects,
  user,
  hasEnvironments,
  activeEnvironmentName = 'Acme Studio',
  onCreateEnvironmentClick,
  onCreateProjectClick,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [selectedType, setSelectedType] = useState('saas');

  const sampleTargets = [
    { label: 'linear.app', fullUrl: 'https://linear.app', type: 'saas' },
    { label: 'stripe.com', fullUrl: 'https://stripe.com', type: 'saas' },
    { label: 'resend.com', fullUrl: 'https://resend.com', type: 'developer_tool' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim() && !isAnalyzing) {
      onAnalyze(inputUrl.trim(), selectedType);
    }
  };

  const recentProjects = history.slice(0, 5);

  // =========================================================================
  // ZERO-STATE ENVIRONMENT ONBOARDING PAGE (No environment created yet)
  // =========================================================================
  if (!hasEnvironments) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 space-y-10 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#1D63ED] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to REVO Design Intelligence</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
            Welcome, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-base text-[#71717A] max-w-lg mx-auto leading-relaxed">
            Please create an environment to keep your projects, team collaboration, and website design intelligence organized.
          </p>
        </div>

        {/* Big Hero Square Button / Card for "Create Environment" */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onCreateEnvironmentClick}
            className="group relative w-full max-w-md aspect-4/3 sm:aspect-16/10 bg-white rounded-3xl border-2 border-dashed border-[#E4E4E7] hover:border-[#1D63ED] p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-98"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] group-hover:bg-[#1D63ED] group-hover:border-[#1D63ED] text-[#111827] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs">
              <Plus className="w-8 h-8 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-[#111827] group-hover:text-[#1D63ED] transition-colors">
                Create Environment
              </h3>
              <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">
                Setup your personal or team workspace container to launch 4-step project evaluations.
              </p>
            </div>

            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1D63ED] group-hover:underline pt-2">
              <span>Start Environment Setup</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Clean info footer */}
        <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between text-xs text-[#71717A]">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#A1A1AA]" />
            <span>Environments isolate your design benchmarks, API preferences, and team permissions.</span>
          </div>
          <span className="font-semibold text-[#111827]">Step 1 of 2</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE ENVIRONMENT DASHBOARD
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-10 animate-in fade-in duration-200">
      {/* 1. ENVIRONMENT HEADER & QUICK ACTIONS */}
      <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] bg-[#FAFAFA] px-2.5 py-0.5 rounded-full border border-[#E4E4E7]">
              Active Environment
            </span>
            <span className="text-xs font-bold text-[#1D63ED]">{activeEnvironmentName}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Welcome back, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-xs text-[#71717A]">
            Create a project under this environment or run a direct URL design evaluation.
          </p>
        </div>

        {/* 4-Step Project Creation Primary Button */}
        <button
          onClick={onCreateProjectClick}
          className="px-5 py-3 bg-[#1D63ED] hover:bg-[#154EC1] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center space-x-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Create Project (4-Step Wizard)</span>
        </button>
      </div>

      {/* 2. DIRECT URL EVALUATION CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#F4F4F5] pb-4">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-5 h-5 text-[#1D63ED]" />
            <h3 className="font-extrabold text-base text-[#111827]">Run Analysis under {activeEnvironmentName}</h3>
          </div>
          <span className="text-xs text-[#71717A]">Playwright + Gemini 1.5 Pro</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
              Website URL to Analyze
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-[#A1A1AA] pointer-events-none">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com or linear.app"
                disabled={isAnalyzing}
                className="w-full pl-12 pr-32 py-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-base text-[#111827] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:bg-white transition-all font-mono"
              />
              <button
                type="submit"
                disabled={!inputUrl.trim() || isAnalyzing}
                className="absolute right-2 px-5 py-2.5 bg-[#111827] hover:bg-black text-white font-semibold text-xs rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contextual Archetype Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-semibold text-[#71717A] flex items-center justify-between">
              <span>PROJECT ARCHETYPE PREFERENCE</span>
              <span className="text-[10px] text-[#A1A1AA]">Influences REVO's judging heuristics</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEBSITE_TYPES.map((t) => {
                const isSelected = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#111827] text-white'
                        : 'bg-[#F4F4F5] text-[#71717A] hover:text-[#111827] hover:bg-[#E4E4E7]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Quick Sample Targets */}
        <div className="pt-4 border-t border-[#F4F4F5] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[#71717A] font-medium">Or try analyzing benchmark targets:</span>
          <div className="flex flex-wrap gap-2">
            {sampleTargets.map((target) => (
              <button
                key={target.label}
                onClick={() => {
                  setInputUrl(target.fullUrl);
                  setSelectedType(target.type);
                  onAnalyze(target.fullUrl, target.type);
                }}
                disabled={isAnalyzing}
                className="px-2.5 py-1 rounded-md bg-[#FAFAFA] border border-[#E4E4E7] text-[#52525B] hover:text-[#111827] hover:border-[#D4D4D8] font-mono text-[11px] transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <span>{target.label}</span>
                <ExternalLink className="w-3 h-3 text-[#A1A1AA]" />
              </button>
            ))}
          </div>
        </div>

        {/* Running status indicator */}
        {isAnalyzing && (
          <div className="p-4 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] flex items-center space-x-3 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1D63ED] animate-ping" />
            <span className="text-xs font-semibold text-[#111827]">
              {statusMessage || 'Collecting Playwright DOM evidence & running reasoning engine...'}
            </span>
          </div>
        )}
      </div>

      {/* 3. RECENT PROJECTS UNDER THIS ENVIRONMENT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Environment Projects</h2>
            <p className="text-xs text-[#71717A]">Website analysis containers under {activeEnvironmentName}</p>
          </div>
          {recentProjects.length > 0 && (
            <button
              onClick={onNavigateToProjects}
              className="text-xs font-semibold text-[#1D63ED] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View all projects ({history.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentProjects.length > 0 ? (
          <div className="space-y-2.5">
            {recentProjects.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectProject(item)}
                className="p-4 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#111827] transition-all cursor-pointer shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center font-bold text-xs text-[#111827] font-mono shrink-0 group-hover:bg-[#111827] group-hover:text-white transition-colors">
                    {item.siteName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#111827] truncate">
                        {item.siteName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A] capitalize">
                        {item.siteType || 'saas'}
                      </span>
                    </div>
                    <span className="text-xs text-[#71717A] font-mono truncate">
                      {item.url} &bull; {new Date(item.analyzedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-[#71717A] uppercase">
                      Quality
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1D63ED]">
                      {item.awardIntelligence?.websiteQualityScore ?? Math.round((item.scores?.craft?.score || 7.5) * 10)}
                      /100
                    </span>
                  </div>

                  <div className="p-2 rounded-lg text-[#71717A] group-hover:text-[#111827] group-hover:bg-[#F4F4F5] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-2xl bg-[#FAFAFA] border border-dashed border-[#E4E4E7] space-y-3">
            <Layers className="w-8 h-8 text-[#A1A1AA] mx-auto" />
            <p className="text-sm font-semibold text-[#111827]">No projects created in this environment yet</p>
            <p className="text-xs text-[#71717A] max-w-sm mx-auto">
              Click "Create Project (4-Step Wizard)" above to start your first structured website analysis.
            </p>
            <button
              onClick={onCreateProjectClick}
              className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Project</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
