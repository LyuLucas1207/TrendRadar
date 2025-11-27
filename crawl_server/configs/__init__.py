"""
配置模块

负责加载和管理应用配置
"""
from .config import load_config
from .smtp import SMTP_CONFIGS
from .version import VERSION
from .types import CrawlConfig, DatabaseConfig

__all__ = [
    "CrawlConfig",
    "DatabaseConfig",
    "SMTP_CONFIGS",
    "VERSION",
    "load_config",
]

