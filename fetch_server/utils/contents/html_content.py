"""
HTML 内容渲染

用于生成 HTML 报告内容
"""
import re
from pathlib import Path
from typing import Dict, List, Optional

from fetch_server.utils.string_utils import html_escape
from fetch_server.utils.time_utils import get_beijing_time


def _get_template_path(filename: str) -> Path:
    """获取模板文件路径"""
    template_dir = Path(__file__).parent.parent / "templates"
    return template_dir / filename


def _load_template(filename: str) -> str:
    """加载模板文件内容"""
    template_path = _get_template_path(filename)
    if not template_path.exists():
        raise FileNotFoundError(f"模板文件不存在: {template_path}")
    
    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()


def _generate_error_section(failed_ids: List[str]) -> str:
    """生成错误信息部分 HTML"""
    if not failed_ids:
        return ""
    
    error_items = "".join(
        f'<li class="error-item">{html_escape(id_value)}</li>'
        for id_value in failed_ids
    )
    
    return f"""
                <div class="error-section">
                    <div class="error-title">⚠️ 请求失败的平台</div>
                    <ul class="error-list">
                        {error_items}
                    </ul>
                </div>"""


def _generate_stats_section(stats: List[Dict]) -> str:
    """生成统计数据部分 HTML"""
    if not stats:
        return ""
    
    total_count = len(stats)
    stats_html = ""
    
    for i, stat in enumerate(stats, 1):
        count = stat["count"]
        
        # 确定热度等级
        if count >= 10:
            count_class = "hot"
        elif count >= 5:
            count_class = "warm"
        else:
            count_class = ""
        
        escaped_word = html_escape(stat["word"])
        
        stats_html += f"""
                <div class="word-group">
                    <div class="word-header">
                        <div class="word-info">
                            <div class="word-name">{escaped_word}</div>
                            <div class="word-count {count_class}">{count} 条</div>
                        </div>
                        <div class="word-index">{i}/{total_count}</div>
                    </div>"""
        
        # 处理每个词组下的新闻标题
        for j, title_data in enumerate(stat["titles"], 1):
            is_new = title_data.get("is_new", False)
            new_class = "new" if is_new else ""
            
            stats_html += f"""
                    <div class="news-item {new_class}">
                        <div class="news-number">{j}</div>
                        <div class="news-content">
                            <div class="news-header">
                                <span class="source-name">{html_escape(title_data["source_name"])}</span>"""
            
            # 处理排名显示
            ranks = title_data.get("ranks", [])
            if ranks:
                min_rank = min(ranks)
                max_rank = max(ranks)
                rank_threshold = title_data.get("rank_threshold", 10)
                
                # 确定排名等级
                if min_rank <= 3:
                    rank_class = "top"
                elif min_rank <= rank_threshold:
                    rank_class = "high"
                else:
                    rank_class = ""
                
                if min_rank == max_rank:
                    rank_text = str(min_rank)
                else:
                    rank_text = f"{min_rank}-{max_rank}"
                
                stats_html += f'<span class="rank-num {rank_class}">{rank_text}</span>'
            
            # 处理时间显示
            time_display = title_data.get("time_display", "")
            if time_display:
                # 简化时间显示格式
                simplified_time = (
                    time_display.replace(" ~ ", "~")
                    .replace("[", "")
                    .replace("]", "")
                )
                stats_html += f'<span class="time-info">{html_escape(simplified_time)}</span>'
            
            # 处理出现次数
            count_info = title_data.get("count", 1)
            if count_info > 1:
                stats_html += f'<span class="count-info">{count_info}次</span>'
            
            stats_html += """
                            </div>
                            <div class="news-title">"""
            
            # 处理标题和链接
            escaped_title = html_escape(title_data["title"])
            link_url = title_data.get("mobile_url") or title_data.get("url", "")
            
            if link_url:
                escaped_url = html_escape(link_url)
                stats_html += f'<a href="{escaped_url}" target="_blank" class="news-link">{escaped_title}</a>'
            else:
                stats_html += escaped_title
            
            stats_html += """
                            </div>
                        </div>
                    </div>"""
        
        stats_html += """
                </div>"""
    
    return stats_html


