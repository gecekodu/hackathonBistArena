"""BIST canlı fiyat servisi - Yahoo Finance kullanarak fiyat çeker."""

import httpx
from pathlib import Path
from typing import List, Dict

YAHOO_QUOTE = "https://query1.finance.yahoo.com/v7/finance/quote"
YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart"
BASE_DIR = Path(__file__).resolve().parents[1]
SYMBOLS_FILE = BASE_DIR / "data" / "bist_symbols.txt"


def load_symbols() -> list[str]:
    if not SYMBOLS_FILE.exists():
        return []
    raw = SYMBOLS_FILE.read_text(encoding="utf-8")
    lines = [line.strip().upper() for line in raw.splitlines() if line.strip()]
    return lines


def get_bist_prices(symbols: list[str]) -> dict[str, dict]:
    """symbols: list like ['AKBNK','THYAO']
    returns mapping symbol -> {price, change_pct}
    """
    if not symbols:
        return {}

    # Yahoo expects suffix .IS for Istanbul stocks
    yahoo_symbols = ",".join(f"{s}.IS" for s in symbols)
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(YAHOO_QUOTE, params={"symbols": yahoo_symbols})
            resp.raise_for_status()
            payload = resp.json()
            results = payload.get("quoteResponse", {}).get("result", [])

        out: dict[str, dict] = {}
        for item in results:
            sym = item.get("symbol", "").upper()
            if sym.endswith('.IS'):
                key = sym.replace('.IS', '')
            else:
                key = sym
            price = item.get('regularMarketPrice') or 0
            change = item.get('regularMarketChangePercent') or 0
            out[key] = {"price": float(price), "change_pct": float(change), "name": item.get('shortName')}
        return out
    except Exception as e:
        print(f"BIST fiyat çekme hatası: {e}")
        return {}


def get_all_bist_prices() -> dict[str, dict]:
    syms = load_symbols()
    return get_bist_prices(syms)


def get_price_history(symbol: str, range: str = "1mo", interval: str = "1d") -> list[dict]:
    """Return list of {'timestamp': int, 'close': float} for the given symbol.
    symbol without .IS suffix. Uses Yahoo chart API.
    """
    ticker = f"{symbol}.IS"
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{YAHOO_CHART}/{ticker}", params={"range": range, "interval": interval})
            resp.raise_for_status()
            payload = resp.json()
            result = payload.get("chart", {}).get("result")
            if not result:
                return []
            r = result[0]
            timestamps = r.get("timestamp") or []
            indicators = r.get("indicators", {}).get("quote", [])
            closes = indicators[0].get("close") if indicators else []

        out = []
        for t, c in zip(timestamps, closes):
            if c is None:
                continue
            out.append({"timestamp": int(t), "close": float(c)})
        return out
    except Exception as e:
        print(f"Price history hata: {e}")
        return []


def compute_period_changes(symbol: str) -> dict:
    """Compute daily (from quote), weekly (7d), monthly (30d) percent changes when possible.
    Returns dict with keys: daily, weekly, monthly (floats or None).
    """
    quote_prices = get_bist_prices([symbol])
    latest = quote_prices.get(symbol, {})
    daily = latest.get("change_pct")

    history = get_price_history(symbol, range="1mo", interval="1d")
    weekly = None
    monthly = None
    try:
        if history:
            # history is ordered oldest->newest
            closes = [p["close"] for p in history]
            latest_close = closes[-1]
            # find index ~7 days ago (assume 7 from end if available)
            if len(closes) >= 8:
                past7 = closes[-8]
                weekly = (latest_close - past7) / past7 * 100 if past7 != 0 else None
            if len(closes) >= 31:
                past30 = closes[-31]
                monthly = (latest_close - past30) / past30 * 100 if past30 != 0 else None
    except Exception:
        pass

    return {"daily": round(daily, 2) if isinstance(daily, (int, float)) else None,
            "weekly": round(weekly, 2) if isinstance(weekly, (int, float)) else None,
            "monthly": round(monthly, 2) if isinstance(monthly, (int, float)) else None}
