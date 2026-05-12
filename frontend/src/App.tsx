import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  BadgeCheck,
  Brain,
  ChartColumnBig,
  ChevronUp,
  CircleDollarSign,
  Coins,
  Flame,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { mockDashboard } from './data/mock';
import { InsightCard } from './components/InsightCard';
import { MetricCard } from './components/MetricCard';
import { CryptoTrade } from './components/CryptoTrade';
import type { DashboardData, Holding, ProfileName, StockItem } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const currency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('tr-TR');

const profileAccent: Record<ProfileName, string> = {
  'Conservative Investor': 'from-emerald-400 to-cyan-300',
  'Momentum Trader': 'from-amber-400 to-orange-300',
  'Risk Seeker': 'from-rose-400 to-fuchsia-400',
  'Long-Term Investor': 'from-sky-400 to-indigo-300',
  'Emotional Trader': 'from-rose-400 to-red-500',
};

const seriesColors = ['#2dd4bf', '#fbbf24', '#60a5fa', '#f472b6'];

const emptyTradeForm = {
  symbol: 'THYAO',
  side: 'BUY' as 'BUY' | 'SELL',
  quantity: 10,
};

function App() {
  const [mode, setMode] = useState<'BIST' | 'CRYPTO'>('BIST');
  const [data, setData] = useState<DashboardData>(mockDashboard);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshingMarket, setRefreshingMarket] = useState(false);
  const [tradeForm, setTradeForm] = useState(emptyTradeForm);

  async function loadDashboard() {
    try {
      const response = await fetch(`${API_URL}/api/dashboard`);
      if (!response.ok) throw new Error('Dashboard request failed');
      const payload = (await response.json()) as DashboardData;
      setData(payload);
      setStatusMessage('Backend aktif. Canlı demo verileri yüklendi.');
    } catch {
      setData(mockDashboard);
      setStatusMessage('Backend erişilemedi, demo veri ile devam ediliyor.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const marketMap = useMemo(() => Object.fromEntries(data.market.map((item) => [item.symbol, item])), [data.market]);

  const portfolioChange = computeReturn(data.portfolioValue);
  const appOnline = data.integrations.gemini.enabled || data.integrations.firebase.enabled;

  async function handleTradeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage('');

    try {
      const response = await fetch(`${API_URL}/api/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeForm),
      });

      if (!response.ok) throw new Error('Trade request failed');
      const payload = (await response.json()) as DashboardData;
      setData(payload);
      setStatusMessage('İşlem kaydedildi. Davranış analizi güncellendi.');
    } catch {
      setData((current) => applyLocalTrade(current, tradeForm, marketMap));
      setStatusMessage('Backend bağlantısı yoktu, işlem yerel demo modda işlendi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefreshMarket() {
    setRefreshingMarket(true);
    setStatusMessage('BIST sembolleri ve fiyatlar güncelleniyor...');

    try {
      const response = await fetch(`${API_URL}/api/market/refresh`, { method: 'POST' });
      if (!response.ok) throw new Error('Refresh request failed');
      await loadDashboard();
      setStatusMessage('BIST sembolleri yenilendi ve canlı market güncellendi.');
    } catch {
      setStatusMessage('Market yenileme başarısız oldu. Backend açık mı kontrol et.');
    } finally {
      setRefreshingMarket(false);
    }
  }

  // Kripto ticaret modunu göster
  if (mode === 'CRYPTO') {
    return (
      <>
        {/* Mod Seçim Butonu */}
        <div className="fixed top-4 right-4 z-50 bg-slate-900/95 border border-slate-700 rounded-lg p-2 flex gap-2">
          <button
            onClick={() => setMode('BIST')}
            className={`px-3 py-1 rounded font-medium transition ${
              mode === 'BIST'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            📊 BIST
          </button>
          <button
            onClick={() => setMode('CRYPTO')}
            className={`px-3 py-1 rounded font-medium transition ${
              mode === 'CRYPTO'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            🚀 Kripto
          </button>
        </div>
        <CryptoTrade />
      </>
    );
  }

  return (
    <main className="relative overflow-hidden bg-bg text-slate-100">
      <div className="absolute inset-0 -z-10 bg-radial-grid" />
      <div className="absolute left-0 top-0 -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl animate-floaty" />
      <div className="absolute right-0 top-24 -z-10 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl animate-floaty" style={{ animationDelay: '-2s' }} />

      <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="glass-panel animate-fadeUp rounded-[2rem] border border-white/10 px-6 py-6 shadow-soft sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
                <Sparkles className="h-4 w-4" />
                BISTMind AI
              </div>
              <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                AI destekli sanal BIST trading ve davranışsal finans koçu.
              </h1>
              
              {/* Mod Seçim Butonları */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setMode('BIST')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    mode === 'BIST'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400'
                      : 'bg-slate-600/30 text-gray-400 border border-slate-600 hover:bg-slate-600/50'
                  }`}
                >
                  📊 BIST Hisseleri
                </button>
                <button
                  onClick={() => setMode('CRYPTO')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    mode === 'CRYPTO'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400'
                      : 'bg-slate-600/30 text-gray-400 border border-slate-600 hover:bg-slate-600/50'
                  }`}
                >
                  🚀 Kripto Para
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefreshMarket}
                  disabled={refreshingMarket}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshingMarket ? 'Güncelleniyor...' : 'BIST Güncelle'}
                </button>
                {statusMessage ? <p className="text-sm text-slate-300">{statusMessage}</p> : null}
              </div>
              
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Bu platform yatırım tavsiyesi vermez. Amaç, sanal portföy üzerinden işlem davranışlarını analiz etmek, duygusal karar kalıplarını görünür kılmak ve yatırım disiplini geliştirmektir.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                <StatusPill icon={<ShieldCheck className="h-4 w-4" />} label="100.000₺ sanal başlangıç" />
                <StatusPill icon={<Brain className="h-4 w-4" />} label={`Profil: ${data.profile}`} />
                <StatusPill icon={<Activity className="h-4 w-4" />} label={loading ? 'Yükleniyor' : 'Canlı demo hazır'} />
                <StatusPill icon={<Sparkles className="h-4 w-4" />} label={`Gemini: ${data.integrations.gemini.enabled ? 'Hazır' : 'Kapalı'}`} />
                <StatusPill icon={<Coins className="h-4 w-4" />} label={`Firebase: ${data.integrations.firebase.enabled ? 'Bağlı' : 'Yerel demo'}`} />
              </div>
            </div>

            <div className="grid gap-3 sm:min-w-[280px]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Risk Meter</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black text-white">{data.coach.riskScore}</p>
                    <p className="mt-1 text-sm text-slate-400">Davranışsal risk</p>
                  </div>
                  <RiskRing value={data.coach.riskScore} />
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Günlük Coach</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">{data.coach.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                  {appOnline ? 'Canlı entegrasyon aktif' : 'Kurulum tamamlanana kadar demo mod'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Portfolio Value"
            value={currency.format(data.portfolioValue)}
            subtitle={`Nakit: ${currency.format(data.cash)}`}
            accent="bg-gradient-to-r from-cyan-400 to-emerald-300"
            icon={<Wallet className="h-5 w-5" />}
          />
          <MetricCard
            title="P/L"
            value={`${data.pnl >= 0 ? '+' : ''}${currency.format(data.pnl)}`}
            subtitle={`${portfolioChange >= 0 ? 'Pozitif' : 'Negatif'} getiri eğilimi`}
            accent="bg-gradient-to-r from-emerald-400 to-cyan-300"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Discipline Score"
            value={String(data.coach.disciplineScore)}
            subtitle="Duygusal kontrol ve planlı işlem karışımı"
            accent="bg-gradient-to-r from-amber-400 to-orange-300"
            icon={<BadgeCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Diversification"
            value={String(data.coach.diversificationScore)}
            subtitle="Sektör dağılımı ve yoğunlaşma dengesi"
            accent="bg-gradient-to-r from-fuchsia-400 to-rose-300"
            icon={<ChartColumnBig className="h-5 w-5" />}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 space-y-6">
            <Panel title="Portfolio Performance" icon={<TrendingUp className="h-5 w-5 text-cyan-300" />}>
              <div className="h-[320px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={data.portfolioSeries}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(8, 15, 28, 0.95)',
                        border: '1px solid rgba(148,163,184,0.16)',
                        borderRadius: 16,
                        color: '#fff',
                      }}
                      formatter={(value: number) => [currency.format(value), 'Değer']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2dd4bf" fill="url(#portfolioGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Performance Lens" icon={<Activity className="h-5 w-5 text-amber-300" />}>
                <div className="h-[250px]">
                  <ResponsiveContainer>
                    <LineChart data={data.performanceSeries}>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.12)" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(8, 15, 28, 0.95)',
                          border: '1px solid rgba(148,163,184,0.16)',
                          borderRadius: 16,
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Behavior Profile" icon={<Brain className="h-5 w-5 text-fuchsia-300" />}>
                <div className={`rounded-3xl bg-gradient-to-br ${profileAccent[data.profile]} p-[1px]`}>
                  <div className="rounded-3xl bg-slate-950/90 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Investor Profile</p>
                        <h3 className="mt-3 text-2xl font-black text-white">{data.profile}</h3>
                      </div>
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-2xl">🧠</div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      AI, işlem sıklığın, pozisyon boyutun, sektör dağılımın ve satış davranışların üzerinden seni bu profile eşliyor.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <ProfileMetric label="Risk" value={data.coach.riskScore} />
                      <ProfileMetric label="Disiplin" value={data.coach.disciplineScore} />
                      <ProfileMetric label="Sabır" value={Math.max(100 - data.trades.length * 5, 40)} />
                      <ProfileMetric label="Denge" value={data.coach.diversificationScore} />
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            <Panel title="AI Behavioral Insights" icon={<Sparkles className="h-5 w-5 text-amber-300" />}>
              <div className="grid gap-4 md:grid-cols-2">
                {data.insights.map((insight) => (
                  <InsightCard key={insight.title} insight={insight} />
                ))}
              </div>
              <div className="mt-5 rounded-3xl border border-cyan-400/10 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-100">
                AI notu: {data.disclaimer}
              </div>
            </Panel>
          </div>

          <aside className="xl:col-span-4 space-y-6">
            <Panel title="Quick Trade" icon={<CircleDollarSign className="h-5 w-5 text-emerald-300" />}>
              <form className="space-y-4" onSubmit={handleTradeSubmit}>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">BIST Symbol</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400/40"
                    value={tradeForm.symbol}
                    onChange={(event) => setTradeForm((current) => ({ ...current, symbol: event.target.value }))}
                  >
                    {data.market.map((stock) => (
                      <option key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} - {stock.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Yön</span>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0"
                      value={tradeForm.side}
                      onChange={(event) => setTradeForm((current) => ({ ...current, side: event.target.value as 'BUY' | 'SELL' }))}
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Adet</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0"
                      value={tradeForm.quantity}
                      onChange={(event) => setTradeForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-300 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'İşleniyor...' : 'İşlemi Kaydet'}
                </button>
              </form>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Sanal bakiye: <span className="font-bold text-white">{currency.format(data.cash)}</span>
                <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Başlangıç: 100.000₺</div>
              </div>
            </Panel>

            <Panel title="Weekly Competition" icon={<Trophy className="h-5 w-5 text-amber-300" />}>
              <div className="space-y-3">
                {data.leaderboard.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">#{item.rank}</span>
                        <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{item.badge}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-300">+{item.returnPct}%</p>
                      <p className="text-xs text-slate-400">Disiplin {item.disciplineScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Recent Trades" icon={<Flame className="h-5 w-5 text-rose-300" />}>
              <div className="space-y-3">
                {data.trades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-white">{trade.symbol}</span>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${trade.side === 'BUY' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                        {trade.side}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{number.format(trade.quantity)} lot</span>
                      <span>{compactCurrency.format(trade.price)}</span>
                      <span>{trade.timestamp}</span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-cyan-200">{trade.emotionTag}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <Panel className="xl:col-span-8" title="Market Watch" icon={<Users className="h-5 w-5 text-sky-300" />}>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.market.map((stock) => (
                <MarketCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </Panel>

          <Panel className="xl:col-span-4" title="Portfolio Mix" icon={<Target className="h-5 w-5 text-emerald-300" />}>
            <div className="h-[280px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={buildPieData(data.holdings)} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3}>
                    {buildPieData(data.holdings).map((entry, index) => (
                      <Cell key={entry.name} fill={seriesColors[index % seriesColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(8, 15, 28, 0.95)',
                      border: '1px solid rgba(148,163,184,0.16)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {buildPieData(data.holdings).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seriesColors[index % seriesColors.length] }} />
                    {entry.name}
                  </span>
                  <span className="font-semibold text-white">{entry.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <footer className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-xs leading-6 text-slate-400 backdrop-blur-xl">
          BISTMind AI hackathon MVP. İnsan davranışını anlamak için tasarlanmış eğitim odaklı bir simülasyondur. Finansal kararlar için profesyonel tavsiye yerine geçmez.
        </footer>
      </div>
    </main>
  );
}

function Panel({ title, icon, children, className = '' }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`glass-panel rounded-[2rem] border border-white/10 p-6 shadow-soft ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white">{icon}</div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-white">{title}</h2>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Behavioral finance dashboard</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
      <span className="text-cyan-300">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function RiskRing({ value }: { value: number }) {
  const strokeDashoffset = 226 - (226 * value) / 100;
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r="36" stroke="rgba(148,163,184,0.12)" strokeWidth="8" fill="none" />
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="url(#riskGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="226"
          strokeDashoffset={strokeDashoffset}
        />
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-lg font-black text-white">{value}</div>
    </div>
  );
}

function ProfileMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function MarketCard({ stock }: { stock: StockItem }) {
  const isPositive = stock.changePct >= 0;
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 transition hover:border-white/20 hover:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-wide text-white">{stock.symbol}</p>
          <p className="mt-1 text-sm text-slate-400">{stock.name}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
          {isPositive ? <ChevronUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isPositive ? '+' : ''}{stock.changePct}%
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-black text-white">{compactCurrency.format(stock.price)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{stock.sector}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-slate-300">
          <p className="font-bold text-white">{stock.dayVolume}</p>
          <p>Hacim</p>
        </div>
      </div>
    </div>
  );
}

function buildPieData(holdings: Holding[]) {
  const total = holdings.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0);
  if (!total) {
    return [{ name: 'Cash', value: 100 }];
  }

  return holdings.map((item) => ({
    name: item.symbol,
    value: ((item.quantity * item.currentPrice) / total) * 100,
  }));
}

function computeReturn(portfolioValue: number) {
  return ((portfolioValue - 100000) / 100000) * 100;
}

function applyLocalTrade(current: DashboardData, form: { symbol: string; side: 'BUY' | 'SELL'; quantity: number }, marketMap: Record<string, StockItem>) {
  const price = marketMap[form.symbol]?.price ?? 0;
  if (!price) return current;

  const nextHoldingsMap = new Map(current.holdings.map((item) => [item.symbol, { ...item }]));
  const existing = nextHoldingsMap.get(form.symbol);
  const tradeValue = form.quantity * price;

  if (form.side === 'BUY') {
    if (current.cash < tradeValue) return current;
    const totalQuantity = (existing?.quantity ?? 0) + form.quantity;
    const blendedAverage =
      ((existing?.quantity ?? 0) * (existing?.averageCost ?? price) + form.quantity * price) / totalQuantity;

    nextHoldingsMap.set(form.symbol, {
      symbol: form.symbol,
      quantity: totalQuantity,
      averageCost: blendedAverage,
      currentPrice: price,
    });
  } else {
    if (!existing || existing.quantity < form.quantity) return current;
    const remaining = existing.quantity - form.quantity;
    if (remaining <= 0) {
      nextHoldingsMap.delete(form.symbol);
    } else {
      nextHoldingsMap.set(form.symbol, {
        ...existing,
        quantity: remaining,
      });
    }
  }

  const holdings = Array.from(nextHoldingsMap.values()).map((item) => ({
    ...item,
    currentPrice: marketMap[item.symbol]?.price ?? item.currentPrice,
  }));
  const cash = form.side === 'BUY' ? current.cash - tradeValue : current.cash + tradeValue;
  const portfolioValue = cash + holdings.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0);
  const pnl = portfolioValue - 100000;
  const trades = [
    {
      id: Date.now(),
      symbol: form.symbol,
      side: form.side,
      quantity: form.quantity,
      price,
      timestamp: new Date().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      emotionTag: form.side === 'SELL' && form.quantity > 100 ? 'Panic risk' : form.side === 'BUY' ? 'Momentum signal' : 'Planlı karar',
    },
    ...current.trades,
  ];
  const totalPositionValue = holdings.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0) || 1;
  const concentration = holdings.length ? Math.max(...holdings.map((item) => (item.quantity * item.currentPrice) / totalPositionValue)) : 0;
  const buyCount = trades.filter((item) => item.side === 'BUY').length;
  const sellCount = trades.filter((item) => item.side === 'SELL').length;
  const riskScore = Math.min(95, 38 + buyCount * 4 + sellCount * 3 + Math.round(concentration * 20));
  const disciplineScore = Math.max(35, 90 - trades.length * 2 + (holdings.length >= 3 ? 6 : 0));
  const diversificationScore = Math.max(30, 100 - Math.round(concentration * 55) - Math.max(0, 4 - holdings.length) * 5);
  const profile = inferProfile(riskScore, disciplineScore, concentration, sellCount, buyCount);
  const warnings = buildWarnings(trades, concentration, holdings.length);

  return {
    ...current,
    holdings,
    cash,
    portfolioValue,
    pnl,
    trades,
    profile,
    coach: {
      riskScore,
      disciplineScore,
      portfolioHealth: Math.max(40, Math.round((disciplineScore + diversificationScore) / 2)),
      diversificationScore,
      summary: `Profilin ${profile.toLowerCase()} çizgisine yakın. Bugün risk skoru ${riskScore} ve disiplin skoru ${disciplineScore}.`,
      warnings,
    },
  };
}

function inferProfile(riskScore: number, disciplineScore: number, concentration: number, sellCount: number, buyCount: number): ProfileName {
  if (disciplineScore >= 84 && concentration < 0.35) return 'Long-Term Investor';
  if (riskScore >= 80) return 'Risk Seeker';
  if (sellCount > buyCount && disciplineScore < 70) return 'Emotional Trader';
  if (buyCount > sellCount && riskScore >= 60) return 'Momentum Trader';
  return 'Conservative Investor';
}

function buildWarnings(trades: DashboardData['trades'], concentration: number, holdingsCount: number) {
  const warnings = [] as string[];
  if (trades[0]?.side === 'SELL') warnings.push('Kısa vadeli stres altında satış yapma eğilimi var');
  if (concentration > 0.45) warnings.push('Tek sektör yoğunluğu fazla');
  if (trades.length >= 5) warnings.push('Aşırı işlem davranışı gözlemleniyor');
  if (holdingsCount < 3) warnings.push('Portföy çeşitliliği düşük');
  if (!warnings.length) warnings.push('Davranış örüntüsü şu an dengeli görünüyor');
  return warnings;
}

export default App;
