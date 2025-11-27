"""
通知发送管理器

统一管理所有通知平台的发送
"""
from typing import Dict, List, Optional

from crawl_server.configs import CrawlConfig
from crawl_server.core.connections.bark_sender import send_to_bark
from crawl_server.core.connections.dingtalk_sender import send_to_dingtalk
from crawl_server.core.connections.email_sender import send_to_email
from crawl_server.core.connections.feishu_sender import send_to_feishu
from crawl_server.core.connections.ntfy_sender import send_to_ntfy
from crawl_server.core.connections.telegram_sender import send_to_telegram
from crawl_server.core.connections.wework_sender import send_to_wework
from crawl_server.core.connections.push_manager import PushRecordManager
from crawl_server.core.utils import get_beijing_time, prepare_report_data

def send_to_notifications(
    stats: List[Dict],
    failed_ids: Optional[List] = None,
    report_type: str = "当日汇总",
    new_titles: Optional[Dict] = None,
    id_to_name: Optional[Dict] = None,
    update_info: Optional[Dict] = None,
    proxy_url: Optional[str] = None,
    mode: str = "daily",
    html_file_path: Optional[str] = None,
    crawl_config: Optional[CrawlConfig] = None,
) -> Dict[str, bool]:
    """
    发送数据到多个通知平台
    
    Args:
        crawl_config: 爬虫配置对象
    """
    if not crawl_config:
        raise RuntimeError("CrawlConfig 未提供，无法发送通知")
    
    results = {}

    if crawl_config.PUSH_WINDOW.ENABLED:
        push_manager = PushRecordManager(crawl_config=crawl_config)
        time_range_start = crawl_config.PUSH_WINDOW.TIME_RANGE.START
        time_range_end = crawl_config.PUSH_WINDOW.TIME_RANGE.END

        if not push_manager.is_in_time_range(time_range_start, time_range_end):
            now = get_beijing_time()
            print(
                f"推送窗口控制：当前时间 {now.strftime('%H:%M')} 不在推送时间窗口 {time_range_start}-{time_range_end} 内，跳过推送"
            )
            return results

        if crawl_config.PUSH_WINDOW.ONCE_PER_DAY:
            if push_manager.has_pushed_today():
                print(f"推送窗口控制：今天已推送过，跳过本次推送")
                return results
            else:
                print(f"推送窗口控制：今天首次推送")

    report_data = prepare_report_data(stats, failed_ids, new_titles, id_to_name, mode, crawl_config=crawl_config)

    feishu_url = crawl_config.FEISHU_WEBHOOK_URL
    dingtalk_url = crawl_config.DINGTALK_WEBHOOK_URL
    wework_url = crawl_config.WEWORK_WEBHOOK_URL
    telegram_token = crawl_config.TELEGRAM_BOT_TOKEN
    telegram_chat_id = crawl_config.TELEGRAM_CHAT_ID
    email_from = crawl_config.EMAIL_FROM
    email_password = crawl_config.EMAIL_PASSWORD
    email_to = crawl_config.EMAIL_TO
    email_smtp_server = crawl_config.EMAIL_SMTP_SERVER
    email_smtp_port = crawl_config.EMAIL_SMTP_PORT
    ntfy_server_url = crawl_config.NTFY_SERVER_URL
    ntfy_topic = crawl_config.NTFY_TOPIC
    ntfy_token = crawl_config.NTFY_TOKEN
    bark_url = crawl_config.BARK_URL

    update_info_to_send = update_info if crawl_config.SHOW_VERSION_UPDATE else None

    # 发送到飞书
    if feishu_url:
        results["feishu"] = send_to_feishu(
            feishu_url, report_data, report_type, update_info_to_send, proxy_url, mode, crawl_config=crawl_config
        )

    # 发送到钉钉
    if dingtalk_url:
        results["dingtalk"] = send_to_dingtalk(
            dingtalk_url, report_data, report_type, update_info_to_send, proxy_url, mode, crawl_config=crawl_config
        )

    # 发送到企业微信
    if wework_url:
        results["wework"] = send_to_wework(
            wework_url, report_data, report_type, update_info_to_send, proxy_url, mode, crawl_config=crawl_config
        )

    # 发送到 Telegram
    if telegram_token and telegram_chat_id:
        results["telegram"] = send_to_telegram(
            telegram_token,
            telegram_chat_id,
            report_data,
            report_type,
            update_info_to_send,
            proxy_url,
            mode,
            crawl_config=crawl_config,
        )

    # 发送到 ntfy
    if ntfy_server_url and ntfy_topic:
        results["ntfy"] = send_to_ntfy(
            ntfy_server_url,
            ntfy_topic,
            ntfy_token,
            report_data,
            report_type,
            update_info_to_send,
            proxy_url,
            mode,
            crawl_config=crawl_config,
        )

    # 发送到 Bark
    if bark_url:
        results["bark"] = send_to_bark(
            bark_url,
            report_data,
            report_type,
            update_info_to_send,
            proxy_url,
            mode,
            crawl_config=crawl_config,
        )

    # 发送邮件
    if email_from and email_password and email_to:
        results["email"] = send_to_email(
            email_from,
            email_password,
            email_to,
            report_type,
            html_file_path,
            email_smtp_server,
            email_smtp_port,
        )

    if not results:
        print("未配置任何通知渠道，跳过通知发送")

    # 如果成功发送了任何通知，且启用了每天只推一次，则记录推送
    if (
        crawl_config.PUSH_WINDOW.ENABLED
        and crawl_config.PUSH_WINDOW.ONCE_PER_DAY
        and any(results.values())
    ):
        push_manager = PushRecordManager(crawl_config=crawl_config)
        push_manager.record_push(report_type)

    return results