"""
HTML 内容渲染

用于生成 HTML 报告内容
"""
import re
from pathlib import Path
from typing import Dict, List, Optional

from crawl_server.core.utils.string_utils import html_escape
from crawl_server.core.utils.time_utils import get_beijing_time


def _get_template_path(filename: str) -> Path:
    """获取模板文件路径"""
    template_dir = Path(__file__).parent.parent / "templates"
    return template_dir / filename


def _load_template(filename: str) -> str:
    """
    加载模板文件内容
    
    注意：此函数每次调用都会重新读取文件，确保模板文件的修改能够立即生效。
    无需重启服务，修改 HTML 模板、CSS 或 JS 文件后下次生成报告时即可看到效果。
    """
    template_path = _get_template_path(filename)
    if not template_path.exists():
        raise FileNotFoundError(f"模板文件不存在: {template_path}")
    
    # 每次调用都重新读取文件，不使用缓存
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()
    
    # 如果是 HTML 模板，加载并插入 CSS 和 JS 文件
    if filename.endswith('.html'):
        # 加载 CSS 文件
        css_path = template_path.parent / filename.replace('.html', '.css')
        if css_path.exists():
            with open(css_path, "r", encoding="utf-8") as f:
                css_content = f.read()
            template = template.replace("/*css_content*/", css_content)
        
        # 加载 JS 文件
        js_path = template_path.parent / filename.replace('.html', '.js')
        if js_path.exists():
            with open(js_path, "r", encoding="utf-8") as f:
                js_content = f.read()
            template = template.replace("//js_content", js_content)
    
    return template


def _generate_error_section(failed_ids: List[str]) -> str:
    """生成错误信息部分 HTML"""
    if not failed_ids:
        return ""
    
    # 加载错误项模板
    error_item_template = _load_template("error_item.html")
    error_items = ""
    
    for id_value in failed_ids:
        item_html = error_item_template.replace("{error_id}", html_escape(id_value))
        error_items += item_html
    
    # 加载错误部分外层模板
    error_section_template = _load_template("error_section.html")
    return error_section_template.replace("{error_items}", error_items)


def _generate_stats_section(stats: List[Dict]) -> str:
    """生成统计数据部分 HTML"""
    if not stats:
        return ""
    
    # 加载模板
    word_group_template = _load_template("word_group_outer.html")
    news_item_template = _load_template("news_item.html")
    
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
        
        # 生成新闻项
        news_items = ""
        for j, title_data in enumerate(stat["titles"], 1):
            is_new = title_data.get("is_new", False)
            new_class = "new" if is_new else ""
            
            # 处理排名显示
            rank_html = ""
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
                
                rank_html = f'<span class="rank-num {rank_class}">{rank_text}</span>'
            
            # 处理时间显示
            time_html = ""
            time_display = title_data.get("time_display", "")
            if time_display:
                simplified_time = (
                    time_display.replace(" ~ ", "~")
                    .replace("[", "")
                    .replace("]", "")
                )
                time_html = f'<span class="time-info">{html_escape(simplified_time)}</span>'
            
            # 处理出现次数
            count_html = ""
            count_info = title_data.get("count", 1)
            if count_info > 1:
                count_html = f'<span class="count-info">{count_info}次</span>'
            
            # 处理标题和链接
            escaped_title = html_escape(title_data["title"])
            link_url = title_data.get("mobile_url") or title_data.get("url", "")
            
            if link_url:
                escaped_url = html_escape(link_url)
                title_html = f'<a href="{escaped_url}" target="_blank" class="news-link">{escaped_title}</a>'
            else:
                title_html = escaped_title
            
            # 替换新闻项模板
            news_item_html = news_item_template
            news_item_html = news_item_html.replace("{news_number}", str(j))
            news_item_html = news_item_html.replace("{new_class}", new_class)
            news_item_html = news_item_html.replace("{source_name}", html_escape(title_data["source_name"]))
            news_item_html = news_item_html.replace("{rank_html}", rank_html)
            news_item_html = news_item_html.replace("{time_html}", time_html)
            news_item_html = news_item_html.replace("{count_html}", count_html)
            news_item_html = news_item_html.replace("{title_html}", title_html)
            
            news_items += news_item_html
        
        # 替换 word-group 模板
        word_group_html = word_group_template
        word_group_html = word_group_html.replace("{word_name}", escaped_word)
        word_group_html = word_group_html.replace("{count_class}", count_class)
        word_group_html = word_group_html.replace("{count}", str(count))
        word_group_html = word_group_html.replace("{index}", str(i))
        word_group_html = word_group_html.replace("{total_count}", str(total_count))
        word_group_html = word_group_html.replace("{news_items}", news_items)
        
        stats_html += word_group_html
    
    return stats_html


def _generate_new_titles_section(new_titles: List[Dict]) -> str:
    """生成新增新闻部分 HTML"""
    if not new_titles:
        return ""
    
    # 加载模板
    new_section_template = _load_template("new_section_outer.html")
    new_source_group_template = _load_template("new_source_group.html")
    new_item_template = _load_template("new_item.html")
    
    total_new_count = sum(len(source["titles"]) for source in new_titles)
    
    source_groups = ""
    for source_data in new_titles:
        escaped_source = html_escape(source_data["source_name"])
        titles_count = len(source_data["titles"])
        
        # 生成新增新闻项
        new_items = ""
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
            
            # 处理新增新闻的链接
            escaped_title = html_escape(title_data["title"])
            link_url = title_data.get("mobile_url") or title_data.get("url", "")
            
            if link_url:
                escaped_url = html_escape(link_url)
                title_html = f'<a href="{escaped_url}" target="_blank" class="news-link">{escaped_title}</a>'
            else:
                title_html = escaped_title
            
            # 替换新增项模板
            new_item_html = new_item_template
            new_item_html = new_item_html.replace("{index}", str(idx))
            new_item_html = new_item_html.replace("{rank_class}", rank_class)
            new_item_html = new_item_html.replace("{rank_text}", rank_text)
            new_item_html = new_item_html.replace("{title_html}", title_html)
            
            new_items += new_item_html
        
        # 替换来源组模板
        source_group_html = new_source_group_template
        source_group_html = source_group_html.replace("{source_name}", escaped_source)
        source_group_html = source_group_html.replace("{titles_count}", str(titles_count))
        source_group_html = source_group_html.replace("{new_items}", new_items)
        
        source_groups += source_group_html
    
    # 替换新增部分外层模板
    new_section_html = new_section_template
    new_section_html = new_section_html.replace("{total_new_count}", str(total_new_count))
    new_section_html = new_section_html.replace("{source_groups}", source_groups)
    
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
    """
    渲染HTML内容
    
    注意：每次调用此函数时都会重新从磁盘读取模板文件，
    因此修改 HTML 模板文件后，下次生成报告时会自动使用最新的模板，无需重启服务。
    """
    # 每次调用都重新加载模板文件（不使用缓存）
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

