import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { LogEntry, LogLevel, StreamConnectionStatus } from '../types/log';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Terminal,
  Search,
  Play,
  Pause,
  ArrowDown,
  Download,
  ChevronRight,
  RefreshCw,
  Radio,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  switchGateway,
  type SwitchActivityItem,
  type SwitchChatMessage,
  type SwitchApprovalRequest,
  type SwitchAgentSummary,
  type SwitchChatSummary,
} from '../services/switchGateway';
import {
  switchEventStream,
  type SwitchStreamEvent,
} from '../services/switchEventStream';

function formatTimestamp(isoString?: string): string {
  if (!isoString) return new Date().toLocaleTimeString('en-US', { hour12: false }) + '.000';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const time = d.toLocaleTimeString('en-US', { hour12: false });
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${time}.${ms}`;
}

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [bufferedLogs, setBufferedLogs] = useState<LogEntry[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [streamStatus, setStreamStatus] = useState<StreamConnectionStatus>('disconnected');
  const [statusDetail, setStatusDetail] = useState<string | undefined>(undefined);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedKind, setSelectedKind] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Known metadata
  const [agents, setAgents] = useState<SwitchAgentSummary[]>([]);
  const [chats, setChats] = useState<SwitchChatSummary[]>([]);
  const agentMapRef = useRef<Map<string, string>>(new Map());

  const logEndRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (autoScroll && !isPaused && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isPaused]);

  // Convert Switch Activity Item to LogEntry
  const mapActivityToLog = useCallback(
    (item: SwitchActivityItem, receivedAt?: string): LogEntry | null => {
      if (!item.itemId) return null;

      let level: LogLevel = 'INFO';
      if (item.status === 'failed' || item.kind === 'error') {
        level = 'ERROR';
      } else if (item.status === 'pending') {
        level = 'WARN';
      } else if (item.status === 'running') {
        level = 'DEBUG';
      }

      const agentName =
        agentMapRef.current.get(item.agentId) ||
        (item.agentId ? `agent:${item.agentId.slice(0, 8)}` : 'switch-agent');

      return {
        id: `act-${item.agentId}-${item.turnId}-${item.itemId}`,
        timestamp: formatTimestamp(item.occurredAt || item.createdAt || receivedAt),
        level,
        service: agentName,
        message: `[${(item.kind || 'activity').toUpperCase()}] ${item.title || ''}${
          item.text ? `: ${item.text}` : ''
        }`,
        traceId: item.sessionId ? `sess-${item.sessionId.slice(0, 8)}` : 'session-none',
        spanId: item.turnId ? `turn-${item.turnId.slice(0, 8)}` : undefined,
        kind: 'activity',
        highlight: level === 'ERROR',
        metadata: {
          agentId: item.agentId,
          agentName,
          sessionId: item.sessionId,
          turnId: item.turnId,
          itemId: item.itemId,
          kind: item.kind,
          revision: item.revision,
          status: item.status,
          title: item.title,
          text: item.text,
          commandId: item.commandId,
          roomId: item.roomId,
          threadId: item.threadId,
          messageId: item.messageId,
          occurredAt: item.occurredAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      };
    },
    []
  );

  // Convert Switch Chat Message to LogEntry
  const mapMessageToLog = useCallback(
    (msg: SwitchChatMessage, receivedAt?: string): LogEntry | null => {
      if (!msg.messageId && typeof msg.seq !== 'number') return null;

      const senderName =
        msg.sender?.name || (msg.sender?.kind === 'agent' ? 'agent' : 'human');
      const isError =
        msg.body?.toLowerCase().includes('error') || msg.body?.toLowerCase().includes('failed');

      return {
        id: msg.messageId || `msg-${msg.roomId}-${msg.seq}`,
        timestamp: formatTimestamp(msg.sentAt || receivedAt),
        level: isError ? 'WARN' : 'INFO',
        service: senderName,
        message: `[CHAT] ${msg.body || ''}`,
        traceId: msg.roomId ? `room-${msg.roomId.slice(0, 8)}` : 'room-none',
        spanId: `seq-${msg.seq}`,
        kind: 'message',
        metadata: {
          messageId: msg.messageId,
          seq: msg.seq,
          roomId: msg.roomId,
          sender: msg.sender,
          source: msg.source,
          sentAt: msg.sentAt,
          threadRootId: msg.threadRootId,
          attachments: msg.attachments,
        },
      };
    },
    []
  );

  // Convert Switch Approval Request to LogEntry
  const mapApprovalToLog = useCallback(
    (approval: SwitchApprovalRequest, receivedAt?: string): LogEntry | null => {
      if (!approval.request_id) return null;

      const agentName =
        agentMapRef.current.get(approval.agent_id) ||
        (approval.agent_id ? `agent:${approval.agent_id.slice(0, 8)}` : 'approval-gate');

      return {
        id: `app-${approval.request_id}`,
        timestamp: formatTimestamp(approval.answered_at || approval.expires_at || receivedAt),
        level: approval.state === 'open' ? 'WARN' : 'INFO',
        service: agentName,
        message: `[APPROVAL_${(approval.state || 'request').toUpperCase()}] ${
          approval.title || 'Human approval required'
        }${approval.detail ? `: ${approval.detail}` : ''}`,
        traceId: approval.session_id ? `sess-${approval.session_id.slice(0, 8)}` : 'session-none',
        spanId: `req-${approval.request_id.slice(0, 8)}`,
        kind: 'approval',
        highlight: approval.state === 'open',
        metadata: {
          requestId: approval.request_id,
          agentId: approval.agent_id,
          sessionId: approval.session_id,
          turnId: approval.turn_id,
          kind: approval.kind,
          title: approval.title,
          detail: approval.detail,
          options: approval.options,
          state: approval.state,
          answer: approval.answer,
          answeredBy: approval.answered_by,
        },
      };
    },
    []
  );

  // Map generic stream event
  const mapStreamEvent = useCallback(
    (event: SwitchStreamEvent): LogEntry | null => {
      const { stream, eventType, data, receivedAt } = event;

      if (eventType === 'ready') {
        return {
          id: `ready-${stream}-${Date.now()}`,
          timestamp: formatTimestamp(receivedAt),
          level: 'INFO',
          service: 'switch-gateway',
          message: `[SSE_${stream.toUpperCase()}] Stream connected and subscribed to live gateway events`,
          traceId: 'gateway-sse',
          kind: 'system',
          metadata: { stream, eventType, receivedAt },
        };
      }

      if (eventType === 'activity') {
        return mapActivityToLog(data as SwitchActivityItem, receivedAt);
      }

      if (eventType === 'approval') {
        return mapApprovalToLog(data as SwitchApprovalRequest, receivedAt);
      }

      if (eventType === 'message') {
        return mapMessageToLog(data as SwitchChatMessage, receivedAt);
      }

      if (eventType === 'chat') {
        const chat = data as Record<string, unknown>;
        const roomId = (chat.roomId as string) || '';
        const roomName = (chat.name as string) || roomId;
        return {
          id: `chat-${roomId}-${Date.now()}`,
          timestamp: formatTimestamp(receivedAt),
          level: 'INFO',
          service: 'switch-chats',
          message: `[ROOM_UPDATE] Active room: "${roomName}" (${(chat.memberCount as number) || 1} members)`,
          traceId: roomId ? `room-${roomId.slice(0, 8)}` : 'room-none',
          kind: 'system',
          metadata: chat,
        };
      }

      if (eventType === 'resync') {
        return {
          id: `resync-${Date.now()}`,
          timestamp: formatTimestamp(receivedAt),
          level: 'DEBUG',
          service: 'switch-gateway',
          message: '[RESYNC] Server signaled activity or membership resynchronization',
          traceId: 'gateway-sse',
          kind: 'system',
          metadata: { eventType, receivedAt },
        };
      }

      return null;
    },
    [mapActivityToLog, mapApprovalToLog, mapMessageToLog]
  );

  // Load initial historical snapshots from Switch Gateway
  const loadSnapshots = useCallback(async () => {
    try {
      setLoadingInitial(true);

      // 1. Fetch agents
      const agentsRes = await switchGateway.getAgents();
      if (agentsRes.data) {
        setAgents(agentsRes.data);
        const map = new Map<string, string>();
        for (const a of agentsRes.data) {
          map.set(a.id, a.display_name || a.name);
        }
        agentMapRef.current = map;
      }

      // 2. Fetch active chats
      const chatsRes = await switchGateway.getChats();
      const loadedChats = chatsRes.data?.chats || [];
      setChats(loadedChats);

      const initialEntries: LogEntry[] = [];

      // 3. For each chat, fetch existing messages & activity
      for (const chat of loadedChats) {
        try {
          const [messagesRes, activityRes] = await Promise.all([
            switchGateway.getRoomMessages(chat.roomId, 50),
            switchGateway.getRoomActivity(chat.roomId),
          ]);

          if (messagesRes.data?.messages) {
            for (const msg of messagesRes.data.messages) {
              const mapped = mapMessageToLog(msg);
              if (mapped) initialEntries.push(mapped);
            }
          }

          if (activityRes.data?.items) {
            for (const item of activityRes.data.items) {
              const mapped = mapActivityToLog(item);
              if (mapped) initialEntries.push(mapped);
            }
          }

          if (activityRes.data?.approvals) {
            for (const app of activityRes.data.approvals) {
              const mapped = mapApprovalToLog(app);
              if (mapped) initialEntries.push(mapped);
            }
          }
        } catch (chatErr) {
          console.warn(`[LogsPage] Failed to fetch history for room ${chat.roomId}:`, chatErr);
        }
      }

      // Deduplicate initial entries by ID
      const seenIds = new Set<string>();
      const deduped = initialEntries.filter((e) => {
        if (seenIds.has(e.id)) return false;
        seenIds.add(e.id);
        return true;
      });

      // Sort by timestamp ascending
      deduped.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      setLogs(deduped);
    } catch (err) {
      console.error('[LogsPage] Error loading initial snapshots:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, [mapActivityToLog, mapApprovalToLog, mapMessageToLog]);

  // Handle incoming live stream events
  const handleStreamEvent = useCallback(
    (event: SwitchStreamEvent) => {
      const entry = mapStreamEvent(event);
      if (!entry) return;

      if (isPausedRef.current) {
        setBufferedLogs((prev) => [...prev, entry]);
      } else {
        setLogs((prev) => {
          // Avoid duplicate entries
          if (prev.some((p) => p.id === entry.id)) {
            return prev.map((p) => (p.id === entry.id ? entry : p));
          }
          return [...prev, entry];
        });
      }
    },
    [mapStreamEvent]
  );

  // Subscribe to SSE stream lifecycle
  useEffect(() => {
    void loadSnapshots();

    const unsubscribe = switchEventStream.subscribe({
      onEvent: handleStreamEvent,
      onStatusChange: (status, detail) => {
        setStreamStatus(status);
        setStatusDetail(detail);
        const { attempt } = switchEventStream.getStatus();
        setReconnectAttempt(attempt);
      },
    });

    switchEventStream.start();

    return () => {
      unsubscribe();
      // Keep shared connection running in AppContext across page navigation
    };
  }, [loadSnapshots, handleStreamEvent]);

  // Toggle Pause/Resume
  const handleTogglePause = () => {
    if (isPaused) {
      // Flush buffered logs
      if (bufferedLogs.length > 0) {
        setLogs((prev) => {
          const map = new Map(prev.map((e) => [e.id, e]));
          for (const b of bufferedLogs) {
            map.set(b.id, b);
          }
          return Array.from(map.values());
        });
        setBufferedLogs([]);
      }
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  // Clear log entries
  const handleClear = () => {
    setLogs([]);
    setBufferedLogs([]);
  };

  // Reconnect manually
  const handleReconnect = () => {
    switchEventStream.stop();
    switchEventStream.start();
    void loadSnapshots();
  };

  // Distinct sources for filter dropdown
  const availableServices = Array.from(
    new Set([
      ...logs.map((l) => l.service),
      ...agents.map((a) => a.display_name || a.name),
      'switch-gateway',
    ])
  ).filter(Boolean);

  // Filtering
  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      log.message.toLowerCase().includes(term) ||
      log.service.toLowerCase().includes(term) ||
      log.traceId.toLowerCase().includes(term) ||
      (log.spanId && log.spanId.toLowerCase().includes(term));

    const matchesService = selectedService === 'ALL' || log.service === selectedService;
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchesKind = selectedKind === 'ALL' || log.kind === selectedKind;

    return matchesSearch && matchesService && matchesLevel && matchesKind;
  });

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
      case 'FATAL':
        return (
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800/80">
            {level}
          </span>
        );
      case 'WARN':
        return (
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80">
            {level}
          </span>
        );
      case 'INFO':
        return (
          <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
            {level}
          </span>
        );
      case 'DEBUG':
      default:
        return (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700/60">
            {level}
          </span>
        );
    }
  };

  const handleExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      backendUrl: import.meta.env.VITE_SWITCH_GATEWAY_URL || '/gateway',
      totalEvents: filteredLogs.length,
      events: filteredLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `switch-events-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Honest Switch Agent & Session Events Banner */}
      <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1f2535] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-start md:items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-200">Switch Agent & Session Event Stream</strong>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                SSE
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Live events from Switch Gateway (<code className="text-indigo-300 font-mono">/gateway/chats/activity/events</code> and{' '}
              <code className="text-indigo-300 font-mono">/gateway/chats/events</code>). Captures real-time agent turns, tool invocations, commands, and room messages.
            </p>
          </div>
        </div>

        {/* Live Connection Status Badge */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          {streamStatus === 'connected' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONNECTED</span>
            </div>
          )}

          {streamStatus === 'reconnecting' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>RECONNECTING {reconnectAttempt > 0 ? `(#${reconnectAttempt})` : ''}</span>
            </div>
          )}

          {streamStatus === 'disconnected' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 font-mono text-xs">
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>DISCONNECTED</span>
              </div>
              <Button size="sm" variant="secondary" onClick={handleReconnect} icon={<RefreshCw className="w-3 h-3" />}>
                Reconnect
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Control & Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search events, agents, turns, trace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a0c10] border border-[#1e2330] focus:border-indigo-500 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none placeholder-slate-500 font-mono"
            />
          </div>

          {/* Service / Agent, Level & Kind Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Source / Agent filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-[#0a0c10] border border-[#1e2330] text-xs text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
            >
              <option value="ALL">All Sources ({availableServices.length})</option>
              {availableServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>

            {/* Level filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-[#0a0c10] border border-[#1e2330] text-xs text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="DEBUG">DEBUG</option>
            </select>

            {/* Kind filter */}
            <select
              value={selectedKind}
              onChange={(e) => setSelectedKind(e.target.value)}
              className="bg-[#0a0c10] border border-[#1e2330] text-xs text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
            >
              <option value="ALL">All Event Kinds</option>
              <option value="activity">Agent Activity / Turns</option>
              <option value="message">Chat Messages</option>
              <option value="approval">Approvals</option>
              <option value="system">Gateway System</option>
            </select>

            {/* Play/Pause Toggle */}
            <Button
              variant={isPaused ? 'danger' : 'secondary'}
              size="sm"
              icon={isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              onClick={handleTogglePause}
            >
              {isPaused ? `Resume (${bufferedLogs.length})` : 'Pause'}
            </Button>

            {/* Auto-scroll Toggle */}
            <Button
              variant={autoScroll ? 'primary' : 'secondary'}
              size="sm"
              icon={<ArrowDown className="w-3.5 h-3.5" />}
              onClick={() => setAutoScroll(!autoScroll)}
            >
              Auto-Scroll
            </Button>

            {/* Clear Console */}
            <Button variant="secondary" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleClear} title="Clear displayed events">
              Clear
            </Button>

            {/* Export Logs */}
            <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Terminal Log Console */}
      <div className="rounded-xl bg-[#07080a] border border-[#1a1f2c] overflow-hidden shadow-2xl">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-[#0c0e14] border-b border-[#181d28] flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="text-slate-300 font-semibold ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              switch-agent-events.stream (sse)
            </span>
            <span className="text-slate-500 text-[10px] hidden md:inline">
              | {agents.length} agent{agents.length !== 1 ? 's' : ''} registered, {chats.length} active room{chats.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>{filteredLogs.length} events displayed</span>
            {isPaused ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                STREAM PAUSED {bufferedLogs.length > 0 && `(+${bufferedLogs.length})`}
              </span>
            ) : streamStatus === 'connected' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                STREAMING LIVE
              </span>
            ) : streamStatus === 'reconnecting' ? (
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                RECONNECTING
              </span>
            ) : (
              <span className="text-rose-400">OFFLINE</span>
            )}
          </div>
        </div>

        {/* Logs Output Stream */}
        <div className="p-4 font-mono text-[11px] leading-relaxed max-h-[620px] overflow-y-auto space-y-1.5 select-text">
          {loadingInitial && logs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <p>Connecting to Switch Gateway & loading event history...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#121622] border border-[#1e2538] flex items-center justify-center text-slate-400">
                <Radio className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-slate-300 font-medium text-xs">No Agent Events Streamed Yet</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Switch Gateway is actively connected and listening to{' '}
                  <code className="text-indigo-300">/gateway/chats/activity/events</code>. When registered agents (e.g.{' '}
                  {agents[0]?.name || 'devops-investigator'}) execute diagnostic commands, call tools, or exchange messages, real-time events will stream here.
                </p>
                {statusDetail && (
                  <p className="text-[10px] text-slate-600 font-mono mt-1">{statusDetail}</p>
                )}
              </div>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className={`p-2 rounded transition-colors cursor-pointer group ${
                    log.highlight
                      ? 'bg-rose-950/25 border-l-2 border-rose-500'
                      : 'hover:bg-[#10131b]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                    <span className="shrink-0">{getLevelBadge(log.level)}</span>
                    <span className="text-indigo-300 shrink-0 w-36 truncate font-semibold">
                      [{log.service}]
                    </span>
                    <span
                      className={`flex-1 break-words ${
                        log.level === 'ERROR'
                          ? 'text-rose-200'
                          : log.level === 'WARN'
                          ? 'text-amber-200'
                          : log.kind === 'message'
                          ? 'text-emerald-200'
                          : 'text-slate-300'
                      }`}
                    >
                      {log.message}
                    </span>
                    <span className="text-slate-500 shrink-0 text-[10px] hidden lg:inline">
                      trace={log.traceId}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${
                        isExpanded ? 'rotate-90 text-indigo-400' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded JSON Metadata */}
                  {isExpanded && log.metadata && (
                    <div className="mt-2 pl-28 pr-4 py-2 border-t border-[#1a1f2b] text-[10px] text-slate-400">
                      <pre className="bg-[#050608] p-3 rounded-lg border border-[#161a24] text-slate-300 overflow-x-auto leading-normal">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
