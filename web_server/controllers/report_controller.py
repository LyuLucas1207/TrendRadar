"""
报告控制器

处理报告相关的路由
"""
import urllib.parse
from fastapi import APIRouter
from fastapi.responses import HTMLResponse, RedirectResponse

from ..models.report_model import ReportModel
from ..views.report_view import ReportView
from ..config import config

router = APIRouter(prefix="/report", tags=["report"])

# 创建模型和视图实例
_report_model = ReportModel()
_report_view = ReportView(_report_model)


@router.get("", response_class=HTMLResponse)
async def get_latest_summary():
    """获取最新的汇总报告（从 output/index.html）"""
    return _report_view.render_latest_summary()


@router.get("/{date_str}/summary", response_class=HTMLResponse)
@router.get("/{date_str}/s", response_class=HTMLResponse)
@router.get("/{date_str}/index", response_class=HTMLResponse)
async def get_summary_by_date(date_str: str):
    """根据日期获取汇总报告
    
    Args:
        date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
    """
    date_str = urllib.parse.unquote(date_str)
    return _report_view.render_report_by_date(date_str)


@router.get("/{date_str}/{time_str:path}", response_class=HTMLResponse)
async def get_report_by_date_and_time(date_str: str, time_str: str):
    """根据日期和时间获取报告
    
    支持以下格式：
    - /report/20251126/1804 → output/2025年11月26日/html/18时04分.html
    - /report/20251126/18时04分.html → output/2025年11月26日/html/18时04分.html
    
    Args:
        date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
        time_str: 时间字符串，格式为 HHMM（如 "1804"）或 "18时04分.html"
    """
    date_str = urllib.parse.unquote(date_str)
    time_str = urllib.parse.unquote(time_str)
    
    return _report_view.render_report_by_date_and_time(date_str, time_str)


@router.get("/{date_str}", response_class=HTMLResponse)
async def get_report_by_date(date_str: str):
    """根据日期显示文件列表
    
    支持以下格式：
    - /report/20251126 → 显示该日期目录下的文件列表
    """
    # URL 解码
    date_str = urllib.parse.unquote(date_str)
    
    # 如果是8位数字（日期格式），显示文件列表
    if len(date_str) == 8 and date_str.isdigit():
        return _report_view.render_date_file_list(date_str)
    
    # 否则尝试作为时间格式处理（向后兼容）
    if date_str.endswith('.html'):
        date_str = date_str[:-5]
    return _report_view.render_report_by_time(date_str)

