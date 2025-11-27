# coding=utf-8

"""
数据抓取事件（成功或失败）
"""
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class DataCrawlEvent:
    """数据抓取事件（成功或失败）"""
    platform_id: str
    title: Optional[str] = None  # 失败时为空
    ranks: list = None  # 失败时为空
    rank: Optional[int] = None  # 失败时为空
    url: str = ""  # 失败时为空
    mobile_url: str = ""  # 失败时为空
    matched_group_keys: list = None  # 匹配到的频率词组键列表（group_key数组），如 ["新能源汽车", "电池技术"]
    is_success: int = 1  # 是否成功（1=成功，0=失败）
    error_message: Optional[str] = None  # 错误信息（失败时记录）
    fetch_time: str = ""  # 抓取时间
    
    def __post_init__(self):
        if self.ranks is None:
            self.ranks = []
        if self.matched_group_keys is None:
            self.matched_group_keys = []
        if not self.fetch_time:
            self.fetch_time = datetime.now().isoformat()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DataCrawlEvent":
        """从字典创建事件"""
        return cls(
            platform_id=data["platform_id"],
            title=data.get("title"),
            ranks=data.get("ranks", []),
            rank=data.get("rank"),
            url=data.get("url", ""),
            mobile_url=data.get("mobile_url", data.get("mobileUrl", "")),
            matched_group_keys=data.get("matched_group_keys", data.get("word_groups", [])),  # 兼容旧字段名
            is_success=data.get("is_success", 1),
            error_message=data.get("error_message"),
            fetch_time=data.get("fetch_time", datetime.now().isoformat()),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.DATA_CRAWL

