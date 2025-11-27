# coding=utf-8

"""
平台服务

MVC 架构 - Service 层
负责平台信息的业务逻辑（Redis 缓存 + 数据库）
"""
import logging
from typing import List, Dict, Optional
from crawl_server.repositories.cache.platform import PlatformCache
from crawl_server.repositories.database.platform import PlatformDatabase

logger = logging.getLogger(__name__)


class PlatformService:
    """平台服务"""
    
    def __init__(
        self,
        cache_repo: PlatformCache,
        database_repo: PlatformDatabase
    ):
        """
        初始化服务
        
        Args:
            cache_repo: 缓存仓库（Redis）
            database_repo: 数据库仓库（PostgreSQL）
        """
        self.cache_repo = cache_repo
        self.database_repo = database_repo
    
    def get_platforms(self) -> List[Dict[str, str]]:
        """
        获取平台列表（优先级：Redis -> 数据库 -> 配置文件）
        
        Returns:
            平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
        """
        # 1. 尝试从 Redis 获取
        platforms = self.cache_repo.get()
        if platforms:
            logger.debug("✅ 从 Redis 获取平台列表")
            return platforms
        
        # 2. Redis 缓存失效，从数据库获取
        logger.info("⚠️  Redis 缓存失效，从数据库获取平台列表")
        platforms = self.database_repo.get_all()
        
        if platforms:
            # 更新 Redis 缓存
            self.cache_repo.set(platforms)
            logger.info("✅ 从数据库获取平台列表并更新 Redis 缓存")
            return platforms
        
        # 3. 数据库也没有，返回空列表（或从配置文件读取，这里暂时返回空）
        logger.warning("⚠️  数据库和 Redis 都没有平台数据，返回空列表")
        return []
    
    def refresh_platforms(self, platforms: List[Dict[str, str]]) -> bool:
        """
        刷新平台列表（同时更新数据库和 Redis）
        
        Args:
            platforms: 平台列表
        
        Returns:
            是否成功
        """
        # 更新数据库
        db_success = self.database_repo.save_all(platforms)
        
        # 更新 Redis 缓存
        cache_success = self.cache_repo.set(platforms)
        
        return db_success or cache_success

