from fastapi import APIRouter, Depends, Query, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api import deps
from app.models.log import UserLog
from app.schemas.log import UserLogResponse
from app.utils import log_activity

router = APIRouter()

"""
ASK ME AI - Audit Logging Router
-------------------------------
Handles retrieval of system activity and audit logs for the authenticated user.
All actions are tracked via the centralized log_activity utility.
"""

@router.get("/", response_model=List[UserLogResponse])
async def get_activity_history(
    request: Request,
    background_tasks: BackgroundTasks,
    limit: int = Query(50, ge=1, le=100),
    user=Depends(deps.get_current_user), 
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Retrieves the most recent activity logs for the current user.
    Results are ordered by timestamp in descending order.
    """
    
    # Optional: Log the fact that the user is viewing their audit history
    background_tasks.add_task(
        log_activity,
        user_id=user.id,
        action="VIEW_LOGS",
        category="AUDIT",
        status_code=200,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        path=str(request.url.path),
        meta={"limit_requested": limit}
    )

    # Database query for user-specific logs
    query = (
        select(UserLog)
        .where(UserLog.user_id == user.id)
        .order_by(UserLog.created_at.desc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return logs