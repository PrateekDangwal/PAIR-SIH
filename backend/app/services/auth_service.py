from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User
from app.security.auth import hash_password, verify_password


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, email: str, password: str) -> User:
        normalized = email.strip().lower()
        if self.db.scalar(select(User).where(User.email == normalized)):
            raise ValueError("An account with this email already exists")
        user = User(email=normalized, password_hash=hash_password(password))
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate(self, email: str, password: str) -> User:
        user = self.db.scalar(select(User).where(User.email == email.strip().lower()))
        if not user or not user.is_active or not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")
        return user
