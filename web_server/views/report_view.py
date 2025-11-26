"""
报告视图

处理报告相关的响应
"""
from fastapi.responses import HTMLResponse
from typing import Optional

from ..models.report_model import ReportModel


class ReportView:
    """报告视图"""
    
    def __init__(self, model: ReportModel):
        self.model = model
    
    def render_latest_summary(self) -> HTMLResponse:
        """渲染最新的汇总报告"""
        content = self.model.get_latest_summary()
        
        if content:
            return HTMLResponse(content=content)
        
        # 返回 404 错误页面
        error_content = self.model.get_error_page()
        return HTMLResponse(
            content=error_content or "<h1>404</h1><p>报告未找到</p>",
            status_code=404
        )
    
    def render_report_by_time(self, time_str: str) -> HTMLResponse:
        """根据时间渲染报告
        
        Args:
            time_str: 时间字符串，格式为 HHMM（如 "1917" 表示 19:17）
        
        Returns:
            HTML 响应
        """
        content = self.model.get_report_by_time(time_str)
        
        if content:
            return HTMLResponse(content=content)
        
        # 返回 404 错误页面
        error_content = self.model.get_error_page()
        return HTMLResponse(
            content=error_content or f"<h1>404</h1><p>报告 {time_str} 不存在</p>",
            status_code=404
        )
    
    def render_report_by_date(self, date_str: str) -> HTMLResponse:
        """根据日期渲染汇总报告
        
        Args:
            date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
        
        Returns:
            HTML 响应
        """
        content = self.model.get_report_by_date(date_str)
        
        if content:
            return HTMLResponse(content=content)
        
        # 返回 404 错误页面
        error_content = self.model.get_error_page()
        return HTMLResponse(
            content=error_content or f"<h1>404</h1><p>日期 {date_str} 的报告不存在</p>",
            status_code=404
        )
    
    def render_report_by_date_and_time(self, date_str: str, time_str: str) -> HTMLResponse:
        """根据日期和时间渲染报告
        
        Args:
            date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
            time_str: 时间字符串，格式为 HHMM（如 "1804"）或 "18时04分.html"
        
        Returns:
            HTML 响应
        """
        content = self.model.get_report_by_date_and_time(date_str, time_str)
        
        if content:
            return HTMLResponse(content=content)
        
        # 返回 404 错误页面
        error_content = self.model.get_error_page()
        return HTMLResponse(
            content=error_content or f"<h1>404</h1><p>报告 {date_str}/{time_str} 不存在</p>",
            status_code=404
        )
    
    def render_date_file_list(self, date_str: str) -> HTMLResponse:
        """渲染日期目录下的文件列表
        
        Args:
            date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
        
        Returns:
            HTML 响应
        """
        file_list = self.model.list_date_files(date_str)
        
        if file_list is None:
            # 日期格式无效或目录不存在，返回 404
            error_content = self.model.get_error_page()
            return HTMLResponse(
                content=error_content or f"<h1>404</h1><p>日期 {date_str} 不存在</p>",
                status_code=404
            )
        
        # 生成文件列表 HTML
        html_content = self._generate_file_list_html(date_str, file_list)
        return HTMLResponse(content=html_content)
    
    def _generate_file_list_html(self, date_str: str, file_list: dict) -> str:
        """生成文件列表 HTML"""
        date_folder = file_list["date_folder"]
        html_files = file_list["html_files"]
        
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
        
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文件列表 - {date_folder}</title>
    <style>
        * {{ box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 24px;
        }}
        .header h1 {{
            margin: 0 0 8px 0;
            font-size: 24px;
        }}
        .header p {{
            margin: 0;
            opacity: 0.9;
            font-size: 14px;
        }}
        .content {{
            padding: 24px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th {{
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #666;
            border-bottom: 2px solid #e5e7eb;
        }}
        td {{
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
        }}
        .file-link {{
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }}
        .file-link:hover {{
            text-decoration: underline;
            color: #1d4ed8;
        }}
        .back-link {{
            display: inline-block;
            margin-top: 20px;
            color: #666;
            text-decoration: none;
            font-size: 14px;
        }}
        .back-link:hover {{
            color: #333;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📁 {date_folder}</h1>
            <p>选择要查看的报告文件</p>
        </div>
        <div class="content">
            <table>
                <thead>
                    <tr>
                        <th>文件名</th>
                        <th>大小</th>
                        <th>修改时间</th>
                    </tr>
                </thead>
                <tbody>
                    {files_html}
                </tbody>
            </table>
            <a href="/report" class="back-link">← 返回最新报告</a>
        </div>
    </div>
</body>
</html>"""

