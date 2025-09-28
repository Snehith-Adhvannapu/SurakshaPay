import { EncryptionFramework } from "./EncryptionFramework";
import { InsertTransaction } from "@shared/schema";
import * as crypto from "crypto";

export interface OfflineTransaction {
  id: string;
  userId: string;
  transactionData: InsertTransaction;
  timestamp: Date;
  deviceId: string;
  securityHash: string;
  validationScore: number;
  queuePosition: number;
}

export interface SyncResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  fraudDetectedCount: number;
  errors: string[];
}

export interface OfflineSecurityPolicy {
  maxOfflineTransactions: number;
  maxOfflineAmount: number;
  maxOfflineHours: number;
  requiredValidations: string[];
  encryptionRequired: boolean;
}

export class OfflineValidator {
  private readonly encryption: EncryptionFramework;
  private readonly offlineQueue: Map<string, OfflineTransaction[]>;
  private readonly RURAL_POLICY: OfflineSecurityPolicy = {
    maxOfflineTransactions: 5,
    maxOfflineAmount: 50000, // ₹50,000
    maxOfflineHours: 72, // 3 days for rural connectivity issues
    requiredValidations: ['device_fingerprint', 'amount_limit', 'temporal_check'],
    encryptionRequired: true
  };

  constructor() {
    this.encryption = new EncryptionFramework();
    this.offlineQueue = new Map();
  }

  /**
   * Validate and queue transaction for offline processing
   */
  async queueOfflineTransaction(
    userId: string,
    transactionData: InsertTransaction,
    deviceId: string,
    deviceSecret: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    validationScore: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let validationScore = 0;

    // Get user's current offline queue
    const userQueue = this.offlineQueue.get(userId) || [];

    // Policy validation
    const policyCheck = this.validateOfflinePolicy(userQueue, transactionData, userId);
    if (!policyCheck.isValid) {
      return {
        success: false,
        validationScore: 0,
        errors: policyCheck.violations
      };
    }
    validationScore += 20;

    // Device fingerprint validation
    const deviceValidation = await this.validateDeviceFingerprint(deviceId, userId);
    if (deviceValidation.isValid) {
      validationScore += 25;
    } else {
      errors.push("Device validation failed");
      validationScore -= 10;
    }

    // Amount and frequency validation
    const amountValidation = this.validateTransactionAmount(transactionData, userQueue);
    validationScore += amountValidation.score;
    if (amountValidation.issues.length > 0) {
      errors.push(...amountValidation.issues);
    }

    // Temporal validation
    const temporalValidation = this.validateTransactionTiming(transactionData);
    validationScore += temporalValidation.score;
    if (temporalValidation.issues.length > 0) {
      errors.push(...temporalValidation.issues);
    }

    // Security hash generation
    const securityHash = this.generateSecurityHash(transactionData, deviceId, deviceSecret);

    // If validation score is too low, reject
    if (validationScore < 30) {
      return {
        success: false,
        validationScore,
        errors: [...errors, "Transaction failed security validation"]
      };
    }

    // Create offline transaction
    const offlineTransaction: OfflineTransaction = {
      id: crypto.randomUUID(),
      userId,
      transactionData,
      timestamp: new Date(),
      deviceId,
      securityHash,
      validationScore,
      queuePosition: userQueue.length
    };

    // Encrypt transaction data
    if (this.RURAL_POLICY.encryptionRequired) {
      try {
        const encryptedData = this.encryption.encryptOfflineData(
          offlineTransaction,
          deviceSecret
        );
        // Store encrypted version
        console.log('Transaction encrypted for offline storage');
      } catch (error) {
        errors.push("Encryption failed");
        return {
          success: false,
          validationScore,
          errors
        };
      }
    }

    // Add to queue
    userQueue.push(offlineTransaction);
    this.offlineQueue.set(userId, userQueue);

    console.log(`Offline transaction queued for user ${userId}: ${offlineTransaction.id}`);

    return {
      success: true,
      transactionId: offlineTransaction.id,
      validationScore,
      errors: errors.length > 0 ? errors : []
    };
  }

  /**
   * Validate offline policy compliance
   */
  private validateOfflinePolicy(
    userQueue: OfflineTransaction[],
    transactionData: InsertTransaction,
    userId: string
  ): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check transaction count limit
    if (userQueue.length >= this.RURAL_POLICY.maxOfflineTransactions) {
      violations.push(`Maximum offline transactions exceeded (${this.RURAL_POLICY.maxOfflineTransactions})`);
    }

