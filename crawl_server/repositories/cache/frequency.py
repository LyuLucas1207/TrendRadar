# coding=utf-8

"""
频率词缓存仓库

负责从 Redis 缓存读取和写入 frequency_words
"""
import json
import logging
from typing import Optional, List, Dict, Tuple
from crawl_server.resources.redis import RedisClient

logger = logging.getLogger(__name__)

# Redis key
FREQUENCY_WORDS_CACHE_KEY = "trendradar:frequency_words"
FREQUENCY_WORDS_CACHE_TTL = 7200  # 2 小时（秒）


class FrequencyCache:
    """频率词缓存（Redis）"""
    
    def __init__(self, redis_client: Optional[RedisClient] = None):
        """
        初始化缓存仓库
        
        Args:
            redis_client: Redis 客户端
        """
        self.redis_client = redis_client
    
    def get(self) -> Optional[Tuple[List[Dict], List[str]]]:
        """
        从 Redis 获取 frequency_words
        
        Returns:
            (word_groups, filter_words) 元组，如果不存在或过期则返回 None
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return None
        
        try:
            cached_data = self.redis_client.get(FREQUENCY_WORDS_CACHE_KEY)
            if cached_data:
                data = json.loads(cached_data)
                word_groups = data.get("word_groups", [])
                filter_words = data.get("filter_words", [])
                logger.debug(f"✅ 从 Redis 获取 frequency_words 成功: {len(word_groups)} 个词组, {len(filter_words)} 个过滤词")
                return (word_groups, filter_words)
            logger.debug("⚠️  Redis 中 frequency_words 不存在或已过期")
            return None
        except Exception as e:
            logger.error(f"❌ 从 Redis 获取 frequency_words 失败: {e}")
            return None
    
    def set(self, result: Tuple[List[Dict], List[str]], ex: Optional[int] = None) -> bool:
        """
        保存 frequency_words 到 Redis
        
        Args:
            result: (word_groups, filter_words) 元组
            ex: 过期时间（秒），None 表示使用默认 TTL
        
        Returns:
            是否成功
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        
        try:
            word_groups, filter_words = result
            data = {
                "word_groups": word_groups,
                "filter_words": filter_words
            }
            data_str = json.dumps(data, ensure_ascii=False)
            ttl = ex if ex is not None else FREQUENCY_WORDS_CACHE_TTL
            success = self.redis_client.set(FREQUENCY_WORDS_CACHE_KEY, data_str, ex=ttl)
            if success:
                logger.debug(f"✅ 保存 frequency_words 到 Redis 成功 (ex={ttl})")
            return success
        except Exception as e:
            logger.error(f"❌ 保存 frequency_words 到 Redis 失败: {e}")
            return False
    
    def exists(self) -> bool:
        """检查 frequency_words 是否存在于 Redis"""
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        return self.redis_client.exists("trendradar:frequency_words")
    
    def delete(self) -> bool:
        """删除 Redis 中的 frequency_words"""
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        return self.redis_client.delete("trendradar:frequency_words")

