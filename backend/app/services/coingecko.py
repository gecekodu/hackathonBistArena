"""CoinGecko API entegrasyonu - Gerçek kripto fiyatları almak için"""

import httpx
from typing import Optional

COINGECKO_API = "https://api.coingecko.com/api/v3"

# Kripto paralar - CoinGecko ID'leri
CRYPTOS = {
    'BTC': {'id': 'bitcoin', 'name': 'Bitcoin'},
    'ETH': {'id': 'ethereum', 'name': 'Ethereum'},
    'ADA': {'id': 'cardano', 'name': 'Cardano'},
    'SOL': {'id': 'solana', 'name': 'Solana'},
    'XRP': {'id': 'ripple', 'name': 'XRP'},
    'DOGE': {'id': 'dogecoin', 'name': 'Dogecoin'},
}


def get_crypto_prices() -> dict[str, dict]:
    """CoinGecko'dan gerçek kripto fiyatlarını al"""
    try:
        ids = ','.join([info['id'] for info in CRYPTOS.values()])
        
        with httpx.Client() as client:
            response = client.get(
                f"{COINGECKO_API}/simple/price",
                params={
                    'ids': ids,
                    'vs_currencies': 'usd',
                    'include_market_cap': 'true',
                    'include_24hr_vol': 'true',
                    'include_24hr_change': 'true',
                }
            )
        
        response.raise_for_status()
        data = response.json()
        
        # Veri dönüştürme
        prices = {}
        for symbol, info in CRYPTOS.items():
            crypto_id = info['id']
            if crypto_id in data:
                prices[symbol] = {
                    'name': info['name'],
                    'price': data[crypto_id].get('usd', 0),
                    'change_24h': data[crypto_id].get('usd_24h_change', 0),
                    'market_cap': data[crypto_id].get('usd_market_cap', 0),
                }
        
        return prices
    except Exception as e:
        print(f"CoinGecko API hatası: {e}")
        return get_fallback_prices()


def get_fallback_prices() -> dict[str, dict]:
    """API başarısız olursa sabit fiyatlar kullan"""
    return {
        'BTC': {'name': 'Bitcoin', 'price': 67000, 'change_24h': 2.5, 'market_cap': 1300000000000},
        'ETH': {'name': 'Ethereum', 'price': 3500, 'change_24h': 1.8, 'market_cap': 420000000000},
        'ADA': {'name': 'Cardano', 'price': 0.98, 'change_24h': 3.2, 'market_cap': 35000000000},
        'SOL': {'name': 'Solana', 'price': 142, 'change_24h': 4.1, 'market_cap': 63000000000},
        'XRP': {'name': 'XRP', 'price': 2.45, 'change_24h': -1.2, 'market_cap': 130000000000},
        'DOGE': {'name': 'Dogecoin', 'price': 0.38, 'change_24h': 5.6, 'market_cap': 55000000000},
    }
