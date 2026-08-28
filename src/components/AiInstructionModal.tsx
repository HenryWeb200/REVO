import React, { useState } from 'react';
import { Terminal, Copy, Check, FileText, Download, X, Code2 } from 'lucide-react';
import { AiInstructionsV2, RevoDesignBriefV2 } from '../types';

interface AiInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiInstructions?: AiInstructionsV2;
  designBrief?: RevoDesignBriefV2;
  siteName: string;
}

export const AiInstructionModal: React.FC<AiInstructionModalProps> = ({
  isOpen,
  onClose,
  aiInstructions,
  designBrief,
  siteName,
}) => {
  const [activeTab, setActiveTab] = useState<'cursor' | 'claude' | 'tokens' | 'brief'>('cursor');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !aiInstructions) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBrief = () => {
    if (!designBrief) return;
    const briefContent = `
# REVO V2 DESIGN BRIEF: ${siteName}
Generated: ${new Date().toISOString()}

## PRODUCT INTENT
${designBrief.productIntent}

## TARGET AUDIENCE
${designBrief.targetAudience}

## CURRENT DESIGN DNA
${designBrief.currentDesignDna}

## STRENGTHS OBSERVED
${designBrief.strengthsSummary.map((s) => `- ${s}`).join('\n')}

## CORE BOTTLENECKS
${designBrief.coreBottlenecks.map((b) => `- ${b}`).join('\n')}

## VISUAL DIRECTION
${designBrief.visualDirection.map((v) => `- ${v}`).join('\n')}

## MOTION PRINCIPLES
${designBrief.motionPrinciples.map((m) => `- ${m}`).join('\n')}

## RESPONSIVE RULES
${designBrief.responsiveRules.map((r) => `- ${r}`).join('\n')}

## ACTION PRIORITIES
${designBrief.actionPriorities.map((a) => `- ${a}`).join('\n')}
    `.trim();

    const blob = new Blob([briefContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `REVO_Design_Brief_${siteName.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-5 h-5 text-[#1D63ED]" />
            <div>
              <h3 className="font-display font-bold text-base text-[#111827]">
                AI Coding Instructions & Design Brief
              </h3>
              <p className="text-xs text-[#71717A]">
                Structured for Cursor (.cursorrules), Claude, Gemini & Design Brief export.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#111827] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-[#F4F4F5] flex flex-wrap items-center justify-between gap-2 shrink-0 bg-[#FAFAFA]">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('cursor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'cursor'
                  ? 'bg-white border border-[#E4E4E7] text-[#111827] shadow-xs'
                  : 'text-[#71717A] hover:text-[#111827]'
              }`}
            >
              .cursorrules
            </button>
            <button
              onClick={() => setActiveTab('claude')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'claude'
                  ? 'bg-white border border-[#E4E4E7] text-[#111827] shadow-xs'
                  : 'text-[#71717A] hover:text-[#111827]'
              }`}
            >
              Claude Prompt
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'tokens'
                  ? 'bg-white border border-[#E4E4E7] text-[#111827] shadow-xs'
                  : 'text-[#71717A] hover:text-[#111827]'
              }`}
            >
              CSS Tokens Table
            </button>
            <button
              onClick={() => setActiveTab('brief')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'brief'
                  ? 'bg-white border border-[#E4E4E7] text-[#111827] shadow-xs'
                  : 'text-[#71717A] hover:text-[#111827]'
              }`}
            >
              REVO Design Brief
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'brief' ? (
              <button
                onClick={handleDownloadBrief}
                className="px-3 py-1.5 rounded-lg bg-[#111827] text-white hover:bg-[#27272A] text-xs font-medium inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  handleCopy(
                    activeTab === 'cursor'
                      ? aiInstructions.cursorRulesMarkdown
                      : activeTab === 'claude'
                      ? aiInstructions.claudePromptMarkdown
                      : JSON.stringify(aiInstructions.exactCssTokens, null, 2)
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-[#111827] text-white hover:bg-[#27272A] text-xs font-medium inline-flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'cursor' && (
            <pre className="bg-[#111827] text-[#E4E4E7] p-5 rounded-xl font-mono overflow-x-auto leading-relaxed border border-[#27272A] select-all whitespace-pre-wrap">
              {aiInstructions.cursorRulesMarkdown}
            </pre>
          )}

          {activeTab === 'claude' && (
            <pre className="bg-[#111827] text-[#E4E4E7] p-5 rounded-xl font-mono overflow-x-auto leading-relaxed border border-[#27272A] select-all whitespace-pre-wrap">
              {aiInstructions.claudePromptMarkdown}
            </pre>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                Standardized Tailwind / CSS Custom Properties
              </span>
              <div className="border border-[#E4E4E7] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#71717A]">
                      <th className="p-3 font-semibold">Variable</th>
                      <th className="p-3 font-semibold">Suggested Value</th>
                      <th className="p-3 font-semibold">Strategic Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F5]">
                    {aiInstructions.exactCssTokens.map((tok, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAFA]">
                        <td className="p-3 font-mono font-bold text-[#1D63ED]">{tok.variable}</td>
                        <td className="p-3 font-mono text-[#111827]">{tok.suggested}</td>
                        <td className="p-3 text-[#52525B]">{tok.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'brief' && designBrief && (
            <div className="space-y-6 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6">
              <div className="space-y-1 border-b border-[#E4E4E7] pb-3">
                <span className="text-xs font-mono text-[#1D63ED] font-bold">REVO EXECUTIVE DESIGN BRIEF</span>
                <h4 className="font-display text-xl font-bold text-[#111827]">{siteName}</h4>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-[#111827] block mb-1">Product Intent</span>
                  <p className="text-[#52525B]">{designBrief.productIntent}</p>
                </div>
                <div>
                  <span className="font-bold text-[#111827] block mb-1">Target Audience</span>
                  <p className="text-[#52525B]">{designBrief.targetAudience}</p>
                </div>
                <div>
                  <span className="font-bold text-[#111827] block mb-1">Visual Direction</span>
                  <ul className="list-disc pl-4 space-y-1 text-[#52525B]">
                    {designBrief.visualDirection.map((vd, idx) => (
                      <li key={idx}>{vd}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
