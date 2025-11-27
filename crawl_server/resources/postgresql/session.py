# coding=utf-8

"""
PostgreSQL SQLAlchemy 会话管理

提供 SQLAlchemy ORM 的数据库会话
"""
import logging
from typing import Optional
from contextlib import contextmanager

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, Session
    from sqlalchemy.pool import QueuePool
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False
    logging.warning("sqlalchemy 未安装，SQLAlchemy ORM 功能将不可用")


class DatabaseSession:
    """SQLAlchemy 数据库会话管理"""
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 5432,
        database: str = "trendradar",
        user: str = "postgres",
        password: str = "",
        pool_size: int = 10,
        max_overflow: int = 20,
        enable_postgresql: bool = False
    ):
        """
        初始化数据库会话
        
        Args:
            host: 数据库主机
            port: 数据库端口
            database: 数据库名称
            user: 用户名
            password: 密码
            pool_size: 连接池大小
            max_overflow: 最大溢出连接数
            enable_postgresql: 是否启用 PostgreSQL
        """
        self.host = host
        self.port = port
        self.database = database
        self.user = user
        self.password = password
        self.enable_postgresql = enable_postgresql and SQLALCHEMY_AVAILABLE
        self.engine = None
        self.SessionLocal = None
        self.logger = logging.getLogger(__name__)
        
        if self.enable_postgresql:
            try:
                # 创建数据库连接 URL（添加 UTF-8 编码参数）
                database_url = f"postgresql://{user}:{password}@{host}:{port}/{database}?client_encoding=utf8"
                
                # 创建引擎
                self.engine = create_engine(
                    database_url,
                    poolclass=QueuePool,
                    pool_size=pool_size,
                    max_overflow=max_overflow,
                    pool_pre_ping=True,  # 连接前检查连接是否有效
                    echo=False,  # 设置为 True 可以打印 SQL 语句（调试用）
                    connect_args={"client_encoding": "utf8"}  # 确保客户端编码为 UTF-8
                )
                
                # 创建会话工厂
                self.SessionLocal = sessionmaker(
                    autocommit=False,
                    autoflush=False,
                    bind=self.engine
                )
                
                self.logger.info(f"✅ SQLAlchemy 数据库会话初始化成功: {host}:{port}/{database}")
            except Exception as e:
                self.logger.error(f"❌ SQLAlchemy 数据库会话初始化失败: {e}")
                self.enable_postgresql = False
        else:
            if not SQLALCHEMY_AVAILABLE:
                self.logger.warning("⚠️  sqlalchemy 未安装，请运行: pip install sqlalchemy")
            else:
                self.logger.info("ℹ️  SQLAlchemy PostgreSQL 功能已禁用")
    
    @contextmanager
    def get_session(self):
        """
        获取数据库会话的上下文管理器
        
        Usage:
            with db_session.get_session() as session:
                result = session.query(WordGroup).all()
        """
        if not self.enable_postgresql or not self.SessionLocal:
            raise RuntimeError("SQLAlchemy 未启用或会话未初始化")
        
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    def _ensure_database_exists(self):
        """
        确保数据库存在，如果不存在则创建
        
        Returns:
            bool: 是否成功
        """
        if not self.enable_postgresql:
            return False
        
        try:
            import psycopg2
            from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
            
            # 连接到 postgres 数据库（默认数据库），确保使用 UTF-8 编码
            conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database='postgres',  # 连接到默认数据库
                client_encoding='utf8'  # 确保客户端编码为 UTF-8
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            
            # 检查数据库是否存在
            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (self.database,)
            )
            exists = cursor.fetchone()
            
            if not exists:
                # 创建数据库（指定 UTF-8 编码）
                cursor.execute(f"CREATE DATABASE \"{self.database}\" ENCODING 'UTF8'")
                self.logger.info(f"✅ 数据库创建成功: {self.database} (UTF-8)")
            else:
                self.logger.debug(f"✅ 数据库已存在: {self.database}")
            
            cursor.close()
            conn.close()
            return True
        except Exception as e:
            self.logger.warning(f"⚠️  检查/创建数据库失败（将尝试继续）: {e}")
            # 不抛出异常，可能数据库已存在或权限问题
            return False
    
    def create_tables(self):
        """
        创建所有数据库表（基于 ORM 模型）
        
        注意：这只会创建不存在的表，不会删除或修改已存在的表
        """
        if not self.enable_postgresql or not self.engine:
            self.logger.warning("⚠️  数据库未启用，无法创建表")
            return False
        
        try:
            # 先确保数据库存在
            self._ensure_database_exists()
            
            # 导入所有模型以确保它们被注册到 Base.metadata
            from crawl_server.models import Base
            
            # 创建所有表
            Base.metadata.create_all(bind=self.engine)
            self.logger.info("✅ 数据库表创建成功（如果表已存在则跳过）")
            return True
        except Exception as e:
            self.logger.error(f"❌ 创建数据库表失败: {e}", exc_info=True)
            return False
    
    def close(self):
        """关闭数据库连接"""
        if self.engine:
            try:
                self.engine.dispose()
                self.logger.info("✅ SQLAlchemy 数据库连接已关闭")
            except Exception as e:
                self.logger.error(f"❌ 关闭数据库连接时出错: {e}")

