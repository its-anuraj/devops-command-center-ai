import type { Incident } from '../types/incident';

export const initialIncidents: Incident[] = [
  {
    id: 'INC-8041',
    title: 'Payment Gateway 500 Error Spike & Connection Timeout',
    severity: 'P1',
    status: 'investigating',
    affectedService: 'Payment Service',
    environment: 'production',
    assignedAgent: 'Ops Diagnostician',
    agentRole: 'Lead Root Cause Analyst',
    leadEngineer: 'Alex Rivera (Staff SRE)',
    declaredAt: '14 mins ago (22:18 UTC)',
    summary: 'Payment service error rate spiked from 0.02% to 4.85% following production release v2.4.1. Multiple checkout transactions failing with HTTP 500.',
    rootCauseAnalysis: {
      cause: 'Database connection pool starvation triggered by unclosed client handles in new Stripe webhook listener.',
      trigger: 'Deployment v2.4.1 (commit 9c84e1b) introduced a synchronous db.checkout() call that fails to release connections under burst load.',
      confidence: 96,
      culpritCommit: {
        hash: '9c84e1b',
        message: 'feat(payments): integrate stripe direct webhook settlement listener',
        author: 'j.smith@acme.corp'
      },
      culpritPod: 'payment-service-deployment-74b89f6d4-8m2kp',
      stackTraceSnippet: `Error: PoolAcquireTimeoutException: Timeout waiting for connection from HikariPool-1
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:182)
    at com.acme.payment.db.PaymentConnectionFactory.acquire(PaymentConnectionFactory.kt:42)
    at com.acme.payment.webhooks.StripeSettlementListener.onEvent(StripeSettlementListener.kt:118)
    at org.springframework.kafka.listener.KafkaMessageListenerContainer$ListenerConsumer.run(KafkaMessageListenerContainer.java:1204)`
    },
    recommendedActions: [
      {
        id: 'rec-1',
        title: 'Emergency rollback payment-service to v2.4.0',
        risk: 'high',
        actionType: 'rollback',
        command: 'kubectl rollout undo deployment/payment-service -n production',
        approved: false
      },
      {
        id: 'rec-2',
        title: 'Increase Hikari pool max-lifetime and pool size temporarily',
        risk: 'medium',
        actionType: 'config_patch',
        command: 'kubectl set env deployment/payment-service HIKARI_MAX_POOL_SIZE=80 -n production',
        approved: false
      }
    ],
    timeline: [
      {
        id: 't-1',
        timestamp: '22:17:10 UTC',
        author: 'Datadog Alert Monitor',
        authorRole: 'system',
        title: 'High Error Rate Triggered',
        description: 'Payment-service HTTP 500 error rate breached warning threshold (>2%).'
      },
      {
        id: 't-2',
        timestamp: '22:17:45 UTC',
        author: '@ops-commander',
        authorRole: 'agent',
        agentType: 'commander',
        title: 'P1 Incident Declared & War Room Provisioned',
        description: 'Spawned Switch room #inc-8041-payment-failure, paged on-call SRE Alex Rivera, invited @ops-diagnostician.'
      },
      {
        id: 't-3',
        timestamp: '22:19:12 UTC',
        author: '@ops-diagnostician',
        authorRole: 'agent',
        agentType: 'diagnostician',
        title: 'Telemetry & Commit Correlation',
        description: 'Correlated anomaly start time with deployment v2.4.1 (18m ago). Isolated HikariPool connection starvation.'
      },
      {
        id: 't-4',
        timestamp: '22:24:00 UTC',
        author: '@ops-remediator',
        authorRole: 'agent',
        agentType: 'remediator',
        title: 'Rollback Action Formulated',
        description: 'Submitted Approval Request #APP-304 for kubectl rollout undo deployment/payment-service.'
      }
    ],
    switchRoom: 'switch-rooms/inc-8041-payment-failure',
    errorRate: '4.85%',
    latencyMs: 412
  },
  {
    id: 'INC-8040',
    title: 'Auth Service Latency Degradation (Redis Failover)',
    severity: 'P2',
    status: 'resolved',
    affectedService: 'Authentication Service',
    environment: 'production',
    assignedAgent: 'Ops Diagnostician',
    agentRole: 'Log & Metrics Specialist',
    leadEngineer: 'Marcus Vance (Senior SRE)',
    declaredAt: '4 hours ago',
    resolvedAt: '3 hours ago',
    summary: 'Redis session cache replica elevated latency during automated AWS ElastiCache node replacement. Resolved after successful Sentinel election.',
    rootCauseAnalysis: {
      cause: 'AWS ElastiCache hardware maintenance triggered failover; DNS TTL delay caused 3 minutes of socket connect timeouts.',
      trigger: 'Automated provider hypervisor patch.',
      confidence: 99
    },
    recommendedActions: [
      {
        id: 'rec-3',
        title: 'Flush dead connection pool sockets in auth-service workers',
        risk: 'low',
        actionType: 'restart',
        command: 'kubectl rollout restart deployment/auth-service -n production',
        approved: true
      }
    ],
    timeline: [
      {
        id: 't-20',
        timestamp: '18:12 UTC',
        author: '@ops-commander',
        authorRole: 'agent',
        title: 'Incident INC-8040 Opened',
        description: 'Elevated login latency detected (p99 > 850ms).'
      },
      {
        id: 't-21',
        timestamp: '18:25 UTC',
        author: '@ops-diagnostician',
        authorRole: 'agent',
        title: 'Redis Failover Confirmed',
        description: 'Confirmed new primary replica online; recommended rolling worker restart.'
      },
      {
        id: 't-22',
        timestamp: '18:40 UTC',
        author: 'Marcus Vance',
        authorRole: 'human',
        title: 'Incident Resolved',
        description: 'P99 latency normalized to 28ms across all auth endpoints.'
      }
    ],
    switchRoom: 'switch-rooms/inc-8040-auth-latency',
    errorRate: '0.05%',
    latencyMs: 28
  },
  {
    id: 'INC-8038',
    title: 'API Gateway Ingress Wildcard Certificate Expiry Warning',
    severity: 'P3',
    status: 'resolved',
    affectedService: 'API Gateway',
    environment: 'production',
    assignedAgent: 'Ops Remediator',
    agentRole: 'Automated Infrastructure Operator',
    leadEngineer: 'DevOps Automated Bot',
    declaredAt: 'Yesterday (14:00 UTC)',
    resolvedAt: 'Yesterday (14:15 UTC)',
    summary: 'Cert-manager failed DNS01 challenge for *.acme.corp due to Cloudflare API rate limiting. Certificate automatically re-minted after exponential backoff.',
    timeline: [
      {
        id: 't-30',
        timestamp: '14:00 UTC',
        author: '@ops-remediator',
        authorRole: 'agent',
        title: 'Certificate Challenge Retried',
        description: 'Retried DNS-01 ACME challenge with renewed Cloudflare API token.'
      }
    ],
    recommendedActions: [],
    switchRoom: 'switch-rooms/gateway-ops',
    errorRate: '0.00%',
    latencyMs: 14
  },
  {
    id: 'INC-8035',
    title: 'PostgreSQL Read Replica Replication Lag Spike',
    severity: 'P2',
    status: 'mitigated',
    affectedService: 'Database (PostgreSQL RDS)',
    environment: 'production',
    assignedAgent: 'Ops Diagnostician',
    agentRole: 'Database SRE',
    leadEngineer: 'Sarah Connor',
    declaredAt: '1 day ago',
    resolvedAt: '22 hours ago',
    summary: 'Heavy analytics reporting query on replica-2 caused WAL replay lag to exceed 450 seconds. Long-running query terminated.',
    timeline: [
      {
        id: 't-40',
        timestamp: '11:20 UTC',
        author: '@ops-diagnostician',
        authorRole: 'agent',
        title: 'Long-running Query Identified',
        description: 'Found PID 4912 running unindexed table scan for >42 minutes. Issued pg_cancel_backend.'
      }
    ],
    recommendedActions: [],
    switchRoom: 'switch-rooms/db-primary-ops',
    errorRate: '0.00%',
    latencyMs: 4
  }
];
