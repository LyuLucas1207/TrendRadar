# coding=utf-8

"""
Kafka 事件模块

参考 Sjgz-Backend 的设计：
- Topics: trendradar.crawl_server 和 trendradar.crawl_server_poison
- Event Type 放在 message metadata 中，key 是 "event_type"
"""
from .event_type import EventType
from .data_crawl_event import DataCrawlEvent
from .data_crawl_session_event import DataCrawlSessionEvent
from .operation_crawl_event import OperationCrawlEvent
from .operation_clear_event import OperationClearEvent

__all__ = [
    "EventType",
    "DataCrawlEvent",
    "DataCrawlSessionEvent",
    "OperationCrawlEvent",
    "OperationClearEvent",
]

