import { storage } from "../storage";
import { InsertDeviceFingerprint } from "@shared/schema";
import * as crypto from "crypto";

export interface RawDeviceInfo {
  // Hardware specs (critical for low-end device identification)
  userAgent: string;
  platform: string;
  cpuCores?: number;
  memoryGB?: number;
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  timezone: string;
  language: string;
  
  // Network information
  ipAddress: string;
  carrier?: string;
  connectionType: string; // 2G, 3G, 4G, wifi
  
  // Browser/App fingerprints
  webglRenderer?: string;
  canvasFingerprint?: string;
  audioFingerprint?: string;
  
  // Behavioral indicators
  touchSupport: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  
  // Rural-specific indicators
  locationAccuracy?: number; // GPS accuracy in rural areas is often poor
  networkSpeed?: number; // Often slower in rural areas
}

export interface ProcessedFingerprint {
  deviceClass: 'low-end' | 'mid-range' | 'high-end';
  ruralLikelihood: number; // 0-100, higher means more likely rural
  uniquenessScore: number; // 0-100, how unique this device is
  stabilityFactors: string[]; // Factors that are stable for this device
  riskFactors: string[]; // Factors that indicate potential fraud
}

export class DeviceFingerprinter {
  private readonly RURAL_INDICATORS = {
    LOW_MEMORY: 2,
    SLOW_CONNECTION: 8,
    POOR_GPS: 6,
    OLD_ANDROID: 4,
    BASIC_BROWSER: 3,
    SINGLE_SIM: 2,
  };

  /**
   * Generate comprehensive device fingerprint optimized for rural banking
   */
  async generateFingerprint(
    userId: string,
    deviceId: string,
    rawInfo: RawDeviceInfo
  ): Promise<ProcessedFingerprint> {
    
    const processed = this.processDeviceInfo(rawInfo);
    
    // Store the fingerprint
    const fingerprintData: InsertDeviceFingerprint = {
      userId,
      deviceId,
      fingerprint: {
        raw: rawInfo,
        processed,
        hash: this.generateDeviceHash(rawInfo),
        timestamp: new Date().toISOString()
      },
      networkInfo: {
        ipAddress: rawInfo.ipAddress,
        carrier: rawInfo.carrier,
        connectionType: rawInfo.connectionType,
        networkSpeed: rawInfo.networkSpeed
      },
      trustScore: this.calculateInitialTrustScore(processed)
    };

    await storage.createDeviceFingerprint(fingerprintData);
    
    return processed;
  }

  /**
   * Process raw device information into security-relevant insights
   */
  private processDeviceInfo(raw: RawDeviceInfo): ProcessedFingerprint {
    const deviceClass = this.classifyDevice(raw);
    const ruralLikelihood = this.assessRuralLikelihood(raw);
    const uniquenessScore = this.calculateUniqueness(raw);
    const { stabilityFactors, riskFactors } = this.analyzeSecurityFactors(raw);

    return {
      deviceClass,
      ruralLikelihood,
      uniquenessScore,
      stabilityFactors,
      riskFactors
    };
  }

  /**
   * Classify device as low-end, mid-range, or high-end
   */
  private classifyDevice(info: RawDeviceInfo): 'low-end' | 'mid-range' | 'high-end' {
    let score = 0;

    // Memory indicators
    if (info.memoryGB && info.memoryGB <= 2) score += 0;
    else if (info.memoryGB && info.memoryGB <= 4) score += 1;
    else score += 2;

    // Screen resolution indicators
    const [width, height] = info.screenResolution.split('x').map(Number);
    if (width <= 720 || height <= 1280) score += 0;
    else if (width <= 1080 || height <= 1920) score += 1;
    else score += 2;

    // CPU indicators (rough estimation from user agent)
    if (info.cpuCores && info.cpuCores <= 4) score += 0;
    else if (info.cpuCores && info.cpuCores <= 8) score += 1;
    else score += 2;

    // Connection quality
    if (info.connectionType === '2G' || info.connectionType === '3G') score += 0;
    else if (info.connectionType === '4G') score += 1;
    else score += 2;

    if (score <= 2) return 'low-end';
    if (score <= 5) return 'mid-range';
    return 'high-end';
  }

