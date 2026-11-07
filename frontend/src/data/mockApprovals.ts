import type { ApprovalRequest } from '../types/approval';

export const initialApprovals: ApprovalRequest[] = [
  {
    id: 'APP-304',
    incidentId: 'INC-8041',
    incidentTitle: 'Payment Gateway 500 Error Spike & Connection Timeout',
    requestingAgent: '@ops-remediator',
    agentRole: 'Deployment & Rollback Engineer',
    targetService: 'payment-service',
    environment: 'production',
    actionTitle: 'Emergency Rollback: payment-service to v2.4.0',
    actionDescription: 'Reverts Kubernetes deployment from problematic build v2.4.1 (commit 9c84e1b) to stable release v2.4.0. Will terminate Hikari connection leak and restore 0.02% baseline error rate.',
    riskLevel: 'high',
    riskRationale: 'Production rollback replaces 8 running worker pods. May cause transient 1-2s connection drop during zero-downtime rolling replacement.',
    commandSnippet: `kubectl rollout undo deployment/payment-service -n production
kubectl rollout status deployment/payment-service -n production --timeout=120s
kubectl get pods -l app=payment-service -n production`,
    proposedChanges: {
      fileOrResource: 'k8s/production/payment-service/deployment.yaml',
      diffSnippet: `@@ -18,3 +18,3 @@
     spec:
       containers:
-        - image: registry.acme.corp/payment-service:v2.4.1 # commit 9c84e1b
+        - image: registry.acme.corp/payment-service:v2.4.0 # commit 4e21a8d`
    },
    requestedAt: '4 mins ago (22:27 UTC)',
    status: 'pending'
  },
  {
    id: 'APP-303',
    incidentId: 'INC-8041',
    incidentTitle: 'Payment Gateway 500 Error Spike & Connection Timeout',
    requestingAgent: '@ops-diagnostician',
    agentRole: 'Root Cause & Log Investigator',
    targetService: 'payment-service',
    environment: 'production',
    actionTitle: 'Capture Java Flight Recorder & Heap Dump on Pod 8m2kp',
    actionDescription: 'Executes a 60-second non-invasive profiling session on the failing payment pod to capture thread dumps and HikariPool lock contention before rollback.',
    riskLevel: 'medium',
    riskRationale: 'Slight CPU increase (~5%) on single worker pod while capturing diagnostic snapshot.',
    commandSnippet: `kubectl exec -n production payment-service-deployment-74b89f6d4-8m2kp -- \\
  jcmd 1 JFR.start name=incident_8041 duration=60s filename=/tmp/dump.jfr`,
    requestedAt: '7 mins ago (22:24 UTC)',
    status: 'pending'
  },
  {
    id: 'APP-301',
    incidentId: 'INC-8040',
    incidentTitle: 'Auth Service Latency Degradation (Redis Failover)',
    requestingAgent: '@ops-remediator',
    agentRole: 'Deployment & Rollback Engineer',
    targetService: 'auth-service',
    environment: 'production',
    actionTitle: 'Rolling Restart: auth-service worker pods',
    actionDescription: 'Performs rolling restart of 6 auth-service worker pods to cycle stale Redis socket connections after primary failover.',
    riskLevel: 'low',
    riskRationale: 'Zero-downtime rolling update configured with maxUnavailable=0 and maxSurge=2.',
    commandSnippet: 'kubectl rollout restart deployment/auth-service -n production',
    requestedAt: '3 hours ago',
    status: 'approved',
    reviewedBy: 'Alex Rivera (Staff SRE)',
    reviewedAt: '3 hours ago',
    decisionNote: 'Verified primary Redis is green. Rolling restart approved.',
    executionStatus: 'success'
  },
  {
    id: 'APP-298',
    targetService: 'database-rds',
    environment: 'production',
    actionTitle: 'Terminate Slow Analytical Query PID 4912',
    requestingAgent: '@ops-diagnostician',
    agentRole: 'Root Cause & Log Investigator',
    actionDescription: 'Cancels query on PostgreSQL primary replica causing WAL replication lag spike to exceed 450s.',
    riskLevel: 'low',
    riskRationale: 'Cancels read-only query; reporter will receive PG cancellation error and can retry with index.',
    commandSnippet: 'SELECT pg_cancel_backend(4912);',
    requestedAt: 'Yesterday (11:22 UTC)',
    status: 'approved',
    reviewedBy: 'Sarah Connor (Lead DBA)',
    reviewedAt: 'Yesterday (11:23 UTC)',
    decisionNote: 'Query was blocking replication slot. Approved termination.',
    executionStatus: 'success'
  }
];
