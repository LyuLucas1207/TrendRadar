# coding=utf-8

"""
平台信息数据库仓库

负责从 PostgreSQL 数据库读取和写入平台信息（使用 SQLAlchemy ORM）
"""
import logging
from typing import Optional, List, Dict
from crawl_server.resources.postgresql import DatabaseSession
from crawl_server.models import Platform

logger = logging.getLogger(__name__)


class PlatformDatabase:
    """平台信息数据库（PostgreSQL，使用 SQLAlchemy ORM）"""
    
    def __init__(self, db_session: Optional[DatabaseSession] = None):
        """
        初始化数据库仓库
        
        Args:
            db_session: SQLAlchemy 数据库会话
        """
        self.db_session = db_session
    
    def get_all(self) -> Optional[List[Dict[str, str]]]:
        """
        从数据库获取所有启用的平台列表
        
        Returns:
            平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
            如果数据库未启用或查询失败则返回 None
        """
        if not self.db_session or not self.db_session.enable_postgresql:
            return None
        
        try:
            with self.db_session.get_session() as session:
                # 查询所有启用的平台
                platforms = session.query(Platform).filter(
                    Platform.is_active == True
                ).all()
                
                result = [
                    {
                        "id": p.platform_id,
                        "name": p.platform_name
                    }
                    for p in platforms
                ]
                
                logger.info(f"✅ 从数据库获取平台列表: {len(result)} 个平台")
                return result
        except Exception as e:
            logger.error(f"❌ 从数据库获取平台列表失败: {e}", exc_info=True)
            return None
    
    def save_all(self, platforms: List[Dict[str, str]]) -> bool:
        """
        保存平台列表到数据库
        
        Args:
            platforms: 平台列表，格式: [{"id": "toutiao", "name": "今日头条"}, ...]
        
        Returns:
            是否成功
        """
        if not self.db_session or not self.db_session.enable_postgresql:
            return False
        
        try:
            with self.db_session.get_session() as session:
                # 先查询现有平台
                existing_platforms = {
                    p.platform_id: p
                    for p in session.query(Platform).all()
                }
                
                # 更新或创建平台
                for platform_data in platforms:
                    platform_id = platform_data["id"]
                    platform_name = platform_data["name"]
                    
                    if platform_id in existing_platforms:
                        # 更新现有平台
                        platform = existing_platforms[platform_id]
                        platform.platform_name = platform_name
                        platform.is_active = True
                    else:
                        # 创建新平台
                        platform = Platform(
                            platform_id=platform_id,
                            platform_name=platform_name,
                            is_active=True
                        )
                        session.add(platform)
                
                # 标记不在列表中的平台为不活跃
                platform_ids = {p["id"] for p in platforms}
                for platform_id, platform in existing_platforms.items():
                    if platform_id not in platform_ids:
                        platform.is_active = False
                
                session.commit()
                logger.info(f"✅ 成功保存 {len(platforms)} 个平台到数据库")
                return True
        except Exception as e:
            logger.error(f"❌ 保存平台列表到数据库失败: {e}", exc_info=True)
            return False

