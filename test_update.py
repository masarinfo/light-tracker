import requests
import json

# get token
res = requests.post("https://light-tracker-backend-pp0d.onrender.com/auth/login", data={"username": "admin", "password": "admin123"})
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

payload = {
    "symbol": "SOLUSDT",
    "strategy_id": 3,
    "exchange_id": 4,
    "order_type": "Limit",
    "entry_price": 50.0,
    "amount_usd": 10000.0,
    "quantity": 200.0,
    "calculated_fee": 10.0,
    "status": "OPEN",
    "market_type": "crypto",
    "targets": [
        {
            "stage": 99,
            "type": "MANUAL",
            "targetPrice": 60.0,
            "quantityToSell": 50.0,
            "status": "EXECUTED",
            "executedFee": 1.0
        }
    ]
}

res2 = requests.put("https://light-tracker-backend-pp0d.onrender.com/trades/7", headers=headers, json=payload)
print(res2.status_code)
print(res2.text)
