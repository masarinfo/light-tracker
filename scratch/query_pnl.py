import psycopg2
import yfinance as yf
import sys

# 1. Fetch live prices
print("Fetching live prices...")
try:
    gold = yf.Ticker("GC=F").history(period="1d")['Close'].iloc[-1]
    silver = yf.Ticker("SI=F").history(period="1d")['Close'].iloc[-1]
except Exception as e:
    print(f"Failed to fetch live prices: {e}")
    sys.exit(1)

# convert oz to grams (since trades are in grams according to UI "Total Qty (Weight in g)")
gold_gram = gold / 31.1034768
silver_gram = silver / 31.1034768

print(f"Live Gold (per oz): ${gold:.2f}, per gram: ${gold_gram:.2f}")
print(f"Live Silver (per oz): ${silver:.2f}, per gram: ${silver_gram:.2f}")

# 2. Fetch trades from remote db
db_url = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Check trade 59 to see if user fixed it
    cur.execute("SELECT entry_price, amount_usd, quantity FROM trades WHERE id = 59")
    t59 = cur.fetchone()
    print(f"\nTrade #59 (Silver) Current State in DB -> Qty: {t59[2]}, Price: {t59[0]}, Amount: {t59[1]}")
    
    cur.execute("""
        SELECT id, symbol, quantity, entry_price, amount_usd, calculated_fee, status 
        FROM trades 
        WHERE user_id = 18 AND status != 'CLOSED'
    """)
    trades = cur.fetchall()
    
    unrealized_pnl = 0.0
    realized_pnl = 0.0
    total_invested = 0.0
    
    print("\nOpen Trades PnL Breakdown:")
    for t in trades:
        t_id, symbol, qty, price, amt_usd, fee, status = t
        qty = float(qty)
        price = float(price)
        amt_usd = float(amt_usd)
        fee = float(fee)
        
        # calculate realized from targets
        cur.execute("""
            SELECT quantity_to_sell, target_price 
            FROM trade_targets 
            WHERE trade_id = %s AND status = 'EXECUTED'
        """, (t_id,))
        targets = cur.fetchall()
        
        realized_for_trade = 0.0
        qty_sold = 0.0
        for tgt in targets:
            sqty, sprice = float(tgt[0]), float(tgt[1])
            qty_sold += sqty
            realized_for_trade += (sprice - price) * sqty
            
        realized_pnl += realized_for_trade
        
        remaining_qty = qty - qty_sold
        if remaining_qty > 0:
            live_price = gold_gram if symbol == 'XAU' else silver_gram if symbol == 'XAG' else 0
            
            proportion = remaining_qty / qty
            remaining_invested = (amt_usd + fee) * proportion
            current_value = remaining_qty * live_price
            
            trade_unrealized = current_value - remaining_invested
            unrealized_pnl += trade_unrealized
            total_invested += remaining_invested
            
            print(f"Trade #{t_id} ({symbol}): Remaining Qty: {remaining_qty:.2f}g | Invested: ${remaining_invested:.2f} | Current Value: ${current_value:.2f} | Unrealized: ${trade_unrealized:.2f}")

    print(f"\nTotal Invested: ${total_invested:.2f}")
    print(f"Total Unrealized PnL: ${unrealized_pnl:.2f}")
    print(f"Total Realized PnL: ${realized_pnl:.2f}")
    
except Exception as e:
    print("Database Error:", e)
finally:
    if 'conn' in locals():
        conn.close()

