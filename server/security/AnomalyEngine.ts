import { storage } from "../storage";
import { Transaction, User, DeviceFingerprint } from "@shared/schema";
import { FraudDetectionML } from "./FraudDetectionML";

export interface AnomalyScore {
  overallScore: number; // 0-100
  userBehaviorScore: number;
  deviceBehaviorScore: number;
  transactionPatternScore: number;
  temporalScore: number;
  geographicScore: number;
  anomalyType: 'none' | 'behavioral' | 'device' | 'pattern' | 'temporal' | 'geographic';
  details: string[];
}

export interface UserProfile {
  userId: string;
  averageTransactionAmount: number;
  typicalTransactionTimes: number[]; // Hours of day
  preferredMerchants: string[];
  usualLocations: string[];
  devicePatterns: {
    primaryDeviceType: string;
    networkUsage: Record<string, number>;
    loginPatterns: number[];
  };
  riskScore: number;
  profileConfidence: number; // How well we know this user
}

export class AnomalyEngine {
  private readonly fraudML: FraudDetectionML;
  private readonly ANOMALY_THRESHOLD = 60;
  private readonly CRITICAL_ANOMALY_THRESHOLD = 80;

  constructor() {
    this.fraudML = new FraudDetectionML();
  }

  /**
   * Analyze transaction for anomalies using comprehensive behavioral analysis
   */
  async analyzeTransaction(transaction: Transaction, userId: string): Promise<AnomalyScore> {
    const userProfile = await this.buildUserProfile(userId);
    const userTransactions = await storage.getUserTransactions(userId, 100);
    const userDevices = await storage.getUserDevices(userId);

    // Individual anomaly scores
    const userBehaviorScore = this.analyzeUserBehavior(transaction, userProfile, userTransactions);
    const deviceBehaviorScore = await this.analyzeDeviceBehavior(transaction, userDevices);
    const transactionPatternScore = this.analyzeTransactionPatterns(transaction, userTransactions);
    const temporalScore = this.analyzeTemporalPatterns(transaction, userProfile);
    const geographicScore = this.analyzeGeographicPatterns(transaction, userProfile);

    // Weighted overall score (rural banking optimized weights)
    const overallScore = Math.min(100, Math.round(
      userBehaviorScore * 0.25 +
      deviceBehaviorScore * 0.20 +
      transactionPatternScore * 0.25 +
      temporalScore * 0.15 +
      geographicScore * 0.15
    ));

    // Determine primary anomaly type
    const scores = {
      behavioral: userBehaviorScore,
      device: deviceBehaviorScore,
      pattern: transactionPatternScore,
      temporal: temporalScore,
      geographic: geographicScore
    };

    const maxScore = Math.max(...Object.values(scores));
    const anomalyType = maxScore > this.ANOMALY_THRESHOLD ? 
      (Object.keys(scores) as Array<keyof typeof scores>).find(key => scores[key] === maxScore) || 'none' : 
      'none';

    const details = this.generateAnomalyDetails(transaction, {
      userBehaviorScore,
      deviceBehaviorScore,
      transactionPatternScore,
      temporalScore,
      geographicScore
    });

    return {
      overallScore,
      userBehaviorScore,
      deviceBehaviorScore,
      transactionPatternScore,
      temporalScore,
      geographicScore,
      anomalyType,
      details
    };
  }

