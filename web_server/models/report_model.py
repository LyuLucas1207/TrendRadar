"""
报告模型

处理报告相关的业务逻辑和数据访问
"""
import os
import urllib.parse
from pathlib import Path
from typing import Optional
from datetime import datetime

from ..config import config


class ReportModel:
    """报告模型"""
    
    def __init__(self, output_dir: Optional[str] = None):
        self.output_dir = Path(output_dir or config.output_path)
        # 404 页面路径（优先使用 output/404.html）
        self.error_page_paths = [
            self.output_dir / "404.html",
            Path("/app/output/404.html"),
            Path("output/404.html")
        ]
    
    def get_latest_summary(self) -> Optional[str]:
        """获取最新的汇总报告内容（从 output/index.html）"""
        index_path = self.output_dir / "index.html"
        if index_path.exists():
            with open(index_path, "r", encoding="utf-8") as f:
                return f.read()
        return None
    
    def get_report_by_time(self, time_str: str) -> Optional[str]:
        """根据时间获取报告内容
        
        Args:
            time_str: 时间字符串，格式为 HHMM（如 "1917" 表示 19:17）
        
        Returns:
            报告内容，如果不存在则返回 None
        """
        if not self._validate_time_format(time_str):
            return None
        
        if not self.output_dir.exists():
            return None
        
        hour = time_str[:2]
        minute = time_str[2:]
        filename = f"{hour}时{minute}分.html"
        
        target_file = None
        latest_mtime = 0
        
        # 遍历所有日期目录
        for date_dir in self.output_dir.iterdir():
            if not date_dir.is_dir():
                continue
            
            html_dir = date_dir / "html"
            if not html_dir.exists():
                continue
            
            file_path = html_dir / filename
            if file_path.exists():
                mtime = file_path.stat().st_mtime
                # 如果有多个同名文件，返回最新的
                if mtime > latest_mtime:
                    latest_mtime = mtime
                    target_file = file_path
        
        if target_file and target_file.exists():
            with open(target_file, "r", encoding="utf-8") as f:
                return f.read()
        
        return None
    
    def get_error_page(self) -> str:
        """获取 404 错误页面内容（保底方案）
        
        优先读取 output/404.html，如果不存在则返回默认错误消息
        """
        for error_path in self.error_page_paths:
            if error_path.exists():
                try:
                    with open(error_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if content.strip():  # 确保内容不为空
                            return content
                except Exception:
                    continue
        
        # 如果所有路径都失败，返回默认错误消息
        return "<h1>404</h1><p>报告未找到</p>"
    
    @staticmethod
    def _parse_date_str(date_str: str) -> Optional[str]:
        """解析日期字符串
        
        Args:
            date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
        
        Returns:
            格式化后的日期字符串（如 "2025年11月26日"），如果格式无效则返回 None
        """
        if not date_str or len(date_str) != 8:
            return None
        
        if not date_str.isdigit():
            return None
        
        try:
            year = date_str[:4]
            month = date_str[4:6]
            day = date_str[6:8]
            return f"{year}年{month}月{day}日"
        except Exception:
            return None
    
    def get_report_by_date(self, date_str: str) -> Optional[str]:
        """根据日期获取汇总报告
        
        Args:
            date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
        
        Returns:
            报告内容，如果不存在则返回 None
        """
        date_folder = self._parse_date_str(date_str)
        if not date_folder:
            return None
        
        date_dir = self.output_dir / date_folder
        if not date_dir.exists():
            return None
        
        summary_file = date_dir / "html" / "当日汇总.html"
        if summary_file.exists():
            with open(summary_file, "r", encoding="utf-8") as f:
                return f.read()
        
        return None
    
    def get_report_by_date_and_time(self, date_str: str, time_str: str) -> Optional[str]:
        """根据日期和时间获取报告
        
        Args:
            date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
            time_str: 时间字符串，格式为 HHMM（如 "1804"）或 "18时04分.html"
        
        Returns:
            报告内容，如果不存在则返回 None
        """
        date_folder = self._parse_date_str(date_str)
        if not date_folder:
            return None
        
        date_dir = self.output_dir / date_folder
        if not date_dir.exists():
            return None
        
        html_dir = date_dir / "html"
        if not html_dir.exists():
            return None
        
        # 处理时间格式
        filename = None
        if time_str.endswith('.html'):
            # 直接使用文件名（如 "18时04分.html"）
            filename = time_str
        elif self._validate_time_format(time_str):
            # 4位数字格式（如 "1804"）
            hour = time_str[:2]
            minute = time_str[2:]
            filename = f"{hour}时{minute}分.html"
        else:
            return None
        
        file_path = html_dir / filename
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        
        return None
    
    def list_date_files(self, date_str: str) -> Optional[dict]:
        """列出指定日期目录下的文件
        
        Args:
            date_str: 日期字符串，格式为 YYYYMMDD（如 "20251126"）
        
        Returns:
            包含文件列表的字典，如果目录不存在则返回 None
            {
                "date_folder": "2025年11月26日",
                "html_files": [
                    {"name": "当日汇总.html", "path": "...", "size": 12345, "mtime": "..."},
                    ...
                ]
            }
        """
        date_folder = self._parse_date_str(date_str)
        if not date_folder:
            return None
        
        date_dir = self.output_dir / date_folder
        if not date_dir.exists():
            return None
        
        html_dir = date_dir / "html"
        if not html_dir.exists():
            return {"date_folder": date_folder, "html_files": []}
        
        html_files = []
        for file_path in sorted(html_dir.glob("*.html"), key=lambda x: x.stat().st_mtime, reverse=True):
            stat = file_path.stat()
            html_files.append({
                "name": file_path.name,
                "path": f"/report/{date_str}/{file_path.name}",
                "size": stat.st_size,
                "mtime": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return {
            "date_folder": date_folder,
            "html_files": html_files
        }
    
    def list_output_directories(self) -> list:
        """列出 output 目录下的所有日期文件夹
        
        Returns:
            日期文件夹列表，每个元素包含：
            {
                "date_folder": "2025年11月26日",
                "date_str": "20251126",
                "url": "/report/20251126",
                "mtime": "2025-11-26 20:30:00"
            }
        """
        if not self.output_dir.exists():
            return []
        
        directories = []
        for item in self.output_dir.iterdir():
            if not item.is_dir():
                continue
            
            # 尝试解析日期文件夹名称（格式：YYYY年MM月DD日）
            folder_name = item.name
            date_match = self._parse_date_folder_name(folder_name)
            
            if date_match:
                stat = item.stat()
                directories.append({
                    "date_folder": folder_name,
                    "date_str": date_match,
                    "url": f"/report/{date_match}",
                    "mtime": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
                })
        
        # 按修改时间倒序排序
        directories.sort(key=lambda x: x["mtime"], reverse=True)
        return directories
    
    @staticmethod
    def _parse_date_folder_name(folder_name: str) -> Optional[str]:
        """从日期文件夹名称解析出日期字符串
        
        Args:
            folder_name: 日期文件夹名称，格式为 "YYYY年MM月DD日"
        
        Returns:
            日期字符串，格式为 YYYYMMDD（如 "20251126"），如果格式无效则返回 None
        """
        import re
        match = re.match(r'(\d{4})年(\d{2})月(\d{2})日', folder_name)
        if match:
            year = match.group(1)
            month = match.group(2)
            day = match.group(3)
            return f"{year}{month}{day}"
        return None
    
    @staticmethod
    def _validate_time_format(time_str: str) -> bool:
        """验证时间格式
        
        Args:
            time_str: 时间字符串，应为4位数字（HHMM）
        
        Returns:
            格式是否有效
        """
        if not time_str or len(time_str) != 4:
            return False
        
        if not time_str.isdigit():
            return False
        
        hour = int(time_str[:2])
        minute = int(time_str[2:])
        
        return 0 <= hour <= 23 and 0 <= minute <= 59

