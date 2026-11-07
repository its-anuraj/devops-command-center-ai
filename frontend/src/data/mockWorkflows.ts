import type { IncidentWorkflow } from '../types/workflow';

export const initialWorkflows: IncidentWorkflow[] = [
  {
    id: 'WF-8041',
    incidentId: 'INC-8041',
    incidentTitle: 'Payment Gateway 500 Error Spike & Connection Timeout',
    severity: 'P1',
    startedAt: '14 mins ago',
    status: 'active',
    currentStepIndex: 5,
    steps: [
      {
        id: 1,
        title: 'Incident Detected',
        description: 'Datadog monitor breached threshold: payment-service error rate spiked to 4.85%.',
        assignedAgent: 'System Monitor',
        agentHandle: '@system-monitor',
        status: 'completed',
        startedAt: '14m ago',
        completedAt: '14m ago',
        duration: '1.2s',
        output: { alertId: 'ALERT-4402', metric: 'http.status_500.rate', value: 0.0485 }
      },
      {
        id: 2,
        title: 'Investigation Agent Assigned',
        description: 'Ops Commander declared P1 incident, spawned Switch Room #inc-8041-payment, and assigned Ops Diagnostician.',
        assignedAgent: 'Ops Commander',
        agentHandle: '@ops-commander',
        status: 'completed',
        startedAt: '13m ago',
        completedAt: '13m ago',
        duration: '3.4s',
        output: { roomCreated: 'switch-rooms/inc-8041-payment-failure', assignedLead: '@ops-diagnostician' }
      },
      {
        id: 3,
        title: 'Logs & Metrics Analyzed',
        description: 'Scanned 14,200 pod log entries and captured HikariPool connection starvation telemetry.',
        assignedAgent: 'Ops Diagnostician',
        agentHandle: '@ops-diagnostician',
        status: 'completed',
        startedAt: '12m ago',
        completedAt: '9m ago',
        duration: '2m 14s',
        output: { errorPattern: 'HikariPool-1 Timeout waiting for connection', affectedPods: ['pod-74b89f6d4-8m2kp'] }
      },
      {
        id: 4,
        title: 'Root Cause Identified',
        description: 'Correlated failure with deploy v2.4.1 (commit 9c84e1b) by j.smith introducing unclosed DB connection in Stripe webhook.',
        assignedAgent: 'Ops Diagnostician',
        agentHandle: '@ops-diagnostician',
        status: 'completed',
        startedAt: '9m ago',
        completedAt: '7m ago',
        duration: '1m 45s',
        output: { confidenceScore: 96, culpritCommit: '9c84e1b', file: 'StripeSettlementListener.kt:118' }
      },
      {
        id: 5,
        title: 'Fix & Rollback Proposed',
        description: 'Drafted deployment rollback plan to v2.4.0 and formulated canary validation checklist.',
        assignedAgent: 'Ops Remediator',
        agentHandle: '@ops-remediator',
        status: 'completed',
        startedAt: '7m ago',
        completedAt: '4m ago',
        duration: '2m 10s',
        output: { targetVersion: 'v2.4.0', command: 'kubectl rollout undo deployment/payment-service -n production' }
      },
      {
        id: 6,
        title: 'Human Approval Requested',
        description: 'Submitted Approval Request #APP-304. Waiting for authorized SRE sign-off to proceed with production rollout.',
        assignedAgent: 'Ops Remediator',
        agentHandle: '@ops-remediator',
        status: 'waiting_approval',
        startedAt: '4m ago',
        requiresHumanSignoff: true,
        output: { approvalId: 'APP-304', risk: 'HIGH', status: 'Awaiting Alex Rivera sign-off' }
      },
      {
        id: 7,
        title: 'Remediation Executed & Tests Validated',
        description: 'Execute zero-downtime rolling rollback and verify synthetic payments transaction suite.',
        assignedAgent: 'Ops Remediator',
        agentHandle: '@ops-remediator',
        status: 'pending',
        output: { expectedDuration: '90s', targetPods: 8 }
      },
      {
        id: 8,
        title: 'Workflow Completed & Post-Mortem Saved',
        description: 'Confirm health checks at 200 OK, close Switch war-room, and publish markdown post-mortem to Switch Docs.',
        assignedAgent: 'Ops Librarian',
        agentHandle: '@ops-librarian',
        status: 'pending',
        output: { destinationDoc: 'Switch Internal Docs / Incident Archive' }
      }
    ]
  },
  {
    id: 'WF-8040',
    incidentId: 'INC-8040',
    incidentTitle: 'Auth Service Latency Degradation (Redis Failover)',
    severity: 'P2',
    startedAt: '4 hours ago',
    status: 'completed',
    currentStepIndex: 8,
    steps: [
      {
        id: 1,
        title: 'Incident Detected',
        description: 'P99 latency monitor tripped on auth-service.',
        assignedAgent: 'System Monitor',
        agentHandle: '@system-monitor',
        status: 'completed'
      },
      {
        id: 2,
        title: 'Investigation Agent Assigned',
        description: 'Assigned @ops-diagnostician to investigate cache timeouts.',
        assignedAgent: 'Ops Commander',
        agentHandle: '@ops-commander',
        status: 'completed'
      },
      {
        id: 3,
        title: 'Logs Analyzed',
        description: 'Detected Redis connection timeouts during hardware maintenance.',
        assignedAgent: 'Ops Diagnostician',
        agentHandle: '@ops-diagnostician',
        status: 'completed'
      },
      {
        id: 4,
        title: 'Root Cause Identified',
        description: 'ElastiCache master failover with stale DNS socket caching in JVM.',
        assignedAgent: 'Ops Diagnostician',
        agentHandle: '@ops-diagnostician',
        status: 'completed'
      },
      {
        id: 5,
        title: 'Fix Proposed',
        description: 'Rolling restart of 6 auth worker pods to cycle connection sockets.',
        assignedAgent: 'Ops Remediator',
        agentHandle: '@ops-remediator',
        status: 'completed'
      },
      {
        id: 6,
        title: 'Human Approval Requested',
        description: 'Approved by Marcus Vance.',
        assignedAgent: 'Ops Remediator',
        agentHandle: '@ops-remediator',
        status: 'completed'
      },
      {
        id: 7,
        title: 'Tests Executed',
        description: 'Workers restarted smoothly; latency dropped back to 28ms.',
        assignedAgent: 'Ops Remediator',
        agentHandle: '@ops-remediator',
        status: 'completed'
      },
      {
        id: 8,
        title: 'Workflow Completed',
        description: 'Post-mortem documented and incident archived.',
        assignedAgent: 'Ops Librarian',
        agentHandle: '@ops-librarian',
        status: 'completed'
      }
    ]
  }
];
