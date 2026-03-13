from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).all()

        result = []
        for user in users:
            result.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "created_at": str(user.created_at)
            })

        return result

    except Exception as e:
        return {"error": str(e)}