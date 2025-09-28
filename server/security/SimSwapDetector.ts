import { storage } from "../storage";
import { InsertSimSwapDetection, InsertSecurityEvent, InsertFraudAlert } from "@shared/schema";

export interface NetworkInfo {
  carrier?: string;
  mcc?: string; // Mobile Country Code
  mnc?: string; // Mobile Network Code
  imsi?: string; // International Mobile Subscriber Identity
  cellId?: string;
  lac?: string; // Location Area Code
  signalStrength?: number;
  networkType?: string; // 2G, 3G, 4G, 5G
}

export interface DeviceChangeEvent {
  userId: string;
  deviceId: string;
  oldNetworkInfo?: NetworkInfo;
  newNetworkInfo: NetworkInfo;
  timestamp: Date;
}

export class SimSwapDetector {
  private readonly SIM_SWAP_THRESHOLD = 70; // Score above which we consider it a SIM swap
  private readonly CARRIER_CHANGE_WEIGHT = 40;
  private readonly IMSI_CHANGE_WEIGHT = 50;
  private readonly LOCATION_CHANGE_WEIGHT = 30;
  private readonly TIME_FACTOR_WEIGHT = 20;

  /**
   * Detects potential SIM swap based on network changes
   */
  async detectSimSwap(event: DeviceChangeEvent): Promise<number> {
    let suspicionScore = 0;
    const { oldNetworkInfo, newNetworkInfo, userId, deviceId } = event;

    // If no previous network info, this is a new device - medium suspicion
    if (!oldNetworkInfo) {
      suspicionScore += 30;
    } else {
      // Check for carrier change
      if (oldNetworkInfo.carrier !== newNetworkInfo.carrier) {
        suspicionScore += this.CARRIER_CHANGE_WEIGHT;
        console.log(`Carrier change detected: ${oldNetworkInfo.carrier} -> ${newNetworkInfo.carrier}`);
      }

      // Check for IMSI change (strongest indicator)
      if (oldNetworkInfo.imsi && newNetworkInfo.imsi && 
          oldNetworkInfo.imsi !== newNetworkInfo.imsi) {
        suspicionScore += this.IMSI_CHANGE_WEIGHT;
        console.log(`IMSI change detected: ${oldNetworkInfo.imsi} -> ${newNetworkInfo.imsi}`);
      }

      // Check for significant location change (MCC/MNC)
      if (oldNetworkInfo.mcc !== newNetworkInfo.mcc || 
          oldNetworkInfo.mnc !== newNetworkInfo.mnc) {
        suspicionScore += this.LOCATION_CHANGE_WEIGHT;
        console.log(`Location change detected: ${oldNetworkInfo.mcc}/${oldNetworkInfo.mnc} -> ${newNetworkInfo.mcc}/${newNetworkInfo.mnc}`);
      }
    }

    // Check timing patterns - SIM swaps often happen at unusual hours
    const timeRisk = this.assessTimeRisk(event.timestamp);
    suspicionScore += timeRisk;

    // Check device behavior patterns
    const deviceRisk = await this.assessDeviceRisk(userId, deviceId);
    suspicionScore += deviceRisk;

    // Cap at 100
    suspicionScore = Math.min(suspicionScore, 100);

    // Store the detection event
    await this.storeDetectionEvent(event, suspicionScore);

    // If score is above threshold, create security alerts
    if (suspicionScore >= this.SIM_SWAP_THRESHOLD) {
      await this.createSecurityAlerts(userId, suspicionScore, event);
    }

    return suspicionScore;
  }

  /**
   * Assess risk based on timing - SIM swaps often happen during off-hours
   */
  private assessTimeRisk(timestamp: Date): number {
    const hour = timestamp.getHours();
    
    // High risk during late night/early morning (11 PM - 6 AM)
    if (hour >= 23 || hour <= 6) {
      return this.TIME_FACTOR_WEIGHT;
    }
    
    // Medium risk during business hours when telecom offices are open
    if (hour >= 9 && hour <= 17) {
      return this.TIME_FACTOR_WEIGHT * 0.7;
    }
    
    // Lower risk during evening hours
    return this.TIME_FACTOR_WEIGHT * 0.3;
  }

