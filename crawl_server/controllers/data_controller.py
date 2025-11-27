# coding=utf-8

"""
数据控制器

处理数据相关的事件（将 Kafka 事件数据写入数据库）
"""
import logging
from typing import Dict, Any
from crawl_server.resources.kafka.events import DataCrawlEvent, DataCrawlSessionEvent
from crawl_server.services import DataService

logger = logging.getLogger(__name__)


class DataController:
    """数据控制器"""
    
    def __init__(self, data_service: DataService):
        """
        初始化控制器
        
        Args:
            data_service: 数据服务实例
        """
        self.data_service = data_service
    
    def handle_data_crawl(self, event_data: Dict[str, Any]):
        """
        处理 data.crawl 事件（保存单条抓取结果）
        
        Args:
            event_data: 事件数据
        """
        try:
            event = DataCrawlEvent.from_dict(event_data)
            logger.debug(f"📥 收到 data.crawl 事件: platform={event.platform_id}, title={event.title[:50]}...")
            
            # 尝试从 event_data 中获取 session_id（如果存在）
            session_id = event_data.get("session_id")
            
            # 保存到数据库
            success = self.data_service.save_crawl_result(event_data, session_id=session_id)
            if success:
                logger.debug(f"✅ 已保存抓取结果到数据库: platform={event.platform_id}")
            else:
                logger.warning(f"⚠️  保存抓取结果失败: platform={event.platform_id}")
        except Exception as e:
            logger.error(f"❌ 处理 data.crawl 事件失败: {e}", exc_info=True)
            raise
    
    def handle_data_crawl_session(self, event_data: Dict[str, Any]):
        """
        处理 data.crawl.session 事件（保存抓取会话信息）
        
        Args:
            event_data: 事件数据
        """
        try:
            event = DataCrawlSessionEvent.from_dict(event_data)
            logger.info(f"📥 收到 data.crawl.session 事件: session_id={event.session_id}, status={event.status}")
            
            # 保存会话信息到数据库
            success = self.data_service.save_crawl_session(event_data)
            if success:
                logger.info(f"✅ 已保存抓取会话到数据库: session_id={event.session_id}")
            else:
                logger.warning(f"⚠️  保存抓取会话失败: session_id={event.session_id}")
        except Exception as e:
            logger.error(f"❌ 处理 data.crawl.session 事件失败: {e}", exc_info=True)
            raise

