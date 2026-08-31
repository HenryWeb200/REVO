import React, { useState } from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  Eye,
  Columns,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Globe,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface AnalysisHistoryViewProps {
  history: StructuredAnalysisResponse[];
  currentAnalysisId?: string;
  onSelectAnalysis: (analysis: StructuredAnalysisResponse) => void;
  onCompareWithCurrent?: (historicalAnalysis: StructuredAnalysisResponse) => void;
  onCompareTwoSelected?: (analysisA: StructuredAnalysisResponse, analysisB: StructuredAnalysisResponse) => void;
  onDeleteAnalysis: (id: string) => void;
  onClearHistory: () => void;
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  history,
  currentAnalysisId,
  onSelectAnalysis,
  onCompareWithCurrent,
  onCompareTwoSelected,
  onDeleteAnalysis,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdsForCompare, setSelectedIdsForCompare] = useState<string[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.siteName.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q) ||
      item.siteType.toLowerCase().includes(q) ||
      item.overallDiagnosis?.toLowerCase().includes(q)
    );
  });

  const toggleSelectForCompare = (id: string) => {
    setSelectedIdsForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        // Keep the latest selected plus new one
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleRunCompareSelected = () => {
    if (selectedIdsForCompare.length !== 2) return;
    const itemA = history.find((x) => x.id === selectedIdsForCompare[0]);
    const itemB = history.find((x) => x.id === selectedIdsForCompare[1]);
    if (itemA && itemB && onCompareTwoSelected) {
      onCompareTwoSelected(itemA, itemB);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E4E4E7] pb-6 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Project Memory & History Engine</span>
          </div>
          <h3 className="font-display text-3xl font-extrabold text-[#111827]">
            Analysis History ({history.length})
          </h3>
          <p className="text-sm text-[#71717A] max-w-2xl">
            Review past website diagnostic runs, load any previous analysis session, compare older versions before & after, or manage stored project memory.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedIdsForCompare.length === 2 && onCompareTwoSelected && (
            <button
              onClick={handleRunCompareSelected}
              className="px-4 py-2 bg-[#1D63ED] hover:bg-[#1855D0] text-white font-semibold text-xs rounded-xl inline-flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare Selected 2 Items (Before / After)</span>
            </button>
          )}

          {history.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-red-600 font-medium">Delete all history?</span>
                  <button
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 bg-[#F4F4F5] text-[#52525B] rounded text-xs font-medium hover:bg-[#E4E4E7] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] hover:border-red-300 text-[#71717A] hover:text-red-600 rounded-xl text-xs font-medium inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter & Toolbar Bar */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFAFA] border border-[#E4E4E7] p-4 rounded-2xl">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by site name, URL, diagnosis..."
              className="w-full bg-white border border-[#E4E4E7] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#1D63ED]"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#71717A]">
            <span>Tip: Select any 2 cards to run a Before / After comparison</span>
            {selectedIdsForCompare.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-[#1D63ED] text-white font-semibold text-[11px]">
                {selectedIdsForCompare.length}/2 Selected
              </span>
            )}
          </div>
        </div>
      )}

      {/* History Items Grid / List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-[#FAFAFA] border border-dashed border-[#D4D4D8] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-white rounded-2xl border border-[#E4E4E7] flex items-center justify-center mx-auto text-[#A1A1AA]">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="font-bold text-[#111827] text-base">
              {history.length === 0 ? 'No Analysis History Saved' : 'No Matching Runs Found'}
            </h4>
            <p className="text-xs text-[#71717A] leading-relaxed">
              {history.length === 0
                ? 'Every analysis you perform will be saved here so you can review diagnostic reports, switch between past projects, or compare before & after results.'
                : 'Try adjusting your search query to find specific target URLs or site titles.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => {
            const isCurrent = item.id === currentAnalysisId;
            const isSelectedForCompare = selectedIdsForCompare.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all hover:shadow-sm ${
                  isCurrent
                    ? 'border-[#1D63ED] ring-2 ring-[#1D63ED]/10'
                    : isSelectedForCompare
                    ? 'border-[#1D63ED] bg-blue-50/20'
                    : 'border-[#E4E4E7] hover:border-[#D4D4D8]'
                }`}
              >
                {/* Card Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-[11px] text-[#71717A]">
                        <Clock className="w-3 h-3 text-[#1D63ED] shrink-0" />
                        <span>{formatDate(item.analyzedAt)}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 bg-[#1D63ED] text-white text-[10px] font-bold rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-lg text-[#111827] truncate">
                        {item.siteName || 'Untitled Website'}
                      </h4>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#1D63ED] hover:underline inline-flex items-center space-x-1 truncate max-w-full"
                      >
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>

                    {/* Compare Selection Checkbox */}
                    <button
                      onClick={() => toggleSelectForCompare(item.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer shrink-0 ${
                        isSelectedForCompare
                          ? 'bg-[#1D63ED] border-[#1D63ED] text-white'
                          : 'bg-[#FAFAFA] border-[#E4E4E7] text-[#A1A1AA] hover:text-[#52525B]'
                      }`}
                      title={isSelectedForCompare ? 'Selected for comparison' : 'Select for comparison'}
                    >
                      <Columns className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Diagnosis Snippet */}
                  {item.overallDiagnosis && (
                    <p className="text-xs text-[#52525B] leading-relaxed line-clamp-3 bg-[#FAFAFA] p-3 rounded-xl border border-[#F4F4F5]">
                      {item.overallDiagnosis}
                    </p>
                  )}

                  {/* Core Scores Strip */}
                  {item.scores && (
                    <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                      <div className="bg-[#FAFAFA] border border-[#E4E4E7] p-1.5 rounded-lg">
                        <span className="text-[10px] text-[#71717A] block font-medium">Clarity</span>
                        <span className="font-display font-bold text-xs text-[#111827]">
                          {item.scores.clarity?.score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-[#FAFAFA] border border-[#E4E4E7] p-1.5 rounded-lg">
                        <span className="text-[10px] text-[#71717A] block font-medium">Craft</span>
                        <span className="font-display font-bold text-xs text-[#111827]">
                          {item.scores.craft?.score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-[#FAFAFA] border border-[#E4E4E7] p-1.5 rounded-lg">
                        <span className="text-[10px] text-[#71717A] block font-medium">Hierarchy</span>
                        <span className="font-display font-bold text-xs text-[#111827]">
                          {item.scores.visualHierarchy?.score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-[#FAFAFA] border border-[#E4E4E7] p-1.5 rounded-lg">
                        <span className="text-[10px] text-[#71717A] block font-medium">Usability</span>
                        <span className="font-display font-bold text-xs text-[#111827]">
                          {item.scores.usability?.score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectAnalysis(item)}
                      className="px-3 py-1.5 bg-[#111827] hover:bg-[#27272A] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    {onCompareWithCurrent && currentAnalysisId && currentAnalysisId !== item.id && (
                      <button
                        onClick={() => onCompareWithCurrent(item)}
                        className="px-2.5 py-1.5 bg-[#FAFAFA] border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#111827] rounded-lg text-xs font-medium inline-flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Compare against current active analysis"
                      >
                        <Columns className="w-3 h-3 text-[#1D63ED]" />
                        <span>Compare</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteAnalysis(item.id)}
                    className="p-1.5 text-[#A1A1AA] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete item from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
