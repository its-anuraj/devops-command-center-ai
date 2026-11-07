import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import type { Deployment } from '../types/deployment';
import {
  GitCommit,
  RotateCcw,
  User,
  Bot,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DeploymentsPage: React.FC = () => {
  const { deployments } = useApp();
  const navigate = useNavigate();
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [filterEnv, setFilterEnv] = useState<string>('all');

  const filteredDeployments = deployments.filter((d) => {
    return filterEnv === 'all' || d.environment === filterEnv;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="emerald" size="sm" dot>
            Successful
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="rose" size="sm" dot className="animate-pulse">
            Failed / Regressed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="amber" size="sm" dot className="animate-pulse">
            Deploying (Canary)
          </Badge>
        );
      default:
        return (
          <Badge variant="slate" size="sm" dot>
            Rolled Back
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Pipeline Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1f2535] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <GitCommit className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Demonstration Deployment Pipeline:</strong> The records below represent simulated release scenarios for demonstrating canary health checks and incident rollback coordination. Production CI/CD pipelines (e.g. GitHub Actions, ArgoCD) are not connected to this local instance.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300 shrink-0 ml-3">
          DEMO DEPLOYMENTS
        </span>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Deployment Pipeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated cluster rollouts, version telemetry & canary health checks
          </p>
        </div>

        {/* Environment Filter */}
        <div className="flex items-center bg-[#11141c] border border-[#212736] rounded-lg p-0.5 text-xs">
          {['all', 'production', 'staging'].map((env) => (
            <button
              key={env}
              onClick={() => setFilterEnv(env)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                filterEnv === env
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Deployments Table Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              <span>Release History</span>
            </div>
          }
          subtitle={`Showing ${filteredDeployments.length} tracked deployments`}
        />
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1b202c] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0c0e14]">
                <th className="py-3 px-4">Service & Version</th>
                <th className="py-3 px-4">Commit / Message</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Initiated By</th>
                <th className="py-3 px-4">Duration & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181d28] text-xs">
              {filteredDeployments.map((dep) => (
                <tr
                  key={dep.id}
                  onClick={() => setSelectedDeployment(dep)}
                  className="hover:bg-[#121620] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{dep.service}</div>
                    <div className="font-mono text-[11px] text-indigo-400 mt-0.5 font-bold">
                      {dep.version}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="font-mono text-slate-400 text-[11px] font-semibold">
                        {dep.commitHash}
                      </span>
                      <span className="truncate">{dep.commitMessage}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] capitalize text-slate-400">
                    <Badge variant={dep.environment === 'production' ? 'emerald' : 'amber'} size="sm">
                      {dep.environment}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {dep.authorType === 'agent' ? (
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      ) : dep.authorType === 'ci' ? (
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span>{dep.author}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    <div>{dep.duration}</div>
                    <div className="text-slate-400 text-[10px]">{dep.startedAt}</div>
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(dep.status)}</td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {dep.status === 'failed' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RotateCcw className="w-3 h-3 text-slate-500" />}
                          disabled
                          title="Rollback action disabled: external CI/CD webhook not configured for demo records"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <span className="text-slate-500">Rollback</span>
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedDeployment(dep);
                        }}
                      >
                        Inspect
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Deployment Detail Modal */}
      {selectedDeployment && (
        <Modal
          isOpen={!!selectedDeployment}
          onClose={() => setSelectedDeployment(null)}
          title={
            <div className="flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-indigo-400" />
              <span>
                {selectedDeployment.service} {selectedDeployment.version}
              </span>
            </div>
          }
          subtitle={`Commit ${selectedDeployment.commitHash} • ${selectedDeployment.environment}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Health & Pods Grid */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#0e1118] border border-[#1e2434] font-mono text-center">
              <div>
                <span className="text-slate-400 text-[10px] block">HEALTH STATUS</span>
                <span
                  className={`font-bold text-xs uppercase ${
                    selectedDeployment.healthStatus === 'critical'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedDeployment.healthStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">PODS RUNNING</span>
                <span className="text-slate-200 font-bold text-xs">
                  {selectedDeployment.podsRunning} / {selectedDeployment.podsDesired}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ERROR RATE</span>
                <span
                  className={`font-bold text-xs ${
                    selectedDeployment.status === 'failed' ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {selectedDeployment.errorRate}
                </span>
              </div>
            </div>

            {/* Commit Message */}
            <div className="p-3 rounded-lg bg-[#0a0c10] border border-[#1b202c]">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">COMMIT MESSAGE</span>
              <p className="text-slate-200 font-mono text-xs">{selectedDeployment.commitMessage}</p>
            </div>

            {/* Changelog */}
            <div>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Release Changelog
              </span>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
                {selectedDeployment.changelog.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rollback Action if failed */}
            {selectedDeployment.status === 'failed' && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-rose-200">Regression Detected</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Target rollback image: {selectedDeployment.rollbackTarget}
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedDeployment(null);
                    navigate('/approvals');
                  }}
                >
                  Open Rollback Approval
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
