import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate' | 'indigo';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
    rose: 'bg-rose-950/70 text-rose-400 border-rose-800/60',
    amber: 'bg-amber-950/70 text-amber-400 border-amber-800/60',
    blue: 'bg-sky-950/70 text-sky-400 border-sky-800/60',
    purple: 'bg-purple-950/70 text-purple-400 border-purple-800/60',
    indigo: 'bg-indigo-950/70 text-indigo-400 border-indigo-800/60',
    slate: 'bg-slate-900/80 text-slate-300 border-slate-700/60'
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400',
    amber: 'bg-amber-400',
    blue: 'bg-sky-400',
    purple: 'bg-purple-400',
    indigo: 'bg-indigo-400',
    slate: 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

