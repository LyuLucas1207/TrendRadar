"""
配置管理模块

返回爬虫配置和数据库配置
"""
from typing import Tuple
from .crawl_config import load_crawl_config
from .database_config import load_database_config
from .types import CrawlConfig, DatabaseConfig


def load_config() -> Tuple[CrawlConfig, DatabaseConfig]:
    """
    返回爬虫配置和数据库配置（可通过点号访问，IDE 有完整类型提示）
    
    Returns:
        Tuple[CrawlConfig, DatabaseConfig]: (爬虫配置, 数据库配置)
    """
    return load_crawl_config(), load_database_config()

