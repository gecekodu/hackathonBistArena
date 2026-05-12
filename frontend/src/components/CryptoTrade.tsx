import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowDownUp, Loader } from 'lucide-react';

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

  // Piyasa verilerini yükle
  useEffect(() => {
    loadMarket();
  }, []);

  // Her 5 saniyede piyasayı güncelle
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
  const formatUSD = (num: number) => new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🚀 Kripto Ticaret</h1>
          <p className="text-gray-400">Gerçek fiyatlarla sanal portföy</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Özeti */}
          {portfolio && (
            <div className="md:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-80">Portföy Değeri</p>
                <p className="text-3xl font-bold">${portfolio.portfolio_value.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-80">Kar/Zarar</p>
                <div className="flex items-center gap-2">
                  {portfolio.portfolio_pnl >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">${Math.abs(portfolio.portfolio_pnl).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</p>
                    <p className="text-xs">{portfolio.portfolio_pnl_pct > 0 ? '+' : ''}{portfolio.portfolio_pnl_pct.toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-80">Kullanılabilir USDT</p>
                <p className="text-3xl font-bold">${portfolio.usdt.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</p>
              </div>
            </div>
          )}

          {/* Trade Paneli */}
          <div className="md:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ArrowDownUp className="w-5 h-5" />
              Ticaret Yap
            </h2>

            {/* Kripto Seçimi */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Kripto Para</label>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              >
                {market.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol} - {c.name} (${c.price.toLocaleString('tr-TR', {minimumFractionDigits: 2})})
                  </option>
                ))}
              </select>
            </div>

            {/* Al/Sat Seçimi */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setTradeType('BUY')}
                className={`py-2 px-4 rounded font-medium transition ${
                  tradeType === 'BUY'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                🟢 AL (BUY)
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                className={`py-2 px-4 rounded font-medium transition ${
                  tradeType === 'SELL'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                🔴 SAT (SELL)
              </button>
            </div>

            {/* Miktar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Miktar (USDT)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              />
              {selectedCryptoData && (
                <p className="text-xs text-gray-400 mt-1">
                  Alacağınız: {(parseFloat(amount || '0') / selectedCryptoData.price).toFixed(8)} {selectedCrypto}
                </p>
              )}
            </div>

            {/* Hata Mesajı */}
            {error && <div className="mb-4 p-3 bg-red-900 text-red-200 rounded text-sm">{error}</div>}

            {/* Trade Butonu */}
            <button
              onClick={handleTrade}
              disabled={loading || !amount}
              className={`w-full py-3 rounded font-bold text-white transition ${
                tradeType === 'BUY'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  İşleniyor...
                </span>
              ) : (
                `${tradeType === 'BUY' ? '🟢 AL' : '🔴 SAT'}`
              )}
            </button>
          </div>
        </div>

        {/* Piyasa Fiyatları */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Piyasa Fiyatları</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {market.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => setSelectedCrypto(crypto.symbol)}
                className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                  selectedCrypto === crypto.symbol
                    ? 'bg-slate-700 border-purple-500'
                    : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-white">{crypto.symbol}</p>
                    <p className="text-xs text-gray-400">{crypto.name}</p>
                  </div>
                  {crypto.change_24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <p className="text-lg font-bold text-white">${crypto.price.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</p>
                <p className={`text-sm font-medium ${crypto.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {crypto.change_24h > 0 ? '+' : ''}{crypto.change_24h.toFixed(2)}%
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Portföy Holdingleri */}
        {portfolio && portfolio.holdings.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">💼 Pozisyonlarım</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-2">Kripto</th>
                    <th className="text-right py-2 px-2">Miktar</th>
                    <th className="text-right py-2 px-2">Fiyat</th>
                    <th className="text-right py-2 px-2">Değer</th>
                    <th className="text-right py-2 px-2">Kar/Zarar</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((h: Holding) => (
                    <tr key={h.symbol} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="py-3 px-2 font-bold">{h.symbol}</td>
                      <td className="text-right py-3 px-2">{h.quantity.toFixed(8)}</td>
                      <td className="text-right py-3 px-2">${h.current_price.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                      <td className="text-right py-3 px-2 font-bold">${h.value.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                      <td className={`text-right py-3 px-2 font-bold ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${Math.abs(h.pnl).toLocaleString('tr-TR', {minimumFractionDigits: 2})} ({h.pnl_pct > 0 ? '+' : ''}{h.pnl_pct.toFixed(2)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
