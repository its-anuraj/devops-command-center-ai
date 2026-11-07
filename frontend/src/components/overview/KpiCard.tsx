import React from 'react';
import { Card } from '../common/Card';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isGood: boolean;
  };
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  onClick
}) => {
  return (
    <Card
      onClick={onClick}
      hoverable={!!onClick}
      className="p-5 flex flex-col justify-between relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="p-2 rounded-lg bg-[#181d28] border border-[#242b3b] text-slate-300">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        {badge}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{subtitle}</span>
        {trend && (
          <span
            className={`font-mono text-[11px] font-medium ${
              trend.isGood ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
};

