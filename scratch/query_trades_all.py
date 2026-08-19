import psycopg2
import sys

db_url = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM users WHERE username = 'allonone' OR email = 'allonone'")
    user = cur.fetchone()
    user_id = user[0]
    
    cur.execute("SELECT id, name FROM exchanges WHERE user_id = %s AND name = 'All'", (user_id,))
    ex = cur.fetchone()
    if not ex:
        print("Exchange 'All' not found.")
        sys.exit(0)
    ex_id = ex[0]
    
    # Query trades
    cur.execute("""
        SELECT id, symbol, quantity, entry_price, calculated_fee, amount_usd, status
        FROM trades 
        WHERE exchange_id = %s AND user_id = %s
    """, (ex_id, user_id))
    trades = cur.fetchall()
    
    print(f"Trades in 'All' exchange for user_id={user_id}:")
    total = 0.0
    for t in trades:
        t_id, symbol, qty, price, fee, amt_usd, status = t
        cost = (float(qty) * float(price)) + float(fee)
        total += cost
        print(f"Trade #{t_id} | {symbol} | Qty: {qty} | Price: {price} | Status: {status} | Calculated Cost: {cost}")
        
    print(f"Total calculated cost: {total}")

except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals():
        conn.close()