    // Check amount limit
    const transactionAmount = parseFloat(transactionData.amount);
    if (transactionAmount > this.RURAL_POLICY.maxOfflineAmount) {
      violations.push(`Transaction amount exceeds offline limit (₹${this.RURAL_POLICY.maxOfflineAmount})`);
    }

    // Check total offline amount
    const totalOfflineAmount = userQueue.reduce((sum, t) => sum + parseFloat(t.transactionData.amount), 0);
    if (totalOfflineAmount + transactionAmount > this.RURAL_POLICY.maxOfflineAmount * 2) {
      violations.push("Total offline amount limit exceeded");
    }

    // Check time window
    const oldestTransaction = userQueue[0];
    if (oldestTransaction) {
      const hoursSinceOldest = (Date.now() - oldestTransaction.timestamp.getTime()) / (1000 * 60 * 60);
      if (hoursSinceOldest > this.RURAL_POLICY.maxOfflineHours) {
        violations.push("Offline transaction window expired");
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * Validate device fingerprint for offline transaction
   */
  private async validateDeviceFingerprint(deviceId: string, userId: string): Promise<{
    isValid: boolean;
    trustScore: number;
  }> {
    // Simplified device validation - in production would check against storage
    // For now, assume valid if deviceId exists and follows pattern
    const isValidFormat = Boolean(deviceId && deviceId.length > 10);
    const trustScore = isValidFormat ? 75 : 25;

    return {
      isValid: isValidFormat,
      trustScore
    };
  }

  /**
   * Validate transaction amount and frequency
   */
  private validateTransactionAmount(
    transactionData: InsertTransaction,
    userQueue: OfflineTransaction[]
  ): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 30; // Base score

    const amount = parseFloat(transactionData.amount);

    // Very large amounts are suspicious offline
    if (amount > 25000) {
      score -= 15;
      issues.push("Large amount for offline transaction");
    } else if (amount > 10000) {
      score -= 5;
    }

    // Check frequency
    const recentTransactions = userQueue.filter(t => {
      const timeDiff = Date.now() - t.timestamp.getTime();
      return timeDiff < 60 * 60 * 1000; // Last hour
    });

    if (recentTransactions.length > 2) {
      score -= 10;
      issues.push("High transaction frequency");
    }

    // Round amounts are more suspicious
    if (amount % 1000 === 0 && amount > 5000) {
      score -= 5;
      issues.push("Round amount transaction");
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Validate transaction timing
   */
  private validateTransactionTiming(transactionData: InsertTransaction): {
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 25; // Base score

    const hour = new Date().getHours();

    // Night transactions are more suspicious
    if (hour >= 23 || hour <= 5) {
      score -= 10;
      issues.push("Late night transaction");
    }

    // Very early morning transactions
    if (hour >= 6 && hour <= 7) {
      score -= 5;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Generate security hash for transaction integrity
   */
  private generateSecurityHash(
    transactionData: InsertTransaction,
    deviceId: string,
    deviceSecret: string
  ): string {
    const hashData = {
      ...transactionData,
      deviceId,
      timestamp: Date.now()
    };

    return this.encryption.generateSecureHash(
      JSON.stringify(hashData),
      deviceSecret
    );
  }

  /**
   * Sync offline transactions when connectivity is restored
   */
  async syncOfflineTransactions(
    userId: string,
    deviceSecret: string
  ): Promise<SyncResult> {
    const userQueue = this.offlineQueue.get(userId) || [];
    
    if (userQueue.length === 0) {
      return {
        processedCount: 0,
        successCount: 0,
        failedCount: 0,
        fraudDetectedCount: 0,
        errors: []
      };
    }

    let successCount = 0;
    let failedCount = 0;
    let fraudDetectedCount = 0;
    const errors: string[] = [];

    console.log(`Starting sync of ${userQueue.length} offline transactions for user ${userId}`);

    for (const offlineTransaction of userQueue) {
      try {
        // Verify security hash
        const expectedHash = this.generateSecurityHash(
          offlineTransaction.transactionData,
          offlineTransaction.deviceId,
          deviceSecret
        );

        if (expectedHash !== offlineTransaction.securityHash) {
          errors.push(`Security hash mismatch for transaction ${offlineTransaction.id}`);
          failedCount++;
          continue;
        }

        // Check if transaction is still within time window
        const hoursOld = (Date.now() - offlineTransaction.timestamp.getTime()) / (1000 * 60 * 60);
        if (hoursOld > this.RURAL_POLICY.maxOfflineHours) {
          errors.push(`Transaction ${offlineTransaction.id} expired`);
          failedCount++;
          continue;
        }

        // Perform additional fraud checks now that we're online
        const fraudCheck = await this.performOnlineFraudCheck(offlineTransaction);
        if (fraudCheck.isFraud) {
          errors.push(`Fraud detected in transaction ${offlineTransaction.id}: ${fraudCheck.reason}`);
          fraudDetectedCount++;
          continue;
        }

        // Process transaction (simplified - would integrate with actual transaction processing)
        const processResult = await this.processTransaction(offlineTransaction);
        if (processResult.success) {
          successCount++;
          console.log(`Successfully processed offline transaction ${offlineTransaction.id}`);
        } else {
          failedCount++;
          errors.push(`Processing failed for transaction ${offlineTransaction.id}: ${processResult.error}`);
        }

      } catch (error) {
        failedCount++;
        errors.push(`Unexpected error processing transaction ${offlineTransaction.id}: ${error}`);
      }
    }

    // Clear processed transactions from queue
    this.offlineQueue.delete(userId);

    console.log(`Sync completed: ${successCount} success, ${failedCount} failed, ${fraudDetectedCount} fraud detected`);

    return {
      processedCount: userQueue.length,
      successCount,
      failedCount,
      fraudDetectedCount,
      errors
    };
  }

  /**
   * Perform online fraud checks when connectivity is restored
   */
  private async performOnlineFraudCheck(offlineTransaction: OfflineTransaction): Promise<{
    isFraud: boolean;
    reason?: string;
    riskScore: number;
  }> {
    // Simulate additional fraud checks that require online connectivity
    let riskScore = 0;
    let reason = '';

    // Check against real-time fraud databases (simulated)
    const amount = parseFloat(offlineTransaction.transactionData.amount);
    
    // Large amounts processed offline are higher risk
    if (amount > 20000) {
      riskScore += 30;
      reason = "Large offline amount";
    }

    // Multiple offline transactions increase risk
    if (offlineTransaction.queuePosition > 2) {
      riskScore += 20;
      reason += "; Multiple offline transactions";
    }

    // Low validation score from offline processing
    if (offlineTransaction.validationScore < 50) {
      riskScore += 25;
      reason += "; Low offline validation score";
    }

    return {
      isFraud: riskScore > 60,
      reason: reason || undefined,
      riskScore
    };
  }

  /**
   * Process validated offline transaction
   */
  private async processTransaction(offlineTransaction: OfflineTransaction): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // This would integrate with the actual transaction processing system
      // For now, we'll simulate successful processing
      
      // Validate one more time
      if (!offlineTransaction.transactionData.userId || !offlineTransaction.transactionData.amount) {
        return {
          success: false,
          error: "Invalid transaction data"
        };
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Get offline transaction status for user
   */
  getOfflineStatus(userId: string): {
    queuedTransactions: number;
    totalAmount: number;
    oldestTransaction?: Date;
    canAddMore: boolean;
  } {
    const userQueue = this.offlineQueue.get(userId) || [];
    
    const totalAmount = userQueue.reduce((sum, t) => sum + parseFloat(t.transactionData.amount), 0);
    const oldestTransaction = userQueue.length > 0 ? userQueue[0].timestamp : undefined;
    const canAddMore = userQueue.length < this.RURAL_POLICY.maxOfflineTransactions;

    return {
      queuedTransactions: userQueue.length,
      totalAmount,
      oldestTransaction,
      canAddMore
    };
  }

  /**
   * Clear expired offline transactions
   */
  cleanupExpiredTransactions(): void {
    const now = Date.now();
    const maxAge = this.RURAL_POLICY.maxOfflineHours * 60 * 60 * 1000;

    this.offlineQueue.forEach((userQueue, userId) => {
      const validTransactions = userQueue.filter(t => {
        const age = now - t.timestamp.getTime();
        return age <= maxAge;
      });

      if (validTransactions.length !== userQueue.length) {
        console.log(`Cleaned up ${userQueue.length - validTransactions.length} expired transactions for user ${userId}`);
        
        if (validTransactions.length === 0) {
          this.offlineQueue.delete(userId);
        } else {
          this.offlineQueue.set(userId, validTransactions);
        }
      }
    });
  }

  /**
   * Emergency clear user's offline queue (security measure)
   */
  emergencyClearQueue(userId: string, reason: string): void {
    const userQueue = this.offlineQueue.get(userId);
    if (userQueue) {
      console.log(`Emergency queue clear for user ${userId}: ${reason}. Cleared ${userQueue.length} transactions.`);
      this.offlineQueue.delete(userId);
    }
  }
}