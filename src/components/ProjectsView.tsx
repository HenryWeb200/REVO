import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  FolderKanban,
  ArrowRight,
  Trash2,
  Columns,
  Sparkles,
  Trophy,
  Globe,
  Tag,
  Clock,
} from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface ProjectsViewProps {
  projects: StructuredAnalysisResponse[];
  onSelectProject: (project: StructuredAnalysisResponse) => void;
  onNewAnalysis: () => void;
  onDeleteProject: (id: string) => void;
  onCompare: (project: StructuredAnalysisResponse) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSelectProject,
  onNewAnalysis,
  onDeleteProject,
  onCompare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'saas', label: 'SaaS' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'agency', label: 'Agency' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'developer_tool', label: 'Developer Tool' },
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesQuery =
      p.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || (p.siteType && p.siteType.toLowerCase() === selectedCategory);
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[#111827] tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-[#71717A]">
            Manage and inspect your REVO design intelligence project containers
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="px-4 py-2.5 bg-[#111827] hover:bg-black text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* 2. SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#111827]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PROJECT GRID */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const qualityScore =
              project.awardIntelligence?.websiteQualityScore ??
              Math.round((project.scores?.craft?.score || 7.5) * 10);
            const awardScore = project.awardIntelligence?.awardPotentialScore;

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-[#E4E4E7] hover:border-[#111827] transition-all p-5 shadow-xs flex flex-col justify-between space-y-5 group"
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center text-xs font-bold font-mono text-[#111827] group-hover:bg-[#111827] group-hover:text-white transition-colors">
                      {project.siteName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                      {project.siteType || 'saas'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#111827] group-hover:text-[#1D63ED] transition-colors truncate">
                      {project.siteName}
                    </h3>
                    <p className="text-xs text-[#71717A] font-mono truncate flex items-center space-x-1">
                      <Globe className="w-3 h-3 text-[#A1A1AA] inline" />
                      <span>{project.url}</span>
                    </p>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F4F4F5]">
                  <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]/60 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase block">
                      Quality Score
                    </span>
                    <span className="text-sm font-bold font-mono text-[#1D63ED]">
                      {qualityScore}/100
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]/60 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase block">
                      Award Potential
                    </span>
                    <span className="text-sm font-bold font-mono text-amber-600">
                      {awardScore ? `${awardScore}/100` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 flex items-center justify-between text-xs text-[#71717A]">
                  <span className="text-[11px] font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#A1A1AA]" />
                    <span>{new Date(project.analyzedAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onCompare(project)}
                      title="Compare DNA"
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#111827] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                    >
                      <Columns className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete Project"
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectProject(project)}
                      className="px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-[#E4E4E7] space-y-3">
          <FolderKanban className="w-10 h-10 text-[#A1A1AA] mx-auto" />
          <h3 className="text-base font-bold text-[#111827]">No projects match your search</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Try adjusting your search query or create a new project analysis.
          </p>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyze New Website</span>
          </button>
        </div>
      )}
    </div>
  );
};
