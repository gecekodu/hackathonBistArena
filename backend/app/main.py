from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .services.firebase import get_firebase_status, persist_trade_snapshot
from .services.gemini import build_ai_coach_report, get_gemini_status

app = FastAPI(title='BISTMind AI API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

INITIAL_CASH = 100_000.0

market = {
    'THYAO': {'name': 'Türk Hava Yolları', 'sector': 'Ulaştırma', 'price': 304.4, 'change_pct': 2.1},
    'ASELS': {'name': 'Aselsan', 'sector': 'Savunma', 'price': 88.3, 'change_pct': 1.7},
    'BIMAS': {'name': 'BİM Mağazalar', 'sector': 'Perakende', 'price': 521.2, 'change_pct': -0.8},
    'AKBNK': {'name': 'Akbank', 'sector': 'Bankacılık', 'price': 71.9, 'change_pct': 0.6},
    'TUPRS': {'name': 'Tüpraş', 'sector': 'Enerji', 'price': 196.5, 'change_pct': -1.4},
    'SAHOL': {'name': 'Sabancı Holding', 'sector': 'Holding', 'price': 92.4, 'change_pct': 0.9},
}

state = {
    'cash': INITIAL_CASH,
    'holdings': {},
    'trades': [],
    'next_trade_id': 1,
}


class TradeIn(BaseModel):
    symbol: str = Field(min_length=2, max_length=10)
    side: Literal['BUY', 'SELL']
    quantity: int = Field(gt=0, le=100000)


class HoldingOut(BaseModel):
    symbol: str
    quantity: int
    average_cost: float
    current_price: float
    value: float
    pnl: float


class TradeOut(BaseModel):
    id: int
    symbol: str
    side: Literal['BUY', 'SELL']
    quantity: int
    price: float
    timestamp: str
    emotion_tag: str


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok', 'service': 'BISTMind AI API'}


@app.get('/api/dashboard')
def dashboard() -> dict:
    return build_dashboard()


@app.get('/api/system')
def system_status() -> dict:
    return {
        'gemini': get_gemini_status(),
        'firebase': get_firebase_status(),
    }


@app.post('/api/trades')
def create_trade(trade: TradeIn) -> dict:
    symbol = trade.symbol.upper()
    if symbol not in market:
        raise HTTPException(status_code=404, detail='Unknown BIST symbol')

    price = market[symbol]['price']
    trade_value = trade.quantity * price
    holdings = state['holdings']
    current_holding = holdings.get(symbol, {'quantity': 0, 'average_cost': price})

    if trade.side == 'BUY':
        if state['cash'] < trade_value:
            raise HTTPException(status_code=400, detail='Insufficient virtual cash')

        total_quantity = current_holding['quantity'] + trade.quantity
        blended_cost = (
            current_holding['quantity'] * current_holding['average_cost'] + trade.quantity * price
        ) / total_quantity

        holdings[symbol] = {
            'quantity': total_quantity,
            'average_cost': blended_cost,
        }
        state['cash'] -= trade_value
    else:
        if current_holding['quantity'] < trade.quantity:
            raise HTTPException(status_code=400, detail='Not enough holdings to sell')

        remaining_quantity = current_holding['quantity'] - trade.quantity
        if remaining_quantity == 0:
            holdings.pop(symbol, None)
        else:
            holdings[symbol] = {
                'quantity': remaining_quantity,
                'average_cost': current_holding['average_cost'],
            }
        state['cash'] += trade_value

    emotion_tag = detect_emotion_tag(trade.side, symbol, trade.quantity)
    record = {
        'id': state['next_trade_id'],
        'symbol': symbol,
        'side': trade.side,
        'quantity': trade.quantity,
        'price': price,
        'timestamp': datetime.now(timezone.utc).strftime('%d.%m.%Y %H:%M'),
        'emotion_tag': emotion_tag,
    }
    state['trades'].insert(0, record)
    state['next_trade_id'] += 1

    dashboard = build_dashboard()
    persist_trade_snapshot(record, dashboard)

    return dashboard


@app.get('/api/market')
def get_market() -> list[dict]:
    return [
        {
            'symbol': symbol,
            'name': item['name'],
            'sector': item['sector'],
            'price': item['price'],
            'changePct': item['change_pct'],
        }
        for symbol, item in market.items()
    ]


def build_dashboard() -> dict:
    holdings_out = []
    portfolio_value = state['cash']
    sector_weights = Counter()

    for symbol, position in state['holdings'].items():
        price = market[symbol]['price']
        value = position['quantity'] * price
        pnl = (price - position['average_cost']) * position['quantity']
        portfolio_value += value
        holdings_out.append(
            {
                'symbol': symbol,
                'quantity': position['quantity'],
                'average_cost': round(position['average_cost'], 2),
                'current_price': price,
                'value': round(value, 2),
                'pnl': round(pnl, 2),
            }
        )
        sector_weights[market[symbol]['sector']] += value

    holdings_out.sort(key=lambda item: item['value'], reverse=True)

    insight_data = analyze_behavior(state['trades'], holdings_out, sector_weights, portfolio_value)
    ai_report = build_ai_coach_report(
        {
            'profile': insight_data['profile'],
            'riskScore': insight_data['riskScore'],
            'disciplineScore': insight_data['disciplineScore'],
            'diversificationScore': insight_data['diversificationScore'],
            'patienceScore': insight_data['patienceScore'],
            'warnings': insight_data['coach']['warnings'],
            'tradeCount': len(state['trades']),
            'holdingCount': len(holdings_out),
        }
    )

    insight_data['coach']['summary'] = ai_report['summary']
    insight_data['coach']['warnings'] = ai_report['warnings']

    return {
        'market': [
            {
                'symbol': symbol,
                'name': item['name'],
                'sector': item['sector'],
                'price': item['price'],
                'changePct': item['change_pct'],
                'dayVolume': 'Demo',
            }
            for symbol, item in market.items()
        ],
        'holdings': holdings_out,
        'trades': list(state['trades'])[:8],
        'leaderboard': [
            {'rank': 1, 'name': 'AnkaraQuant', 'returnPct': 18.4, 'disciplineScore': 92, 'badge': 'Most Disciplined Investor'},
            {'rank': 2, 'name': 'IstanbulAlpha', 'returnPct': 16.1, 'disciplineScore': 87, 'badge': 'Best Diversifier'},
            {'rank': 3, 'name': 'BISTMind_User', 'returnPct': round(max((portfolio_value - INITIAL_CASH) / INITIAL_CASH * 100, 0), 1), 'disciplineScore': insight_data['disciplineScore'], 'badge': 'Momentum Runner'},
        ],
        'insights': insight_data['insights'],
        'coach': insight_data['coach'],
        'profile': insight_data['profile'],
        'portfolioValue': round(portfolio_value, 2),
        'cash': round(state['cash'], 2),
        'pnl': round(portfolio_value - INITIAL_CASH, 2),
        'portfolioSeries': build_portfolio_series(portfolio_value),
        'performanceSeries': [
            {'label': 'Disiplin', 'value': insight_data['disciplineScore']},
            {'label': 'Risk', 'value': insight_data['riskScore']},
            {'label': 'Denge', 'value': insight_data['diversificationScore']},
            {'label': 'Sabır', 'value': insight_data['patienceScore']},
        ],
        'integrations': {
            'gemini': get_gemini_status(),
            'firebase': get_firebase_status(),
        },
        'disclaimer': 'Bu platform yatırım tavsiyesi vermez. Yalnızca eğitim ve davranışsal farkındalık amaçlıdır.',
    }


def build_portfolio_series(portfolio_value: float) -> list[dict]:
    base = [100000, 101700, 104200, 108400, 116900, 122300]
    delta = portfolio_value - base[-1]
    adjusted = [round(value + delta * (index / 5), 2) for index, value in enumerate(base)]
    labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Bugün']
    return [{'date': label, 'value': adjusted[index]} for index, label in enumerate(labels)]


def analyze_behavior(trades: list[dict], holdings_out: list[dict], sector_weights: Counter, portfolio_value: float) -> dict:
    buy_count = sum(1 for trade in trades if trade['side'] == 'BUY')
    sell_count = sum(1 for trade in trades if trade['side'] == 'SELL')
    active_sectors = len(sector_weights) or 1
    concentration = max(sector_weights.values()) / max(portfolio_value - state['cash'], 1) if sector_weights else 0

    risk_score = min(95, 38 + buy_count * 4 + sell_count * 2 + int(concentration * 30))
    discipline_score = max(35, 90 - buy_count * 2 - sell_count + (8 if holdings_out else 0))
    diversification_score = max(30, 100 - (active_sectors * 12) - int(concentration * 40))
    patience_score = max(30, 88 - len(trades) * 3 + (10 if sell_count < buy_count else 0))

    profile = classify_profile(risk_score, discipline_score, buy_count, sell_count, concentration)
    warnings = build_warnings(trades, holdings_out, concentration)

    insights = []
    if sell_count > buy_count and any(trade['side'] == 'SELL' for trade in trades[:3]):
        insights.append({
            'title': 'Panic Selling',
            'description': 'Son işlemlerde baskı anında pozisyon kapatma eğilimi görünüyor. Karar anında biraz daha beklemek davranış kaliteni artırabilir.',
            'severity': 'high',
        })
    else:
        insights.append({
            'title': 'Steady Execution',
            'description': 'İşlemlerinin önemli bir kısmı planlı görünüyor. Bu ritmi korursan davranışsal puanın daha istikrarlı kalır.',
            'severity': 'low',
        })

    if concentration > 0.45:
        insights.append({
            'title': 'Concentration Risk',
            'description': 'Portföyün tek bir sektörde yoğunlaşıyor. Bu, haber akışı geldiğinde duygusal dalgalanmayı artırabilir.',
            'severity': 'medium',
        })
    else:
        insights.append({
            'title': 'Diversification Pulse',
            'description': 'Dağılım yapın fena değil ancak birkaç ek sektör ile portföy dayanıklılığını artırabilirsin.',
            'severity': 'medium',
        })

    if len(trades) > 6:
        insights.append({
            'title': 'Overtrading Watch',
            'description': 'İşlem sıklığı artıyor. Daha az ama daha planlı işlem, davranış notunu yükseltir.',
            'severity': 'medium',
        })

    summary = {
        'riskScore': risk_score,
        'disciplineScore': discipline_score,
        'portfolioHealth': max(40, int((discipline_score + diversification_score) / 2)),
        'diversificationScore': diversification_score,
        'summary': f'Profilin {profile.lower()} çizgisine yakın. Bugün risk skoru {risk_score} ve disiplin skoru {discipline_score}.',
        'warnings': warnings,
        'patienceScore': patience_score,
    }

    return {'profile': profile, 'riskScore': risk_score, 'disciplineScore': discipline_score, 'diversificationScore': diversification_score, 'patienceScore': patience_score, 'coach': summary, 'insights': insights}


def classify_profile(risk_score: int, discipline_score: int, buy_count: int, sell_count: int, concentration: float) -> str:
    if discipline_score >= 84 and concentration < 0.35:
        return 'Long-Term Investor'
    if risk_score >= 78:
        return 'Risk Seeker'
    if sell_count > buy_count and discipline_score < 70:
        return 'Emotional Trader'
    if buy_count > sell_count and risk_score >= 60:
        return 'Momentum Trader'
    return 'Conservative Investor'


def build_warnings(trades: list[dict], holdings_out: list[dict], concentration: float) -> list[str]:
    warnings = []
    if trades and trades[0]['side'] == 'SELL':
        warnings.append('Kısa vadeli stres altında satış yapma eğilimi var')
    if concentration > 0.45:
        warnings.append('Tek sektör yoğunluğu fazla')
    if len(trades) >= 5:
        warnings.append('Aşırı işlem davranışı gözlemleniyor')
    if holdings_out and any(item['pnl'] < 0 for item in holdings_out):
        warnings.append('Zarar eden pozisyonlarda sabır test ediliyor')
    if not warnings:
        warnings.append('Davranış örüntüsü şu an dengeli görünüyor')
    return warnings


def detect_emotion_tag(side: str, symbol: str, quantity: int) -> str:
    if side == 'SELL' and quantity >= 200:
        return 'Panic risk'
    if side == 'BUY' and symbol in {'THYAO', 'ASELS'}:
        return 'Momentum signal'
    if quantity >= 300:
        return 'High conviction'
    return 'Planlı karar'
