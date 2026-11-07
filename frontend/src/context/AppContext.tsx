import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Incident } from '../types/incident';
import type { AIAgent } from '../types/agent';
import type { ApprovalRequest, ApprovalStatus } from '../types/approval';
import type { ServiceHealth } from '../types/service';
import type { IncidentWorkflow } from '../types/workflow';
import type { Deployment } from '../types/deployment';
import type { LogEntry, LogLevel, StreamConnectionStatus } from '../types/log';
import { initialIncidents } from '../data/mockIncidents';
import { initialServices } from '../data/mockServices';
import { initialWorkflows } from '../data/mockWorkflows';
import { initialDeployments } from '../data/mockDeployments';
import {
  switchGateway,
  type SwitchChatSummary,
  type SwitchActivityItem,
  type SwitchChatMessage,
  type SwitchApprovalRequest,
} from '../services/switchGateway';
import {
  switchEventStream,
  type SwitchStreamEvent,
} from '../services/switchEventStream';
import { useAuth } from './AuthContext';

export type EnvironmentType = 'production' | 'staging' | 'development';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'incident' | 'approval' | 'agent' | 'deployment';
  timestamp: string;
  read: boolean;
}

export interface SwitchConnectionStatus {
  connected: boolean;
  serverHost: string;
  protocol: string;
  pingMs: number;
  activeRooms: number;
  version?: string;
  isLiveBackend?: boolean;
  error?: string | null;
}

