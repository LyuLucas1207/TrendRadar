/**
 * User 表模型定义
 * 使用 Drizzle ORM
 */
import { pgTable, text, bigint, index } from "drizzle-orm/pg-core";

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    email: text("email"),
    data: text("data").default(""),
    type: text("type").notNull(),
    created: bigint("created", { mode: "number" }).notNull(),
    updated: bigint("updated", { mode: "number" }).notNull(),
  },
  (t) => [
    index("idx_user_id").on(t.id),
    index("idx_user_email").on(t.email),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
