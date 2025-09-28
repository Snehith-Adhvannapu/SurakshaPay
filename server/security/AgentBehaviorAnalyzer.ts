
import { storage } from "../storage";
import { Transaction, User, InsertSecurityEvent, InsertFraudAlert } from "@shared/schema";

export interface AgentProfile {
  agentId: string;
  averageTransactionAmount: number;
  dailyTransactionLimit: number;
  typicalWorkingHours: number[];
  preferredTransactionTypes: string[];
  locationConsistency: number; // 0-100
  customerInteractionPattern: {
    averageSessionDuration: number;
    helpRequestFrequency: number;
    errorRate: number;
  };
  trustScore: number;
  experienceLevel: 'new' | 'intermediate' | 'experienced';
}

export interface AgentAnomalyScore {
  overallScore: number; // 0-100
  transactionVolumeScore: number;
  amountAnomalyScore: number;
  timingAnomalyScore: number;
  locationAnomalyScore: number;
  behaviorChangeScore: number;
  anomalyType: 'none' | 'volume' | 'amount' | 'timing' | 'location' | 'behavior_change';
  riskFactors: string[];
  recommendedAction: 'monitor' | 'review' | 'restrict' | 'suspend';
}

export class AgentBehaviorAnalyzer {
  private readonly ANOMALY_THRESHOLD = 70;
  private readonly CRITICAL_ANOMALY_THRESHOLD = 85;
  private readonly MAX_DAILY_TRANSACTIONS = 200; // Rural banking agent limit
  private readonly MAX_SINGLE_TRANSACTION = 100000; // ₹1 lakh

  /**
   * Analyze agent transaction behavior for anomalies
   */
  async analyzeAgentBehavior(
    agentId: string, 
    recentTransactions: Transaction[]
  ): Promise<AgentAnomalyScore> {
    const agentProfile = await this.buildAgentProfile(agentId);
    
    // Individual anomaly scores
    const transactionVolumeScore = this.analyzeTransactionVolume(recentTransactions, agentProfile);
    const amountAnomalyScore = this.analyzeAmountPatterns(recentTransactions, agentProfile);
    const timingAnomalyScore = this.analyzeTimingPatterns(recentTransactions, agentProfile);
    const locationAnomalyScore = this.analyzeLocationConsistency(recentTransactions, agentProfile);
    const behaviorChangeScore = await this.analyzeBehaviorChanges(agentId, recentTransactions);

    // Weighted overall score (agent-specific weights)
    const overallScore = Math.min(100, Math.round(
      transactionVolumeScore * 0.25 +
      amountAnomalyScore * 0.25 +
      timingAnomalyScore * 0.20 +
      locationAnomalyScore * 0.15 +
      behaviorChangeScore * 0.15
    ));

    // Determine primary anomaly type
    const scores = {
      volume: transactionVolumeScore,
      amount: amountAnomalyScore,
      timing: timingAnomalyScore,
      location: locationAnomalyScore,
      behavior_change: behaviorChangeScore
    };

    const maxScore = Math.max(...Object.values(scores));
    const anomalyType = maxScore > this.ANOMALY_THRESHOLD ? 
      (Object.keys(scores) as Array<keyof typeof scores>).find(key => scores[key] === maxScore) || 'none' : 
      'none';

    const riskFactors = this.generateRiskFactors({
      transactionVolumeScore,
      amountAnomalyScore,
      timingAnomalyScore,
      locationAnomalyScore,
      behaviorChangeScore
    });

    const recommendedAction = this.getRecommendedAction(overallScore, agentProfile);

    // Create security alert if critical
    if (overallScore > this.CRITICAL_ANOMALY_THRESHOLD) {
      await this.createAgentSecurityAlert(agentId, overallScore, riskFactors);
    }

    return {
      overallScore,
      transactionVolumeScore,
      amountAnomalyScore,
      timingAnomalyScore,
      locationAnomalyScore,
      behaviorChangeScore,
      anomalyType,
      riskFactors,
      recommendedAction
    };
  }

