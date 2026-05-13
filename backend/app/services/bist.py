"""BIST canlı fiyat servisi - ISYATIRIM kullanarak tüm hisseleri tek seferde çeker."""

import httpx
from pathlib import Path
from typing import List, Dict
import xml.etree.ElementTree as ET

BASE_DIR = Path(__file__).resolve().parents[1]
SYMBOLS_FILE = BASE_DIR / "data" / "bist_symbols.txt"

ISYATIRIM_URL = "https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/TumHisseSenetleri"

def load_symbols() -> list[str]:
    if not SYMBOLS_FILE.exists():
        return []
    raw = SYMBOLS_FILE.read_text(encoding="utf-8")
    lines = [line.strip().upper() for line in raw.splitlines() if line.strip()]
    return lines


def get_all_bist_prices() -> dict[str, dict]:
    """IsYatirim uzerinden tum BIST verilerini tek istekte ceker."""
    target_symbols = set(load_symbols())
    
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get("https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/TumHisseSenetleri")
            resp.raise_for_status()
            data = resp.json()
            
            # API returns a list of dictionaries directly
            if not isinstance(data, list):
                # Fallback if it ever changes back to an object with 'data'
                data = data.get('data', [])
                
            prices = {}
            for item in data:
                # The API uses 'symbol', 'last', 'dayClose'
                sym = item.get('symbol') or item.get('kod')
                if not sym:
                    continue
                
                # Eger sembol listemizde (bist_symbols.txt) varsa isliyoruz
                # Eger liste bossa (hata durumunda) gelen tum sembolleri isleyelim
                if target_symbols and sym not in target_symbols:
                    continue
                    
                price = item.get('last') or item.get('kapanis') or 0
                prev_close = item.get('dayClose') or price
                
                change_pct = 0
                if prev_close > 0:
                    change_pct = ((price - prev_close) / prev_close) * 100
                
                prices[sym] = {
                    "price": float(price),
                    "change_pct": round(float(change_pct), 2),
                    "name": sym
                }
        return prices
    except Exception as e:
        print(f"IsYatirim API hatası: {e}")
        return {"ERROR": {"name": str(e), "price": 0, "change_pct": 0}}


def get_bist_prices(symbols: list[str]) -> dict[str, dict]:
    """Belirli sembollerin fiyatlarini dondurur."""
    all_prices = get_all_bist_prices()
    if not symbols:
        return all_prices
    
    return {s: all_prices[s] for s in symbols if s in all_prices}


def get_price_history(symbol: str, range: str = "1mo", interval: str = "1d") -> list[dict]:
    """IsYatirim icin gecmis data su an aktif degil, bos donduruyoruz."""
    return []


def compute_period_changes(symbol: str) -> dict:
    """Sadece gunluk degisim destegi var."""
    prices = get_all_bist_prices()
    latest = prices.get(symbol, {})
    daily = latest.get("change_pct")

    return {
        "daily": round(daily, 2) if isinstance(daily, (int, float)) else None,
        "weekly": None,
        "monthly": None
    }


def get_market_news() -> list[dict]:
    """Fetch economy news from TRT Haber RSS."""
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get("https://www.trthaber.com/ekonomi_articles.rss")
            resp.raise_for_status()
            
            # XML parsing
            root = ET.fromstring(resp.content.decode("utf-8", errors="replace"))
            items = root.findall('.//item')
            
            news_list = []
            for item in items[:15]:
                title = item.find('title')
                link = item.find('link')
                pubDate = item.find('pubDate')
                description = item.find('description')
                
                news_list.append({
                    "title": title.text if title is not None else "",
                    "link": link.text if link is not None else "",
                    "pubDate": pubDate.text if pubDate is not None else "",
                    "description": description.text if description is not None else ""
                })
            return news_list
    except Exception as e:
        print(f"Haber çekme hatası: {e}")
        return []
