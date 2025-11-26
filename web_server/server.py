"""
TrendRadar Web Server - 启动脚本

用于在 Docker 中启动 Web 服务器
"""
import os
import sys

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

