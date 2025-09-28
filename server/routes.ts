import { Router } from "express";
import { storage } from "./storage";
import { fraudDetectionML } from "./security/FraudDetectionML";
import { agentBehaviorAnalyzer } from "./security/AgentBehaviorAnalyzer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { InsertUser, InsertTransaction } from "@shared/schema";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Auth routes
router.post("/api/register", async (req, res) => {
  try {
    const { username, password, phoneNumber, accountNumber, bankName, ifscCode } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingPhone = await storage.getUserByPhone(phoneNumber);
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordSalt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    const newUser: InsertUser = {
      username,
      passwordHash,
      passwordSalt,
      phoneNumber,
      accountNumber,
    };

    const user = await storage.createUser(newUser);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Real data routes (protected)
router.get("/api/user/profile", authenticateToken, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      accountNumber: user.accountNumber,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

router.get("/api/user/balance", authenticateToken, async (req: any, res) => {
  try {
    // In real implementation, this would connect to actual bank API
    // For now, we'll simulate balance based on transaction history
    const transactions = await storage.getUserTransactions(req.userId);

    let balance = 50000; // Starting balance for simulation

    for (const transaction of transactions) {
      if (transaction.type === 'credit') {
        balance += parseFloat(transaction.amount);
      } else {
        balance -= parseFloat(transaction.amount);
      }
    }

    res.json({
      balance: balance,
      lastUpdated: new Date().toISOString(),
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

router.get("/api/user/transactions", authenticateToken, async (req: any, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await storage.getUserTransactions(req.userId, limit);

    res.json({
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: parseFloat(tx.amount),
        description: tx.description,
        timestamp: tx.timestamp,
        location: tx.location,
        status: tx.status,
        fraudScore: tx.fraudScore
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.post("/api/user/transaction", authenticateToken, async (req: any, res) => {
  try {
    const { amount, type, description, location, deviceId } = req.body;

    if (!amount || !type || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTransaction: InsertTransaction = {
      userId: req.userId,
      amount: amount.toString(),
      type,
      description,
      location: location || '',
      deviceId: deviceId || ''
    };

    const transaction = await storage.createTransaction(newTransaction);

    // Run fraud detection
    const fraudResult = await fraudDetectionML.predictFraud(req.userId, transaction);

    // Update transaction with fraud score
    await storage.updateTransactionFraudScore(transaction.id, fraudResult.fraudScore);

    if (fraudResult.fraudScore > 70) {
      // Create fraud alert
      await storage.createFraudAlert({
        userId: req.userId,
        alertType: 'unauthorized',
        title: 'Suspicious Transaction Detected',
        description: `Transaction of ₹${amount} flagged as suspicious. Reasons: ${fraudResult.reasons.join(', ')}`,
        severity: 'danger',
        actionRequired: true
      });
    }

    res.json({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        timestamp: transaction.timestamp,
        fraudScore: fraudResult.fraudScore,
        status: transaction.status
      },
      fraudResult
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

router.get("/api/user/fraud-alerts", authenticateToken, async (req: any, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const alerts = await storage.getUserFraudAlerts(req.userId, activeOnly);

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fraud alerts" });
  }
});

router.post("/api/user/fraud-alerts/:alertId/dismiss", authenticateToken, async (req: any, res) => {
  try {
    await storage.dismissFraudAlert(req.params.alertId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to dismiss alert" });
  }
});

export { router };