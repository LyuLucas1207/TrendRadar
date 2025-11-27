# coding=utf-8

"""
抓取数据 Pipeline 仓库

负责将抓取的数据发送到 Kafka（Pipeline）
"""
import logging
from typing import Dict, List, Optional
from datetime import datetime
from crawl_server.resources.kafka.client import KafkaClient
from crawl_server.resources.kafka.events import EventType, DataCrawlEvent
from crawl_server.configs import DatabaseConfig

logger = logging.getLogger(__name__)


class CrawlPipeline:
    """抓取数据 Pipeline 仓库（Kafka）"""
    
    def __init__(self, kafka_client: Optional[KafkaClient] = None, db_config: Optional[DatabaseConfig] = None):
        """
        初始化 Kafka 仓库
        
        Args:
            kafka_client: Kafka 客户端（可选，如果不提供则自动创建）
            db_config: 数据库配置对象
        """
        self.kafka_client = kafka_client
        self.db_config = db_config
        self._client_owned = kafka_client is None
    
    def _get_client(self) -> Optional[KafkaClient]:
        """获取 Kafka 客户端"""
        if self.kafka_client:
            return self.kafka_client
        
        if not self.db_config or not self.db_config.KAFKA_ENABLED:
            return None
        
        try:
            bootstrap_servers = self.db_config.KAFKA_BOOTSTRAP_SERVERS or "Resources-Kafka:9092"
            self.kafka_client = KafkaClient(
                bootstrap_servers=bootstrap_servers,
                enable_kafka=True
            )
            return self.kafka_client if self.kafka_client.enable_kafka else None
        except Exception as e:
            logger.error(f"❌ 创建 Kafka 客户端失败: {e}")
            return None
    
    def send_crawl_data(
        self,
        results: Dict,
        id_to_name: Dict,
        failed_ids: List
    ) -> bool:
        """
        发送抓取数据事件（data.crawl）
        
        Args:
            results: 抓取结果
            id_to_name: 平台ID到名称的映射
            failed_ids: 失败的平台ID列表
        
        Returns:
            是否发送成功
        """
        client = self._get_client()
        if not client:
            return False
        
        try:
            if not self.db_config:
                raise RuntimeError("DatabaseConfig 未提供，无法发送数据")
            event_topic = self.db_config.KAFKA_EVENT_TOPIC or "trendradar.crawl_server"
            
            # 确保 topic 存在
            if not client.ensure_topic_exists(event_topic):
                logger.warning(f"⚠️  Topic '{event_topic}' 不存在且创建失败，但会尝试发送")
            
            # 准备事件数据
            events_list = []
            timestamp = datetime.now().isoformat()
            
            # 遍历所有平台的数据，创建 DataCrawlEvent
            for platform_id, titles_data in results.items():
                for title, title_data in titles_data.items():
                    ranks = title_data.get("ranks", [])
                    url = title_data.get("url", "")
                    mobile_url = title_data.get("mobileUrl", "")
                    # 从 title_data 中获取匹配到的 group_keys（如果有）
                    # 注意：如果 title_data 中存储的是旧的 word_groups（词列表），需要转换为 group_keys
                    matched_group_keys = title_data.get("matched_group_keys", [])
                    # 兼容旧格式：如果存在 word_groups 但没有 matched_group_keys，则设为空数组
                    # （因为无法从词列表反推出 group_key，所以设为空）
                    if not matched_group_keys and title_data.get("word_groups"):
                        matched_group_keys = []
                    
                    event = DataCrawlEvent(
                        platform_id=platform_id,
                        title=title,
                        ranks=ranks,
                        rank=ranks[0] if ranks else None,
                        url=url,
                        mobile_url=mobile_url,
                        matched_group_keys=matched_group_keys,
                        fetch_time=timestamp,
                    )
                    events_list.append(event.to_dict())
            
            # 批量发送事件
            if events_list:
                headers = {"event_type": EventType.DATA_CRAWL}
                success_count = client.send_batch(
                    topic=event_topic,
                    data_list=events_list,
                    key_prefix="crawl",
                    headers=headers
                )
                logger.info(f"📤 已发送 {success_count}/{len(events_list)} 条 data.crawl 事件")
                
                if self._client_owned and client:
                    client.close()
                return success_count > 0
            else:
                logger.warning("⚠️  没有数据需要发送")
                if self._client_owned and client:
                    client.close()
                return False
                
        except Exception as e:
            logger.error(f"❌ 发送抓取数据失败: {e}", exc_info=True)
            if self._client_owned and client:
                client.close()
            return False
    
    def close(self):
        """关闭连接（如果客户端是自己创建的）"""
        if self._client_owned and self.kafka_client:
            self.kafka_client.close()

