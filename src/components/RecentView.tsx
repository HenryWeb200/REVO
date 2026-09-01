import React, { useState } from 'react';
import {
  History,
  Search,
  ArrowRight,
  Globe,
  Clock,
  Sparkles,
  Trophy,
  Trash2,
} from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface RecentViewProps {
  history: StructuredAnalysisResponse[];
  onSelectProject: (project: StructuredAnalysisResponse) => void;
  onDeleteProject: (id: string) => void;
  onClearHistory: () => void;
}

export const RecentView: React.FC<RecentViewProps> = ({
  history,
  onSelectProject,
  onDeleteProject,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');

  const filtered = history.filter(
    (item) =>
      item.siteName.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase())
  );

  // Group by date
  const groupHistoryByTime = (items: StructuredAnalysisResponse[]) => {
    const today: StructuredAnalysisResponse[] = [];
    const yesterday: StructuredAnalysisResponse[] = [];
    const earlier: StructuredAnalysisResponse[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    items.forEach((item) => {
      const time = new Date(item.analyzedAt).getTime();
      if (time >= todayStart) {
        today.push(item);
      } else if (time >= yesterdayStart) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = groupHistoryByTime(filtered);

  const renderGroup = (title: string, items: StructuredAnalysisResponse[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-[#71717A]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">{title}</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F4F4F5] text-[#71717A]">
            {items.length}
          </span>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const qualityScore =
              item.awardIntelligence?.websiteQualityScore ??
              Math.round((item.scores?.craft?.score || 7.5) * 10);

            return (
              <div
                key={item.id}
                onClick={() => onSelectProject(item)}
                className="w-full p-4 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#111827] transition-all cursor-pointer shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center font-bold text-xs font-mono text-[#111827] group-hover:bg-[#111827] group-hover:text-white transition-colors shrink-0">
                    {item.siteName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#111827] truncate group-hover:text-[#1D63ED] transition-colors">
                        {item.siteName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A] capitalize">
                        {item.siteType || 'saas'}
                      </span>
                    </div>
                    <span className="text-xs text-[#71717A] font-mono truncate">
                      {item.url} &bull; {new Date(item.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-[#71717A] uppercase">
                      Quality
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1D63ED]">
                      {qualityScore}/100
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(item.id);
                    }}
                    title="Delete record"
                    className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-1.5 rounded-lg text-[#71717A] group-hover:text-[#111827] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[#111827] tracking-tight">
            Recent Activity
          </h1>
          <p className="text-sm text-[#71717A]">
            Chronological audit log of your website evaluations and intelligence runs
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-semibold text-[#EF4444] hover:underline cursor-pointer"
          >
            Clear All History
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter recent activity..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#111827]"
        />
      </div>

      {/* CHRONOLOGICAL GROUPS */}
      {filtered.length > 0 ? (
        <div className="space-y-8">
          {renderGroup('Today', today)}
          {renderGroup('Yesterday', yesterday)}
          {renderGroup('Earlier', earlier)}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-[#E4E4E7] space-y-3">
          <History className="w-10 h-10 text-[#A1A1AA] mx-auto" />
          <h3 className="text-base font-bold text-[#111827]">No recent activity found</h3>
          <p className="text-xs text-[#71717A]">
            Your evaluation history will appear here chronologically as you analyze sites.
          </p>
        </div>
      )}
    </div>
  );
};
