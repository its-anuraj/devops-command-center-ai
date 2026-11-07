import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500/50 focus:ring-indigo-500/30',
    secondary:
      'bg-[#191d26] hover:bg-[#222834] text-slate-200 border border-[#262c3b] focus:ring-slate-700/50',
    danger:
      'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 focus:ring-rose-500/30',
    success:
      'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/60 focus:ring-emerald-500/30',
    ghost:
      'bg-transparent hover:bg-[#1c212c] text-slate-300 hover:text-white border border-transparent'
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
    lg: 'text-base px-4 py-2.5 gap-2.5 rounded-xl'
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

