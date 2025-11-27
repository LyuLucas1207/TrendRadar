# coding=utf-8

"""
事件路由分发器

负责将 Kafka 事件（event_type）路由到对应的 Controller 方法
"""
import logging
from typing import Dict, Callable, Any, Optional
from crawl_server.resources.kafka import EventType
from crawl_server.controllers import CrawlController, FrequencyController, DataController

logger = logging.getLogger(__name__)


class EventRouter:
    """事件路由分发器"""
    
    def __init__(
        self,
        crawl_controller: Optional[CrawlController] = None,
        frequency_controller: Optional[FrequencyController] = None,
        data_controller: Optional[DataController] = None
    ):
        """
        初始化路由分发器
        
        Args:
            crawl_controller: 抓取控制器
            frequency_controller: 频率词控制器
            data_controller: 数据控制器
        """
        self.crawl_controller = crawl_controller
        self.frequency_controller = frequency_controller
        self.data_controller = data_controller
        self.routes: Dict[str, Callable[[Dict[str, Any]], None]] = {}
    
    def register_routes(self):
        """注册所有路由"""
        # 注册 operation.crawl 路由（使用 handle_event_crawl 处理事件）
        if self.crawl_controller:
            self.routes[EventType.OPERATION_CRAWL] = self.crawl_controller.handle_event_crawl
            logger.info(f"✅ 注册路由: {EventType.OPERATION_CRAWL} -> CrawlController.handle_event_crawl")
        
        # 注册 operation.clear 路由
        if self.frequency_controller:
            self.routes[EventType.OPERATION_CLEAR] = self.frequency_controller.handle_clear
            logger.info(f"✅ 注册路由: {EventType.OPERATION_CLEAR} -> FrequencyController.handle_clear")
        
        # 注册 data.crawl 路由（保存抓取结果）
        if self.data_controller:
            self.routes[EventType.DATA_CRAWL] = self.data_controller.handle_data_crawl
            logger.info(f"✅ 注册路由: {EventType.DATA_CRAWL} -> DataController.handle_data_crawl")
        
        # 注册 data.crawl.session 路由（保存抓取会话）
        if self.data_controller:
            self.routes[EventType.DATA_CRAWL_SESSION] = self.data_controller.handle_data_crawl_session
            logger.info(f"✅ 注册路由: {EventType.DATA_CRAWL_SESSION} -> DataController.handle_data_crawl_session")
        
        logger.info(f"📋 共注册 {len(self.routes)} 个路由")
    
    def route(self, event_type: str, event_data: Dict[str, Any]) -> bool:
        """
        路由事件到对应的处理器
        
        Args:
            event_type: 事件类型
            event_data: 事件数据
        
        Returns:
            是否成功路由和处理
        """
        handler = self.routes.get(event_type)
        if not handler:
            logger.warning(f"⚠️  未找到路由处理器: event_type={event_type}")
            return False
        
        try:
            logger.debug(f"🔄 路由事件: {event_type} -> {handler.__name__}")
            handler(event_data)
            return True
        except Exception as e:
            logger.error(f"❌ 路由处理失败: event_type={event_type}, error={e}", exc_info=True)
            return False
    
    def get_handler(self, event_type: str) -> Optional[Callable[[Dict[str, Any]], None]]:
        """
        获取指定事件类型的处理器
        
        Args:
            event_type: 事件类型
        
        Returns:
            处理器函数，如果不存在则返回 None
        """
        return self.routes.get(event_type)
    
    def list_routes(self) -> Dict[str, str]:
        """
        列出所有已注册的路由
        
        Returns:
            路由映射字典 {event_type: handler_name}
        """
        return {
            event_type: handler.__name__ if hasattr(handler, '__name__') else str(handler)
            for event_type, handler in self.routes.items()
        }


def setup_routes(
    crawl_controller: Optional[CrawlController] = None,
    frequency_controller: Optional[FrequencyController] = None,
    data_controller: Optional[DataController] = None
) -> EventRouter:
    """
    设置路由分发器
    
    Args:
        crawl_controller: 抓取控制器
        frequency_controller: 频率词控制器
        data_controller: 数据控制器
    
    Returns:
        配置好的 EventRouter 实例
    """
    router = EventRouter(
        crawl_controller=crawl_controller,
        frequency_controller=frequency_controller,
        data_controller=data_controller
    )
    router.register_routes()
    return router

