"""
配置模块

负责加载和管理应用配置
"""
from .config import CONFIG, load_config
from .smtp import SMTP_CONFIGS
from .version import VERSION

__all__ = ["CONFIG", "SMTP_CONFIGS", "VERSION", "load_config"]

