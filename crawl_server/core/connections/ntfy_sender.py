"""
ntfy发送器

用于发送消息到 ntfy 平台
"""
import time
from typing import Dict, Optional

import requests

from crawl_server.configs import CrawlConfig
from crawl_server.core.connections.batch_utils import split_content_into_batches

def send_to_ntfy(
    server_url: str,
    topic: str,
    token: Optional[str],
    report_data: Dict,
    report_type: str,
    update_info: Optional[Dict] = None,
    proxy_url: Optional[str] = None,
    mode: str = "daily",
    crawl_config: Optional[CrawlConfig] = None,
) -> bool:
    """
    发送到ntfy（支持分批发送，严格遵守4KB限制）
    
    Args:
        crawl_config: 爬虫配置对象
    """
    # 避免 HTTP header 编码问题
    report_type_en_map = {
        "当日汇总": "Daily Summary",
        "当前榜单汇总": "Current Ranking",
        "增量更新": "Incremental Update",
        "实时增量": "Realtime Incremental", 
        "实时当前榜单": "Realtime Current Ranking",  
    }
    report_type_en = report_type_en_map.get(report_type, "News Report") 

    headers = {
        "Content-Type": "text/plain; charset=utf-8",
        "Markdown": "yes",
        "Title": report_type_en,
        "Priority": "default",
        "Tags": "news",
    }

    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    # 构建完整URL，确保格式正确
    base_url = server_url.rstrip("/")
    if not base_url.startswith(("http://", "https://")):
        base_url = f"https://{base_url}"
    url = f"{base_url}/{topic}"

    proxies = None
    if proxy_url:
        proxies = {"http": proxy_url, "https": proxy_url}

    # 获取分批内容，使用ntfy专用的4KB限制
    batches = split_content_into_batches(
        report_data, "ntfy", update_info, max_bytes=3800, mode=mode, crawl_config=crawl_config
    )

    total_batches = len(batches)
    print(f"ntfy消息分为 {total_batches} 批次发送 [{report_type}]")

    # 反转批次顺序，使得在ntfy客户端显示时顺序正确
    # ntfy显示最新消息在上面，所以我们从最后一批开始推送
    reversed_batches = list(reversed(batches))
    
    print(f"ntfy将按反向顺序推送（最后批次先推送），确保客户端显示顺序正确")

    # 逐批发送（反向顺序）
    success_count = 0
    for idx, batch_content in enumerate(reversed_batches, 1):
        # 计算正确的批次编号（用户视角的编号）
        actual_batch_num = total_batches - idx + 1
        
        batch_size = len(batch_content.encode("utf-8"))
        print(
            f"发送ntfy第 {actual_batch_num}/{total_batches} 批次（推送顺序: {idx}/{total_batches}），大小：{batch_size} 字节 [{report_type}]"
        )

        # 检查消息大小，确保不超过4KB
        if batch_size > 4096:
            print(f"警告：ntfy第 {actual_batch_num} 批次消息过大（{batch_size} 字节），可能被拒绝")

        # 添加批次标识（使用正确的批次编号）
        current_headers = headers.copy()
        if total_batches > 1:
            batch_header = f"**[第 {actual_batch_num}/{total_batches} 批次]**\n\n"
            batch_content = batch_header + batch_content
            current_headers["Title"] = (
                f"{report_type_en} ({actual_batch_num}/{total_batches})"
            )

        try:
            response = requests.post(
                url,
                headers=current_headers,
                data=batch_content.encode("utf-8"),
                proxies=proxies,
                timeout=30,
            )

            if response.status_code == 200:
                print(f"ntfy第 {actual_batch_num}/{total_batches} 批次发送成功 [{report_type}]")
                success_count += 1
                if idx < total_batches:
                    # 公共服务器建议 2-3 秒，自托管可以更短
                    interval = 2 if "ntfy.sh" in server_url else 1
                    time.sleep(interval)
            elif response.status_code == 429:
                print(
                    f"ntfy第 {actual_batch_num}/{total_batches} 批次速率限制 [{report_type}]，等待后重试"
                )
                time.sleep(10)  # 等待10秒后重试
                # 重试一次
                retry_response = requests.post(
                    url,
                    headers=current_headers,
                    data=batch_content.encode("utf-8"),
                    proxies=proxies,
                    timeout=30,
                )
                if retry_response.status_code == 200:
                    print(f"ntfy第 {actual_batch_num}/{total_batches} 批次重试成功 [{report_type}]")
                    success_count += 1
                else:
                    print(
                        f"ntfy第 {actual_batch_num}/{total_batches} 批次重试失败，状态码：{retry_response.status_code}"
                    )
            elif response.status_code == 413:
                print(
                    f"ntfy第 {actual_batch_num}/{total_batches} 批次消息过大被拒绝 [{report_type}]，消息大小：{batch_size} 字节"
                )
            else:
                print(
                    f"ntfy第 {actual_batch_num}/{total_batches} 批次发送失败 [{report_type}]，状态码：{response.status_code}"
                )
                try:
                    print(f"错误详情：{response.text}")
                except:
                    pass

        except requests.exceptions.ConnectTimeout:
            print(f"ntfy第 {actual_batch_num}/{total_batches} 批次连接超时 [{report_type}]")
        except requests.exceptions.ReadTimeout:
            print(f"ntfy第 {actual_batch_num}/{total_batches} 批次读取超时 [{report_type}]")
        except requests.exceptions.ConnectionError as e:
            print(f"ntfy第 {actual_batch_num}/{total_batches} 批次连接错误 [{report_type}]：{e}")
        except Exception as e:
            print(f"ntfy第 {actual_batch_num}/{total_batches} 批次发送异常 [{report_type}]：{e}")

    # 判断整体发送是否成功
    if success_count == total_batches:
        print(f"ntfy所有 {total_batches} 批次发送完成 [{report_type}]")
        return True
    elif success_count > 0:
        print(f"ntfy部分发送成功：{success_count}/{total_batches} 批次 [{report_type}]")
        return True  # 部分成功也视为成功
    else:
        print(f"ntfy发送完全失败 [{report_type}]")
        return False