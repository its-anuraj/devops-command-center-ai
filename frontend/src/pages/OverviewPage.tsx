import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/overview/KpiCard';
import { SystemHealthGrid } from '../components/overview/SystemHealthGrid';
import { IncidentChart } from '../components/overview/IncidentChart';
import { RecentIncidentsTable } from '../components/overview/RecentIncidentsTable';
import { AgentActivityCard } from '../components/overview/AgentActivityCard';
import { RecentWorkflowTimeline } from '../components/overview/RecentWorkflowTimeline';
import { Badge } from '../components/common/Badge';
import { AlertTriangle, CheckCircle2, Bot, CheckSquare, ShieldAlert } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { incidents, agents, approvals } = useApp();
  const navigate = useNavigate();

  const activeIncidents = incidents.filter(
    (i) => i.status === 'open' || i.status === 'investigating'
  );
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved' || i.status === 'mitigated');
  const activeAgents = agents.filter((a) => a.status !== 'offline');
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const p1Count = activeIncidents.filter((i) => i.severity === 'P1').length;
  const p2Count = activeIncidents.filter((i) => i.severity === 'P2').length;

  return (
    <div className="space-y-6">
      {/* Active Incident Urgent Banner if any P1 */}
      {p1Count > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/70 via-rose-900/30 to-transparent border border-rose-800/60 flex items-center justify-between shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-200 uppercase tracking-wider flex items-center gap-2">
                <span>Active P1 Critical Incident</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800/80">
                  INC-8041
                </span>
              </div>
              <div className="text-xs text-rose-100/90 mt-0.5">
                Payment Service 500 error spike (4.85%) • @ops-diagnostician isolated HikariPool starvation
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/incidents')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
          >
            Enter War Room
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="ACTIVE INCIDENTS"
          value={activeIncidents.length}
          subtitle={`P1: ${p1Count} • P2: ${p2Count}`}
          icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
          badge={
            <Badge variant="rose" size="sm" dot>
              {p1Count > 0 ? 'P1 Active (Demo)' : 'Stable'}
            </Badge>
          }
          trend={{ value: 'Demo Scenarios', isGood: false }}
          onClick={() => navigate('/incidents')}
        />

        <KpiCard
          title="RESOLVED (24H)"
          value={resolvedIncidents.length}
          subtitle="Simulated MTTR: 14m 20s"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          badge={
            <Badge variant="slate" size="sm">
              Demo Metric
            </Badge>
          }
          trend={{ value: 'Demo 99.8% SLA', isGood: true }}
          onClick={() => navigate('/incidents')}
        />

        <KpiCard
          title="ACTIVE AI AGENTS"
          value={activeAgents.length}
          subtitle={
            activeAgents.length > 0
              ? `${activeAgents.length} live registered agent${activeAgents.length !== 1 ? 's' : ''}`
              : 'No agents registered'
          }
          icon={<Bot className="w-4 h-4 text-indigo-400" />}
          badge={
            <Badge variant="indigo" size="sm" dot>
              Switch Gateway
            </Badge>
          }
          trend={{ value: 'Port 18000', isGood: true }}
          onClick={() => navigate('/agents')}
        />

        <KpiCard
          title="PENDING APPROVALS"
          value={pendingApprovals.length}
          subtitle={
            pendingApprovals.length > 0
              ? `${pendingApprovals.length} action${pendingApprovals.length !== 1 ? 's' : ''} require sign-off`
              : 'All requests cleared'
          }
          icon={<CheckSquare className="w-4 h-4 text-amber-400" />}
          badge={
            pendingApprovals.length > 0 ? (
              <Badge variant="amber" size="sm" dot className="animate-pulse">
                Action Required
              </Badge>
            ) : (
              <Badge variant="emerald" size="sm">
                Cleared
              </Badge>
            )
          }
          trend={
            pendingApprovals.length > 0
              ? { value: `${pendingApprovals.length} Pending`, isGood: false }
              : { value: '0 Open', isGood: true }
          }
          onClick={() => navigate('/approvals')}
        />
      </div>

      {/* Main Grid: Incident Activity Chart + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncidentChart />
        </div>
        <div className="lg:col-span-1">
          <SystemHealthGrid />
        </div>
      </div>

      {/* Recent Incidents Stream */}
      <div>
        <RecentIncidentsTable />
      </div>

      {/* Lower Row: AI Agent Swarm + Autonomous Workflow Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AgentActivityCard />
        </div>
        <div>
          <RecentWorkflowTimeline />
        </div>
      </div>
    </div>
  );
};
