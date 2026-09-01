import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  Globe,
  Tag,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  User,
  Monitor,
  Smartphone,
  Sliders,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface CreateProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEnvironment: string;
  environments: Array<{ id: string; name: string; type: 'personal' | 'company' }>;
  onCreateProject: (projectData: {
    name: string;
    url: string;
    projectType: string;
    environmentId: string;
    viewport?: 'desktop' | 'mobile' | 'both';
    evaluationMode?: 'strict' | 'balanced' | 'creative';
    notes?: string;
  }) => void;
}

export const CreateProjectWizardModal: React.FC<CreateProjectWizardModalProps> = ({
  isOpen,
  onClose,
  activeEnvironment,
  environments,
  onCreateProject,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [projectType, setProjectType] = useState('saas');
  const [selectedEnvId, setSelectedEnvId] = useState(
    activeEnvironment || (environments[0]?.id || '')
  );
  const [viewport, setViewport] = useState<'desktop' | 'mobile' | 'both'>('desktop');
  const [evaluationMode, setEvaluationMode] = useState<'strict' | 'balanced' | 'creative'>('balanced');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const projectTypes = [
    { id: 'saas', label: 'SaaS Application', desc: 'Focus on onboarding clarity, pricing hierarchy, and feature CTA conversion.' },
    { id: 'portfolio', label: 'Portfolio', desc: 'Prioritize visual distinctiveness, typography pairing, and creative identity.' },
    { id: 'marketing', label: 'Marketing Landing', desc: 'Evaluate value proposition, hero section contrast, and trust signals.' },
    { id: 'ecommerce', label: 'E-Commerce', desc: 'Prioritize product grid rhythm, checkout friction, and mobile responsiveness.' },
    { id: 'developer_tool', label: 'Developer Tool', desc: 'Focus on code snippet legibility, docs density, and dark mode theme.' },
    { id: 'corporate', label: 'Corporate Website', desc: 'Check brand authority, accessibility compliance, and main navigation.' },
    { id: 'editorial', label: 'Editorial / Media', desc: 'Emphasize reading comfort, article typography scale, and layout rhythm.' },
    { id: 'experimental', label: 'Experimental / Creative', desc: 'Judge innovation, motion smoothness, and distinct visual character.' },
  ];

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) return;
    if (currentStep === 2 && !url.trim()) return;
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      viewport,
      evaluationMode,
      notes,
    });

    // Reset wizard
    setCurrentStep(1);
    setName('');
    setUrl('');
    setNotes('');
    onClose();
  };

  const steps = [
    { number: 1, title: 'Identity & Environment', desc: 'Project name & location' },
    { number: 2, title: 'Target Website', desc: 'URL & viewport' },
    { number: 3, title: 'Project Archetype', desc: 'Judging criteria' },
    { number: 4, title: 'Evaluation Focus', desc: 'Launch analysis' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* WIZARD HEADER & STEP PROGRESS */}
        <div className="p-6 border-b border-[#E4E4E7] bg-[#FAFAFA] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1D63ED]/10 text-[#1D63ED] flex items-center justify-center font-bold text-sm">
                {currentStep}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#111827]">
                  Create Project — Step {currentStep} of 4
                </h3>
                <p className="text-xs text-[#71717A]">
                  {steps[currentStep - 1].title}: {steps[currentStep - 1].desc}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP INDICATOR TRACK */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {steps.map((s) => {
              const isActive = currentStep === s.number;
              const isDone = currentStep > s.number;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    // Allow navigating to previous or validated next steps
                    if (s.number < currentStep || (s.number === currentStep + 1 && ((currentStep === 1 && name.trim()) || (currentStep === 2 && url.trim())))) {
                      setCurrentStep(s.number as 1 | 2 | 3 | 4);
                    }
                  }}
                  className={`flex items-center space-x-2 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#1D63ED] bg-blue-50/50 text-[#1D63ED] ring-1 ring-[#1D63ED]'
                      : isDone
                      ? 'border-[#E4E4E7] bg-white text-[#111827]'
                      : 'border-[#F4F4F5] bg-[#FAFAFA] text-[#A1A1AA]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isDone
                        ? 'bg-[#111827] text-white'
                        : isActive
                        ? 'bg-[#1D63ED] text-white'
                        : 'bg-[#E4E4E7] text-[#71717A]'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : s.number}
                  </div>
                  <span className="text-xs font-semibold truncate hidden sm:inline">
                    {s.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: IDENTITY & ENVIRONMENT */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#111827]">Step 1: Project Identity & Location</h4>
                <p className="text-xs text-[#71717A]">
                  Define the name of your project and select which environment container it belongs to.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Linear Redesign or Stripe Marketing Evaluation"
                  className="w-full p-3 bg-white border border-[#E4E4E7] rounded-xl text-sm text-[#111827] focus:ring-2 focus:ring-[#111827] font-medium"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Environment Container *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {environments.map((env) => {
                    const isSelected = selectedEnvId === env.id;
                    return (
                      <button
                        type="button"
                        key={env.id}
                        onClick={() => setSelectedEnvId(env.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between space-x-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#1D63ED] bg-blue-50/40 ring-2 ring-[#1D63ED]/20'
                            : 'border-[#E4E4E7] hover:border-[#A1A1AA] bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          {env.type === 'personal' ? (
                            <User className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1D63ED]' : 'text-[#71717A]'}`} />
                          ) : (
                            <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#111827]' : 'text-[#71717A]'}`} />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-xs text-[#111827] truncate">{env.name}</p>
                            <p className="text-[10px] text-[#71717A]">
                              {env.type === 'personal' ? 'Personal Environment' : 'Company Environment'}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1D63ED] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TARGET WEBSITE & VIEWPORT */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#111827]">Step 2: Target Website & Capture</h4>
                <p className="text-xs text-[#71717A]">
                  Specify the target URL REVO will evaluate for Design DNA, UX friction, and performance.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Website URL *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="linear.app or https://stripe.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E4E4E7] rounded-xl text-sm text-[#111827] font-mono focus:ring-2 focus:ring-[#111827]"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Viewport Evaluation Preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setViewport('desktop')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
                      viewport === 'desktop'
                        ? 'border-[#111827] bg-[#FAFAFA] ring-2 ring-[#111827]/10 text-[#111827]'
                        : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    <span className="text-xs font-bold">Desktop (1440px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewport('mobile')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
                      viewport === 'mobile'
                        ? 'border-[#111827] bg-[#FAFAFA] ring-2 ring-[#111827]/10 text-[#111827]'
                        : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-xs font-bold">Mobile (375px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewport('both')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
                      viewport === 'both'
                        ? 'border-[#1D63ED] bg-blue-50/40 ring-2 ring-[#1D63ED]/20 text-[#1D63ED]'
                        : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <Sliders className="w-5 h-5" />
                    <span className="text-xs font-bold">Both (Responsive)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROJECT ARCHETYPE */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#111827]">Step 3: Project Archetype</h4>
                <p className="text-xs text-[#71717A]">
                  Select the website category to contextualize REVO's judging heuristics and Design DNA evaluation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {projectTypes.map((pt) => {
                  const isSelected = projectType === pt.id;
                  return (
                    <button
                      type="button"
                      key={pt.id}
                      onClick={() => setProjectType(pt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#111827] bg-[#FAFAFA] ring-2 ring-[#111827]/10'
                          : 'border-[#E4E4E7] hover:border-[#A1A1AA] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#111827]">{pt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#111827]" />}
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-1 line-clamp-2 leading-relaxed">{pt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: EVALUATION FOCUS & SUMMARY */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#111827]">Step 4: Evaluation Focus & Launch</h4>
                <p className="text-xs text-[#71717A]">
                  Configure evaluation strictness and review your project specifications before launching analysis.
                </p>
              </div>

              {/* Evaluation Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Evaluation Strictness
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEvaluationMode('strict')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      evaluationMode === 'strict'
                        ? 'border-[#111827] bg-[#FAFAFA] ring-2 ring-[#111827]/10'
                        : 'border-[#E4E4E7] bg-white'
                    }`}
                  >
                    <p className="font-bold text-xs text-[#111827]">Strict Award</p>
                    <p className="text-[10px] text-[#71717A] mt-0.5">High design standards (Awwwards/FWA level)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvaluationMode('balanced')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      evaluationMode === 'balanced'
                        ? 'border-[#1D63ED] bg-blue-50/40 ring-2 ring-[#1D63ED]/20'
                        : 'border-[#E4E4E7] bg-white'
                    }`}
                  >
                    <p className="font-bold text-xs text-[#1D63ED]">Balanced</p>
                    <p className="text-[10px] text-[#71717A] mt-0.5">Standard commercial SaaS & product benchmark</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvaluationMode('creative')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      evaluationMode === 'creative'
                        ? 'border-[#111827] bg-[#FAFAFA] ring-2 ring-[#111827]/10'
                        : 'border-[#E4E4E7] bg-white'
                    }`}
                  >
                    <p className="font-bold text-xs text-[#111827]">Creative</p>
                    <p className="text-[10px] text-[#71717A] mt-0.5">Focus on innovation & visual distinctiveness</p>
                  </button>
                </div>
              </div>

              {/* Optional Custom Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111827]">
                  Custom Evaluation Focus / Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pay special attention to hero typography pairing and CTA contrast."
                  className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#111827] h-16 resize-none"
                />
              </div>

              {/* Summary Card */}
              <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2 text-xs">
                  <span className="text-[#71717A]">Project:</span>
                  <span className="font-bold text-[#111827]">{name || 'Untitled Project'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2 text-xs">
                  <span className="text-[#71717A]">URL:</span>
                  <span className="font-mono text-[#111827]">{url || 'No URL specified'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#71717A]">Archetype:</span>
                  <span className="font-semibold text-[#111827] uppercase tracking-wider text-[10px]">
                    {projectTypes.find((p) => p.id === projectType)?.label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* WIZARD FOOTER CONTROLS */}
        <div className="p-4 border-t border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:bg-[#E4E4E7] rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:bg-[#E4E4E7] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={(currentStep === 1 && !name.trim()) || (currentStep === 2 && !url.trim())}
                className="px-5 py-2.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-2.5 bg-[#1D63ED] hover:bg-[#154EC1] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center space-x-2 shadow-sm active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Launch REVO Analysis</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
