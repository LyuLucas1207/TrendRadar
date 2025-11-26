"""
HTML 模板工具

用于读取和渲染 HTML 模板文件
"""
import re
from pathlib import Path
from typing import List, Dict


def _get_template_path(filename: str) -> Path:
    """获取模板文件路径"""
    template_dir = Path(__file__).parent / "templates"
    return template_dir / filename


def _load_template(filename: str) -> str:
    """加载模板文件内容"""
    template_path = _get_template_path(filename)
    if not template_path.exists():
        raise FileNotFoundError(f"模板文件不存在: {template_path}")
    
    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()


def render_output_directory_html(directories: List[Dict]) -> str:
    """生成 output 目录列表 HTML
    
    Args:
        directories: 日期目录列表，每个元素包含：
            {
                "date_folder": "2025年11月26日",
                "date_str": "20251126",
                "url": "/report/20251126",
                "mtime": "2025-11-26 20:30:00"
            }
    
    Returns:
        HTML 内容字符串
    """
    # 生成目录行 HTML
    dirs_html = ""
    if directories:
        for dir_info in directories:
            dirs_html += f"""
                <tr>
                    <td><a href="{dir_info['url']}" class="dir-link">{dir_info['date_folder']}</a></td>
                    <td>{dir_info['mtime']}</td>
                </tr>
                """
    else:
        dirs_html = '<tr><td colspan="2" style="text-align: center; color: #999;">暂无日期目录</td></tr>'
    
    # 加载模板并使用正则表达式替换占位符（避免与 CSS 花括号冲突）
    template = _load_template("output_directory.html")
    # 使用正则表达式替换 {dirs_html}，只替换这个特定的占位符
    return re.sub(r'\{dirs_html\}', dirs_html, template)


def render_date_file_list_html(date_folder: str, html_files: List[Dict]) -> str:
    """生成日期目录文件列表 HTML
    
    Args:
        date_folder: 日期文件夹名称（如 "2025年11月26日"）
        html_files: HTML 文件列表，每个元素包含：
            {
                "name": "当日汇总.html",
                "path": "/report/20251126/当日汇总.html",
                "size": 12345,
                "mtime": "2025-11-26 20:30:00"
            }
    
    Returns:
        HTML 内容字符串
    """
    # 生成文件行 HTML
    files_html = ""
    if html_files:
        for file_info in html_files:
            size_kb = file_info["size"] // 1024
            files_html += f"""
                <tr>
                    <td><a href="{file_info['path']}" class="file-link">{file_info['name']}</a></td>
                    <td>{size_kb} KB</td>
                    <td>{file_info['mtime']}</td>
                </tr>
                """
    else:
        files_html = '<tr><td colspan="3" style="text-align: center; color: #999;">暂无文件</td></tr>'
    
    # 加载模板并使用正则表达式替换占位符（避免与 CSS 花括号冲突）
    template = _load_template("date_file_list.html")
    # 使用正则表达式替换占位符，只替换特定的占位符
    template = re.sub(r'\{date_folder\}', date_folder, template)
    template = re.sub(r'\{files_html\}', files_html, template)
    return template

