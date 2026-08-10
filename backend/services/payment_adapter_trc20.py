import requests
import time
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TRC20Adapter:
    def __init__(self, api_base_url="https://api.trongrid.io", api_key=None):
        self.api_base_url = api_base_url
        self.api_key = api_key
        
    def _get_headers(self):
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["TRON-PRO-API-KEY"] = self.api_key
        return headers

    def generate_address(self, invoice_id: int):
        """
        In a real production environment, this would derive a new HD wallet address
        using a master seed. For this MVP, we will simulate this or use a static 
        address with a memo if we were on TON. On TRON, we must generate a new address.
        For MVP Phase 1, we will return a mock address or require the user to configure
        a pool of pre-generated addresses in the DB.
        """
        # MVP: Generate a deterministic mock address for testing
        # In real life, use `tronpy` to generate an offline address
        return {
            "address": f"T_mock_address_for_invoice_{invoice_id}_{int(time.time())}",
            "derivation_path": f"m/44'/195'/0'/0/{invoice_id}"
        }

    def get_address_transactions(self, address: str, contract_address: str = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"):
        """
        Fetch TRC20 token transfers for a specific address.
        Default contract_address is USDT on TRON (Mainnet).
        """
        url = f"{self.api_base_url}/v1/accounts/{address}/transactions/trc20"
        params = {
            "limit": 50,
            "contract_address": contract_address
        }
        
        try:
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            transactions = []
            if data.get("success") and "data" in data:
                for tx in data["data"]:
                    # TRC20 transfers amount is string, need to scale by decimals (USDT is 6 decimals)
                    decimals = int(tx.get("token_info", {}).get("decimals", 6))
                    raw_amount = float(tx.get("value", 0))
                    amount = raw_amount / (10 ** decimals)
                    
                    transactions.append({
                        "tx_hash": tx.get("transaction_id"),
                        "from_address": tx.get("from"),
                        "to_address": tx.get("to"),
                        "amount": amount,
                        "detected_at": datetime.fromtimestamp(tx.get("block_timestamp", 0) / 1000.0)
                    })
            return transactions
            
        except requests.RequestException as e:
            logger.error(f"TRC20Adapter: Error fetching transactions for {address}: {e}")
            return []
