"""
Kafka 模块

负责将抓取的新闻数据发送到 Kafka
"""
from .client import KafkaClient
from .sender import send_fetched_data_to_kafka

__all__ = ["KafkaClient", "send_fetched_data_to_kafka"]

