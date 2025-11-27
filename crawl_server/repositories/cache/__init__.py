"""
Cache 仓库模块

Redis 缓存数据访问
"""
from .frequency import FrequencyCache
from .platform import PlatformCache

__all__ = ["FrequencyCache", "PlatformCache"]
