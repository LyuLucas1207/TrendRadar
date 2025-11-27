"""
Resources 模块

外部资源连接（Kafka, Redis, PostgreSQL）
"""
from .kafka import (
    KafkaClient,
    send_fetched_data_to_kafka,
    KafkaEventConsumer,
    KafkaConsumerThread,
    EventType,
    DataCrawlEvent,
    OperationCrawlEvent,
    OperationClearEvent,
)
from .redis import RedisClient
from .postgresql import DatabaseSession

__all__ = [
    "KafkaClient",
    "send_fetched_data_to_kafka",
    "KafkaEventConsumer",
    "KafkaConsumerThread",
    "EventType",
    "DataCrawlEvent",
    "OperationCrawlEvent",
    "OperationClearEvent",
    "RedisClient",
    "DatabaseSession",
]

