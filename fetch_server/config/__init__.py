"""
配置模块

负责加载和管理应用配置
"""
from .config import CONFIG, SMTP_CONFIGS, load_config

__all__ = ["CONFIG", "SMTP_CONFIGS", "load_config"]

