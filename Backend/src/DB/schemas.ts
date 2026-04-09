import {
  pgTable,
  text,
  serial,
  boolean,
  timestamp,
  jsonb,
  integer,
  check,
  decimal,
  varchar,
  smallint,
} from "drizzle-orm/pg-core";
import { OTPTempData, Product } from "../types/interfaces";
import { sql } from "drizzle-orm";

export const Users = pgTable(
  "Users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    given_name: text("given_name"),
    picture: text("picture"),
    sub: text("sub"),
    isGoogleUser: boolean("is_google_user").default(false),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [check("email_check", sql`${table.email} LIKE '%@%'`)],
);

export const Otps = pgTable("Otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  tempData: jsonb("temp_user_data").notNull().$type<OTPTempData>(),
});

export const Themes = pgTable("Themes", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  themes: jsonb("themes")
    .$type<{ id: number; name: string; color: string }[]>()
    .default([])
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notesTable = pgTable("Notes", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id").references(() => Users.id, {
    onDelete: "cascade",
  }),
  themeId: integer("themes_id"),
  theme: text("theme"),
  picture: text("picture"),
  productTitle: varchar("product_title", { length: 40 }).notNull(),
  products: jsonb("products").notNull().$type<Product>(),
  estimatedTime: timestamp("estimated_time"), // Date
  estcost: decimal("estcost", { precision: 10, scale: 2 }).$type<string>(),
  cost: decimal("cost", { precision: 10, scale: 2 }).$type<string>(),
  message: text("message"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiConversation = pgTable("ai_conversation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  noteId: integer("note_id").references(() => notesTable.id, {
    onDelete: "cascade",
  }),
  messages: jsonb("messages")
    .$type<
      Array<{
        role: "user" | "ai";
        content: string;
        timestamp: string;
      }>
    >()
    .notNull(),
  totalTokens: integer("total_tokens").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userTokenUsage = pgTable("user_token_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  date: timestamp("date").defaultNow().notNull(),
  tokensUsed: integer("tokens_used").default(0),
  maxTokens: integer("max_tokens").default(15000),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
});
