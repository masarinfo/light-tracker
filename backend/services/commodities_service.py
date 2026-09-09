import yfinance as yf
import requests
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

COMMODITIES_CACHE = []
LAST_FETCH_TIME = datetime.min
PREV_PRICES = {}

def fetch_commodities_prices():
    global COMMODITIES_CACHE, LAST_FETCH_TIME, PREV_PRICES
    new_cache = []
    
    # 1. Fetch Real-Time Spot Gold (XAU) & Silver (XAG)
    spot_gold_price = None
    spot_gold_change = 0.0
    spot_silver_price = None
    spot_silver_change = 0.0
    
    # Gold Spot: gold-api.com
    try:
        r_gold = requests.get('https://api.gold-api.com/price/XAU', timeout=4)
        if r_gold.status_code == 200:
            spot_gold_price = float(r_gold.json().get('price', 0.0))
    except Exception as e:
        logger.warning(f"Failed to fetch spot gold from gold-api: {e}")
        
    # Gold Spot & 24h change from Binance PAXG (London Physical 1oz LBMA spot gold)
    try:
        r_paxg = requests.get('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT', timeout=4)
        if r_paxg.status_code == 200:
            data = r_paxg.json()
            if not spot_gold_price:
                spot_gold_price = float(data.get('lastPrice', 0.0))
            spot_gold_change = float(data.get('priceChangePercent', 0.0))
    except Exception as e:
        logger.warning(f"Failed to fetch gold from binance: {e}")

    # Silver Spot: gold-api.com
    try:
        r_silver = requests.get('https://api.gold-api.com/price/XAG', timeout=4)
        if r_silver.status_code == 200:
            spot_silver_price = float(r_silver.json().get('price', 0.0))
    except Exception as e:
        logger.warning(f"Failed to fetch spot silver from gold-api: {e}")

    # Calculate 24h change for silver if we have previous price or from cache
    if spot_silver_price and 'silver' in PREV_PRICES and PREV_PRICES['silver'] > 0:
        spot_silver_change = ((spot_silver_price - PREV_PRICES['silver']) / PREV_PRICES['silver']) * 100
    elif spot_silver_price:
        PREV_PRICES['silver'] = spot_silver_price

    # 2. Add Spot Gold entries
    if spot_gold_price:
        gold_item = {
            "id": "XAU",
            "name": "Gold (Spot)",
            "symbol": "XAU/USD",
            "market_type": "spot",
            "current_price": spot_gold_price,
            "price_change_percentage_24h": spot_gold_change
        }
        new_cache.append(gold_item)
        # Backward compatibility alias
        new_cache.append({
            "id": "GC=F",
            "name": "Gold (Spot)",
            "symbol": "XAU/USD",
            "market_type": "spot",
            "current_price": spot_gold_price,
            "price_change_percentage_24h": spot_gold_change
        })

    # 3. Add Spot Silver entries
    if spot_silver_price:
        silver_item = {
            "id": "XAG",
            "name": "Silver (Spot)",
            "symbol": "XAG/USD",
            "market_type": "spot",
            "current_price": spot_silver_price,
            "price_change_percentage_24h": spot_silver_change
        }
        new_cache.append(silver_item)
        # Backward compatibility alias
        new_cache.append({
            "id": "SI=F",
            "name": "Silver (Spot)",
            "symbol": "XAG/USD",
            "market_type": "spot",
            "current_price": spot_silver_price,
            "price_change_percentage_24h": spot_silver_change
        })

    # 4. Fetch Other Commodities (Crude Oil, US 10Y Bond, or fallback for Gold/Silver if needed)
    try:
        other_tickers = {
            "CL=F": {"name": "Crude Oil", "symbol": "WTI"},
            "^TNX": {"name": "US 10-Yr Bond", "symbol": "US10Y"}
        }
        if not spot_gold_price:
            other_tickers["GC=F"] = {"name": "Gold", "symbol": "XAU/USD"}
        if not spot_silver_price:
            other_tickers["SI=F"] = {"name": "Silver", "symbol": "XAG/USD"}

        data = yf.download(list(other_tickers.keys()), period='2d', interval='1d', progress=False)
        for t_symbol, meta in other_tickers.items():
            try:
                closes = data['Close'][t_symbol].dropna()
                if len(closes) >= 2:
                    current_price = float(closes.iloc[-1])
                    prev_price = float(closes.iloc[-2])
                    change_pct = ((current_price - prev_price) / prev_price) * 100
                elif len(closes) == 1:
                    current_price = float(closes.iloc[-1])
                    change_pct = 0.0
                else:
                    continue

                new_cache.append({
                    "id": t_symbol,
                    "name": meta["name"],
                    "symbol": meta["symbol"],
                    "current_price": current_price,
                    "price_change_percentage_24h": change_pct
                })
            except Exception as inner_e:
                logger.warning(f"Failed to parse {t_symbol} data: {str(inner_e)}")
    except Exception as e:
        logger.warning(f"Failed to fetch other commodities from yfinance: {str(e)}")

    if new_cache:
        COMMODITIES_CACHE = new_cache
        LAST_FETCH_TIME = datetime.now()
        logger.info(f"Successfully updated {len(COMMODITIES_CACHE)} commodities.")

def get_commodities_data():
    if not COMMODITIES_CACHE or (datetime.now() - LAST_FETCH_TIME).total_seconds() > 30:
        fetch_commodities_prices()
    return COMMODITIES_CACHE

