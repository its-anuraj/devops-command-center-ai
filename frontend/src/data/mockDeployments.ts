import type { Deployment } from '../types/deployment';

export const initialDeployments: Deployment[] = [
  {
    id: 'DEP-9812',
    service: 'Payment Service',
    environment: 'production',
    version: 'v2.4.1',
    commitHash: '9c84e1b',
    commitMessage: 'feat(payments): integrate stripe direct webhook settlement listener',
    author: 'j.smith',
    authorType: 'human',
    status: 'failed',
    startedAt: '35 mins ago',
    completedAt: '31 mins ago',
    duration: '3m 42s',
    healthStatus: 'critical',
    errorRate: '4.85%',
    rollbackTarget: 'v2.4.0 (DEP-9799)',
    podsRunning: 8,
    podsDesired: 8,
    changelog: [
      'Added Stripe Settlement webhook handler',
      'Configured Hikari database connection pool sizing',
      'Updated transaction retry policy'
    ]
  },
  {
    id: 'DEP-9810',
    service: 'Payment Service',
    environment: 'staging',
    version: 'v2.4.2-rc1',
    commitHash: '7a12b03',
    commitMessage: 'fix(payments): close db connection in finally block for stripe webhooks',
    author: '@ops-remediator',
    authorType: 'agent',
    status: 'in_progress',
    startedAt: '10 mins ago',
    duration: '1m 20s (running)',
    healthStatus: 'healthy',
    errorRate: '0.00%',
    podsRunning: 4,
    podsDesired: 4,
    changelog: [
      'Hotfix: Explicitly release Hikari connection on webhook acknowledgment',
      'Added automated unit test for concurrent settlement callbacks'
    ]
  },
  {
    id: 'DEP-9799',
    service: 'Payment Service',
    environment: 'production',
    version: 'v2.4.0',
    commitHash: '4e21a8d',
    commitMessage: 'chore(deps): bump payment client libraries and spring boot 3.3',
    author: 'CI / GitHub Actions',
    authorType: 'ci',
    status: 'success',
    startedAt: '2 days ago',
    completedAt: '2 days ago',
    duration: '4m 10s',
    healthStatus: 'healthy',
    errorRate: '0.02%',
    podsRunning: 8,
    podsDesired: 8,
    changelog: [
      'Framework upgrade to Spring Boot 3.3.4',
      'Cleaned up obsolete metrics collectors'
    ]
  },
  {
    id: 'DEP-9785',
    service: 'Authentication Service',
    environment: 'production',
    version: 'v3.1.2',
    commitHash: 'f03b29c',
    commitMessage: 'feat(auth): enable passkey WebAuthn biometric login option',
    author: 'm.vance',
    authorType: 'human',
    status: 'success',
    startedAt: '3 days ago',
    completedAt: '3 days ago',
    duration: '2m 55s',
    healthStatus: 'healthy',
    errorRate: '0.05%',
    podsRunning: 6,
    podsDesired: 6,
    changelog: [
      'WebAuthn credential registration endpoint',
      'Updated JWT signature cache TTL'
    ]
  },
  {
    id: 'DEP-9770',
    service: 'Frontend Web App',
    environment: 'production',
    version: 'v4.0.1',
    commitHash: 'b712fa9',
    commitMessage: 'perf(ui): lazy load dashboard analytics charts and minify assets',
    author: 'CI / GitHub Actions',
    authorType: 'ci',
    status: 'success',
    startedAt: '4 days ago',
    completedAt: '4 days ago',
    duration: '1m 45s',
    healthStatus: 'healthy',
    errorRate: '0.01%',
    podsRunning: 12,
    podsDesired: 12,
    changelog: [
      'Vite bundle optimization',
      'Edge CDN caching headers updated'
    ]
  }
];
