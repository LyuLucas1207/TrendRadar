"""
格式化工具函数
"""
from typing import List


def format_rank_display(ranks: List[int], rank_threshold: int, format_type: str) -> str:
    """统一的排名格式化方法"""
    if not ranks:
        return ""

    unique_ranks = sorted(set(ranks))
    min_rank = unique_ranks[0]
    max_rank = unique_ranks[-1]

    if format_type == "html":
        highlight_start = "<font color='red'><strong>"
        highlight_end = "</strong></font>"
    elif format_type == "feishu":
        highlight_start = "<font color='red'>**"
        highlight_end = "**</font>"
    elif format_type == "dingtalk":
        highlight_start = "**"
        highlight_end = "**"
    elif format_type == "wework":
        highlight_start = "**"
        highlight_end = "**"
    elif format_type == "telegram":
        highlight_start = "<b>"
        highlight_end = "</b>"
    else:
        highlight_start = "**"
        highlight_end = "**"

    if min_rank <= rank_threshold:
        if min_rank == max_rank:
            return f"{highlight_start}[{min_rank}]{highlight_end}"
        else:
            return f"{highlight_start}[{min_rank} - {max_rank}]{highlight_end}"
    else:
        if min_rank == max_rank:
            return f"[{min_rank}]"
        else:
            return f"[{min_rank} - {max_rank}]"

