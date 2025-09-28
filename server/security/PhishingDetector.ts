import { storage } from "../storage";
import { InsertSecurityEvent, InsertFraudAlert } from "@shared/schema";

export interface SMSPattern {
  sender: string;
  message: string;
  timestamp: Date;
  phoneNumber: string;
  isShortCode: boolean;
}

export interface CallPattern {
  callerNumber: string;
  duration: number; // in seconds
  timestamp: Date;
  wasAnswered: boolean;
  callType: 'incoming' | 'outgoing';
}

export interface PhishingAnalysis {
  riskScore: number; // 0-100
  phishingType: 'sms_phishing' | 'voice_phishing' | 'fake_bank_call' | 'otp_theft' | 'none';
  riskFactors: string[];
  recommendedAction: 'block' | 'warn_user' | 'monitor' | 'safe';
  confidence: number; // 0-100
}

export class PhishingDetector {
  private readonly PHISHING_SMS_KEYWORDS = [
    'verify account', 'click link', 'update details', 'urgent action',
    'suspended account', 'confirm identity', 'otp code', 'pin number',
    'bank details', 'card details', 'expire', 'block', 'temporary lock'
  ];

  private readonly SUSPICIOUS_DOMAINS = [
    'bit.ly', 'tinyurl.com', 'short.link', 't.co'
  ];

  private readonly LEGITIMATE_BANK_CODES = [
    'HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'CANARA', 'BOI', 'PNB'
  ];

  private readonly RURAL_SPECIFIC_THREATS = [
    'government benefit', 'subsidy', 'loan approval', 'kisan credit',
    'pradhan mantri', 'aadhar', 'ration card', 'pension'
  ];

  /**
   * Analyze SMS for phishing patterns
   */
  async analyzeSMS(sms: SMSPattern, userId: string): Promise<PhishingAnalysis> {
    let riskScore = 0;
    const riskFactors: string[] = [];
    let phishingType: PhishingAnalysis['phishingType'] = 'none';

    const message = sms.message.toLowerCase();
    const sender = sms.sender.toLowerCase();

    // Check for fake bank communications
    if (this.isFakeBankSMS(sender, message)) {
      riskScore += 40;
      riskFactors.push('Fake bank communication');
      phishingType = 'sms_phishing';
    }

    // Check for OTP theft attempts
    if (this.isOTPTheftAttempt(message)) {
      riskScore += 35;
      riskFactors.push('OTP theft attempt');
      phishingType = 'otp_theft';
    }

    // Check for suspicious links
    if (this.containsSuspiciousLinks(message)) {
      riskScore += 30;
      riskFactors.push('Suspicious links detected');
    }

    // Check for urgent action requests
    if (this.hasUrgentActionKeywords(message)) {
      riskScore += 25;
      riskFactors.push('Urgent action request');
    }

    // Check for rural-specific scams
    if (this.isRuralSpecificScam(message)) {
      riskScore += 30;
      riskFactors.push('Rural-targeted scam');
      phishingType = 'sms_phishing';
    }

    // Check sender authenticity
    if (!sms.isShortCode && this.claimsToBeBank(message)) {
      riskScore += 25;
      riskFactors.push('Non-shortcode claiming to be bank');
    }

    // Time-based analysis
    const timeRisk = this.assessTimeRisk(sms.timestamp);
    riskScore += timeRisk;
    if (timeRisk > 0) {
      riskFactors.push('Received during suspicious hours');
    }

    // User history analysis
    const historyRisk = await this.analyzeUserSMSHistory(userId, sms);
    riskScore += historyRisk;

    riskScore = Math.min(riskScore, 100);

    const confidence = this.calculateConfidence(riskFactors.length, riskScore);
    const recommendedAction = this.getRecommendedAction(riskScore, confidence);

    // Store security event if high risk
    if (riskScore > 60) {
      await this.createPhishingAlert(userId, 'sms_phishing', sms, riskScore);
    }

    return {
      riskScore,
      phishingType,
      riskFactors,
      recommendedAction,
      confidence
    };
  }

