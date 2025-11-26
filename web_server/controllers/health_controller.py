"""
健康检查控制器
"""
from pathlib import Path
from fastapi import APIRouter
from typing import Dict

router = APIRouter(tags=["health"])


def _load_version():
    """从 version 文件读取版本号"""
    version_file = Path(__file__).parent.parent / "version"
    if version_file.exists():
        try:
            with open(version_file, "r", encoding="utf-8") as f:
                return f.read().strip()
        except Exception:
            pass
    return "1.0.0"  # 默认版本


@router.get("/health")
async def health() -> Dict[str, str]:
    """健康检查端点"""
    return {
        "status": "ok",
        "service": "trendradar-web-server",
        "version": _load_version()
    }

