# coding=utf-8

"""
Kafka 数据发送器

负责将抓取的新闻数据发送到 Kafka
"""
import uuid
from typing import Dict, List, Optional
from datetime import datetime

from crawl_server.configs import DatabaseConfig
from crawl_server.resources.kafka.client import KafkaClient
from crawl_server.resources.kafka.events import EventType, DataCrawlEvent, DataCrawlSessionEvent


def send_fetched_data_to_kafka(
    results: Dict,
    id_to_name: Dict,
    failed_ids: List,
    db_config: Optional[DatabaseConfig] = None,
    session_id: Optional[str] = None,
    started_at: Optional[str] = None,
    trigger_source: str = "scheduled",
    platforms: Optional[List] = None,  # 平台列表，可以是对象列表 [{"id": "...", "name": "..."}] 或 ID 列表 ["id1", "id2"]，存储时会转换为 ID 列表
    word_groups: Optional[List[Dict]] = None,
    filter_words: Optional[List[str]] = None,
) -> bool:
    """
    将抓取的新闻数据发送到 Kafka
    
    Args:
        results: 抓取结果，格式为 {platform_id: {title: {ranks: [], url: "", mobileUrl: ""}}}
        id_to_name: 平台ID到名称的映射
        failed_ids: 失败的平台ID列表
        db_config: 数据库配置对象
        session_id: 抓取会话ID（可选，如果不提供则自动生成）
        started_at: 开始时间（可选，如果不提供则使用当前时间）
        trigger_source: 触发来源（manual, scheduled, api）
        platforms: 使用的平台ID列表，格式: ["toutiao", "baidu", "weibo", ...]
        word_groups: 使用的频率词组列表
        filter_words: 使用的过滤词列表
    
    Returns:
        bool: 是否发送成功
    """
    # 检查是否启用 Kafka
    if not db_config or not db_config.KAFKA_ENABLED:
        return False
    
    # 获取 Kafka 配置
    bootstrap_servers = db_config.KAFKA_BOOTSTRAP_SERVERS
    # 使用事件 topic（参考 Sjgz-Backend 设计）
    event_topic = db_config.KAFKA_EVENT_TOPIC
    
    try:
        # 初始化 Kafka 客户端
        kafka_client = KafkaClient(
            bootstrap_servers=bootstrap_servers,
            enable_kafka=True
        )
        
        if not kafka_client.enable_kafka:
            print("⚠️  Kafka 未启用或初始化失败，跳过发送")
            return False
        
        # 确保事件 topic 存在
        if not kafka_client.ensure_topic_exists(event_topic):
            print(f"⚠️  Topic '{event_topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
        
        # 生成会话ID和时间戳
        if not session_id:
            session_id = f"crawl_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        if not started_at:
            started_at = datetime.now().isoformat()
        
        completed_at = datetime.now().isoformat()
        timestamp = completed_at
        
        # 准备要发送的事件数据
        events_list = []
        total_news_count = 0
        
        # 遍历所有平台的数据，创建 DataCrawlEvent（成功记录）
        for platform_id, titles_data in results.items():
            
            # 遍历该平台的所有新闻
            for title, title_data in titles_data.items():
                ranks = title_data.get("ranks", [])
                url = title_data.get("url", "")
                mobile_url = title_data.get("mobileUrl", "")
                
                # 使用与 HTML 生成相同的匹配逻辑（只保存匹配到的新闻）
                matched_group_keys = []
                if word_groups and title:
                    # 延迟导入，避免循环导入
                    from crawl_server.core.utils.statistics_utils import matches_word_groups
                    
                    # 使用统一的匹配函数（与 HTML 生成逻辑一致）
                    # 如果不匹配，跳过这个标题（与 HTML 生成逻辑一致）
                    if not matches_word_groups(title, word_groups, filter_words):
                        continue
                    
                    # 如果匹配成功，遍历所有 word_groups，找出所有匹配的组，收集 group_key
                    title_lower = str(title).lower()
                    matched_count = 0
                    for group in word_groups:
                        required_words = group.get("required", [])
                        normal_words = group.get("normal", [])
                        group_key = group.get("group_key", "")
                        
                        # 如果是"全部新闻"模式，所有标题都匹配第一个（唯一的）词组
                        if len(word_groups) == 1 and word_groups[0].get("group_key") == "全部新闻":
                            if group_key:
                                matched_group_keys.append(group_key)
                            break
                        else:
                            # 原有的匹配逻辑
                            if required_words:
                                all_required_present = all(
                                    req_word.lower() in title_lower for req_word in required_words
                                )
                                if not all_required_present:
                                    continue
                            
                            if normal_words:
                                any_normal_present = any(
                                    normal_word.lower() in title_lower for normal_word in normal_words
                                )
                                if not any_normal_present:
                                    continue
                            
                            # 匹配成功，收集该组的 group_key
                            if group_key:
                                matched_group_keys.append(group_key)
                                matched_count += 1
                    
                    # 调试：打印匹配结果（只打印前几条有匹配的）
                    if matched_count > 0 and total_news_count < 10:
                        print(f"🔍 [DEBUG] ✅ 标题匹配成功: {title[:50]}...")
                        print(f"🔍 [DEBUG]   匹配到的 word_group 数量: {matched_count}")
                        print(f"🔍 [DEBUG]   匹配到的 group_keys: {matched_group_keys}")
                
                # 只创建匹配到的事件对象（与 HTML 生成逻辑一致）
                event = DataCrawlEvent(
                    platform_id=platform_id,
                    title=title,
                    ranks=ranks,
                    rank=ranks[0] if ranks else None,
                    url=url,
                    mobile_url=mobile_url,
                    matched_group_keys=matched_group_keys,
                    is_success=1,
                    fetch_time=timestamp,
                )
                
                event_dict = event.to_dict()
                event_dict["session_id"] = session_id  # 添加 session_id 到事件数据
                events_list.append(event_dict)
                total_news_count += 1
        
        # 为失败的平台创建失败记录（记录平台信息和使用的配置）
        for failed_id in failed_ids:
            # 创建失败事件 - 记录平台信息
            failed_event = DataCrawlEvent(
                platform_id=failed_id,
                title=None,  # 失败时没有标题
                ranks=[],  # 失败时没有排名
                rank=None,  # 失败时没有排名
                url="",  # 失败时没有链接
                mobile_url="",  # 失败时没有移动端链接
                matched_group_keys=[],  # 失败时没有匹配到任何词组
                is_success=0,  # 标记为失败
                error_message=f"平台 {failed_id} 抓取失败",  # 失败原因
                fetch_time=timestamp,  # 抓取时间
            )
            
            failed_event_dict = failed_event.to_dict()
            failed_event_dict["session_id"] = session_id
            events_list.append(failed_event_dict)
        
        # 批量发送 data.crawl 事件到 Kafka（带 event_type header）
        if events_list:
            headers = {"event_type": EventType.DATA_CRAWL}
            success_count = kafka_client.send_batch(
                topic=event_topic,
                data_list=events_list,
                key_prefix="crawl",
                headers=headers
            )
            
            print(f"📤 已发送 {success_count}/{len(events_list)} 条 data.crawl 事件到 Kafka topic: {event_topic}")
        else:
            success_count = 0
        
        # 计算统计信息
        total_platforms = len(id_to_name)
        success_platforms = total_platforms - len(failed_ids)
        
        # 将 platforms 转换为 ID 列表（如果传入的是对象列表）
        platform_ids = []
        if platforms:
            for p in platforms:
                if isinstance(p, dict):
                    # 如果是对象，提取 id
                    platform_ids.append(p.get("id", p))
                else:
                    # 如果已经是 ID，直接使用
                    platform_ids.append(p)
        else:
            # 如果没有传入 platforms，从 id_to_name 中提取所有 ID
            platform_ids = list(id_to_name.keys())
        
        # 发送 data.crawl.session 事件（抓取会话完成）
        session_event = DataCrawlSessionEvent(
            session_id=session_id,
            trigger_source=trigger_source,
            total_platforms=total_platforms,
            success_count=success_platforms,
            failed_count=len(failed_ids),
            failed_ids=failed_ids,
            platforms=platform_ids,  # 只存储 ID 列表
            word_groups=word_groups or [],
            filter_words=filter_words or [],
            total_news_count=total_news_count,
            started_at=started_at,
            completed_at=completed_at,
            status="completed" if success_platforms > 0 else "failed",
        )
        
        session_event_dict = session_event.to_dict()
        
        session_headers = {"event_type": EventType.DATA_CRAWL_SESSION}
        session_success = kafka_client.send(
            topic=event_topic,
            data=session_event_dict,
            key=f"session_{session_id}",
            headers=session_headers
        )
        
        if session_success:
            print(f"📤 已发送 data.crawl.session 事件到 Kafka: session_id={session_id}, total_news={total_news_count}, success={success_platforms}/{total_platforms}, failed={len(failed_ids)}")
        else:
            print(f"⚠️  发送 data.crawl.session 事件失败: session_id={session_id}")
        
        kafka_client.close()
        return success_count > 0 or session_success
            
    except Exception as e:
        print(f"❌ 发送数据到 Kafka 时出错: {e}")
        return False