  /**
   * Analyze call patterns for voice phishing
   */
  async analyzeCall(call: CallPattern, userId: string): Promise<PhishingAnalysis> {
    let riskScore = 0;
    const riskFactors: string[] = [];
    let phishingType: PhishingAnalysis['phishingType'] = 'none';

    // Check for fake bank call patterns
    if (this.isSuspiciousCallPattern(call)) {
      riskScore += 30;
      riskFactors.push('Suspicious call pattern');
      phishingType = 'voice_phishing';
    }

    // Check for repeated calls from unknown numbers
    const callFrequency = await this.analyzeCallFrequency(userId, call.callerNumber);
    if (callFrequency.isSpammy) {
      riskScore += 25;
      riskFactors.push('Repeated calls from unknown number');
    }

    // Short duration calls (potential robo-calls)
    if (call.wasAnswered && call.duration < 30) {
      riskScore += 15;
      riskFactors.push('Unusually short call duration');
    }

    // International or premium numbers
    if (this.isHighRiskNumber(call.callerNumber)) {
      riskScore += 20;
      riskFactors.push('High-risk caller number');
    }

    // Time-based analysis
    const timeRisk = this.assessTimeRisk(call.timestamp);
    riskScore += timeRisk;

    riskScore = Math.min(riskScore, 100);

    const confidence = this.calculateConfidence(riskFactors.length, riskScore);
    const recommendedAction = this.getRecommendedAction(riskScore, confidence);

    // Store security event if high risk
    if (riskScore > 50) {
      await this.createPhishingAlert(userId, 'voice_phishing', call, riskScore);
    }

    return {
      riskScore,
      phishingType,
      riskFactors,
      recommendedAction,
      confidence
    };
  }

  /**
   * Check if SMS appears to be from a fake bank
   */
  private isFakeBankSMS(sender: string, message: string): boolean {
    const claimsBank = this.claimsToBeBank(message);
    const isLegitimateCode = this.LEGITIMATE_BANK_CODES.some(code => 
      sender.includes(code.toLowerCase())
    );

    return claimsBank && !isLegitimateCode;
  }

