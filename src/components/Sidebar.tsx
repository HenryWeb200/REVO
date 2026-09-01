import React, { useState } from 'react';
import {
  PlusCircle,
  Home,
  FolderKanban,
  History,
  ChevronDown,
  Bell,
  Settings,
  User,
  Zap,
  Sparkles,
  Layers,
  X,
  Check,
  Building2,
  Shield,
  CreditCard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  currentGlobalView: 'home' | 'projects' | 'recent' | 'project';
  onNavigateGlobal: (view: 'home' | 'projects' | 'recent') => void;
  onNewAnalysis: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: (tab?: string) => void;
  credits: { used: number; total: number };
  recentCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeEnvironment: 'personal' | 'company';
  onSwitchEnvironment: (env: 'personal' | 'company') => void;
  unreadCount: number;
  user: { name: string; email: string; avatar: string; role: string };
  onSignOut: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentGlobalView,
  onNavigateGlobal,
  onNewAnalysis,
  onOpenNotifications,
  onOpenSettings,
  credits,
  recentCount,
  isOpenMobile,
  onCloseMobile,
  activeEnvironment,
  onSwitchEnvironment,
  unreadCount,
  user,
  onSignOut,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const remainingCredits = Math.max(0, credits.total - credits.used);

  // Full Expanded Sidebar Content
  const expandedSidebar = (
    <div className="flex flex-col h-full bg-white text-[#111827] border-r border-[#E4E4E7] w-[260px] select-none shadow-2xs">
      {/* 1. REVO HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-[#E4E4E7]">
        <div
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={() => onNavigateGlobal('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center text-white font-extrabold text-sm font-display tracking-tight shadow-xs">
            RV
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base text-[#111827] tracking-tight flex items-center space-x-1">
              <span>REVO</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F4F4F5] text-[#52525B] font-bold">
                V3
              </span>
            </span>
            <span className="text-[11px] text-[#71717A]">Design Workspace</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#111827] hover:bg-[#F4F4F5] transition-colors cursor-pointer hidden md:flex items-center justify-center"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#111827] hover:bg-[#F4F4F5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. PRIMARY ACTION */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewAnalysis();
            if (isOpenMobile) onCloseMobile();
          }}
          className="w-full py-2.5 px-3.5 bg-[#1D63ED] hover:bg-[#154EC1] text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* 3. PRIMARY NAVIGATION */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => {
            onNavigateGlobal('home');
            if (isOpenMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            currentGlobalView === 'home'
              ? 'bg-[#1D63ED]/10 text-[#1D63ED]'
              : 'hover:bg-[#F4F4F5] text-[#52525B] hover:text-[#111827]'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Home className="w-4 h-4" />
            <span>Overview</span>
          </div>
        </button>

        <button
          onClick={() => {
            onNavigateGlobal('projects');
            if (isOpenMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            currentGlobalView === 'projects'
              ? 'bg-[#1D63ED]/10 text-[#1D63ED]'
              : 'hover:bg-[#F4F4F5] text-[#52525B] hover:text-[#111827]'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <FolderKanban className="w-4 h-4" />
            <span>Projects</span>
          </div>
        </button>

        <button
          onClick={() => {
            onNavigateGlobal('recent');
            if (isOpenMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            currentGlobalView === 'recent'
              ? 'bg-[#1D63ED]/10 text-[#1D63ED]'
              : 'hover:bg-[#F4F4F5] text-[#52525B] hover:text-[#111827]'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <History className="w-4 h-4" />
            <span>Recent</span>
          </div>
          {recentCount > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F4F4F5] text-[#71717A]">
              {recentCount}
            </span>
          )}
        </button>
      </div>

      {/* 4. CURRENT ENVIRONMENT */}
      <div className="px-3 py-3 border-t border-[#E4E4E7] my-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] px-3 block mb-1.5">
          Current Environment
        </span>
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] hover:bg-[#F4F4F5] text-[#111827] transition-colors cursor-pointer border border-[#E4E4E7]"
          >
            <div className="flex items-center space-x-2 truncate">
              {activeEnvironment === 'personal' ? (
                <User className="w-3.5 h-3.5 text-[#1D63ED]" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-[#111827]" />
              )}
              <span className="truncate">
                {activeEnvironment === 'personal' ? "Henry's Environment" : 'Acme Studio'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-xl shadow-xl z-30 p-1 space-y-0.5">
              <button
                onClick={() => {
                  onSwitchEnvironment('personal');
                  setIsWorkspaceMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left hover:bg-[#F4F4F5] cursor-pointer text-[#111827]"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-[#1D63ED]" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Henry's Environment</span>
                    <span className="text-[10px] text-[#71717A]">Personal Workspace</span>
                  </div>
                </div>
                {activeEnvironment === 'personal' && <Check className="w-3.5 h-3.5 text-[#1D63ED]" />}
              </button>

              <button
                onClick={() => {
                  onSwitchEnvironment('company');
                  setIsWorkspaceMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left hover:bg-[#F4F4F5] cursor-pointer text-[#111827]"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-[#111827]" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Acme Studio</span>
                    <span className="text-[10px] text-[#71717A]">Company Environment &bull; 6 Members</span>
                  </div>
                </div>
                {activeEnvironment === 'company' && <Check className="w-3.5 h-3.5 text-[#1D63ED]" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* 5. BOTTOM SECTION (CREDITS, NOTIFICATIONS, SETTINGS, USER PROFILE) */}
      <div className="p-3 border-t border-[#E4E4E7] space-y-3">
        {/* Credits / Usage Indicator */}
        <div
          onClick={() => onOpenSettings('usage')}
          className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1.5 cursor-pointer hover:border-[#D4D4D8] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#71717A] flex items-center space-x-1.5">
              <Zap className="w-3 h-3 text-[#111827]" />
              <span>Credits</span>
            </span>
            <span className="font-mono text-[#111827] font-bold">
              {remainingCredits} / {credits.total}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#E4E4E7] overflow-hidden">
            <div
              className="h-full bg-[#111827] rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, (remainingCredits / credits.total) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-[#71717A]">{remainingCredits} credits remaining</p>
        </div>

        {/* Action Row: Notifications & Settings */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenNotifications}
            className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F4F4F5] text-xs font-semibold text-[#111827] transition-colors cursor-pointer border border-[#E4E4E7] relative"
          >
            <Bell className="w-3.5 h-3.5 text-[#52525B]" />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#1D63ED] absolute top-1.5 right-2" />
            )}
          </button>

          <button
            onClick={() => onOpenSettings()}
            className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F4F4F5] text-xs font-semibold text-[#111827] transition-colors cursor-pointer border border-[#E4E4E7]"
          >
            <Settings className="w-3.5 h-3.5 text-[#52525B]" />
            <span>Settings</span>
          </button>
        </div>

        {/* User Account Area */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F4F5] transition-colors cursor-pointer border border-transparent hover:border-[#E4E4E7]"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-bold font-mono">
                {user.avatar || user.name.slice(0, 1)}
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="text-xs font-bold text-[#111827] truncate">{user.name}</span>
                <span className="text-[10px] text-[#71717A] truncate">{user.email}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-[#E4E4E7] rounded-xl shadow-2xl z-40 p-1.5 space-y-1">
              <div className="px-3 py-2 border-b border-[#E4E4E7] space-y-0.5">
                <p className="text-xs font-bold text-[#111827]">{user.name}</p>
                <p className="text-[10px] text-[#71717A]">{user.role} &bull; Pro Environment</p>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenSettings('account');
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-[#111827] hover:bg-[#F4F4F5] text-left cursor-pointer font-medium"
              >
                <User className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenSettings('usage');
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-[#111827] hover:bg-[#F4F4F5] text-left cursor-pointer font-medium"
              >
                <Zap className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Usage</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenSettings('plan');
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-[#111827] hover:bg-[#F4F4F5] text-left cursor-pointer font-medium"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Billing</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenSettings('analysis_preferences');
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-[#111827] hover:bg-[#F4F4F5] text-left cursor-pointer font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Settings</span>
              </button>

              <div className="border-t border-[#E4E4E7] pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#FEF2F2] text-left cursor-pointer font-bold"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Compact Collapsed Sidebar Content (Icon-Only Mode)
  const collapsedSidebar = (
    <div className="flex flex-col h-full bg-white text-[#111827] border-r border-[#E4E4E7] w-[68px] items-center py-4 select-none shadow-2xs">
      {/* 1. Header Logo & Expand Button */}
      <div className="flex flex-col items-center space-y-3 pb-3 border-b border-[#E4E4E7] w-full">
        <div
          onClick={() => onNavigateGlobal('home')}
          className="w-9 h-9 rounded-xl bg-[#111827] text-white flex items-center justify-center font-extrabold text-sm font-display cursor-pointer shadow-xs hover:scale-105 transition-transform"
          title="REVO V3 Home"
        >
          RV
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#111827] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. New Analysis Compact Button */}
      <div className="my-3">
        <button
          onClick={onNewAnalysis}
          title="New Analysis"
          className="w-10 h-10 rounded-xl bg-[#1D63ED] hover:bg-[#154EC1] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 3. Primary Nav Icons */}
      <div className="space-y-2 w-full px-2">
        <button
          onClick={() => onNavigateGlobal('home')}
          title="Overview"
          className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            currentGlobalView === 'home'
              ? 'bg-[#1D63ED]/10 text-[#1D63ED]'
              : 'hover:bg-[#F4F4F5] text-[#52525B]'
          }`}
        >
          <Home className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigateGlobal('projects')}
          title="Projects"
          className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            currentGlobalView === 'projects'
              ? 'bg-[#1D63ED]/10 text-[#1D63ED]'
              : 'hover:bg-[#F4F4F5] text-[#52525B]'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigateGlobal('recent')}
          title="Recent History"
          className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center relative transition-colors cursor-pointer ${
            currentGlobalView === 'recent'
              ? 'bg-[#1D63ED]/10 text-[#1D63ED]'
              : 'hover:bg-[#F4F4F5] text-[#52525B]'
          }`}
        >
          <History className="w-4 h-4" />
          {recentCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#111827] absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* 4. Environment Quick Toggle Icon */}
      <div className="my-3 pt-3 border-t border-[#E4E4E7] w-full px-2">
        <button
          onClick={() => onSwitchEnvironment(activeEnvironment === 'personal' ? 'company' : 'personal')}
          title={`Active: ${activeEnvironment === 'personal' ? "Henry's Environment" : 'Acme Studio'}. Click to switch.`}
          className="w-10 h-10 mx-auto rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center hover:bg-[#F4F4F5] cursor-pointer transition-colors"
        >
          {activeEnvironment === 'personal' ? (
            <User className="w-4 h-4 text-[#1D63ED]" />
          ) : (
            <Building2 className="w-4 h-4 text-[#111827]" />
          )}
        </button>
      </div>

      <div className="flex-1" />

      {/* 5. Bottom Quick Actions */}
      <div className="space-y-2 w-full px-2 pt-3 border-t border-[#E4E4E7]">
        <button
          onClick={() => onOpenSettings('usage')}
          title={`Credits: ${remainingCredits}/${credits.total}`}
          className="w-10 h-10 mx-auto rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center hover:bg-[#F4F4F5] cursor-pointer"
        >
          <Zap className="w-4 h-4 text-[#111827]" />
        </button>

        <button
          onClick={onOpenNotifications}
          title="Notifications"
          className="w-10 h-10 mx-auto rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center hover:bg-[#F4F4F5] cursor-pointer relative"
        >
          <Bell className="w-4 h-4 text-[#52525B]" />
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#1D63ED] absolute top-2 right-2" />
          )}
        </button>

        <button
          onClick={() => onOpenSettings()}
          title="Settings"
          className="w-10 h-10 mx-auto rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center hover:bg-[#F4F4F5] cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#52525B]" />
        </button>

        <button
          onClick={() => onOpenSettings('account')}
          title={user.name}
          className="w-9 h-9 mx-auto rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-bold font-mono cursor-pointer hover:scale-105 transition-transform"
        >
          {user.avatar || user.name.slice(0, 1)}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 shrink-0 z-20">
        {isCollapsed ? collapsedSidebar : expandedSidebar}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">
            {expandedSidebar}
          </div>
        </div>
      )}
    </>
  );
};

