# coding=utf-8

"""
抓取控制器

处理抓取相关的事件
"""
import logging
from typing import Dict, Any, Optional
from crawl_server.resources.kafka.events import OperationCrawlEvent
from crawl_server.services import CrawlService, PlatformService, FrequencyService
from crawl_server.configs import CrawlConfig, DatabaseConfig

logger = logging.getLogger(__name__)


class CrawlController:
    """抓取控制器"""
    
    def __init__(
        self, 
        crawl_service: CrawlService,
        platform_service: PlatformService,
        frequency_service: FrequencyService,
        crawl_config: CrawlConfig,
        db_config: DatabaseConfig
    ):
        """
        初始化控制器
        
        Args:
            crawl_service: 抓取服务实例
            platform_service: 平台服务实例
            frequency_service: 频率词服务实例
            crawl_config: 爬虫配置对象
            db_config: 数据库配置对象
        """
        self.crawl_service = crawl_service
        self.platform_service = platform_service
        self.frequency_service = frequency_service
        self.crawl_config = crawl_config
        self.db_config = db_config
    
    def handle_event_crawl(
        self, 
        event_data: Dict[str, Any]
    ):
        """
        处理 operation.crawl 事件（来自 Kafka）
        
        Args:
            event_data: 事件数据
        """
        try:
            event = OperationCrawlEvent.from_dict(event_data)
            logger.info(f"🔄 收到抓取请求（事件）: trigger={event.trigger}, count={event.count}")
            
            # 调用通用的 handle_crawl 方法
            self.handle_crawl(trigger=event.trigger, count=event.count)
            
        except Exception as e:
            logger.error(f"❌ 处理 operation.crawl 事件失败: {e}", exc_info=True)
            raise
    
    def handle_crawl(
        self,
        trigger: str = "scheduled",
        count: int = 1
    ):
        """
        执行抓取任务（定时服务调用）
        
        Args:
            trigger: 触发来源（manual, scheduled, api）
            count: 抓取次数，默认为1
        """
        try:
            logger.info(f"🔄 开始执行抓取任务: trigger={trigger}, count={count}")
            
            # Controller 负责协调多个 Service
            # 1. 获取平台列表
            platforms = self.platform_service.get_platforms()
            logger.info(f"📊 获取到 {len(platforms)} 个平台")
            
            if not platforms:
                logger.error("❌ 没有可用的平台，跳过抓取任务")
                return
            
            # 2. 获取频率词
            word_groups, filter_words = self.frequency_service.get_frequency_words()
            logger.info(f"📝 从数据库加载频率词: {len(word_groups)} 个词组, {len(filter_words)} 个过滤词")
            
            # 3. 调用 Service 处理业务逻辑，传递已获取的数据
            self.crawl_service.execute_crawl(
                platforms=platforms,
                word_groups=word_groups,
                filter_words=filter_words,
                count=count,
                trigger=trigger
            )
            
        except Exception as e:
            logger.error(f"❌ 执行抓取任务失败: {e}", exc_info=True)
            raise

