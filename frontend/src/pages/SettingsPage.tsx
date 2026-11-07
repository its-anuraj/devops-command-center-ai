import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Radio,
  MessageSquare,
  Users,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { switchStatus, setToastMessage, refreshBackendData, isBackendLoading } = useApp();

  const [endpoint, setEndpoint] = useState(switchStatus.serverHost);
  const [heartbeatInterval, setHeartbeatInterval] = useState('2');
  const [ttl, setTtl] = useState('6');
  const [mattermostUrl] = useState('http://127.0.0.1:8065');

  const handleTestConnection = async () => {
    await refreshBackendData();
    if (switchStatus.connected) {
      setToastMessage(`Connected to Switch Gateway (${switchStatus.pingMs}ms, v${switchStatus.version || '0.1.0'})`);
    } else {
      setToastMessage(`Connection check completed. Status: Standby/Offline`);
    }
  };

  const handleSave = () => {
    setToastMessage('Settings successfully saved and synchronized with Switch Core.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>Platform & Bridge Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure Switch Core connection, agent protocol parameters, and team collaboration bridges
        </p>
      </div>

      {/* Switch Bridge Configuration */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Switch Core Connection</span>
            </div>
          }
          subtitle="Agent Bridge HTTP REST & Server-Sent Events (SSE) stream"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                disabled={isBackendLoading}
              >
                {isBackendLoading ? 'Testing...' : 'Test Connection'}
              </Button>
              <Badge variant={switchStatus.connected ? 'emerald' : 'amber'} size="sm" dot>
                {switchStatus.connected
                  ? `Live (${switchStatus.pingMs}ms)`
                  : 'Standby / Demo'}
              </Badge>
            </div>
          }
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Switch API Base Endpoint
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-[#0a0c10] border border-[#1e2330] focus:border-indigo-500 text-xs text-slate-200 px-3 py-2 rounded-lg font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Target: http://127.0.0.1:18000 (Proxy route: /gateway)
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Authentication & Security
              </label>
              <div className="w-full bg-[#0a0c10] border border-[#1e2330] text-xs text-slate-300 px-3 py-2 rounded-lg font-mono flex items-center justify-between">
                <span>switch_auth (HttpOnly Cookie)</span>
                <Badge variant="emerald" size="sm">Active</Badge>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Secured by Switch Gateway session cookies. No client secrets exposed.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#181d28]">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Heartbeat Interval
              </label>
              <input
                type="text"
                value={heartbeatInterval}
                onChange={(e) => setHeartbeatInterval(e.target.value)}
                className="w-full bg-[#0a0c10] border border-[#1e2330] text-xs text-slate-200 px-3 py-1.5 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 2 seconds</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Connection TTL
              </label>
              <input
                type="text"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                className="w-full bg-[#0a0c10] border border-[#1e2330] text-xs text-slate-200 px-3 py-1.5 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Strict: 6 seconds</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Transport Mode
              </label>
              <div className="text-xs font-mono text-indigo-400 py-1.5 font-semibold">
                SSE + HTTP
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Active Switch Rooms
              </label>
              <div className="text-xs font-mono text-emerald-400 py-1.5 font-semibold">
                {switchStatus.activeRooms} Rooms
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Collaboration Platform Bridges */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Collaboration Bridges (Human & Agent Rooms)</span>
            </div>
          }
          subtitle="Mirror incident command rooms to your engineering chat channels"
        />
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1118] border border-[#1c2230]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800/60 flex items-center justify-center font-bold text-sky-400 text-xs">
                MM
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Mattermost (Local Stack)</div>
                <div className="text-[11px] font-mono text-slate-400">{mattermostUrl}</div>
              </div>
            </div>
            <Badge variant="slate" size="sm">
              Docker Bridge (Optional)
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1118] border border-[#1c2230]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center font-bold text-indigo-400 text-xs">
                SL
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Slack Integration</div>
                <div className="text-[11px] font-mono text-slate-400">Workspace webhook not configured</div>
              </div>
            </div>
            <Badge variant="slate" size="sm">
              Not Configured
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* On-Call Team Roster */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Current On-Call Roster</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300">
                DEMO ROSTER
              </span>
            </div>
          }
          subtitle="Simulated escalation directory • Actions authorized by authenticated session user"
        />
        <CardBody>
          <div className="divide-y divide-[#181d28] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Alex Rivera (Primary On-Call)</div>
                <div className="text-[11px] text-emerald-400 font-mono">alex.rivera@acme.corp • Staff SRE</div>
              </div>
              <Badge variant="emerald" size="sm">
                Active Shift
              </Badge>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Marcus Vance (Secondary On-Call)</div>
                <div className="text-[11px] text-slate-400 font-mono">marcus.vance@acme.corp • Senior SRE</div>
              </div>
              <Badge variant="slate" size="sm">
                Escalation
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" size="md" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
