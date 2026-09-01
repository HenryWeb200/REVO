import React, { useState } from 'react';
import { X, User, Building2, Check, Sparkles, ArrowRight } from 'lucide-react';

interface CreateEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEnvironment: (env: { name: string; type: 'personal' | 'company'; membersCount?: number }) => void;
}

export const CreateEnvironmentModal: React.FC<CreateEnvironmentModalProps> = ({
  isOpen,
  onClose,
  onCreateEnvironment,
}) => {
  const [envName, setEnvName] = useState('');
  const [envType, setEnvType] = useState<'personal' | 'company'>('company');
  const [companySize, setCompanySize] = useState('1-10 members');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = envName.trim() || (envType === 'personal' ? "My Personal Environment" : 'New Studio');
    onCreateEnvironment({
      name: finalName,
      type: envType,
      membersCount: envType === 'company' ? 4 : 1,
    });
    setEnvName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in duration-200">
        <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h3 className="font-extrabold text-lg text-[#111827]">Create New Environment</h3>
            <p className="text-xs text-[#71717A]">
              Environments organize your projects, team collaboration, and REVO analysis history.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Environment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEnvType('personal');
                  if (!envName || envName === 'New Studio') setEnvName("Henry's Personal Environment");
                }}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 cursor-pointer transition-all ${
                  envType === 'personal'
                    ? 'border-[#1D63ED] bg-blue-50/40 ring-2 ring-[#1D63ED]/20'
                    : 'border-[#E4E4E7] hover:border-[#A1A1AA] bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <User className={`w-5 h-5 ${envType === 'personal' ? 'text-[#1D63ED]' : 'text-[#71717A]'}`} />
                  {envType === 'personal' && <Check className="w-4 h-4 text-[#1D63ED]" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Personal</h4>
                  <p className="text-[11px] text-[#71717A] mt-0.5">For individual work, private projects, and quick evaluation.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEnvType('company');
                  if (!envName || envName.includes('Personal')) setEnvName('Acme Studio');
                }}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 cursor-pointer transition-all ${
                  envType === 'company'
                    ? 'border-[#111827] bg-[#FAFAFA] ring-2 ring-[#111827]/10'
                    : 'border-[#E4E4E7] hover:border-[#A1A1AA] bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Building2 className={`w-5 h-5 ${envType === 'company' ? 'text-[#111827]' : 'text-[#71717A]'}`} />
                  {envType === 'company' && <Check className="w-4 h-4 text-[#111827]" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Company / Team</h4>
                  <p className="text-[11px] text-[#71717A] mt-0.5">For collaborative design reviews, team roles, and shared projects.</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111827]">Environment Name</label>
            <input
              type="text"
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              placeholder={envType === 'personal' ? "e.g. Henry's Personal Workspace" : 'e.g. Acme Design Studio'}
              className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#111827]"
              required
            />
          </div>

          {envType === 'company' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111827]">Estimated Team Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827]"
              >
                <option value="1-5 members">1 - 5 members</option>
                <option value="6-20 members">6 - 20 members</option>
                <option value="21-50 members">21 - 50 members</option>
                <option value="50+ members">50+ Enterprise members</option>
              </select>
            </div>
          )}

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
              className="px-5 py-2.5 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              <span>Create Environment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
