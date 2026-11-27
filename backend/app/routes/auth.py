from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.auth import create_access_token, hash_password, verify_password
from app.database.database import create_user, get_user_by_email

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest):
    email = str(request.email).strip().lower()
    if get_user_by_email(email):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = create_user(request.name.strip(), email, hash_password(request.password))
    token = create_access_token(user["id"])
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login")
def login(request: LoginRequest):
    email = str(request.email).strip().lower()
    user = get_user_by_email(email)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
    }
