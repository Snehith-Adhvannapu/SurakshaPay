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
  
  // Demo data operations
  getDemoStatistics(): Promise<any>;
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
    
    // Initialize with realistic demo data for SIH presentation
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo users with rural banking context
    const demoUser: User = {
      id: 'demo-user-1',
      username: 'rajesh_kumar',
      passwordHash: '$2b$10$K8qVZ1Q2R5m3N4s7P9X8YO.HIJklmnopqrstuvwxyz',
      passwordSalt: '$2b$10$K8qVZ1Q2R5m3N4s7P9X8YO',
      phoneNumber: '+91 94567 89012',
      accountNumber: '12345678901234',
      createdAt: new Date('2024-01-15')
    };
    this.users.set('demo-user-1', demoUser);

    // Create realistic transaction history
    const demoTransactions = [
      // Recent legitimate transactions
      {
        id: 'txn-001',
        userId: 'demo-user-1',
        type: 'credit' as const,
        amount: '5000.00',
        description: 'Agricultural subsidy - Kisan Credit Card',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        location: 'Dharwad, Karnataka',
        status: 'completed' as const,
        fraudScore: 15,
        isOffline: false,
        agentId: 'agent-001'
      },
      {
        id: 'txn-002',
        userId: 'demo-user-1',
        type: 'debit' as const,
        amount: '1200.00',
        description: 'Fertilizer purchase - Cooperative Society',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        location: 'Dharwad, Karnataka',
        status: 'completed' as const,
        fraudScore: 8,
        isOffline: true,
        agentId: 'agent-001'
      },
      {
        id: 'txn-003',
        userId: 'demo-user-1',
        type: 'debit' as const,
        amount: '500.00',
        description: 'Mobile recharge - Airtel',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        location: 'Dharwad, Karnataka',
        status: 'completed' as const,
        fraudScore: 5,
        isOffline: false,
        agentId: null
      },
      // Suspicious transaction (high fraud score)
      {
        id: 'txn-004',
        userId: 'demo-user-1',
        type: 'debit' as const,
        amount: '25000.00',
        description: 'Online purchase - Unknown merchant',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
        location: 'Mumbai, Maharashtra', // Unusual location
        status: 'blocked' as const,
        fraudScore: 92, // Very high fraud score
        isOffline: false,
        agentId: null
      },
      {
        id: 'txn-005',
        userId: 'demo-user-1',
        type: 'credit' as const,
        amount: '3500.00',
        description: 'Crop sale - Mandi transaction',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        location: 'Hubli, Karnataka',
        status: 'completed' as const,
        fraudScore: 12,
        isOffline: true,
        agentId: 'agent-002'
      },
      {
        id: 'txn-006',
        userId: 'demo-user-1',
        type: 'debit' as const,
        amount: '800.00',
        description: 'Medicine purchase - Jan Aushadhi',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        location: 'Dharwad, Karnataka',
        status: 'completed' as const,
        fraudScore: 6,
        isOffline: false,
        agentId: null
      },
      {
        id: 'txn-007',
        userId: 'demo-user-1',
        type: 'debit' as const,
        amount: '15000.00',
        description: 'ATM withdrawal - unusual timing',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        location: 'Bangalore, Karnataka', // Different city
        status: 'flagged' as const,
        fraudScore: 78, // High fraud score
        isOffline: false,
        agentId: null
      }
    ];

    demoTransactions.forEach(tx => {
      this.transactions.set(tx.id, tx as Transaction);
    });

    // Create fraud alerts
    const demoFraudAlerts = [
      {
        id: 'alert-001',
        userId: 'demo-user-1',
        alertType: 'location_anomaly' as const,
        title: 'Unusual Transaction Location Detected',
        description: 'Large withdrawal attempted from Bangalore, 350km from your usual location',
        severity: 'high' as const,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isActive: true,
        metadata: {
          transactionId: 'txn-007',
          suspiciousLocation: 'Bangalore, Karnataka',
          usualLocation: 'Dharwad, Karnataka',
          distance: '348 km'
        },
        actionRequired: true
      },
      {
        id: 'alert-002',
        userId: 'demo-user-1',
        alertType: 'transaction_amount' as const,
        title: 'High-Value Transaction Blocked',
        description: 'Transaction of ₹25,000 blocked due to suspicious merchant and location',
        severity: 'critical' as const,
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
        isActive: true,
        metadata: {
          transactionId: 'txn-004',
          amount: '25000.00',
          merchant: 'Unknown merchant',
          riskFactors: ['unusual_location', 'high_amount', 'unknown_merchant', 'no_previous_history']
        },
        actionRequired: true
      },
      {
        id: 'alert-003',
        userId: 'demo-user-1',
        alertType: 'sim_swap_attempt' as const,
        title: 'SIM Swap Attempt Detected',
        description: 'Suspicious SIM card activity detected on your registered mobile number',
        severity: 'critical' as const,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isActive: true,
        metadata: {
          oldIMEI: '867532045123456',
          newIMEI: '867532045987654',
          carrier: 'Airtel',
          riskScore: 95
        },
        actionRequired: true
      }
    ];

    demoFraudAlerts.forEach(alert => {
      this.fraudAlerts.set(alert.id, alert as FraudAlert);
    });

    // Create device fingerprints
    const demoDevices = [
      {
        id: 'device-001',
        userId: 'demo-user-1',
        deviceId: 'samsung-galaxy-m32-001',
        fingerprint: JSON.stringify({
          "userAgent": "Mozilla/5.0 (Linux; Android 11; SM-M325F)",
          "screen": "720x1600",
          "timezone": "Asia/Kolkata",
          "language": "hi-IN",
          "platform": "Android"
        }),
        deviceType: 'mobile' as const,
        browserInfo: 'Chrome Mobile 118.0',
        osInfo: 'Android 11',
        location: 'Dharwad, Karnataka',
        ipAddress: '203.192.xxx.xxx',
        firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        trustScore: 95,
        isActive: true,
        networkInfo: {
          carrier: 'Airtel',
          connectionType: '4G',
          strength: 'good'
        }
      },
      {
        id: 'device-002',
        userId: 'demo-user-1',
        deviceId: 'unknown-device-bangalore',
        fingerprint: JSON.stringify({
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "screen": "1920x1080",
          "timezone": "Asia/Kolkata",
          "language": "en-US",
          "platform": "Windows"
        }),
        deviceType: 'desktop' as const,
        browserInfo: 'Chrome 119.0',
        osInfo: 'Windows 10',
        location: 'Bangalore, Karnataka',
        ipAddress: '49.207.xxx.xxx',
        firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        trustScore: 25, // Low trust score
        isActive: false,
        networkInfo: {
          carrier: 'Unknown',
          connectionType: 'WiFi',
          strength: 'excellent'
        }
      }
    ];

    demoDevices.forEach(device => {
      this.deviceFingerprints.set(device.id, device as DeviceFingerprint);
    });

    // Create security events
    const demoSecurityEvents = [
      {
        id: 'event-001',
        userId: 'demo-user-1',
        eventType: 'failed_login' as const,
        description: 'Multiple failed login attempts from new device',
        severity: 'medium' as const,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isResolved: false,
        metadata: {
          attemptCount: 5,
          deviceId: 'unknown-device-bangalore',
          ipAddress: '49.207.xxx.xxx',
          location: 'Bangalore, Karnataka'
        }
      },
      {
        id: 'event-002',
        userId: 'demo-user-1',
        eventType: 'device_change' as const,
        description: 'New device fingerprint detected',
        severity: 'low' as const,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isResolved: true,
        metadata: {
          newDeviceId: 'device-002',
          location: 'Bangalore, Karnataka',
          riskScore: 75
        }
      }
    ];

    demoSecurityEvents.forEach(event => {
      this.securityEvents.set(event.id, event as SecurityEvent);
    });

    // Create SIM swap detection records
    const demoSimSwapEvents = [
      {
        id: 'sim-001',
        userId: 'demo-user-1',
        oldIMEI: '867532045123456',
        newIMEI: '867532045987654',
        carrierName: 'Airtel',
        detectionTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isVerified: false,
        riskScore: 95,
        additionalInfo: {
          changeLocation: 'Bangalore, Karnataka',
          changeReason: 'Unknown',
          previousLocation: 'Dharwad, Karnataka',
          timeSinceLastChange: '180 days'
        }
      }
    ];

    demoSimSwapEvents.forEach(event => {
      this.simSwapDetections.set(event.id, event as SimSwapDetection);
    });
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
