"""
企业微信发送器

用于发送消息到 企业微信 平台
"""
import time
from typing import Dict, Optional

import requests

from fetch_server.configs import CONFIG
from fetch_server.connections.batch_utils import split_content_into_batches
from fetch_server.utils import strip_markdown

def send_to_wework(
    webhook_url: str,
    report_data: Dict,
    report_type: str,
    update_info: Optional[Dict] = None,
    proxy_url: Optional[str] = None,
    mode: str = "daily",
) -> bool:
    """发送到企业微信（支持分批发送，支持 markdown 和 text 两种格式）"""
    headers = {"Content-Type": "application/json"}
    proxies = None
    if proxy_url:
        proxies = {"http": proxy_url, "https": proxy_url}

    # 获取消息类型配置（markdown 或 text）
    msg_type = CONFIG.get("WEWORK_MSG_TYPE", "markdown").lower()
    is_text_mode = msg_type == "text"

    if is_text_mode:
        print(f"企业微信使用 text 格式（个人微信模式）[{report_type}]")
    else:
        print(f"企业微信使用 markdown 格式（群机器人模式）[{report_type}]")

    # 获取分批内容
    batches = split_content_into_batches(report_data, "wework", update_info, mode=mode)

    print(f"企业微信消息分为 {len(batches)} 批次发送 [{report_type}]")

    # 逐批发送
    for i, batch_content in enumerate(batches, 1):
        # 添加批次标识
        if len(batches) > 1:
            if is_text_mode:
                batch_header = f"[第 {i}/{len(batches)} 批次]\n\n"
            else:
                batch_header = f"**[第 {i}/{len(batches)} 批次]**\n\n"
            batch_content = batch_header + batch_content

        # 根据消息类型构建 payload
        if is_text_mode:
            # text 格式：去除 markdown 语法
            plain_content = strip_markdown(batch_content)
            payload = {"msgtype": "text", "text": {"content": plain_content}}
            batch_size = len(plain_content.encode("utf-8"))
        else:
            # markdown 格式：保持原样
            payload = {"msgtype": "markdown", "markdown": {"content": batch_content}}
            batch_size = len(batch_content.encode("utf-8"))

        print(
            f"发送企业微信第 {i}/{len(batches)} 批次，大小：{batch_size} 字节 [{report_type}]"
        )

        try:
            response = requests.post(
                webhook_url, headers=headers, json=payload, proxies=proxies, timeout=30
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("errcode") == 0:
                    print(f"企业微信第 {i}/{len(batches)} 批次发送成功 [{report_type}]")
                    # 批次间间隔
                    if i < len(batches):
                        time.sleep(CONFIG["BATCH_SEND_INTERVAL"])
                else:
                    print(
                        f"企业微信第 {i}/{len(batches)} 批次发送失败 [{report_type}]，错误：{result.get('errmsg')}"
                    )
                    return False
            else:
                print(
                    f"企业微信第 {i}/{len(batches)} 批次发送失败 [{report_type}]，状态码：{response.status_code}"
                )
                return False
        except Exception as e:
            print(f"企业微信第 {i}/{len(batches)} 批次发送出错 [{report_type}]：{e}")
            return False

    print(f"企业微信所有 {len(batches)} 批次发送完成 [{report_type}]")
    return True