"""
通知发送模块

负责通知发送逻辑
"""
from typing import Dict, List, Optional

from fetch_server.configs import CONFIG
from fetch_server.connections import send_to_notifications
from fetch_server.analyzers.config_checker import ConfigChecker


class Notifier:
    """通知发送器"""
    
    def __init__(self, report_mode: str, proxy_url: Optional[str] = None):
        """
        初始化通知发送器
        
        Args:
            report_mode: 报告模式
            proxy_url: 代理URL
        """
        self.report_mode = report_mode
        self.proxy_url = proxy_url

    def send_if_needed(
        self,
        stats: List[Dict],
        report_type: str,
        mode: str,
        update_info: Optional[Dict] = None,
        failed_ids: Optional[List] = None,
        new_titles: Optional[Dict] = None,
        id_to_name: Optional[Dict] = None,
        html_file_path: Optional[str] = None,
    ) -> bool:
        """统一的通知发送逻辑，包含所有判断条件"""
        has_notification = ConfigChecker.has_notification_configured()

        if (
            CONFIG["ENABLE_NOTIFICATION"]
            and has_notification
            and ConfigChecker.has_valid_content(self.report_mode, stats, new_titles)
        ):
            send_to_notifications(
                stats,
                failed_ids or [],
                report_type,
                new_titles,
                id_to_name,
                update_info,
                self.proxy_url,
                mode=mode,
                html_file_path=html_file_path,
            )
            return True
        elif CONFIG["ENABLE_NOTIFICATION"] and not has_notification:
            print("⚠️ 警告：通知功能已启用但未配置任何通知渠道，将跳过通知发送")
        elif not CONFIG["ENABLE_NOTIFICATION"]:
            print(f"跳过{report_type}通知：通知功能已禁用")
        elif (
            CONFIG["ENABLE_NOTIFICATION"]
            and has_notification
            and not ConfigChecker.has_valid_content(self.report_mode, stats, new_titles)
        ):
            mode_strategy = ConfigChecker.get_mode_strategy(self.report_mode)
            if "实时" in report_type:
                print(
                    f"跳过实时推送通知：{mode_strategy['mode_name']}下未检测到匹配的新闻"
                )
            else:
                print(
                    f"跳过{mode_strategy['summary_report_type']}通知：未匹配到有效的新闻内容"
                )

        return False

