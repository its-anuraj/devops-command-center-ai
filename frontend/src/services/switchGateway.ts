import { request, type ApiResponse } from './apiClient';

// ── Switch Gateway Backend Types ──────────────────────────────────────────────

export interface GatewayVersion {
  version: string;
  server_name?: string;
  commit?: string;
}

export interface BackendHealth {
  status: string;
}

export interface SwitchAuthConfig {
  password_login_enabled: boolean;
  signup_enabled: boolean;
  oidc_enabled: boolean;
  oidc_provider_label?: string | null;
  signup_mode?: string;
}

export interface SwitchAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  server?: {
    version: string;
    contracts?: Record<string, unknown>;
  };
}

export interface SwitchAgentSummary {
  id: string;
  name: string;
  display_name: string | null;
  description: string;
  connector_type: string;
  connection_model: string | null;
  tool_count: number;
  model_count: number;
  owner_id: string | null;
  owner_name: string | null;
  created_at: string;
  parent_agent_id?: string | null;
  known_agent_type?: string | null;
  known_agent_options?: Record<string, unknown> | null;
  addressing_policy?: string | null;
}

export interface SwitchAgentDetail extends SwitchAgentSummary {
  agent_type?: string;
  can_manage_agents?: boolean;
  tools?: Array<{
    name: string;
    description: string;
  }>;
  models?: Array<{
    id: string;
    name: string;
  }>;
  rooms?: Array<{
    room_id: string;
    room_name: string;
    archived: boolean;
    status: string;
    room_role: string | null;
  }>;
  sessions?: unknown[];
  children?: unknown[];
}

export interface SwitchApprovalOption {
  id: string;
  label: string;
  description?: string | null;
  decision?: 'accept' | 'acceptForSession' | 'decline' | 'cancel' | string;
}

export interface SwitchApprovalRequest {
  agent_id: string;
  session_id: string;
  request_id: string;
  turn_id: string;
  kind: string;
  room_id: string | null;
  thread_id: string | null;
  title: string;
  detail: string | null;
  options: SwitchApprovalOption[];
  state: 'open' | 'answered' | 'expired' | string;
  expires_at: string | null;
  answer: string | null;
  answered_by?: string | null;
  answered_at?: string | null;
}

export interface SwitchChatSummary {
  roomId: string;
  name: string;
  channelType: string;
  bridgeType: string | null;
  channelName: string | null;
  memberCount: number;
  unreadCount: number;
  agents: Array<{
    id: string;
    name: string;
    displayName: string | null;
  }>;
  lastMessage?: {
    text: string;
    timestamp: string;
    senderName: string;
  } | null;
}

export interface SwitchTemplateRun {
  root_room_id: string;
  root_room_name: string;
  started_by_name: string | null;
  template_name: string | null;
  started_at: string;
  last_activity_at: string;
  state: string;
  working: boolean;
  reason: string | null;
}

