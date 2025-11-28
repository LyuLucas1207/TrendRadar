"""
报告生成模块

负责生成汇总报告和HTML
"""
from typing import Dict, List, Optional

from crawl_server.core.analyzers.config_checker import ConfigChecker
from crawl_server.core.analyzers.data_loader import DataLoader
from crawl_server.core.analyzers.pipeline import AnalysisPipeline
from crawl_server.core.analyzers.notifier import Notifier


class ReportGenerator:
    """报告生成器"""
    
    def __init__(
        self,
        report_mode: str,
        rank_threshold: int,
        update_info: Optional[dict] = None,
        proxy_url: Optional[str] = None,
    ):
        """
        初始化报告生成器
        
        Args:
            report_mode: 报告模式
            rank_threshold: 排名阈值
            update_info: 版本更新信息
            proxy_url: 代理URL
        """
        self.report_mode = report_mode
        self.pipeline = AnalysisPipeline(rank_threshold, update_info)
        self.notifier = Notifier(report_mode, proxy_url)
        self.update_info = update_info

    def generate_summary_report(self, mode_strategy: Dict, platforms=None, word_groups=None, filter_words=None) -> Optional[str]:
        """生成汇总报告（带通知）"""
        summary_type = (
            "当前榜单汇总" if mode_strategy["summary_mode"] == "current" else "当日汇总"
        )
        print(f"生成{summary_type}报告...")

        # 加载分析数据
        analysis_data = DataLoader.load_analysis_data(platforms=platforms, word_groups=word_groups, filter_words=filter_words)
        if not analysis_data:
            return None

        all_results, id_to_name, title_info, new_titles, word_groups, filter_words = (
            analysis_data
        )

        # 运行分析流水线
        stats, html_file = self.pipeline.run(
            all_results,
            mode_strategy["summary_mode"],
            title_info,
            new_titles,
            word_groups,
            filter_words,
            id_to_name,
            is_daily_summary=True,
        )

        print(f"{summary_type}报告已生成: {html_file}")

        # 发送通知
        self.notifier.send_if_needed(
            stats,
            mode_strategy["summary_report_type"],
            mode_strategy["summary_mode"],
            update_info=self.update_info,
            failed_ids=[],
            new_titles=new_titles,
            id_to_name=id_to_name,
            html_file_path=html_file,
        )

        return html_file

    def generate_summary_html(self, mode: str = "daily", platforms=None, word_groups=None, filter_words=None) -> Optional[str]:
        """生成汇总HTML"""
        summary_type = "当前榜单汇总" if mode == "current" else "当日汇总"
        print(f"生成{summary_type}HTML...")

        # 加载分析数据
        analysis_data = DataLoader.load_analysis_data(platforms=platforms, word_groups=word_groups, filter_words=filter_words)
        if not analysis_data:
            return None

        all_results, id_to_name, title_info, new_titles, word_groups, filter_words = (
            analysis_data
        )

        # 运行分析流水线
        _, html_file = self.pipeline.run(
            all_results,
            mode,
            title_info,
            new_titles,
            word_groups,
            filter_words,
            id_to_name,
            is_daily_summary=True,
        )

        print(f"{summary_type}HTML已生成: {html_file}")
        return html_file