  /**
   * Assess device-based risk factors
   */
  private async assessDeviceRisk(userId: string, deviceId: string): Promise<number> {
    let riskScore = 0;

    // Get device history
    const deviceFingerprint = await storage.getDeviceFingerprint(deviceId, userId);
    
    if (!deviceFingerprint) {
      // Completely new device increases risk
      riskScore += 25;
    } else {
      // Check trust score
      const trustScore = deviceFingerprint.trustScore || 50;
      if (trustScore < 30) {
        riskScore += 20;
      }
      
      // Check recent activity pattern
      const daysSinceLastSeen = deviceFingerprint.lastSeen ? 
        (Date.now() - new Date(deviceFingerprint.lastSeen).getTime()) / (1000 * 60 * 60 * 24) : 0;
      
      if (daysSinceLastSeen > 30) {
        // Device not used for over 30 days
        riskScore += 15;
      }
    }

    // Check recent security events
    const recentEvents = await storage.getUserSecurityEvents(userId, true);
    const recentSimSwapEvents = recentEvents.filter(e => 
      e.eventType === 'sim_swap' && 
      new Date(e.timestamp!).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
    );

    if (recentSimSwapEvents.length > 0) {
      riskScore += 30; // Multiple SIM swap events within a week
    }

    return riskScore;
  }

  /**
   * Store the SIM swap detection event
   */
  private async storeDetectionEvent(event: DeviceChangeEvent, score: number): Promise<void> {
    const detection: InsertSimSwapDetection = {
      userId: event.userId,
      oldCarrier: event.oldNetworkInfo?.carrier,
      newCarrier: event.newNetworkInfo.carrier,
      oldIMSI: event.oldNetworkInfo?.imsi,
      newIMSI: event.newNetworkInfo.imsi,
      detectionScore: score
    };

    await storage.createSimSwapDetection(detection);
  }

  /**
   * Create security alerts and events when SIM swap is detected
   */
  private async createSecurityAlerts(userId: string, score: number, event: DeviceChangeEvent): Promise<void> {
    // Create security event
    const securityEvent: InsertSecurityEvent = {
      userId,
      eventType: "sim_swap",
      severity: score > 85 ? "critical" : "high",
      details: {
        detectionScore: score,
        oldCarrier: event.oldNetworkInfo?.carrier,
        newCarrier: event.newNetworkInfo.carrier,
        deviceId: event.deviceId,
        timestamp: event.timestamp.toISOString()
      },
      deviceId: event.deviceId
    };

    await storage.createSecurityEvent(securityEvent);

    // Create fraud alert for user
    const fraudAlert: InsertFraudAlert = {
      userId,
      alertType: "sim_swap",
      title: "SIM Card Change Detected",
      description: `We detected your SIM card was changed or replaced. If this was not done by you, please secure your account immediately. Detection confidence: ${score}%`,
      severity: score > 85 ? "danger" : "warning",
      actionRequired: true
    };

    await storage.createFraudAlert(fraudAlert);

    console.log(`SIM swap detected for user ${userId} with score ${score}%`);
  }

  /**
   * Analyze historical patterns to improve detection accuracy
   */
  async analyzeHistoricalPatterns(userId: string): Promise<{
    averageCarrierStability: number;
    locationStability: number;
    riskProfile: 'low' | 'medium' | 'high';
  }> {
    const simSwapEvents = await storage.getUserSimSwapEvents(userId);
    const devices = await storage.getUserDevices(userId);

    // Calculate carrier stability (lower is more stable)
    const carrierChanges = simSwapEvents.filter(e => e.oldCarrier !== e.newCarrier).length;
    const averageCarrierStability = Math.max(0, 100 - (carrierChanges * 10));

    // Calculate location stability based on device diversity
    const uniqueCarriers = new Set(devices.map(d => 
      (d.networkInfo as any)?.carrier
    ).filter(Boolean)).size;
    const locationStability = Math.max(0, 100 - (uniqueCarriers * 15));

    // Determine risk profile
    let riskProfile: 'low' | 'medium' | 'high' = 'low';
    if (carrierChanges > 2 || uniqueCarriers > 3) {
      riskProfile = 'high';
    } else if (carrierChanges > 0 || uniqueCarriers > 1) {
      riskProfile = 'medium';
    }

    return {
      averageCarrierStability,
      locationStability,
      riskProfile
    };
  }

  /**
   * Validate a SIM swap event as legitimate (user-initiated)
   */
  async validateSimSwapEvent(detectionId: string, isLegitimate: boolean): Promise<void> {
    await storage.verifySimSwapEvent(detectionId);
    
    if (isLegitimate) {
      // If legitimate, update device trust scores positively
      console.log(`SIM swap event ${detectionId} verified as legitimate`);
    } else {
      // If not legitimate, this was actual fraud - need to escalate
      console.log(`SIM swap event ${detectionId} confirmed as fraudulent - escalating security measures`);
      // Could trigger additional security measures like account lock
    }
  }
}