import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean; label?: string };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, className = '' }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
        {trend && (
          <p className={`mt-3 flex items-center text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
            <span className="mr-1.5 text-sm">{trend.isPositive ? '↗' : '•'}</span>
            <span>{trend.label || `${Math.abs(trend.value)}% vs last month`}</span>
          </p>
        )}
      </div>
      <div className="rounded-xl bg-primary-50 p-3 text-primary-600">{icon}</div>
    </div>
  </div>
);

export default StatCard;
