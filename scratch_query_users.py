import psycopg2
import os

db_url = "postgresql://neondb_owner:npg_vZH4jbro3hAB@ep-square-wildflower-auoynl7e-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users")
    users = cur.fetchall()
    print("Users in remote DB:")
    for u in users:
        print(f"- ID: {u[0]}, Username: {u[1]}, Email: {u[2]}")
except Exception as e:
    print("Error:", e)

