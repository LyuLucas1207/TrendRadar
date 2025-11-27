"""
Models 模块

数据模型 - 使用 SQLAlchemy ORM 定义数据库表结构
"""
# SQLAlchemy ORM 模型（数据库表）
from .base import Base
from .word_group import WordGroup
from .frequency_word import FrequencyWord
from .crawl_result import CrawlResult
# TitleHistory 已删除 - 可以从 CrawlResult 聚合得到历史数据
from .crawl_session import CrawlSession
from .platform import Platform

__all__ = [
    "Base",
    "WordGroup",
    "FrequencyWord",
    "CrawlResult",
    "CrawlSession",
    "Platform",
]

