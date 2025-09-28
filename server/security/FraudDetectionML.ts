import { storage } from "../storage";
import { Transaction, DeviceFingerprint } from "@shared/schema";

export interface TransactionFeatures {
  // Amount features
  amount: number;
  amountZScore: number; // How unusual the amount is for this user
  
  // Timing features
  hourOfDay: number;
  dayOfWeek: number;
  isWeekend: boolean;
  isNightTime: boolean; // 10 PM - 6 AM
  
  // Location features
  locationRisk: number; // 0-100, based on typical user locations
  newLocation: boolean;
  
  // Device features
  deviceTrustScore: number;
  newDevice: boolean;
  deviceClassChange: boolean; // User switching from low-end to high-end device
  
  // Behavioral features
  transactionVelocity: number; // Transactions per hour
  amountVelocity: number; // Total amount per hour
  timeSinceLastTransaction: number; // Minutes
  
  // Rural-specific features
  ruralDeviceLikelihood: number;
  connectionType: string; // 2G, 3G, 4G, wifi
  networkStability: number; // How often user changes carriers/networks
  
  // Pattern features
  isRoundAmount: boolean; // Amounts like 1000, 5000 are suspicious
  isGovernmentTransferDay: boolean; // Days when government transfers happen
  merchantCategory: string;
}

export interface FraudPrediction {
  fraudScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryReasons: string[];
  secondaryFactors: string[];
  recommendedAction: 'approve' | 'review' | 'block' | 'additional_auth';
}

export class FraudDetectionML {
  private readonly CRITICAL_THRESHOLD = 85;
  private readonly HIGH_THRESHOLD = 65;
  private readonly MEDIUM_THRESHOLD = 35;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  
  // Track failed login attempts per user
  private failedLoginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  
  // Blacklisted phone numbers, device IDs, and user IDs
  private blacklistedNumbers: Set<string> = new Set([
    '+91-XXXX-FRAUD', // Example entries
    '+91-YYYY-SCAM'
  ]);
  
  private blacklistedDevices: Set<string> = new Set();
  private blacklistedUsers: Set<string> = new Set();

  // Rural banking specific weights (optimized for rural fraud patterns)
  private readonly WEIGHTS = {
    AMOUNT_ZSCORE: 25,        // High amounts are more suspicious in rural areas
    TIME_PATTERN: 15,         // Night transactions are suspicious
    DEVICE_TRUST: 20,         // Device trust is critical
    LOCATION_RISK: 15,        // New locations are suspicious
    VELOCITY: 20,             // Multiple quick transactions
    RURAL_CONTEXT: 5          // Rural-specific adjustments
  };

