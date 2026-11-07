export type SeverityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  authorRole: 'agent' | 'human' | 'system';
  agentType?: 'commander' | 'diagnostician' | 'remediator' | 'librarian';
  title: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface Incident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  affectedService: string;
  environment: 'production' | 'staging' | 'development';
  assignedAgent: string;
  agentRole: string;
  leadEngineer: string;
  declaredAt: string;
  resolvedAt?: string;
  summary: string;
  rootCauseAnalysis?: {
    cause: string;
    trigger: string;
    confidence: number;
    culpritCommit?: {
      hash: string;
      message: string;
      author: string;
    };
    culpritPod?: string;
    stackTraceSnippet?: string;
  };
  recommendedActions: {
    id: string;
    title: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    actionType: 'rollback' | 'restart' | 'scale' | 'config_patch';
    command: string;
    approved?: boolean;
  }[];
  timeline: TimelineEvent[];
  switchRoom: string;
  errorRate: string;
  latencyMs: number;
}

