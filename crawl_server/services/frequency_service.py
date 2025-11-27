# coding=utf-8

"""
频率词服务

MVC 架构 - Service 层
负责频率词业务逻辑
"""
import logging
from typing import Optional, List, Dict, Tuple
from crawl_server.repositories import FrequencyCache, FrequencyDatabase

logger = logging.getLogger(__name__)


class FrequencyService:
    """频率词服务"""
    
    def __init__(
        self,
        cache_repo: FrequencyCache,
        database_repo: FrequencyDatabase
    ):
        """
        初始化服务
        
        Args:
            cache_repo: 缓存仓库（Redis）
            database_repo: 数据库仓库（PostgreSQL）
        """
        self.cache_repo = cache_repo
        self.database_repo = database_repo
        self._cached_result: Optional[Tuple[List[Dict], List[str]]] = None
    
    def get_frequency_words(self) -> Tuple[List[Dict], List[str]]:
        """
        获取频率词（word_groups 和 filter_words）
        
        优先级：
        1. 内存缓存
        2. Redis 缓存
        3. 数据库
        
        Returns:
            (word_groups, filter_words) 元组
            word_groups: List[Dict] - 词组列表，格式: [{"required": [...], "normal": [...], "group_key": "...", "max_count": 0}, ...]
            filter_words: List[str] - 过滤词列表
        
        Raises:
            RuntimeError: 如果数据库和 Redis 都没有数据
        """
        # 1. 检查内存缓存
        if self._cached_result is not None:
            logger.debug("📦 从内存缓存获取 frequency_words")
            return self._cached_result
        
        # 2. 尝试从 Redis 获取
        result = self.cache_repo.get()
        if result:
            logger.info("📦 从 Redis 获取 frequency_words")
            self._cached_result = result
            return result
        
        # 3. 尝试从数据库获取
        result = self.database_repo.get()
        if result:
            logger.info("📦 从数据库获取 frequency_words")
            # 更新 Redis 缓存
            self.cache_repo.set(result)
            self._cached_result = result
            return result
        
        # 4. 数据库和 Redis 都没有数据，报错
        logger.error("❌ 数据库和 Redis 都没有 frequency_words 数据，无法继续运行")
        raise RuntimeError("frequency_words 数据缺失，请先执行 SQL 脚本插入数据")
    
    def refresh_frequency_words(self, source: str = "manual"):
        """
        刷新 frequency_words
        
        流程：
        1. 清除 Redis 缓存
        2. 清除内存缓存
        3. 从数据库读取最新数据
        4. 将数据写入 Redis 缓存
        
        Args:
            source: 刷新来源（manual, api, scheduled）
        
        Raises:
            RuntimeError: 如果数据库没有数据
        """
        logger.info(f"🔄 刷新 frequency_words: source={source}")
        
        # 1. 清除 Redis 缓存
        if self.cache_repo.delete():
            logger.info("✅ 已清除 Redis 缓存")
        else:
            logger.warning("⚠️  清除 Redis 缓存失败或 Redis 未启用")
        
        # 2. 清除内存缓存
        self._cached_result = None
        logger.debug("✅ 已清除内存缓存")
        
        # 3. 从数据库获取最新数据
        result = self.database_repo.get()
        if result:
            logger.info("✅ 从数据库获取 frequency_words 成功")
            # 4. 将数据写入 Redis 缓存
            if self.cache_repo.set(result):
                logger.info("✅ 已将 frequency_words 写入 Redis 缓存")
            else:
                logger.warning("⚠️  写入 Redis 缓存失败或 Redis 未启用")
            # 更新内存缓存
            self._cached_result = result
        else:
            logger.error("❌ 数据库中没有 frequency_words 数据，无法刷新")
            raise RuntimeError("frequency_words 数据缺失，请先执行 SQL 脚本插入数据")

