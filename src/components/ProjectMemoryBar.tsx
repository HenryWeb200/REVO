import React from 'react';
import { History, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface ProjectMemoryBarProps {
  onSelectSavedAnalysis?: (analysis: StructuredAnalysisResponse) => void;
  currentId?: string;
}

export const ProjectMemoryBar: React.FC<ProjectMemoryBarProps> = ({
  onSelectSavedAnalysis,
  currentId,
}) => {
  const [history, setHistory] = React.useState<{ id: string; url: string; siteName: string; timestamp: string }[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('revo_analysis_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [currentId]);

  const handleClearHistory = () => {
    localStorage.removeItem('revo_analysis_history');
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="w-full bg-[#FAFAFA] border-y border-[#E4E4E7] py-2.5 px-4 sm:px-8 select-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2 text-[#71717A] shrink-0">
          <History className="w-3.5 h-3.5 text-[#1D63ED]" />
          <span className="font-semibold text-[#111827]">Project Memory / History:</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar flex-1">
          {history.map((item) => (
            <div
              key={item.id}
              className={`px-3 py-1 rounded-lg border text-xs font-medium shrink-0 flex items-center space-x-1.5 ${
                item.id === currentId
                  ? 'bg-white border-[#1D63ED] text-[#1D63ED] shadow-xs'
                  : 'bg-white border-[#E4E4E7] text-[#52525B]'
              }`}
            >
              <span>{item.siteName}</span>
              <span className="text-[10px] text-[#A1A1AA]">({new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleClearHistory}
          className="text-[11px] text-[#A1A1AA] hover:text-[#EF4444] cursor-pointer shrink-0 transition-colors"
          title="Clear History"
        >
          Clear History
        </button>
      </div>
    </div>
  );
};
