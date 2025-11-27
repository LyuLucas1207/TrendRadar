# coding=utf-8

"""
执行抓取操作事件
"""
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class OperationCrawlEvent:
    """执行抓取操作事件"""
    trigger: str = "manual"  # manual, scheduled, api
    count: int = 1  # 抓取次数，默认为1
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
        # 确保 count 至少为 1
        if self.count < 1:
            self.count = 1
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OperationCrawlEvent":
        """从字典创建事件"""
        return cls(
            trigger=data.get("trigger", "manual"),
            count=data.get("count", 1),
            timestamp=data.get("timestamp"),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.OPERATION_CRAWL