def _generate_new_titles_section(new_titles: List[Dict]) -> str:
    """生成新增新闻部分 HTML"""
    if not new_titles:
        return ""
    
    total_new_count = sum(len(source["titles"]) for source in new_titles)
    
    new_section_html = f"""
                <div class="new-section">
                    <div class="new-section-title">本次新增热点 (共 {total_new_count} 条)</div>"""
    
    for source_data in new_titles:
        escaped_source = html_escape(source_data["source_name"])
        titles_count = len(source_data["titles"])
        
        new_section_html += f"""
                    <div class="new-source-group">
                        <div class="new-source-title">{escaped_source} · {titles_count}条</div>"""
        
        # 为新增新闻也添加序号
        for idx, title_data in enumerate(source_data["titles"], 1):
            ranks = title_data.get("ranks", [])
            
            # 处理新增新闻的排名显示
            rank_class = ""
            if ranks:
                min_rank = min(ranks)
                if min_rank <= 3:
                    rank_class = "top"
                elif min_rank <= title_data.get("rank_threshold", 10):
                    rank_class = "high"
                
                if len(ranks) == 1:
                    rank_text = str(ranks[0])
                else:
                    rank_text = f"{min(ranks)}-{max(ranks)}"
            else:
                rank_text = "?"
            
            new_section_html += f"""
                        <div class="new-item">
                            <div class="new-item-number">{idx}</div>
                            <div class="new-item-rank {rank_class}">{rank_text}</div>
                            <div class="new-item-content">
                                <div class="new-item-title">"""
            
            # 处理新增新闻的链接
            escaped_title = html_escape(title_data["title"])
            link_url = title_data.get("mobile_url") or title_data.get("url", "")
            
            if link_url:
                escaped_url = html_escape(link_url)
                new_section_html += f'<a href="{escaped_url}" target="_blank" class="news-link">{escaped_title}</a>'
            else:
                new_section_html += escaped_title
            
            new_section_html += """
                                </div>
                            </div>
                        </div>"""
        
        new_section_html += """
                    </div>"""
    
    new_section_html += """
                </div>"""
    
    return new_section_html


def _generate_update_info_section(update_info: Optional[Dict]) -> str:
    """生成更新信息部分 HTML"""
    if not update_info:
        return ""
    
    return f"""
                    <br>
                    <span style="color: #ea580c; font-weight: 500;">
                        发现新版本 {update_info['remote_version']}，当前版本 {update_info['current_version']}
                    </span>"""


def render_html_content(
    report_data: Dict,
    total_titles: int,
    is_daily_summary: bool = False,
    mode: str = "daily",
    update_info: Optional[Dict] = None,
) -> str:
    """渲染HTML内容"""
    # 加载模板
    template = _load_template("report_template.html")
    
    # 处理报告类型显示
    if is_daily_summary:
        if mode == "current":
            report_type = "当前榜单"
        elif mode == "incremental":
            report_type = "增量模式"
        else:
            report_type = "当日汇总"
    else:
        report_type = "实时分析"
    
    # 计算筛选后的热点新闻数量
    hot_news_count = sum(len(stat["titles"]) for stat in report_data["stats"])
    
    # 生成时间
    now = get_beijing_time()
    generate_time = now.strftime("%m-%d %H:%M")
    
    # 生成各个部分的内容
    error_section = _generate_error_section(report_data.get("failed_ids", []))
    stats_section = _generate_stats_section(report_data.get("stats", []))
    new_titles_section = _generate_new_titles_section(report_data.get("new_titles", []))
    update_info_section = _generate_update_info_section(update_info)
    
    # 组合内容部分
    content_section = error_section + stats_section + new_titles_section
    
    # 使用正则表达式替换占位符（避免与 CSS 花括号冲突）
    html = template
    html = re.sub(r'\{report_type\}', report_type, html)
    html = re.sub(r'\{total_titles\}', str(total_titles), html)
    html = re.sub(r'\{hot_news_count\}', str(hot_news_count), html)
    html = re.sub(r'\{generate_time\}', generate_time, html)
    html = re.sub(r'\{content_section\}', content_section, html)
    html = re.sub(r'\{update_info_section\}', update_info_section, html)
    
    return html

