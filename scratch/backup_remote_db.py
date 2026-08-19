import psycopg2
import json
import decimal
import datetime
import os

db_url = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        if isinstance(obj, (datetime.datetime, datetime.date, datetime.time)):
            return obj.isoformat()
        return super().default(obj)

try:
    print("Connecting to remote database...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Get all tables in public schema
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    """)
    tables = [row[0] for row in cur.fetchall()]
    
    backup_data = {}
    
    print(f"Found {len(tables)} tables. Starting backup...")
    
    for table in tables:
        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        
        # Get column names
        col_names = [desc[0] for desc in cur.description]
        
        table_data = []
        for row in rows:
            table_data.append(dict(zip(col_names, row)))
            
        backup_data[table] = table_data
        print(f"Backed up table '{table}' with {len(rows)} rows.")
        
    os.makedirs('backups', exist_ok=True)
    backup_file = 'backups/remote_db_backup.json'
    
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, cls=CustomEncoder, indent=2, ensure_ascii=False)
        
    print(f"\nSuccess! Database backed up to {backup_file}")

except Exception as e:
    print("Error during backup:", e)
finally:
    if 'conn' in locals():
        conn.close()

