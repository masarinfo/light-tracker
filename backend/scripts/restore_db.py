import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

import json
from datetime import datetime
from database import engine, Base
import models
from sqlalchemy.orm import Session
from sqlalchemy import insert, text

def restore_database(filename):
    if not os.path.exists(filename):
        print(f"❌ Backup file {filename} not found.")
        return

    print(f"Loading data from {filename}...")
    with open(filename, 'r') as f:
        backup_data = json.load(f)

    db = Session(bind=engine)
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Determine table order (parent tables first, then children)
        # Using a simplistic order based on models, but for robustness it's best to 
        # just disable foreign key checks during import if supported (like in SQLite/Postgres)
        
        # SQLite: disable FK checks
        if engine.url.drivername == "sqlite":
            db.execute(text("PRAGMA foreign_keys = OFF;"))
            
        for table_name, rows in backup_data.items():
            if not rows:
                continue
                
            print(f"Restoring {len(rows)} rows into table: {table_name}")
            table = Base.metadata.tables[table_name]
            
            # Clear existing data in table (optional: uncomment to start fresh)
            # db.execute(table.delete())
            
            # Convert ISO datetime strings back to datetime objects
            for row in rows:
                for col_name, val in row.items():
                    if isinstance(val, str):
                        try:
                            # If it looks like an ISO format datetime
                            if "T" in val and len(val) >= 19:
                                row[col_name] = datetime.fromisoformat(val)
                        except ValueError:
                            pass
            
            # Bulk insert
            db.execute(insert(table), rows)
            
        db.commit()
        print("✅ Database restore completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error restoring database: {e}")
    finally:
        # Re-enable FK checks for SQLite
        if engine.url.drivername == "sqlite":
            db.execute(text("PRAGMA foreign_keys = ON;"))
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python restore_db.py <backup_file.json>")
    else:
        restore_database(sys.argv[1])
