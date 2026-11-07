export type DeploymentStatus = 'success' | 'in_progress' | 'failed' | 'rolled_back';

export interface Deployment {
  id: string;
  service: string;
  environment: 'production' | 'staging' | 'development';
  version: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  authorType: 'human' | 'agent' | 'ci';
  status: DeploymentStatus;
  startedAt: string;
  completedAt?: string;
  duration: string;
  healthStatus: 'healthy' | 'degraded' | 'critical';
  errorRate: string;
  rollbackTarget?: string;
  podsRunning: number;
  podsDesired: number;
  changelog: string[];
}

