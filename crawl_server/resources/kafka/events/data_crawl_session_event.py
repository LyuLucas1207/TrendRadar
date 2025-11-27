# coding=utf-8

"""
抓取会话完成事件
"""
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class DataCrawlSessionEvent:
    """抓取会话完成事件"""
    # 必需字段（无默认值）必须在前面
    session_id: str  # 会话ID（唯一标识）
    trigger_source: str  # 触发来源（manual, scheduled, api）
    started_at: str  # 开始时间
    completed_at: str  # 完成时间
    total_platforms: int  # 总平台数
    success_count: int  # 成功数量
    failed_count: int  # 失败数量
    failed_ids: list  # 失败的平台ID列表
    # 可选字段（有默认值）必须在后面
    platforms: list = None  # 使用的平台ID列表，格式: ["toutiao", "baidu", "weibo", ...]
    word_groups: list = None  # 使用的频率词组列表
    filter_words: list = None  # 使用的过滤词列表
    total_news_count: int = 0  # 抓取到的新闻总数
    status: str = "completed"  # 状态（running, completed, failed）
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.platforms is None:
            self.platforms = []
        if self.word_groups is None:
            self.word_groups = []
        if self.filter_words is None:
            self.filter_words = []
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DataCrawlSessionEvent":
        """从字典创建事件"""
        return cls(
            session_id=data["session_id"],
            trigger_source=data["trigger_source"],
            started_at=data["started_at"],
            completed_at=data["completed_at"],
            total_platforms=data.get("total_platforms", 0),
            success_count=data.get("success_count", 0),
            failed_count=data.get("failed_count", 0),
            failed_ids=data.get("failed_ids", []),
            platforms=data.get("platforms", []),
            word_groups=data.get("word_groups", []),
            filter_words=data.get("filter_words", []),
            total_news_count=data.get("total_news_count", 0),
            status=data.get("status", "completed"),
            timestamp=data.get("timestamp"),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.DATA_CRAWL_SESSION