  /**
   * Extract features from transaction data for ML model
   */
  async extractFeatures(transaction: Transaction, userId: string): Promise<TransactionFeatures> {
    const userHistory = await storage.getUserTransactions(userId, 100);
    const userDevices = await storage.getUserDevices(userId);
    const currentDevice = userDevices.find(d => d.deviceId === transaction.deviceId);

    // Amount features
    const amounts = userHistory.map(t => parseFloat(t.amount));
    const meanAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length || 0;
    const stdAmount = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - meanAmount, 2), 0) / amounts.length) || 1;
    const amountZScore = Math.abs((parseFloat(transaction.amount) - meanAmount) / stdAmount);

    // Timing features
    const transactionTime = new Date(transaction.timestamp!);
    const hourOfDay = transactionTime.getHours();
    const dayOfWeek = transactionTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNightTime = hourOfDay >= 22 || hourOfDay <= 6;

    // Velocity features
    const recentTransactions = userHistory.filter(t => {
      const timeDiff = new Date(transaction.timestamp!).getTime() - new Date(t.timestamp!).getTime();
      return timeDiff >= 0 && timeDiff <= 3600000; // Last hour
    });
    
    const transactionVelocity = recentTransactions.length;
    const amountVelocity = recentTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const lastTransaction = userHistory[0];
    const timeSinceLastTransaction = lastTransaction ? 
      (new Date(transaction.timestamp!).getTime() - new Date(lastTransaction.timestamp!).getTime()) / 60000 : 1440;

    // Device features
    const deviceTrustScore = currentDevice?.trustScore || 30;
    const newDevice = !currentDevice;
    const ruralDeviceLikelihood = currentDevice ? 
      ((currentDevice.fingerprint as any)?.processed?.ruralLikelihood || 50) : 50;

    // Location features (simplified)
    const locationRisk = this.assessLocationRisk(transaction, userHistory);
    const newLocation = !userHistory.some(t => t.location === transaction.location);

    return {
      amount: parseFloat(transaction.amount),
      amountZScore,
      hourOfDay,
      dayOfWeek,
      isWeekend,
      isNightTime,
      locationRisk,
      newLocation,
      deviceTrustScore,
      newDevice,
      deviceClassChange: false, // Would need device history comparison
      transactionVelocity,
      amountVelocity,
      timeSinceLastTransaction,
      ruralDeviceLikelihood,
      connectionType: ((currentDevice?.networkInfo as any)?.connectionType || 'unknown'),
      networkStability: await this.calculateNetworkStability(userId),
      isRoundAmount: parseFloat(transaction.amount) % 1000 === 0,
      isGovernmentTransferDay: this.isGovernmentTransferDay(transactionTime),
      merchantCategory: this.categorizeMerchant(transaction.description)
    };
  }

  /**
   * Predict fraud probability using rule-based ML approach optimized for rural banking
   */
  async predictFraud(transaction: Transaction, userId: string): Promise<FraudPrediction> {
    const features = await this.extractFeatures(transaction, userId);
    let fraudScore = 0;
    const reasons: string[] = [];
    const secondaryFactors: string[] = [];

    // Amount-based scoring
    if (features.amountZScore > 3) {
      fraudScore += this.WEIGHTS.AMOUNT_ZSCORE;
      reasons.push("Unusually large transaction amount");
    } else if (features.amountZScore > 2) {
      fraudScore += this.WEIGHTS.AMOUNT_ZSCORE * 0.6;
      secondaryFactors.push("Above average transaction amount");
    }

    // Suspiciously round amounts in high values
    if (features.isRoundAmount && features.amount > 10000) {
      fraudScore += 10;
      secondaryFactors.push("Round amount transaction");
    }

    // Time-based scoring
    if (features.isNightTime && !features.isGovernmentTransferDay) {
      fraudScore += this.WEIGHTS.TIME_PATTERN;
      reasons.push("Transaction during suspicious hours");
    }

    // Rapid transaction velocity
    if (features.transactionVelocity > 3) {
      fraudScore += this.WEIGHTS.VELOCITY;
      reasons.push("Multiple transactions in short time");
    } else if (features.transactionVelocity > 1) {
      fraudScore += this.WEIGHTS.VELOCITY * 0.5;
      secondaryFactors.push("Increased transaction frequency");
    }

    // High amount velocity
    if (features.amountVelocity > features.amount * 2) {
      fraudScore += this.WEIGHTS.VELOCITY * 0.7;
      reasons.push("High transaction value velocity");
    }

    // Device trust scoring
    if (features.deviceTrustScore < 20) {
      fraudScore += this.WEIGHTS.DEVICE_TRUST;
      reasons.push("Low device trust score");
    } else if (features.deviceTrustScore < 40) {
      fraudScore += this.WEIGHTS.DEVICE_TRUST * 0.5;
      secondaryFactors.push("Below average device trust");
    }

    // New device penalty
    if (features.newDevice) {
      fraudScore += 15;
      reasons.push("Transaction from new device");
    }
    
    // Blacklist checks
    if (this.isBlacklisted(userId, 'user')) {
      fraudScore += 50;
      reasons.push("Transaction from blacklisted user");
      recommendedAction = 'block';
    }
    
    if (this.isBlacklisted(transaction.deviceId, 'device')) {
      fraudScore += 45;
      reasons.push("Transaction from blacklisted device");
    }
    
    // Failed login attempt check
    if (this.isUserBlocked(userId)) {
      fraudScore += 30;
      reasons.push("User account temporarily locked due to failed login attempts");
      recommendedAction = 'block';
    }

    // Location-based scoring
    if (features.locationRisk > 70) {
      fraudScore += this.WEIGHTS.LOCATION_RISK;
      reasons.push("Transaction from high-risk location");
    } else if (features.newLocation && features.amount > 5000) {
      fraudScore += this.WEIGHTS.LOCATION_RISK * 0.6;
      secondaryFactors.push("Large transaction from new location");
    }

    // Network stability scoring
    if (features.networkStability < 30) {
      fraudScore += 10;
      secondaryFactors.push("Frequent network changes");
    }

    // Rural context adjustments
    if (features.ruralDeviceLikelihood > 70) {
      // Rural devices get some fraud score reduction for expected patterns
      fraudScore *= 0.9;
      
      // But SIM swap is more serious in rural areas
      if (features.networkStability < 20) {
        fraudScore += 15;
        reasons.push("Suspicious network changes in rural area");
      }
    }

    // Government transfer day adjustments
    if (features.isGovernmentTransferDay && transaction.type === 'credit') {
      fraudScore *= 0.7; // Reduce fraud score for legitimate government transfers
    }

    // Merchant category adjustments
    if (features.merchantCategory === 'government' || features.merchantCategory === 'utility') {
      fraudScore *= 0.8;
    } else if (features.merchantCategory === 'unknown' || features.merchantCategory === 'cash') {
      fraudScore += 5;
      secondaryFactors.push("Transaction category requires attention");
    }

    // Cap fraud score at 100
    fraudScore = Math.min(fraudScore, 100);

    // Determine risk level and recommended action
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let recommendedAction: 'approve' | 'review' | 'block' | 'additional_auth';

    if (fraudScore >= this.CRITICAL_THRESHOLD) {
      riskLevel = 'critical';
      recommendedAction = 'block';
    } else if (fraudScore >= this.HIGH_THRESHOLD) {
      riskLevel = 'high';
      recommendedAction = 'additional_auth';
    } else if (fraudScore >= this.MEDIUM_THRESHOLD) {
      riskLevel = 'medium';
      recommendedAction = 'review';
    } else {
      riskLevel = 'low';
      recommendedAction = 'approve';
    }

    return {
      fraudScore: Math.round(fraudScore),
      riskLevel,
      primaryReasons: reasons,
      secondaryFactors,
      recommendedAction
    };
  }

  /**
   * Assess location-based risk for a transaction
   */
  private assessLocationRisk(transaction: Transaction, userHistory: Transaction[]): number {
    if (!transaction.location) return 30; // Medium risk if no location

    const locationHistory = userHistory
      .filter(t => t.location)
      .map(t => t.location);

    if (locationHistory.length === 0) return 50; // Medium-high risk if no history

    // Check if this is a known location
    const isKnownLocation = locationHistory.includes(transaction.location!);
    if (isKnownLocation) return 10; // Low risk for known locations

    // Check distance from typical locations (simplified - would use actual GPS in production)
    const locationFrequency = locationHistory.reduce((acc, loc) => {
      acc[loc!] = (acc[loc!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonLocation = Object.keys(locationFrequency)
      .sort((a, b) => locationFrequency[b] - locationFrequency[a])[0];

    // Simple heuristic: new locations far from common ones are higher risk
    if (mostCommonLocation && transaction.location && 
        !transaction.location.includes(mostCommonLocation.split(',')[0])) {
      return 70; // High risk for distant new location
    }

    return 40; // Medium risk for new nearby location
  }

  /**
   * Calculate network stability score for a user
   */
  private async calculateNetworkStability(userId: string): Promise<number> {
    const simSwapEvents = await storage.getUserSimSwapEvents(userId);
    const recentEvents = simSwapEvents.filter(event => {
      const eventTime = new Date(event.timestamp!).getTime();
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return eventTime > monthAgo;
    });

    // More network changes = lower stability
    const stabilityScore = Math.max(0, 100 - (recentEvents.length * 20));
    return stabilityScore;
  }

  /**
   * Check if it's a government transfer day (in India, typically 1st-7th of month)
   */
  private isGovernmentTransferDay(date: Date): boolean {
    const dayOfMonth = date.getDate();
    return dayOfMonth >= 1 && dayOfMonth <= 7;
  }

  /**
   * Categorize merchant based on transaction description
   */
  private categorizeMerchant(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('government') || desc.includes('benefit') || desc.includes('pension')) {
      return 'government';
    }
    if (desc.includes('grocery') || desc.includes('store') || desc.includes('market')) {
      return 'retail';
    }
    if (desc.includes('atm') || desc.includes('withdrawal') || desc.includes('cash')) {
      return 'cash';
    }
    if (desc.includes('mobile') || desc.includes('recharge') || desc.includes('phone')) {
      return 'telecom';
    }
    if (desc.includes('electric') || desc.includes('water') || desc.includes('gas')) {
      return 'utility';
    }
    if (desc.includes('medical') || desc.includes('hospital') || desc.includes('pharmacy')) {
      return 'healthcare';
    }
    
    return 'unknown';
  }

  /**
   * Track and analyze failed login attempts
   */
  async trackFailedLogin(userId: string): Promise<{
    shouldBlock: boolean;
    attemptsCount: number;
    timeToUnlock?: number;
  }> {
    const now = new Date();
    const userAttempts = this.failedLoginAttempts.get(userId) || { count: 0, lastAttempt: now };
    
    // Reset attempts if last attempt was over 1 hour ago
    const hoursSinceLastAttempt = (now.getTime() - userAttempts.lastAttempt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastAttempt > 1) {
      userAttempts.count = 0;
    }
    
    userAttempts.count += 1;
    userAttempts.lastAttempt = now;
    this.failedLoginAttempts.set(userId, userAttempts);
    
    const shouldBlock = userAttempts.count >= this.MAX_FAILED_ATTEMPTS;
    
    if (shouldBlock) {
      // Create fraud alert for account lockout
      const fraudAlert: InsertFraudAlert = {
        userId,
        alertType: "unauthorized",
        title: "Account Temporarily Locked",
        description: `Your account has been temporarily locked due to ${userAttempts.count} failed login attempts. Please wait 30 minutes before trying again.`,
        severity: "danger",
        actionRequired: true
      };
      
      await storage.createFraudAlert(fraudAlert);
    }
    
    return {
      shouldBlock,
      attemptsCount: userAttempts.count,
      timeToUnlock: shouldBlock ? 30 * 60 * 1000 : undefined // 30 minutes in milliseconds
    };
  }
  
  /**
   * Reset failed login attempts after successful login
   */
  resetFailedLoginAttempts(userId: string): void {
    this.failedLoginAttempts.delete(userId);
  }
  
  /**
   * Check if user is currently blocked due to failed attempts
   */
  isUserBlocked(userId: string): boolean {
    const userAttempts = this.failedLoginAttempts.get(userId);
    if (!userAttempts) return false;
    
    const shouldBlock = userAttempts.count >= this.MAX_FAILED_ATTEMPTS;
    const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt.getTime();
    const lockoutPeriod = 30 * 60 * 1000; // 30 minutes
    
    return shouldBlock && timeSinceLastAttempt < lockoutPeriod;
  }
  
  /**
   * Check if phone number, device, or user is blacklisted
   */
  isBlacklisted(identifier: string, type: 'phone' | 'device' | 'user'): boolean {
    switch (type) {
      case 'phone':
        return this.blacklistedNumbers.has(identifier);
      case 'device':
        return this.blacklistedDevices.has(identifier);
      case 'user':
        return this.blacklistedUsers.has(identifier);
      default:
        return false;
    }
  }
  
  /**
   * Add to blacklist
   */
  addToBlacklist(identifier: string, type: 'phone' | 'device' | 'user', reason?: string): void {
    switch (type) {
      case 'phone':
        this.blacklistedNumbers.add(identifier);
        break;
      case 'device':
        this.blacklistedDevices.add(identifier);
        break;
      case 'user':
        this.blacklistedUsers.add(identifier);
        break;
    }
    console.log(`Added ${identifier} to ${type} blacklist. Reason: ${reason || 'Not specified'}`);
  }

  /**
   * Train model with feedback (when fraud is confirmed or denied)
   */
  async updateModelWithFeedback(
    transactionId: string,
    wasActualFraud: boolean,
    userFeedback?: string
  ): Promise<void> {
    // In a real ML system, this would update model weights
    // For now, we'll store the feedback for future model improvements
    
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) return;

    // Log the feedback for model improvement
    console.log(`Fraud feedback for transaction ${transactionId}: ${wasActualFraud ? 'FRAUD' : 'LEGITIMATE'}`);
    if (userFeedback) {
      console.log(`User feedback: ${userFeedback}`);
    }

    // Update transaction status based on feedback
    const newStatus = wasActualFraud ? 'flagged' : 'verified';
    await storage.updateTransactionStatus(transactionId, newStatus);

    // In production, this data would be used to retrain the ML model
  }

  /**
   * Get fraud statistics for a user (useful for risk profiling)
   */
  async getUserFraudProfile(userId: string): Promise<{
    totalTransactions: number;
    flaggedTransactions: number;
    fraudRate: number;
    avgFraudScore: number;
    riskProfile: 'low' | 'medium' | 'high';
  }> {
    const transactions = await storage.getUserTransactions(userId, 200);
    const flaggedTransactions = transactions.filter(t => t.status === 'flagged').length;
    const fraudRate = transactions.length > 0 ? (flaggedTransactions / transactions.length) * 100 : 0;
    
    const avgFraudScore = transactions.length > 0 ? 
      transactions.reduce((sum, t) => sum + (t.fraudScore || 0), 0) / transactions.length : 0;

    let riskProfile: 'low' | 'medium' | 'high' = 'low';
    if (fraudRate > 10 || avgFraudScore > 50) {
      riskProfile = 'high';
    } else if (fraudRate > 3 || avgFraudScore > 25) {
      riskProfile = 'medium';
    }

    return {
      totalTransactions: transactions.length,
      flaggedTransactions,
      fraudRate,
      avgFraudScore,
      riskProfile
    };
  }
}