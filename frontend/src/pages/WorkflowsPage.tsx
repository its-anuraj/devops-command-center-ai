import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import type { WorkflowStep } from '../types/workflow';
import {
  Workflow,
  CheckCircle2,
  AlertCircle,
  Bot,
  CheckSquare,
  Terminal,
  Activity,
  Radio,
  Clock,
  ShieldAlert,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkflowsPage: React.FC = () => {
  const { workflows, liveEvents, approvals, streamStatus } = useApp();
  const navigate = useNavigate();

  // Mode switcher: Live Switch Executions vs Demo Pipelines
  const [activeTab, setActiveTab] = useState<'live_executions' | 'demo_pipeline'>('demo_pipeline');

  // Demo Pipeline states
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('WF-8041');
  const [selectedStepId, setSelectedStepId] = useState<number>(6);

  const activeWorkflow =
    workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const selectedStep: WorkflowStep =
    activeWorkflow.steps.find((s) => s.id === selectedStepId) || activeWorkflow.steps[0];

  // Filter live activity and approval events from SSE
  const liveWorkflowEvents = liveEvents.filter(
    (e) => e.kind === 'activity' || e.kind === 'approval'
  );

  const [selectedLiveEventId, setSelectedLiveEventId] = useState<string | null>(
    liveWorkflowEvents[liveWorkflowEvents.length - 1]?.id || null
  );

  const selectedLiveEvent =
    liveWorkflowEvents.find((e) => e.id === selectedLiveEventId) ||
    liveWorkflowEvents[liveWorkflowEvents.length - 1];

  const getStepStatusIcon = (status: string, index: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'running':
        return <Activity className="w-5 h-5 text-indigo-400 animate-spin" />;
      case 'waiting_approval':
        return <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-mono">
            {index + 1}
          </div>
        );
    }
  };

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="emerald" size="sm">
            Completed
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="indigo" size="sm" className="animate-pulse">
            In Progress
          </Badge>
        );
      case 'waiting_approval':
        return (
          <Badge variant="amber" size="sm" className="animate-pulse">
            Waiting Sign-Off
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="rose" size="sm">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="slate" size="sm">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Workflow className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Autonomous DevOps Workflow Pipelines
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Switch agent execution turns, tool invocations, and interactive human-in-the-loop remediation pipelines
          </p>
        </div>

        {/* View Switcher: Live SSE Executions vs Demo Pipeline */}
        <div className="flex items-center rounded-xl bg-[#11141c] border border-[#212737] p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('live_executions')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'live_executions'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Switch Executions</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[10px] border border-indigo-700/50">
              {liveWorkflowEvents.length} Steps
            </span>
          </button>

          <button
            onClick={() => setActiveTab('demo_pipeline')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'demo_pipeline'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            <span>Remediation Pipeline</span>
            <span className="px-1.5 py-0.2 rounded bg-[#181d28] text-slate-400 text-[10px] border border-[#263042]">
              Demo
            </span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: LIVE SWITCH AGENT EXECUTIONS ─────────────────────────── */}
      {activeTab === 'live_executions' && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#11141c] to-[#11141c] border border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${streamStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>
                <strong className="text-white">Genuine Switch Event Stream:</strong> Showing actual agent activity turns, tool calls, and approval requests streamed via SSE from Switch Gateway.
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 shrink-0">
              SAFETY: PROPOSED ACTIONS NEVER AUTO-EXECUTED
            </span>
          </div>

          {liveWorkflowEvents.length === 0 ? (
            <Card className="p-12 text-center text-xs text-slate-500">
              <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-slate-400">No live execution steps recorded yet</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                When Switch agents receive war-room prompts, execute tools, or submit approval requests, genuine step-by-step telemetry will render here in real-time.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab('demo_pipeline')}
              >
                Inspect 8-Stage Demo Pipeline Instead
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Steps List */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-semibold text-slate-300">Live Agent Steps ({liveWorkflowEvents.length})</span>
                  <span className="font-mono text-[11px]">Latest First</span>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {[...liveWorkflowEvents].reverse().map((evt) => {
                    const meta = (evt.metadata || {}) as Record<string, unknown>;
                    const isSelected = selectedLiveEvent?.id === evt.id;
                    const isApproval = evt.kind === 'approval';
                    const isRunning = meta.status === 'running';
                    const isError = evt.level === 'ERROR' || evt.level === 'FATAL';

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedLiveEventId(evt.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#151924] border-indigo-500 shadow-md shadow-indigo-950/30'
                            : 'bg-[#101319] border-[#1d2331] hover:border-[#2b3346] hover:bg-[#121620]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-slate-100 flex items-center gap-1.5 truncate">
                            {isApproval ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            )}
                            <span className="truncate">
                              {isApproval
                                ? `Approval: ${(meta.title as string) || evt.message}`
                                : `${(meta.kind as string || 'turn').toUpperCase()}: ${(meta.title as string) || (meta.commandId as string) || evt.message}`}
                            </span>
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                              isApproval
                                ? 'bg-amber-950 text-amber-300 border-amber-800'
                                : isRunning
                                ? 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse'
                                : isError
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {isApproval
                              ? (meta.state as string || 'open').toUpperCase()
                              : (meta.status as string || 'completed').toUpperCase()}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 font-mono">
                          {(meta.text as string) || (meta.detail as string) || evt.message}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-[#1a202d] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="text-indigo-400 font-medium">@{evt.service}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {evt.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Step Inspector Panel */}
              <div className="lg:col-span-7">
                {selectedLiveEvent ? (
                  <Card className="p-5 space-y-4">
                    <div className="pb-4 border-b border-[#1c2230] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                            {selectedLiveEvent.kind?.toUpperCase() || 'ACTIVITY'}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {selectedLiveEvent.service}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {selectedLiveEvent.traceId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-mono">
                          {selectedLiveEvent.message}
                        </p>
                      </div>

                      <span className="text-xs font-mono text-slate-400 shrink-0">
                        {selectedLiveEvent.timestamp}
                      </span>
                    </div>

                    {/* Metadata & Raw Details */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        Verified Switch Gateway Event Payload:
                      </span>
                      <pre className="p-3.5 rounded-lg bg-[#07080b] border border-[#171b26] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[350px]">
                        {JSON.stringify(selectedLiveEvent.metadata || selectedLiveEvent, null, 2)}
                      </pre>
                    </div>

                    {/* If Approval Event */}
                    {selectedLiveEvent.kind === 'approval' && (
                      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-900/50 flex items-center justify-between">
                        <div className="text-xs text-amber-200">
                          <strong>Human Decision Point:</strong> This step halted automated execution pending operator verification.
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate('/approvals')}
                        >
                          Review in Approvals &rarr;
                        </Button>
                      </div>
                    )}
                  </Card>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-[#101319] border border-[#1d2331] rounded-xl">
                    Select a step to inspect payload
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: DEMONSTRATION REMEDIATION PIPELINES ─────────────────── */}
      {activeTab === 'demo_pipeline' && (
        <div className="space-y-6">
          {/* Demo Workflow Pipeline Disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1f2535] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <Workflow className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong className="text-slate-200">Demonstration Remediation Pipeline:</strong> Visual 8-stage lifecycle representing automated incident triage and human-in-the-loop remediation. Destructive or modifying actions require explicit operator sign-off.
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300 shrink-0 ml-3">
              DEMO PIPELINE
            </span>
          </div>

          {/* Workflow Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => {
                    setSelectedWorkflowId(wf.id);
                    setSelectedStepId(wf.currentStepIndex || 1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    selectedWorkflowId === wf.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#11141c] text-slate-400 border border-[#212737] hover:text-slate-200'
                  }`}
                >
                  {wf.id} ({wf.severity})
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Pipeline Target: <strong className="text-slate-200">{activeWorkflow.incidentTitle}</strong>
            </div>
          </div>

          {/* Main Workflow View */}
          <Card className="p-6">
            {/* Pipeline Summary Bar */}
            <div className="pb-5 border-b border-[#1c2230] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant={activeWorkflow.severity === 'P1' ? 'rose' : 'amber'} size="sm">
                    {activeWorkflow.severity} Incident
                  </Badge>
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {activeWorkflow.id}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-mono">
                    Started {activeWorkflow.startedAt}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{activeWorkflow.incidentTitle}</h3>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {activeWorkflow.status === 'active' && (
                  <Badge variant="indigo" size="md" dot className="animate-pulse">
                    Pipeline Active (Step {activeWorkflow.currentStepIndex}/8)
                  </Badge>
                )}
                {activeWorkflow.status === 'completed' && (
                  <Badge variant="emerald" size="md" dot>
                    Pipeline Completed (8/8)
                  </Badge>
                )}
              </div>
            </div>

            {/* 8-Stage Visual Pipeline Stepper */}
            <div className="py-6 overflow-x-auto">
              <div className="min-w-[800px] flex items-center justify-between relative">
                {/* Connecting Track Line */}
                <div className="absolute top-5 left-6 right-6 h-0.5 bg-[#1e2535] -z-0" />

                {activeWorkflow.steps.map((step, idx) => {
                  const isSelected = selectedStep.id === step.id;
                  const isPast = step.status === 'completed';
                  const isCurrent = step.status === 'running' || step.status === 'waiting_approval';

                  return (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStepId(step.id)}
                      className="flex flex-col items-center relative z-10 cursor-pointer group px-2"
                    >
                      {/* Step Bubble */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'ring-4 ring-indigo-500/40 bg-[#161a25] border-2 border-indigo-400'
                            : isPast
                            ? 'bg-[#10141d] border border-emerald-500/80 shadow-sm'
                            : isCurrent
                            ? 'bg-[#181d2a] border-2 border-amber-400 animate-pulse'
                            : 'bg-[#0f1118] border border-[#212838]'
                        }`}
                      >
                        {getStepStatusIcon(step.status, idx)}
                      </div>

                      {/* Step Title Label */}
                      <div className="mt-2.5 text-center max-w-[100px]">
                        <div
                          className={`text-[11px] font-semibold leading-tight line-clamp-2 ${
                            isSelected ? 'text-indigo-300' : 'text-slate-300'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                          {step.agentHandle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Inspector Panel */}
            <div className="mt-4 p-5 rounded-xl bg-[#0c0e14] border border-[#1c2230]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#181d28]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      STAGE {selectedStep.id} OF 8:
                    </span>
                    <span className="text-sm font-bold text-white">{selectedStep.title}</span>
                    {getStepStatusBadge(selectedStep.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedStep.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2 font-mono text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                    <Bot className="w-4 h-4" />
                    {selectedStep.assignedAgent}
                  </span>
                  {selectedStep.duration && (
                    <>
                      <span>•</span>
                      <span>Duration: {selectedStep.duration}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Step Payload / Output Data */}
              <div className="pt-4 space-y-4">
                {selectedStep.output && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      Execution Payload & Operation Parameters:
                    </span>
                    <pre className="p-3.5 rounded-lg bg-[#07080b] border border-[#171b26] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      {typeof selectedStep.output === 'string'
                        ? selectedStep.output
                        : JSON.stringify(selectedStep.output, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Special Safety & Sign-Off Notice for Stage 6 & 7 */}
                {selectedStep.id === 6 && (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <CheckSquare className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-200">
                          Human Authorization Gate (Safety Protocol)
                        </div>
                        <div className="text-xs text-amber-300/80 mt-0.5">
                          {approvals.length > 0
                            ? `Active approval requests pending in Switch Gateway (${approvals.length} open). Operator authorization required before proceeding to Stage 7.`
                            : 'Awaiting authorized operator sign-off via Switch Gateway to permit canary rollback execution.'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => navigate('/approvals')}
                      >
                        Open Action Approvals ({approvals.length})
                      </Button>
                    </div>
                  </div>
                )}

                {selectedStep.id === 7 && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300">
                      <strong className="text-white block mb-0.5">Automated Execution Boundary:</strong>
                      Proposed rollback action is deliberately held in <code className="text-amber-300 font-mono">PENDING</code> status until Stage 6 receives authorized human sign-off. Under zero circumstances is an unapproved destructive command marked as executed.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
