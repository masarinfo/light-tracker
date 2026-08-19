import psycopg2
import sys

db_url = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Check if user allonone exists
    cur.execute("SELECT id, username, email FROM users WHERE username = 'allonone' OR email = 'allonone'")
    user = cur.fetchone()
    if not user:
        print("User 'allonone' not found in Render Database.")
        sys.exit(0)
        
    print(f"User found: ID={user[0]}, Username={user[1]}, Email={user[2]}")
    user_id = user[0]
    
    # Check wallet balance
    cur.execute("SELECT SUM(amount) FROM wallet_transactions WHERE user_id = %s", (user_id,))
    total_wallet = cur.fetchone()[0] or 0
    print(f"\nWallet Balance (from wallet_transactions): {total_wallet}")
    
    # Check if there is a wallet table
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_name = 'wallets'")
    if cur.fetchone():
        cur.execute("SELECT balance FROM wallets WHERE user_id = %s", (user_id,))
        w = cur.fetchone()
        if w:
            print(f"Wallet Table Balance: {w[0]}")
    
    # Check total invested in crypto
    cur.execute("SELECT SUM(amount_usd + calculated_fee) FROM trades WHERE user_id = %s AND status = 'OPEN' AND symbol NOT IN ('XAU', 'XAG', 'GOLD', 'SILVER')", (user_id,))
    total_invested = cur.fetchone()[0] or 0
    print(f"Total Invested in Open Crypto Trades: {total_invested}")
    
    # Check total invested in metals
    cur.execute("SELECT SUM(amount_usd + calculated_fee) FROM trades WHERE user_id = %s AND status = 'OPEN' AND symbol IN ('XAU', 'XAG', 'GOLD', 'SILVER')", (user_id,))
    total_metals = cur.fetchone()[0] or 0
    print(f"Total Invested in Open Metals Trades: {total_metals}")
    
    print(f"\nTotal Account Capital Estimate: {float(total_wallet) + float(total_invested) + float(total_metals)}")

except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals():
        conn.close()