  /**
   * Assess likelihood that this device is being used in a rural area
   */
  private assessRuralLikelihood(info: RawDeviceInfo): number {
    let ruralScore = 0;

    // Low memory devices are common in rural areas
    if (info.memoryGB && info.memoryGB <= 2) {
      ruralScore += this.RURAL_INDICATORS.LOW_MEMORY;
    }

    // Slow connection speeds
    if (info.networkSpeed && info.networkSpeed < 1) { // < 1 Mbps
      ruralScore += this.RURAL_INDICATORS.SLOW_CONNECTION;
    }

    // 2G/3G connections more common in rural areas
    if (info.connectionType === '2G' || info.connectionType === '3G') {
      ruralScore += this.RURAL_INDICATORS.SLOW_CONNECTION;
    }

    // Poor GPS accuracy (rural areas often have weaker GPS signals)
    if (info.locationAccuracy && info.locationAccuracy > 100) {
      ruralScore += this.RURAL_INDICATORS.POOR_GPS;
    }

    // Older Android versions (rural users often have older phones)
    if (this.isOldAndroid(info.userAgent)) {
      ruralScore += this.RURAL_INDICATORS.OLD_ANDROID;
    }

    // Basic browser capabilities
    if (!info.webglRenderer || !info.canvasFingerprint) {
      ruralScore += this.RURAL_INDICATORS.BASIC_BROWSER;
    }

    // Low screen resolution
    const [width] = info.screenResolution.split('x').map(Number);
    if (width <= 720) {
      ruralScore += this.RURAL_INDICATORS.LOW_MEMORY;
    }

    return Math.min(ruralScore * 3, 100); // Scale to 0-100
  }

  /**
   * Calculate how unique this device fingerprint is
   */
  private calculateUniqueness(info: RawDeviceInfo): number {
    const factors = [
      info.userAgent,
      info.screenResolution,
      info.timezone,
      info.language,
      info.colorDepth.toString(),
      info.webglRenderer || '',
      info.canvasFingerprint || '',
      info.audioFingerprint || ''
    ];

    // Create a hash of all factors
    const combinedHash = crypto
      .createHash('sha256')
      .update(factors.join('|'))
      .digest('hex');

    // Simulate uniqueness based on hash distribution
    // In a real system, you'd compare against your database
    const hashValue = parseInt(combinedHash.slice(0, 8), 16);
    return Math.min((hashValue % 100) + 20, 100); // 20-100 range
  }

  /**
   * Analyze security-relevant factors
   */
  private analyzeSecurityFactors(info: RawDeviceInfo): {
    stabilityFactors: string[];
    riskFactors: string[];
  } {
    const stabilityFactors: string[] = [];
    const riskFactors: string[] = [];

    // Stability factors (things that don't change often)
    if (info.screenResolution) stabilityFactors.push('screen_resolution');
    if (info.timezone) stabilityFactors.push('timezone');
    if (info.language) stabilityFactors.push('language');
    if (info.webglRenderer) stabilityFactors.push('webgl_renderer');

    // Risk factors
    if (!info.userAgent || info.userAgent.length < 50) {
      riskFactors.push('suspicious_user_agent');
    }

    if (info.canvasFingerprint && info.canvasFingerprint === 'blocked') {
      riskFactors.push('fingerprinting_blocked');
    }

    if (!info.touchSupport && info.platform.includes('Mobile')) {
      riskFactors.push('inconsistent_touch_support');
    }

    // Proxy/VPN indicators
    if (this.isPotentialProxy(info.ipAddress)) {
      riskFactors.push('potential_proxy');
    }

    return { stabilityFactors, riskFactors };
  }

