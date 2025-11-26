"""
TrendRadar Web Server - 启动脚本

用于在 Docker 中启动 Web 服务器
"""
import os
import sys
from pathlib import Path

# 设置项目根目录
project_root = os.getenv("PROJECT_ROOT", "/app")
os.chdir(project_root)

# 添加项目根目录到 Python 路径
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import uvicorn
from web_server.main import app
from web_server.config import config

if __name__ == "__main__":
    # 读取版本号
    def _load_version():
        """从 version 文件读取版本号"""
        version_file = Path(project_root) / "web_server" / "version"
        if version_file.exists():
            try:
                with open(version_file, "r", encoding="utf-8") as f:
                    return f.read().strip()
            except Exception:
                pass
        return "1.0.0"  # 默认版本

    version = _load_version()

    print("=" * 60)
    print(f"  Web Server Version: {version}")
    print("=" * 60)
    print("  TrendRadar Web Server - MVC Architecture")
    print("=" * 60)
    print(f"  监听地址: http://{config.host}:{config.port}")
    print(f"  HTML报告: http://{config.host}:{config.port}/report")
    print(f"  项目目录: {config.project_root}")
    print(f"  输出目录: {config.output_path}")
    print(f"  调试模式: {config.debug}")
    print("=" * 60)
    print()
    
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level="debug" if config.debug else "info"
    )

