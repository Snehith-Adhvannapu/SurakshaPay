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
  // Rural banking context - essential for rural users
  village: text("village"), // Village name for rural context
  district: text("district"), // District for location-based fraud detection
  state: text("state"), // State for regulatory compliance
  isAgent: boolean("is_agent").default(false), // Banking agent flag
  agentCode: text("agent_code"), // Agent identification code
  preferredLanguage: text("preferred_language").default("en"), // Multi-language support
  // Mobile optimization fields
  deviceType: text("device_type"), // smartphone, feature_phone, tablet
  networkType: text("network_type").default("4g"), // 2g, 3g, 4g, wifi
  trustScore: integer("trust_score").default(100), // 0-100 user trust score
  accountBalance: decimal("account_balance", { precision: 10, scale: 2 }).default("0.00"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  isBlocked: boolean("is_blocked").default(false),
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
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Reduced precision for mobile
  type: text("type").notNull(), // deposit, withdrawal, transfer, payment
  description: text("description"),
  location: text("location"),
  deviceId: text("device_id"),
  // Rural banking enhancements
  agentId: varchar("agent_id").references(() => users.id), // Agent who assisted
  networkType: text("network_type").default("4g"), // Network used for transaction
  isOfflineTransaction: boolean("is_offline").default(false), // Offline transaction flag
  batteryLevel: integer("battery_level"), // Device battery during transaction
  riskLevel: text("risk_level").default("low"), // low, medium, high, critical
  mlModel: text("ml_model"), // Which ML model detected risk (svm, lof, hmm, rnn)
  mlConfidence: decimal("ml_confidence", { precision: 5, scale: 2 }), // ML confidence %
  fraudFlags: text("fraud_flags"), // JSON array of fraud indicators
  // Original fields
  timestamp: timestamp("timestamp").defaultNow(),
  fraudScore: integer("fraud_score").default(0), // 0-100
  status: text("status").default("pending"), // pending, verified, flagged, blocked
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
  transactionId: varchar("transaction_id").references(() => transactions.id),
  alertType: text("alert_type").notNull(), // unusual_amount, new_device, location_change, sim_swap, phishing
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  // Enhanced rural banking fields
  mlModel: text("ml_model"), // Which ML model triggered alert
  mlConfidence: decimal("ml_confidence", { precision: 5, scale: 2 }), // Confidence percentage
  riskFactors: text("risk_factors"), // JSON array of risk factors
  location: text("location"), // Where alert was triggered
  deviceInfo: text("device_info"), // Compressed device information
  networkType: text("network_type"), // Network when alert triggered
  agentId: varchar("agent_id").references(() => users.id), // Agent who can resolve
  // Actions and resolution
  actionRequired: boolean("action_required").default(false),
  actionTaken: text("action_taken"), // blocked, flagged, approved, sms_sent
  dismissed: boolean("dismissed").default(false),
  resolvedAt: timestamp("resolved_at"),
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
