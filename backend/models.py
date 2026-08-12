from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    
    primary_role = Column(String(15), default='CUSTOMER') # CUSTOMER, AFFILIATE, STAFF, SUPER_ADMIN
    is_also_affiliate = Column(Boolean, default=False)
    status = Column(String(15), default='ACTIVE') # ACTIVE, SUSPENDED, BANNED
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255), nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Legacy fields
    is_superadmin = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships (Existing tracking logic)
    exchanges = relationship("Exchange", back_populates="user", cascade="all, delete-orphan")
    strategies = relationship("Strategy", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("CoinPortfolio", back_populates="user", cascade="all, delete-orphan")
    trades = relationship("Trade", back_populates="user", cascade="all, delete-orphan")

    # New Relationships
    affiliate_profile = relationship("AffiliateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    staff_permissions = relationship("StaffPermission", back_populates="user", foreign_keys="[StaffPermission.user_id]", cascade="all, delete-orphan")


class AffiliateProfile(Base):
    __tablename__ = "affiliate_profiles"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    referral_code = Column(String(20), unique=True, nullable=False)
    default_payout_network_id = Column(Integer, nullable=True)
    default_payout_address = Column(String(255), nullable=True)
    status = Column(String(15), default='ACTIVE') # ACTIVE, SUSPENDED
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="affiliate_profile")


class StaffPermission(Base):
    __tablename__ = "staff_permissions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permission_code = Column(String(50), nullable=False)
    granted_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="staff_permissions")


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_log"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_type = Column(String(50), nullable=False)
    target_entity_type = Column(String(30), nullable=True)
    target_entity_id = Column(Integer, nullable=True)
    metadata_json = Column(JSON, nullable=True) # Named metadata_json because metadata is a reserved keyword in SQLAlchemy Base
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# --- PAYMENT MODULE TABLES ---

class Network(Base):
    __tablename__ = "networks"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(20), unique=True, nullable=False) # e.g. TRC20
    display_name = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    required_confirmations = Column(Integer, nullable=False)
    explorer_api_base_url = Column(String(255), nullable=False)
    explorer_api_key = Column(String(255), nullable=True)
    avg_block_time_seconds = Column(Integer, nullable=False)
    polling_interval_seconds = Column(Integer, nullable=False, default=30)
    
class NetworkAsset(Base):
    __tablename__ = "network_assets"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    network_id = Column(Integer, ForeignKey("networks.id"), nullable=False)
    asset_symbol = Column(String(10), nullable=False) # e.g. USDT
    contract_address = Column(String(255), nullable=True)
    decimals = Column(Integer, nullable=False, default=6)
    is_active = Column(Boolean, default=True)

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reference_type = Column(String(30), nullable=False) # e.g. SUBSCRIPTION
    reference_id = Column(Integer, nullable=False)
    amount_usd = Column(Float, nullable=False)
    selected_network_id = Column(Integer, ForeignKey("networks.id"), nullable=True)
    selected_asset_symbol = Column(String(10), nullable=True)
    locked_exchange_rate = Column(Float, nullable=True)
    expected_crypto_amount = Column(Float, nullable=True)
    rate_locked_at = Column(DateTime(timezone=True), nullable=True)
    rate_expires_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default='PENDING') # PENDING, AWAITING_PAYMENT, DETECTED, CONFIRMING, PAID, UNDERPAID, EXPIRED, FAILED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WalletAddress(Base):
    __tablename__ = "wallet_addresses"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    network_id = Column(Integer, ForeignKey("networks.id"), nullable=False)
    address = Column(String(255), nullable=False)
    derivation_path = Column(String(100), nullable=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    network_id = Column(Integer, ForeignKey("networks.id"), nullable=False)
    tx_hash = Column(String(255), nullable=False)
    from_address = Column(String(255), nullable=True)
    to_address = Column(String(255), nullable=False)
    amount_received = Column(Float, nullable=False)
    confirmations_count = Column(Integer, default=0)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

# --- SUBSCRIPTION MODULE TABLES ---

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plan_code = Column(String(50), unique=True, nullable=False) # e.g. PRO_MONTHLY, FREE_TRIAL
    name = Column(String(100), nullable=False)
    price_usd = Column(Float, nullable=False)
    billing_cycle_days = Column(Integer, nullable=False, default=30)
    grace_period_days = Column(Integer, nullable=False, default=3)
    is_active = Column(Boolean, default=True)

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    status = Column(String(20), default='PENDING_INITIAL_PAYMENT') # ACTIVE, PAST_DUE, CANCELLED, PENDING_INITIAL_PAYMENT
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    referred_by_affiliate_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SubscriptionBillingCycle(Base):
    __tablename__ = "subscription_billing_cycles"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    cycle_number = Column(Integer, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    price_usd_charged = Column(Float, nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- AFFILIATES AND COUPONS MODULE TABLES ---

class CouponCode(Base):
    __tablename__ = "coupon_codes"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(30), unique=True, nullable=False)
    discount_type = Column(String(15), default='PERCENTAGE') # PERCENTAGE, FIXED_AMOUNT
    discount_value = Column(Float, nullable=False)
    applies_to_cycles = Column(String(15), default='FIRST_ONLY') # FIRST_ONLY, ALL_CYCLES
    max_redemptions_total = Column(Integer, nullable=True)
    created_by_affiliate_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

class AffiliateCommission(Base):
    __tablename__ = "affiliate_commissions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    affiliate_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    commission_type = Column(String(10), default='INITIAL') # INITIAL, RECURRING
    commission_pct = Column(Float, nullable=False)
    commission_amount_usd = Column(Float, nullable=False)
    status = Column(String(20), default='PENDING_CLEARANCE') # PENDING_CLEARANCE, CLEARED, PAID_OUT, REVERSED
    clearance_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ------------------------------

class Exchange(Base):
    __tablename__ = "exchanges"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)
    market_type = Column(String(10), default="crypto") # "crypto" or "metals"
    maker_fee_pct = Column(Float, nullable=False, default=0.1)
    taker_fee_pct = Column(Float, nullable=False, default=0.1)
    use_discount_token = Column(Boolean, default=False)
    discount_token_symbol = Column(String(10), nullable=True)
    discount_pct = Column(Float, default=0.0)
    initial_cash_balance = Column(Float, nullable=False, default=0.0)
    
    user = relationship("User", back_populates="exchanges")
    strategies = relationship("Strategy", back_populates="exchange")
    portfolios = relationship("CoinPortfolio", back_populates="exchange")
    trades = relationship("Trade", back_populates="exchange")
    wallet_transactions = relationship("WalletTransaction", foreign_keys="[WalletTransaction.exchange_id]", back_populates="exchange")

    # These properties provide safe fallback defaults, 
    # but the router computes the exact values before sending to UI.
    @property
    def total_deposits(self):
        return sum(t.amount for t in self.wallet_transactions if t.type == "DEPOSIT")

    @property
    def total_withdrawals(self):
        return sum(t.amount for t in self.wallet_transactions if t.type == "WITHDRAW")
        
    @property
    def total_transfers_in(self):
        return 0.0

    @property
    def total_transfers_out(self):
        return 0.0


class Strategy(Base):
    __tablename__ = "strategies"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)
    market_type = Column(String(10), default="crypto") # "crypto" or "metals"
    category = Column(String(20), default="Short-Term") # Short-Term or Long-Term
    default_exchange_id = Column(Integer, ForeignKey("exchanges.id"), nullable=True)
    default_order_type = Column(String(20), default="Limit")
    tp_rules = Column(JSON, nullable=False) # JSON array of TP rules
    sl_rules = Column(JSON, nullable=False) # JSON array of SL rules
    
    user = relationship("User", back_populates="strategies")
    exchange = relationship("Exchange", back_populates="strategies")
    portfolios = relationship("CoinPortfolio", back_populates="strategy")
    trades = relationship("Trade", back_populates="strategy")


