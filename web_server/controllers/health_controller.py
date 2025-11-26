"""
健康检查控制器
"""
from fastapi import APIRouter
from typing import Dict

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> Dict[str, str]:
    """健康检查端点"""
    return {
        "status": "ok",
        "service": "trendradar-web-server",
        "version": "1.0.0"
    }

