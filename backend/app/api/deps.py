from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import SessionLocal 
from app.models.user import User
from app.services.google_auth import verify_google_token

# 1. Security Scheme Definition
security = HTTPBearer()

# 2. Database Session Dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Generates a new asynchronous database session for each request.
    Ensures the session is closed and rolled back in case of errors.
    """
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# 3. Current User Injection Dependency
async def get_current_user(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Authenticates the user via Google ID Token and retrieves or 
    auto-registers the user in the local ASK ME AI database.
    """
    token = auth.credentials
    
    # A. Validate Google Token via External Service
    user_info = await verify_google_token(token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Invalid or expired Google authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Use the Google unique 'sub' claim as the primary user ID
    user_id = str(user_info.get("sub"))
    
    # B. Locate user in the local database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    # C. Auto-Registration Logic
    if not user:
        try:
            user = User(
                id=user_id,
                email=user_info.get("email"),
                name=user_info.get("name"),
               
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            # Log error internally for debugging
            print(f"[AUTH ERROR] Failed to auto-register user: {e}") 
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User synchronization failed during database write."
            )
            
    return user

# 4. Raw Google Identity Dependency 
async def get_google_user(
    auth: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Returns the raw Google token payload without database interaction.
    """
    token = auth.credentials
    user_info = await verify_google_token(token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Authentication failed"
        )
    return user_info