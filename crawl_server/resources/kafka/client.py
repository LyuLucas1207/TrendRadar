# coding=utf-8

"""
Kafka 客户端

提供 Kafka 生产者的封装
"""
import json
import logging
from typing import Optional, Dict, Any
from datetime import datetime

try:
    from kafka import KafkaProducer, KafkaAdminClient
    from kafka.admin import NewTopic
    from kafka.errors import KafkaError, TopicAlreadyExistsError
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False
    logging.warning("kafka-python 未安装，Kafka 功能将不可用")


class KafkaClient:
    """Kafka 客户端封装类"""
    
    def __init__(
        self,
        bootstrap_servers: str = "localhost:10109",
        enable_kafka: bool = False
    ):
        """
        初始化 Kafka 客户端
        
        Args:
            bootstrap_servers: Kafka 服务器地址
                - Docker 内部: kafka:9092
                - 宿主机外部: localhost:10109 (根据 docker-compose.yml 配置)
            enable_kafka: 是否启用 Kafka
        """
        self.bootstrap_servers = bootstrap_servers
        self.enable_kafka = enable_kafka and KAFKA_AVAILABLE
        self.producer: Optional[KafkaProducer] = None
        self.admin_client: Optional[KafkaAdminClient] = None
        self.logger = logging.getLogger(__name__)
        
        # 禁用 kafka-python 库的详细日志
        if self.enable_kafka:
            logging.getLogger('kafka').setLevel(logging.WARNING)
            logging.getLogger('kafka.conn').setLevel(logging.WARNING)
            logging.getLogger('kafka.coordinator').setLevel(logging.WARNING)
            logging.getLogger('kafka.consumer').setLevel(logging.WARNING)
            logging.getLogger('kafka.cluster').setLevel(logging.WARNING)
        
        if self.enable_kafka:
            try:
                # 先创建 AdminClient 用于检查和管理 topics
                self.admin_client = KafkaAdminClient(
                    bootstrap_servers=bootstrap_servers,
                    client_id='trendradar-admin',
                    request_timeout_ms=10000,
                )
                
                # 创建 Producer
                self.producer = KafkaProducer(
                    bootstrap_servers=bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
                    key_serializer=lambda k: k.encode('utf-8') if k and isinstance(k, str) else (k if k else None),
                    request_timeout_ms=30000,
                    retries=3,
                )
                self.logger.info(f"✅ Kafka 连接成功: {bootstrap_servers}")
            except Exception as e:
                self.logger.error(f"❌ Kafka 生产者初始化失败: {e}")
                self.enable_kafka = False
        else:
            if not KAFKA_AVAILABLE:
                self.logger.warning("⚠️  kafka-python 未安装，请运行: pip install kafka-python")
            else:
                self.logger.info("ℹ️  Kafka 功能已禁用")
    
    def ensure_topic_exists(
        self,
        topic: str,
        num_partitions: int = 3,
        replication_factor: int = 1
    ) -> bool:
        """
        检查 topic 是否存在，如果不存在则创建
        
        Args:
            topic: Topic 名称
            num_partitions: 分区数（默认3）
            replication_factor: 副本数（默认1，单节点）
        
        Returns:
            bool: topic 是否存在或创建成功
        """
        if not self.enable_kafka or not self.admin_client:
            return False
        
        try:
            # 检查 topic 是否存在：列出所有 topics
            existing_topics = self.admin_client.list_topics(timeout_ms=5000)
            
            if topic in existing_topics:
                self.logger.debug(f"✅ Topic '{topic}' 已存在")
                return True
        except Exception as e:
            # 如果检查失败，尝试直接创建（可能 topic 不存在或连接问题）
            self.logger.debug(f"检查 topic 时出错，尝试创建: {e}")
        
        # Topic 不存在，创建它
        try:
            topic_list = [
                NewTopic(
                    name=topic,
                    num_partitions=num_partitions,
                    replication_factor=replication_factor
                )
            ]
            self.admin_client.create_topics(new_topics=topic_list, validate_only=False)
            self.logger.debug(f"✅ 已创建 Topic '{topic}' (partitions={num_partitions}, replication={replication_factor})")
            return True
        except TopicAlreadyExistsError:
            # 并发创建时可能已存在
            self.logger.debug(f"✅ Topic '{topic}' 已存在（并发创建）")
            return True
        except Exception as e:
            self.logger.error(f"❌ 创建 Topic '{topic}' 失败: {e}")
            # 即使创建失败，也尝试继续（可能依赖自动创建）
            return False
    
    def send(
        self,
        topic: str,
        data: Dict[str, Any],
        key: Optional[str] = None,
        ensure_topic: bool = True,
        headers: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        发送数据到 Kafka
        
        Args:
            topic: Kafka topic 名称
            data: 数据字典
            key: 消息键（可选，用于分区）
            ensure_topic: 是否确保 topic 存在
            headers: 消息 headers（如 event_type）
        
        Returns:
            bool: 是否发送成功
        """
        if not self.enable_kafka or not self.producer:
            return False
        
        # 确保 topic 存在
        if ensure_topic:
            if not self.ensure_topic_exists(topic):
                self.logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，尝试直接发送（可能依赖自动创建）")
        
        try:
            # 确保 data 是字典格式
            if not isinstance(data, dict):
                raise ValueError(f"data 必须是字典类型，当前类型: {type(data)}")
            
            # 添加时间戳
            if '_timestamp' not in data:
                data['_timestamp'] = datetime.now().isoformat()
            
            # 构建 headers（kafka-python 格式: [(key_str, value_bytes), ...]）
            kafka_headers = []
            if headers:
                for k, v in headers.items():
                    # kafka-python 要求: key 必须是 str, value 必须是 bytes
                    kafka_headers.append((str(k), v.encode('utf-8') if isinstance(v, str) else v))
            
            # 准备 key（让 key_serializer 处理编码）
            # 如果 key 是 bytes，先转换为 str（不应该发生，但为了安全）
            if key:
                kafka_key = key.decode('utf-8') if isinstance(key, bytes) else str(key)
            else:
                kafka_key = None
            
            future = self.producer.send(
                topic=topic,
                key=kafka_key,  # 传入 str，让 key_serializer 处理编码
                value=data,  # value_serializer 会自动处理序列化
                headers=kafka_headers if kafka_headers else None
            )
            
            # 等待发送结果
            record_metadata = future.get(timeout=10)
            self.logger.debug(
                f"📤 消息已发送到 topic={record_metadata.topic}, "
                f"partition={record_metadata.partition}, "
                f"offset={record_metadata.offset}"
            )
            return True
        except KafkaError as e:
            error_msg = str(e) if e else "未知 Kafka 错误"
            self.logger.error(f"❌ Kafka 发送失败: {error_msg}", exc_info=True)
            return False
        except Exception as e:
            error_msg = str(e) if e else "未知错误"
            error_type = type(e).__name__
            self.logger.error(f"❌ 发送消息时发生未知错误 [{error_type}]: {error_msg}", exc_info=True)
            return False
    
    def send_batch(
        self,
        topic: str,
        data_list: list[Dict[str, Any]],
        key_prefix: Optional[str] = None,
        ensure_topic: bool = True,
        headers: Optional[Dict[str, str]] = None
    ) -> int:
        """
        批量发送数据
        
        Args:
            topic: Kafka topic 名称
            data_list: 数据列表
            key_prefix: 消息键前缀
            ensure_topic: 是否确保 topic 存在
            headers: 消息 headers（如 event_type），所有消息共用
        
        Returns:
            int: 成功发送的数量
        """
        if not self.enable_kafka or not self.producer:
            return 0
        
        # 确保 topic 存在（只检查一次）
        if ensure_topic:
            if not self.ensure_topic_exists(topic):
                self.logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，尝试直接发送（可能依赖自动创建）")
        
        success_count = 0
        for idx, data in enumerate(data_list):
            key = f"{key_prefix}_{idx}" if key_prefix else str(idx)
            # 批量发送时，只在第一次检查 topic，后续不再检查
            if self.send(topic, data, key, ensure_topic=(idx == 0 and ensure_topic), headers=headers):
                success_count += 1
        
        # 确保所有消息都发送完成
        if success_count > 0:
            self.producer.flush()
        
        self.logger.debug(f"📤 批量发送完成: {success_count}/{len(data_list)}")
        return success_count
    
    def close(self):
        """关闭 Kafka 连接"""
        if self.admin_client:
            try:
                self.admin_client.close()
                self.logger.debug("✅ Kafka AdminClient 已关闭")
            except Exception as e:
                self.logger.error(f"❌ 关闭 Kafka AdminClient 时出错: {e}")
        
        if self.producer:
            try:
                self.producer.close()
                self.logger.debug("✅ Kafka 生产者已关闭")
            except Exception as e:
                self.logger.error(f"❌ 关闭 Kafka 生产者时出错: {e}")