interface AppContextType {
  environment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
  incidents: Incident[];
  agents: AIAgent[];
  agentsLoading: boolean;
  agentsError: string | null;
  approvals: ApprovalRequest[];
  approvalsLoading: boolean;
  approvalsError: string | null;
  approvalHistory: ApprovalRequest[];
  services: ServiceHealth[];
  workflows: IncidentWorkflow[];
  deployments: Deployment[];
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markAllNotificationsRead: () => void;
  approveAction: (approvalId: string, note?: string) => Promise<void>;
  rejectAction: (approvalId: string, note?: string) => Promise<void>;
  answerApprovalCustom: (approvalId: string, optionId: string) => Promise<void>;
  triggerMockIncident: () => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  switchStatus: SwitchConnectionStatus;
  refreshBackendData: () => Promise<void>;
  isBackendLoading: boolean;
  liveEvents: LogEntry[];
  activeRooms: SwitchChatSummary[];
  streamStatus: StreamConnectionStatus;
  streamStatusDetail?: string;
  postChatMessage: (roomId: string, body: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function formatTimestamp(isoString?: string): string {
  if (!isoString) return new Date().toLocaleTimeString('en-US', { hour12: false }) + '.000';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const time = d.toLocaleTimeString('en-US', { hour12: false });
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${time}.${ms}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [environment, setEnvironment] = useState<EnvironmentType>('production');
  const [incidents] = useState<Incident[]>(initialIncidents);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState<boolean>(true);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRequest[]>([]);
  const [services] = useState<ServiceHealth[]>(initialServices);
  const [workflows] = useState<IncidentWorkflow[]>(initialWorkflows);
  const [deployments] = useState<Deployment[]>(initialDeployments);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-8041');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBackendLoading, setIsBackendLoading] = useState<boolean>(false);

  // Live real-time stream state
  const [liveEvents, setLiveEvents] = useState<LogEntry[]>([]);
  const [activeRooms, setActiveRooms] = useState<SwitchChatSummary[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamConnectionStatus>('disconnected');
  const [streamStatusDetail, setStreamStatusDetail] = useState<string | undefined>(undefined);

  const seenNotificationIds = useRef<Set<string>>(new Set());
  const agentMapRef = useRef<Map<string, string>>(new Map());

  const [switchStatus, setSwitchStatus] = useState<SwitchConnectionStatus>({
    connected: false,
    serverHost: 'http://127.0.0.1:18000',
    protocol: 'Vite Proxy (/gateway) -> Switch Core',
    pingMs: 0,
    activeRooms: 0,
    version: undefined,
    isLiveBackend: false,
    error: null,
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-demo-1',
      title: '[Demo] Incident Alert (INC-8041)',
      message: 'Payment Gateway 500 error spike detected in us-east-1 (Simulated)',
      type: 'incident',
      timestamp: '14m ago',
      read: false,
    },
    {
      id: 'n-demo-2',
      title: '[Demo] Agent Room Assignment',
      message: '@ops-diagnostician joined room #inc-8041-payment-failure',
      type: 'agent',
      timestamp: '13m ago',
      read: true,
    },
  ]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  // Convert SSE Stream event to LogEntry
  const mapStreamEventToLog = useCallback((event: SwitchStreamEvent, agentMap: Map<string, string>): LogEntry | null => {
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
      const item = data as SwitchActivityItem;
      if (!item.itemId) return null;
      let level: LogLevel = 'INFO';
      if (item.status === 'failed' || item.kind === 'error') level = 'ERROR';
      else if (item.status === 'pending') level = 'WARN';
      else if (item.status === 'running') level = 'DEBUG';

      const agentName = agentMap.get(item.agentId) || (item.agentId ? `agent:${item.agentId.slice(0, 8)}` : 'switch-agent');

      return {
        id: `act-${item.agentId}-${item.turnId}-${item.itemId}`,
        timestamp: formatTimestamp(item.occurredAt || item.createdAt || receivedAt),
        level,
        service: agentName,
        message: `[${(item.kind || 'activity').toUpperCase()}] ${item.title || ''}${item.text ? `: ${item.text}` : ''}`,
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
          occurredAt: item.occurredAt,
          createdAt: item.createdAt,
        },
      };
    }

    if (eventType === 'approval') {
      const app = data as SwitchApprovalRequest;
      if (!app.request_id) return null;
      const agentName = agentMap.get(app.agent_id) || `@agent-${app.agent_id.slice(0, 6)}`;

      return {
        id: `app-${app.request_id}`,
        timestamp: formatTimestamp(app.answered_at || app.expires_at || receivedAt),
        level: app.state === 'open' ? 'WARN' : 'INFO',
        service: agentName,
        message: `[APPROVAL_${(app.state || 'request').toUpperCase()}] ${app.title || 'Human authorization required'}${app.detail ? `: ${app.detail}` : ''}`,
        traceId: app.session_id ? `sess-${app.session_id.slice(0, 8)}` : 'session-none',
        spanId: `req-${app.request_id.slice(0, 8)}`,
        kind: 'approval',
        highlight: app.state === 'open',
        metadata: { ...app },
      };
    }

    if (eventType === 'message') {
      const msg = data as SwitchChatMessage;
      if (!msg.messageId && typeof msg.seq !== 'number') return null;
      const senderName = msg.sender?.name || (msg.sender?.kind === 'agent' ? 'agent' : 'human');
      const isError = msg.body?.toLowerCase().includes('error') || msg.body?.toLowerCase().includes('failed');

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
          sentAt: msg.sentAt,
        },
      };
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

    return null;
  }, []);

