"""
数据抓取模块

负责执行数据爬取
"""
from typing import Dict, List, Tuple

from fetch_server.configs import CONFIG
from fetch_server.utils import ensure_directory_exists
from fetch_server.analyzers.data_loader import DataLoader
from fetch_server.kafka import send_fetched_data_to_kafka

class Crawler:
    """数据抓取器"""
    
    def __init__(self, data_fetcher, request_interval: int):
        """
        初始化抓取器
        
        Args:
            data_fetcher: 数据获取器
            request_interval: 请求间隔（毫秒）
        """
        self.data_fetcher = data_fetcher
        self.request_interval = request_interval

    def crawl(self) -> Tuple[Dict, Dict, List]:
        """执行数据爬取"""
        ids = []
        for platform in CONFIG["PLATFORMS"]:
            if "name" in platform:
                ids.append((platform["id"], platform["name"]))
            else:
                ids.append(platform["id"])

        print(
            f"配置的监控平台: {[p.get('name', p['id']) for p in CONFIG['PLATFORMS']]}"
        )
        print(f"开始爬取数据，请求间隔 {self.request_interval} 毫秒")
        ensure_directory_exists("output")

        results, id_to_name, failed_ids = self.data_fetcher.crawl_websites(
            ids, self.request_interval
        )

        # 保存数据
        DataLoader.save_crawl_results(results, id_to_name, failed_ids)

        # 发送数据到 Kafka
        try:
            send_fetched_data_to_kafka(results, id_to_name, failed_ids)
        except Exception as e:
            print(f"⚠️  发送数据到 Kafka 时出错: {e}")

        return results, id_to_name, failed_ids

