from apscheduler.schedulers.background import BackgroundScheduler
import logging
from services.coingecko_service import fetch_coingecko_prices
from services.commodities_service import fetch_commodities_prices
from database import SessionLocal
from services.payment_orchestrator import PaymentOrchestrator

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def poll_blockchain_payments():
    db = SessionLocal()
    try:
        orchestrator = PaymentOrchestrator(db)
        orchestrator.poll_for_payments()
    except Exception as e:
        logger.error(f"Error polling blockchain payments: {e}")
    finally:
        db.close()

def start_scheduler():
    # Fetch immediately once at startup
    try:
        fetch_coingecko_prices()
        fetch_commodities_prices()
    except Exception as e:
        logger.error(f"Error fetching initial prices: {e}")

    # Run fetch_coingecko_prices every 30 seconds
    scheduler.add_job(fetch_coingecko_prices, 'interval', seconds=30, id='fetch_prices_job', replace_existing=True)
    
    # Run fetch_commodities_prices every 60 seconds
    scheduler.add_job(fetch_commodities_prices, 'interval', seconds=60, id='fetch_commodities_job', replace_existing=True)
    
    # Run blockchain payment poller every 30 seconds
    scheduler.add_job(poll_blockchain_payments, 'interval', seconds=30, id='poll_payments_job', replace_existing=True)
    
    scheduler.start()
    logger.info("Background scheduler started: Polling CoinGecko, Commodities, and Blockchain Payments")

def stop_scheduler():
    scheduler.shutdown()

