import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ShieldAlert, Bot } from 'lucide-react';

export const RecentIncidentsTable: React.FC = () => {
  const { incidents, setSelectedIncidentId } = useApp();
  const navigate = useNavigate();

  const handleInspect = (id: string) => {
    setSelectedIncidentId(id);
    navigate('/incidents');
  };

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
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Recent Incident Stream</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300">
              DEMO SCENARIOS
            </span>
          </div>
        }
        subtitle="Simulated incident response triage and multi-agent investigations"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/incidents')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View all
          </Button>
        }
      />
      <CardBody className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1b202c] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0c0e14]">
              <th className="py-3 px-4">Severity / ID</th>
              <th className="py-3 px-4">Incident Summary</th>
              <th className="py-3 px-4">Affected Service</th>
              <th className="py-3 px-4">Assigned AI Agent</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181d28] text-xs">
            {incidents.slice(0, 4).map((inc) => (
              <tr
                key={inc.id}
                className="hover:bg-[#121620] transition-colors group cursor-pointer"
                onClick={() => handleInspect(inc.id)}
              >
                <td className="py-3.5 px-4 shrink-0">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(inc.severity)}
                    <span className="font-mono text-slate-400 text-[11px]">{inc.id}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">
                  <div>{inc.title}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{inc.declaredAt}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                  {inc.affectedService}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                    <Bot className="w-3.5 h-3.5" />
                    <span>{inc.assignedAgent}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">{getStatusBadge(inc.status)}</td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspect(inc.id);
                    }}
                  >
                    Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};