  /**
   * Build comprehensive user behavioral profile
   */
  private async buildUserProfile(userId: string): Promise<UserProfile> {
    const transactions = await storage.getUserTransactions(userId, 200);
    const devices = await storage.getUserDevices(userId);

    if (transactions.length === 0) {
      // New user - default profile
      return {
        userId,
        averageTransactionAmount: 0,
        typicalTransactionTimes: [],
        preferredMerchants: [],
        usualLocations: [],
        devicePatterns: {
          primaryDeviceType: 'unknown',
          networkUsage: {},
          loginPatterns: []
        },
        riskScore: 50,
        profileConfidence: 10
      };
    }

    // Calculate average transaction amount
    const amounts = transactions.map(t => parseFloat(t.amount));
    const averageTransactionAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Typical transaction times
    const transactionHours = transactions.map(t => new Date(t.timestamp!).getHours());
    const hourCounts = transactionHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const typicalTransactionTimes = Object.keys(hourCounts)
      .filter(hour => hourCounts[parseInt(hour)] >= transactions.length * 0.1) // At least 10% of transactions
      .map(Number);

    // Preferred merchants (based on transaction descriptions)
    const merchantCounts = transactions.reduce((acc, t) => {
      const merchant = this.extractMerchantCategory(t.description);
      acc[merchant] = (acc[merchant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredMerchants = Object.keys(merchantCounts)
      .sort((a, b) => merchantCounts[b] - merchantCounts[a])
      .slice(0, 5);

    // Usual locations
    const locationCounts = transactions
      .filter(t => t.location)
      .reduce((acc, t) => {
        acc[t.location!] = (acc[t.location!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const usualLocations = Object.keys(locationCounts)
      .sort((a, b) => locationCounts[b] - locationCounts[a])
      .slice(0, 3);

    // Device patterns
    const primaryDevice = devices.length > 0 ? devices[0] : null;
    const devicePatterns = {
      primaryDeviceType: primaryDevice ? 
        ((primaryDevice.fingerprint as any)?.processed?.deviceClass || 'unknown') : 'unknown',
      networkUsage: this.analyzeNetworkUsage(devices),
      loginPatterns: this.analyzeLoginPatterns(transactions)
    };

    // Calculate profile confidence based on data amount
    const profileConfidence = Math.min(100, Math.round(
      (transactions.length / 50) * 50 + // Transaction history weight
      (devices.length / 3) * 30 + // Device diversity weight  
      (usualLocations.length / 3) * 20 // Location consistency weight
    ));

    return {
      userId,
      averageTransactionAmount,
      typicalTransactionTimes,
      preferredMerchants,
      usualLocations,
      devicePatterns,
      riskScore: this.calculateUserRiskScore(transactions, devices),
      profileConfidence
    };
  }

  /**
   * Analyze user behavior anomalies
   */
  private analyzeUserBehavior(
    transaction: Transaction, 
    profile: UserProfile, 
    userTransactions: Transaction[]
  ): number {
    let anomalyScore = 0;

    // Amount-based anomalies
    const transactionAmount = parseFloat(transaction.amount);
    if (profile.averageTransactionAmount > 0) {
      const amountRatio = transactionAmount / profile.averageTransactionAmount;
      
      if (amountRatio > 5) {
        anomalyScore += 30; // Much larger than usual
      } else if (amountRatio > 2) {
        anomalyScore += 15;
      }
    }

    // Frequency anomalies (rural users typically have lower transaction frequency)
    const recentTransactions = userTransactions.filter(t => {
      const timeDiff = new Date(transaction.timestamp!).getTime() - new Date(t.timestamp!).getTime();
      return timeDiff >= 0 && timeDiff <= 24 * 60 * 60 * 1000; // Last 24 hours
    });

    if (recentTransactions.length > 10) {
      anomalyScore += 25; // Unusually high frequency for rural users
    } else if (recentTransactions.length > 5) {
      anomalyScore += 10;
    }

    // Merchant pattern anomalies
    const transactionMerchant = this.extractMerchantCategory(transaction.description);
    if (profile.preferredMerchants.length > 0 && 
        !profile.preferredMerchants.includes(transactionMerchant)) {
      anomalyScore += 10;
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze device behavior anomalies
   */
  private async analyzeDeviceBehavior(
    transaction: Transaction, 
    userDevices: DeviceFingerprint[]
  ): Promise<number> {
    let anomalyScore = 0;

    const currentDevice = userDevices.find(d => d.deviceId === transaction.deviceId);

    if (!currentDevice) {
      anomalyScore += 40; // Completely new device
    } else {
      // Device trust score anomalies
      if (currentDevice.trustScore && currentDevice.trustScore < 30) {
        anomalyScore += 25;
      }

      // Device usage pattern changes
      const daysSinceLastSeen = currentDevice.lastSeen ? 
        (Date.now() - new Date(currentDevice.lastSeen).getTime()) / (1000 * 60 * 60 * 24) : 0;

      if (daysSinceLastSeen > 30) {
        anomalyScore += 20; // Device not used for over a month
      }

      // Device class changes (e.g., from low-end to high-end)
      const deviceClass = (currentDevice.fingerprint as any)?.processed?.deviceClass;
      const primaryDeviceClass = userDevices[0] ? 
        ((userDevices[0].fingerprint as any)?.processed?.deviceClass) : null;

      if (deviceClass && primaryDeviceClass && deviceClass !== primaryDeviceClass) {
        anomalyScore += 15; // Different device class than usual
      }
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze transaction pattern anomalies
   */
  private analyzeTransactionPatterns(
    transaction: Transaction, 
    userTransactions: Transaction[]
  ): number {
    let anomalyScore = 0;

    if (userTransactions.length < 5) {
      return 20; // Not enough data for pattern analysis
    }

    // Type pattern analysis (rural users usually have more credits than debits)
    const creditCount = userTransactions.filter(t => t.type === 'credit').length;
    const debitCount = userTransactions.filter(t => t.type === 'debit').length;
    const creditRatio = creditCount / (creditCount + debitCount);

    // If this is a large debit but user typically receives credits
    if (transaction.type === 'debit' && creditRatio > 0.7 && parseFloat(transaction.amount) > 5000) {
      anomalyScore += 25;
    }

    // Sequential transaction patterns
    const sortedTransactions = [...userTransactions]
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());

    const amounts = sortedTransactions.map(t => parseFloat(t.amount));
    const isIncreasingPattern = this.detectIncreasingPattern(amounts);
    
    if (isIncreasingPattern) {
      anomalyScore += 20; // Suspiciously increasing amounts (testing limits)
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze temporal pattern anomalies
   */
  private analyzeTemporalPatterns(transaction: Transaction, profile: UserProfile): number {
    let anomalyScore = 0;

    const transactionHour = new Date(transaction.timestamp!).getHours();

    // If user has established patterns, check deviation
    if (profile.typicalTransactionTimes.length > 0) {
      const isTypicalTime = profile.typicalTransactionTimes.some(hour => 
        Math.abs(hour - transactionHour) <= 2 // Within 2 hours of typical time
      );

      if (!isTypicalTime) {
        anomalyScore += 20;
      }
    }

    // Rural-specific time anomalies
    if (transactionHour >= 23 || transactionHour <= 5) {
      anomalyScore += 25; // Very late/early transactions are unusual in rural areas
    }

    // Weekend vs weekday patterns
    const isWeekend = new Date(transaction.timestamp!).getDay() % 6 === 0;
    if (isWeekend && parseFloat(transaction.amount) > 10000) {
      anomalyScore += 15; // Large weekend transactions are less common
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze geographic pattern anomalies
   */
  private analyzeGeographicPatterns(transaction: Transaction, profile: UserProfile): number {
    let anomalyScore = 0;

    if (!transaction.location) {
      return 10; // Missing location is slightly suspicious
    }

    // Check against usual locations
    if (profile.usualLocations.length > 0) {
      const isUsualLocation = profile.usualLocations.some(location => 
        transaction.location?.includes(location.split(',')[0]) || 
        location.includes(transaction.location!.split(',')[0])
      );

      if (!isUsualLocation) {
        anomalyScore += 25; // New location
        
        // Higher penalty for large amounts in new locations
        if (parseFloat(transaction.amount) > 10000) {
          anomalyScore += 15;
        }
      }
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Extract merchant category from transaction description
   */
  private extractMerchantCategory(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('atm') || desc.includes('cash')) return 'cash';
    if (desc.includes('grocery') || desc.includes('store')) return 'retail';
    if (desc.includes('fuel') || desc.includes('petrol')) return 'fuel';
    if (desc.includes('medical') || desc.includes('pharmacy')) return 'healthcare';
    if (desc.includes('mobile') || desc.includes('recharge')) return 'telecom';
    if (desc.includes('government') || desc.includes('benefit')) return 'government';
    
    return 'other';
  }

  /**
   * Analyze network usage patterns across devices
   */
  private analyzeNetworkUsage(devices: DeviceFingerprint[]): Record<string, number> {
    const networkUsage: Record<string, number> = {};
    
    devices.forEach(device => {
      const connectionType = (device.networkInfo as any)?.connectionType || 'unknown';
      networkUsage[connectionType] = (networkUsage[connectionType] || 0) + 1;
    });

    return networkUsage;
  }

  /**
   * Analyze login time patterns
   */
  private analyzeLoginPatterns(transactions: Transaction[]): number[] {
    const loginHours = transactions.map(t => new Date(t.timestamp!).getHours());
    const hourCounts = new Array(24).fill(0);
    
    loginHours.forEach(hour => {
      hourCounts[hour]++;
    });

    return hourCounts;
  }

  /**
   * Calculate overall user risk score
   */
  private calculateUserRiskScore(transactions: Transaction[], devices: DeviceFingerprint[]): number {
    let riskScore = 50; // Start neutral

    // High transaction frequency increases risk
    const avgTransactionsPerDay = transactions.length / 30; // Assume 30-day period
    if (avgTransactionsPerDay > 10) {
      riskScore += 20;
    }

    // Multiple devices can indicate account sharing (higher risk)
    if (devices.length > 3) {
      riskScore += 15;
    }

    // Low device trust scores increase user risk
    const avgDeviceTrust = devices.reduce((sum, d) => sum + (d.trustScore || 50), 0) / devices.length;
    if (avgDeviceTrust < 40) {
      riskScore += 20;
    }

    return Math.min(Math.max(riskScore, 0), 100);
  }

  /**
   * Detect increasing amount patterns (potential limit testing)
   */
  private detectIncreasingPattern(amounts: number[]): boolean {
    if (amounts.length < 5) return false;

    const recentAmounts = amounts.slice(-5);
    let increasingCount = 0;

    for (let i = 1; i < recentAmounts.length; i++) {
      if (recentAmounts[i] > recentAmounts[i - 1]) {
        increasingCount++;
      }
    }

    return increasingCount >= 3; // At least 3 out of 4 increases
  }

  /**
   * Generate detailed anomaly explanations
   */
  private generateAnomalyDetails(
    transaction: Transaction, 
    scores: {
      userBehaviorScore: number;
      deviceBehaviorScore: number;
      transactionPatternScore: number;
      temporalScore: number;
      geographicScore: number;
    }
  ): string[] {
    const details: string[] = [];

    if (scores.userBehaviorScore > this.ANOMALY_THRESHOLD) {
      details.push("Unusual transaction amount or frequency for this user");
    }

    if (scores.deviceBehaviorScore > this.ANOMALY_THRESHOLD) {
      details.push("Transaction from untrusted or new device");
    }

    if (scores.transactionPatternScore > this.ANOMALY_THRESHOLD) {
      details.push("Transaction pattern differs from user's historical behavior");
    }

    if (scores.temporalScore > this.ANOMALY_THRESHOLD) {
      details.push("Transaction timing is unusual for this user");
    }

    if (scores.geographicScore > this.ANOMALY_THRESHOLD) {
      details.push("Transaction from unusual location");
    }

    return details;
  }

  /**
   * Real-time anomaly scoring for streaming transactions
   */
  async scoreTransactionStream(transactions: Transaction[]): Promise<{
    scores: AnomalyScore[];
    aggregateRisk: number;
    recommendations: string[];
  }> {
    const scores: AnomalyScore[] = [];
    
    for (const transaction of transactions) {
      const score = await this.analyzeTransaction(transaction, transaction.userId);
      scores.push(score);
    }

    // Calculate aggregate risk
    const averageScore = scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length;
    const highRiskCount = scores.filter(s => s.overallScore > this.CRITICAL_ANOMALY_THRESHOLD).length;
    
    const aggregateRisk = Math.min(100, averageScore + (highRiskCount * 10));

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (aggregateRisk > 80) {
      recommendations.push("Implement immediate additional authentication");
      recommendations.push("Consider temporary transaction limits");
    } else if (aggregateRisk > 60) {
      recommendations.push("Increase monitoring frequency");
      recommendations.push("Require additional verification for large amounts");
    }

    return {
      scores,
      aggregateRisk,
      recommendations
    };
  }
}