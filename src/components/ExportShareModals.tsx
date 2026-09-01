import React, { useState } from 'react';
import { X, Download, Share2, Copy, Check, FileText, Lock, Users } from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: StructuredAnalysisResponse | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const reports = [
    { id: 'exec', title: 'Executive Summary', desc: 'Concise 1-page C-level diagnosis & strategic verdict.' },
    { id: 'full', title: 'Full REVO Master Report', desc: 'Comprehensive report containing all 13 dimension scores, evidence, and roadmap.' },
    { id: 'design', title: 'Design & Craft Audit', desc: 'Design DNA, typography fingerprint, color tokens, and Variety Engine.' },
    { id: 'ux', title: 'UX & Friction Report', desc: 'Navigation hierarchy, user flow bottlenecks, and conversion paths.' },
    { id: 'tech', title: 'Technical & Performance', desc: 'LCP, CLS, INP, semantic HTML, console errors, and accessibility.' },
  ];

  const handleDownload = (reportTitle: string) => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-[#1D63ED]" />
            <h3 className="font-bold text-base text-[#111827]">Export PDF & Executive Reports</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#71717A] hover:bg-[#F4F4F5]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#71717A]">
          Export grounded evaluation reports for <span className="font-bold text-[#111827]">{project?.siteName || 'this project'}</span> formatted for executive sharing or design handoff.
        </p>

        <div className="space-y-2.5">
          {reports.map((r) => (
            <div
              key={r.id}
              onClick={() => handleDownload(r.title)}
              className="p-3.5 rounded-xl border border-[#E4E4E7] hover:border-[#111827] bg-[#FAFAFA] hover:bg-white transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-0.5 min-w-0 pr-4">
                <h4 className="font-bold text-xs text-[#111827] group-hover:text-[#1D63ED] transition-colors">
                  {r.title}
                </h4>
                <p className="text-[11px] text-[#71717A] truncate">{r.desc}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-[#111827] text-white text-[11px] font-semibold group-hover:bg-black transition-colors shrink-0 flex items-center space-x-1 cursor-pointer">
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          ))}
        </div>

        {downloaded && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Report generated and ready for export!</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#111827] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: StructuredAnalysisResponse | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, project }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = project ? `https://revo.dev/share/${project.id}` : 'https://revo.dev/share/preview';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-[#1D63ED]" />
            <h3 className="font-bold text-base text-[#111827]">Share Project Analysis</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#71717A] hover:bg-[#F4F4F5]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
              Public Project Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-mono text-[#111827]"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-[#111827] hover:bg-black text-white font-semibold text-xs rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-[#1D63ED]" />
                <span>Workspace Member Access</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                View & Edit
              </span>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Anyone with access to your Personal Workspace can view this analysis and ask grounded questions via Ask REVO.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
