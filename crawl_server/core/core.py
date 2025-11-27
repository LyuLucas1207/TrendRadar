# coding=utf-8

"""
Core 核心模块

提供统一的核心组件实例管理
支持单例模式和工厂模式
"""
import logging
from typing import Optional
from crawl_server.core.analyzers import NewsAnalyzer
from crawl_server.configs import CrawlConfig, DatabaseConfig

logger = logging.getLogger(__name__)

# 全局单例实例
_news_analyzer_instance: Optional[NewsAnalyzer] = None


def get_news_analyzer(
    singleton: bool = True, 
    crawl_config: Optional[CrawlConfig] = None,
    db_config: Optional[DatabaseConfig] = None
) -> NewsAnalyzer:
    """
    获取 NewsAnalyzer 实例
    
    Args:
        singleton: 是否使用单例模式（默认 True）
                  - True: 返回全局单例，首次调用时创建
                  - False: 每次返回新实例
        crawl_config: 爬虫配置对象
        db_config: 数据库配置对象
    
    Returns:
        NewsAnalyzer 实例
    """
    global _news_analyzer_instance
    
    if singleton:
        if _news_analyzer_instance is None:
            logger.debug("创建 NewsAnalyzer 单例实例")
            if not crawl_config:
                raise RuntimeError("CrawlConfig 未提供，无法创建 NewsAnalyzer")
            _news_analyzer_instance = NewsAnalyzer(crawl_config=crawl_config, db_config=db_config)
        return _news_analyzer_instance
    else:
        logger.debug("创建新的 NewsAnalyzer 实例")
        if not crawl_config:
            raise RuntimeError("CrawlConfig 未提供，无法创建 NewsAnalyzer")
        return NewsAnalyzer(crawl_config=crawl_config, db_config=db_config)


def reset_news_analyzer():
    """
    重置 NewsAnalyzer 单例实例
    
    用于测试或需要重新初始化时使用
    """
    global _news_analyzer_instance
    logger.debug("重置 NewsAnalyzer 单例实例")
    _news_analyzer_instance = None


def create_news_analyzer(
    crawl_config: Optional[CrawlConfig] = None,
    db_config: Optional[DatabaseConfig] = None
) -> NewsAnalyzer:
    """
    工厂函数：创建新的 NewsAnalyzer 实例
    
    这是 get_news_analyzer(singleton=False) 的别名，语义更清晰
    
    Args:
        crawl_config: 爬虫配置对象
        db_config: 数据库配置对象
    
    Returns:
        新的 NewsAnalyzer 实例
    """
    return get_news_analyzer(singleton=False, crawl_config=crawl_config, db_config=db_config)


