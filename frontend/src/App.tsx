import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, BadgeCheck, Brain, ChartColumnBig, CircleDollarSign, Coins, Flame, ShieldCheck, Sparkles, Target, TrendingUp, Trophy, Users, Wallet } from 'lucide-react';
import { mockDashboard } from './data/mock';
import { InsightCard } from './components/InsightCard';
import { MetricCard } from './components/MetricCard';
import { CryptoTrade } from './components/CryptoTrade';
import { Sidebar, type NavPage } from './components/Sidebar';
import { MarketTicker } from './components/MarketTicker';
import { Panel, StatusPill, RiskRing, ProfileMetric, MarketCard } from './components/DashboardPanels';
import { NewsFeed } from './components/NewsFeed';
import type { DashboardData, Holding, ProfileName, StockItem } from './types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const cur = new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0});
const cur2 = new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:2});
const num = new Intl.NumberFormat('tr-TR');

const profileColors: Record<ProfileName,string> = {
  'Conservative Investor':'bg-emerald-500','Momentum Trader':'bg-amber-500',
  'Risk Seeker':'bg-rose-500','Long-Term Investor':'bg-blue-500','Emotional Trader':'bg-red-500',
};
const pieColors = ['#4f46e5','#0ea5e9','#d97706','#16a34a'];
const emptyForm = { symbol:'THYAO', side:'BUY' as 'BUY'|'SELL', quantity:10 };

