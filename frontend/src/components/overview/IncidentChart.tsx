import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card, CardHeader, CardBody } from '../common/Card';
import { AlertCircle } from 'lucide-react';

const chartData = [
  { time: '00:00', critical: 0, warnings: 2, resolved: 1 },
  { time: '03:00', critical: 0, warnings: 1, resolved: 0 },
  { time: '06:00', critical: 0, warnings: 3, resolved: 2 },
  { time: '09:00', critical: 1, warnings: 5, resolved: 3 },
  { time: '12:00', critical: 0, warnings: 2, resolved: 2 },
  { time: '15:00', critical: 1, warnings: 6, resolved: 4 },
  { time: '18:00', critical: 1, warnings: 4, resolved: 3 },
  { time: '21:00', critical: 2, warnings: 8, resolved: 1 },
  { time: '22:30', critical: 1, warnings: 6, resolved: 2 }
];

export const IncidentChart: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            <span>Incident & Anomaly Velocity (24h)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181d28] border border-[#232b3b] text-indigo-300">
              DEMO DATA
            </span>
          </div>
        }
        subtitle="Simulated 24h telemetry velocity across microservice clusters"
        action={
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Critical (P1/P2)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Warnings
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Mitigated
            </span>
          </div>
        }
      />
      <CardBody className="pt-4 pb-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="warnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1d2331" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1d2331' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#11141c',
                  borderColor: '#242b3b',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                labelStyle={{ color: '#f3f4f6', fontWeight: 600, marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="critical"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#critGrad)"
                name="Critical (P1/P2)"
              />
              <Area
                type="monotone"
                dataKey="warnings"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#warnGrad)"
                name="Warnings"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#resGrad)"
                name="Mitigated"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

