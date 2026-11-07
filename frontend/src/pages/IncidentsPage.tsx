import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { switchGateway, type SwitchChatMessage } from '../services/switchGateway';
import {
  Search,
  Bot,
  Terminal,
  ExternalLink,
  GitCommit,
  Layers,
  Radio,
  Send,
  MessageSquare,
  Users,
  ShieldAlert,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IncidentsPage: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    setSelectedIncidentId,
    activeRooms,
    liveEvents,
    streamStatus,
    postChatMessage,
    approvals,
    agents,
  } = useApp();
  const navigate = useNavigate();

  // Mode switcher: Live Switch War-Rooms vs Demo Scenarios
  const [activeTab, setActiveTab] = useState<'live_rooms' | 'demo_incidents'>(
    activeRooms.length > 0 ? 'live_rooms' : 'demo_incidents'
  );

  // Live War-Room states
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    activeRooms[0]?.roomId || ''
  );
  const [roomMessages, setRoomMessages] = useState<SwitchChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo incident filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Effective room ID derived from activeRooms
  const effectiveRoomId =
    (selectedRoomId && activeRooms.some((r) => r.roomId === selectedRoomId))
      ? selectedRoomId
      : activeRooms[0]?.roomId || '';

  // Fetch messages for selected room
  const loadRoomMessages = async (roomId: string) => {
    if (!roomId) return;
    setLoadingMessages(true);
    try {
      const res = await switchGateway.getRoomMessages(roomId, 50);
      if (res.data && res.data.messages) {
        setRoomMessages(res.data.messages);
      }
    } catch (e) {
      console.warn('Failed to fetch room messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (effectiveRoomId) {
      void loadRoomMessages(effectiveRoomId);
    }
  }, [effectiveRoomId]);

  // Merge incoming SSE messages into roomMessages
  useEffect(() => {
    if (!effectiveRoomId) return;
    const latestLiveMsg = liveEvents.find(
      (e) =>
        e.kind === 'message' &&
        ((e.metadata as any)?.roomId === effectiveRoomId ||
          e.traceId.includes(effectiveRoomId.slice(0, 8)))
    );

    if (latestLiveMsg && latestLiveMsg.metadata) {
      const meta = latestLiveMsg.metadata as any;
      const msgId = meta.messageId || latestLiveMsg.id;
      setRoomMessages((prev) => {
        if (prev.some((m) => m.messageId === msgId)) return prev;
        const newMsg: SwitchChatMessage = {
          messageId: msgId,
          seq: meta.seq || prev.length + 1,
          roomId: effectiveRoomId,
          sender: {
            clientId: meta.sender?.clientId || 'client-switch',
            name: meta.sender?.name || latestLiveMsg.service,
            kind: meta.sender?.kind || 'agent',
            agentId: meta.sender?.agentId || null,
            userId: meta.sender?.userId || null,
          },
          source: meta.source || 'chat',
          body: latestLiveMsg.message.replace(/^\[CHAT\]\s*/, ''),
          sentAt: meta.sentAt || new Date().toISOString(),
        };
        return [...prev, newMsg];
      });
    }
  }, [liveEvents, effectiveRoomId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !effectiveRoomId || isSending) return;

    const textToSend = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    const success = await postChatMessage(effectiveRoomId, textToSend);
    if (!success) {
      console.error('Failed to dispatch message to room');
    }
    setIsSending(false);
  };

  const handlePromptSuggestion = (prompt: string) => {
    setMessageInput(prompt);
  };

  // Demo incident filtering
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.affectedService.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || filteredIncidents[0] || incidents[0];

  const selectedRoom = activeRooms.find((r) => r.roomId === effectiveRoomId) || activeRooms[0];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'P1':
        return (
          <Badge variant="rose" size="sm" dot>
            P1 Critical
          </Badge>
        );
      case 'P2':
        return (
          <Badge variant="amber" size="sm" dot>
            P2 High
          </Badge>
        );
      case 'P3':
        return (
          <Badge variant="blue" size="sm" dot>
            P3 Medium
          </Badge>
        );
      default:
        return (
          <Badge variant="slate" size="sm" dot>
            P4 Low
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return (
          <Badge variant="indigo" size="sm" className="animate-pulse">
            Investigating
          </Badge>
        );
      case 'open':
        return (
          <Badge variant="rose" size="sm">
            Open
          </Badge>
        );
      case 'mitigated':
        return (
          <Badge variant="amber" size="sm">
            Mitigated
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="emerald" size="sm">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs: Live War-Rooms vs Demo Scenarios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Incident Management & War-Rooms
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Switch collaboration channels and autonomous incident investigation scenarios
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center rounded-xl bg-[#11141c] border border-[#212737] p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('live_rooms')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'live_rooms'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch War-Rooms</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[10px] border border-indigo-700/50">
              {activeRooms.length} Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('demo_incidents')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'demo_incidents'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Demo Scenarios</span>
            <span className="px-1.5 py-0.2 rounded bg-[#181d28] text-slate-400 text-[10px] border border-[#263042]">
              {incidents.length} Scenarios
            </span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: LIVE SWITCH WAR-ROOMS ─────────────────────────────────── */}
      {activeTab === 'live_rooms' && (
        <div className="space-y-5">
          {/* Live Status Disclaimer */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#11141c] to-[#11141c] border border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${streamStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>
                <strong className="text-white">Active Switch Gateway Session:</strong> Connected to real chat rooms on Switch. Messages dispatched here directly prompt registered AI agents via SSE.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
                SSE: {streamStatus.toUpperCase()}
              </span>
              <button
                onClick={() => effectiveRoomId && void loadRoomMessages(effectiveRoomId)}
                className="p-1 rounded hover:bg-[#181d28] text-slate-400 hover:text-slate-200 transition-colors"
                title="Refresh messages"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Active Rooms List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">Switch Rooms ({activeRooms.length})</span>
                <span className="font-mono text-[11px]">Live Gateway</span>
              </div>

              {activeRooms.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-[#101319] border border-[#1d2331] rounded-xl">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-slate-400">No active rooms found</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Rooms created in Switch will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeRooms.map((room) => {
                    const isSelected = selectedRoom?.roomId === room.roomId;
                    return (
                      <div
                        key={room.roomId}
                        onClick={() => setSelectedRoomId(room.roomId)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#151924] border-indigo-500 shadow-md shadow-indigo-950/30'
                            : 'bg-[#101319] border-[#1d2331] hover:border-[#2b3346] hover:bg-[#121620]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-slate-100 flex items-center gap-1.5 truncate">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{room.name || 'Untitled Room'}</span>
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            Active
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          ID: {room.roomId}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#1a202d] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500" />
                            {room.memberCount || 1} participant{room.memberCount === 1 ? '' : 's'}
                          </span>
                          <span className="text-indigo-400 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            {agents[0]?.displayName || 'AI Agent'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Registered Agents in Swarm */}
              <div className="p-4 rounded-xl bg-[#0f1118] border border-[#1d2331] space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Available Room Responder:
                </span>
                {agents.map((ag) => (
                  <div key={ag.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      {ag.displayName || ag.name}
                    </span>
                    <Badge variant="emerald" size="sm" dot>
                      Ready
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live War-Room Console & Message Feed (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {selectedRoom ? (
                <Card className="p-0 overflow-hidden flex flex-col h-[650px]">
                  {/* Room Header */}
                  <div className="p-4 bg-[#11141c] border-b border-[#1c2230] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">
                          #{selectedRoom.name || 'Incident Response Channel'}
                        </span>
                        <Badge variant="emerald" size="sm" dot>
                          Live Room
                        </Badge>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                        <span>Room ID: {selectedRoom.roomId}</span>
                        <span>•</span>
                        <span>Channel: {selectedRoom.channelType || 'standard'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => navigate('/logs')}
                      >
                        Live Stream Logs
                      </Button>
                    </div>
                  </div>

                  {/* Associated Pending Approvals Banner */}
                  {approvals.length > 0 && (
                    <div className="p-3 bg-amber-950/40 border-b border-amber-900/50 flex items-center justify-between text-xs text-amber-200 px-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>{approvals.length} Pending Approval{approvals.length > 1 ? 's' : ''}</strong> awaiting human authorization
                        </span>
                      </div>
                      <button
                        onClick={() => navigate('/approvals')}
                        className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1"
                      >
                        Review Sign-Off &rarr;
                      </button>
                    </div>
                  )}

                  {/* Chat Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0c10]">
                    {loadingMessages ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Loading room messages...
                      </div>
                    ) : roomMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                        <MessageSquare className="w-8 h-8 text-slate-600 mb-2 opacity-40" />
                        <p className="font-medium text-slate-400">No messages in this war-room yet</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Dispatch an instruction below to prompt the AI DevOps investigator.
                        </p>
                      </div>
                    ) : (
                      roomMessages.map((msg, idx) => {
                        const isAgent = msg.sender?.kind === 'agent' || !msg.sender?.kind;
                        const senderName = msg.sender?.name || (isAgent ? 'DevOps Investigator' : 'Operator');

                        return (
                          <div
                            key={msg.messageId || `msg-${idx}`}
                            className={`flex gap-3 text-xs ${
                              isAgent ? 'items-start' : 'items-start'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                                isAgent
                                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                              }`}
                            >
                              {isAgent ? <Bot className="w-4 h-4" /> : 'OP'}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-200">
                                  {senderName}
                                </span>
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                    isAgent
                                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                                  }`}
                                >
                                  {isAgent ? 'AI Agent' : 'Human Operator'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : 'now'}
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-[#12151e] border border-[#1d2331] text-slate-200 leading-relaxed font-mono whitespace-pre-wrap text-[11px]">
                                {msg.body}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick DevOps Prompt Suggestions */}
                  <div className="px-4 py-2 bg-[#0e1117] border-t border-[#181d28] flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <span className="text-slate-500 text-[10px] uppercase font-mono shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Prompts:
                    </span>
                    {[
                      'Run diagnostic health check',
                      'Check recent error logs for payment-service',
                      'Summarize root cause for current alert',
                      'Formulate zero-downtime rollback recommendation',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handlePromptSuggestion(prompt)}
                        className="px-2 py-0.5 rounded bg-[#161a24] hover:bg-[#1d2332] text-slate-300 hover:text-white border border-[#242c3d] shrink-0 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Dispatch Box */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 bg-[#11141c] border-t border-[#1c2230] flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Dispatch message to room (e.g. '@devops-investigator investigate latency spike')..."
                      disabled={isSending}
                      className="flex-1 bg-[#090b0f] border border-[#202737] focus:border-indigo-500 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none placeholder-slate-500"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!messageInput.trim() || isSending}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      {isSending ? 'Sending...' : 'Dispatch'}
                    </Button>
                  </form>
                </Card>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500 bg-[#101319] border border-[#1d2331] rounded-xl">
                  Select an active Switch war-room from the list to join the conversation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DEMONSTRATION INCIDENT SCENARIOS ─────────────────────── */}
      {activeTab === 'demo_incidents' && (
        <div className="space-y-6">
          {/* Demo Scenarios Disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1f2535] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong className="text-slate-200">Incident Triage Walkthroughs:</strong> The incident records below represent simulated outage scenarios to illustrate autonomous root-cause analysis, timeline synthesis, and remediation proposals.
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300 shrink-0 ml-3">
              DEMO SCENARIOS
            </span>
          </div>

          {/* Top Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by title, ID (e.g. INC-8041), or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11141c] border border-[#212736] focus:border-indigo-500 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none placeholder-slate-500"
              />
            </div>

            {/* Severity & Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#11141c] border border-[#212736] rounded-lg p-0.5 text-xs">
                {['all', 'P1', 'P2', 'P3'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      severityFilter === sev
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev === 'all' ? 'All Severity' : sev}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#11141c] border border-[#212736] rounded-lg p-0.5 text-xs">
                {['all', 'investigating', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-slate-700 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All Status' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Incidents List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Showing {filteredIncidents.length} incidents</span>
                <span className="font-mono">Sorted by recency</span>
              </div>

              <div className="space-y-2.5">
                {filteredIncidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#151924] border-indigo-500 shadow-md shadow-indigo-950/30'
                          : 'bg-[#101319] border-[#1d2331] hover:border-[#2b3346] hover:bg-[#121620]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(inc.severity)}
                          <span className="font-mono text-xs font-semibold text-slate-300">
                            {inc.id}
                          </span>
                        </div>
                        {getStatusBadge(inc.status)}
                      </div>

                      <h3 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-relaxed">
                        {inc.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          {inc.affectedService}
                        </span>
                        <span>{inc.declaredAt.split('(')[0]}</span>
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-[#1a202d] flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Bot className="w-3.5 h-3.5" />
                          {inc.assignedAgent}
                        </span>
                        <span className="text-rose-400 font-mono">Error: {inc.errorRate}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredIncidents.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 bg-[#101319] border border-[#1d2331] rounded-xl">
                    No incidents match the active filters.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Deep Incident Inspection Detail (7 cols) */}
            {selectedIncident && (
              <div className="lg:col-span-7 space-y-5">
                <Card className="p-6">
                  {/* Incident Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#1c2230]">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        {getSeverityBadge(selectedIncident.severity)}
                        <span className="font-mono text-sm font-bold text-slate-200">
                          {selectedIncident.id}
                        </span>
                        {getStatusBadge(selectedIncident.status)}
                        <Badge variant="slate" size="sm">
                          {selectedIncident.environment}
                        </Badge>
                      </div>
                      <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                        {selectedIncident.title}
                      </h2>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                        <span>Declared: {selectedIncident.declaredAt}</span>
                        <span>Lead: {selectedIncident.leadEngineer}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => navigate('/workflows')}
                      >
                        View Pipeline
                      </Button>
                    </div>
                  </div>

                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                    <div className="p-3 rounded-lg bg-[#141822] border border-[#202736]">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Service</div>
                      <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                        {selectedIncident.affectedService}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#141822] border border-[#202736]">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Error Rate</div>
                      <div className="text-xs font-semibold text-rose-400 mt-0.5 font-mono">
                        {selectedIncident.errorRate}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#141822] border border-[#202736]">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Latency</div>
                      <div className="text-xs font-semibold text-amber-400 mt-0.5 font-mono">
                        {selectedIncident.latencyMs}ms p99
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#141822] border border-[#202736]">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Switch Room</div>
                      <div className="text-xs font-semibold text-indigo-400 mt-0.5 truncate font-mono">
                        #{selectedIncident.switchRoom.split('/')[1]}
                      </div>
                    </div>
                  </div>

                  {/* Incident Summary */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Incident Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#12151e] p-3.5 rounded-lg border border-[#1d2331]">
                      {selectedIncident.summary}
                    </p>
                  </div>

                  {/* Root Cause Analysis (RCA) Box */}
                  {selectedIncident.rootCauseAnalysis && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-[#12151e] border border-indigo-900/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-slate-200">
                            Autonomous Root Cause Analysis
                          </span>
                        </div>
                        <Badge variant="indigo" size="sm">
                          {selectedIncident.rootCauseAnalysis.confidence}% AI Confidence
                        </Badge>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-slate-400 font-medium">Root Cause: </span>
                          <span className="text-slate-200">
                            {selectedIncident.rootCauseAnalysis.cause}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-medium">Trigger: </span>
                          <span className="text-slate-200">
                            {selectedIncident.rootCauseAnalysis.trigger}
                          </span>
                        </div>

                        {selectedIncident.rootCauseAnalysis.culpritCommit && (
                          <div className="p-2.5 rounded-lg bg-[#0d0f16] border border-[#1f2637] font-mono text-[11px] flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                              <GitCommit className="w-4 h-4 text-rose-400 shrink-0" />
                              <span className="text-rose-300 font-semibold">
                                {selectedIncident.rootCauseAnalysis.culpritCommit.hash}
                              </span>
                              <span className="text-slate-400 truncate">
                                {selectedIncident.rootCauseAnalysis.culpritCommit.message}
                              </span>
                            </div>
                            <span className="text-slate-500 shrink-0 ml-2">
                              {selectedIncident.rootCauseAnalysis.culpritCommit.author}
                            </span>
                          </div>
                        )}

                        {selectedIncident.rootCauseAnalysis.stackTraceSnippet && (
                          <div>
                            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                              <Terminal className="w-3.5 h-3.5 text-slate-500" />
                              Captured Stacktrace (HikariPool Lock Contention)
                            </div>
                            <pre className="p-3 rounded-lg bg-[#090a0d] border border-[#1b202c] text-[11px] font-mono text-rose-300/90 overflow-x-auto leading-relaxed">
                              {selectedIncident.rootCauseAnalysis.stackTraceSnippet}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommended Remediation Actions */}
                  {selectedIncident.recommendedActions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                        Recommended Remediation Actions
                      </h4>
                      <div className="space-y-2.5">
                        {selectedIncident.recommendedActions.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-3.5 rounded-xl bg-[#12151e] border border-[#1e2434] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-200">
                                  {rec.title}
                                </span>
                                <Badge
                                  variant={
                                    rec.risk === 'high'
                                      ? 'rose'
                                      : rec.risk === 'medium'
                                      ? 'amber'
                                      : 'emerald'
                                  }
                                  size="sm"
                                >
                                  {rec.risk.toUpperCase()} Risk
                                </Badge>
                              </div>
                              <div className="mt-1 font-mono text-[11px] text-slate-400 bg-[#090a0d] p-1.5 rounded border border-[#191e2b] overflow-x-auto">
                                <code>{rec.command}</code>
                              </div>
                            </div>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate('/approvals')}
                              className="shrink-0"
                            >
                              Review in Approvals
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investigation Audit Trail Timeline */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      Investigation Audit Trail
                    </h4>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e2433]">
                      {selectedIncident.timeline.map((evt) => (
                        <div key={evt.id} className="relative">
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[#101217]" />
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{evt.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {evt.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {evt.description}
                          </p>
                          <div className="mt-1 text-[11px] text-indigo-400/90 font-mono flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            {evt.author}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
