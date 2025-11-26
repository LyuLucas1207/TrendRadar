"""
版本管理模块

负责读取和管理版本信息
"""
from pathlib import Path


def load_version() -> str:
    """从 version 文件读取版本号"""
    version_file = Path(__file__).parent.parent / "version"
    if version_file.exists():
        try:
            with open(version_file, "r", encoding="utf-8") as f:
                return f.read().strip()
        except Exception:
            pass
    return "1.0.0"  # 默认版本


# 加载版本号
VERSION = load_version()

