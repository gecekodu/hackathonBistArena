import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowDownUp, Loader, Wallet, BarChart3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface Crypto {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  market_cap: number;
}

interface Holding {
  symbol: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  value: number;
  pnl: number;
  pnl_pct: number;
}

export function CryptoTrade() {
  const [market, setMarket] = useState<Crypto[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadMarket();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadMarket, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadMarket() {
    try {
      const res = await fetch(`${API_URL}/api/crypto/market`);
      const data = await res.json();
      setMarket(data.market);
      loadPortfolio();
    } catch (err) {
      console.error('Market yükleme hatası:', err);
    }
  }

  async function loadPortfolio() {
    try {
      const res = await fetch(`${API_URL}/api/crypto/portfolio`);
      const data = await res.json();
      setPortfolio(data);
    } catch (err) {
      console.error('Portföy yükleme hatası:', err);
    }
  }

  async function handleTrade() {
    setError('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Geçerli bir miktar girin');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/crypto/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedCrypto,
          side: tradeType,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Trade başarısız');
      }

      const data = await res.json();
      setPortfolio(data);
      setAmount('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  const selectedCryptoData = market.find((c) => c.symbol === selectedCrypto);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-arena-text">Kripto Ticaret</h1>
        <p className="mt-1 text-sm text-arena-textSecondary">Gerçek fiyatlarla sanal portföy yönetimi</p>
      </div>

      {/* Portfolio Summary Cards */}
      {portfolio && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="arena-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-arena-primaryLight">
                <Wallet className="h-4 w-4 text-arena-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Portföy Değeri</p>
            </div>
            <p className="font-display text-2xl font-bold text-arena-text">
              ${portfolio.portfolio_value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="arena-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${portfolio.portfolio_pnl >= 0 ? 'bg-arena-successLight' : 'bg-arena-dangerLight'}`}>
                {portfolio.portfolio_pnl >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-arena-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-arena-danger" />
                )}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Kar/Zarar</p>
            </div>
            <p className={`font-display text-2xl font-bold ${portfolio.portfolio_pnl >= 0 ? 'text-arena-success' : 'text-arena-danger'}`}>
              ${Math.abs(portfolio.portfolio_pnl).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-sm font-medium mt-0.5 ${portfolio.portfolio_pnl_pct >= 0 ? 'text-arena-success' : 'text-arena-danger'}`}>
              {portfolio.portfolio_pnl_pct > 0 ? '+' : ''}{portfolio.portfolio_pnl_pct.toFixed(2)}%
            </p>
          </div>

          <div className="arena-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-arena-amberLight">
                <BarChart3 className="h-4 w-4 text-arena-amber" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Kullanılabilir</p>
            </div>
            <p className="font-display text-2xl font-bold text-arena-text">
              ${portfolio.usdt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-arena-textMuted mt-0.5">USDT</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trade Panel */}
        <div className="arena-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-arena-primaryLight">
              <ArrowDownUp className="h-5 w-5 text-arena-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-arena-text">Ticaret Yap</h2>
              <p className="text-xs text-arena-textMuted">Kripto al veya sat</p>
            </div>
          </div>

          {/* Crypto Select */}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-arena-textMuted mb-2">
              Kripto Para
            </label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="arena-input"
            >
              {market.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} — {c.name} (${c.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setTradeType('BUY')}
              className={`arena-btn text-sm ${
                tradeType === 'BUY'
                  ? 'arena-btn-success'
                  : 'arena-btn-ghost'
              }`}
            >
              AL (BUY)
            </button>
            <button
              onClick={() => setTradeType('SELL')}
              className={`arena-btn text-sm ${
                tradeType === 'SELL'
                  ? 'arena-btn-danger'
                  : 'arena-btn-ghost'
              }`}
            >
              SAT (SELL)
            </button>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-arena-textMuted mb-2">
              Miktar (USDT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="arena-input"
            />
            {selectedCryptoData && amount && (
              <p className="text-xs text-arena-textMuted mt-1.5">
                Alacağınız: {(parseFloat(amount || '0') / selectedCryptoData.price).toFixed(8)} {selectedCrypto}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-arena-dangerLight border border-arena-danger/20 p-3 text-sm text-arena-danger">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleTrade}
            disabled={loading || !amount}
            className={`arena-btn w-full text-sm ${
              tradeType === 'BUY' ? 'arena-btn-success' : 'arena-btn-danger'
            }`}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              tradeType === 'BUY' ? 'AL' : 'SAT'
            )}
          </button>
        </div>

        {/* Market Prices */}
        <div className="arena-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-arena-secondaryLight">
              <BarChart3 className="h-5 w-5 text-arena-secondary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-arena-text">Piyasa Fiyatları</h2>
              <p className="text-xs text-arena-textMuted">Anlık kripto fiyatları</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {market.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => setSelectedCrypto(crypto.symbol)}
                className={`text-left arena-card p-4 cursor-pointer transition ${
                  selectedCrypto === crypto.symbol
                    ? '!border-arena-primary !shadow-cardHover'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-arena-text">{crypto.symbol}</p>
                    <p className="text-xs text-arena-textMuted">{crypto.name}</p>
                  </div>
                  {crypto.change_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-arena-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-arena-danger" />
                  )}
                </div>
                <p className="text-lg font-bold text-arena-text">
                  ${crypto.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm font-medium ${crypto.change_24h >= 0 ? 'text-arena-success' : 'text-arena-danger'}`}>
                  {crypto.change_24h > 0 ? '+' : ''}{crypto.change_24h.toFixed(2)}%
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      {portfolio && portfolio.holdings.length > 0 && (
        <div className="arena-card p-6">
          <h2 className="font-display text-lg font-bold text-arena-text mb-4">Pozisyonlarım</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena-border">
                  <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Kripto</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Miktar</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Fiyat</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Değer</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Kar/Zarar</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((h: Holding) => (
                  <tr key={h.symbol} className="border-b border-arena-border last:border-b-0 hover:bg-arena-hoverBg transition-colors">
                    <td className="py-3 px-3 font-semibold text-arena-text">{h.symbol}</td>
                    <td className="text-right py-3 px-3 text-arena-textSecondary">{h.quantity.toFixed(8)}</td>
                    <td className="text-right py-3 px-3 text-arena-textSecondary">
                      ${h.current_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-3 font-semibold text-arena-text">
                      ${h.value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`text-right py-3 px-3 font-semibold ${h.pnl >= 0 ? 'text-arena-success' : 'text-arena-danger'}`}>
                      ${Math.abs(h.pnl).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      <span className="ml-1 text-xs">({h.pnl_pct > 0 ? '+' : ''}{h.pnl_pct.toFixed(2)}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
