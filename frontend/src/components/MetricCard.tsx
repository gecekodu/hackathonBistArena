import type { ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
};

export function MetricCard({ title, value, subtitle, accent, icon }: MetricCardProps) {
  return (
    <div className="arena-card arena-card-lift relative overflow-hidden p-5">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${accent}`} />

      <div className="flex items-start justify-between gap-4 pl-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-arena-textMuted">
            {title}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-arena-text leading-tight">
            {value}
          </p>
          <p className="mt-1.5 text-sm text-arena-textSecondary truncate">
            {subtitle}
          </p>
        </div>
        <div className="flex-shrink-0 grid h-11 w-11 place-items-center rounded-xl bg-arena-primaryLight text-arena-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