  // ── Sync with Switch Gateway Backend ───────────────────────────────────────
  const refreshBackendData = useCallback(async () => {
    setIsBackendLoading(true);
    const startTime = performance.now();

    try {
      // 1. Probe version and health
      const [versionRes, healthRes] = await Promise.all([
        switchGateway.getVersion(),
        switchGateway.checkHealth(),
      ]);

      const durationMs = Math.round(performance.now() - startTime);

      if (versionRes.data || healthRes.data) {
        setSwitchStatus((prev) => ({
          ...prev,
          connected: true,
          pingMs: durationMs,
          version: versionRes.data?.version || '0.1.0',
          isLiveBackend: true,
          error: null,
        }));

        // 2. Fetch real agents from Switch Gateway
        setAgentsLoading(true);
        const agentsRes = await switchGateway.getAgents();
        const map = new Map<string, string>();
        if (agentsRes.data) {
          const liveAgents: AIAgent[] = agentsRes.data.map((ag) => {
            const name = ag.display_name || ag.name;
            map.set(ag.id, name);
            return {
              id: ag.id,
              name,
              displayName: ag.display_name,
              handle: `@${ag.name.toLowerCase().replace(/\s+/g, '-')}`,
              connectorType: ag.connector_type || 'Switch Native',
              connectionModel: ag.connection_model || 'session_addressable',
              knownAgentType: ag.known_agent_type || 'antigravity',
              description: ag.description || 'Autonomous Switch agent.',
              status: 'ready',
              toolCount: ag.tool_count || 0,
              modelCount: ag.model_count || 0,
              ownerName: ag.owner_name || 'Admin',
              createdAt: ag.created_at,
              assignedRoom: 'DevOps Command Center',
              knownAgentOptions: ag.known_agent_options,
              role: ag.connector_type ? `${ag.connector_type} Agent` : 'DevOps Specialist',
              specialization: ag.description || 'Autonomous Switch Agent',
              avatarColor: 'from-blue-600 to-indigo-700',
              model: ag.connection_model || 'Switch Native',
              uptime: 'Online',
            };
          });
          setAgents(liveAgents);
          agentMapRef.current = map;
          setAgentsError(null);
        } else if (agentsRes.error) {
          setAgentsError(agentsRes.error);
        }
        setAgentsLoading(false);

        // 3. Fetch real approvals from Switch Gateway
        setApprovalsLoading(true);
        const approvalsRes = await switchGateway.getApprovals();
        if (approvalsRes.data) {
          const liveApprovals: ApprovalRequest[] = approvalsRes.data.map((app) => ({
            id: app.request_id,
            requestId: app.request_id,
            agentId: app.agent_id,
            agentName: `@agent-${app.agent_id.slice(0, 6)}`,
            sessionId: app.session_id,
            turnId: app.turn_id,
            kind: app.kind,
            roomId: app.room_id,
            threadId: app.thread_id,
            title: app.title || 'Agent Action Authorization Required',
            detail: app.detail,
            options: app.options || [],
            status: (app.state === 'open' ? 'pending' : app.state === 'answered' ? 'approved' : app.state) as ApprovalStatus,
            requestedAt: app.expires_at ? `Expires ${new Date(app.expires_at).toLocaleTimeString()}` : 'Just now',
            expiresAt: app.expires_at,
            answer: app.answer,
            answeredBy: app.answered_by,
            answeredAt: app.answered_at ? new Date(app.answered_at).toLocaleTimeString() : undefined,
            // Display fields
            actionTitle: app.title || 'Switch Agent Action Approval',
            actionDescription: app.detail || 'The autonomous agent requires explicit human authorization to proceed.',
            requestingAgent: `@agent-${app.agent_id.slice(0, 6)}`,
            agentRole: 'Switch Autonomous Agent',
            targetService: app.room_id ? `Room: ${app.room_id.slice(0, 8)}` : 'Switch Cluster',
            environment: 'production',
            riskLevel: 'high',
            commandSnippet: app.options && app.options.length > 0
              ? app.options.map((o) => `[${o.id}] ${o.label}${o.description ? ` (${o.description})` : ''}`).join('\n')
              : 'Action requires confirmation',
          }));

          const pendingLive = liveApprovals.filter((a) => a.status === 'pending' || a.status === 'open');
          setApprovals(pendingLive);

          if (pendingLive.length > 0) {
            const realNotifs: NotificationItem[] = pendingLive.map((a) => ({
              id: `notif-app-${a.requestId || a.id}`,
              title: `Authorization Required: ${(a.actionTitle || 'Switch Action').slice(0, 36)}`,
              message: a.actionDescription || 'An autonomous agent requires human sign-off.',
              type: 'approval',
              timestamp: 'Pending',
              read: false,
            }));
            setNotifications((prev) => {
              const demoOnes = prev.filter((p) => !p.id.startsWith('notif-app-'));
              return [...realNotifs, ...demoOnes];
            });
          } else {
            setNotifications((prev) => prev.filter((p) => !p.id.startsWith('notif-app-')));
          }

          const answeredFromBackend = liveApprovals.filter((a) => a.status === 'approved' || a.status === 'answered' || a.status === 'rejected');
          if (answeredFromBackend.length > 0) {
            setApprovalHistory((prev) => {
              const existingIds = new Set(prev.map((p) => p.requestId));
              const newItems = answeredFromBackend.filter((a) => !existingIds.has(a.requestId));
              return [...newItems, ...prev];
            });
          }
          setApprovalsError(null);
        } else if (approvalsRes.error) {
          setApprovalsError(approvalsRes.error);
        }
        setApprovalsLoading(false);

        // 4. Fetch real chats/rooms
        const chatsRes = await switchGateway.getChats();
        const chatList = chatsRes.data?.chats || [];
        setActiveRooms(chatList);
        if (chatList.length > 0) {
          setSwitchStatus((prev) => ({
            ...prev,
            activeRooms: chatList.length,
          }));

          // Pre-populate liveEvents with historical logs from active rooms
          const snapshotLogs: LogEntry[] = [];
          for (const chat of chatList) {
            try {
              const [messagesRes, activityRes] = await Promise.all([
                switchGateway.getRoomMessages(chat.roomId, 30),
                switchGateway.getRoomActivity(chat.roomId),
              ]);

              if (messagesRes.data?.messages) {
                for (const msg of messagesRes.data.messages) {
                  const entry = mapStreamEventToLog(
                    { stream: 'chat', eventType: 'message', data: msg, receivedAt: msg.sentAt },
                    map
                  );
                  if (entry) snapshotLogs.push(entry);
                }
              }

              if (activityRes.data?.items) {
                for (const item of activityRes.data.items) {
                  const entry = mapStreamEventToLog(
                    { stream: 'activity', eventType: 'activity', data: item, receivedAt: item.occurredAt },
                    map
                  );
                  if (entry) snapshotLogs.push(entry);
                }
              }
            } catch (snapErr) {
              console.warn('Failed to load snapshot for room', chat.roomId, snapErr);
            }
          }

          if (snapshotLogs.length > 0) {
            setLiveEvents((prev) => {
              const idMap = new Map(prev.map((e) => [e.id, e]));
              for (const log of snapshotLogs) {
                if (!idMap.has(log.id)) {
                  idMap.set(log.id, log);
                }
              }
              const combined = Array.from(idMap.values());
              combined.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
              return combined.slice(-500);
            });
          }
        }
      } else {
        // Backend offline or unreachable
        setAgentsLoading(false);
        setAgentsError(versionRes.error || healthRes.error || 'Switch Gateway not responding on http://127.0.0.1:18000');
        setApprovalsLoading(false);
        setApprovalsError(versionRes.error || healthRes.error || 'Switch Gateway not responding on http://127.0.0.1:18000');
        setSwitchStatus((prev) => ({
          ...prev,
          connected: false,
          pingMs: 0,
          isLiveBackend: false,
          error: versionRes.error || healthRes.error || 'Switch Gateway not responding on http://127.0.0.1:18000',
        }));
      }
    } catch (err: unknown) {
      setAgentsLoading(false);
      setAgentsError((err as Error)?.message || 'Connection error');
      setApprovalsLoading(false);
      setApprovalsError((err as Error)?.message || 'Connection error');
      setSwitchStatus((prev) => ({
        ...prev,
        connected: false,
        pingMs: 0,
        isLiveBackend: false,
        error: (err as Error)?.message || 'Connection error',
      }));
    } finally {
      setIsBackendLoading(false);
    }
  }, [mapStreamEventToLog]);

