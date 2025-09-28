import { 
  type User, type InsertUser,
  type DeviceFingerprint, type InsertDeviceFingerprint,
  type Transaction, type InsertTransaction,
  type SecurityEvent, type InsertSecurityEvent,
  type FraudAlert, type InsertFraudAlert,
  type SimSwapDetection, type InsertSimSwapDetection
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device fingerprint operations
  createDeviceFingerprint(fingerprint: InsertDeviceFingerprint): Promise<DeviceFingerprint>;
  getDeviceFingerprint(deviceId: string, userId: string): Promise<DeviceFingerprint | undefined>;
  updateDeviceFingerprint(id: string, updates: Partial<DeviceFingerprint>): Promise<DeviceFingerprint | undefined>;
  getUserDevices(userId: string): Promise<DeviceFingerprint[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  updateTransactionFraudScore(id: string, fraudScore: number): Promise<void>;
  updateTransactionStatus(id: string, status: string): Promise<void>;
  
  // Security event operations
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  getUserSecurityEvents(userId: string, unresolved?: boolean): Promise<SecurityEvent[]>;
  resolveSecurityEvent(id: string): Promise<void>;
  
  // Fraud alert operations
  createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert>;
  getUserFraudAlerts(userId: string, active?: boolean): Promise<FraudAlert[]>;
  dismissFraudAlert(id: string): Promise<void>;
  
  // SIM swap detection operations
  createSimSwapDetection(detection: InsertSimSwapDetection): Promise<SimSwapDetection>;
  getUserSimSwapEvents(userId: string): Promise<SimSwapDetection[]>;
  verifySimSwapEvent(id: string): Promise<void>;
  
  // Agent transaction operations
  getAgentTransactions(agentId: string, days: number, offsetDays?: number): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private deviceFingerprints: Map<string, DeviceFingerprint>;
  private transactions: Map<string, Transaction>;
  private securityEvents: Map<string, SecurityEvent>;
  private fraudAlerts: Map<string, FraudAlert>;
  private simSwapDetections: Map<string, SimSwapDetection>;

  constructor() {
    this.users = new Map();
    this.deviceFingerprints = new Map();
    this.transactions = new Map();
    this.securityEvents = new Map();
    this.fraudAlerts = new Map();
    this.simSwapDetections = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Device fingerprint operations
  async createDeviceFingerprint(insertFingerprint: InsertDeviceFingerprint): Promise<DeviceFingerprint> {
    const id = randomUUID();
    const fingerprint: DeviceFingerprint = {
      ...insertFingerprint,
      id,
      firstSeen: new Date(),
      lastSeen: new Date(),
      trustScore: insertFingerprint.trustScore ?? 50,
      isActive: insertFingerprint.isActive ?? true,
      networkInfo: insertFingerprint.networkInfo || null
    };
    this.deviceFingerprints.set(id, fingerprint);
    return fingerprint;
  }

  async getDeviceFingerprint(deviceId: string, userId: string): Promise<DeviceFingerprint | undefined> {
    return Array.from(this.deviceFingerprints.values()).find(
      (fp) => fp.deviceId === deviceId && fp.userId === userId
    );
  }

  async updateDeviceFingerprint(id: string, updates: Partial<DeviceFingerprint>): Promise<DeviceFingerprint | undefined> {
    const fingerprint = this.deviceFingerprints.get(id);
    if (!fingerprint) return undefined;
    
    const updated = { ...fingerprint, ...updates, lastSeen: new Date() };
    this.deviceFingerprints.set(id, updated);
    return updated;
  }

  async getUserDevices(userId: string): Promise<DeviceFingerprint[]> {
    return Array.from(this.deviceFingerprints.values()).filter(
      (fp) => fp.userId === userId
    );
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
      fraudScore: 0,
      status: "pending",
      deviceId: insertTransaction.deviceId || null,
      location: insertTransaction.location || null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async updateTransactionFraudScore(id: string, fraudScore: number): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.fraudScore = fraudScore;
      this.transactions.set(id, transaction);
    }
  }

  async updateTransactionStatus(id: string, status: string): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.status = status;
      this.transactions.set(id, transaction);
    }
  }

  // Security event operations
  async createSecurityEvent(insertEvent: InsertSecurityEvent): Promise<SecurityEvent> {
    const id = randomUUID();
    const event: SecurityEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
      resolved: false,
      deviceId: insertEvent.deviceId || null
    };
    this.securityEvents.set(id, event);
    return event;
  }

  async getUserSecurityEvents(userId: string, unresolved?: boolean): Promise<SecurityEvent[]> {
    const events = Array.from(this.securityEvents.values())
      .filter((event) => event.userId === userId);
    
    if (unresolved) {
      return events.filter((event) => !event.resolved);
    }
    
    return events.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async resolveSecurityEvent(id: string): Promise<void> {
    const event = this.securityEvents.get(id);
    if (event) {
      event.resolved = true;
      this.securityEvents.set(id, event);
    }
  }

  // Fraud alert operations
  async createFraudAlert(insertAlert: InsertFraudAlert): Promise<FraudAlert> {
    const id = randomUUID();
    const alert: FraudAlert = {
      ...insertAlert,
      id,
      timestamp: new Date(),
      dismissed: false,
      actionRequired: insertAlert.actionRequired || null
    };
    this.fraudAlerts.set(id, alert);
    return alert;
  }

  async getUserFraudAlerts(userId: string, active?: boolean): Promise<FraudAlert[]> {
    const alerts = Array.from(this.fraudAlerts.values())
      .filter((alert) => alert.userId === userId);
    
    if (active) {
      return alerts.filter((alert) => !alert.dismissed);
    }
    
    return alerts.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async dismissFraudAlert(id: string): Promise<void> {
    const alert = this.fraudAlerts.get(id);
    if (alert) {
      alert.dismissed = true;
      this.fraudAlerts.set(id, alert);
    }
  }

  // SIM swap detection operations
  async createSimSwapDetection(insertDetection: InsertSimSwapDetection): Promise<SimSwapDetection> {
    const id = randomUUID();
    const detection: SimSwapDetection = {
      ...insertDetection,
      id,
      timestamp: new Date(),
      verified: false,
      oldCarrier: insertDetection.oldCarrier || null,
      newCarrier: insertDetection.newCarrier || null,
      oldIMSI: insertDetection.oldIMSI || null,
      newIMSI: insertDetection.newIMSI || null,
      detectionScore: insertDetection.detectionScore || null
    };
    this.simSwapDetections.set(id, detection);
    return detection;
  }

  async getUserSimSwapEvents(userId: string): Promise<SimSwapDetection[]> {
    return Array.from(this.simSwapDetections.values())
      .filter((detection) => detection.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async verifySimSwapEvent(id: string): Promise<void> {
    const detection = this.simSwapDetections.get(id);
    if (detection) {
      detection.verified = true;
      this.simSwapDetections.set(id, detection);
    }
  }

  // Agent transaction operations
  async getAgentTransactions(agentId: string, days: number, offsetDays?: number): Promise<Transaction[]> {
    const now = new Date();
    const startTime = new Date(now.getTime() - (days + (offsetDays || 0)) * 24 * 60 * 60 * 1000);
    const endTime = offsetDays ? new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000) : now;

    return Array.from(this.transactions.values())
      .filter((tx) => {
        const txDate = new Date(tx.timestamp!);
        return tx.userId === agentId && txDate >= startTime && txDate <= endTime;
      })
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }
}

export const storage = new MemStorage();
