/**
 * News 表模型定义
 * 使用 Drizzle ORM
 */
import { pgTable, text, bigint, index, jsonb } from "drizzle-orm/pg-core";

export const news = pgTable(
  "news",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id").notNull(),
    originalId: text("original_id").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    mobileUrl: text("mobile_url"),
    pubDate: text("pub_date"),
    extra: text("extra"), // 存储为 JSON 字符串
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (t) => [
    index("idx_news_id").on(t.id),
    index("idx_news_source_id").on(t.sourceId),
    index("idx_news_created_at").on(t.createdAt),
    index("idx_news_updated_at").on(t.updatedAt),
  ]
);

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;

