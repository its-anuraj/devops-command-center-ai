import type { SwitchActivityItem, SwitchChatMessage, SwitchApprovalRequest } from './switchGateway';
import type { StreamConnectionStatus } from '../types/log';

export interface SwitchStreamEvent {
  stream: 'activity' | 'chat';
  eventType: string;
  data: SwitchActivityItem | SwitchChatMessage | SwitchApprovalRequest | Record<string, unknown>;
  receivedAt: string;
}

export interface SwitchEventStreamListener {
  onEvent: (event: SwitchStreamEvent) => void;
  onStatusChange: (status: StreamConnectionStatus, detail?: string) => void;
}

const BASE_URL = import.meta.env.VITE_SWITCH_GATEWAY_URL || '/gateway';
const STALL_TIMEOUT_MS = 60_000;
const MAX_BACKOFF_MS = 30_000;

/**
 * SwitchEventStreamManager
 * Manages Server-Sent Events (SSE) connections to Switch Gateway:
 * - /gateway/chats/activity/events (Agent turn activity & approvals)
 * - /gateway/chats/events (Room messages & chat updates)
 */
export class SwitchEventStreamManager {
  private stopped = false;
  private isRunning = false;
  private status: StreamConnectionStatus = 'disconnected';
  private statusDetail: string | undefined = undefined;
  private abortController: AbortController | null = null;
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<SwitchEventStreamListener> = new Set();
  private lastPingTime = Date.now();
  private stallCheckInterval: ReturnType<typeof setInterval> | null = null;

  public subscribe(listener: SwitchEventStreamListener): () => void {
    this.listeners.add(listener);
    listener.onStatusChange(this.status, this.statusDetail);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(status: StreamConnectionStatus, detail?: string): void {
    this.status = status;
    this.statusDetail = detail;
    for (const listener of this.listeners) {
      listener.onStatusChange(status, detail);
    }
  }

  private emitEvent(event: SwitchStreamEvent): void {
    for (const listener of this.listeners) {
      listener.onEvent(event);
    }
  }

  public getStatus(): { status: StreamConnectionStatus; detail?: string; attempt: number } {
    return { status: this.status, detail: this.statusDetail, attempt: this.attempt };
  }

  public start(): void {
    if (this.isRunning && !this.stopped) return;
    this.stopped = false;
    this.isRunning = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.attempt = 0;
    void this.connectLoop();
  }

  public stop(): void {
    this.stopped = true;
    this.isRunning = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.stallCheckInterval) {
      clearInterval(this.stallCheckInterval);
      this.stallCheckInterval = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.setStatus('disconnected', 'Stream closed by user');
  }

  private async connectLoop(): Promise<void> {
    try {
      while (!this.stopped) {
        try {
          this.setStatus(this.attempt === 0 ? 'connected' : 'reconnecting', this.attempt > 0 ? `Reconnecting (attempt ${this.attempt})...` : undefined);
          this.abortController = new AbortController();
          const signal = this.abortController.signal;

          this.lastPingTime = Date.now();
          this.startStallWatchdog();

          // Connect both streams concurrently: activity events & chat events
          await Promise.all([
            this.consumeStream(`${BASE_URL}/chats/activity/events`, 'activity', signal),
            this.consumeStream(`${BASE_URL}/chats/events`, 'chat', signal),
          ]);

          if (this.stopped) return;
          throw new Error('Switch Gateway event stream closed unexpectedly');
        } catch (err: unknown) {
          if (this.stopped) return;

          const isAborted = err instanceof DOMException && err.name === 'AbortError';
          const errorMessage = err instanceof Error ? err.message : String(err);

          // If unauthorized or forbidden, do not retry automatically
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            this.setStatus('disconnected', 'Session expired. Please sign in again.');
            return;
          }

          if (isAborted) {
            // If aborted due to stall, retry
            console.warn('[SwitchEventStream] Connection stalled, reconnecting...');
          } else {
            console.warn('[SwitchEventStream] Connection dropped:', errorMessage);
          }

          this.attempt++;
          const backoffMs = Math.min(MAX_BACKOFF_MS, 1000 * Math.pow(1.5, Math.min(this.attempt, 8)));
          this.setStatus('reconnecting', `Connection lost. Retrying in ${(backoffMs / 1000).toFixed(1)}s (attempt ${this.attempt})...`);

          await new Promise<void>((resolve) => {
            this.reconnectTimer = setTimeout(() => {
              this.reconnectTimer = null;
              resolve();
            }, backoffMs);
          });
        } finally {
          if (this.stallCheckInterval) {
            clearInterval(this.stallCheckInterval);
            this.stallCheckInterval = null;
          }
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private startStallWatchdog(): void {
    if (this.stallCheckInterval) {
      clearInterval(this.stallCheckInterval);
    }
    this.stallCheckInterval = setInterval(() => {
      if (Date.now() - this.lastPingTime > STALL_TIMEOUT_MS) {
        console.warn('[SwitchEventStream] Heartbeat missed for 60s, aborting to reconnect');
        if (this.abortController) {
          this.abortController.abort();
        }
      }
    }, 15_000);
  }

  private async consumeStream(
    url: string,
    streamName: 'activity' | 'chat',
    signal: AbortSignal
  ): Promise<void> {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`SSE stream ${streamName} HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error(`SSE stream ${streamName} returned no response body`);
    }

    // Successfully connected stream
    this.setStatus('connected', 'Live stream active');
    this.attempt = 0;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffered = '';

    try {
      while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        this.lastPingTime = Date.now();
        buffered += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

        let at = buffered.indexOf('\n\n');
        while (at !== -1) {
          const block = buffered.slice(0, at);
          buffered = buffered.slice(at + 2);

          let event = 'message';
          const dataLines: string[] = [];

          for (const line of block.split('\n')) {
            if (line.startsWith(':')) {
              // Heartbeat comment, e.g. ": ping"
              this.lastPingTime = Date.now();
              continue;
            }
            if (line.startsWith('event:')) {
              event = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).replace(/^ /, ''));
            }
          }

          if (dataLines.length > 0) {
            const rawData = dataLines.join('\n');
            let parsedData: unknown = rawData;
            try {
              parsedData = JSON.parse(rawData);
            } catch {
              parsedData = { text: rawData };
            }

            // Skip internal empty ready/ping frames from emitting as raw log lines
            if (event !== 'ping') {
              this.emitEvent({
                stream: streamName,
                eventType: event,
                data: (parsedData ?? {}) as SwitchStreamEvent['data'],
                receivedAt: new Date().toISOString(),
              });
            }
          }

          at = buffered.indexOf('\n\n');
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Global singleton instance for shared connection across pages
export const switchEventStream = new SwitchEventStreamManager();

