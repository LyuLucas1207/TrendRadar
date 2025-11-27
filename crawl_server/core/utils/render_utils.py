"""
渲染工具

用于生成各种格式的报告（HTML、飞书、钉钉等）
"""
from pathlib import Path
from typing import Dict, List, Optional

from crawl_server.configs import CrawlConfig
from crawl_server.core.utils.contents import render_html_content
from crawl_server.core.utils.data_utils import prepare_report_data
from crawl_server.core.utils.file_utils import get_output_path
from crawl_server.core.utils.time_utils import format_time_filename

def generate_html_report(
    stats: List[Dict],
    total_titles: int,
    failed_ids: Optional[List] = None,
    new_titles: Optional[Dict] = None,
    id_to_name: Optional[Dict] = None,
    mode: str = "daily",
    is_daily_summary: bool = False,
    update_info: Optional[Dict] = None,
    crawl_config: Optional[CrawlConfig] = None,
) -> str:
    """生成HTML报告"""
    if is_daily_summary:
        if mode == "current":
            filename = "当前榜单汇总.html"
        elif mode == "incremental":
            filename = "当日增量.html"
        else:
            filename = "当日汇总.html"
    else:
        filename = f"{format_time_filename()}.html"

    file_path = get_output_path("html", filename)

    report_data = prepare_report_data(stats, failed_ids, new_titles, id_to_name, mode, crawl_config=crawl_config)

    html_content = render_html_content(
        report_data, total_titles, is_daily_summary, mode, update_info
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    if is_daily_summary:
        root_file_path = Path("output") / "index.html"
        with open(root_file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

    return file_path

