"""
工具函数模块

提供各种工具函数
"""
from .time_utils import (
    get_beijing_time,
    format_date_folder,
    format_time_filename,
    format_time_display,
)
from .string_utils import clean_title, html_escape, strip_markdown
from .file_utils import ensure_directory_exists, get_output_path, is_first_crawl_today
from .format_utils import format_rank_display
from .version_utils import check_version_update
from .statistics_utils import (
    calculate_news_weight,
    count_word_frequency,
    matches_word_groups,
)
from .contents import (
    format_title_for_platform,
    render_dingtalk_content,
    render_feishu_content,
    render_html_content,
)
from .data_utils import load_frequency_words, prepare_report_data
from .render_utils import generate_html_report

__all__ = [
    # 时间工具
    "get_beijing_time",
    "format_date_folder",
    "format_time_filename",
    "format_time_display",
    # 字符串工具
    "clean_title",
    "html_escape",
    "strip_markdown",
    # 文件工具
    "ensure_directory_exists",
    "get_output_path",
    "is_first_crawl_today",
    # 格式化工具
    "format_rank_display",
    # 版本工具
    "check_version_update",
    # 统计工具
    "calculate_news_weight",
    "count_word_frequency",
    "matches_word_groups",
    # 数据处理工具
    "load_frequency_words",
    "prepare_report_data",
    # 渲染工具
    "format_title_for_platform",
    "generate_html_report",
    "render_dingtalk_content",
    "render_feishu_content",
    "render_html_content",
]

