import React, { useState, useEffect } from 'react';
import { StructuredAnalysisResponse, AnalysisState } from './types';

// REVO V3 Shell Components
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ProjectsView } from './components/ProjectsView';
import { RecentView } from './components/RecentView';
import { ProjectWorkspace, ProjectSubTab } from './components/ProjectWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ExportModal, ShareModal } from './components/ExportShareModals';
import { CreateEnvironmentModal } from './components/CreateEnvironmentModal';
import { CreateProjectWizardModal } from './components/CreateProjectWizardModal';

// Intelligence & Feature Drawers
import { AskRevoDrawer } from './components/AskRevoDrawer';
import { AiInstructionModal } from './components/AiInstructionModal';
import { BeforeAfterCompareView } from './components/BeforeAfterCompareView';

// History Storage Utilities
import {
  getHistory,
  saveToHistory,
  deleteFromHistory,
  clearAllHistory,
} from './lib/historyStorage';

type GlobalView = 'home' | 'projects' | 'recent' | 'project';

export default function App() {
  // Navigation & Sidebar State
  const [currentGlobalView, setCurrentGlobalView] = useState<GlobalView>('home');
  const [activeProject, setActiveProject] = useState<StructuredAnalysisResponse | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Environment & Account State
  const [activeEnvironment, setActiveEnvironment] = useState<string>('');
  const [environments, setEnvironments] = useState<
    Array<{ id: string; name: string; type: 'personal' | 'company' }>
  >([]);

  const [user, setUser] = useState({
    name: 'Henry Inyamah',
    email: 'henry@revo.dev',
    avatar: 'H',
    role: 'Workspace Owner',
  });

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Design DNA Extraction Complete',
      message: 'Linear app analysis extracted 92/100 score with 4 key typographic opportunities.',
      timestamp: '10 mins ago',
      isRead: false,
      type: 'analysis' as const,
    },
    {
      id: 'notif_2',
      title: 'Workspace Invite Request',
      message: 'Alex Rivera requested to join Acme Studio workspace.',
      timestamp: '2 hours ago',
      isRead: false,
      type: 'workspace' as const,
    },
    {
      id: 'notif_3',
      title: 'Weekly Quality Digest Ready',
      message: 'Your overall portfolio score increased by +3 points this week.',
      timestamp: '1 day ago',
      isRead: true,
      type: 'system' as const,
    },
  ]);

  // Analysis Pipeline State
  const [analysisState, setAnalysisState] = useState<AnalysisState>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<StructuredAnalysisResponse[]>([]);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  // Shell Drawers & Modals
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>('analysis_preferences');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCreateEnvOpen, setIsCreateEnvOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Feature Drawers & Modals
  const [isAskRevoOpen, setIsAskRevoOpen] = useState(false);
  const [isAiInstructionsOpen, setIsAiInstructionsOpen] = useState(false);

  // Usage Credits State (Prompt: 72 / 100 credits remaining)
  const [credits, setCredits] = useState({ used: 28, total: 100 });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenSettings = (tab?: string) => {
    if (tab) setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleSignOut = () => {
    alert('You have been signed out of your REVO workspace session.');
    setUser({
      name: 'Guest User',
      email: 'guest@revo.dev',
      avatar: 'G',
      role: 'Viewer',
    });
  };

  const handleCreateEnvironment = (env: { name: string; type: 'personal' | 'company'; membersCount?: number }) => {
    const newId = `env_${Date.now()}`;
    const newEnv = { id: newId, name: env.name, type: env.type };
    setEnvironments((prev) => [...prev, newEnv]);
    setActiveEnvironment(env.type);
    setIsCreateEnvOpen(false);
  };

  const handleCreateProject = (projectData: {
    name: string;
    url: string;
    projectType: string;
    environmentId: string;
  }) => {
    setIsCreateProjectOpen(false);
    handleAnalyze(projectData.url, projectData.projectType);
  };

  // Load history on mount & when trigger changes
  useEffect(() => {
    const list = getHistory();
    setHistory(list);
  }, [historyTrigger]);

  // Global ⌘K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveResultToHistory = (item: StructuredAnalysisResponse) => {
    const updated = saveToHistory(item);
    setHistory(updated);
    setHistoryTrigger((prev) => prev + 1);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteFromHistory(id);
    setHistory(updated);
    setHistoryTrigger((prev) => prev + 1);
    if (activeProject && activeProject.id === id) {
      setActiveProject(null);
      setCurrentGlobalView('home');
    }
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
    setHistoryTrigger((prev) => prev + 1);
    setActiveProject(null);
    setCurrentGlobalView('home');
  };

  const handleSelectProject = (project: StructuredAnalysisResponse) => {
    setActiveProject(project);
    setCurrentGlobalView('project');
  };

  const handleNewAnalysisTrigger = () => {
    setIsCreateProjectOpen(true);
  };

  // Main Analysis Pipeline Handler
  const handleAnalyze = async (url: string, websiteType: string = 'saas') => {
    const targetUrl = url.trim();
    if (!targetUrl || analysisState === 'VALIDATING' || analysisState === 'OBSERVING') return;

    setErrorMessage(null);
    setAnalysisState('VALIDATING');
    setStatusMessage('Validating target URI & Playwright browser setup...');

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => {
      controller.abort(new Error('Analysis timed out. Target website took too long to respond.'));
    }, 65000);

    const timer1 = setTimeout(() => {
      setAnalysisState('OBSERVING');
      setStatusMessage('Playwright capturing DOM, screenshot & CSS tokens...');
    }, 600);

    const timer2 = setTimeout(() => {
      setAnalysisState('MEASURING');
      setStatusMessage('Evaluating page metrics, typography & layout hierarchy...');
    }, 1600);

    const timer3 = setTimeout(() => {
      setAnalysisState('REASONING');
      setStatusMessage('Gemini 3.6 calculating Design DNA & root cause graphs...');
    }, 2800);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, websiteType }),
        signal: controller.signal,
      });

      clearTimeout(fetchTimeout);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!res.ok) {
        let msg = `Server responded with status ${res.status}`;
        try {
          const rawText = await res.text();
          try {
            const errData = JSON.parse(rawText);
            msg = errData.error || errData.message || msg;
          } catch {
            if (rawText && rawText.length < 300) msg = rawText;
          }
        } catch {}
        throw new Error(msg);
      }

      const resPayload = await res.json();
      const data: StructuredAnalysisResponse =
        resPayload && resPayload.data && resPayload.data.scores
          ? resPayload.data
          : resPayload;

      setAnalysisState('SYNTHESIZING');
      setStatusMessage('Structuring REVO V3 intelligence diagnosis package...');

      setTimeout(() => {
        data.siteType = websiteType;
        setActiveProject(data);
        handleSaveResultToHistory(data);
        setAnalysisState('COMPLETE');
        setStatusMessage('');
        setCurrentGlobalView('project');
        setCredits((prev) => ({ ...prev, used: Math.min(prev.total, prev.used + 10) }));
      }, 400);
    } catch (err: unknown) {
      clearTimeout(fetchTimeout);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setAnalysisState('ERROR');

      let displayMsg = 'Failed to evaluate website. Please check the URL and retry.';
      if (err instanceof Error) {
        const isAbort =
          err.name === 'AbortError' ||
          err.message.toLowerCase().includes('aborted') ||
          err.message.toLowerCase().includes('abort') ||
          err.message.toLowerCase().includes('signal') ||
          err.message.toLowerCase().includes('timed out');

        if (isAbort) {
          displayMsg = 'Analysis timed out. Target website took too long to respond.';
          console.warn('Analysis timed out:', err.message);
        } else {
          displayMsg = err.message;
          console.error('Analysis error:', err);
        }
      } else {
        console.error('Analysis error:', err);
      }
      setErrorMessage(displayMsg);
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-[#111827] font-sans overflow-hidden">
      {/* 1. REVO GLOBAL SIDEBAR */}
      <Sidebar
        currentGlobalView={currentGlobalView}
        onNavigateGlobal={(view) => {
          setCurrentGlobalView(view);
          if (view !== 'project') {
            // Keep active project preserved in state
          }
        }}
        onNewAnalysis={handleNewAnalysisTrigger}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={(tab) => handleOpenSettings(tab)}
        credits={credits}
        recentCount={history.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeEnvironment={activeEnvironment}
        onSwitchEnvironment={setActiveEnvironment}
        unreadCount={unreadCount}
        user={user}
        onSignOut={handleSignOut}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        hasEnvironments={environments.length > 0}
      />

      {/* 2. MAIN WORKSPACE CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <div className="md:hidden sticky top-0 z-20 bg-[#09090B] text-white px-4 py-3 flex items-center justify-between border-b border-[#27272A]">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-display font-extrabold text-sm tracking-tight flex items-center space-x-1.5">
            <span className="w-6 h-6 rounded bg-white text-[#09090B] flex items-center justify-center text-xs">RV</span>
            <span>REVO V3</span>
          </div>
          <button
            onClick={() => setIsCommandOpen(true)}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
          >
            <span className="text-xs font-mono font-bold">⌘K</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="m-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global View Router */}
        {currentGlobalView === 'home' && (
          <HomeView
            onAnalyze={handleAnalyze}
            isAnalyzing={analysisState === 'VALIDATING' || analysisState === 'OBSERVING' || analysisState === 'MEASURING' || analysisState === 'REASONING'}
            statusMessage={statusMessage}
            history={history}
            onSelectProject={handleSelectProject}
            onNavigateToProjects={() => setCurrentGlobalView('projects')}
            user={user}
            hasEnvironments={environments.length > 0}
            activeEnvironmentName={environments.find((e) => e.type === activeEnvironment || e.id === activeEnvironment)?.name || 'Acme Studio'}
            onCreateEnvironmentClick={() => setIsCreateEnvOpen(true)}
            onCreateProjectClick={() => setIsCreateProjectOpen(true)}
          />
        )}

        {currentGlobalView === 'projects' && (
          <ProjectsView
            projects={history}
            onSelectProject={handleSelectProject}
            onNewAnalysis={() => setIsCreateProjectOpen(true)}
            onDeleteProject={handleDeleteHistoryItem}
            onCompare={(p) => {
              setActiveProject(p);
              setCurrentGlobalView('project');
            }}
          />
        )}

        {currentGlobalView === 'recent' && (
          <RecentView
            history={history}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
          />
        )}

        {currentGlobalView === 'project' && activeProject && (
          <ProjectWorkspace
            project={activeProject}
            onBackToProjects={() => setCurrentGlobalView('projects')}
            onOpenAskRevo={() => setIsAskRevoOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenCommand={() => setIsCommandOpen(true)}
            onOpenAiInstructions={() => setIsAiInstructionsOpen(true)}
            onCompareTarget={(target) => {
              // Handle compare view
            }}
          />
        )}

        {currentGlobalView === 'project' && !activeProject && (
          <div className="p-12 text-center space-y-4 my-auto">
            <h3 className="text-lg font-bold text-[#111827]">No active project selected</h3>
            <button
              onClick={() => setCurrentGlobalView('home')}
              className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Return Home
            </button>
          </div>
        )}
      </div>

      {/* 3. MODALS & DRAWERS */}
      <CreateEnvironmentModal
        isOpen={isCreateEnvOpen}
        onClose={() => setIsCreateEnvOpen(false)}
        onCreateEnvironment={handleCreateEnvironment}
      />

      <CreateProjectWizardModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        activeEnvironment={activeEnvironment}
        environments={environments}
        onCreateProject={handleCreateProject}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={setUser}
        initialTab={settingsTab}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onMarkReadItem={handleMarkNotificationRead}
      />

      <CommandPaletteModal
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        projects={history}
        onSelectProject={handleSelectProject}
        onTriggerAction={(actionId) => {
          if (actionId === 'new_analysis') setIsCreateProjectOpen(true);
          if (actionId === 'ask_revo') setIsAskRevoOpen(true);
          if (actionId === 'export_report') setIsExportOpen(true);
          if (actionId === 'open_settings') setIsSettingsOpen(true);
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={activeProject}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        project={activeProject}
      />

      {activeProject && (
        <AskRevoDrawer
          isOpen={isAskRevoOpen}
          onClose={() => setIsAskRevoOpen(false)}
          analysis={activeProject}
        />
      )}

      {activeProject && activeProject.aiInstructions && (
        <AiInstructionModal
          isOpen={isAiInstructionsOpen}
          onClose={() => setIsAiInstructionsOpen(false)}
          instructions={activeProject.aiInstructions}
          siteName={activeProject.siteName}
        />
      )}
    </div>
  );
}
