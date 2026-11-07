export type HealthStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

export interface ServiceHealth {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'frontend' | 'cache' | 'queue';
  status: HealthStatus;
  uptimePercentage: number;
  latencyMs: number;
  errorRate: number;
  requestsPerSec: number;
  activeIncidentsCount: number;
  lastChecked: string;
  cluster: string;
}

