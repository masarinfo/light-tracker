import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

import json
from datetime import datetime
from database import engine, Base
import models
from sqlalchemy.orm import Session

def backup_database():
    db = Session(bind=engine)
    backup_data = {}
    
    try:
        # Get all tables
        for table_name, table in Base.metadata.tables.items():
            print(f"Exporting table: {table_name}")
            backup_data[table_name] = []
            
            # Use raw connection to get all rows
            result = db.execute(table.select())
            rows = result.fetchall()
            
            for row in rows:
                # Convert row tuple to dict
                row_dict = {}
                for idx, column in enumerate(table.columns):
                    val = row[idx]
                    # Convert datetime to string for JSON serialization
                    if isinstance(val, datetime):
                        val = val.isoformat()
                    row_dict[column.name] = val
                backup_data[table_name].append(row_dict)
                
        # Save to file
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"db_backup_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(backup_data, f, indent=2)
            
        print(f"✅ Successfully backed up {len(backup_data)} tables to {filename}")
        
    except Exception as e:
        print(f"❌ Error backing up database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    backup_database()
