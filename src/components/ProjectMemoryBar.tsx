import React from 'react';
import { History, X, ArrowRight } from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';
import { getHistory, deleteFromHistory } from '../lib/historyStorage';

interface ProjectMemoryBarProps {
  onSelectSavedAnalysis: (analysis: StructuredAnalysisResponse) => void;
  onOpenHistoryTab: () => void;
  currentId?: string;
  refreshTrigger?: number;
}

export const ProjectMemoryBar: React.FC<ProjectMemoryBarProps> = ({
  onSelectSavedAnalysis,
  onOpenHistoryTab,
  currentId,
  refreshTrigger,
}) => {
  const [historyItems, setHistoryItems] = React.useState<StructuredAnalysisResponse[]>([]);

  const reloadHistory = React.useCallback(() => {
    setHistoryItems(getHistory());
  }, []);

  React.useEffect(() => {
    reloadHistory();
  }, [currentId, refreshTrigger, reloadHistory]);

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteFromHistory(id);
    setHistoryItems(updated);
  };

  if (historyItems.length === 0) return null;

  return (
    <div className="w-full bg-[#FAFAFA] border-y border-[#E4E4E7] py-2 px-4 sm:px-8 select-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 text-xs">
        <div
          onClick={onOpenHistoryTab}
          className="flex items-center space-x-2 text-[#71717A] shrink-0 cursor-pointer hover:text-[#111827] transition-colors"
        >
          <History className="w-3.5 h-3.5 text-[#1D63ED]" />
          <span className="font-semibold text-[#111827]">History Memory ({historyItems.length}):</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar flex-1">
          {historyItems.slice(0, 8).map((item) => {
            const isSelected = item.id === currentId;
            const timeStr = item.analyzedAt
              ? new Date(item.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={item.id}
                onClick={() => onSelectSavedAnalysis(item)}
                className={`group px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 flex items-center space-x-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-[#1D63ED] text-[#1D63ED] shadow-xs'
                    : 'bg-white border-[#E4E4E7] text-[#52525B] hover:border-[#D4D4D8] hover:text-[#111827]'
                }`}
              >
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{item.siteName || item.url}</span>
                {timeStr && <span className="text-[10px] text-[#A1A1AA]">({timeStr})</span>}
                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  className="text-[#A1A1AA] hover:text-red-600 opacity-60 group-hover:opacity-100 p-0.5 rounded transition-colors"
                  title="Remove from history"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onOpenHistoryTab}
          className="text-xs text-[#1D63ED] font-semibold hover:underline cursor-pointer shrink-0 inline-flex items-center space-x-1"
        >
          <span>View All History</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
