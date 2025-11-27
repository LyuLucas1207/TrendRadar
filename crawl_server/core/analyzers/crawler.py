"""
数据抓取模块

负责执行数据爬取
"""
import uuid
from typing import Dict, List, Tuple, Optional
from datetime import datetime

from crawl_server.configs import DatabaseConfig
from crawl_server.core.utils import ensure_directory_exists
from crawl_server.core.analyzers.data_loader import DataLoader
from crawl_server.resources.kafka import send_fetched_data_to_kafka

class Crawler:
    """数据抓取器"""
    
    def __init__(self, data_fetcher, request_interval: int, db_config: Optional[DatabaseConfig] = None):
        """
        初始化抓取器
        
        Args:
            data_fetcher: 数据获取器
            request_interval: 请求间隔（毫秒）
            db_config: 数据库配置对象
        """
        self.data_fetcher = data_fetcher
        self.request_interval = request_interval
        self.db_config = db_config

    def crawl(
        self, 
        platforms: Optional[List[Dict]] = None,
        trigger_source: str = "scheduled",
        word_groups: Optional[List[Dict]] = None,
        filter_words: Optional[List[str]] = None,
    ) -> Tuple[Dict, Dict, List]:
        """
        执行数据爬取
        
        Args:
            platforms: 平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
                      必须从数据库获取，不能为 None
            trigger_source: 触发来源（manual, scheduled, api）
            word_groups: 使用的频率词组列表
            filter_words: 使用的过滤词列表
        
        Returns:
            (results, id_to_name, failed_ids) 元组
        """
        # 使用传入的 platforms，必须从数据库获取
        if platforms is None:
            raise ValueError("platforms 参数不能为 None，必须从数据库获取")
        
        # 生成会话ID和开始时间
        session_id = f"crawl_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        started_at = datetime.now().isoformat()
        
        ids = []
        for platform in platforms:
            if "name" in platform:
                ids.append((platform["id"], platform["name"]))
            else:
                ids.append(platform["id"])

        print(
            f"配置的监控平台: {[p.get('name', p['id']) for p in platforms]}"
        )
        print(f"开始爬取数据，请求间隔 {self.request_interval} 毫秒")
        print(f"抓取会话ID: {session_id}")
        ensure_directory_exists("output")

        results, id_to_name, failed_ids = self.data_fetcher.crawl_websites(
            ids, self.request_interval
        )

        # 保存数据
        DataLoader.save_crawl_results(results, id_to_name, failed_ids)

        # 发送数据到 Kafka（通过 Pipeline Repository）
        # 注意：这里暂时保留原有逻辑，未来可以改为通过 Service 调用
        try:
            send_fetched_data_to_kafka(
                results, 
                id_to_name, 
                failed_ids, 
                db_config=self.db_config,
                session_id=session_id,
                started_at=started_at,
                trigger_source=trigger_source,
                platforms=platforms,
                word_groups=word_groups,
                filter_words=filter_words
            )
        except Exception as e:
            print(f"⚠️  发送数据到 Kafka 时出错: {e}")

        return results, id_to_name, failed_ids

