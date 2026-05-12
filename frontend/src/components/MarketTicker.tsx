import type { StockItem } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

type MarketTickerProps = {
  market: StockItem[];
};

export function MarketTicker({ market }: MarketTickerProps) {
  if (!market.length) return null;

  // Duplicate the items for seamless infinite scroll
  const items = [...market, ...market];

  return (
    <div className="w-full border-b border-arena-border bg-white shadow-ticker">
      <div className="ticker-container">
        <div className="ticker-content py-2.5 gap-1">
          {items.map((stock, i) => {
            const isPositive = stock.changePct >= 0;
            return (
              <div
                key={`${stock.symbol}-${i}`}
                className="inline-flex items-center gap-2 px-4 border-r border-arena-border last:border-r-0"
              >
                <span className="text-sm font-semibold text-arena-text">{stock.symbol}</span>
                <span className="text-sm text-arena-textSecondary">
                  ₺{stock.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    isPositive ? 'text-arena-success' : 'text-arena-danger'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? '+' : ''}
                  {stock.changePct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