  // ── Global SSE Stream Connection Lifecycle ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      switchEventStream.stop();
      return;
    }

    void refreshBackendData();

    // Subscribe to unified SSE stream
    const unsubscribe = switchEventStream.subscribe({
      onStatusChange: (status, detail) => {
        setStreamStatus(status);
        setStreamStatusDetail(detail);
        if (status === 'connected') {
          setSwitchStatus((prev) => ({ ...prev, connected: true, isLiveBackend: true, error: null }));
        } else if (status === 'disconnected') {
          setSwitchStatus((prev) => ({ ...prev, connected: false }));
        }
      },
      onEvent: (event) => {
        // Append live event to liveEvents
        const entry = mapStreamEventToLog(event, agentMapRef.current);
        if (entry) {
          setLiveEvents((prev) => {
            if (prev.some((p) => p.id === entry.id)) {
              return prev.map((p) => (p.id === entry.id ? entry : p));
            }
            return [...prev, entry].slice(-500);
          });
        }

        // Live approval event
        if (event.eventType === 'approval') {
          const app = event.data as SwitchApprovalRequest;
          if (app.request_id) {
            const notifId = `notif-app-${app.request_id}`;
            if (!seenNotificationIds.current.has(notifId)) {
              seenNotificationIds.current.add(notifId);
              setNotifications((prev) => [
                {
                  id: notifId,
                  title: `Action Authorization: ${(app.title || 'Switch Action').slice(0, 36)}`,
                  message: app.detail || 'An autonomous agent requires explicit human authorization.',
                  type: 'approval',
                  timestamp: 'Just now',
                  read: false,
                },
                ...prev,
              ]);
            }
            void refreshBackendData();
          }
        }

        // Live agent message
        if (event.eventType === 'message') {
          const msg = event.data as SwitchChatMessage;
          if (msg.messageId && msg.sender?.kind === 'agent') {
            const notifId = `notif-msg-${msg.messageId}`;
            if (!seenNotificationIds.current.has(notifId)) {
              seenNotificationIds.current.add(notifId);
              setNotifications((prev) => [
                {
                  id: notifId,
                  title: `Message from ${msg.sender.name}`,
                  message: msg.body.slice(0, 100),
                  type: 'agent',
                  timestamp: 'Just now',
                  read: false,
                },
                ...prev,
              ]);
            }
          }
        }

        // Live agent activity step
        if (event.eventType === 'activity') {
          const item = event.data as SwitchActivityItem;
          if (item.agentId) {
            setAgents((prev) =>
              prev.map((ag) =>
                ag.id === item.agentId
                  ? {
                      ...ag,
                      status:
                        item.status === 'running'
                          ? 'working'
                          : item.status === 'failed'
                          ? 'investigating'
                          : 'ready',
                    }
                  : ag
              )
            );

            if (item.status === 'failed' || item.kind === 'error') {
              const notifId = `notif-err-${item.itemId || item.turnId}`;
              if (!seenNotificationIds.current.has(notifId)) {
                seenNotificationIds.current.add(notifId);
                setNotifications((prev) => [
                  {
                    id: notifId,
                    title: `Agent Action Failed: ${item.title || 'Tool Error'}`,
                    message: item.text || 'Step execution encountered an error.',
                    type: 'agent',
                    timestamp: 'Just now',
                    read: false,
                  },
                  ...prev,
                ]);
              }
            }
          }
        }

        // Live room update
        if (event.eventType === 'chat') {
          void switchGateway.getChats().then((res) => {
            if (res.data?.chats) {
              setActiveRooms(res.data.chats);
              setSwitchStatus((prev) => ({ ...prev, activeRooms: res.data!.chats.length }));
            }
          });
        }
      },
    });

    switchEventStream.start();

    const interval = setInterval(() => {
      void refreshBackendData();
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isAuthenticated, mapStreamEventToLog, refreshBackendData]);

  // ── Approval Decision Handlers (Exact Switch Gateway Protocol) ────────────
  const approveAction = async (approvalId: string, note = 'Approved by on-call engineer') => {
    const target = approvals.find((a) => a.id === approvalId || a.requestId === approvalId);
    if (!target) return;

    const options = target.options || [];
    const acceptOption = options.find(
      (o) =>
        o.decision === 'accept' ||
        o.decision === 'acceptForSession' ||
        o.id === 'approve' ||
        o.label.toLowerCase().includes('approve') ||
        o.label.toLowerCase().includes('accept')
    ) || options[0];

    if (acceptOption && target.agentId && target.sessionId) {
      const res = await switchGateway.answerApproval(
        target.agentId,
        target.sessionId,
        target.requestId || target.id,
        acceptOption.id
      );
      if (res.error) {
        showToast(`Approval failed: ${res.error}`);
        return;
      }
    }

    // Move to history
    const historyItem: ApprovalRequest = {
      ...target,
      status: 'approved',
      reviewedBy: 'Staff SRE (On-Call)',
      reviewedAt: 'Just now',
      decisionNote: note,
    };
    setApprovalHistory((prev) => [historyItem, ...prev]);

    // Remove from pending
    setApprovals((prev) => prev.filter((a) => a.id !== target.id && a.requestId !== target.requestId));

    showToast(`Approved & Executed: ${target.actionTitle}`);
    await refreshBackendData();
  };

  const rejectAction = async (approvalId: string, note = 'Action rejected by on-call engineer') => {
    const target = approvals.find((a) => a.id === approvalId || a.requestId === approvalId);
    if (!target) return;

    const options = target.options || [];
    const rejectOption = options.find(
      (o) =>
        o.decision === 'decline' ||
        o.decision === 'cancel' ||
        o.id === 'reject' ||
        o.label.toLowerCase().includes('reject') ||
        o.label.toLowerCase().includes('decline') ||
        o.label.toLowerCase().includes('cancel')
    ) || options[1] || options[0];

    if (rejectOption && target.agentId && target.sessionId) {
      const res = await switchGateway.answerApproval(
        target.agentId,
        target.sessionId,
        target.requestId || target.id,
        rejectOption.id
      );
      if (res.error) {
        showToast(`Rejection failed: ${res.error}`);
        return;
      }
    }

    // Move to history
    const historyItem: ApprovalRequest = {
      ...target,
      status: 'rejected',
      reviewedBy: 'Staff SRE (On-Call)',
      reviewedAt: 'Just now',
      decisionNote: note,
    };
    setApprovalHistory((prev) => [historyItem, ...prev]);

    setApprovals((prev) => prev.filter((a) => a.id !== target.id && a.requestId !== target.requestId));

    showToast(`Rejected: ${target.actionTitle}`);
    await refreshBackendData();
  };

  const answerApprovalCustom = async (approvalId: string, optionId: string) => {
    const target = approvals.find((a) => a.id === approvalId || a.requestId === approvalId);
    if (!target) return;

    const options = target.options || [];
    const chosenOption = options.find((o) => o.id === optionId);

    if (target.agentId && target.sessionId) {
      const res = await switchGateway.answerApproval(
        target.agentId,
        target.sessionId,
        target.requestId || target.id,
        optionId
      );
      if (res.error) {
        showToast(`Action failed: ${res.error}`);
        return;
      }
    }

    const isAccept = chosenOption?.decision === 'accept' || chosenOption?.decision === 'acceptForSession' || optionId === 'approve';
    const historyItem: ApprovalRequest = {
      ...target,
      status: isAccept ? 'approved' : 'rejected',
      reviewedBy: 'Staff SRE (On-Call)',
      reviewedAt: 'Just now',
      decisionNote: `Selected: ${chosenOption?.label || optionId}`,
    };
    setApprovalHistory((prev) => [historyItem, ...prev]);
    setApprovals((prev) => prev.filter((a) => a.id !== target.id && a.requestId !== target.requestId));

    showToast(`Decision recorded: ${chosenOption?.label || optionId}`);
    await refreshBackendData();
  };

  // Post message to a chat room
  const postChatMessage = async (roomId: string, body: string): Promise<boolean> => {
    const res = await switchGateway.sendRoomMessage(roomId, body);
    if (res.data?.messages) {
      showToast('Message sent to Switch Room');
      for (const msg of res.data.messages) {
        const entry = mapStreamEventToLog(
          { stream: 'chat', eventType: 'message', data: msg, receivedAt: msg.sentAt },
          agentMapRef.current
        );
        if (entry) {
          setLiveEvents((prev) => (prev.some((p) => p.id === entry.id) ? prev : [...prev, entry]));
        }
      }
      return true;
    }
    if (res.error) {
      showToast(`Failed to send message: ${res.error}`);
    }
    return false;
  };

  const triggerMockIncident = () => {
    showToast('Simulated Alert: High CPU & Redis contention detected on Auth Service.');
  };

  return (
    <AppContext.Provider
      value={{
        environment,
        setEnvironment,
        incidents,
        agents,
        agentsLoading,
        agentsError,
        approvals,
        approvalsLoading,
        approvalsError,
        approvalHistory,
        services,
        workflows,
        deployments,
        selectedIncidentId,
        setSelectedIncidentId,
        selectedAgentId,
        setSelectedAgentId,
        notifications,
        unreadNotificationCount,
        markAllNotificationsRead,
        approveAction,
        rejectAction,
        answerApprovalCustom,
        triggerMockIncident,
        toastMessage,
        setToastMessage,
        switchStatus,
        refreshBackendData,
        isBackendLoading,
        liveEvents,
        activeRooms,
        streamStatus,
        streamStatusDetail,
        postChatMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
