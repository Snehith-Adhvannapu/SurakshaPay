import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SimSwapDetector, type DeviceChangeEvent } from "./security/SimSwapDetector";
import { DeviceFingerprinter, type RawDeviceInfo } from "./security/DeviceFingerprinter";
import { FraudDetectionML } from "./security/FraudDetectionML";
import { EncryptionFramework } from "./security/EncryptionFramework";
import { PhishingDetector, type SMSPattern, type CallPattern } from "./security/PhishingDetector";
import { CertificatePinning, type AppIntegrityCheck } from "./security/CertificatePinning";
import { AnomalyEngine } from "./security/AnomalyEngine";
import { OfflineValidator } from "./security/OfflineValidator";
import { insertUserSchema, insertTransactionSchema, insertDeviceFingerprintSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize security modules
  const simSwapDetector = new SimSwapDetector();
  const deviceFingerprinter = new DeviceFingerprinter();
  const fraudML = new FraudDetectionML();
  const encryption = new EncryptionFramework();
  const phishingDetector = new PhishingDetector();
  const certificatePinning = new CertificatePinning();
  const anomalyEngine = new AnomalyEngine();
  const offlineValidator = new OfflineValidator();

  // Middleware for request validation
  app.use(express.json({ limit: '10mb' }));
  
  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Authentication middleware
  const authenticateRequest = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const validation = encryption.verifySessionToken(token);
    if (!validation.isValid) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = validation.userId;
    req.deviceId = validation.deviceId;
    next();
  };

  // === USER AUTHENTICATION ROUTES ===
  
  // User registration with device fingerprinting
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body.user);
      const deviceInfo: RawDeviceInfo = req.body.deviceInfo;
      const deviceId = req.body.deviceId;

      // Create user
      const user = await storage.createUser(userData);

      // Generate device fingerprint
      const fingerprint = await deviceFingerprinter.generateFingerprint(
        user.id,
        deviceId,
        deviceInfo
      );

      // Generate session token
      const sessionToken = encryption.generateSessionToken(user.id, deviceId);

      res.json({
        user: { id: user.id, username: user.username, accountNumber: user.accountNumber },
        sessionToken,
        deviceFingerprint: fingerprint
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Registration failed' });
    }
  });

  // User login with comprehensive security checks
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password, deviceInfo, deviceId } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Device fingerprinting and validation
      const existingDevice = await storage.getDeviceFingerprint(deviceId, user.id);
      let deviceTrustScore = 50;

      if (existingDevice) {
        await deviceFingerprinter.updateDeviceFingerprint(deviceId, user.id, deviceInfo);
        deviceTrustScore = existingDevice.trustScore || 50;
      } else {
        const fingerprint = await deviceFingerprinter.generateFingerprint(user.id, deviceId, deviceInfo);
        deviceTrustScore = fingerprint.ruralLikelihood > 70 ? 70 : 50;
      }

      // Check for potential SIM swap
      if (deviceInfo.carrier && existingDevice?.networkInfo) {
        const oldNetworkInfo = existingDevice.networkInfo as any;
        const newNetworkInfo = deviceInfo;
        
        const simSwapEvent: DeviceChangeEvent = {
          userId: user.id,
          deviceId,
          oldNetworkInfo,
          newNetworkInfo,
          timestamp: new Date()
        };

        const simSwapScore = await simSwapDetector.detectSimSwap(simSwapEvent);
        if (simSwapScore > 70) {
          return res.status(403).json({ 
            error: 'Security alert detected',
            requiresAdditionalAuth: true,
            securityScore: simSwapScore
          });
        }
      }

      // Generate session token
      const sessionToken = encryption.generateSessionToken(user.id, deviceId);

      res.json({
        user: { id: user.id, username: user.username, accountNumber: user.accountNumber },
        sessionToken,
        deviceTrustScore,
        securityStatus: 'verified'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // === TRANSACTION SECURITY ROUTES ===

  // Secure transaction processing with comprehensive fraud detection
  app.post('/api/transactions/process', authenticateRequest, async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.userId,
        deviceId: req.deviceId
      });

      // Create transaction record
      const transaction = await storage.createTransaction(transactionData);

      // Run comprehensive fraud detection
      const fraudPrediction = await fraudML.predictFraud(transaction, req.userId);
      await storage.updateTransactionFraudScore(transaction.id, fraudPrediction.fraudScore);

      // Run anomaly detection
      const anomalyScore = await anomalyEngine.analyzeTransaction(transaction, req.userId);

      // Combine scores for final decision
      const combinedRiskScore = Math.max(fraudPrediction.fraudScore, anomalyScore.overallScore);

      if (combinedRiskScore > 80) {
        await storage.updateTransactionStatus(transaction.id, 'blocked');
        return res.status(403).json({
          error: 'Transaction blocked due to high fraud risk',
          riskScore: combinedRiskScore,
          reasons: fraudPrediction.primaryReasons.concat(anomalyScore.details)
        });
      } else if (combinedRiskScore > 60) {
        await storage.updateTransactionStatus(transaction.id, 'review');
        return res.status(202).json({
          message: 'Transaction requires additional verification',
          transactionId: transaction.id,
          riskScore: combinedRiskScore,
          recommendedAction: fraudPrediction.recommendedAction
        });
      }

      await storage.updateTransactionStatus(transaction.id, 'verified');

      res.json({
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          status: 'verified',
          timestamp: transaction.timestamp
        },
        securityAnalysis: {
          fraudScore: fraudPrediction.fraudScore,
          anomalyScore: anomalyScore.overallScore,
          riskLevel: fraudPrediction.riskLevel
        }
      });
    } catch (error) {
      console.error('Transaction processing error:', error);
      res.status(400).json({ error: 'Transaction processing failed' });
    }
  });

  // Offline transaction queueing
  app.post('/api/transactions/offline/queue', authenticateRequest, async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.userId,
        deviceId: req.deviceId
      });

      const deviceSecret = req.headers['x-device-secret'] as string;
      if (!deviceSecret) {
        return res.status(400).json({ error: 'Device secret required for offline transactions' });
      }

      const result = await offlineValidator.queueOfflineTransaction(
        req.userId,
        transactionData,
        req.deviceId,
        deviceSecret
      );

      if (!result.success) {
        return res.status(400).json({
          error: 'Offline transaction rejected',
          reasons: result.errors
        });
      }

      res.json({
        message: 'Transaction queued for offline processing',
        transactionId: result.transactionId,
        validationScore: result.validationScore,
        queueStatus: offlineValidator.getOfflineStatus(req.userId)
      });
    } catch (error) {
      console.error('Offline queue error:', error);
      res.status(500).json({ error: 'Failed to queue offline transaction' });
    }
  });

  // Sync offline transactions
  app.post('/api/transactions/offline/sync', authenticateRequest, async (req, res) => {
    try {
      const deviceSecret = req.headers['x-device-secret'] as string;
      if (!deviceSecret) {
        return res.status(400).json({ error: 'Device secret required for sync' });
      }

      const syncResult = await offlineValidator.syncOfflineTransactions(req.userId, deviceSecret);

      res.json({
        message: 'Offline transactions synced',
        syncResult
      });
    } catch (error) {
      console.error('Offline sync error:', error);
      res.status(500).json({ error: 'Failed to sync offline transactions' });
    }
  });

  // === SECURITY MONITORING ROUTES ===

  // Report SMS phishing attempt
  app.post('/api/security/phishing/sms', authenticateRequest, async (req, res) => {
    try {
      const smsData: SMSPattern = req.body;
      const analysis = await phishingDetector.analyzeSMS(smsData, req.userId);

      res.json({
        riskScore: analysis.riskScore,
        phishingType: analysis.phishingType,
        recommendedAction: analysis.recommendedAction,
        riskFactors: analysis.riskFactors
      });
    } catch (error) {
      console.error('SMS analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze SMS' });
    }
  });

  // Report suspicious call
  app.post('/api/security/phishing/call', authenticateRequest, async (req, res) => {
    try {
      const callData: CallPattern = req.body;
      const analysis = await phishingDetector.analyzeCall(callData, req.userId);

      res.json({
        riskScore: analysis.riskScore,
        phishingType: analysis.phishingType,
        recommendedAction: analysis.recommendedAction,
        riskFactors: analysis.riskFactors
      });
    } catch (error) {
      console.error('Call analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze call' });
    }
  });

  // App integrity verification
  app.post('/api/security/app/verify', async (req, res) => {
    try {
      const appInfo: AppIntegrityCheck = req.body;
      
      const integrityResult = certificatePinning.validateAppIntegrity(appInfo);
      const attestation = certificatePinning.generateAppAttestation(appInfo);

      res.json({
        isValid: integrityResult.isValid,
        riskLevel: integrityResult.riskLevel,
        issues: integrityResult.issues,
        attestationToken: attestation.token,
        trustLevel: attestation.trustLevel
      });
    } catch (error) {
      console.error('App verification error:', error);
      res.status(500).json({ error: 'App verification failed' });
    }
  });

  // === USER DATA ROUTES ===

  // Get user transactions with security metadata
  app.get('/api/user/transactions', authenticateRequest, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getUserTransactions(req.userId, limit);

      const enrichedTransactions = transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        timestamp: t.timestamp,
        status: t.status,
        fraudScore: t.fraudScore,
        location: t.location,
        securityStatus: t.fraudScore && t.fraudScore > 60 ? 'high_risk' : 
                       t.fraudScore && t.fraudScore > 30 ? 'medium_risk' : 'low_risk'
      }));

      res.json({ transactions: enrichedTransactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Get user security events
  app.get('/api/user/security/events', authenticateRequest, async (req, res) => {
    try {
      const unresolved = req.query.unresolved === 'true';
      const events = await storage.getUserSecurityEvents(req.userId, unresolved);

      res.json({ events });
    } catch (error) {
      console.error('Get security events error:', error);
      res.status(500).json({ error: 'Failed to fetch security events' });
    }
  });

  // Get fraud alerts
  app.get('/api/user/fraud/alerts', authenticateRequest, async (req, res) => {
    try {
      const active = req.query.active === 'true';
      const alerts = await storage.getUserFraudAlerts(req.userId, active);

      res.json({ alerts });
    } catch (error) {
      console.error('Get fraud alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch fraud alerts' });
    }
  });

  // Dismiss fraud alert
  app.post('/api/user/fraud/alerts/:alertId/dismiss', authenticateRequest, async (req, res) => {
    try {
      await storage.dismissFraudAlert(req.params.alertId);
      res.json({ message: 'Alert dismissed' });
    } catch (error) {
      console.error('Dismiss alert error:', error);
      res.status(500).json({ error: 'Failed to dismiss alert' });
    }
  });

  // === SECURITY ANALYTICS ROUTES ===

  // Get user fraud profile
  app.get('/api/user/security/profile', authenticateRequest, async (req, res) => {
    try {
      const fraudProfile = await fraudML.getUserFraudProfile(req.userId);
      res.json({ fraudProfile });
    } catch (error) {
      console.error('Get fraud profile error:', error);
      res.status(500).json({ error: 'Failed to fetch fraud profile' });
    }
  });

  // Get offline transaction status
  app.get('/api/user/offline/status', authenticateRequest, async (req, res) => {
    try {
      const status = offlineValidator.getOfflineStatus(req.userId);
      res.json({ offlineStatus: status });
    } catch (error) {
      console.error('Get offline status error:', error);
      res.status(500).json({ error: 'Failed to fetch offline status' });
    }
  });

  // === HEALTH AND STATUS ROUTES ===

  // Security system health check
  app.get('/api/security/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      modules: {
        simSwapDetection: 'active',
        deviceFingerprinting: 'active',
        fraudDetection: 'active',
        phishingDetection: 'active',
        certificatePinning: 'active',
        anomalyEngine: 'active',
        offlineValidator: 'active',
        encryption: 'active'
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
