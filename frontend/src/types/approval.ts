export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'open' | 'pending' | 'answered' | 'approved' | 'rejected' | 'expired';

export interface ApprovalOptionView {
  id: string;
  label: string;
  description?: string | null;
  decision?: 'accept' | 'acceptForSession' | 'decline' | 'cancel' | string;
}

export interface ApprovalRequest {
  id: string;
  requestId?: string;
  agentId?: string;
  agentName?: string;
  sessionId?: string;
  turnId?: string;
  kind?: string;
  roomId?: string | null;
  threadId?: string | null;
  title?: string;
  detail?: string | null;
  options?: ApprovalOptionView[];
  status: ApprovalStatus;
  requestedAt: string;
  expiresAt?: string | null;
  answer?: string | null;
  answeredBy?: string | null;
  answeredAt?: string | null;
  // Display properties
  actionTitle: string;
  actionDescription: string;
  requestingAgent: string;
  agentRole: string;
  targetService: string;
  environment: 'production' | 'staging' | 'development';
  riskLevel: RiskLevel;
  riskRationale?: string;
  commandSnippet?: string;
  decisionNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  executionStatus?: 'idle' | 'running' | 'success' | 'failed';
  incidentId?: string;
  incidentTitle?: string;
  proposedChanges?: {
    fileOrResource: string;
    diffSnippet: string;
  };
}
