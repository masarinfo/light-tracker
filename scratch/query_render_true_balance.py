import psycopg2
import sys

db_url = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM users WHERE username = 'allonone' OR email = 'allonone'")
    user = cur.fetchone()
    if not user:
        print("User not found.")
        sys.exit(0)
    user_id = user[0]
    
    cur.execute("SELECT id, name, initial_cash_balance FROM exchanges WHERE user_id = %s", (user_id,))
    exchanges = cur.fetchall()
    
    total_cash_all_exchanges = 0.0
    
    print("Accurate Balance Calculation per Exchange:")
    for ex in exchanges:
        ex_id, ex_name, initial = ex
        initial = float(initial) if initial else 0.0
        
        # 1. Total purchases and sales
        cur.execute("""
            SELECT id, quantity, entry_price, calculated_fee 
            FROM trades 
            WHERE exchange_id = %s AND user_id = %s
        """, (ex_id, user_id))
        trades = cur.fetchall()
        
        total_purchases = 0.0
        total_sales = 0.0
        
        for t in trades:
            t_id, qty, price, fee = t
            total_purchases += (float(qty) * float(price)) + float(fee)
            
            # sales
            cur.execute("""
                SELECT quantity_to_sell, target_price, executed_fee 
                FROM trade_targets 
                WHERE trade_id = %s AND status = 'EXECUTED'
            """, (t_id,))
            targets = cur.fetchall()
            for tgt in targets:
                sqty, sprice, sfee = tgt
                sfee = float(sfee) if sfee else 0.0
                total_sales += (float(sqty) * float(sprice)) - sfee
                
        # 2. Wallet Tx
        cur.execute("""
            SELECT type, amount, fee 
            FROM wallet_transactions 
            WHERE exchange_id = %s AND user_id = %s
        """, (ex_id, user_id))
        wtxs = cur.fetchall()
        
        deposits = sum(float(tx[1]) for tx in wtxs if tx[0] == "DEPOSIT")
        withdrawals = sum(float(tx[1]) for tx in wtxs if tx[0] == "WITHDRAW")
        transfers_out = sum(float(tx[1]) + float(tx[2] or 0) for tx in wtxs if tx[0] == "TRANSFER")
        
        # Transfers in
        cur.execute("""
            SELECT amount FROM wallet_transactions 
            WHERE to_exchange_id = %s AND type = 'TRANSFER'
        """, (ex_id,))
        tins = cur.fetchall()
        transfers_in = sum(float(tx[0]) for tx in tins)
        
        live_balance = initial + deposits - withdrawals + transfers_in - transfers_out - total_purchases + total_sales
        total_cash_all_exchanges += live_balance
        
        print(f"\nExchange: {ex_name}")
        print(f"  Initial: {initial}")
        print(f"  Deposits: {deposits}, Withdrawals: {withdrawals}")
        print(f"  Transfers In: {transfers_in}, Transfers Out: {transfers_out}")
        print(f"  Total Purchases (Cost + Fee): {total_purchases}")
        print(f"  Total Sales (Revenue - Fee): {total_sales}")
        print(f"  => Live Cash Balance: {live_balance}")
        
    print(f"\n============================")
    print(f"Total Available Cash (All Exchanges): {total_cash_all_exchanges}")
    print(f"============================")

except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals():
        conn.close()
