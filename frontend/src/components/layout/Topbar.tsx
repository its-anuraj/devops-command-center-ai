import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { EnvironmentType } from '../../context/AppContext';
import { Button } from '../common/Button';

export const Topbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const {
    environment,
    setEnvironment,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    triggerMockIncident
  } = useApp();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const routeTitles: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Overview Dashboard', subtitle: 'Live Multi-Agent Operations & Cluster Health' },
    '/incidents': { title: 'Incident Command', subtitle: 'Autonomous SRE Investigation & Triage' },
    '/agents': { title: 'AI DevOps Agents', subtitle: 'Switch Protocol Swarm & Tool Assignments' },
    '/logs': { title: 'Live Log Stream', subtitle: 'Correlated Cluster Telemetry & Anomaly Traces' },
    '/deployments': { title: 'Deployments & Rollouts', subtitle: 'Release Health, Canaries & Rollback History' },
    '/approvals': { title: 'Action Approvals', subtitle: 'Human-in-the-Loop Safe Governance' },
    '/workflows': { title: 'Incident Workflows', subtitle: 'End-to-End Autonomous Pipeline Execution' },
    '/settings': { title: 'Platform Settings', subtitle: 'Switch Bridge & Collaboration Configuration' }
  };

  const currentMeta = routeTitles[location.pathname] || {
    title: 'Command Center',
    subtitle: 'DevOps AI Platform'
  };

  const envLabels: Record<EnvironmentType, { label: string; color: string; region: string }> = {
    production: { label: 'Production', color: 'emerald', region: 'us-east-1' },
    staging: { label: 'Staging', color: 'amber', region: 'us-east-2' },
    development: { label: 'Development', color: 'blue', region: 'local' }
  };

  return (
    <header className="h-16 bg-[#0c0e14] border-b border-[#1a1f2c] px-6 flex items-center justify-between z-30 shrink-0">
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#181d28]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">{currentMeta.subtitle}</p>
        </div>
      </div>

      {/* Center/Right Action Bar */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search incidents, pods, agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12151e] border border-[#202636] focus:border-indigo-500 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Environment Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowEnvDropdown(!showEnvDropdown)}
            className="flex items-center gap-2 bg-[#12151e] border border-[#202636] hover:border-[#2d364c] text-xs font-medium text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            title="Demo environment scope (connected to local Switch Gateway)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  environment === 'production'
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : environment === 'staging'
                    ? 'bg-amber-400'
                    : 'bg-sky-400'
                }`}
              />
              <span className="capitalize">Demo: {environment}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              [{envLabels[environment].region}]
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showEnvDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#11141c] border border-[#232938] rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#1b212f]">
                Demo Environment Scope
              </div>
              <div className="px-3 py-1 text-[10px] text-slate-500">
                Connected to local Switch instance
              </div>
              {(['production', 'staging', 'development'] as EnvironmentType[]).map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    setEnvironment(env);
                    setShowEnvDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1a202d] transition-colors ${
                    environment === env ? 'text-indigo-400 font-medium' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 capitalize">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        env === 'production'
                          ? 'bg-emerald-400'
                          : env === 'staging'
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                    />
                    {env}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {envLabels[env].region}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Simulate Action / Demo button */}
        <Button
          variant="secondary"
          size="sm"
          icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
          onClick={triggerMockIncident}
          className="hidden sm:inline-flex"
        >
          [Demo] Simulate Alert
        </Button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#12151e] border border-[#202636] hover:border-[#2d364c] text-slate-400 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#11141c] border border-[#232938] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#1d2331] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">System Notifications</span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#181d28]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs hover:bg-[#161a25] transition-colors ${
                      !n.read ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.type === 'incident' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : n.type === 'approval' ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-200 flex items-center justify-between">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative pl-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-violet-600 flex items-center justify-center text-xs font-bold text-white border border-indigo-500/50 shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-500/40 transition-all focus:outline-none"
            title={user?.email || 'Switch User'}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email ? user.email.slice(0, 2).toUpperCase() : 'SW'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0e111a] border border-[#1e2334] shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#1a1f2e]">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || user?.email || 'Switch Operator'}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email || 'admin@switch.local'}
                </div>
                <div className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    void logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
