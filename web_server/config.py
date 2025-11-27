"""
配置管理模块
"""
import os
from dataclasses import dataclass


@dataclass
class AppConfig:
    """应用配置"""
    project_root: str
    host: str = "0.0.0.0"
    port: int = 10199
    output_dir: str = "output"
    debug: bool = False
    
    @classmethod
    def from_env(cls) -> "AppConfig":
        """从环境变量创建配置"""
        project_root = os.getenv("PROJECT_ROOT", "/app")
        output_dir = os.path.join(project_root, "output")
        
        return cls(
            project_root=project_root,
            host=os.getenv("HOST", "0.0.0.0"),
            port=int(os.getenv("PORT", "10199")),
            output_dir=output_dir,
            debug=os.getenv("DEBUG", "false").lower() == "true"
        )
    
    @property
    def output_path(self) -> str:
        """输出目录的完整路径"""
        return os.path.join(self.project_root, self.output_dir)


# 全局配置实例
config = AppConfig.from_env()

