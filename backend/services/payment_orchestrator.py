import logging
from sqlalchemy.orm import Session
import time

from models import Invoice, WalletAddress, BlockchainTransaction, Network
from services.payment_adapter_trc20 import TRC20Adapter

logger = logging.getLogger(__name__)

class PaymentOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        # In a real app, instantiate adapters based on network config
        self.adapters = {
            "TRC20": TRC20Adapter()
        }

    def poll_for_payments(self):
        """
        Polls the blockchain for transactions on all active invoices.
        Should be run periodically by the scheduler (e.g., every 30 seconds).
        """
        # Find invoices that are waiting for payment
        active_invoices = self.db.query(Invoice).filter(
            Invoice.status.in_(['PENDING', 'AWAITING_PAYMENT', 'DETECTED'])
        ).all()
        
        if not active_invoices:
            return

        for invoice in active_invoices:
            try:
                self._check_invoice(invoice)
            except Exception as e:
                logger.error(f"Error checking invoice {invoice.id}: {e}")

    def _check_invoice(self, invoice: Invoice):
        wallet = self.db.query(WalletAddress).filter(WalletAddress.invoice_id == invoice.id).first()
        if not wallet:
            logger.warning(f"No wallet address assigned for invoice {invoice.id}")
            return
            
        network = self.db.query(Network).filter(Network.id == wallet.network_id).first()
        if not network or network.code not in self.adapters:
            logger.warning(f"Unsupported network for invoice {invoice.id}")
            return
            
        adapter = self.adapters[network.code]
        
        # Get transactions for this address
        txs = adapter.get_address_transactions(wallet.address)
        
        for tx_data in txs:
            # Check if we already recorded this transaction
            existing_tx = self.db.query(BlockchainTransaction).filter(
                BlockchainTransaction.tx_hash == tx_data['tx_hash']
            ).first()
            
            if not existing_tx:
                # Save new transaction
                new_tx = BlockchainTransaction(
                    invoice_id=invoice.id,
                    network_id=network.id,
                    tx_hash=tx_data['tx_hash'],
                    from_address=tx_data['from_address'],
                    to_address=tx_data['to_address'],
                    amount_received=tx_data['amount'],
                    detected_at=tx_data['detected_at']
                )
                self.db.add(new_tx)
                
                # Update Invoice logic
                if invoice.status in ['PENDING', 'AWAITING_PAYMENT']:
                    invoice.status = 'DETECTED'
                    
                # Re-calculate total received for this invoice
                self.db.commit() # commit first to get the tx in DB
                self._evaluate_invoice_status(invoice)

    def _evaluate_invoice_status(self, invoice: Invoice):
        """
        Evaluate if the total amount received covers the expected crypto amount.
        """
        all_txs = self.db.query(BlockchainTransaction).filter(
            BlockchainTransaction.invoice_id == invoice.id
        ).all()
        
        total_received = sum(tx.amount_received for tx in all_txs)
        
        if total_received >= invoice.expected_crypto_amount:
            invoice.status = 'PAID'
            logger.info(f"Invoice {invoice.id} fully PAID!")
            # TODO: Here we trigger the Subscription activation logic!
        elif total_received > 0:
            invoice.status = 'UNDERPAID'
            logger.info(f"Invoice {invoice.id} UNDERPAID (Received {total_received} of {invoice.expected_crypto_amount})")
            
        self.db.commit()
