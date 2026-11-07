import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Radio,
  ArrowRight,
  AlertCircle,
  Cpu,
  Layers,
  KeyRound,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to destination or root
  if (isAuthenticated && !isLoading) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login(email, password);

    if (result.success) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#0e111a] border border-[#1e2334] shadow-xl shadow-black/50 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <span>DevOps Command Center</span>
            <span className="text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
              AI
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            Autonomous Multi-Agent Incident Orchestration & Diagnostics
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0c0e15] border border-[#1b202e] rounded-xl shadow-2xl shadow-black/80 p-6 sm:p-7 relative backdrop-blur-sm">
          {/* Status Badge */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#181d2a] text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-300">Switch Gateway Auth</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 bg-[#121622] px-2 py-0.5 rounded border border-[#1e2436]">
              :18000 /gateway
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Operator Email</span>
                <span className="text-[10px] text-slate-500 font-normal">Switch Core Account</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@switch.local"
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full bg-[#07090e] border border-[#1e2436] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-lg placeholder:text-slate-600 transition-colors focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-500 font-normal">Gateway Password</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#07090e] border border-[#1e2436] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-xs text-slate-100 pl-9 pr-10 py-2.5 rounded-lg placeholder:text-slate-600 transition-colors focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating with Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Command Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Secure Session Note */}
          <div className="mt-5 pt-4 border-t border-[#181d2a] flex items-center gap-2 text-[11px] text-slate-400">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              Session cookie (<code className="text-slate-300 font-mono">switch_auth</code>) is issued and verified by Switch Core.
            </span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>Multi-Agent Swarm</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>SRE Incident Room</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Switch Gateway v0.31 • Flip the Switch Hackathon
          </p>
        </div>
      </div>
    </div>
  );
};

