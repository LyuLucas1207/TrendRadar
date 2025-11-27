# coding=utf-8

"""
抓取服务

MVC 架构 - Service 层
负责抓取业务逻辑
"""
import logging
from typing import Dict, List, Optional
from crawl_server.core import create_news_analyzer
from crawl_server.repositories import CrawlPipeline
from crawl_server.configs import CrawlConfig, DatabaseConfig

logger = logging.getLogger(__name__)


class CrawlService:
    """抓取服务"""
    
    def __init__(
        self,
        pipeline_repo: CrawlPipeline,
        crawl_config: CrawlConfig,
        db_config: DatabaseConfig
    ):
        """
        初始化服务
        
        Args:
            pipeline_repo: Pipeline 仓库（Kafka 发送）
            crawl_config: 爬虫配置对象
            db_config: 数据库配置对象
        """
        self.pipeline_repo = pipeline_repo
        self.crawl_config = crawl_config
        self.db_config = db_config
    
    def execute_crawl(
        self, 
        platforms: List[Dict],
        word_groups: List[Dict],
        filter_words: List[str],
        count: int = 1, 
        trigger: str = "manual"
    ):
        """
        执行抓取任务
        
        Args:
            platforms: 平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
            word_groups: 频率词组列表
            filter_words: 过滤词列表
            count: 抓取次数
            trigger: 触发来源（manual, scheduled, api）
        
        Returns:
            成功次数
        """
        logger.info(f"📥 开始执行抓取任务: count={count}, trigger={trigger}")
        
        if not platforms:
            logger.error("❌ 没有可用的平台，跳过抓取任务")
            return 0
        
        # 执行指定次数的抓取，直接传递参数，不修改 CONFIG
        success_count = 0
        for i in range(count):
            logger.info(f"📥 开始第 {i+1}/{count} 次抓取...")
            try:
                # 每次抓取创建新实例，避免状态污染
                analyzer = create_news_analyzer(crawl_config=self.crawl_config, db_config=self.db_config)
                # 直接传递 platforms 和 frequency_words 作为参数
                analyzer.run(
                    platforms=platforms,
                    word_groups=word_groups,
                    filter_words=filter_words,
                    trigger_source=trigger
                )
                
                success_count += 1
                logger.info(f"✅ 第 {i+1}/{count} 次抓取完成")
            except Exception as e:
                logger.error(f"❌ 第 {i+1}/{count} 次抓取失败: {e}", exc_info=True)
                # 继续执行下一次，不中断
        
        logger.info(f"✅ 抓取任务完成: 成功 {success_count}/{count} 次")
        return success_count
    
    def send_crawl_data(
        self,
        results: Dict,
        id_to_name: Dict,
        failed_ids: List
    ) -> bool:
        """
        发送抓取数据到 Pipeline（Kafka）
        
        Args:
            results: 抓取结果
            id_to_name: 平台ID到名称的映射
            failed_ids: 失败的平台ID列表
        
        Returns:
            是否发送成功
        """
        return self.pipeline_repo.send_crawl_data(results, id_to_name, failed_ids)

