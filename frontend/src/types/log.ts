export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export type EventKind = 'activity' | 'message' | 'approval' | 'system' | 'command';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  traceId: string;
  spanId?: string;
  metadata?: Record<string, unknown>;
  highlight?: boolean;
  kind?: EventKind;
  rawEvent?: unknown;
}

export type StreamConnectionStatus = 'connected' | 'reconnecting' | 'disconnected' | 'paused';

export interface LogFilter {
  service: string;
  level: string;
  search: string;
  kind?: string;
  autoScroll: boolean;
  isPaused: boolean;
}