class CoinPortfolio(Base):
    __tablename__ = "coin_portfolios"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), index=True, nullable=False)
    exchange_id = Column(Integer, ForeignKey("exchanges.id"), nullable=False)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    total_quantity = Column(Float, default=0.0)
    average_cost = Column(Float, default=0.0)
    total_invested = Column(Float, default=0.0)
    realized_pnl = Column(Float, default=0.0)
    total_fees_paid = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="portfolios")
    exchange = relationship("Exchange", back_populates="portfolios")
    strategy = relationship("Strategy", back_populates="portfolios")


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exchange_id = Column(Integer, ForeignKey("exchanges.id"), nullable=False)
    
    # DEPOSIT, WITHDRAW, TRANSFER
    type = Column(String(20), nullable=False)
    
    amount = Column(Float, nullable=False)
    fee = Column(Float, default=0.0)
    
    # For transfers, this tracks the destination exchange
    to_exchange_id = Column(Integer, ForeignKey("exchanges.id"), nullable=True)
    
    notes = Column(String(500), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    exchange = relationship("Exchange", foreign_keys=[exchange_id], back_populates="wallet_transactions")
    to_exchange = relationship("Exchange", foreign_keys=[to_exchange_id])


class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    market_type = Column(String(10), default="crypto") # "crypto" or "metals"
    symbol = Column(String(20), index=True, nullable=False)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    exchange_id = Column(Integer, ForeignKey("exchanges.id"), nullable=False)
    order_type = Column(String(20), nullable=False)
    entry_price = Column(Float, nullable=False)
    amount_usd = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    metal_karat = Column(Integer, nullable=True) # E.g., 24, 21, 999
    purchase_currency = Column(String(5), nullable=True) # E.g., "SAR", "USD"
    calculated_fee = Column(Float, nullable=False)
    status = Column(String(20), default="OPEN") # OPEN, PARTIALLY_CLOSED, CLOSED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="trades")
    exchange = relationship("Exchange", back_populates="trades")
    strategy = relationship("Strategy", back_populates="trades")
    targets = relationship("TradeTarget", back_populates="trade", cascade="all, delete-orphan")


class TradeTarget(Base):
    __tablename__ = "trade_targets"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trade_id = Column(Integer, ForeignKey("trades.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(5), nullable=False) # TP or SL
    stage = Column(Integer, nullable=False)
    target_price = Column(Float, nullable=False)
    quantity_to_sell = Column(Float, nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, EXECUTED, CANCELLED
    
    trade = relationship("Trade", back_populates="targets")


class ActionLog(Base):
    __tablename__ = "action_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for system events or unknown logins
    action_type = Column(String(50), nullable=False, index=True) # e.g. LOGIN, CREATE_TRADE
    details = Column(String(500), nullable=True) # Additional details like "Symbol: BTCUSDT, Amount: 1000"
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
