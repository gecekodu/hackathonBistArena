import { type ReactNode } from 'react';
import { ChevronUp, TrendingDown } from 'lucide-react';
import type { StockItem } from '../types';

const compactCurrency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });

export function Panel({ title, subtitle, icon, children, className = '' }: { title: string; subtitle?: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`arena-card p-6 ${className}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-arena-primaryLight text-arena-primary">{icon}</div>
        <div>
          <h2 className="font-display text-lg font-bold text-arena-text">{title}</h2>
          {subtitle && <p className="text-xs text-arena-textMuted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function StatusPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-arena-border bg-white px-3 py-1.5 text-xs font-medium text-arena-textSecondary">
      <span className="text-arena-primary">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export function RiskRing({ value }: { value: number }) {
  const offset = 226 - (226 * value) / 100;
  const color = value > 70 ? '#dc2626' : value > 40 ? '#d97706' : '#16a34a';
  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r="36" stroke="#e2e8f0" strokeWidth="7" fill="none" />
        <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" strokeDasharray="226" strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-display text-lg font-bold text-arena-text">{value}</div>
    </div>
  );
}

export function ProfileMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-arena-border bg-arena-hoverBg p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-arena-textMuted">{label}</p>
      <p className="mt-1.5 font-display text-lg font-bold text-arena-text">{value}</p>
    </div>
  );
}

export function MarketCard({ stock }: { stock: StockItem }) {
  const pos = stock.changePct >= 0;
  return (
    <div className="arena-card arena-card-lift p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-arena-text">{stock.symbol}</p>
          <p className="mt-0.5 text-xs text-arena-textMuted">{stock.name}</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${pos ? 'text-arena-success' : 'text-arena-danger'}`}>
          {pos ? <ChevronUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {pos ? '+' : ''}{stock.changePct}%
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-xl font-bold text-arena-text">{compactCurrency.format(stock.price)}</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-arena-textMuted">{stock.sector}</p>
        </div>
        <div className="rounded-lg border border-arena-border bg-arena-hoverBg px-2.5 py-1.5 text-right">
          <p className="text-xs font-semibold text-arena-text">{stock.dayVolume}</p>
          <p className="text-[10px] text-arena-textMuted">Hacim</p>
        </div>
      </div>
    </div>
  );
}
