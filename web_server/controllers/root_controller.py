"""
根控制器
"""
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def root():
    """根路径，重定向到 /report"""
    return HTMLResponse(
        content='<html><head><meta http-equiv="refresh" content="0; url=/report"></head><body>Redirecting to <a href="/report">/report</a></body></html>'
    )

