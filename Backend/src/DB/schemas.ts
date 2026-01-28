import {
  pgTable,
  text,
  serial,
  boolean,
  timestamp,
  jsonb,
  check,
} from "drizzle-orm/pg-core";
import { OTPTempData } from "../types/interfaces";
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
