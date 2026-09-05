from fastapi import Depends
from app.config import get_settings
from app.api.v1.auth import get_current_user


def auth_if_required(user=Depends(get_current_user)):
    """Use on protected routes; disabled globally by default for UI compatibility."""
    if not get_settings().REQUIRE_AUTH:
        return None
    return user
