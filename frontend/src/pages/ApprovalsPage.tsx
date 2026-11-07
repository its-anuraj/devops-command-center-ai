import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  CheckSquare,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  XCircle,
  Bot,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const {
    approvals,
    approvalsLoading,
    approvalsError,
    approvalHistory,
    approveAction,
    rejectAction,
    answerApprovalCustom,
    refreshBackendData,
    isBackendLoading,
    switchStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pendingApprovals = approvals.filter((a) => a.status === 'pending' || a.status === 'open');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async (id: string) => {
    setSubmittingId(id);
    try {
      await approveAction(id);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setSubmittingId(id);
    try {
      await rejectAction(id);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCustomOption = async (id: string, optionId: string) => {
    setSubmittingId(id);
    try {
      await answerApprovalCustom(id, optionId);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Safety Notice */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/30 via-[#10131b] to-[#0c0e14] border border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Human-in-the-Loop Governance Guardrail
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {pendingApprovals.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live agent approval requests from Switch Gateway (/gateway/agent-sessions/approvals). Autonomous agents cannot execute state-altering or destructive actions without human authorization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refreshBackendData()}
            disabled={isBackendLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBackendLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <div className="flex items-center gap-1 bg-[#090b10] border border-[#1e2330] p-1 rounded-lg text-xs font-mono">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-slate-700 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Trail ({approvalHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'pending' ? (
        <div className="space-y-5">
          {/* Loading State */}
          {approvalsLoading && pendingApprovals.length === 0 && (
            <div className="p-12 text-center rounded-xl bg-[#0d0f17] border border-[#1b2130]">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-300">Querying Switch Gateway Approvals...</p>
              <p className="text-[11px] text-slate-500 mt-1">Checking /gateway/agent-sessions/approvals on port 18000</p>
            </div>
          )}

          {/* Error State */}
          {!approvalsLoading && approvalsError && pendingApprovals.length === 0 && (
            <div className="p-6 rounded-xl bg-red-950/20 border border-red-800/40 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-red-200">Failed to Retrieve Approvals</h3>
              <p className="text-xs text-red-300/80 mt-1 max-w-md mx-auto">{approvalsError}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void refreshBackendData()}
                className="mt-4"
              >
                Retry Request
              </Button>
            </div>
          )}

          {/* Honest Empty State */}
          {!approvalsLoading && !approvalsError && pendingApprovals.length === 0 && (
            <div className="p-12 text-center bg-[#0c0e15] border border-dashed border-[#222838] rounded-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#121622] border border-[#1e2436] flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">All Action Approvals Cleared</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There are no open approval requests requiring human authorization from Switch Gateway.
                Connected agents are running within pre-authorized operational parameters.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111520] border border-[#1b2234] text-[11px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Switch Agent Gateway Status: {switchStatus.connected ? 'Monitoring' : 'Standby'}</span>
              </div>
            </div>
          )}

          {/* Pending Approval Cards */}
          {pendingApprovals.map((req) => (
            <Card key={req.id} className="p-6 border-l-4 border-l-amber-500 shadow-xl shadow-black/40">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1c2230]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                    <Badge variant="amber" size="sm" dot className="animate-pulse">
                      APPROVAL REQUIRED
                    </Badge>
                    <span className="font-mono text-[11px] font-semibold text-slate-300 bg-[#121622] px-2 py-0.5 rounded border border-[#1e2538] flex items-center gap-1.5">
                      <span>ID: {req.requestId || req.id}</span>
                      <button
                        onClick={() => copyToClipboard(req.requestId || req.id)}
                        className="text-slate-500 hover:text-slate-300 cursor-pointer"
                        title="Copy Request ID"
                      >
                        {copiedId === (req.requestId || req.id) ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 bg-[#121622] px-2 py-0.5 rounded border border-[#1e2538]">
                      Session: {req.sessionId ? `${req.sessionId.slice(0, 8)}...` : 'n/a'}
                    </span>
                    {req.roomId && (
                      <span className="font-mono text-[11px] text-slate-400 bg-[#121622] px-2 py-0.5 rounded border border-[#1e2538] flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span>Room: {req.roomId.slice(0, 8)}...</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{req.actionTitle}</h3>

                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-indigo-400 font-medium">
                      <Bot className="w-3.5 h-3.5" />
                      Requested by {req.agentName || req.requestingAgent}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {req.requestedAt}
                    </span>
                  </div>
                </div>

                {/* Primary Decision Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() => void handleReject(req.id)}
                    disabled={submittingId === req.id}
                    className="cursor-pointer"
                  >
                    {submittingId === req.id ? 'Submitting...' : 'Reject'}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => void handleApprove(req.id)}
                    disabled={submittingId === req.id}
                    className="font-semibold shadow-md shadow-emerald-950/40 cursor-pointer"
                  >
                    {submittingId === req.id ? 'Submitting...' : 'Approve & Execute'}
                  </Button>
                </div>
              </div>

              {/* Action Description & Details */}
              <div className="py-4 space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1 uppercase tracking-wider text-[10px]">
                    Requested Operation & Purpose:
                  </span>
                  <p className="text-slate-200 leading-relaxed bg-[#0e1118] p-3.5 rounded-lg border border-[#1a202e]">
                    {req.actionDescription}
                  </p>
                </div>

                {/* Available Decision Choices (from Switch backend options) */}
                {req.options && req.options.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] block mb-1.5 flex items-center gap-1.5 uppercase">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      Backend Supported Options ({req.options.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {req.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-2.5 rounded-lg bg-[#0b0d14] border border-[#1b2130] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-semibold text-slate-200 block truncate">
                              {opt.label}
                            </span>
                            {opt.description && (
                              <span className="text-[10px] text-slate-500 block truncate">
                                {opt.description}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={submittingId === req.id}
                            onClick={() => void handleCustomOption(req.id, opt.id)}
                            className="shrink-0 text-[11px] py-1 cursor-pointer"
                          >
                            Choose [{opt.id}]
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Approval Audit Trail History */
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Approval Execution Log</span>
              </div>
            }
            subtitle="Immutable audit record of verified human decisions submitted to Switch Gateway"
          />
          <CardBody className="p-0 overflow-x-auto">
            {approvalHistory.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="font-medium text-slate-400">No approval decisions logged yet in this session.</p>
                <p className="text-[11px] text-slate-500 mt-1">Decisions made on pending actions will appear in this audit log.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1b202c] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0c0e14]">
                    <th className="py-3 px-4">Action & Request ID</th>
                    <th className="py-3 px-4">Requesting Agent</th>
                    <th className="py-3 px-4">Session UUID</th>
                    <th className="py-3 px-4">Decision</th>
                    <th className="py-3 px-4 font-mono">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181d28] text-xs">
                  {approvalHistory.map((app) => (
                    <tr key={app.id} className="hover:bg-[#121620] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{app.actionTitle}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">{app.requestId}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-400">
                        {app.agentName || app.requestingAgent}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {app.sessionId ? `${app.sessionId.slice(0, 12)}...` : 'n/a'}
                      </td>

                      <td className="py-3.5 px-4">
                        {app.status === 'approved' ? (
                          <div className="space-y-1">
                            <Badge variant="emerald" size="sm">
                              Approved & Sent
                            </Badge>
                            {app.decisionNote && (
                              <div className="text-[11px] text-slate-400">{app.decisionNote}</div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="rose" size="sm">
                              Rejected
                            </Badge>
                            {app.decisionNote && (
                              <div className="text-[11px] text-slate-400">{app.decisionNote}</div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {app.reviewedAt || app.requestedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};
