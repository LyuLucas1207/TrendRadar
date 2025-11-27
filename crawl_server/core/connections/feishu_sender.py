"""
飞书发送器

用于发送消息到 飞书 平台
"""
import time
from typing import Dict, Optional

import requests

from crawl_server.configs import CrawlConfig
from crawl_server.core.connections.batch_utils import split_content_into_batches
from crawl_server.core.utils import get_beijing_time

def send_to_feishu(
    webhook_url: str,
    report_data: Dict,
    report_type: str,
    update_info: Optional[Dict] = None,
    proxy_url: Optional[str] = None,
    mode: str = "daily",
    crawl_config: Optional[CrawlConfig] = None,
) -> bool:
    """
    发送到飞书（支持分批发送）
    
    Args:
        crawl_config: 爬虫配置对象
    """
    if not crawl_config:
        raise RuntimeError("CrawlConfig 未提供，无法发送到飞书")
    
    headers = {"Content-Type": "application/json"}
    proxies = None
    if proxy_url:
        proxies = {"http": proxy_url, "https": proxy_url}

    # 获取分批内容，使用飞书专用的批次大小
    batches = split_content_into_batches(
        report_data,
        "feishu",
        update_info,
        max_bytes=crawl_config.FEISHU_BATCH_SIZE,
        mode=mode,
        crawl_config=crawl_config,
    )

    print(f"飞书消息分为 {len(batches)} 批次发送 [{report_type}]")

    # 逐批发送
    for i, batch_content in enumerate(batches, 1):
        batch_size = len(batch_content.encode("utf-8"))
        print(
            f"发送飞书第 {i}/{len(batches)} 批次，大小：{batch_size} 字节 [{report_type}]"
        )

        # 添加批次标识
        if len(batches) > 1:
            batch_header = f"**[第 {i}/{len(batches)} 批次]**\n\n"
            # 将批次标识插入到适当位置（在统计标题之后）
            if "📊 **热点词汇统计**" in batch_content:
                batch_content = batch_content.replace(
                    "📊 **热点词汇统计**\n\n", f"📊 **热点词汇统计** {batch_header}"
                )
            else:
                # 如果没有统计标题，直接在开头添加
                batch_content = batch_header + batch_content

        total_titles = sum(
            len(stat["titles"]) for stat in report_data["stats"] if stat["count"] > 0
        )
        now = get_beijing_time()

        payload = {
            "msg_type": "text",
            "content": {
                "total_titles": total_titles,
                "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
                "report_type": report_type,
                "text": batch_content,
            },
        }

        try:
            response = requests.post(
                webhook_url, headers=headers, json=payload, proxies=proxies, timeout=30
            )
            if response.status_code == 200:
                result = response.json()
                # 检查飞书的响应状态
                if result.get("StatusCode") == 0 or result.get("code") == 0:
                    print(f"飞书第 {i}/{len(batches)} 批次发送成功 [{report_type}]")
                    # 批次间间隔
                    if i < len(batches):
                        time.sleep(crawl_config.BATCH_SEND_INTERVAL)
                else:
                    error_msg = result.get("msg") or result.get("StatusMessage", "未知错误")
                    print(
                        f"飞书第 {i}/{len(batches)} 批次发送失败 [{report_type}]，错误：{error_msg}"
                    )
                    return False
            else:
                print(
                    f"飞书第 {i}/{len(batches)} 批次发送失败 [{report_type}]，状态码：{response.status_code}"
                )
                return False
        except Exception as e:
            print(f"飞书第 {i}/{len(batches)} 批次发送出错 [{report_type}]：{e}")
            return False

    print(f"飞书所有 {len(batches)} 批次发送完成 [{report_type}]")
    return True