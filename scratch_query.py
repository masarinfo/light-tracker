import psycopg2
import os
import sys

db_url = "postgresql://neondb_owner:npg_vZH4jbro3hAB@ep-square-wildflower-auoynl7e-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Check if user allonone exists
    cur.execute("SELECT id, username, email FROM users WHERE username = 'allonone' OR email = 'allonone'")
    user = cur.fetchone()
    if not user:
        print("User not found.")
        sys.exit(0)
        
    print(f"User found: ID={user[0]}, Username={user[1]}, Email={user[2]}")
    user_id = user[0]
    
    # Capital could be in 'wallet_transactions' or 'wallet' or 'coin_portfolios'
    # Let's check all wallet transactions for the user.
    cur.execute("SELECT SUM(amount) FROM wallet_transactions WHERE user_id = %s", (user_id,))
    total_wallet = cur.fetchone()[0] or 0
    print(f"Total Wallet Balance (Deposits - Withdrawals): {total_wallet}")
    
    # Or in coin portfolios (total invested)
    cur.execute("SELECT SUM(amount_usd + calculated_fee) FROM trades WHERE user_id = %s AND status = 'OPEN'", (user_id,))
    total_invested = cur.fetchone()[0] or 0
    print(f"Total Open Investments: {total_invested}")
    
    # Metals (if separate)
    cur.execute("SELECT SUM(amount_usd + calculated_fee) FROM trades WHERE user_id = %s AND symbol IN ('XAU', 'XAG') AND status = 'OPEN'", (user_id,))
    total_metals = cur.fetchone()[0] or 0
    print(f"Total Metals Open Investments: {total_metals}")

except Exception as e:
    print("Error:", e)

