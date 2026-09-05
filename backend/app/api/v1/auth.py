from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.schemas.auth import (
    LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserResponse
)
from app.security.auth import create_access_token, create_refresh_token, decode_token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer = HTTPBearer(auto_error=False)


def _tokens(user) -> TokenResponse:
    settings = get_settings()
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
        expires_in=settings.JWT_ACCESS_MINUTES * 60,
        user=user,
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = AuthService(db).register(payload.email, payload.password)
        return _tokens(user)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = AuthService(db).authenticate(payload.email, payload.password)
        return _tokens(user)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        token_payload = decode_token(payload.refresh_token, "refresh")
        user_id = int(token_payload["sub"])
        user = db.get(__import__("app.models.user", fromlist=["User"]).User, user_id)
        if not user or not user.is_active:
            raise ValueError("User is inactive or not found")
        return _tokens(user)
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = decode_token(credentials.credentials, "access")
        from app.models.user import User
        user = db.get(User, int(payload["sub"]))
        if not user or not user.is_active:
            raise ValueError
        return user
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired access token")


def optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials, "access")
        from app.models.user import User
        return db.get(User, int(payload["sub"]))
    except (ValueError, TypeError):
        return None


@router.get("/me", response_model=UserResponse)
def me(user=Depends(get_current_user)):
    return user
