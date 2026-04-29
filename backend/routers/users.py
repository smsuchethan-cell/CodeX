from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "citizen"

class UserLogin(BaseModel):
    email: str
    password: str


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

@router.post("/register")
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=user_data.password,
            role=user_data.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User registered successfully", "user_id": new_user.id}
    except Exception as e:
        return {"error": str(e)}

@router.post("/login")
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or user.password_hash != user_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful", 
        "user": {
            "id": user.id, 
            "email": user.email, 
            "role": user.role
        }
    }