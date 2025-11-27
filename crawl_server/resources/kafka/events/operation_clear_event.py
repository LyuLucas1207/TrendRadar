# coding=utf-8

"""
刷新 frequency_words 操作事件
"""
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class OperationClearEvent:
    """刷新 frequency_words 操作事件"""
    source: str = "manual"  # manual, api, scheduled
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OperationClearEvent":
        """从字典创建事件"""
        return cls(
            source=data.get("source", "manual"),
            timestamp=data.get("timestamp"),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.OPERATION_CLEAR