  /**
   * Check if message claims to be from a bank
   */
  private claimsToBeBank(message: string): boolean {
    const bankKeywords = ['bank', 'account', 'card', 'atm', 'transaction', 'balance'];
    return bankKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check for OTP theft attempts
   */
  private isOTPTheftAttempt(message: string): boolean {
    const otpKeywords = [
      'share otp', 'give otp', 'tell otp', 'send otp',
      'otp code', 'pin number', 'verification code'
    ];
    
    return otpKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check for suspicious links in message
   */
  private containsSuspiciousLinks(message: string): boolean {
    // Simple URL detection
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex) || [];

    return urls.some(url => {
      return this.SUSPICIOUS_DOMAINS.some(domain => url.includes(domain)) ||
             !url.includes('https') || // Non-HTTPS links
             url.includes('bit.ly') || url.includes('tinyurl');
    });
  }

  /**
   * Check for urgent action keywords
   */
  private hasUrgentActionKeywords(message: string): boolean {
    const urgentKeywords = [
      'immediate', 'urgent', 'expire', 'suspend', 'block',
      'within 24 hours', 'act now', 'limited time'
    ];

    return urgentKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check for rural-specific scam patterns
   */
  private isRuralSpecificScam(message: string): boolean {
    return this.RURAL_SPECIFIC_THREATS.some(threat => message.includes(threat));
  }

  /**
   * Assess time-based risk (phishing often happens at odd hours)
   */
  private assessTimeRisk(timestamp: Date): number {
    const hour = timestamp.getHours();
    
    // High risk during late night/early morning
    if (hour >= 23 || hour <= 5) {
      return 15;
    }
    
    // Medium risk during very early morning
    if (hour >= 6 && hour <= 8) {
      return 8;
    }
    
    return 0;
  }

  /**
   * Analyze user's SMS history for patterns
   */
  private async analyzeUserSMSHistory(userId: string, currentSMS: SMSPattern): Promise<number> {
    // In a real implementation, we'd check against user's SMS history
    // For now, we'll simulate this analysis
    
    let riskScore = 0;
    
    // If user has received similar messages recently
    const recentEvents = await storage.getUserSecurityEvents(userId, true);
    const recentPhishingEvents = recentEvents.filter(e => 
      e.eventType === 'phishing' && 
      new Date(e.timestamp!).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    );

    if (recentPhishingEvents.length > 0) {
      riskScore += 20; // User is being targeted
    }

    return riskScore;
  }

  /**
   * Check for suspicious call patterns
   */
  private isSuspiciousCallPattern(call: CallPattern): boolean {
    const number = call.callerNumber;
    
    // Very long numbers (international premium)
    if (number.length > 12) return true;
    
    // Numbers starting with suspicious codes
    if (number.startsWith('+1900') || number.startsWith('+1976')) return true;
    
    // Sequential or repeated digits
    if (/(\d)\1{4,}/.test(number)) return true;
    
    return false;
  }

  /**
   * Analyze call frequency from a specific number
   */
  private async analyzeCallFrequency(userId: string, callerNumber: string): Promise<{
    isSpammy: boolean;
    callCount: number;
  }> {
    // Simulate call history analysis
    // In production, this would check actual call logs
    
    const recentEvents = await storage.getUserSecurityEvents(userId, true);
    const callEvents = recentEvents.filter(e => 
      e.eventType === 'phishing' && 
      (e.details as any)?.callerNumber === callerNumber
    );

    return {
      isSpammy: callEvents.length > 2,
      callCount: callEvents.length
    };
  }

  /**
   * Check if number is high-risk (premium, international, etc.)
   */
  private isHighRiskNumber(number: string): boolean {
    // Premium rate numbers
    if (number.startsWith('+1900') || number.startsWith('+1976')) return true;
    
    // Some international codes associated with scams
    const riskyCountryCodes = ['+234', '+233', '+1876', '+1809'];
    if (riskyCountryCodes.some(code => number.startsWith(code))) return true;
    
    return false;
  }

  /**
   * Calculate confidence score based on evidence
   */
  private calculateConfidence(factorCount: number, riskScore: number): number {
    // More factors = higher confidence
    // Higher risk score = higher confidence (if supported by factors)
    
    let confidence = Math.min(factorCount * 20, 80);
    
    if (riskScore > 70 && factorCount >= 3) {
      confidence = Math.min(confidence + 20, 95);
    }
    
    return confidence;
  }

  /**
   * Get recommended action based on risk score and confidence
   */
  private getRecommendedAction(riskScore: number, confidence: number): PhishingAnalysis['recommendedAction'] {
    if (riskScore > 80 && confidence > 70) return 'block';
    if (riskScore > 60) return 'warn_user';
    if (riskScore > 30) return 'monitor';
    return 'safe';
  }

  /**
   * Create phishing alert and security event
   */
  private async createPhishingAlert(
    userId: string, 
    type: 'sms_phishing' | 'voice_phishing',
    evidence: SMSPattern | CallPattern,
    riskScore: number
  ): Promise<void> {
    // Create security event
    const securityEvent: InsertSecurityEvent = {
      userId,
      eventType: 'phishing',
      severity: riskScore > 70 ? 'high' : 'medium',
      details: {
        phishingType: type,
        evidence,
        riskScore,
        timestamp: new Date().toISOString()
      }
    };

    await storage.createSecurityEvent(securityEvent);

    // Create fraud alert
    const alertTitle = type === 'sms_phishing' ? 
      'Suspicious SMS Detected' : 'Suspicious Call Detected';
    
    const alertDescription = type === 'sms_phishing' ?
      'We detected a potentially fraudulent SMS. Never share your OTP, PIN, or banking details via SMS.' :
      'We detected a suspicious call pattern. Banks will never ask for your PIN or OTP over phone.';

    const fraudAlert: InsertFraudAlert = {
      userId,
      alertType: 'phishing',
      title: alertTitle,
      description: alertDescription,
      severity: riskScore > 70 ? 'danger' : 'warning',
      actionRequired: riskScore > 70
    };

    await storage.createFraudAlert(fraudAlert);

    console.log(`Phishing detected for user ${userId}: ${type} with risk score ${riskScore}`);
  }

  /**
   * Train the phishing detector with user feedback
   */
  async updateWithFeedback(
    eventId: string,
    wasActualPhishing: boolean,
    userFeedback?: string
  ): Promise<void> {
    // Log feedback for model improvement
    console.log(`Phishing feedback for event ${eventId}: ${wasActualPhishing ? 'PHISHING' : 'LEGITIMATE'}`);
    if (userFeedback) {
      console.log(`User feedback: ${userFeedback}`);
    }

    // Mark security event as resolved
    await storage.resolveSecurityEvent(eventId);

    // In production, this feedback would be used to improve detection algorithms
  }
}