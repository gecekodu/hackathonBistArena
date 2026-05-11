import type { DashboardData } from '../types';

export const mockDashboard: DashboardData = {
  market: [
    { symbol: 'THYAO', name: 'Türk Hava Yolları', sector: 'Ulaştırma', price: 304.4, changePct: 2.1, dayVolume: '18.2M' },
    { symbol: 'ASELS', name: 'Aselsan', sector: 'Savunma', price: 88.3, changePct: 1.7, dayVolume: '11.4M' },
    { symbol: 'BIMAS', name: 'BİM Mağazalar', sector: 'Perakende', price: 521.2, changePct: -0.8, dayVolume: '4.9M' },
    { symbol: 'AKBNK', name: 'Akbank', sector: 'Bankacılık', price: 71.9, changePct: 0.6, dayVolume: '22.1M' },
    { symbol: 'TUPRS', name: 'Tüpraş', sector: 'Enerji', price: 196.5, changePct: -1.4, dayVolume: '6.3M' },
  ],
  holdings: [
    { symbol: 'THYAO', quantity: 180, averageCost: 287.1, currentPrice: 304.4 },
    { symbol: 'ASELS', quantity: 240, averageCost: 79.5, currentPrice: 88.3 },
    { symbol: 'AKBNK', quantity: 540, averageCost: 69.2, currentPrice: 71.9 },
  ],
  trades: [
    { id: 1, symbol: 'THYAO', side: 'BUY', quantity: 120, price: 279.1, timestamp: 'Bugün 09:12', emotionTag: 'FOMO riski' },
    { id: 2, symbol: 'ASELS', side: 'BUY', quantity: 180, price: 82.4, timestamp: 'Dün 14:35', emotionTag: 'Planlı giriş' },
    { id: 3, symbol: 'BIMAS', side: 'SELL', quantity: 40, price: 528.6, timestamp: 'Dün 10:05', emotionTag: 'Erken kar alma' },
  ],
  leaderboard: [
    { rank: 1, name: 'AnkaraQuant', returnPct: 18.4, disciplineScore: 92, badge: 'Most Disciplined Investor' },
    { rank: 2, name: 'IstanbulAlpha', returnPct: 16.1, disciplineScore: 87, badge: 'Best Diversifier' },
    { rank: 3, name: 'BISTMind_User', returnPct: 12.7, disciplineScore: 84, badge: 'Momentum Runner' },
  ],
  insights: [
    { title: 'Panic Selling', description: 'Son işlemlerde düşüş sonrası acele satış eğilimi var. Karar süresini biraz uzatıyorsun ama stres anında disiplin düşüyor.', severity: 'high' },
    { title: 'Diversification Check', description: 'Portföyün bankacılık ve ulaştırma tarafında dengeli; enerji tarafı düşük kalmış.', severity: 'medium' },
    { title: 'Overtrading Signal', description: 'Gün içi işlem sayısı arttığında performansın dalgalanıyor. Daha az ama daha planlı işlem daha iyi sonuç veriyor.', severity: 'medium' },
  ],
  coach: {
    riskScore: 64,
    disciplineScore: 78,
    portfolioHealth: 81,
    diversificationScore: 69,
    summary: 'Bugünkü davranış örüntün planlı ama zaman zaman hızlı karar verme eğilimi gösteriyor. Özellikle güçlü yükselişlerde FOMO tetiklenebiliyor.',
    warnings: [
      'Kazanan pozisyonları erken kapatma eğilimi',
      'Güçlü yükselişlerde acele alım riski',
      'Tek sektör yoğunlaşmasını azaltma ihtiyacı',
    ],
  },
  profile: 'Momentum Trader',
  portfolioValue: 128450,
  cash: 28450,
  pnl: 28450,
  portfolioSeries: [
    { date: 'Pzt', value: 101200 },
    { date: 'Sal', value: 104800 },
    { date: 'Çar', value: 110900 },
    { date: 'Per', value: 118200 },
    { date: 'Cum', value: 125700 },
    { date: 'Bugün', value: 128450 },
  ],
  performanceSeries: [
    { label: 'Disiplin', value: 78 },
    { label: 'Risk', value: 64 },
    { label: 'Denge', value: 69 },
    { label: 'Sabır', value: 72 },
  ],
  integrations: {
    gemini: { enabled: false, model: 'gemini-2.0-flash' },
    firebase: { enabled: false, projectId: null },
  },
  disclaimer: 'Bu platform yatırım tavsiyesi vermez. Yalnızca eğitim ve davranışsal farkındalık amaçlıdır.',
};
