import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Scans
// ---------------------------------------------------------------------------

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(), // github_url | package_json | requirements_txt | gemfile | go_mod | manual
  source: text("source").notNull(),
  status: text("status").notNull().default("pending"), // pending | scanning | complete | failed
  errorMessage: text("error_message"),
  vulnCount: integer("vuln_count").notNull().default(0),
  codeIssueCount: integer("code_issue_count").notNull().default(0),
  componentCount: integer("component_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({ id: true, createdAt: true, completedAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;

// ---------------------------------------------------------------------------
// Vulnerabilities
// ---------------------------------------------------------------------------

export const vulnerabilitiesTable = pgTable("vulnerabilities", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id, { onDelete: "cascade" }),
  packageName: text("package_name").notNull(),
  installedVersion: text("installed_version").notNull(),
  fixedVersion: text("fixed_version"),
  cveId: text("cve_id"),
  severity: text("severity").notNull().default("unknown"), // critical | high | medium | low | unknown
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  cvssScore: real("cvss_score"),
  referenceUrl: text("reference_url"),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilitiesTable).omit({ id: true });
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilitiesTable.$inferSelect;

// ---------------------------------------------------------------------------
// Code Issues (static analysis)
// ---------------------------------------------------------------------------

export const codeIssuesTable = pgTable("code_issues", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id, { onDelete: "cascade" }),
  filePath: text("file_path"),
  lineNumber: integer("line_number"),
  ruleId: text("rule_id").notNull(),
  category: text("category").notNull().default("general"),
  severity: text("severity").notNull().default("warning"), // error | warning | info
  message: text("message").notNull(),
});

export const insertCodeIssueSchema = createInsertSchema(codeIssuesTable).omit({ id: true });
export type InsertCodeIssue = z.infer<typeof insertCodeIssueSchema>;
export type CodeIssue = typeof codeIssuesTable.$inferSelect;

// ---------------------------------------------------------------------------
// SBOM Components
// ---------------------------------------------------------------------------

export const sbomComponentsTable = pgTable("sbom_components", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: text("version").notNull(),
  ecosystem: text("ecosystem").notNull(), // npm | pypi | rubygems | go | maven
  license: text("license"),
  isDirect: boolean("is_direct").notNull().default(false),
  purl: text("purl"),
});

export const insertSbomComponentSchema = createInsertSchema(sbomComponentsTable).omit({ id: true });
export type InsertSbomComponent = z.infer<typeof insertSbomComponentSchema>;
export type SbomComponent = typeof sbomComponentsTable.$inferSelect;
