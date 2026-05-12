import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { InsightItem } from '../types';

type InsightCardProps = {
  insight: InsightItem;
};

const severityConfig: Record<InsightItem['severity'], { bg: string; text: string; border: string; icon: typeof Info }> = {
  low: { bg: 'bg-arena-successLight', text: 'text-arena-success', border: 'border-arena-success/20', icon: CheckCircle2 },
  medium: { bg: 'bg-arena-amberLight', text: 'text-arena-amber', border: 'border-arena-amber/20', icon: Info },
  high: { bg: 'bg-arena-dangerLight', text: 'text-arena-danger', border: 'border-arena-danger/20', icon: AlertTriangle },
};

const severityLabel: Record<InsightItem['severity'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

export function InsightCard({ insight }: InsightCardProps) {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <article className="arena-card p-5 transition duration-300 hover:border-arena-borderHover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${config.bg}`}>
            <Icon className={`h-4 w-4 ${config.text}`} />
          </div>
          <h3 className="text-sm font-semibold text-arena-text">{insight.title}</h3>
        </div>
        <span
          className={`arena-badge ${config.bg} ${config.text} border ${config.border}`}
        >
          {severityLabel[insight.severity]}
        </span>
      </div>
      <p className="mt-3 pl-12 text-sm leading-relaxed text-arena-textSecondary">
        {insight.description}
      </p>
    </article>
  );
}
