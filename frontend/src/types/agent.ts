export type AgentStatus = 'ready' | 'working' | 'investigating' | 'no_session' | 'offline' | 'idle';

export interface AIAgentTool {
  name: string;
  description: string;
}

export interface AIAgentRoom {
  roomId: string;
  roomName: string;
  archived?: boolean;
  status?: string;
  roomRole?: string | null;
}

export interface AIAgent {
  id: string;
  name: string;
  displayName?: string | null;
  handle: string;
  connectorType?: string;
  connectionModel?: string | null;
  knownAgentType?: string | null;
  description?: string;
  status: AgentStatus;
  toolCount?: number;
  modelCount?: number;
  ownerName?: string | null;
  createdAt?: string;
  assignedRoom?: string;
  currentTask?: string;
  tools?: Array<AIAgentTool | string>;
  rooms?: AIAgentRoom[];
  knownAgentOptions?: Record<string, unknown> | null;
  role?: string;
  specialization?: string;
  avatarColor?: string;
  model?: string;
  uptime?: string;
  lastActive?: string;
  tasksCompleted?: number;
  accuracyRate?: number;
  avgResponseTime?: string;
  recentTasks?: Array<{
    id: string;
    incidentId?: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt: string;
    completedAt?: string;
    outputSummary?: string;
  }>;
  systemPromptSnippet?: string;
}
