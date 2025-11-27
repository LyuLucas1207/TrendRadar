-- ============================================
-- 插入平台数据到 platforms 表
-- ============================================
-- 注意：如果平台已存在，可以使用 ON CONFLICT 更新或忽略

-- 方式1：直接插入（如果已存在会报错，需要先删除）
INSERT INTO platforms (platform_id, platform_name, is_active) VALUES
('toutiao', '今日头条', true),
('baidu', '百度热搜', true),
('wallstreetcn-hot', '华尔街见闻', true),
('thepaper', '澎湃新闻', true),
('bilibili-hot-search', 'bilibili 热搜', true),
('cls-hot', '财联社热门', true),
('ifeng', '凤凰网', true),
('tieba', '贴吧', true),
('weibo', '微博', true),
('douyin', '抖音', true),
('zhihu', '知乎', true);

-- 方式2：使用 ON CONFLICT 更新（推荐，如果已存在则更新名称）
INSERT INTO platforms (platform_id, platform_name, is_active) VALUES
('toutiao', '今日头条', true),
('baidu', '百度热搜', true),
('wallstreetcn-hot', '华尔街见闻', true),
('thepaper', '澎湃新闻', true),
('bilibili-hot-search', 'bilibili 热搜', true),
('cls-hot', '财联社热门', true),
('ifeng', '凤凰网', true),
('tieba', '贴吧', true),
('weibo', '微博', true),
('douyin', '抖音', true),
('zhihu', '知乎', true)
ON CONFLICT (platform_id) 
DO UPDATE SET 
    platform_name = EXCLUDED.platform_name,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 方式3：先删除再插入（如果表是空的）
-- DELETE FROM platforms;
-- 然后执行方式1的 INSERT 语句

-- ============================================
-- 查询验证
-- ============================================
-- 查看所有平台
SELECT * FROM platforms ORDER BY id;

-- 查看启用的平台
SELECT platform_id, platform_name, is_active, created_at 
FROM platforms 
WHERE is_active = true 
ORDER BY platform_id;

