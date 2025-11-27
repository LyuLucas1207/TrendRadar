# coding=utf-8

"""
平台信息缓存仓库

负责从 Redis 缓存读取和写入平台信息
"""
import json
import logging
from typing import Optional, List, Dict
from crawl_server.resources.redis import RedisClient

logger = logging.getLogger(__name__)

# Redis key
PLATFORMS_CACHE_KEY = "trendradar:platforms"
PLATFORMS_CACHE_TTL = 7200  # 2 小时（秒）


class PlatformCache:
    """平台信息缓存（Redis）"""
    
    def __init__(self, redis_client: Optional[RedisClient] = None):
        """
        初始化缓存仓库
        
        Args:
            redis_client: Redis 客户端
        """
        self.redis_client = redis_client
    
    def get(self) -> Optional[List[Dict[str, str]]]:
        """
        从 Redis 获取平台列表
        
        Returns:
            平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
            如果 Redis 未启用或缓存不存在则返回 None
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return None
        
        try:
            cached_data = self.redis_client.get(PLATFORMS_CACHE_KEY)
            if cached_data:
                platforms = json.loads(cached_data)
                logger.debug(f"✅ 从 Redis 获取平台列表: {len(platforms)} 个平台")
                return platforms
            return None
        except Exception as e:
            logger.error(f"❌ 从 Redis 获取平台列表失败: {e}")
            return None
    
    def set(self, platforms: List[Dict[str, str]]) -> bool:
        """
        保存平台列表到 Redis
        
        Args:
            platforms: 平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
        
        Returns:
            是否成功
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        
        try:
            data = json.dumps(platforms, ensure_ascii=False)
            success = self.redis_client.set(
                PLATFORMS_CACHE_KEY,
                data,
                ex=PLATFORMS_CACHE_TTL
            )
            if success:
                logger.info(f"✅ 平台列表已缓存到 Redis（TTL: {PLATFORMS_CACHE_TTL}秒）")
            return success
        except Exception as e:
            logger.error(f"❌ 保存平台列表到 Redis 失败: {e}")
            return False
    
    def clear(self) -> bool:
        """
        清除平台列表缓存
        
        Returns:
            是否成功
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        
        try:
            success = self.redis_client.delete(PLATFORMS_CACHE_KEY)
            if success:
                logger.info("✅ 平台列表缓存已清除")
            return success
        except Exception as e:
            logger.error(f"❌ 清除平台列表缓存失败: {e}")
            return False