  /**
   * Build comprehensive agent profile from historical data
   */
  private async buildAgentProfile(agentId: string): Promise<AgentProfile> {
    // Get agent's historical transactions (last 30 days)
    const historicalTransactions = await storage.getAgentTransactions(agentId, 30);
    
    if (historicalTransactions.length === 0) {
      return this.getDefaultAgentProfile(agentId);
    }

    // Calculate average transaction amount
    const amounts = historicalTransactions.map(t => parseFloat(t.amount));
    const averageTransactionAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Analyze working hours
    const transactionHours = historicalTransactions.map(t => new Date(t.timestamp!).getHours());
    const hourCounts = transactionHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const typicalWorkingHours = Object.keys(hourCounts)
      .filter(hour => hourCounts[parseInt(hour)] >= historicalTransactions.length * 0.05)
      .map(Number)
      .sort((a, b) => a - b);

    // Analyze transaction types
    const typeCounts = historicalTransactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredTransactionTypes = Object.keys(typeCounts)
      .sort((a, b) => typeCounts[b] - typeCounts[a]);

    // Calculate location consistency
    const locations = historicalTransactions
      .filter(t => t.location)
      .map(t => t.location!);
    
    const uniqueLocations = new Set(locations).size;
    const locationConsistency = Math.max(0, 100 - (uniqueLocations * 5));

    // Determine experience level
    const experienceLevel = this.determineExperienceLevel(historicalTransactions.length, averageTransactionAmount);

    // Calculate daily transaction limit based on experience
    const dailyTransactionLimit = experienceLevel === 'experienced' ? 200 : 
                                 experienceLevel === 'intermediate' ? 150 : 100;

    return {
      agentId,
      averageTransactionAmount,
      dailyTransactionLimit,
      typicalWorkingHours,
      preferredTransactionTypes,
      locationConsistency,
      customerInteractionPattern: {
        averageSessionDuration: 5.5, // minutes
        helpRequestFrequency: 0.15, // per transaction
        errorRate: 0.02 // 2%
      },
      trustScore: this.calculateAgentTrustScore(historicalTransactions, locationConsistency),
      experienceLevel
    };
  }

