import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { switchGateway, type SwitchAgentDetail } from '../services/switchGateway';
import type { AIAgent } from '../types/agent';
import {
  Bot,
  Wrench,
  Radio,
  Layers,
  Cpu,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  User,
} from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const { agents, agentsLoading, agentsError, switchStatus, refreshBackendData, isBackendLoading } = useApp();
  const [modalAgent, setModalAgent] = useState<AIAgent | null>(null);
  const [agentDetail, setAgentDetail] = useState<SwitchAgentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch agent detail when modal opens
  useEffect(() => {
    if (!modalAgent) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await switchGateway.getAgentDetail(modalAgent.id);
        if (isMounted && res.data) {
          setAgentDetail(res.data);
        }
      } catch {
        // Fallback to summary
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    };

    void fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [modalAgent]);

  const closeModal = () => {
    setModalAgent(null);
    setAgentDetail(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#0e1119] to-[#0c0e14] border border-indigo-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Switch AI Agent Fleet
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {agents.length} Registered {agents.length === 1 ? 'Agent' : 'Agents'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live registered AI agents connected to Switch Gateway via Antigravity CLI and model connectors.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refreshBackendData()}
            disabled={isBackendLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBackendLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <div className="px-3 py-1.5 rounded-lg bg-[#141823] border border-[#212738] text-slate-300 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                switchStatus.connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'
              }`}
            ></span>
            <span>:18000 /gateway</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {agentsLoading && agents.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-[#0d0f17] border border-[#1b2130]">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-300">Querying Switch Gateway Agents...</p>
          <p className="text-[11px] text-slate-500 mt-1">Connecting to /gateway/agents on port 18000</p>
        </div>
      )}

      {/* Error State */}
      {!agentsLoading && agentsError && agents.length === 0 && (
        <div className="p-6 rounded-xl bg-red-950/20 border border-red-800/40 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-red-200">Failed to Load Agents</h3>
          <p className="text-xs text-red-300/80 mt-1 max-w-md mx-auto">{agentsError}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refreshBackendData()}
            className="mt-4"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Honest Empty State */}
      {!agentsLoading && !agentsError && agents.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-[#0c0e15] border border-dashed border-[#222838]">
          <div className="w-12 h-12 rounded-2xl bg-[#131722] border border-[#1e2436] flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No AI Agents Registered</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Switch Gateway currently has 0 registered agents in this workspace. Agents registered via Antigravity or Switch CLI will appear here in real time.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-[#07090e] border border-[#181d2a] max-w-md mx-auto text-left">
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5 mb-1">
              <Terminal className="w-3 h-3 text-indigo-400" />
              <span>Register an Agent</span>
            </div>
            <code className="text-[11px] text-indigo-300 font-mono block">
              uv run --project core python -m switch_core.main register-agent
            </code>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-5 flex flex-col justify-between hover:border-[#2a3144] transition-all">
              <div>
                {/* Top Row: Avatar, Identity & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 to-violet-800 border border-indigo-700/50 flex items-center justify-center text-sm font-bold text-white shadow-md shrink-0">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate">
                        <span className="truncate">{agent.displayName || agent.name}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                        <span>{agent.handle}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500">{agent.connectorType}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant="emerald" size="sm" dot>
                    Active
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {agent.description || 'No description provided for this agent.'}
                </p>

                {/* ID Pill with Copy */}
                <div className="mt-3.5 flex items-center justify-between p-2 rounded-lg bg-[#0c0e15] border border-[#1a1f2c] text-[11px] font-mono text-slate-400">
                  <span className="truncate mr-2">ID: {agent.id}</span>
                  <button
                    onClick={() => copyToClipboard(agent.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#161a26] transition-colors shrink-0 cursor-pointer"
                    title="Copy full UUID"
                  >
                    {copiedId === agent.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Actual Technical Specifications (Real Backend Metadata) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 font-mono text-center">
                  <div className="p-2 rounded-lg bg-[#11141d] border border-[#1b212f]">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">CONNECTOR</div>
                    <div className="text-[11px] font-semibold text-indigo-300 truncate mt-0.5" title={agent.connectorType}>
                      {agent.connectorType}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11141d] border border-[#1b212f]">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">MODEL TYPE</div>
                    <div className="text-[11px] font-semibold text-slate-200 truncate mt-0.5" title={agent.connectionModel || 'Standard'}>
                      {agent.connectionModel || 'Standard'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11141d] border border-[#1b212f]">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">KNOWN TYPE</div>
                    <div className="text-[11px] font-semibold text-emerald-400 truncate mt-0.5">
                      {agent.knownAgentType || 'custom'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11141d] border border-[#1b212f]">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">TOOLS</div>
                    <div className="text-[11px] font-semibold text-amber-400 mt-0.5">
                      {agent.toolCount} granted
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="mt-4 pt-3 border-t border-[#181d28] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <User className="w-3 h-3 text-slate-400" />
                  Owner: {agent.ownerName || 'Admin'}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalAgent(agent)}
                  className="cursor-pointer"
                >
                  Inspect Agent Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Agent Detail Modal */}
      {modalAgent && (
        <Modal
          isOpen={!!modalAgent}
          onClose={closeModal}
          title={
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>{modalAgent.displayName || modalAgent.name}</span>
            </div>
          }
          subtitle={`UUID: ${modalAgent.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-[#0a0c12] border border-[#191e2b] font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Connector</span>
                <span className="text-slate-200 font-semibold">{modalAgent.connectorType}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Model Mode</span>
                <span className="text-indigo-400 font-semibold">{modalAgent.connectionModel || 'Session'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Owner</span>
                <span className="text-slate-200 font-semibold">{modalAgent.ownerName || 'Admin'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Created</span>
                <span className="text-slate-300 font-semibold">
                  {modalAgent.createdAt ? new Date(modalAgent.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Agent Capability Scope</span>
              </div>
              <p className="p-3 rounded-lg bg-[#0e1118] border border-[#1c2230] text-slate-300 leading-relaxed">
                {modalAgent.description}
              </p>
            </div>

            {/* Registered Options / Repo Path */}
            {modalAgent.knownAgentOptions && Object.keys(modalAgent.knownAgentOptions).length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Agent Configuration Parameters</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1118] border border-[#1c2230] font-mono text-[11px] text-slate-300 space-y-1">
                  {Object.entries(modalAgent.knownAgentOptions).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-500">{key}:</span>
                      <span className="text-slate-200 truncate ml-2 font-mono">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Granted Tools & Operations (from GET /agents/{id}) */}
            <div>
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Granted Tool Operations ({agentDetail?.tools?.length || modalAgent.toolCount})</span>
                </div>
                {loadingDetail && <span className="text-[10px] text-slate-500 font-mono">Loading tools...</span>}
              </div>

              {agentDetail?.tools && agentDetail.tools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {agentDetail.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="p-2 rounded-lg bg-[#0e1118] border border-[#1b2130] text-[11px]"
                    >
                      <div className="font-mono font-semibold text-indigo-300">{tool.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{tool.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#0e1118] border border-[#1c2230] text-slate-400 text-xs">
                  {modalAgent.toolCount} tools granted to this agent via Switch protocol.
                </div>
              )}
            </div>

            {/* Assigned Switch Incident Rooms */}
            {agentDetail?.rooms && agentDetail.rooms.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assigned Switch Rooms ({agentDetail.rooms.length})</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {agentDetail.rooms.map((room) => (
                    <div
                      key={room.room_id}
                      className="p-2 rounded-lg bg-[#0e1118] border border-[#1c2230] flex items-center justify-between text-[11px]"
                    >
                      <span className="font-semibold text-slate-200">{room.room_name}</span>
                      <span className="font-mono text-[10px] text-slate-500">{room.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
