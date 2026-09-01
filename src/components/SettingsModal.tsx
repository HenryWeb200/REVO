import React, { useState } from 'react';
import {
  X,
  User,
  Sliders,
  Bell,
  Building2,
  Zap,
  CreditCard,
  Shield,
  Check,
  Globe,
  HelpCircle,
  Plus,
  Mail,
  UserPlus,
  Download,
  Key,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name: string; email: string; avatar: string; role: string };
  onUpdateUser?: (updated: { name: string; email: string; avatar: string; role: string }) => void;
  initialTab?: string;
}

type SettingsTab =
  | 'account'
  | 'preferences'
  | 'analysis_preferences'
  | 'notifications'
  | 'workspace'
  | 'usage'
  | 'plan'
  | 'security';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user = { name: 'Henry Inyamah', email: 'henry@revo.dev', avatar: 'H', role: 'Workspace Owner' },
  onUpdateUser,
  initialTab = 'analysis_preferences',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    (initialTab as SettingsTab) || 'analysis_preferences'
  );
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [roleInput, setRoleInput] = useState(user.role);

  // Analysis preferences
  const [defaultProjectType, setDefaultProjectType] = useState('saas');
  const [strictness, setStrictness] = useState<'strict' | 'balanced' | 'creative'>('strict');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [customRules, setCustomRules] = useState('');

  // App preferences
  const [defaultView, setDefaultView] = useState<'home' | 'projects'>('home');
  const [enableCmdK, setEnableCmdK] = useState(true);

  // Notifications
  const [emailCompleted, setEmailCompleted] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [workspaceJoinAlerts, setWorkspaceJoinAlerts] = useState(true);

  // Workspace
  const [workspaceName, setWorkspaceName] = useState('Acme Studio');
  const [members, setMembers] = useState([
    { id: '1', name: user.name, email: user.email, role: 'Owner' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Admin' },
    { id: '3', name: 'Marcus Vance', email: 'marcus@acme.com', role: 'Lead Designer' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Designer');
  const [joinRequests, setJoinRequests] = useState([
    { id: 'req_1', name: 'Alex Rivera', email: 'alex@acme.com', requestedAt: '2 hours ago' },
  ]);

  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  if (!isOpen) return null;

  const showSaveSuccess = (message: string) => {
    setSavedBanner(message);
    setTimeout(() => setSavedBanner(null), 3000);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ name: nameInput, email: emailInput, avatar: nameInput.slice(0, 1), role: roleInput });
    }
    showSaveSuccess('Account profile updated successfully');
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setMembers([
      ...members,
      { id: Date.now().toString(), name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole },
    ]);
    setInviteEmail('');
    showSaveSuccess(`Invitation sent to ${inviteEmail}`);
  };

  const handleAcceptJoinRequest = (reqId: string) => {
    const req = joinRequests.find((r) => r.id === reqId);
    if (req) {
      setMembers([...members, { id: req.id, name: req.name, email: req.email, role: 'Member' }]);
      setJoinRequests(joinRequests.filter((r) => r.id !== reqId));
      showSaveSuccess(`${req.name} added to workspace`);
    }
  };

  const handleDeclineJoinRequest = (reqId: string) => {
    setJoinRequests(joinRequests.filter((r) => r.id !== reqId));
  };

  const projectTypes = [
    { id: 'saas', name: 'SaaS Application', desc: 'Focus on onboarding clarity, feature hierarchy, and conversion paths.' },
    { id: 'portfolio', name: 'Personal Portfolio', desc: 'Prioritize distinctiveness, typographic craft, and creative identity.' },
    { id: 'agency', name: 'Design / Creative Agency', desc: 'Evaluate high-end art direction, visual polish, and case studies.' },
    { id: 'ecommerce', name: 'E-Commerce Store', desc: 'Focus on product grid clarity, checkout friction, and trust markers.' },
    { id: 'developer_tool', name: 'Developer Tool / Docs', desc: 'Prioritize code readability, terminal UX, and rapid navigation.' },
    { id: 'marketing', name: 'Marketing Landing Page', desc: 'Focus on headline impact, social proof, and primary CTA contrast.' },
    { id: 'editorial', name: 'Editorial / Magazine', desc: 'Focus on reading rhythm, article layout, and typographic scales.' },
    { id: 'experimental', name: 'Experimental Web Art', desc: 'Reward bold interaction innovations and non-standard visual concepts.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[88vh]">
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 bg-[#FAFAFA] border-b md:border-b-0 md:border-r border-[#E4E4E7] p-4 space-y-1 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 md:pb-4 border-b border-[#E4E4E7] mb-2">
            <h3 className="font-bold text-base text-[#111827]">Settings</h3>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg text-[#71717A] hover:bg-[#E4E4E7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'account'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis_preferences')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'analysis_preferences'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Analysis Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>App Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'usage'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Usage & Credits</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Plan & Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#111827] text-white'
                : 'text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111827]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="hidden md:flex items-center justify-between pb-4 border-b border-[#E4E4E7]">
            <div>
              <h2 className="text-lg font-extrabold text-[#111827] capitalize">
                {activeTab.replace('_', ' ')}
              </h2>
              <p className="text-xs text-[#71717A]">Configure your REVO environment and rules</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111827] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {savedBanner && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{savedBanner}</span>
            </div>
          )}

          {/* TAB 1: ACCOUNT PROFILE */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-6">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                <div className="w-12 h-12 rounded-full bg-[#111827] text-white font-extrabold text-lg flex items-center justify-center font-mono">
                  {nameInput ? nameInput.slice(0, 1) : 'H'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">{nameInput || 'Henry Inyamah'}</h4>
                  <p className="text-xs text-[#71717A]">{emailInput || 'henry@revo.dev'}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#1D63ED] font-bold">
                    {roleInput || 'Workspace Owner'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111827]">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#111827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111827]">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#111827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111827]">Role Title</label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#111827]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ANALYSIS PREFERENCES */}
          {activeTab === 'analysis_preferences' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#111827]">
                  <HelpCircle className="w-4 h-4 text-[#1D63ED]" />
                  <span>How Analysis Context Works</span>
                </div>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  REVO adapts its reasoning engine based on target category. For instance, developer tool documentation pages are judged on code readability and DOM density, while experimental sites are judged on distinctiveness and visual hierarchy.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Default Target Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectTypes.map((type) => {
                    const isSelected = defaultProjectType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setDefaultProjectType(type.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                          isSelected
                            ? 'bg-white border-[#111827] ring-1 ring-[#111827] shadow-xs'
                            : 'bg-[#FAFAFA] border-[#E4E4E7] hover:border-[#D4D4D8]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#111827]">{type.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#111827]" />}
                        </div>
                        <p className="text-[11px] text-[#71717A] leading-normal">{type.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                    Diagnostic Strictness
                  </label>
                  <select
                    value={strictness}
                    onChange={(e) => setStrictness(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827]"
                  >
                    <option value="strict">Strict (High-Bar Design Review)</option>
                    <option value="balanced">Balanced (Standard SaaS Review)</option>
                    <option value="creative">Creative (Focus on Innovation)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                    Default Viewport Capture
                  </label>
                  <select
                    value={viewport}
                    onChange={(e) => setViewport(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827]"
                  >
                    <option value="desktop">Desktop (1440 x 900px)</option>
                    <option value="mobile">Mobile (375 x 812px)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Custom Evaluation Rules
                </label>
                <textarea
                  rows={3}
                  value={customRules}
                  onChange={(e) => setCustomRules(e.target.value)}
                  placeholder="e.g. Always evaluate dark mode contrast accessibility strictly, or check if the hero font uses Inter..."
                  className="w-full p-3 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] placeholder-[#A1A1AA] focus:ring-2 focus:ring-[#111827]"
                />
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
                <button
                  onClick={() => showSaveSuccess('Analysis preferences saved')}
                  className="px-5 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
                >
                  Save Analysis Rules
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: APP PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#111827]">Interface Theme</h4>
                      <p className="text-[11px] text-[#71717A]">
                        REVO V3 uses a high-contrast white layout for visual clarity
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#111827] text-white text-[10px] font-bold">
                      Light Canvas Default
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#111827]">Default Workspace View</h4>
                    <p className="text-[11px] text-[#71717A]">Initial screen when launching REVO</p>
                  </div>
                  <select
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value as any)}
                    className="p-2 bg-white border border-[#E4E4E7] rounded-lg text-xs text-[#111827]"
                  >
                    <option value="home">Overview Landing</option>
                    <option value="projects">Projects Container</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#111827]">Command Palette (⌘K)</h4>
                    <p className="text-[11px] text-[#71717A]">Enable global quick navigation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCmdK}
                    onChange={(e) => setEnableCmdK(e.target.checked)}
                    className="w-4 h-4 accent-[#111827] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
                <button
                  onClick={() => showSaveSuccess('App preferences saved')}
                  className="px-5 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
                >
                  Save App Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                  Email Notifications
                </span>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#111827]">Analysis Completion Alerts</h4>
                    <p className="text-[11px] text-[#71717A]">
                      Send email when website evaluation & Design DNA extraction completes
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailCompleted}
                    onChange={(e) => setEmailCompleted(e.target.checked)}
                    className="w-4 h-4 accent-[#111827] cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#111827]">Weekly Workspace Digest</h4>
                    <p className="text-[11px] text-[#71717A]">
                      Summary of score updates and design drift across saved projects
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="w-4 h-4 accent-[#111827] cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#111827]">Security & Login Notifications</h4>
                    <p className="text-[11px] text-[#71717A]">
                      Alert on new device sessions or environment setting modifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailSecurity}
                    onChange={(e) => setEmailSecurity(e.target.checked)}
                    className="w-4 h-4 accent-[#111827] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                  Workspace Alerts
                </span>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#111827]">Team Join Requests</h4>
                    <p className="text-[11px] text-[#71717A]">
                      Notify when team members request access to Acme Studio
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={workspaceJoinAlerts}
                    onChange={(e) => setWorkspaceJoinAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#111827] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
                <button
                  onClick={() => showSaveSuccess('Notification preferences saved')}
                  className="px-5 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
                >
                  Save Rules
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: WORKSPACE & MEMBERS */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Environment Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827] font-semibold"
                  />
                  <div className="p-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#71717A] font-mono flex items-center justify-between">
                    <span>Plan: Pro Company Environment</span>
                    <span className="text-[#1D63ED] font-bold">Active</span>
                  </div>
                </div>
              </div>

              {/* Pending Join Requests */}
              {joinRequests.length > 0 && (
                <div className="space-y-2 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="text-xs font-bold text-amber-900 block">
                    Pending Join Requests ({joinRequests.length})
                  </span>
                  {joinRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#111827]">{req.name}</p>
                        <p className="text-[10px] text-[#71717A]">{req.email} &bull; {req.requestedAt}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAcceptJoinRequest(req.id)}
                          className="px-3 py-1 bg-[#111827] text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineJoinRequest(req.id)}
                          className="px-2.5 py-1 text-[#71717A] hover:text-[#EF4444] text-[11px] font-medium cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invite Member */}
              <form onSubmit={handleInviteMember} className="space-y-2">
                <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                  Invite Teammate
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@acme.com"
                    className="flex-1 p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827]"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827]"
                  >
                    <option value="Designer">Designer</option>
                    <option value="Developer">Developer</option>
                    <option value="Admin">Admin</option>
                    <option value="Reviewer">Reviewer</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer inline-flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Send Invite</span>
                  </button>
                </div>
              </form>

              {/* Members List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                  Active Team Members ({members.length})
                </span>
                <div className="border border-[#E4E4E7] rounded-xl overflow-hidden divide-y divide-[#F4F4F5]">
                  {members.map((m) => (
                    <div key={m.id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-[11px]">
                          {m.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827]">{m.name}</p>
                          <p className="text-[10px] text-[#71717A]">{m.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-[#F4F4F5] text-[#52525B] font-mono text-[10px] font-bold">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USAGE & CREDITS */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#71717A]">
                      Monthly Allocation
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#111827] font-mono">
                      72 / 100 Credits Remaining
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Cycle Resets Sept 30
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#E4E4E7] overflow-hidden">
                  <div className="h-full bg-[#111827] rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                  Usage Breakdown By Activity
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white border border-[#E4E4E7] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">DOM Captures</span>
                    <p className="text-lg font-bold font-mono text-[#111827]">18 Runs</p>
                    <p className="text-[10px] text-[#71717A]">18 credits consumed</p>
                  </div>
                  <div className="p-3.5 bg-white border border-[#E4E4E7] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Copilot Q&A</span>
                    <p className="text-lg font-bold font-mono text-[#111827]">24 Queries</p>
                    <p className="text-[10px] text-[#71717A]">6 credits consumed</p>
                  </div>
                  <div className="p-3.5 bg-white border border-[#E4E4E7] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">AI Design Prompts</span>
                    <p className="text-lg font-bold font-mono text-[#111827]">12 Exports</p>
                    <p className="text-[10px] text-[#71717A]">4 credits consumed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PLAN & BILLING */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#E4E4E7] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#1D63ED]">
                      Current Plan
                    </span>
                    <h3 className="text-xl font-bold text-[#111827]">Pro Workspace Tier</h3>
                    <p className="text-xs text-[#71717A]">$49 / month &bull; Renews Sept 30, 2026</p>
                  </div>
                  <button
                    onClick={() => showSaveSuccess('Subscription portal redirected')}
                    className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                  Recent Invoices
                </span>
                <div className="border border-[#E4E4E7] rounded-xl overflow-hidden divide-y divide-[#F4F4F5]">
                  <div className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#111827]">INV-2026-0815</p>
                      <p className="text-[10px] text-[#71717A]">Aug 15, 2026 &bull; $49.00</p>
                    </div>
                    <button className="p-1.5 rounded text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111827] cursor-pointer inline-flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px]">PDF</span>
                    </button>
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#111827]">INV-2026-0715</p>
                      <p className="text-[10px] text-[#71717A]">Jul 15, 2026 &bull; $49.00</p>
                    </div>
                    <button className="p-1.5 rounded text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111827] cursor-pointer inline-flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px]">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                  Password & Authentication
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#111827]">Current Password</label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#111827]">New Password</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111827]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setCurrentPass('');
                      setNewPass('');
                      showSaveSuccess('Password updated successfully');
                    }}
                    className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#111827]">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[11px] text-[#71717A]">Enforce time-based OTP for team logins</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => {
                    setTwoFactor(e.target.checked);
                    showSaveSuccess(e.target.checked ? '2FA enabled' : '2FA disabled');
                  }}
                  className="w-4 h-4 accent-[#111827] cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

