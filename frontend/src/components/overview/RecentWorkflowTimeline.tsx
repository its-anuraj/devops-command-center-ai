import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Workflow, Clock, Bot, ArrowRight, Radio, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const demoTimelineActivities = [
  {
    id: 'act-1',
    time: '4 mins ago',
    type: 'approval_requested',
    title: 'Approval Requested: Rollback Payment Service',
    description: '@ops-remediator formulated kubectl rollback to v2.4.0 awaiting SRE sign-off',
    agent: '@ops-remediator',
    badge: 'Pending Approval',
    badgeColor: 'amber',
  },
  {
    id: 'act-2',
    time: '8 mins ago',
    type: 'root_cause',
    title: 'Root Cause Isolated: HikariPool Starvation',
    description: '@ops-diagnostician correlated error burst with commit 9c84e1b in Stripe webhook listener',
    agent: '@ops-diagnostician',
    badge: 'RCA Confirmed (96%)',
    badgeColor: 'purple',
  },
  {
    id: 'act-3',
    time: '13 mins ago',
    type: 'war_room',
    title: 'Switch Incident War-Room Provisioned',
    description: '@ops-commander created room #inc-8041-payment-failure & alerted on-call staff',
    agent: '@ops-commander',
    badge: 'P1 Incident',
    badgeColor: 'rose',
  },
  {
    id: 'act-4',
    time: '3 hours ago',
    type: 'resolved',
    title: 'Workflow Completed: INC-8040 Auth Redis Failover',
    description: 'Post-mortem document published to Switch internal document archive by @ops-librarian',
    agent: '@ops-librarian',
    badge: 'Resolved',
    badgeColor: 'emerald',
  },
];

export const RecentWorkflowTimeline: React.FC = () => {
  const navigate = useNavigate();
  const { liveEvents, streamStatus } = useApp();
  const [tab, setTab] = useState<'live' | 'demo'>(liveEvents.length > 0 ? 'live' : 'demo');

  // Filter relevant live events (activity, message, approval)
  const relevantLiveEvents = [...liveEvents]
    .reverse()
    .filter((e) => e.kind === 'activity' || e.kind === 'approval' || e.kind === 'message')
    .slice(0, 6);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-400" />
            <span>Autonomous Activity Stream</span>
            {tab === 'live' ? (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${streamStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                LIVE SWITCH STREAM
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300">
                DEMO SCENARIO
              </span>
            )}
          </div>
        }
        subtitle={
          tab === 'live'
            ? 'Real-time telemetry of Switch agent turns, tool calls & human authorizations'
            : 'Simulated chronological feed of agent investigation steps (Demo INC-8041)'
        }
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-[#141822] border border-[#222938] p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setTab('live')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                  tab === 'live'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-2.5 h-2.5" />
                Live ({liveEvents.length})
              </button>
              <button
                onClick={() => setTab('demo')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  tab === 'demo'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Demo
              </button>
            </div>
            <button
              onClick={() => navigate('/workflows')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 ml-1"
            >
              Workflows <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />
      <CardBody className="p-4 flex-1">
        {tab === 'live' ? (
          relevantLiveEvents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <Cpu className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
              <p className="text-xs font-medium text-slate-400">No agent turns captured yet</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                When Switch agents process chat messages, execute tool calls, or emit approval requests via SSE, they will stream here live.
              </p>
              <button
                onClick={() => setTab('demo')}
                className="mt-3 text-xs text-indigo-400 hover:underline"
              >
                View demo scenario instead
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e2433]">
              {relevantLiveEvents.map((evt) => {
                const meta = (evt.metadata || {}) as Record<string, unknown>;
                const isApproval = evt.kind === 'approval';
                const isMessage = evt.kind === 'message';
                const isError = evt.level === 'ERROR' || evt.level === 'FATAL';
                const isRunning = meta.status === 'running';

                let dotColor = 'bg-indigo-400';
                if (isApproval) dotColor = 'bg-amber-400 animate-pulse';
                else if (isError) dotColor = 'bg-rose-500';
                else if (isRunning) dotColor = 'bg-blue-400 animate-pulse';
                else if (isMessage) dotColor = 'bg-purple-400';
                else dotColor = 'bg-emerald-400';

                const title = isApproval
                  ? `Human Approval: ${(meta.title as string) || evt.message}`
                  : isMessage
                  ? `War-Room Message: ${evt.service}`
                  : `${(meta.kind as string || 'turn').toUpperCase()}: ${(meta.title as string) || (meta.commandId as string) || evt.message}`;

                const description = (meta.text as string) || (meta.detail as string) || evt.message;

                return (
                  <div key={evt.id} className="relative group">
                    <div
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-[#101217] ${dotColor}`}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-100 flex items-center gap-2 truncate">
                        {isApproval ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : isMessage ? (
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        )}
                        <span className="truncate">{title}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0 ml-2">
                        <Clock className="w-3 h-3" />
                        {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed font-mono">
                      {description}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-mono text-indigo-400 font-medium">
                        <Bot className="w-3 h-3" />
                        {evt.service}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {evt.traceId}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isApproval
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                            : isError
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                            : isMessage
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                        }`}
                      >
                        {isApproval
                          ? `Approval ${(meta.state as string || 'open').toUpperCase()}`
                          : isMessage
                          ? 'Message'
                          : `Status ${(meta.status as string || 'completed').toUpperCase()}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e2433]">
            {demoTimelineActivities.map((act) => (
              <div key={act.id} className="relative group">
                <div
                  className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-[#101217] ${
                    act.badgeColor === 'rose'
                      ? 'bg-rose-500'
                      : act.badgeColor === 'amber'
                      ? 'bg-amber-400 animate-pulse'
                      : act.badgeColor === 'purple'
                      ? 'bg-purple-400'
                      : 'bg-emerald-400'
                  }`}
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-100 flex items-center gap-2">
                    <span>{act.title}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {act.time}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.description}</p>

                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-mono text-indigo-400 font-medium">
                    <Bot className="w-3 h-3" />
                    {act.agent}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      act.badgeColor === 'rose'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : act.badgeColor === 'amber'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                        : act.badgeColor === 'purple'
                        ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    }`}
                  >
                    {act.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
