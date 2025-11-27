"""
Repositories 模块

MVC 架构 - Repository 层
数据访问层，分为 cache/database/pipeline/file
"""
from .cache import FrequencyCache, PlatformCache
from .database import FrequencyDatabase, PlatformDatabase, CrawlResultDatabase, CrawlSessionDatabase
from .pipeline import CrawlPipeline

__all__ = [
    "FrequencyCache",
    "FrequencyDatabase",
    "CrawlPipeline",
    "PlatformCache",
    "PlatformDatabase",
    "CrawlResultDatabase",
    "CrawlSessionDatabase",
]