function App() {
  const [page, setPage] = useState<NavPage>('dashboard');
  const [mob, setMob] = useState(false);
  const [data, setData] = useState<DashboardData>(mockDashboard);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sub, setSub] = useState(false);
  const [ref, setRef] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      const r = await fetch(`${API}/api/dashboard`);
      if(!r.ok) throw 0;
      setData(await r.json());
      setMsg('Canlı piyasa verileri yüklendi.');
    } catch { 
      // Sunucu kapalıysa veya hata verdiyse
      setData(mockDashboard); 
      setMsg('Bağlantı hatası: Sunucuya ulaşılamadı. Demo veriler gösteriliyor.'); 
    }
    finally { setLoading(false); }
  }

  useEffect(()=>{
    load();
    const interval = setInterval(async () => {
      try {
        const refreshRes = await fetch(`${API}/api/market/refresh`, { method: 'POST' });
        if (refreshRes.ok) {
          const dashboardRes = await fetch(`${API}/api/dashboard`);
          if (dashboardRes.ok) setData(await dashboardRes.json());
        }
      } catch (e) {
        console.log('Arka plan güncellemesi başarısız.');
      }
    }, 30000);
    return () => clearInterval(interval);
  },[]);

  const mmap = useMemo(()=>Object.fromEntries(data.market.map(i=>[i.symbol,i])),[data.market]);
  const pChange = ((data.portfolioValue-100000)/100000)*100;

  async function onTrade(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSub(true); setMsg('');
    try {
      const r = await fetch(`${API}/api/trades`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      if(!r.ok) throw 0;
      setData(await r.json()); setMsg('İşlem kaydedildi.');
    } catch { setData(c=>localTrade(c,form,mmap)); setMsg('Yerel demo modda işlendi.'); }
    finally { setSub(false); }
  }

  async function onRefresh() {
    setRef(true); setMsg('Güncelleniyor...');
    try {
      const r = await fetch(`${API}/api/market/refresh`,{method:'POST'});
      if(!r.ok) throw 0;
      await load(); setMsg('Piyasa güncellendi.');
    } catch { setMsg('Güncelleme başarısız.'); }
    finally { setRef(false); }
  }

  const navTo = (p:NavPage) => { setPage(p); setMob(false); };
  const ttStyle = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, color:'#1e293b', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' };

  function renderPageContent() {
    if (page === 'crypto') return <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in"><CryptoTrade /></div>;

    if (page === 'market') return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-arena-text">Piyasa Ekranı</h2>
        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Piyasa İzleme" subtitle="BIST hisseleri" icon={<Users className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">{data.market.map(s=><MarketCard key={s.symbol} stock={s} />)}</div>
          </Panel>
          <NewsFeed />
        </section>
      </div>
    );

    if (page === 'trade') return (
      <div className="p-4 lg:p-8 max-w-xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-arena-text">İşlem Yap</h2>
        <Panel title="Hızlı İşlem" subtitle="Al veya sat" icon={<CircleDollarSign className="h-5 w-5" />}>
          <form className="space-y-4" onSubmit={onTrade}>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-arena-textMuted mb-1.5">Hisse</span>
              <select className="arena-input" value={form.symbol} onChange={e=>setForm(f=>({...f,symbol:e.target.value}))}>
                {data.market.map(s=><option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-arena-textMuted mb-1.5">Yön</span>
                <select className="arena-input" value={form.side} onChange={e=>setForm(f=>({...f,side:e.target.value as 'BUY'|'SELL'}))}>
                  <option value="BUY">AL</option><option value="SELL">SAT</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-arena-textMuted mb-1.5">Adet</span>
                <input type="number" min="1" max="100000" className="arena-input" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:Number(e.target.value)}))} />
              </label>
            </div>
            <button type="submit" disabled={sub} className="arena-btn arena-btn-primary w-full">
              {sub?'İşleniyor...':'İşlemi Kaydet'}
            </button>
          </form>
          <div className="mt-4 rounded-xl border border-arena-border bg-arena-hoverBg p-3 text-sm text-arena-textSecondary">
            Bakiye: <span className="font-semibold text-arena-text">{cur.format(data.cash)}</span>
          </div>
        </Panel>
      </div>
    );

    if (page === 'portfolio') return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-arena-text">Portföy</h2>
        <section className="grid gap-4 sm:grid-cols-2">
          <MetricCard title="Portföy Değeri" value={cur.format(data.portfolioValue)} subtitle={`Nakit: ${cur.format(data.cash)}`} accent="bg-arena-primary" icon={<Wallet className="h-5 w-5" />} />
          <MetricCard title="Kar/Zarar" value={`${data.pnl>=0?'+':''}${cur.format(data.pnl)}`} subtitle={`${pChange>=0?'Pozitif':'Negatif'} getiri`} accent="bg-arena-success" icon={<TrendingUp className="h-5 w-5" />} />
        </section>
        <section className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <Panel title="Portföy Performansı" subtitle="Haftalık değer değişimi" icon={<TrendingUp className="h-5 w-5" />}>
              <div className="h-[300px]">
                <ResponsiveContainer>
                  <AreaChart data={data.portfolioSeries}>
                    <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v=>`${Math.round(v/1000)}k`} />
                    <Tooltip contentStyle={ttStyle} formatter={(v:number)=>[cur.format(v),'Değer']} />
                    <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="url(#pg)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
          <div className="xl:col-span-4 space-y-6">
            <Panel title="Portföy Dağılımı" subtitle="Varlık oranları" icon={<Target className="h-5 w-5" />}>
              <div className="h-[240px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={buildPie(data.holdings)} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3}>
                      {buildPie(data.holdings).map((e,i)=><Cell key={e.name} fill={pieColors[i%pieColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {buildPie(data.holdings).map((e,i)=>(
                  <div key={e.name} className="flex items-center justify-between rounded-lg border border-arena-border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-arena-textSecondary">
                      <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:pieColors[i%pieColors.length]}} />{e.name}
                    </span>
                    <span className="font-semibold text-arena-text">{e.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>
    );

    if (page === 'leaderboard') return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-arena-text">Liderlik Tablosu</h2>
        <Panel title="Haftalık Liderlik" subtitle="En iyi yatırımcılar" icon={<Trophy className="h-5 w-5" />}>
          <div className="space-y-3">
            {data.leaderboard.map(i=>(
              <div key={i.rank} className="flex items-center justify-between gap-3 rounded-xl border border-arena-border p-4 hover:bg-arena-hoverBg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white ${i.rank===1?'bg-amber-500':i.rank===2?'bg-slate-400':'bg-amber-700'}`}>#{i.rank}</span>
                    <span className="text-base font-semibold text-arena-text">{i.name}</span>
                  </div>
                  <p className="mt-1 pl-10 text-sm text-arena-textMuted">{i.badge}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-arena-success">+{i.returnPct}%</p>
                  <p className="text-sm text-arena-textMuted">Disiplin {i.disciplineScore}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );

    if (page === 'coach') return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-arena-text">AI Koç Analizi</h2>
        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Performans Metrikleri" subtitle="Davranış puanları" icon={<Activity className="h-5 w-5" />}>
            <div className="h-[220px]">
              <ResponsiveContainer>
                <LineChart data={data.performanceSeries}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0,100]} />
                  <Tooltip contentStyle={ttStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={2.5} dot={{r:4,fill:'#d97706'}} name="Puan" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Yatırımcı Profili" subtitle="AI davranış analizi" icon={<Brain className="h-5 w-5" />}>
            <div className={`rounded-xl p-[2px] bg-gradient-to-br from-arena-primary to-arena-secondary`}>
              <div className="rounded-[10px] bg-white p-4 h-full">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Profil</p>
                    <h3 className="mt-1 font-display text-xl font-bold text-arena-text">{data.profile}</h3>
                  </div>
                  <div className={`grid h-12 w-12 place-items-center rounded-xl ${profileColors[data.profile]} text-white text-lg`}>🧠</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <ProfileMetric label="Risk" value={data.coach.riskScore} />
                  <ProfileMetric label="Disiplin" value={data.coach.disciplineScore} />
                  <ProfileMetric label="Sabır" value={Math.max(100-data.trades.length*5,40)} />
                  <ProfileMetric label="Denge" value={data.coach.diversificationScore} />
                </div>
              </div>
            </div>
          </Panel>
        </section>
        <Panel title="AI Davranış Analizleri" subtitle="Yapay zeka önerileri" icon={<Sparkles className="h-5 w-5" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {data.insights.map(i=><InsightCard key={i.title} insight={i} />)}
          </div>
          <div className="mt-4 rounded-xl border border-arena-primary/10 bg-arena-primaryLight p-4 text-sm text-arena-primary">
            AI notu: {data.disclaimer}
          </div>
        </Panel>
      </div>
    );

    // Default Dashboard (Genel Bakış)
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <header className="arena-card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-arena-primaryLight px-3 py-1.5 text-xs font-semibold text-arena-primary">
                <Sparkles className="h-3.5 w-3.5" /> BorsaArena
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold text-arena-text lg:text-4xl">
                AI destekli sanal trading ve davranışsal finans koçu
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={onRefresh} disabled={ref} className="arena-btn arena-btn-primary text-xs">
                  {ref ? 'Güncelleniyor...' : 'Piyasayı Güncelle'}
                </button>
                {msg && <p className="self-center text-sm text-arena-textSecondary font-medium text-rose-500">{msg}</p>}
              </div>
              <p className="mt-3 text-sm text-arena-textSecondary leading-relaxed">
                Bu platform yatırım tavsiyesi vermez. Amaç, davranışlarınızı analiz etmek ve yatırım disiplini geliştirmektir.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="100.000₺ sanal başlangıç" />
                <StatusPill icon={<Brain className="h-3.5 w-3.5" />} label={`Profil: ${data.profile}`} />
                <StatusPill icon={<Activity className="h-3.5 w-3.5" />} label={loading?'Yükleniyor':'Sistem Aktif'} />
              </div>
            </div>
            <div className="grid gap-3 sm:min-w-[260px]">
              <div className="arena-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Risk Skoru</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-3xl font-bold text-arena-text">{data.coach.riskScore}</p>
                    <p className="text-sm text-arena-textSecondary">Davranışsal risk</p>
                  </div>
                  <RiskRing value={data.coach.riskScore} />
                </div>
              </div>
              <div className="arena-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-arena-textMuted">Günlük Koç Notu</p>
                <p className="mt-2 text-sm text-arena-textSecondary leading-relaxed">{data.coach.summary}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger">
          <MetricCard title="Portföy Değeri" value={cur.format(data.portfolioValue)} subtitle={`Nakit: ${cur.format(data.cash)}`} accent="bg-arena-primary" icon={<Wallet className="h-5 w-5" />} />
          <MetricCard title="Kar/Zarar" value={`${data.pnl>=0?'+':''}${cur.format(data.pnl)}`} subtitle={`${pChange>=0?'Pozitif':'Negatif'} getiri`} accent="bg-arena-success" icon={<TrendingUp className="h-5 w-5" />} />
          <MetricCard title="Disiplin Skoru" value={String(data.coach.disciplineScore)} subtitle="Duygusal kontrol ve planlılık" accent="bg-arena-amber" icon={<BadgeCheck className="h-5 w-5" />} />
          <MetricCard title="Çeşitlendirme" value={String(data.coach.diversificationScore)} subtitle="Sektör dağılımı dengesi" accent="bg-arena-secondary" icon={<ChartColumnBig className="h-5 w-5" />} />
        </section>

        {/* Market + Portfolio Mix */}
        <section className="grid gap-6 xl:grid-cols-12">
          <Panel className="xl:col-span-8" title="Öne Çıkan Hisseler" subtitle="BIST30 canlı" icon={<Users className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">{data.market.slice(0, 4).map(s=><MarketCard key={s.symbol} stock={s} />)}</div>
          </Panel>
          <Panel className="xl:col-span-4" title="Son İşlemler" subtitle="Geçmiş" icon={<Flame className="h-5 w-5" />}>
            <div className="space-y-2">
              {data.trades.slice(0,4).map(t=>(
                <div key={t.id} className="rounded-xl border border-arena-border p-3 hover:bg-arena-hoverBg transition-colors">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-arena-text">{t.symbol}</span>
                    <span className={`arena-badge ${t.side==='BUY'?'bg-arena-successBg text-arena-success border border-arena-success/20':'bg-arena-dangerBg text-arena-danger border border-arena-danger/20'}`}>{t.side==='BUY'?'AL':'SAT'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-arena-textMuted">
                    <span>{num.format(t.quantity)} lot</span>
                    <span>{cur2.format(t.price)}</span>
                    <span>{t.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
        
        <section>
          <NewsFeed />
        </section>

        <footer className="arena-card px-6 py-4 text-xs text-arena-textMuted">
          BorsaArena — hackathon MVP. Eğitim odaklı simülasyondur, finansal tavsiye değildir.
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-arena-bg">
      <Sidebar activePage={page} onNavigate={navTo} mobileOpen={mob} onMobileToggle={()=>setMob(!mob)} />
      <div className="flex-1 lg:ml-[260px]">
        <MarketTicker market={data.market} />
        {renderPageContent()}
      </div>
    </div>
  );
}

function buildPie(h:Holding[]) {
  const t=h.reduce((s,i)=>s+i.quantity*i.currentPrice,0);
  if(!t) return [{name:'Nakit',value:100}];
  return h.map(i=>({name:i.symbol,value:((i.quantity*i.currentPrice)/t)*100}));
}

function localTrade(cur:DashboardData,form:{symbol:string;side:'BUY'|'SELL';quantity:number},mm:Record<string,StockItem>) {
  const p=mm[form.symbol]?.price??0;
  if(!p) return cur;
  const hm=new Map(cur.holdings.map(i=>[i.symbol,{...i}]));
  const ex=hm.get(form.symbol);
  const tv=form.quantity*p;
  if(form.side==='BUY'){
    if(cur.cash<tv) return cur;
    const tq=(ex?.quantity??0)+form.quantity;
    const ba=((ex?.quantity??0)*(ex?.averageCost??p)+form.quantity*p)/tq;
    hm.set(form.symbol,{symbol:form.symbol,quantity:tq,averageCost:ba,currentPrice:p});
  } else {
    if(!ex||ex.quantity<form.quantity) return cur;
    const r=ex.quantity-form.quantity;
    if(r<=0) hm.delete(form.symbol); else hm.set(form.symbol,{...ex,quantity:r});
  }
  const holdings=Array.from(hm.values()).map(i=>({...i,currentPrice:mm[i.symbol]?.price??i.currentPrice}));
  const cash=form.side==='BUY'?cur.cash-tv:cur.cash+tv;
  const pv=cash+holdings.reduce((s,i)=>s+i.quantity*i.currentPrice,0);
  const pnl=pv-100000;
  const trades=[{id:Date.now(),symbol:form.symbol,side:form.side,quantity:form.quantity,price:p,timestamp:new Date().toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}),emotionTag:form.side==='SELL'&&form.quantity>100?'Panik riski':form.side==='BUY'?'Momentum sinyali':'Planlı karar'},...cur.trades];
  const tpv=holdings.reduce((s,i)=>s+i.quantity*i.currentPrice,0)||1;
  const conc=holdings.length?Math.max(...holdings.map(i=>(i.quantity*i.currentPrice)/tpv)):0;
  const bc=trades.filter(i=>i.side==='BUY').length;
  const sc=trades.filter(i=>i.side==='SELL').length;
  const rs=Math.min(95,38+bc*4+sc*3+Math.round(conc*20));
  const ds=Math.max(35,90-trades.length*2+(holdings.length>=3?6:0));
  const dvs=Math.max(30,100-Math.round(conc*55)-Math.max(0,4-holdings.length)*5);
  const profile:ProfileName=ds>=84&&conc<0.35?'Long-Term Investor':rs>=80?'Risk Seeker':sc>bc&&ds<70?'Emotional Trader':bc>sc&&rs>=60?'Momentum Trader':'Conservative Investor';
  const w:string[]=[];
  if(trades[0]?.side==='SELL') w.push('Stres altında satış eğilimi');
  if(conc>0.45) w.push('Tek sektör yoğunluğu fazla');
  if(trades.length>=5) w.push('Aşırı işlem davranışı');
  if(holdings.length<3) w.push('Çeşitlilik düşük');
  if(!w.length) w.push('Davranış dengeli');
  return {...cur,holdings,cash,portfolioValue:pv,pnl,trades,profile,coach:{riskScore:rs,disciplineScore:ds,portfolioHealth:Math.max(40,Math.round((ds+dvs)/2)),diversificationScore:dvs,summary:`Profilin ${profile.toLowerCase()} çizgisinde. Risk ${rs}, disiplin ${ds}.`,warnings:w}};
}

export default App;
