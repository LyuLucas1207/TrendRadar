"""
数据加载模块

负责数据加载和预处理
"""
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from crawl_server.core.data import (
    detect_latest_new_titles,
    read_all_today_titles,
    save_titles_to_file,
)
from crawl_server.core.utils import load_frequency_words


class DataLoader:
    """数据加载器"""
    
    @staticmethod
    def load_analysis_data(platforms=None, word_groups=None, filter_words=None) -> Optional[Tuple[Dict, Dict, Dict, Dict, List, List]]:
        """
        统一的数据加载和预处理，使用当前监控平台列表过滤历史数据
        
        Args:
            platforms: 平台列表（如果为None，则从CONFIG获取，向后兼容）
            word_groups: 频率词组列表（如果为None，则从文件加载，向后兼容）
            filter_words: 过滤词列表（如果为None，则从文件加载，向后兼容）
        """
        try:
            # 获取当前配置的监控平台ID列表
            if platforms is None:
                raise ValueError("platforms 参数不能为 None，必须从数据库获取")
            current_platform_ids = []
            for platform in platforms:
                current_platform_ids.append(platform["id"])

            print(f"当前监控平台: {current_platform_ids}")

            all_results, id_to_name, title_info = read_all_today_titles(
                current_platform_ids
            )

            if not all_results:
                print("没有找到当天的数据")
                return None

            total_titles = sum(len(titles) for titles in all_results.values())
            print(f"读取到 {total_titles} 个标题（已按当前监控平台过滤）")

            new_titles = detect_latest_new_titles(current_platform_ids)
            
            # 如果没有传入，则从文件加载（向后兼容）
            if word_groups is None or filter_words is None:
                word_groups, filter_words = load_frequency_words()

            return (
                all_results,
                id_to_name,
                title_info,
                new_titles,
                word_groups,
                filter_words,
            )
        except Exception as e:
            print(f"数据加载失败: {e}")
            return None

    @staticmethod
    def prepare_current_title_info(results: Dict, time_info: str) -> Dict:
        """从当前抓取结果构建标题信息"""
        title_info = {}
        for source_id, titles_data in results.items():
            title_info[source_id] = {}
            for title, title_data in titles_data.items():
                ranks = title_data.get("ranks", [])
                url = title_data.get("url", "")
                mobile_url = title_data.get("mobileUrl", "")

                title_info[source_id][title] = {
                    "first_time": time_info,
                    "last_time": time_info,
                    "count": 1,
                    "ranks": ranks,
                    "url": url,
                    "mobileUrl": mobile_url,
                }
        return title_info

    @staticmethod
    def save_crawl_results(results: Dict, id_to_name: Dict, failed_ids: List) -> str:
        """保存抓取结果并返回文件路径"""
        title_file = save_titles_to_file(results, id_to_name, failed_ids)
        print(f"标题已保存到: {title_file}")
        return title_file

    @staticmethod
    def get_time_info_from_file(results: Dict, id_to_name: Dict, failed_ids: List) -> str:
        """从保存的文件中获取时间信息"""
        return Path(save_titles_to_file(results, id_to_name, failed_ids)).stem

