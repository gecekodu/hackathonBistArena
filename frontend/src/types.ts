export type ProfileName =
  | 'Conservative Investor'
  | 'Momentum Trader'
  | 'Risk Seeker'
  | 'Long-Term Investor'
  | 'Emotional Trader';

export type StockItem = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePct: number;
  dayVolume: string;
};

export type Holding = {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
};

export type TradeRecord = {
  id: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  emotionTag: string;
};

export type LeaderboardItem = {
  rank: number;
  name: string;
  returnPct: number;
  disciplineScore: number;
  badge: string;
};

export type InsightItem = {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
};

export type CoachNote = {
  riskScore: number;
  disciplineScore: number;
  portfolioHealth: number;
  diversificationScore: number;
  summary: string;
  warnings: string[];
};

export type IntegrationStatus = {
  enabled: boolean;
  model?: string;
  projectId?: string | null;
};

export type DashboardData = {
  market: StockItem[];
  holdings: Holding[];
  trades: TradeRecord[];
  leaderboard: LeaderboardItem[];
  insights: InsightItem[];
  coach: CoachNote;
  profile: ProfileName;
  portfolioValue: number;
  cash: number;
  pnl: number;
  portfolioSeries: { date: string; value: number }[];
  performanceSeries: { label: string; value: number }[];
  integrations: {
    gemini: IntegrationStatus;
    firebase: IntegrationStatus;
  };
  disclaimer: string;
};
