"""
报告视图

处理报告相关的响应
"""
from fastapi.responses import HTMLResponse
from typing import Optional

from ..models.report_model import ReportModel
from ..utils.html import render_output_directory_html, render_date_file_list_html


class ReportView:
    """报告视图"""
    
    def __init__(self, model: ReportModel):
        self.model = model
    
    def render_output_directory(self) -> HTMLResponse:
        """渲染 output 目录列表"""
        directories = self.model.list_output_directories()
        html_content = render_output_directory_html(directories)
        return HTMLResponse(content=html_content)
    
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
        return render_date_file_list_html(date_folder, html_files)

