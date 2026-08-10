from sqlalchemy.orm import Session
from models import ActionLog

def log_action(db: Session, user_id: int, action_type: str, details: str = None, ip_address: str = None):
    try:
        new_log = ActionLog(
            user_id=user_id,
            action_type=action_type,
            details=details,
            ip_address=ip_address
        )
        db.add(new_log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error logging action: {e}")
