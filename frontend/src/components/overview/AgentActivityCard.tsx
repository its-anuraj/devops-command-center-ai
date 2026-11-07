import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { Bot, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AgentActivityCard: React.FC = () => {
  const { agents, setSelectedAgentId } = useApp();
  const navigate = useNavigate();

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id);
    navigate('/agents');
  };

  return (
    <Card className="h-full">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>AI DevOps Agent Swarm</span>
          </div>
        }
        subtitle="Switch Room watchers & active autonomous tasks"
        action={
          <button
            onClick={() => navigate('/agents')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Manage swarm <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />
      <CardBody className="p-0">
        {agents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-slate-400">No agents registered on Switch</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Registered agents will appear here automatically via Switch Gateway.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1b202c]">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleSelectAgent(agent.id)}
                className="p-3.5 hover:bg-[#13161f] transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#181d29] border border-[#232b3b] flex items-center justify-center font-bold text-indigo-300 text-xs">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                        <span>{agent.displayName || agent.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">
                          {agent.handle}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {agent.connectorType || agent.role || 'Switch Agent'}
                      </div>
                    </div>
                  </div>

                  <div>
                    {agent.status === 'investigating' ? (
                      <Badge variant="rose" size="sm" dot className="animate-pulse">
                        Investigating
                      </Badge>
                    ) : agent.status === 'working' ? (
                      <Badge variant="indigo" size="sm" dot>
                        Working
                      </Badge>
                    ) : (
                      <Badge variant="emerald" size="sm" dot>
                        Ready
                      </Badge>
                    )}
                  </div>
                </div>

                {agent.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-2">
                    {agent.description}
                  </p>
                )}

                <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate">Type: {agent.knownAgentType || agent.connectorType}</span>
                  <span>Tools: {agent.toolCount} granted</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
