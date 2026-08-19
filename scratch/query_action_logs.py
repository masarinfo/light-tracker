import psycopg2
import sys

db_url = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Get the latest action logs for user_id = 18 containing "UPDATE_TRADE" or "CREATE_TRADE"
cur.execute("SELECT created_at, action_type, details FROM action_logs WHERE user_id = 18 ORDER BY created_at DESC LIMIT 20")
logs = cur.fetchall()

print("Recent Action Logs:")
for log in logs:
    print(f"{log[0]} | {log[1]} | {log[2]}")
    
# Also check trade 59 explicitly
cur.execute("SELECT quantity, entry_price, amount_usd FROM trades WHERE id = 59")
t = cur.fetchone()
print("\nTrade 59 current state:")
print(f"Qty: {t[0]}, Price: {t[1]}, Amount USD: {t[2]}")

conn.close()