  /**
   * Analyze transaction volume anomalies
   */
  private analyzeTransactionVolume(
    transactions: Transaction[], 
    profile: AgentProfile
  ): number {
    let anomalyScore = 0;

    // Check daily transaction count
    const dailyTransactions = transactions.length;
    if (dailyTransactions > profile.dailyTransactionLimit) {
      anomalyScore += 40;
    } else if (dailyTransactions > profile.dailyTransactionLimit * 0.8) {
      anomalyScore += 20;
    }

    // Check for sudden spikes in activity
    const hourlyTransactions = this.groupTransactionsByHour(transactions);
    const maxHourlyCount = Math.max(...Object.values(hourlyTransactions));
    
    if (maxHourlyCount > 30) { // More than 30 transactions in one hour
      anomalyScore += 30;
    } else if (maxHourlyCount > 20) {
      anomalyScore += 15;
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze amount pattern anomalies
   */
  private analyzeAmountPatterns(
    transactions: Transaction[], 
    profile: AgentProfile
  ): number {
    let anomalyScore = 0;

    const amounts = transactions.map(t => parseFloat(t.amount));
    const totalAmount = amounts.reduce((a, b) => a + b, 0);
    const maxAmount = Math.max(...amounts);
    const avgAmount = totalAmount / amounts.length;

    // Check for unusually large single transactions
    if (maxAmount > this.MAX_SINGLE_TRANSACTION) {
      anomalyScore += 50;
    } else if (maxAmount > profile.averageTransactionAmount * 10) {
      anomalyScore += 30;
    }

    // Check for unusual total daily amount
    const expectedDailyAmount = profile.averageTransactionAmount * profile.dailyTransactionLimit * 0.7;
    if (totalAmount > expectedDailyAmount * 2) {
      anomalyScore += 25;
    }

    // Check for suspicious round amounts pattern
    const roundAmounts = amounts.filter(amount => amount % 1000 === 0 && amount > 5000);
    if (roundAmounts.length > amounts.length * 0.6) {
      anomalyScore += 20;
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze timing pattern anomalies
   */
  private analyzeTimingPatterns(
    transactions: Transaction[], 
    profile: AgentProfile
  ): number {
    let anomalyScore = 0;

    const transactionHours = transactions.map(t => new Date(t.timestamp!).getHours());

    // Check for transactions outside typical working hours
    const outsideHoursCount = transactionHours.filter(hour => 
      !profile.typicalWorkingHours.includes(hour)
    ).length;

    if (outsideHoursCount > transactions.length * 0.3) {
      anomalyScore += 30;
    } else if (outsideHoursCount > transactions.length * 0.1) {
      anomalyScore += 15;
    }

    // Check for very late/early transactions (rural agents typically don't work these hours)
    const nightTransactions = transactionHours.filter(hour => hour >= 22 || hour <= 6).length;
    if (nightTransactions > 0) {
      anomalyScore += 25;
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze location consistency
   */
  private analyzeLocationConsistency(
    transactions: Transaction[], 
    profile: AgentProfile
  ): number {
    let anomalyScore = 0;

    const locations = transactions
      .filter(t => t.location)
      .map(t => t.location!);

    if (locations.length === 0) {
      return 20; // Missing location data is suspicious
    }

    const uniqueLocations = new Set(locations).size;
    
    // Rural agents should typically work from consistent locations
    if (uniqueLocations > 5) {
      anomalyScore += 40;
    } else if (uniqueLocations > 3) {
      anomalyScore += 20;
    }

    // Compare with agent's historical location consistency
    if (profile.locationConsistency > 70 && uniqueLocations > 2) {
      anomalyScore += 25; // Agent usually consistent but now scattered
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Analyze behavior changes over time
   */
  private async analyzeBehaviorChanges(
    agentId: string, 
    recentTransactions: Transaction[]
  ): Promise<number> {
    let anomalyScore = 0;

    // Get older transactions for comparison (30-60 days ago)
    const olderTransactions = await storage.getAgentTransactions(agentId, 30, 30);

    if (olderTransactions.length === 0) {
      return 0; // Not enough historical data
    }

    // Compare transaction patterns
    const recentAvgAmount = recentTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / recentTransactions.length;
    const olderAvgAmount = olderTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / olderTransactions.length;

    const amountChangeRatio = recentAvgAmount / olderAvgAmount;
    if (amountChangeRatio > 3 || amountChangeRatio < 0.3) {
      anomalyScore += 25; // Significant change in transaction amounts
    }

    // Compare transaction frequency
    const recentFreq = recentTransactions.length;
    const olderFreq = olderTransactions.length;
    const freqChangeRatio = recentFreq / olderFreq;

    if (freqChangeRatio > 2 || freqChangeRatio < 0.5) {
      anomalyScore += 20; // Significant change in frequency
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Generate risk factors based on scores
   */
  private generateRiskFactors(scores: {
    transactionVolumeScore: number;
    amountAnomalyScore: number;
    timingAnomalyScore: number;
    locationAnomalyScore: number;
    behaviorChangeScore: number;
  }): string[] {
    const factors: string[] = [];

    if (scores.transactionVolumeScore > this.ANOMALY_THRESHOLD) {
      factors.push("Unusual transaction volume or frequency");
    }

    if (scores.amountAnomalyScore > this.ANOMALY_THRESHOLD) {
      factors.push("Suspicious transaction amounts or patterns");
    }

    if (scores.timingAnomalyScore > this.ANOMALY_THRESHOLD) {
      factors.push("Transactions outside normal working hours");
    }

    if (scores.locationAnomalyScore > this.ANOMALY_THRESHOLD) {
      factors.push("Inconsistent or unusual transaction locations");
    }

    if (scores.behaviorChangeScore > this.ANOMALY_THRESHOLD) {
      factors.push("Significant change in transaction behavior");
    }

    return factors;
  }

  /**
   * Get recommended action based on overall score and profile
   */
  private getRecommendedAction(
    overallScore: number, 
    profile: AgentProfile
  ): 'monitor' | 'review' | 'restrict' | 'suspend' {
    if (overallScore >= this.CRITICAL_ANOMALY_THRESHOLD) {
      return profile.trustScore < 30 ? 'suspend' : 'restrict';
    } else if (overallScore >= this.ANOMALY_THRESHOLD) {
      return 'review';
    } else if (overallScore >= 40) {
      return 'monitor';
    }
    
    return 'monitor';
  }

  /**
   * Create security alert for suspicious agent activity
   */
  private async createAgentSecurityAlert(
    agentId: string, 
    riskScore: number, 
    riskFactors: string[]
  ): Promise<void> {
    // Create security event
    const securityEvent: InsertSecurityEvent = {
      userId: agentId,
      eventType: "agent_anomaly",
      severity: riskScore > 90 ? "critical" : "high",
      details: {
        riskScore,
        riskFactors,
        timestamp: new Date().toISOString()
      }
    };

    await storage.createSecurityEvent(securityEvent);

    // Create fraud alert
    const fraudAlert: InsertFraudAlert = {
      userId: agentId,
      alertType: "unauthorized",
      title: "Agent Behavior Anomaly Detected",
      description: `Suspicious activity detected in agent transactions. Risk factors: ${riskFactors.join(', ')}. Immediate review required.`,
      severity: "danger",
      actionRequired: true
    };

    await storage.createFraudAlert(fraudAlert);

    console.log(`Agent behavior anomaly detected for ${agentId} with risk score ${riskScore}%`);
  }

  /**
   * Helper methods
   */
  private getDefaultAgentProfile(agentId: string): AgentProfile {
    return {
      agentId,
      averageTransactionAmount: 2500,
      dailyTransactionLimit: 100,
      typicalWorkingHours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
      preferredTransactionTypes: ['credit', 'debit'],
      locationConsistency: 50,
      customerInteractionPattern: {
        averageSessionDuration: 5,
        helpRequestFrequency: 0.2,
        errorRate: 0.05
      },
      trustScore: 50,
      experienceLevel: 'new'
    };
  }

  private determineExperienceLevel(transactionCount: number, avgAmount: number): 'new' | 'intermediate' | 'experienced' {
    if (transactionCount > 1000 && avgAmount > 3000) return 'experienced';
    if (transactionCount > 300 && avgAmount > 1500) return 'intermediate';
    return 'new';
  }

  private calculateAgentTrustScore(transactions: Transaction[], locationConsistency: number): number {
    let trustScore = 50; // Base score

    // Higher transaction count increases trust
    trustScore += Math.min(25, transactions.length / 20);

    // Location consistency affects trust
    trustScore += locationConsistency * 0.2;

    // Check for fraud history
    const flaggedTransactions = transactions.filter(t => t.status === 'flagged').length;
    if (flaggedTransactions > 0) {
      trustScore -= flaggedTransactions * 10;
    }

    return Math.min(Math.max(trustScore, 0), 100);
  }

  private groupTransactionsByHour(transactions: Transaction[]): Record<number, number> {
    return transactions.reduce((acc, t) => {
      const hour = new Date(t.timestamp!).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  }

  /**
   * Monitor agent performance metrics
   */
  async getAgentPerformanceMetrics(agentId: string): Promise<{
    transactionSuccess: number;
    customerSatisfaction: number;
    errorRate: number;
    efficiencyScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const transactions = await storage.getAgentTransactions(agentId, 7);
    
    const successfulTransactions = transactions.filter(t => t.status === 'verified').length;
    const transactionSuccess = transactions.length > 0 ? (successfulTransactions / transactions.length) * 100 : 0;
    
    const flaggedTransactions = transactions.filter(t => t.status === 'flagged').length;
    const errorRate = transactions.length > 0 ? (flaggedTransactions / transactions.length) * 100 : 0;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (errorRate > 5 || transactionSuccess < 90) {
      riskLevel = 'high';
    } else if (errorRate > 2 || transactionSuccess < 95) {
      riskLevel = 'medium';
    }

    return {
      transactionSuccess,
      customerSatisfaction: Math.max(0, 100 - errorRate * 5), // Simulated
      errorRate,
      efficiencyScore: Math.min(100, transactionSuccess - errorRate),
      riskLevel
    };
  }
}
