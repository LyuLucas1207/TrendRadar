# coding=utf-8

"""
数据服务

MVC 架构 - Service 层
负责将 Kafka 事件数据写入数据库
"""
import logging
from typing import Dict, Any, List, Optional

from crawl_server.repositories import CrawlResultDatabase, CrawlSessionDatabase
from crawl_server.resources.kafka.events import DataCrawlEvent, DataCrawlSessionEvent

logger = logging.getLogger(__name__)


class DataService:
    """数据服务"""
    
    def __init__(
        self,
        crawl_result_repo: CrawlResultDatabase,
        crawl_session_repo: CrawlSessionDatabase
    ):
        """
        初始化服务
        
        Args:
            crawl_result_repo: 抓取结果仓库
            crawl_session_repo: 抓取会话仓库
        """
        self.crawl_result_repo = crawl_result_repo
        self.crawl_session_repo = crawl_session_repo
    
    def save_crawl_result(self, event_data: Dict[str, Any], session_id: Optional[str] = None) -> bool:
        """
        保存单条抓取结果
        
        Args:
            event_data: DataCrawlEvent 数据
            session_id: 抓取会话ID（可选）
        
        Returns:
            是否成功
        """
        try:
            event = DataCrawlEvent.from_dict(event_data)
            
            result_data = {
                "platform_id": event.platform_id,
                "title": event.title,
                "rank": event.rank,
                "ranks": event.ranks,
                "url": event.url,
                "mobile_url": event.mobile_url,
                "matched_group_keys": event.matched_group_keys,
                "is_success": event.is_success,
                "error_message": event.error_message,
                "fetch_time": event.fetch_time,
            }
            
            saved_count = self.crawl_result_repo.save_batch([result_data], session_id=session_id)
            return saved_count > 0
        except Exception as e:
            logger.error(f"❌ 保存抓取结果失败: {e}", exc_info=True)
            return False
    
    def save_crawl_results_batch(
        self,
        events_list: List[Dict[str, Any]],
        session_id: Optional[str] = None
    ) -> int:
        """
        批量保存抓取结果
        
        Args:
            events_list: DataCrawlEvent 数据列表
            session_id: 抓取会话ID（可选）
        
        Returns:
            成功保存的数量
        """
        try:
            results = []
            for event_data in events_list:
                event = DataCrawlEvent.from_dict(event_data)
                results.append({
                    "platform_id": event.platform_id,
                    "title": event.title,
                    "rank": event.rank,
                    "ranks": event.ranks,
                    "url": event.url,
                    "mobile_url": event.mobile_url,
                    "matched_group_keys": event.matched_group_keys,
                    "is_success": event.is_success,
                    "error_message": event.error_message,
                    "fetch_time": event.fetch_time,
                })
            
            return self.crawl_result_repo.save_batch(results, session_id=session_id)
        except Exception as e:
            logger.error(f"❌ 批量保存抓取结果失败: {e}", exc_info=True)
            return 0
    
    def save_crawl_session(self, event_data: Dict[str, Any]) -> bool:
        """
        保存抓取会话
        
        Args:
            event_data: DataCrawlSessionEvent 数据
        
        Returns:
            是否成功
        """
        try:
            event = DataCrawlSessionEvent.from_dict(event_data)
            
            session_data = {
                "session_id": event.session_id,
                "trigger_source": event.trigger_source,
                "total_platforms": event.total_platforms,
                "success_count": event.success_count,
                "failed_count": event.failed_count,
                "failed_ids": event.failed_ids,
                "platforms": event.platforms,
                "word_groups": event.word_groups,
                "filter_words": event.filter_words,
                "total_news_count": event.total_news_count,
                "started_at": event.started_at,
                "completed_at": event.completed_at,
                "status": event.status,
            }
            
            return self.crawl_session_repo.save(session_data)
        except Exception as e:
            logger.error(f"❌ 保存抓取会话失败: {e}", exc_info=True)
            return False

