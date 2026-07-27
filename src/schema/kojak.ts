import {
  pgTable,
  serial,
  text,
  real,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Projects — a repo, .env file, or manual list of keys for one app
// ---------------------------------------------------------------------------

export const kojakProjectsTable = pgTable("kojak_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(), // github_url | env_text | manual
  source: text("source").notNull().default(""),
  status: text("status").notNull().default("pending"), // pending | scanning | complete | failed
  keyCount: integer("key_count").notNull().default(0),
  activeCount: integer("active_count").notNull().default(0),
  deadCount: integer("dead_count").notNull().default(0),
  unknownCount: integer("unknown_count").notNull().default(0),
  monthlyCostUsd: real("monthly_cost_usd").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  scannedAt: timestamp("scanned_at"),
});

export const insertKojakProjectSchema = createInsertSchema(kojakProjectsTable).omit({ id: true, createdAt: true, scannedAt: true });
export type InsertKojakProject = z.infer<typeof insertKojakProjectSchema>;
export type KojakProject = typeof kojakProjectsTable.$inferSelect;

// ---------------------------------------------------------------------------
// Keys — individual API keys discovered or manually added
// ---------------------------------------------------------------------------

export const kojakKeysTable = pgTable("kojak_keys", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => kojakProjectsTable.id, { onDelete: "cascade" }),
  service: text("service").notNull(),           // openai | anthropic | stripe | github | brave | ...
  displayName: text("display_name").notNull(),  // human-readable label e.g. "OpenAI (prod)"
  keyPrefix: text("key_prefix").notNull(),      // first 8-12 chars for identification
  status: text("status").notNull().default("unvalidated"), // active | invalid | unknown | unvalidated
  monthlyCostUsd: real("monthly_cost_usd").notNull().default(0),
  notes: text("notes").notNull().default(""),
  addedAt: timestamp("added_at").notNull().defaultNow(),
  validatedAt: timestamp("validated_at"),
});

export const insertKojakKeySchema = createInsertSchema(kojakKeysTable).omit({ id: true, addedAt: true, validatedAt: true });
export type InsertKojakKey = z.infer<typeof insertKojakKeySchema>;
export type KojakKey = typeof kojakKeysTable.$inferSelect;
