# coding=utf-8

"""
频率词控制器

处理频率词相关的事件
"""
import logging
from typing import Dict, Any
from crawl_server.resources.kafka.events import OperationClearEvent
from crawl_server.services import FrequencyService

logger = logging.getLogger(__name__)


class FrequencyController:
    """频率词控制器"""
    
    def __init__(self, frequency_service: FrequencyService):
        """
        初始化控制器
        
        Args:
            frequency_service: 频率词服务实例
        """
        self.frequency_service = frequency_service
    
    def handle_clear(self, event_data: Dict[str, Any]):
        """
        处理 operation.clear 事件（刷新 frequency_words）
        
        Args:
            event_data: 事件数据
        """
        try:
            event = OperationClearEvent.from_dict(event_data)
            logger.info(f"🔄 收到刷新 frequency_words 请求: source={event.source}")
            
            # 调用 Service 处理业务逻辑
            self.frequency_service.refresh_frequency_words(source=event.source)
            
        except Exception as e:
            logger.error(f"❌ 处理 operation.clear 事件失败: {e}", exc_info=True)
            raise

