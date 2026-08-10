import sys
import os
sys.path.append(os.getcwd())

from database import SessionLocal
from models import WalletTransaction
from schemas import WalletTransactionResponse

db = SessionLocal()
txs = db.query(WalletTransaction).all()

for tx in txs:
    print(f"Validating tx id {tx.id}")
    try:
        # We need to mimic the router behavior that attaches names
        tx.exchange_name = tx.exchange.name if tx.exchange else None
        tx.to_exchange_name = tx.to_exchange.name if getattr(tx, "to_exchange", None) else None
        
        resp = WalletTransactionResponse.model_validate(tx)
        print("Success:", resp.id)
    except Exception as e:
        print("Failed:", e)
