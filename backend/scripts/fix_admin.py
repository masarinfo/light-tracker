import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import models

DATABASE_URL = "postgresql://lighttracker_user:krqml4cpbHXBmArsxGc9djQFhC63BEsF@dpg-d9ti7u2jobas73d2l440-a.oregon-postgres.render.com/lighttracker"
engine = create_engine(DATABASE_URL)

try:
    with Session(engine) as db:
        user = db.query(models.User).filter(models.User.username == "ahmed").first()
        if user:
            user.is_superadmin = True
            db.commit()
            print(f"✅ User '{user.username}' successfully promoted to is_superadmin=True!")
        else:
            print("❌ User 'ahmed' not found in the database.")
except Exception as e:
    print(f"Error: {e}")