  /**
   * Generate a stable hash for device identification
   */
  private generateDeviceHash(info: RawDeviceInfo): string {
    // Use only stable factors for hashing
    const stableFactors = [
      info.userAgent.replace(/\d+\.\d+\.\d+/g, 'X.X.X'), // Remove version numbers
      info.screenResolution,
      info.timezone,
      info.language,
      info.colorDepth.toString(),
      info.webglRenderer?.replace(/\d+\.\d+/g, 'X.X') || '', // Remove GPU version numbers
    ];

    return crypto
      .createHash('sha256')
      .update(stableFactors.join('|'))
      .digest('hex')
      .slice(0, 32); // First 32 characters
  }

  /**
   * Calculate initial trust score for a new device
   */
  private calculateInitialTrustScore(processed: ProcessedFingerprint): number {
    let score = 50; // Start with neutral

    // Rural devices get slight bonus (they're expected in rural banking)
    if (processed.ruralLikelihood > 70) {
      score += 10;
    }

    // Low-end devices get bonus (common in rural areas)
    if (processed.deviceClass === 'low-end') {
      score += 5;
    }

    // Reduce score for risk factors
    score -= processed.riskFactors.length * 5;

    // Increase score for stability factors
    score += processed.stabilityFactors.length * 2;

    // High uniqueness can be either good (legitimate device) or bad (spoofed)
    if (processed.uniquenessScore > 90) {
      score -= 5; // Slightly suspicious if too unique
    }

    return Math.max(10, Math.min(90, score)); // Keep between 10-90
  }

  /**
   * Update device fingerprint with new information
   */
  async updateDeviceFingerprint(
    deviceId: string,
    userId: string,
    newInfo: Partial<RawDeviceInfo>
  ): Promise<void> {
    const existing = await storage.getDeviceFingerprint(deviceId, userId);
    if (!existing) return;

    const updates = {
      networkInfo: {
        ...existing.networkInfo,
        ...newInfo
      },
      lastSeen: new Date()
    };

    await storage.updateDeviceFingerprint(existing.id, updates);
  }

  /**
   * Check if user agent indicates old Android version
   */
  private isOldAndroid(userAgent: string): boolean {
    const androidMatch = userAgent.match(/Android (\d+)\./);
    if (androidMatch) {
      const version = parseInt(androidMatch[1]);
      return version < 8; // Android versions before 8.0 (2017)
    }
    return false;
  }

  /**
   * Simple check for potential proxy/VPN usage
   */
  private isPotentialProxy(ipAddress: string): boolean {
    // This is a simplified check - in production you'd use a proper IP reputation service
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./
    ];

    return privateRanges.some(range => range.test(ipAddress));
  }

  /**
   * Compare two device fingerprints for similarity
   */
  async compareFingerprints(deviceId1: string, deviceId2: string, userId: string): Promise<{
    similarity: number;
    matchingFactors: string[];
    differentFactors: string[];
  }> {
    const device1 = await storage.getDeviceFingerprint(deviceId1, userId);
    const device2 = await storage.getDeviceFingerprint(deviceId2, userId);

    if (!device1 || !device2) {
      return { similarity: 0, matchingFactors: [], differentFactors: [] };
    }

    const fp1 = device1.fingerprint as any;
    const fp2 = device2.fingerprint as any;

    const factors = ['userAgent', 'screenResolution', 'timezone', 'language', 'webglRenderer'];
    const matchingFactors: string[] = [];
    const differentFactors: string[] = [];

    factors.forEach(factor => {
      if (fp1.raw[factor] === fp2.raw[factor]) {
        matchingFactors.push(factor);
      } else {
        differentFactors.push(factor);
      }
    });

    const similarity = (matchingFactors.length / factors.length) * 100;

    return { similarity, matchingFactors, differentFactors };
  }
}