import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  Terminal,
  GitCommit,
  CheckSquare,
  Workflow,
  Settings,
  Radio,
  Layers,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { approvals, incidents, switchStatus, agents } = useApp();
  const { user, logout } = useAuth();

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending' || a.status === 'open').length;
  const activeIncidentsCount = incidents.filter(
    (i) => i.status === 'open' || i.status === 'investigating'
  ).length;

  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: Activity,
      end: true
    },
    {
      to: '/incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} active` : undefined,
      badgeColor: 'rose'
    },
    {
      to: '/agents',
      label: 'AI Agents',
      icon: Bot,
      badge: agents.length > 0 ? `${agents.length} active` : '0',
      badgeColor: agents.length > 0 ? 'indigo' : 'slate'
    },
    {
      to: '/logs',
      label: 'Live Logs',
      icon: Terminal
    },
    {
      to: '/deployments',
      label: 'Deployments',
      icon: GitCommit
    },
    {
      to: '/approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : undefined,
      badgeColor: 'amber'
    },
    {
      to: '/workflows',
      label: 'Workflows',
      icon: Workflow
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-[#0c0e13] border-r border-[#1a1f2c] flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#1a1f2c] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Command Center</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-indigo-950 text-indigo-400 border border-indigo-800/60 rounded">
                AI
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Switch Orchestrated
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          DevOps Platform
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#141822]'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                  item.badgeColor === 'rose'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800/60 animate-pulse'
                    : item.badgeColor === 'amber'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800/60 font-bold'
                    : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                }`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Sidebar Footer / Switch Status & Workspace */}
      <div className="p-3 border-t border-[#1a1f2c] space-y-3 bg-[#0a0b10]">
        {/* Switch Status Pill */}
        <div className="p-2.5 rounded-lg bg-[#11141c] border border-[#1e2330] text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  switchStatus.connected
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                    : 'bg-amber-400'
                }`}
              ></span>
              {switchStatus.connected ? 'Switch Live Connected' : 'Switch Standby (Demo)'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              {switchStatus.connected && switchStatus.pingMs > 0 ? `${switchStatus.pingMs}ms` : 'Proxy'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{switchStatus.connected ? `${switchStatus.activeRooms} active rooms` : '/gateway route'}</span>
            <span className="font-mono text-slate-400">:18000</span>
          </div>
        </div>

        {/* Workspace Info */}
        <div className="px-1 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Acme Corp / SRE Core</span>
          </div>
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        </div>

        {/* User Profile & Logout */}
        <div className="pt-2 border-t border-[#161a24] flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-indigo-800 flex items-center justify-center text-xs font-bold text-white border border-slate-600 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email ? user.email.slice(0, 2).toUpperCase() : 'SW'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate leading-none">
                {user?.name || user?.email || 'Switch Admin'}
              </div>
              <div className="text-[10px] text-emerald-400 truncate mt-1">
                {user?.role ? `${user.role.toUpperCase()} (Operator)` : 'Staff SRE'}
              </div>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            title="Sign out of Switch"
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
