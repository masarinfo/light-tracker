import requests
import logging
import urllib3
from datetime import datetime, timedelta

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

# In-memory cache for prices, mapped to Binance-style symbols (e.g., BTCUSDT)
LIVE_PRICES_CACHE = {
    "BTCUSDT": 60000.0,
    "ETHUSDT": 3000.0,
    "SOLUSDT": 100.0,
    "NEARUSDT": 5.0
}
MARKET_DATA_CACHE = []
LAST_FETCH_TIME = datetime.min

def fetch_coingecko_prices():
    """
    Fetches crypto prices directly from Binance Public API and CoinCap API.
    Provides identical JSON structure to CoinGecko for the frontend.
    """
    global LIVE_PRICES_CACHE, MARKET_DATA_CACHE, LAST_FETCH_TIME
    
    # Try Binance API first (More reliable, no strict rate limits on Render)
    try:
        response = requests.get(
            "https://api.binance.com/api/v3/ticker/24hr",
            timeout=8,
            verify=False
        )
        if response.status_code == 200:
            data = response.json()
            new_prices = {}
            market_list = []
            
            # Filter USDT pairs
            usdt_pairs = [item for item in data if item.get("symbol", "").endswith("USDT") and not item.get("symbol", "").startswith("USDC")]
            usdt_pairs.sort(key=lambda x: float(x.get("quoteVolume", 0)), reverse=True)
            
            rank = 1
            for item in usdt_pairs[:200]:
                raw_symbol = item["symbol"]
                coin_code = raw_symbol.replace("USDT", "")
                price = float(item.get("lastPrice", 0))
                change_pct = float(item.get("priceChangePercent", 0))
                volume = float(item.get("quoteVolume", 0))
                
                if price > 0:
                    new_prices[raw_symbol] = price
                    
                    market_list.append({
                        "id": coin_code.lower(),
                        "symbol": coin_code.lower(),
                        "name": coin_code,
                        "image": f"https://assets.coincap.io/assets/icons/{coin_code.lower()}@2x.png",
                        "current_price": price,
                        "price_change_percentage_24h": change_pct,
                        "total_volume": volume,
                        "market_cap": volume * 15,
                        "market_cap_rank": rank
                    })
                    rank += 1

            LIVE_PRICES_CACHE.update(new_prices)
            MARKET_DATA_CACHE = market_list
            LAST_FETCH_TIME = datetime.now()
            logger.info(f"Successfully updated {len(new_prices)} prices from Binance API.")
            return
    except Exception as e:
        logger.warning(f"Binance API fetch failed, trying CoinCap fallback: {str(e)}")

    # Fallback to CoinCap API
    try:
        response = requests.get(
            "https://api.coincap.io/v2/assets",
            params={"limit": 200},
            timeout=8,
            verify=False
        )
        if response.status_code == 200:
            res_json = response.json()
            items = res_json.get("data", [])
            new_prices = {}
            market_list = []
            
            for rank_idx, item in enumerate(items, 1):
                sym = item.get("symbol", "").upper()
                price = float(item.get("priceUsd", 0))
                change_pct = float(item.get("changePercent24Hr", 0))
                volume = float(item.get("volumeUsd24Hr", 0))
                market_cap = float(item.get("marketCapUsd", 0))
                
                if sym and price > 0:
                    pair = f"{sym}USDT"
                    new_prices[pair] = price
                    
                    market_list.append({
                        "id": item.get("id", sym.lower()),
                        "symbol": sym.lower(),
                        "name": item.get("name", sym),
                        "image": f"https://assets.coincap.io/assets/icons/{sym.lower()}@2x.png",
                        "current_price": price,
                        "price_change_percentage_24h": change_pct,
                        "total_volume": volume,
                        "market_cap": market_cap,
                        "market_cap_rank": rank_idx
                    })
            
            LIVE_PRICES_CACHE.update(new_prices)
            MARKET_DATA_CACHE = market_list
            LAST_FETCH_TIME = datetime.now()
            logger.info(f"Successfully updated {len(new_prices)} prices from CoinCap API.")
    except Exception as e:
        logger.error(f"Failed to fetch prices from fallbacks: {str(e)}")

def get_cached_prices():
    if not MARKET_DATA_CACHE or (datetime.now() - LAST_FETCH_TIME).total_seconds() > 60:
        fetch_coingecko_prices()
    return LIVE_PRICES_CACHE

def get_market_data():
    if not MARKET_DATA_CACHE or (datetime.now() - LAST_FETCH_TIME).total_seconds() > 60:
        fetch_coingecko_prices()
    return MARKET_DATA_CACHE
