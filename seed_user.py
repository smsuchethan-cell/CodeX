import sys
import os

# Add the project root to the python path so we can import backend
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.database import SessionLocal, engine, Base
from backend.models.user import User

# Ensure tables are created
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    user = db.query(User).filter(User.email == "officer@bbmp.gov.in").first()
    if not user:
        new_user = User(
            name="Admin Officer", 
            email="officer@bbmp.gov.in", 
            password_hash="password123", 
            role="officer"
        )
        db.add(new_user)
        db.commit()
        print("User created successfully.")
    else:
        print("User already exists.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
