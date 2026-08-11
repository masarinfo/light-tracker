from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

import models
from database import engine
from routers import exchanges, strategies, trades, auth_router, admin_router, wallet, subscription_router, affiliate_router
from services.coingecko_service import get_cached_prices, get_market_data
from services.commodities_service import get_commodities_data

# Setup logging
logging.basicConfig(level=logging.INFO)

# Create Database tables (empty DB as requested)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Spot Trading Tracker Backend")

# Setup CORS for the React Frontend (default Vite port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup & Shutdown Events
@app.on_event("startup")
def on_startup():
    logging.info("Background scheduler disabled. Data is fetched on-demand to save resources.")

@app.on_event("shutdown")
def on_shutdown():
    pass

# Include Routers
app.include_router(auth_router.router)
app.include_router(exchanges.router)
app.include_router(strategies.router)
app.include_router(trades.router)
app.include_router(admin_router.router)
app.include_router(wallet.router)
app.include_router(subscription_router.router)
app.include_router(affiliate_router.router)

@app.get("/live-prices", tags=["prices"])
def live_prices():
    """
    Returns the cached CoinGecko prices gathered by the background worker.
    """
    prices = get_cached_prices()
    return {
        "success": True,
        "source": "Backend (CoinGecko API)",
        "prices": prices
    }

@app.get("/market-overview", tags=["prices"])
def market_overview():
    """
    Returns the full cached CoinGecko market data array.
    """
    data = get_market_data()
    return {
        "success": True,
        "data": data
    }

@app.get("/commodities-overview", tags=["prices"])
def commodities_overview():
    """
    Returns the full cached Commodities data array.
    """
    data = get_commodities_data()
    return {
        "success": True,
        "data": data
    }
