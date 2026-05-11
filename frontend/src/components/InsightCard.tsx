import type { InsightItem } from '../types';

type InsightCardProps = {
  insight: InsightItem;
};

const severityStyle: Record<InsightItem['severity'], string> = {
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  high: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-soft backdrop-blur-xl transition duration-300 hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{insight.title}</h3>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${severityStyle[insight.severity]}`}>
          {insight.severity}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{insight.description}</p>
    </article>
  );
}
