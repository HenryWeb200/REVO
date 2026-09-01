import React, { useState } from 'react';
import { X, FolderKanban, Globe, Tag, ArrowRight } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEnvironment: 'personal' | 'company';
  environments: Array<{ id: string; name: string; type: 'personal' | 'company' }>;
  onCreateProject: (projectData: {
    name: string;
    url: string;
    projectType: string;
    environmentId: string;
  }) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  activeEnvironment,
  environments,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [projectType, setProjectType] = useState('saas');
  const [selectedEnvId, setSelectedEnvId] = useState(
    activeEnvironment === 'personal' ? 'personal' : 'company'
  );

  if (!isOpen) return null;

  const projectTypes = [
    { id: 'saas', label: 'SaaS Application', desc: 'Focus on onboarding clarity, pricing, and feature hierarchy.' },
    { id: 'portfolio', label: 'Portfolio', desc: 'Prioritize distinctiveness, typography, and creative identity.' },
    { id: 'marketing', label: 'Marketing Site', desc: 'Evaluate value proposition, CTA contrast, and conversion.' },
    { id: 'ecommerce', label: 'E-Commerce', desc: 'Prioritize product grid rhythm, checkout friction, and trust.' },
    { id: 'developer_tool', label: 'Developer Tool', desc: 'Focus on code readability, docs density, and dark mode UI.' },
    { id: 'corporate', label: 'Corporate Website', desc: 'Check brand authority, accessibility, and navigation.' },
    { id: 'editorial', label: 'Editorial / Media', desc: 'Emphasize reading experience, article typography, and layout.' },
    { id: 'experimental', label: 'Experimental / Creative', desc: 'Judge innovation, motion rhythm, and distinct visual style.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    onCreateProject({
      name: name.trim(),
      url: targetUrl,
      projectType,
      environmentId: selectedEnvId,
    });

    setName('');
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[90vh]">
        <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h3 className="font-extrabold text-lg text-[#111827] flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-[#1D63ED]" />
              <span>Create New Project</span>
            </h3>
            <p className="text-xs text-[#71717A]">
              Create a persistent intelligence workspace container for website evaluation and Design DNA tracking.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* 1. Environment Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Where should this project live?
            </label>
            <select
              value={selectedEnvId}
              onChange={(e) => setSelectedEnvId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] font-medium"
            >
              {environments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name} ({env.type === 'personal' ? 'Personal' : 'Team Workspace'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111827]">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Linear Redesign or Acme Marketing Page"
              className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#111827]"
              required
            />
          </div>

          {/* 3. Website URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111827]">Target Website URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="linear.app or stripe.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#111827]"
                required
              />
            </div>
          </div>

          {/* 4. Project Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Project Category / Type
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {projectTypes.map((pt) => (
                <button
                  type="button"
                  key={pt.id}
                  onClick={() => setProjectType(pt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    projectType === pt.id
                      ? 'border-[#111827] bg-[#FAFAFA] ring-2 ring-[#111827]/10'
                      : 'border-[#E4E4E7] hover:border-[#A1A1AA] bg-white'
                  }`}
                >
                  <p className="font-bold text-xs text-[#111827]">{pt.label}</p>
                  <p className="text-[10px] text-[#71717A] line-clamp-1 mt-0.5">{pt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:bg-[#F4F4F5] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1D63ED] text-white text-xs font-semibold rounded-xl hover:bg-[#154EC1] transition-colors cursor-pointer inline-flex items-center space-x-1.5 shadow-xs"
            >
              <span>Create Project & Analyze</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
