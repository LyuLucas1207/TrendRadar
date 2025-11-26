"""
钉钉发送器

用于发送消息到 钉钉 平台
"""
import time
from typing import Dict, Optional

import requests

from fetch_server.configs import CONFIG
from fetch_server.connections.batch_utils import split_content_into_batches

def send_to_dingtalk(
    webhook_url: str,
    report_data: Dict,
    report_type: str,
    update_info: Optional[Dict] = None,
    proxy_url: Optional[str] = None,
    mode: str = "daily",
) -> bool:
    """发送到钉钉（支持分批发送）"""
    headers = {"Content-Type": "application/json"}
    proxies = None
    if proxy_url:
        proxies = {"http": proxy_url, "https": proxy_url}

    # 获取分批内容，使用钉钉专用的批次大小
    batches = split_content_into_batches(
        report_data,
        "dingtalk",
        update_info,
        max_bytes=CONFIG.get("DINGTALK_BATCH_SIZE", 20000),
        mode=mode,
    )

    print(f"钉钉消息分为 {len(batches)} 批次发送 [{report_type}]")

    # 逐批发送
    for i, batch_content in enumerate(batches, 1):
        batch_size = len(batch_content.encode("utf-8"))
        print(
            f"发送钉钉第 {i}/{len(batches)} 批次，大小：{batch_size} 字节 [{report_type}]"
        )

        # 添加批次标识
        if len(batches) > 1:
            batch_header = f"**[第 {i}/{len(batches)} 批次]**\n\n"
            # 将批次标识插入到适当位置（在标题之后）
            if "📊 **热点词汇统计**" in batch_content:
                batch_content = batch_content.replace(
                    "📊 **热点词汇统计**\n\n", f"📊 **热点词汇统计** {batch_header}\n\n"
                )
            else:
                # 如果没有统计标题，直接在开头添加
                batch_content = batch_header + batch_content

        payload = {
            "msgtype": "markdown",
            "markdown": {
                "title": f"TrendRadar 热点分析报告 - {report_type}",
                "text": batch_content,
            },
        }

        try:
            response = requests.post(
                webhook_url, headers=headers, json=payload, proxies=proxies, timeout=30
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("errcode") == 0:
                    print(f"钉钉第 {i}/{len(batches)} 批次发送成功 [{report_type}]")
                    # 批次间间隔
                    if i < len(batches):
                        time.sleep(CONFIG["BATCH_SEND_INTERVAL"])
                else:
                    print(
                        f"钉钉第 {i}/{len(batches)} 批次发送失败 [{report_type}]，错误：{result.get('errmsg')}"
                    )
                    return False
            else:
                print(
                    f"钉钉第 {i}/{len(batches)} 批次发送失败 [{report_type}]，状态码：{response.status_code}"
                )
                return False
        except Exception as e:
            print(f"钉钉第 {i}/{len(batches)} 批次发送出错 [{report_type}]：{e}")
            return False

    print(f"钉钉所有 {len(batches)} 批次发送完成 [{report_type}]")
    return True


# strip_markdown 已移至 fetch_server.utils.string_utils