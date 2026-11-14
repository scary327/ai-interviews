import json
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import PyJWKClientConnectionError, PyJWKSetError, PyJWTError

from app.config import settings

_jwks_client = jwt.PyJWKClient(settings.jwks_url, timeout=5)
_bearer = HTTPBearer()


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
) -> UUID:
    token = credentials.credentials
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"require": ["exp", "sub"]},
        )
    except (PyJWKClientConnectionError, PyJWKSetError, json.JSONDecodeError) as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable",
        ) from e
    except PyJWTError as e:
        raise _unauthorized() from e
    try:
        return UUID(claims["sub"])
    except ValueError as e:
        raise _unauthorized() from e


CurrentUserId = Annotated[UUID, Depends(current_user_id)]
