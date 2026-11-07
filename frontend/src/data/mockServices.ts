import type { ServiceHealth } from '../types/service';

export const initialServices: ServiceHealth[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway',
    type: 'api',
    status: 'operational',
    uptimePercentage: 99.99,
    latencyMs: 14,
    errorRate: 0.02,
    requestsPerSec: 14200,
    activeIncidentsCount: 0,
    lastChecked: 'Just now',
    cluster: 'k8s-prod-us-east-1a'
  },
  {
    id: 'auth-service',
    name: 'Authentication Service',
    type: 'service',
    status: 'operational',
    uptimePercentage: 99.98,
    latencyMs: 28,
    errorRate: 0.05,
    requestsPerSec: 3800,
    activeIncidentsCount: 0,
    lastChecked: 'Just now',
    cluster: 'k8s-prod-us-east-1a'
  },
  {
    id: 'payment-service',
    name: 'Payment Service',
    type: 'service',
    status: 'degraded',
    uptimePercentage: 98.42,
    latencyMs: 412,
    errorRate: 4.85,
    requestsPerSec: 1250,
    activeIncidentsCount: 1,
    lastChecked: '12s ago',
    cluster: 'k8s-prod-us-east-1b'
  },
  {
    id: 'database-rds',
    name: 'Database (PostgreSQL Primary)',
    type: 'database',
    status: 'operational',
    uptimePercentage: 99.99,
    latencyMs: 3.8,
    errorRate: 0.0,
    requestsPerSec: 24500,
    activeIncidentsCount: 0,
    lastChecked: 'Just now',
    cluster: 'rds-prod-pg16-ha'
  },
  {
    id: 'frontend-web',
    name: 'Frontend Web App',
    type: 'frontend',
    status: 'operational',
    uptimePercentage: 100.0,
    latencyMs: 45,
    errorRate: 0.01,
    requestsPerSec: 9600,
    activeIncidentsCount: 0,
    lastChecked: 'Just now',
    cluster: 'edge-cloudflare-cdn'
  }
];
