import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  phoneNumber: text("phone_number").notNull(),
  accountNumber: text("account_number").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deviceFingerprints = pgTable("device_fingerprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceId: text("device_id").notNull(),
  fingerprint: jsonb("fingerprint").notNull(), // Hardware specs, OS, browser
  networkInfo: jsonb("network_info"), // IP, carrier, location
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  trustScore: integer("trust_score").default(50), // 0-100
  isActive: boolean("is_active").default(true),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // debit, credit
  description: text("description").notNull(),
  location: text("location"),
  deviceId: text("device_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  fraudScore: integer("fraud_score").default(0), // 0-100
  status: text("status").default("pending"), // pending, verified, flagged
});

export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(), // sim_swap, phishing, unauthorized_access
  severity: text("severity").notNull(), // low, medium, high, critical
  details: jsonb("details").notNull(),
  deviceId: text("device_id"),
  resolved: boolean("resolved").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const fraudAlerts = pgTable("fraud_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  alertType: text("alert_type").notNull(), // sim_swap, fake_app, phishing, unauthorized
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // warning, danger
  actionRequired: boolean("action_required").default(false),
  dismissed: boolean("dismissed").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const simSwapDetection = pgTable("sim_swap_detection", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  oldCarrier: text("old_carrier"),
  newCarrier: text("new_carrier"),
  oldIMSI: text("old_imsi"),
  newIMSI: text("new_imsi"),
  detectionScore: integer("detection_score"), // 0-100
  verified: boolean("verified").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  phoneNumber: true,
  accountNumber: true,
});

export const insertDeviceFingerprintSchema = createInsertSchema(deviceFingerprints).omit({
  id: true,
  firstSeen: true,
  lastSeen: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
  fraudScore: true,
  status: true,
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  timestamp: true,
  resolved: true,
});

export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  timestamp: true,
  dismissed: true,
});

export const insertSimSwapDetectionSchema = createInsertSchema(simSwapDetection).omit({
  id: true,
  timestamp: true,
  verified: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DeviceFingerprint = typeof deviceFingerprints.$inferSelect;
export type InsertDeviceFingerprint = z.infer<typeof insertDeviceFingerprintSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;
export type SimSwapDetection = typeof simSwapDetection.$inferSelect;
export type InsertSimSwapDetection = z.infer<typeof insertSimSwapDetectionSchema>;
