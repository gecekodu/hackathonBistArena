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
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">{title}</p>
          <p className="mt-3 font-display text-3xl font-extrabold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-slate-950/40 text-cyan-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