export interface SwitchActivityItem {
  agentId: string;
  sessionId: string;
  turnId: string;
  itemId: string;
  kind: string;
  revision: number;
  status: string;
  title: string;
  text: string;
  commandId?: string | null;
  roomId?: string | null;
  threadId?: string | null;
  messageId?: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwitchChatMessage {
  messageId: string;
  seq: number;
  roomId: string;
  sentAt: string;
  sender: {
    clientId: string;
    name: string;
    kind: string;
    agentId: string | null;
    userId: string | null;
  };
  source: string;
  body: string;
  format?: string | null;
  threadRootId?: string | null;
  attachments?: Array<{
    uri: string;
    filename: string;
    mimetype: string;
    size: number;
  }>;
  clientTxn?: string | null;
  namedAgentIds?: string[];
  namedUserIds?: string[];
  mentions?: unknown[];
  threadReplyCount?: number;
  threadLastReplySeq?: number | null;
}

export interface SwitchRoomActivity {
  items: SwitchActivityItem[];
  approvals: SwitchApprovalRequest[];
}

export interface SwitchMessagePage {
  messages: SwitchChatMessage[];
  headSeq: number;
  hasMore: boolean;
}

// ── Gateway API Methods ──────────────────────────────────────────────────────

export const switchGateway = {
  /**
   * Health check on Switch Core root (/health)
   */
  async checkHealth(): Promise<ApiResponse<BackendHealth>> {
    const healthUrl = import.meta.env.VITE_SWITCH_HEALTH_URL || '/health';
    return request<BackendHealth>({
      url: healthUrl,
      method: 'GET',
    });
  },

  /**
   * Gateway version info (/gateway/version)
   */
  async getVersion(): Promise<ApiResponse<GatewayVersion>> {
    return request<GatewayVersion>({
      url: '/version',
      method: 'GET',
    });
  },

  /**
   * Public authentication capabilities (/gateway/auth/config)
   */
  async getAuthConfig(): Promise<ApiResponse<SwitchAuthConfig>> {
    return request<SwitchAuthConfig>({
      url: '/auth/config',
      method: 'GET',
    });
  },

  /**
   * Authenticate with email & password (/gateway/auth/login)
   */
  async login(email: string, password: string): Promise<ApiResponse<SwitchAuthUser>> {
    return request<SwitchAuthUser>({
      url: '/auth/login',
      method: 'POST',
      data: {
        email,
        password,
      },
    });
  },

  /**
   * Terminate authenticated session (/gateway/auth/logout)
   */
  async logout(): Promise<ApiResponse<{ ok: boolean }>> {
    return request<{ ok: boolean }>({
      url: '/auth/logout',
      method: 'POST',
    });
  },

  /**
   * Current authenticated user (/gateway/auth/me)
   */
  async getCurrentUser(): Promise<ApiResponse<SwitchAuthUser>> {
    return request<SwitchAuthUser>({
      url: '/auth/me',
      method: 'GET',
    });
  },

  /**
   * List connected agents (/gateway/agents)
   */
  async getAgents(): Promise<ApiResponse<SwitchAgentSummary[]>> {
    return request<SwitchAgentSummary[]>({
      url: '/agents',
      method: 'GET',
    });
  },

  /**
   * Get detailed agent configuration and tools (/gateway/agents/{agent_id})
   */
  async getAgentDetail(agentId: string): Promise<ApiResponse<SwitchAgentDetail>> {
    return request<SwitchAgentDetail>({
      url: `/agents/${encodeURIComponent(agentId)}`,
      method: 'GET',
    });
  },

  /**
   * List incident chats / rooms (/gateway/chats)
   */
  async getChats(): Promise<ApiResponse<{ chats: SwitchChatSummary[] }>> {
    return request<{ chats: SwitchChatSummary[] }>({
      url: '/chats',
      method: 'GET',
    });
  },

  /**
   * List pending approvals (/gateway/agent-sessions/approvals)
   */
  async getApprovals(): Promise<ApiResponse<SwitchApprovalRequest[]>> {
    return request<SwitchApprovalRequest[]>({
      url: '/agent-sessions/approvals',
      method: 'GET',
    });
  },

  /**
   * Submit decision for an approval request
   * POST /gateway/agent-sessions/{agent_id}/{session_id}/approvals/{request_id}/answer
   */
  async answerApproval(
    agentId: string,
    sessionId: string,
    requestId: string,
    optionId: string
  ): Promise<ApiResponse<SwitchApprovalRequest>> {
    return request<SwitchApprovalRequest>({
      url: `/agent-sessions/${encodeURIComponent(agentId)}/${encodeURIComponent(sessionId)}/approvals/${encodeURIComponent(requestId)}/answer`,
      method: 'POST',
      data: {
        answer: optionId,
      },
    });
  },

  /**
   * List workflow / template runs (/gateway/template-runs)
   */
  async getTemplateRuns(): Promise<ApiResponse<SwitchTemplateRun[]>> {
    return request<SwitchTemplateRun[]>({
      url: '/template-runs',
      method: 'GET',
    });
  },

  /**
   * Get room activity items and approvals (/gateway/chats/{room_id}/activity)
   */
  async getRoomActivity(roomId: string): Promise<ApiResponse<SwitchRoomActivity>> {
    return request<SwitchRoomActivity>({
      url: `/chats/${encodeURIComponent(roomId)}/activity`,
      method: 'GET',
    });
  },

  /**
   * Get room messages (/gateway/chats/{room_id}/messages)
   */
  async getRoomMessages(roomId: string, limit = 50): Promise<ApiResponse<SwitchMessagePage>> {
    return request<SwitchMessagePage>({
      url: `/chats/${encodeURIComponent(roomId)}/messages?limit=${limit}`,
      method: 'GET',
    });
  },

  /**
   * Post message to a chat room (/gateway/chats/{room_id}/messages)
   */
  async sendRoomMessage(roomId: string, body: string): Promise<ApiResponse<{ messages: SwitchChatMessage[] }>> {
    return request<{ messages: SwitchChatMessage[] }>({
      url: `/chats/${encodeURIComponent(roomId)}/messages`,
      method: 'POST',
      data: {
        requestId: `req-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        body,
      },
    });
  },
};
