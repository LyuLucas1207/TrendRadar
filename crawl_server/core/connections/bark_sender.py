"""
Bark发送器

用于发送消息到 Bark 平台
"""
import time
from typing import Dict, Optional

import requests

from crawl_server.configs import CrawlConfig
from crawl_server.core.connections.batch_utils import split_content_into_batches
from crawl_server.core.utils import strip_markdown

def send_to_bark(
    bark_url: str,
    report_data: Dict,
    report_type: str,
    update_info: Optional[Dict] = None,
    proxy_url: Optional[str] = None,
    mode: str = "daily",
    crawl_config: Optional[CrawlConfig] = None,
) -> bool:
    """
    发送到Bark（支持分批发送，使用纯文本格式）
    
    Args:
        crawl_config: 爬虫配置对象
    """
    if not crawl_config:
        raise RuntimeError("CrawlConfig 未提供，无法发送到Bark")
    
    proxies = None
    if proxy_url:
        proxies = {"http": proxy_url, "https": proxy_url}

    # 获取分批内容（Bark 限制为 3600 字节以避免 413 错误）
    batches = split_content_into_batches(
        report_data, "wework", update_info, max_bytes=crawl_config.BARK_BATCH_SIZE, mode=mode, crawl_config=crawl_config
    )

    total_batches = len(batches)
    print(f"Bark消息分为 {total_batches} 批次发送 [{report_type}]")

    # 反转批次顺序，使得在Bark客户端显示时顺序正确
    # Bark显示最新消息在上面，所以我们从最后一批开始推送
    reversed_batches = list(reversed(batches))

    print(f"Bark将按反向顺序推送（最后批次先推送），确保客户端显示顺序正确")

    # 逐批发送（反向顺序）
    success_count = 0
    for idx, batch_content in enumerate(reversed_batches, 1):
        # 计算正确的批次编号（用户视角的编号）
        actual_batch_num = total_batches - idx + 1

        # 添加批次标识（使用正确的批次编号）
        if total_batches > 1:
            batch_header = f"[第 {actual_batch_num}/{total_batches} 批次]\n\n"
            batch_content = batch_header + batch_content

        # 清理 markdown 语法（Bark 不支持 markdown）
        plain_content = strip_markdown(batch_content)

        batch_size = len(plain_content.encode("utf-8"))
        print(
            f"发送Bark第 {actual_batch_num}/{total_batches} 批次（推送顺序: {idx}/{total_batches}），大小：{batch_size} 字节 [{report_type}]"
        )

        # 检查消息大小（Bark使用APNs，限制4KB）
        if batch_size > 4096:
            print(
                f"警告：Bark第 {actual_batch_num}/{total_batches} 批次消息过大（{batch_size} 字节），可能被拒绝"
            )

        # 构建JSON payload
        payload = {
            "title": report_type,
            "body": plain_content,
            "sound": "default",
            "group": "TrendRadar",
        }

        try:
            response = requests.post(
                bark_url,
                json=payload,
                proxies=proxies,
                timeout=30,
            )

            if response.status_code == 200:
                result = response.json()
                if result.get("code") == 200:
                    print(f"Bark第 {actual_batch_num}/{total_batches} 批次发送成功 [{report_type}]")
                    success_count += 1
                    # 批次间间隔
                    if idx < total_batches:
                        time.sleep(crawl_config.BATCH_SEND_INTERVAL)
                else:
                    print(
                        f"Bark第 {actual_batch_num}/{total_batches} 批次发送失败 [{report_type}]，错误：{result.get('message', '未知错误')}"
                    )
            else:
                print(
                    f"Bark第 {actual_batch_num}/{total_batches} 批次发送失败 [{report_type}]，状态码：{response.status_code}"
                )
                try:
                    print(f"错误详情：{response.text}")
                except:
                    pass

        except requests.exceptions.ConnectTimeout:
            print(f"Bark第 {actual_batch_num}/{total_batches} 批次连接超时 [{report_type}]")
        except requests.exceptions.ReadTimeout:
            print(f"Bark第 {actual_batch_num}/{total_batches} 批次读取超时 [{report_type}]")
        except requests.exceptions.ConnectionError as e:
            print(f"Bark第 {actual_batch_num}/{total_batches} 批次连接错误 [{report_type}]：{e}")
        except Exception as e:
            print(f"Bark第 {actual_batch_num}/{total_batches} 批次发送异常 [{report_type}]：{e}")

    # 判断整体发送是否成功
    if success_count == total_batches:
        print(f"Bark所有 {total_batches} 批次发送完成 [{report_type}]")
        return True
    elif success_count > 0:
        print(f"Bark部分发送成功：{success_count}/{total_batches} 批次 [{report_type}]")
        return True  # 部分成功也视为成功
    else:
        print(f"Bark发送完全失败 [{report_type}]")
        return False


# === 主分析器 ===