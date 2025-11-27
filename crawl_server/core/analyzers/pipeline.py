"""
分析流水线模块

负责数据处理、统计计算和HTML生成
"""
from typing import Dict, List, Optional, Tuple

from crawl_server.configs import CrawlConfig
from crawl_server.core.utils import count_word_frequency, generate_html_report


class AnalysisPipeline:
    """分析流水线"""
    
    def __init__(self, rank_threshold: int, update_info: Optional[dict] = None, crawl_config: Optional[CrawlConfig] = None):
        """
        初始化分析流水线
        
        Args:
            rank_threshold: 排名阈值
            update_info: 版本更新信息
            crawl_config: 爬虫配置对象
        """
        self.rank_threshold = rank_threshold
        self.update_info = update_info
        self.crawl_config = crawl_config

    def run(
        self,
        data_source: Dict,
        mode: str,
        title_info: Dict,
        new_titles: Dict,
        word_groups: List[Dict],
        filter_words: List[str],
        id_to_name: Dict,
        failed_ids: Optional[List] = None,
        is_daily_summary: bool = False,
    ) -> Tuple[List[Dict], str]:
        """统一的分析流水线：数据处理 → 统计计算 → HTML生成"""

        # 统计计算
        if not self.crawl_config:
            raise RuntimeError("CrawlConfig 未提供，无法执行统计计算")
        stats, total_titles = count_word_frequency(
            data_source,
            word_groups,
            filter_words,
            id_to_name,
            title_info,
            self.rank_threshold,
            new_titles,
            mode=mode,
            crawl_config=self.crawl_config,
        )

        # HTML生成
        html_file = generate_html_report(
            stats,
            total_titles,
            failed_ids=failed_ids,
            new_titles=new_titles,
            id_to_name=id_to_name,
            mode=mode,
            is_daily_summary=is_daily_summary,
            update_info=self.update_info if (self.crawl_config and self.crawl_config.SHOW_VERSION_UPDATE) else None,
            crawl_config=self.crawl_config,
        )

        return stats, html_file

