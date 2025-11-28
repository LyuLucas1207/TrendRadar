"""
模式执行模块

负责执行不同模式的策略逻辑
"""
import webbrowser
from pathlib import Path
from typing import Dict, List, Optional

from crawl_server.configs import CrawlConfig
from crawl_server.core.data import detect_latest_new_titles
from crawl_server.core.analyzers.data_loader import DataLoader
from crawl_server.core.analyzers.pipeline import AnalysisPipeline
from crawl_server.core.analyzers.notifier import Notifier
from crawl_server.core.analyzers.report_generator import ReportGenerator
from crawl_server.core.utils import load_frequency_words


class ModeExecutor:
    """模式执行器"""
    
    def __init__(
        self,
        report_mode: str,
        rank_threshold: int,
        update_info: Optional[dict] = None,
        proxy_url: Optional[str] = None,
        should_open_browser: bool = False,
        is_docker_container: bool = False,
        crawl_config: Optional[CrawlConfig] = None,
    ):
        """
        初始化模式执行器
        
        Args:
            report_mode: 报告模式
            rank_threshold: 排名阈值
            update_info: 版本更新信息
            proxy_url: 代理URL
            should_open_browser: 是否应该打开浏览器
            is_docker_container: 是否在Docker容器中
            crawl_config: 爬虫配置对象
        """
        self.crawl_config = crawl_config
        self.report_mode = report_mode
        self.update_info = update_info
        self.pipeline = AnalysisPipeline(rank_threshold, update_info, crawl_config=crawl_config)
        self.notifier = Notifier(report_mode, proxy_url, crawl_config=crawl_config)
        self.report_generator = ReportGenerator(
            report_mode, rank_threshold, update_info, proxy_url
        )
        self.should_open_browser = should_open_browser
        self.is_docker_container = is_docker_container

    def execute(
        self, 
        mode_strategy: Dict, 
        results: Dict, 
        id_to_name: Dict, 
        failed_ids: List,
        platforms=None,
        word_groups=None,
        filter_words=None
    ) -> Optional[str]:
        """
        执行模式特定逻辑
        
        Args:
            mode_strategy: 模式策略
            results: 抓取结果
            id_to_name: 平台ID到名称的映射
            failed_ids: 失败的平台ID列表
            platforms: 平台列表（如果为None，则从CONFIG获取，向后兼容）
            word_groups: 频率词组列表（如果为None，则从文件加载，向后兼容）
            filter_words: 过滤词列表（如果为None，则从文件加载，向后兼容）
        """
        # 获取当前监控平台ID列表
        if platforms is None:
            # 如果 platforms 为 None，说明调用方没有传递，这是不应该的
            raise ValueError("platforms 参数不能为 None，必须从数据库获取")
        current_platform_ids = [platform["id"] for platform in platforms]

        new_titles = detect_latest_new_titles(current_platform_ids)
        time_info = DataLoader.get_time_info_from_file(results, id_to_name, failed_ids)
        
        # 如果没有传入，则从文件加载（向后兼容）
        if word_groups is None or filter_words is None:
            word_groups, filter_words = load_frequency_words()

        # current模式下，实时推送需要使用完整的历史数据来保证统计信息的完整性
        if self.report_mode == "current":
            # 加载完整的历史数据（已按当前平台过滤）
            analysis_data = DataLoader.load_analysis_data(platforms=platforms, word_groups=word_groups, filter_words=filter_words)
            if analysis_data:
                (
                    all_results,
                    historical_id_to_name,
                    historical_title_info,
                    historical_new_titles,
                    _,
                    _,
                ) = analysis_data

                print(
                    f"current模式：使用过滤后的历史数据，包含平台：{list(all_results.keys())}"
                )

                stats, html_file = self.pipeline.run(
                    all_results,
                    self.report_mode,
                    historical_title_info,
                    historical_new_titles,
                    word_groups,
                    filter_words,
                    historical_id_to_name,
                    failed_ids=failed_ids,
                )

                combined_id_to_name = {**historical_id_to_name, **id_to_name}

                print(f"HTML报告已生成: {html_file}")

                # 发送实时通知（使用完整历史数据的统计结果）
                summary_html = None
                if mode_strategy["should_send_realtime"]:
                    self.notifier.send_if_needed(
                        stats,
                        mode_strategy["realtime_report_type"],
                        self.report_mode,
                        update_info=self.update_info,
                        failed_ids=failed_ids,
                        new_titles=historical_new_titles,
                        id_to_name=combined_id_to_name,
                        html_file_path=html_file,
                    )
            else:
                print("❌ 严重错误：无法读取刚保存的数据文件")
                raise RuntimeError("数据一致性检查失败：保存后立即读取失败")
        else:
            title_info = DataLoader.prepare_current_title_info(results, time_info)
            stats, html_file = self.pipeline.run(
                results,
                self.report_mode,
                title_info,
                new_titles,
                word_groups,
                filter_words,
                id_to_name,
                failed_ids=failed_ids,
            )
            print(f"HTML报告已生成: {html_file}")

            # 发送实时通知（如果需要）
            summary_html = None
            if mode_strategy["should_send_realtime"]:
                self.notifier.send_if_needed(
                    stats,
                    mode_strategy["realtime_report_type"],
                    self.report_mode,
                    update_info=self.update_info,
                    failed_ids=failed_ids,
                    new_titles=new_titles,
                    id_to_name=id_to_name,
                    html_file_path=html_file,
                )

        # 生成汇总报告（如果需要）
        summary_html = None
        if mode_strategy["should_generate_summary"]:
            if mode_strategy["should_send_realtime"]:
                # 如果已经发送了实时通知，汇总只生成HTML不发送通知
                summary_html = self.report_generator.generate_summary_html(
                    mode_strategy["summary_mode"],
                    platforms=platforms,
                    word_groups=word_groups,
                    filter_words=filter_words
                )
            else:
                # daily模式：直接生成汇总报告并发送通知
                summary_html = self.report_generator.generate_summary_report(
                    mode_strategy,
                    platforms=platforms,
                    word_groups=word_groups,
                    filter_words=filter_words
                )

        # 打开浏览器（仅在非容器环境）
        if self.should_open_browser and html_file:
            if summary_html:
                summary_url = "file://" + str(Path(summary_html).resolve())
                print(f"正在打开汇总报告: {summary_url}")
                webbrowser.open(summary_url)
            else:
                file_url = "file://" + str(Path(html_file).resolve())
                print(f"正在打开HTML报告: {file_url}")
                webbrowser.open(file_url)
        elif self.is_docker_container and html_file:
            if summary_html:
                print(f"汇总报告已生成（Docker环境）: {summary_html}")
            else:
                print(f"HTML报告已生成（Docker环境）: {html_file}")

        return summary_html

