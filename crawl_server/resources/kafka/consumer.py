# coding=utf-8

"""
Kafka Consumer 客户端

负责监听 Kafka topics 并处理事件
"""
import json
import logging
import threading
from typing import Optional, Callable, Dict, Any
from datetime import datetime

try:
    from kafka import KafkaConsumer
    from kafka.errors import KafkaError
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False
    logging.warning("kafka-python 未安装，Kafka 功能将不可用")


class KafkaEventConsumer:
    """Kafka 事件消费者"""
    
    # Event Type Header Key（参考 Sjgz-Backend）
    EVENT_TYPE_HEADER_KEY = "event_type"
    
    def __init__(
        self,
        bootstrap_servers: str = "Resources-Kafka:9092",
        topic: str = "trendradar.crawl_server",
        group_id: str = "trendradar-crawl-server",
        enable_auto_commit: bool = True,
    ):
        """
        初始化 Kafka 消费者
        
        Args:
            bootstrap_servers: Kafka 服务器地址
            topic: 要监听的 topic 名称
            group_id: 消费者组 ID
            enable_auto_commit: 是否自动提交 offset
        """
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.group_id = group_id
        self.enable_auto_commit = enable_auto_commit
        self.consumer: Optional[KafkaConsumer] = None
        self.logger = logging.getLogger(__name__)
        self.running = False
        self.handlers: Dict[str, Callable[[Dict[str, Any]], None]] = {}
        
        # 禁用 kafka-python 库的详细日志
        if KAFKA_AVAILABLE:
            logging.getLogger('kafka').setLevel(logging.WARNING)
            logging.getLogger('kafka.conn').setLevel(logging.WARNING)
            logging.getLogger('kafka.coordinator').setLevel(logging.WARNING)
            logging.getLogger('kafka.consumer').setLevel(logging.WARNING)
            logging.getLogger('kafka.cluster').setLevel(logging.WARNING)
        
    def register_handler(self, event_type: str, handler: Callable[[Dict[str, Any]], None]):
        """
        注册事件处理器
        
        Args:
            event_type: 事件类型（如 "operation.crawl"）
            handler: 处理函数，接收事件数据字典
        """
        self.handlers[event_type] = handler
        self.logger.debug(f"✅ 注册事件处理器: {event_type}")
    
    def start(self):
        """启动消费者"""
        if not KAFKA_AVAILABLE:
            self.logger.error("❌ kafka-python 未安装，无法启动消费者")
            return False
        
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                enable_auto_commit=self.enable_auto_commit,
                auto_offset_reset='latest',  # 从最新消息开始
                consumer_timeout_ms=1000,  # 1秒超时，用于优雅退出
            )
            self.running = True
            self.logger.info(f"✅ Kafka 连接成功: topic={self.topic}, group_id={self.group_id}")
            return True
        except Exception as e:
            self.logger.error(f"❌ Kafka 消费者启动失败: {e}")
            return False
    
    def consume_loop(self):
        """消费循环（在独立线程中运行）"""
        if not self.consumer:
            self.logger.error("❌ 消费者未初始化，无法启动消费循环")
            return
        
        self.logger.debug(f"🔄 开始监听 Kafka topic: {self.topic}")
        
        while self.running:
            try:
                # 获取消息（带超时，便于检查 running 状态）
                message_pack = self.consumer.poll(timeout_ms=1000)
                
                if not message_pack:
                    continue
                
                for topic_partition, messages in message_pack.items():
                    for message in messages:
                        try:
                            self._handle_message(message)
                        except Exception as e:
                            self.logger.error(f"❌ 处理消息失败: {e}", exc_info=True)
                            
            except Exception as e:
                if self.running:
                    self.logger.error(f"❌ 消费消息时出错: {e}", exc_info=True)
                break
        
        self.logger.debug("🛑 Kafka 消费者循环已停止")
    
    def _handle_message(self, message):
        """处理单条消息"""
        # 从 headers 中获取 event_type（参考 Sjgz-Backend）
        event_type = None
        
        # kafka-python 的 headers 格式: [(key_str, value_bytes), ...]
        # 注意: 实际接收时 key 可能是 str 或 bytes，value 是 bytes
        if message.headers:
            for header_key, header_value in message.headers:
                try:
                    key_str = header_key.decode('utf-8') if isinstance(header_key, bytes) else header_key
                    if key_str == self.EVENT_TYPE_HEADER_KEY:
                        event_type = header_value.decode('utf-8') if isinstance(header_value, bytes) else header_value
                        break
                except (UnicodeDecodeError, AttributeError):
                    continue
        
        if not event_type:
            self.logger.warning(f"⚠️  消息缺少 event_type header: topic={message.topic}, offset={message.offset}")
            return
        
        # 获取事件数据
        event_data = message.value if message.value else {}
        
        # 查找并调用处理器
        handler = self.handlers.get(event_type)
        if handler:
            self.logger.debug(f"📨 收到事件: {event_type}, offset={message.offset}")
            try:
                handler(event_data)
            except Exception as e:
                self.logger.error(f"❌ 事件处理器执行失败: event_type={event_type}, error={e}", exc_info=True)
        else:
            self.logger.warning(f"⚠️  未注册的事件类型: {event_type}, offset={message.offset}")
    
    def stop(self):
        """停止消费者"""
        self.logger.debug("🛑 正在停止 Kafka 消费者...")
        self.running = False
        
        if self.consumer:
            try:
                self.consumer.close()
                self.logger.debug("✅ Kafka 消费者已关闭")
            except Exception as e:
                self.logger.error(f"❌ 关闭消费者时出错: {e}")


class KafkaConsumerThread(threading.Thread):
    """Kafka 消费者线程包装器"""
    
    def __init__(self, consumer: KafkaEventConsumer):
        super().__init__(daemon=True, name="KafkaConsumer")
        self.consumer = consumer
    
    def run(self):
        """运行消费者循环"""
        self.consumer.consume_loop()

