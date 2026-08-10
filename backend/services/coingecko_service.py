import requests
import logging

logger = logging.getLogger(__name__)

# In-memory cache for prices, mapped to Binance-style symbols (e.g., BTCUSDT)
LIVE_PRICES_CACHE = {
    "BTCUSDT": 60000.0,
    "ETHUSDT": 3000.0,
    "SOLUSDT": 100.0,
    "NEARUSDT": 5.0
}
MARKET_DATA_CACHE = []

def fetch_coingecko_prices():
    global LIVE_PRICES_CACHE, MARKET_DATA_CACHE
    try:
        # Fetch top 250 coins from CoinGecko
        response = requests.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            params={
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 250,
                "page": 1,
                "sparkline": "false"
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        # Update cache, mapping symbol + 'USDT' to the USD price
        new_prices = {}
        for item in data:
            if 'symbol' in item and 'current_price' in item and item['current_price'] is not None:
                # E.g., 'btc' -> 'BTCUSDT'
                symbol = f"{item['symbol'].upper()}USDT"
                new_prices[symbol] = float(item['current_price'])
                
        # Update the global caches
        LIVE_PRICES_CACHE.update(new_prices)
        MARKET_DATA_CACHE = data
        
        logger.info(f"Successfully updated {len(new_prices)} prices from CoinGecko.")
        
    except Exception as e:
        logger.error(f"Failed to fetch CoinGecko prices: {str(e)}")

def get_cached_prices():
    if not MARKET_DATA_CACHE:
        fetch_coingecko_prices()
    return LIVE_PRICES_CACHE

def get_market_data():
    if not MARKET_DATA_CACHE:
        fetch_coingecko_prices()
    return MARKET_DATA_CACHE

