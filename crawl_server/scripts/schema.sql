-- ============================================
-- TrendRadar 数据库表结构定义
-- ============================================

-- ============================================
-- 1. word_groups 表 - 词组管理
-- ============================================
CREATE TABLE IF NOT EXISTS word_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(200) NOT NULL UNIQUE,  -- 词组名称（显示用，可以是中文）
    group_key VARCHAR(200) NOT NULL UNIQUE,  -- 组键（唯一标识符，英文，用于匹配和标识）
    max_count INTEGER DEFAULT 0,  -- 最大显示数量（@数字），0=不限制
    description TEXT,  -- 描述信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_word_groups_name ON word_groups(group_name);
CREATE INDEX IF NOT EXISTS idx_word_groups_key ON word_groups(group_key);

-- ============================================
-- 2. frequency_words 表 - 频率词存储
-- ============================================
CREATE TABLE IF NOT EXISTS frequency_words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,  -- 频率词
    word_group_id INTEGER NOT NULL,  -- 所属词组ID（外键，必填）
    filter_rule_prefix VARCHAR(50),  -- 规则前缀（用于未来扩展，如：+, !, @）
    filter_rule_postfix VARCHAR(50),  -- 规则后缀（用于未来扩展）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_group_id) REFERENCES word_groups(id) ON DELETE CASCADE,
    UNIQUE(word, word_group_id, filter_rule_prefix, filter_rule_postfix)  -- 同一词组中，同一规则前缀和后缀的词不能重复
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_frequency_words_word ON frequency_words(word);
CREATE INDEX IF NOT EXISTS idx_frequency_words_group_id ON frequency_words(word_group_id);
CREATE INDEX IF NOT EXISTS idx_frequency_words_filter_rule_prefix ON frequency_words(filter_rule_prefix);

-- ============================================
-- 3. crawl_results 表 - 抓取结果存储
-- ============================================
CREATE TABLE IF NOT EXISTS crawl_results (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100),  -- 抓取会话ID（关联 crawl_sessions）
    platform_id VARCHAR(100) NOT NULL,
    platform_name VARCHAR(200),
    title TEXT,  -- 新闻标题（失败时为空）
    rank INTEGER,  -- 当前排名
    ranks JSONB,  -- 排名列表 [1, 2, 3]
    url TEXT,
    mobile_url TEXT,
    word_groups JSONB,  -- 匹配到的频率词组列表（用于过滤和分析）
    is_success INTEGER DEFAULT 1,  -- 是否成功（1=成功，0=失败）
    error_message TEXT,  -- 错误信息（失败时记录）
    fetch_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- 注意：由于失败记录可能没有 title，所以不设置基于 title 的唯一约束
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_crawl_results_session_id ON crawl_results(session_id);
CREATE INDEX IF NOT EXISTS idx_crawl_results_platform ON crawl_results(platform_id);
CREATE INDEX IF NOT EXISTS idx_crawl_results_fetch_time ON crawl_results(fetch_time);
CREATE INDEX IF NOT EXISTS idx_crawl_results_title ON crawl_results USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_crawl_results_created_at ON crawl_results(created_at);
CREATE INDEX IF NOT EXISTS idx_crawl_results_is_success ON crawl_results(is_success);

-- ============================================
-- 4. title_history 表 - 标题历史追踪
-- ============================================
CREATE TABLE IF NOT EXISTS title_history (
    id BIGSERIAL PRIMARY KEY,
    platform_id VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    first_seen TIMESTAMP NOT NULL,
    last_seen TIMESTAMP NOT NULL,
    appearance_count INTEGER DEFAULT 1,
    ranks JSONB,  -- 所有出现过的排名列表
    url TEXT,
    mobile_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform_id, title)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_title_history_platform ON title_history(platform_id);
CREATE INDEX IF NOT EXISTS idx_title_history_last_seen ON title_history(last_seen);
CREATE INDEX IF NOT EXISTS idx_title_history_title ON title_history USING gin(to_tsvector('english', title));

-- ============================================
-- 5. crawl_sessions 表 - 抓取会话记录
-- ============================================
CREATE TABLE IF NOT EXISTS crawl_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    trigger_source VARCHAR(50) NOT NULL,  -- manual, scheduled, api
    total_platforms INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    failed_ids JSONB,  -- 失败的平台ID列表
    platforms JSONB,  -- 使用的平台ID列表，格式: ["toutiao", "baidu", "weibo", ...]
    word_groups JSONB,  -- 使用的频率词组列表
    filter_words JSONB,  -- 使用的过滤词列表
    total_news_count INTEGER DEFAULT 0,  -- 抓取到的新闻总数
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running',  -- running, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_session_id ON crawl_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_started_at ON crawl_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_status ON crawl_sessions(status);

-- ============================================
-- 6. platforms 表 - 平台信息
-- ============================================
CREATE TABLE IF NOT EXISTS platforms (
    id SERIAL PRIMARY KEY,
    platform_id VARCHAR(100) UNIQUE NOT NULL,
    platform_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_crawl_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_platforms_platform_id ON platforms(platform_id);
CREATE INDEX IF NOT EXISTS idx_platforms_is_active ON platforms(is_active);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_word_groups_updated_at 
    BEFORE UPDATE ON word_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frequency_words_updated_at 
    BEFORE UPDATE ON frequency_words 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_title_history_updated_at 
    BEFORE UPDATE ON title_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platforms_updated_at 
    BEFORE UPDATE ON platforms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 注释说明
-- ============================================
COMMENT ON TABLE word_groups IS '词组表，管理频率词的分组信息';
COMMENT ON TABLE frequency_words IS '频率词表，存储用于筛选新闻的关键词，关联到词组';
COMMENT ON TABLE crawl_results IS '抓取结果表，存储每次抓取的新闻标题数据';
COMMENT ON TABLE title_history IS '标题历史追踪表，记录标题的首次和最后出现时间';
COMMENT ON TABLE crawl_sessions IS '抓取会话表，记录每次抓取任务的元信息';
COMMENT ON TABLE platforms IS '平台信息表，存储监控的新闻平台信息';

-- ============================================
-- 字段说明
-- ============================================
COMMENT ON COLUMN word_groups.group_name IS '词组名称（唯一标识）';
COMMENT ON COLUMN word_groups.group_key IS '组键（用于匹配，由普通词用空格连接组成）';
COMMENT ON COLUMN word_groups.max_count IS '最大显示数量（@数字），0=不限制';
COMMENT ON COLUMN frequency_words.filter_rule IS '规则类型：NULL=普通词, ''+''=必须词, ''!''=过滤词（注意：''@''数量限制存储在word_groups.max_count中）';
COMMENT ON COLUMN frequency_words.required_words IS '必须词列表（当 filter_rule=''+'' 时，存储该组的所有必须词）';

