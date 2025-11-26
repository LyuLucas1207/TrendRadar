# coding=utf-8

"""
TrendRadar Fetch Server - 主入口

负责启动新闻分析服务
"""
from fetch_server.analyzers import NewsAnalyzer
from fetch_server.configs import CONFIG, VERSION

print("=" * 60)
print(f"  Fetch Server Version: {VERSION}")
print("=" * 60)
print(f"TrendRadar v{VERSION} 配置加载完成")
print(f"监控平台数量: {len(CONFIG['PLATFORMS'])}")


def main():
    try:
        analyzer = NewsAnalyzer()
        analyzer.run()
    except FileNotFoundError as e:
        print(f"❌ 配置文件错误: {e}")
        print("\n请确保以下文件存在:")
        print("  • config/config.yaml")
        print("  • config/frequency_words.txt")
        print("\n参考项目文档进行正确配置")
    except Exception as e:
        print(f"❌ 程序运行错误: {e}")
        raise


if __name__ == "__main__":
    main()
