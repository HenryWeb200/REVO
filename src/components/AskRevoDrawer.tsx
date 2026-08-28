import React, { useState } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { StructuredAnalysisResponse } from '../types';

interface AskRevoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: StructuredAnalysisResponse;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citedEvidence?: string[];
}

export const AskRevoDrawer: React.FC<AskRevoDrawerProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am REVO's grounded reasoning copilot. I have full context on ${analysis.siteName}'s verified DOM structure, load latency (${analysis.evidence.loadTimeMs}ms), Design DNA, and diagnostic findings. Ask me anything about how to optimize or redesign this website.`,
    },
  ]);

  if (!isOpen) return null;

  const sampleQuestions = [
    'Why is the hero CTA competing for attention?',
    'What is the biggest technical bottleneck?',
    'How do I make the typography hierarchy sharper?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          analysis,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I could not synthesize an answer based on current evidence.',
        citedEvidence: data.citedEvidence,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          content: 'An error occurred while consulting the reasoning engine. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-[#E4E4E7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E4E4E7] flex items-center justify-between shrink-0 bg-[#FAFAFA]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#111827] text-white flex items-center justify-center font-display font-bold text-xs">
            R
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#111827]">Ask REVO</h3>
            <p className="text-[11px] text-[#71717A]">Grounded on {analysis.siteName} evidence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#E4E4E7] text-[#71717A] hover:text-[#111827] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  isBot ? 'bg-[#1D63ED] text-white font-bold' : 'bg-[#111827] text-white'
                }`}
              >
                {isBot ? 'R' : 'U'}
              </div>
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  isBot
                    ? 'bg-[#FAFAFA] border border-[#E4E4E7] text-[#111827]'
                    : 'bg-[#1D63ED] text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.citedEvidence && msg.citedEvidence.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#E4E4E7] text-[10px] text-[#71717A] space-y-1">
                    <span className="font-semibold text-[#52525B] block">Grounded Evidence:</span>
                    {msg.citedEvidence.map((ev, eIdx) => (
                      <div key={eIdx} className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-[#71717A] p-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1D63ED]" />
            <span>REVO is reasoning over evidence...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-5 py-2 border-t border-[#F4F4F5] bg-[#FAFAFA] shrink-0">
        <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase block mb-1.5">
          Suggested Questions:
        </span>
        <div className="flex flex-col space-y-1">
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              disabled={loading}
              className="text-left text-[11px] text-[#52525B] hover:text-[#1D63ED] hover:underline truncate cursor-pointer disabled:opacity-50"
            >
              &bull; {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-[#E4E4E7] bg-white flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a technical or design question..."
          disabled={loading}
          className="flex-1 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#1D63ED] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-8 w-8 bg-[#1D63ED] hover:bg-[#1855D0] disabled:opacity-50 text-white rounded-lg flex items-center justify-center cursor-pointer transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
