export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval' | 'skipped';

export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  assignedAgent: string;
  agentHandle: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  logs?: string[];
  output?: Record<string, unknown> | string;
  requiresHumanSignoff?: boolean;
}

export interface IncidentWorkflow {
  id: string;
  incidentId: string;
  incidentTitle: string;
  severity: 'P1' | 'P2' | 'P3';
  startedAt: string;
  status: 'active' | 'completed' | 'paused';
  currentStepIndex: number;
  steps: WorkflowStep[];
}

