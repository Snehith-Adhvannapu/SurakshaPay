import * as crypto from "crypto";

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  tag: string;
  timestamp: string;
}

export interface KeyDerivationOptions {
  iterations: number;
  keyLength: number;
  digest: string;
}

export class EncryptionFramework {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_DERIVATION: KeyDerivationOptions = {
    iterations: 100000, // PBKDF2 iterations
    keyLength: 32, // 256 bits
    digest: 'sha512'
  };

  /**
   * Generate a cryptographically secure random salt
   */
  generateSalt(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Derive encryption key from password and salt using PBKDF2
   */
  deriveKey(password: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.KEY_DERIVATION.iterations,
      this.KEY_DERIVATION.keyLength,
      this.KEY_DERIVATION.digest
    );
  }

  /**
   * Encrypt sensitive transaction data
   */
  encryptTransactionData(data: any, userPassword: string, salt: string): EncryptedData {
    try {
      const key = this.deriveKey(userPassword, salt);
      const iv = crypto.randomBytes(12); // 12 bytes for GCM
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      cipher.setAAD(Buffer.from('rural-banking-security'));

      const jsonData = JSON.stringify(data);
      let encrypted = cipher.update(jsonData, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt transaction data');
    }
  }

  /**
   * Decrypt transaction data
   */
  decryptTransactionData(encrypted: EncryptedData, userPassword: string, salt: string): any {
    try {
      const key = this.deriveKey(userPassword, salt);
      const iv = Buffer.from(encrypted.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      
      decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
      decipher.setAAD(Buffer.from('rural-banking-security'));

      let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt transaction data');
    }
  }

  /**
   * Generate secure hash for data integrity verification
   */
  generateSecureHash(data: string, salt: string): string {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Verify data integrity using hash
   */
  verifyDataIntegrity(data: string, hash: string, salt: string): boolean {
    const computedHash = this.generateSecureHash(data, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  /**
   * Generate secure random PIN for rural users
   */
  generateSecurePIN(): string {
    const digits = crypto.randomBytes(2);
    const pin = ((digits[0] << 8) | digits[1]) % 10000;
    return pin.toString().padStart(4, '0');
  }

  /**
   * Hash PIN with salt for secure storage
   */
  hashPIN(pin: string, salt: string): string {
    return crypto.pbkdf2Sync(pin, salt, 50000, 64, 'sha512').toString('hex');
  }

  /**
   * Verify PIN against stored hash
   */
  verifyPIN(pin: string, hash: string, salt: string): boolean {
    const computedHash = this.hashPIN(pin, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  /**
   * Hash password with salt for secure storage
   */
  hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  }

  /**
   * Verify password against stored hash
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  /**
   * Encrypt sensitive user data for offline storage
   */
  encryptOfflineData(data: any, deviceSecret: string): string {
    const key = crypto.createHash('sha256').update(deviceSecret).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt offline data
   */
  decryptOfflineData(encryptedData: string, deviceSecret: string): any {
    const [ivHex, encrypted] = encryptedData.split(':');
    const key = crypto.createHash('sha256').update(deviceSecret).digest();
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  /**
   * Generate secure session token for API authentication
   */
  generateSessionToken(userId: string, deviceId: string): string {
    const payload = {
      userId,
      deviceId,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };
    
    const secret = process.env.SESSION_SECRET || 'default-secret-for-development';
    const signature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return Buffer.from(JSON.stringify({...payload, signature})).toString('base64');
  }

  /**
   * Verify session token
   */
  verifySessionToken(token: string): { userId: string; deviceId: string; isValid: boolean } {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      const { signature, ...data } = payload;
      
      const secret = process.env.SESSION_SECRET || 'default-secret-for-development';
      const expectedSignature = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(data))
        .digest('hex');
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
      
      // Check if token is not expired (24 hours)
      const isNotExpired = (Date.now() - data.timestamp) < (24 * 60 * 60 * 1000);
      
      return {
        userId: data.userId,
        deviceId: data.deviceId,
        isValid: isValid && isNotExpired
      };
    } catch (error) {
      return { userId: '', deviceId: '', isValid: false };
    }
  }

  /**
   * Secure key exchange for rural devices with limited connectivity
   */
  generateKeyExchangeData(userSecret: string): {
    publicKey: string;
    keyId: string;
    expiresAt: string;
  } {
    const keyId = crypto.randomBytes(16).toString('hex');
    const privateKey = crypto.createHash('sha256').update(userSecret + keyId).digest();
    
    // Simplified public key (in production, use proper elliptic curve cryptography)
    const publicKey = crypto.createHash('sha256').update(privateKey.toString('hex')).digest('hex');
    
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(); // 7 days
    
    return {
      publicKey,
      keyId,
      expiresAt
    };
  }

  /**
   * Encrypt data for transmission over unreliable networks
   */
  encryptForTransmission(data: any, sharedSecret: string): {
    payload: string;
    checksum: string;
    timestamp: string;
  } {
    const timestamp = new Date().toISOString();
    const payload = this.encryptOfflineData({ data, timestamp }, sharedSecret);
    const checksum = this.generateSecureHash(payload, sharedSecret);
    
    return {
      payload,
      checksum,
      timestamp
    };
  }

  /**
   * Decrypt and verify transmitted data
   */
  decryptTransmission(transmission: {
    payload: string;
    checksum: string;
    timestamp: string;
  }, sharedSecret: string): { data: any; isValid: boolean } {
    try {
      // Verify checksum first
      const isChecksumValid = this.verifyDataIntegrity(
        transmission.payload,
        transmission.checksum,
        sharedSecret
      );
      
      if (!isChecksumValid) {
        return { data: null, isValid: false };
      }
      
      // Decrypt payload
      const decrypted = this.decryptOfflineData(transmission.payload, sharedSecret);
      
      // Verify timestamp (not too old)
      const transmissionTime = new Date(transmission.timestamp).getTime();
      const now = Date.now();
      const isNotTooOld = (now - transmissionTime) < (60 * 60 * 1000); // 1 hour
      
      return {
        data: decrypted.data,
        isValid: isNotTooOld
      };
    } catch (error) {
      return { data: null, isValid: false };
    }
  }
}