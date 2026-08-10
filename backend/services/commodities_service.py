import yfinance as yf
import logging

logger = logging.getLogger(__name__)

COMMODITIES_CACHE = []

def fetch_commodities_prices():
    global COMMODITIES_CACHE
    try:
        # GC=F (Gold), CL=F (Crude Oil), ^TNX (US 10-Yr Bond Yield)
        tickers = {
            "GC=F": {"name": "Gold", "symbol": "XAU/USD"},
            "CL=F": {"name": "Crude Oil", "symbol": "WTI"},
            "^TNX": {"name": "US 10-Yr Bond", "symbol": "US10Y"}
        }
        
        data = yf.download(list(tickers.keys()), period='2d', interval='1d', progress=False)
        
        new_cache = []
        # In a multi-ticker download, data['Close'] is a DataFrame with tickers as columns
        for t_symbol, meta in tickers.items():
            try:
                # get the last two closes to calculate % change
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
                
        if new_cache:
            COMMODITIES_CACHE = new_cache
            logger.info(f"Successfully updated {len(COMMODITIES_CACHE)} commodities from yfinance.")
            
    except Exception as e:
        logger.error(f"Failed to fetch commodities: {str(e)}")

def get_commodities_data():
    return COMMODITIES_CACHE
