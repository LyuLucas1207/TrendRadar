# coding=utf-8

"""
Kafka 数据发送器

负责将抓取的新闻数据发送到 Kafka
"""
from typing import Dict, List
from datetime import datetime

from fetch_server.configs import CONFIG
from fetch_server.kafka.client import KafkaClient


def send_fetched_data_to_kafka(
    results: Dict,
    id_to_name: Dict,
    failed_ids: List
) -> bool:
    """
    将抓取的新闻数据发送到 Kafka
    
    Args:
        results: 抓取结果，格式为 {platform_id: {title: {ranks: [], url: "", mobileUrl: ""}}}
        id_to_name: 平台ID到名称的映射
        failed_ids: 失败的平台ID列表
    
    Returns:
        bool: 是否发送成功
    """
    # 检查是否启用 Kafka
    enable_kafka = CONFIG.get("KAFKA_ENABLED", False)
    if not enable_kafka:
        return False
    
    # 获取 Kafka 配置
    bootstrap_servers = CONFIG.get("KAFKA_BOOTSTRAP_SERVERS", "Resources-Kafka:9092")
    topic = CONFIG.get("KAFKA_TOPIC", "trendradar.fetchdata")
    
    try:
        # 初始化 Kafka 客户端
        kafka_client = KafkaClient(
            bootstrap_servers=bootstrap_servers,
            enable_kafka=True
        )
        
        if not kafka_client.enable_kafka:
            print("⚠️  Kafka 未启用或初始化失败，跳过发送")
            return False
        
        # 确保主 topic 存在
        if not kafka_client.ensure_topic_exists(topic):
            print(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
        
        # 确保失败 topic 存在（如果需要）
        failed_topic = f"{topic}-failed"
        if failed_ids:
            kafka_client.ensure_topic_exists(failed_topic)
        
        # 准备要发送的数据
        news_list = []
        timestamp = datetime.now().isoformat()
        
        # 遍历所有平台的数据
        for platform_id, titles_data in results.items():
            platform_name = id_to_name.get(platform_id, platform_id)
            
            # 遍历该平台的所有新闻
            for title, title_data in titles_data.items():
                ranks = title_data.get("ranks", [])
                url = title_data.get("url", "")
                mobile_url = title_data.get("mobileUrl", "")
                
                # 构建新闻数据
                news_data = {
                    "platform_id": platform_id,
                    "platform_name": platform_name,
                    "title": title,
                    "ranks": ranks,
                    "rank": ranks[0] if ranks else None,  # 最高排名
                    "url": url,
                    "mobile_url": mobile_url,
                    "fetch_time": timestamp,
                }
                
                news_list.append(news_data)
        
        # 批量发送到 Kafka
        if news_list:
            success_count = kafka_client.send_batch(
                topic=topic,
                data_list=news_list,
                key_prefix="news"
            )
            
            print(f"📤 已发送 {success_count}/{len(news_list)} 条新闻到 Kafka topic: {topic}")
            
            # 发送失败的平台信息（如果有）
            if failed_ids:
                failed_data = {
                    "failed_platforms": failed_ids,
                    "fetch_time": timestamp,
                }
                kafka_client.send(
                    topic=f"{topic}-failed",
                    data=failed_data,
                    key="failed"
                )
                print(f"📤 已发送失败平台信息到 Kafka")
            
            kafka_client.close()
            return success_count > 0
        else:
            print("⚠️  没有新闻数据需要发送到 Kafka")
            kafka_client.close()
            return False
            
    except Exception as e:
        print(f"❌ 发送数据到 Kafka 时出错: {e}")
        return False

