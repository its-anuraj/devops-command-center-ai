import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { Server, Activity, ShieldCheck, Database, Layout } from 'lucide-react';

export const SystemHealthGrid: React.FC = () => {
  const { services } = useApp();

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <Activity className="w-4 h-4 text-sky-400" />;
      case 'database':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'frontend':
        return <Layout className="w-4 h-4 text-indigo-400" />;
      default:
        return <Server className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Service Cluster Health</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300">
              DEMO
            </span>
          </div>
        }
        subtitle="Monitored services (Simulated health metrics)"
        action={
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Simulated Cluster
          </span>
        }
      />
      <CardBody className="p-0">
        <div className="divide-y divide-[#1b202c]">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="p-3.5 flex items-center justify-between hover:bg-[#13161f] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#161a24] border border-[#222836] shrink-0">
                  {getServiceIcon(svc.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2 truncate">
                    <span>{svc.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      ({svc.cluster})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5 font-mono">
                    <span>Uptime: {svc.uptimePercentage}%</span>
                    <span>Latency: {svc.latencyMs}ms</span>
                    <span
                      className={
                        svc.errorRate > 1 ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }
                    >
                      Error: {svc.errorRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {svc.status === 'operational' ? (
                  <Badge variant="emerald" size="sm" dot>
                    Operational
                  </Badge>
                ) : svc.status === 'degraded' ? (
                  <Badge variant="rose" size="sm" dot className="animate-pulse">
                    Degraded
                  </Badge>
                ) : (
                  <Badge variant="amber" size="sm" dot>
                    Maintenance
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

