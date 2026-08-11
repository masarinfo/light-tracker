from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

# --- Common / Generic ---

class TargetBase(BaseModel):
    stage: int
    gain_pct: Optional[float] = None
    loss_pct: Optional[float] = None
    sell_portion_pct: float

class CouponCreate(BaseModel):
    code: str
    discount_value: float
    discount_type: str = "PERCENTAGE"

# --- Exchange Schemas ---

class ExchangeBase(BaseModel):
    name: str
    maker_fee_pct: float = 0.1
    taker_fee_pct: float = 0.1
    use_discount_token: bool = False
    discount_token_symbol: Optional[str] = None
    discount_pct: float = 0.0
    initial_cash_balance: float = 0.0

class ExchangeCreate(ExchangeBase):
    pass

class ExchangeUpdate(ExchangeBase):
    pass

class ExchangeResponse(ExchangeBase):
    id: int
    
    # Aggregated fields
    total_deposits: float = 0.0
    total_withdrawals: float = 0.0
    total_transfers_in: float = 0.0
    total_transfers_out: float = 0.0

    class Config:
        from_attributes = True


# --- Strategy Schemas ---

class StrategyBase(BaseModel):
    name: str
    category: str = "Short-Term"
    default_exchange_id: Optional[int] = None
    default_order_type: str = "Limit"
    tp_rules: List[TargetBase]
    sl_rules: List[TargetBase]

class StrategyCreate(StrategyBase):
    pass

class StrategyUpdate(StrategyBase):
    pass

class StrategyResponse(StrategyBase):
    id: int
    exchange: Optional[ExchangeResponse] = None

    class Config:
        from_attributes = True


# --- Trade Schemas ---

class TradeTargetResponse(BaseModel):
    id: int
    type: str
    stage: int
    target_price: float
    quantity_to_sell: float
    status: str

    class Config:
        from_attributes = True

class TradeBase(BaseModel):
    symbol: str
    strategy_id: int
    exchange_id: int
    order_type: str
    entry_price: float
    amount_usd: float
    quantity: float
    calculated_fee: float
    status: str = "OPEN"

class TradeCreate(TradeBase):
    targets: List[dict] # Accepting raw target dicts to save

class TradeUpdate(TradeBase):
    targets: Optional[List[dict]] = None

class TradeResponse(TradeBase):
    id: int
    created_at: datetime
    targets: List[TradeTargetResponse] = []

    class Config:
        from_attributes = True


class ActionLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action_type: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    user: Optional['UserResponse'] = None

    class Config:
        from_attributes = True

# --- Wallet Schemas ---

class WalletTransactionBase(BaseModel):
    exchange_id: int
    type: str # DEPOSIT, WITHDRAW, TRANSFER
    amount: float
    fee: float = 0.0
    to_exchange_id: Optional[int] = None
    notes: Optional[str] = None

class WalletTransactionCreate(WalletTransactionBase):
    pass

class WalletTransactionResponse(WalletTransactionBase):
    id: int
    user_id: int
    timestamp: datetime
    
    # Nested info for easy UI rendering
    exchange_name: Optional[str] = None
    to_exchange_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    phone: Optional[str] = None
    referral_code: Optional[str] = None # Used to track if they came from an affiliate

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    phone: Optional[str]
    primary_role: str
    is_also_affiliate: bool
    status: str
    is_superadmin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- WAITLIST SCHEMAS ---
class WaitlistCreate(BaseModel):
    email: str

class WaitlistResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
