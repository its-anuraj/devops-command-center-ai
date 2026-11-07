import type { AIAgent } from '../types/agent';

export const initialAgents: AIAgent[] = [
  {
    id: 'agent-ops-commander',
    name: 'Ops Commander',
    handle: '@ops-commander',
    role: 'Incident Commander & Triage Lead',
    specialization: 'Alert ingestion, automated room creation, stakeholder liaison, severity classification',
    status: 'investigating',
    currentTask: 'Orchestrating INC-8041 war-room across Mattermost #inc-8041-payment',
    assignedRoom: 'switch-rooms/inc-8041-payment-failure',
    lastActive: 'Just now',
    avatarColor: 'indigo',
    model: 'Gemini 2.5 Flash / Switch Bridge',
    uptime: '14d 6h',
    tasksCompleted: 428,
    accuracyRate: 99.2,
    avgResponseTime: '1.4s',
    tools: [
      'switch_core.create_room',
      'switch_core.invite_agent_to_room',
      'switch_core.post_message',
      'pagerduty.declare_incident',
      'slack.channel_post'
    ],
    recentTasks: [
      {
        id: 'task-101',
        incidentId: 'INC-8041',
        title: 'Declared P1 incident for Payment Service 500 error spike',
        status: 'completed',
        startedAt: '12 mins ago',
        completedAt: '11 mins ago',
        outputSummary: 'War room created, invited @ops-diagnostician & on-call lead'
      },
      {
        id: 'task-102',
        incidentId: 'INC-8041',
        title: 'Streaming incident status digest to Mattermost & Slack',
        status: 'in_progress',
        startedAt: '4 mins ago'
      }
    ],
    systemPromptSnippet: 'You are the primary Incident Commander AI in Switch. Ingest alerts, open isolated rooms, triage severity, and orchestrate specialized agents.'
  },
  {
    id: 'agent-ops-diagnostician',
    name: 'Ops Diagnostician',
    handle: '@ops-diagnostician',
    role: 'Root Cause & Log Investigator',
    specialization: 'Deep log parsing, Kubernetes pod metrics, stack trace analysis, git commit blame',
    status: 'working',
    currentTask: 'Isolating OOM and connection leak in payment-service pod-74b89f',
    assignedRoom: 'switch-rooms/inc-8041-payment-failure',
    lastActive: '45s ago',
    avatarColor: 'purple',
    model: 'Gemini 2.5 Pro / Deep Reasoner',
    uptime: '28d 14h',
    tasksCompleted: 1240,
    accuracyRate: 98.6,
    avgResponseTime: '2.1s',
    tools: [
      'k8s.get_pod_logs',
      'prometheus.query_instant',
      'git.get_commit_diff',
      'switch_core.read_context',
      'switch_core.post_message'
    ],
    recentTasks: [
      {
        id: 'task-201',
        incidentId: 'INC-8041',
        title: 'Correlated 500 error spike with deploy v2.4.1 (commit 9c84e1b)',
        status: 'completed',
        startedAt: '8 mins ago',
        completedAt: '5 mins ago',
        outputSummary: 'Found connection pool exhaustion introduced in Stripe SDK v4 client init.'
      },
      {
        id: 'task-202',
        incidentId: 'INC-8041',
        title: 'Validating heap dump from payment-service-worker-b4',
        status: 'in_progress',
        startedAt: '2 mins ago'
      }
    ],
    systemPromptSnippet: 'You are the Lead SRE Diagnostician. Never guess root causes. Correlate timestamps, error codes, commit diffs, and pod telemetry.'
  },
  {
    id: 'agent-ops-remediator',
    name: 'Ops Remediator',
    handle: '@ops-remediator',
    role: 'Deployment & Rollback Engineer',
    specialization: 'Kubernetes rollout management, canary traffic routing, human-in-the-loop sign-off',
    status: 'working',
    currentTask: 'Drafting rollback plan for payment-service to v2.4.0 awaiting sign-off',
    assignedRoom: 'switch-rooms/inc-8041-payment-failure',
    lastActive: '1m ago',
    avatarColor: 'emerald',
    model: 'Gemini 2.5 Flash / Fast Actuator',
    uptime: '19d 2h',
    tasksCompleted: 680,
    accuracyRate: 99.8,
    avgResponseTime: '1.2s',
    tools: [
      'k8s.rollout_undo',
      'k8s.scale_deployment',
      'switch_core.request_approval',
      'switch_core.post_message'
    ],
    recentTasks: [
      {
        id: 'task-301',
        incidentId: 'INC-8041',
        title: 'Submitted urgent approval request for kubectl rollout undo',
        status: 'in_progress',
        startedAt: '3 mins ago',
        outputSummary: 'Target: payment-service deployment. Reverting from v2.4.1 to stable v2.4.0.'
      }
    ],
    systemPromptSnippet: 'You execute operational changes. Never run destructive or state-altering commands without verified human-in-the-loop approval.'
  },
  {
    id: 'agent-ops-librarian',
    name: 'Ops Librarian',
    handle: '@ops-librarian',
    role: 'SRE Knowledge & Post-Mortem Writer',
    specialization: 'Runbook search, SOP verification, automated post-mortem authoring, compliance tracking',
    status: 'idle',
    currentTask: 'Indexing incident timeline into Switch internal documentation',
    assignedRoom: 'switch-rooms/devops-knowledge-base',
    lastActive: '5m ago',
    avatarColor: 'blue',
    model: 'Gemini 2.5 Flash',
    uptime: '31d 8h',
    tasksCompleted: 915,
    accuracyRate: 99.4,
    avgResponseTime: '0.9s',
    tools: [
      'switch_core.create_room_document',
      'switch_core.load_internal_documents',
      'confluence.publish_postmortem',
      'github.create_issue'
    ],
    recentTasks: [
      {
        id: 'task-401',
        incidentId: 'INC-8040',
        title: 'Generated post-mortem document for Auth Redis Latency Spike',
        status: 'completed',
        startedAt: '4 hours ago',
        completedAt: '3 hours ago',
        outputSummary: 'Saved document to Switch Room Docs: "Post-Mortem: INC-8040 Redis Failover"'
      }
    ],
    systemPromptSnippet: 'You maintain SRE documentation integrity. Collate chronological event trails and generate actionable post-mortems.'
  }
];
