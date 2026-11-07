import type { LogEntry } from '../types/log';

export const initialLogs: LogEntry[] = [
  {
    id: 'log-001',
    timestamp: '22:31:02.418',
    level: 'ERROR',
    service: 'payment-service',
    message: 'HikariPool-1 - Connection is not available, request timed out after 30005ms.',
    traceId: 'tr-9f8a2c1b',
    spanId: 'sp-4410',
    highlight: true,
    metadata: {
      pool: 'HikariPool-1',
      active: 40,
      idle: 0,
      waiting: 124,
      timeout_ms: 30000
    }
  },
  {
    id: 'log-002',
    timestamp: '22:31:01.890',
    level: 'ERROR',
    service: 'payment-service',
    message: 'POST /v1/checkout/process failed with HTTP 500: Database connection acquisition failure',
    traceId: 'tr-9f8a2c1b',
    highlight: true,
    metadata: {
      endpoint: '/v1/checkout/process',
      http_status: 500,
      client_ip: '198.51.100.42',
      duration_ms: 30042
    }
  },
  {
    id: 'log-003',
    timestamp: '22:30:58.210',
    level: 'WARN',
    service: 'api-gateway',
    message: 'Upstream payment-service returned 500 Internal Server Error (retrying 1/2)',
    traceId: 'tr-9f8a2c1b',
    metadata: {
      upstream_addr: '10.244.3.82:8080',
      retry_count: 1
    }
  },
  {
    id: 'log-004',
    timestamp: '22:30:52.104',
    level: 'INFO',
    service: 'switch-core',
    message: '[AgentBridge] Addressable message routed to agent @ops-diagnostician in room #inc-8041-payment-failure',
    traceId: 'sw-88192a00',
    metadata: {
      room_id: 'inc-8041-payment-failure',
      agent: '@ops-diagnostician',
      seq: 4812
    }
  },
  {
    id: 'log-005',
    timestamp: '22:30:45.670',
    level: 'WARN',
    service: 'payment-service',
    message: 'HikariPool-1 - Thread starvation warning: 82 threads blocked waiting on connection',
    traceId: 'tr-7b1409ea',
    highlight: true
  },
  {
    id: 'log-006',
    timestamp: '22:30:40.312',
    level: 'INFO',
    service: 'auth-service',
    message: 'Token verification succeeded for user usr_94b8102 (latency: 18ms)',
    traceId: 'tr-11029cba'
  },
  {
    id: 'log-007',
    timestamp: '22:30:35.801',
    level: 'DEBUG',
    service: 'database-rds',
    message: 'checkpoint complete: wrote 892 buffers (0.8%); 0 WAL file(s) added, 0 removed, 1 recycled',
    traceId: 'pg-chkpt-41'
  },
  {
    id: 'log-008',
    timestamp: '22:30:29.412',
    level: 'INFO',
    service: 'switch-core',
    message: '[CollaborationBridge] Mattermost sync webhook received for message ID mm_msg_7721',
    traceId: 'sw-881929fb'
  },
  {
    id: 'log-009',
    timestamp: '22:30:22.115',
    level: 'ERROR',
    service: 'payment-service',
    message: 'java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available',
    traceId: 'tr-3c9901aa',
    highlight: true,
    metadata: {
      exception: 'com.zaxxer.hikari.pool.HikariPool$PoolInitializationException',
      cause: 'Timeout waiting for connection from HikariPool-1'
    }
  },
  {
    id: 'log-010',
    timestamp: '22:30:15.900',
    level: 'INFO',
    service: 'api-gateway',
    message: 'GET /healthz status=200 latency=2.1ms remote=10.0.0.1 user_agent=kube-probe/1.29',
    traceId: 'gw-probe-99'
  },
  {
    id: 'log-011',
    timestamp: '22:30:08.520',
    level: 'INFO',
    service: 'frontend-web',
    message: 'CDN Cache HIT /assets/index-D64VDMd1.css (edge-node: ewr-01, 14ms)',
    traceId: 'fe-cdn-4402'
  },
  {
    id: 'log-012',
    timestamp: '22:29:55.109',
    level: 'DEBUG',
    service: 'switch-core',
    message: '[Heartbeat] Connection beat acknowledged for agent @ops-commander (cursor: 4812, ttl: 6s)',
    traceId: 'sw-beat-29'
  }
];
