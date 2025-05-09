/**
 * MoodSync Admin Panel Schema Extensions
 * This file defines additional schema tables needed for the enhanced admin features
 */

import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { adminUsers, users } from "./schema";

/**
 * Admin-specific types
 */

// Comprehensive admin role hierarchy
export type AdminRoleHierarchy = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT";

// Content moderation status
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "FROZEN";

// Possible flagged content types
export type FlaggedContentType = "JOURNAL" | "CHAT_MESSAGE" | "NFT_ITEM" | "USER_PROFILE" | "VIDEO";

// Reason categorization for flagged content
export type FlagReason = 
  | "HARMFUL_CONTENT" 
  | "HATE_SPEECH" 
  | "HARASSMENT" 
  | "MISINFORMATION" 
  | "ADULT_CONTENT" 
  | "VIOLENT_CONTENT"
  | "SELF_HARM"
  | "COPYRIGHT_VIOLATION"
  | "SPAM"
  | "OTHER";

// User ban types
export type BanType = "TEMPORARY" | "PERMANENT" | "SHADOW";

// System health areas
export type SystemArea = "API" | "DATABASE" | "STORAGE" | "AUTHENTICATION" | "TOKEN_ECONOMY";

/**
 * Additional tables for Admin Panel
 */

// Audit logs for admin actions with detailed tracking
export const adminActionLogs = pgTable("admin_action_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminUsers.id),
  adminUsername: text("admin_username").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  details: text("details"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Flagged content tracking
export const flaggedContents = pgTable("flagged_contents", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull().$type<FlaggedContentType>(),
  contentId: integer("content_id").notNull(),
  reportedBy: integer("reported_by").references(() => users.id),
  reason: text("reason").notNull().$type<FlagReason>(),
  details: text("details"),
  status: text("status").notNull().$type<ModerationStatus>().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
  moderatedBy: integer("moderated_by").references(() => adminUsers.id),
  moderatedAt: timestamp("moderated_at"),
  adminNotes: text("admin_notes"),
});

// User ban records
export const userBans = pgTable("user_bans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  banType: text("ban_type").notNull().$type<BanType>(),
  reason: text("reason").notNull(),
  details: text("details"),
  bannedBy: integer("banned_by").notNull().references(() => adminUsers.id),
  bannedAt: timestamp("banned_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Null means permanent ban
  isActive: boolean("is_active").default(true),
  ipAddress: text("ip_address"),
  deviceFingerprint: text("device_fingerprint"),
});

// System health metrics
export const systemHealthLogs = pgTable("system_health_logs", {
  id: serial("id").primaryKey(),
  area: text("area").notNull().$type<SystemArea>(),
  metric: text("metric").notNull(),
  value: text("value").notNull(),
  status: text("status").notNull(), // GREEN, YELLOW, RED
  timestamp: timestamp("timestamp").defaultNow(),
  details: json("details"),
});

// Token economy adjustments
export const tokenRateAdjustments = pgTable("token_rate_adjustments", {
  id: serial("id").primaryKey(),
  activityType: text("activity_type").notNull(),
  oldRate: numeric("old_rate").notNull(),
  newRate: numeric("new_rate").notNull(),
  reason: text("reason").notNull(),
  adjustedBy: integer("adjusted_by").notNull().references(() => adminUsers.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Token pool splits (distribution to top contributors)
export const tokenPoolSplits = pgTable("token_pool_splits", {
  id: serial("id").primaryKey(),
  totalAmount: numeric("total_amount").notNull(),
  contributorCount: integer("contributor_count").notNull(),
  donationPercentage: numeric("donation_percentage").notNull(),
  donationAmount: numeric("donation_amount").notNull(),
  distributionAmount: numeric("distribution_amount").notNull(),
  initiatedBy: integer("initiated_by").notNull().references(() => adminUsers.id),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").notNull().default("PENDING"), // PENDING, PROCESSING, COMPLETED, FAILED
  completedAt: timestamp("completed_at"),
  details: json("details"),
});

// Recipient details for token pool splits
export const tokenPoolSplitRecipients = pgTable("token_pool_split_recipients", {
  id: serial("id").primaryKey(),
  splitId: integer("split_id").notNull().references(() => tokenPoolSplits.id),
  userId: integer("user_id").notNull().references(() => users.id),
  currentBalance: numeric("current_balance").notNull(),
  proportion: numeric("proportion").notNull(),
  tokensAwarded: numeric("tokens_awarded").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// System backup records
export const systemBackups = pgTable("system_backups", {
  id: serial("id").primaryKey(),
  backupType: text("backup_type").notNull(), // FULL, INCREMENTAL, DATABASE_ONLY
  destination: text("destination").notNull(), // AWS_S3, AZURE_BLOB, etc.
  initiatedBy: integer("initiated_by").references(() => adminUsers.id),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("PENDING"), // PENDING, IN_PROGRESS, COMPLETED, FAILED
  fileSize: numeric("file_size"), // In bytes
  backupId: text("backup_id").notNull(),
  encryptionStatus: text("encryption_status").notNull().default("ENCRYPTED"),
  storageLocation: text("storage_location").notNull(),
  retentionPeriod: integer("retention_period"), // In days
});

// API usage metrics
export const apiMetrics = pgTable("api_metrics", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(), // GET, POST, PUT, DELETE
  responseTime: numeric("response_time").notNull(), // In milliseconds
  statusCode: integer("status_code").notNull(),
  ipAddress: text("ip_address"),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
  requestSize: numeric("request_size"), // In bytes
  responseSize: numeric("response_size"), // In bytes
  userAgent: text("user_agent"),
});

/**
 * Insert Schemas for Zod validation
 */
export const insertAdminActionLogSchema = createInsertSchema(adminActionLogs).omit({
  id: true
});

export const insertFlaggedContentSchema = createInsertSchema(flaggedContents).omit({
  id: true,
  createdAt: true,
  moderatedAt: true
});

export const insertUserBanSchema = createInsertSchema(userBans).omit({
  id: true,
  bannedAt: true
});

export const insertSystemHealthLogSchema = createInsertSchema(systemHealthLogs).omit({
  id: true,
  timestamp: true
});

export const insertTokenRateAdjustmentSchema = createInsertSchema(tokenRateAdjustments).omit({
  id: true,
  timestamp: true
});

export const insertTokenPoolSplitSchema = createInsertSchema(tokenPoolSplits).omit({
  id: true,
  timestamp: true,
  completedAt: true
});

/**
 * TypeScript Types for ORM
 */
export type AdminActionLog = typeof adminActionLogs.$inferSelect;
export type InsertAdminActionLog = typeof adminActionLogs.$inferInsert;

export type FlaggedContent = typeof flaggedContents.$inferSelect;
export type InsertFlaggedContent = typeof flaggedContents.$inferInsert;

export type UserBan = typeof userBans.$inferSelect;
export type InsertUserBan = typeof userBans.$inferInsert;

export type SystemHealthLog = typeof systemHealthLogs.$inferSelect;
export type InsertSystemHealthLog = typeof systemHealthLogs.$inferInsert;

export type TokenRateAdjustment = typeof tokenRateAdjustments.$inferSelect;
export type InsertTokenRateAdjustment = typeof tokenRateAdjustments.$inferInsert;

export type TokenPoolSplit = typeof tokenPoolSplits.$inferSelect;
export type InsertTokenPoolSplit = typeof tokenPoolSplits.$inferInsert;

export type TokenPoolSplitRecipient = typeof tokenPoolSplitRecipients.$inferSelect;
export type InsertTokenPoolSplitRecipient = typeof tokenPoolSplitRecipients.$inferInsert;

export type SystemBackup = typeof systemBackups.$inferSelect;
export type InsertSystemBackup = typeof systemBackups.$inferInsert;

export type ApiMetric = typeof apiMetrics.$inferSelect;
export type InsertApiMetric = typeof apiMetrics.$inferInsert;