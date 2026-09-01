import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, Sparkles, Folder, Zap, FileText, Sliders } from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StructuredAnalysisResponse[];
  onSelectProject: (project: StructuredAnalysisResponse) => void;
  onTriggerAction: (action: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  onTriggerAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'new_analysis', label: 'Start New Analysis', icon: Sparkles, cat: 'Action' },
    { id: 'ask_revo', label: 'Ask REVO Grounded Copilot', icon: Zap, cat: 'Action' },
    { id: 'export_report', label: 'Export Executive PDF Report', icon: FileText, cat: 'Action' },
    { id: 'open_settings', label: 'Open Analysis Preferences', icon: Sliders, cat: 'Settings' },
  ];

  const filteredProjects = projects.filter(
    (p) =>
      p.siteName.toLowerCase().includes(query.toLowerCase()) ||
      p.url.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#E4E4E7] flex items-center space-x-3">
          <Search className="w-5 h-5 text-[#A1A1AA]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, diagnostic findings, or REVO actions..."
            className="w-full text-sm text-[#111827] placeholder-[#A1A1AA] focus:outline-none bg-transparent"
          />
          <kbd className="px-2 py-1 rounded bg-[#F4F4F5] border border-[#E4E4E7] text-[10px] font-mono text-[#71717A]">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider px-3 block">
                Quick Commands
              </span>
              {filteredActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      onTriggerAction(act.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#FAFAFA] text-left text-xs font-semibold text-[#111827] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-[#1D63ED]" />
                      <span>{act.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider px-3 block">
                Projects ({filteredProjects.length})
              </span>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#FAFAFA] text-left text-xs font-semibold text-[#111827] cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Folder className="w-4 h-4 text-[#71717A] shrink-0" />
                    <span className="truncate">{p.siteName}</span>
                    <span className="text-[10px] font-mono text-[#71717A] truncate">({p.url})</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F4F4F5] text-[#1D63ED] shrink-0">
                    {p.awardIntelligence?.websiteQualityScore ?? 80}/100
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredActions.length === 0 && filteredProjects.length === 0 && (
            <div className="p-8 text-center text-xs text-[#71717A]">
              No matching commands or projects found.
            </div>
          )}
        </div>

        <div className="p-3 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between text-[11px] text-[#71717A]">
          <span className="font-mono">REVO ⌘K Command Interface</span>
          <span className="flex items-center space-x-1">
            <span>Use</span>
            <kbd className="px-1 py-0.5 rounded bg-white border border-[#E4E4E7] font-mono text-[9px]">
              ↑
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-white border border-[#E4E4E7] font-mono text-[9px]">
              ↓
            </kbd>
            <span>to navigate</span>
          </span>
        </div>
      </div>
    </div>
  );
};
