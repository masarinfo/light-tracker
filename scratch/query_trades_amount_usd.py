import psycopg2

db_url = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"
conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT id, symbol, quantity, entry_price, amount_usd FROM trades WHERE user_id = 18")
trades = cur.fetchall()
for t in trades:
    print(t)
conn.close()
