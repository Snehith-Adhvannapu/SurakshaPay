import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface PinnedCertificate {
  domain: string;
  pins: string[]; // SHA256 hashes of public keys
  backupPins: string[]; // Backup pins for rotation
  expiresAt: Date;
  algorithm: string;
}

export interface AppIntegrityCheck {
  appSignature: string;
  packageName: string;
  versionCode: number;
  installerPackage?: string;
  isDebuggable: boolean;
  firstInstallTime: number;
  lastUpdateTime: number;
}

export class CertificatePinning {
  private readonly TRUSTED_CERTIFICATES: PinnedCertificate[] = [
    {
      domain: "api.ruralbank.com",
      pins: [
        "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=", // Example pin
        "YLh1dUR9y6Kja30RrAn7JKnbQG/uEtLMkBgFF2Fuihg=", // Example pin
      ],
      backupPins: [
        "Vjs8r4z+80wjNcr1YKepWQboSIRi63WsWXhIMN+eWys=", // Backup pin
      ],
      expiresAt: new Date('2025-12-31'),
      algorithm: "sha256"
    }
  ];

  private readonly TRUSTED_APP_SIGNATURES = [
    "30820295308201fd020101300a06082a8648ce3d040302304b310b3009060355040613024145", // Example signature
  ];

  /**
   * Validate certificate pinning for HTTPS requests
   */
  validateCertificatePin(domain: string, certificateChain: string[]): {
    isValid: boolean;
    pinnedDomain?: PinnedCertificate;
    error?: string;
  } {
    const pinnedCert = this.TRUSTED_CERTIFICATES.find(cert => 
      domain.includes(cert.domain) || cert.domain === '*'
    );

    if (!pinnedCert) {
      return {
        isValid: false,
        error: "No certificate pinning configuration found for domain"
      };
    }

    // Check if pinning configuration is expired
    if (new Date() > pinnedCert.expiresAt) {
      console.warn(`Certificate pinning expired for ${domain}`);
      return {
        isValid: false,
        error: "Certificate pinning configuration expired"
      };
    }

    // Extract public key from certificate and compute pin
    for (const cert of certificateChain) {
      const pin = this.computeCertificatePin(cert, pinnedCert.algorithm);
      
      // Check against primary pins
      if (pinnedCert.pins.includes(pin)) {
        return {
          isValid: true,
          pinnedDomain: pinnedCert
        };
      }
      
      // Check against backup pins
      if (pinnedCert.backupPins.includes(pin)) {
        console.warn(`Using backup pin for ${domain}`);
        return {
          isValid: true,
          pinnedDomain: pinnedCert
        };
      }
    }

    return {
      isValid: false,
      error: "Certificate pin validation failed"
    };
  }

  /**
   * Compute certificate pin (SHA256 hash of public key)
   */
  private computeCertificatePin(certificate: string, algorithm: string = 'sha256'): string {
    try {
      // In a real implementation, you'd extract the public key from the X.509 certificate
      // This is a simplified version for demonstration
      const hash = crypto.createHash(algorithm);
      hash.update(certificate);
      return hash.digest('base64');
    } catch (error) {
      console.error('Failed to compute certificate pin:', error);
      return '';
    }
  }

  /**
   * Validate app integrity and authenticity
   */
  validateAppIntegrity(appInfo: AppIntegrityCheck): {
    isValid: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    issues: string[];
  } {
    const issues: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check app signature
    if (!this.TRUSTED_APP_SIGNATURES.includes(appInfo.appSignature)) {
      issues.push("App signature not recognized");
      riskLevel = 'high';
    }

    // Check if app is debuggable (suspicious in production)
    if (appInfo.isDebuggable) {
      issues.push("App is in debug mode");
      riskLevel = 'medium';
    }

    // Check installer package (should be from Google Play, etc.)
    const trustedInstallers = [
      'com.android.vending', // Google Play Store
      'com.amazon.venezia',  // Amazon Appstore
      'com.huawei.appmarket' // Huawei AppGallery
    ];

    if (appInfo.installerPackage && !trustedInstallers.includes(appInfo.installerPackage)) {
      issues.push("App installed from untrusted source");
      riskLevel = 'high';
    }

    // Check for sideloading indicators
    if (!appInfo.installerPackage) {
      issues.push("App appears to be sideloaded");
      riskLevel = 'high';
    }

    // Check package name format
    if (!this.isValidPackageName(appInfo.packageName)) {
      issues.push("Invalid package name format");
      riskLevel = 'high';
    }

    // Check for recent updates (could indicate tampering)
    const timeSinceUpdate = Date.now() - appInfo.lastUpdateTime;
    const daysSinceUpdate = timeSinceUpdate / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 1) {
      issues.push("App was recently updated");
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    return {
      isValid: issues.length === 0,
      riskLevel,
      issues
    };
  }

  /**
   * Validate package name format
   */
  private isValidPackageName(packageName: string): boolean {
    // Valid Android package name pattern
    const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
    return packageRegex.test(packageName);
  }

  /**
   * Check for rooted/jailbroken devices
   */
  detectRootedDevice(deviceInfo: {
    buildTags?: string;
    buildType?: string;
    systemProperties: Record<string, string>;
    installedPackages: string[];
  }): {
    isRooted: boolean;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let rootScore = 0;

    // Check build tags
    if (deviceInfo.buildTags && deviceInfo.buildTags.includes('test-keys')) {
      indicators.push("Test keys detected in build");
      rootScore += 30;
    }

    // Check build type
    if (deviceInfo.buildType && ['userdebug', 'eng'].includes(deviceInfo.buildType)) {
      indicators.push("Debug build type detected");
      rootScore += 25;
    }

    // Check for root management apps
    const rootApps = [
      'com.noshufou.android.su',
      'com.thirdparty.superuser',
      'eu.chainfire.supersu',
      'com.koushikdutta.superuser',
      'com.zachspong.temprootremovejb',
      'com.ramdroid.appquarantine'
    ];

    const detectedRootApps = deviceInfo.installedPackages.filter(pkg => 
      rootApps.includes(pkg)
    );

    if (detectedRootApps.length > 0) {
      indicators.push("Root management apps detected");
      rootScore += 40;
    }

    // Check system properties
    const suspiciousProps = [
      'ro.debuggable',
      'ro.secure',
      'service.adb.root'
    ];

    suspiciousProps.forEach(prop => {
      if (deviceInfo.systemProperties[prop] === '1' && prop !== 'ro.secure') {
        indicators.push(`Suspicious system property: ${prop}`);
        rootScore += 15;
      }
      if (prop === 'ro.secure' && deviceInfo.systemProperties[prop] === '0') {
        indicators.push("Device security disabled");
        rootScore += 25;
      }
    });

    const confidence = Math.min(rootScore, 100);
    const isRooted = rootScore > 50;

    return {
      isRooted,
      confidence,
      indicators
    };
  }

  /**
   * Perform runtime application self-protection (RASP) checks
   */
  performRASPChecks(): {
    isIntact: boolean;
    tamperedComponents: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const tamperedComponents: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      // Check if critical security modules are intact
      const securityModules = [
        'EncryptionFramework',
        'SimSwapDetector', 
        'FraudDetectionML',
        'DeviceFingerprinter'
      ];

      // In a real implementation, you'd check file hashes, code integrity, etc.
      // This is a simplified check
      securityModules.forEach(module => {
        if (!this.validateModuleIntegrity(module)) {
          tamperedComponents.push(module);
          riskLevel = 'high';
        }
      });

      // Check for debugging tools
      if (this.detectDebuggingTools()) {
        tamperedComponents.push("Debugging tools detected");
        riskLevel = 'high';
      }

      // Check for code injection
      if (this.detectCodeInjection()) {
        tamperedComponents.push("Code injection detected");
        riskLevel = 'high';
      }

    } catch (error) {
      console.error('RASP check failed:', error);
      tamperedComponents.push("RASP system compromised");
      riskLevel = 'high';
    }

    return {
      isIntact: tamperedComponents.length === 0,
      tamperedComponents,
      riskLevel
    };
  }

  /**
   * Validate integrity of security module
   */
  private validateModuleIntegrity(moduleName: string): boolean {
    try {
      // In production, this would check file hashes, code signatures, etc.
      // For demo purposes, we'll just check if the module can be loaded
      const modulePath = path.join(__dirname, `${moduleName}.js`);
      return fs.existsSync(modulePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Detect debugging tools
   */
  private detectDebuggingTools(): boolean {
    // Check for common debugging/reverse engineering tools
    // This is a simplified check - in production you'd use more sophisticated detection
    
    const debuggerProcesses = [
      'gdb', 'lldb', 'frida', 'xposed', 'substrate'
    ];

    // In a browser environment, check for developer tools
    if (typeof window !== 'undefined') {
      const devtools = window.outerWidth - window.innerWidth > 160 ||
                      window.outerHeight - window.innerHeight > 160;
      return devtools;
    }

    return false;
  }

  /**
   * Detect code injection attempts
   */
  private detectCodeInjection(): boolean {
    // Check for signs of code injection or tampering
    // This is a simplified implementation
    
    try {
      // Check if critical functions have been modified
      const originalStringify = JSON.stringify.toString();
      if (!originalStringify.includes('[native code]')) {
        return true; // JSON.stringify has been overridden
      }

      // Check for suspicious global variables
      if (typeof window !== 'undefined') {
        const suspiciousGlobals = ['frida', 'xposed', '_', 'hook'];
        return suspiciousGlobals.some(global => global in window);
      }

      return false;
    } catch (error) {
      return true; // If checks fail, assume compromise
    }
  }

  /**
   * Generate app attestation token
   */
  generateAppAttestation(appInfo: AppIntegrityCheck): {
    token: string;
    expiresAt: Date;
    trustLevel: 'high' | 'medium' | 'low';
  } {
    const integrityCheck = this.validateAppIntegrity(appInfo);
    const raspCheck = this.performRASPChecks();
    
    let trustLevel: 'high' | 'medium' | 'low' = 'high';
    
    if (!integrityCheck.isValid || !raspCheck.isIntact) {
      trustLevel = 'low';
    } else if (integrityCheck.riskLevel === 'medium' || raspCheck.riskLevel === 'medium') {
      trustLevel = 'medium';
    }

    const attestationData = {
      appInfo,
      integrityCheck,
      raspCheck,
      timestamp: Date.now(),
      trustLevel,
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const token = crypto
      .createHmac('sha256', process.env.APP_ATTESTATION_SECRET || 'default-secret')
      .update(JSON.stringify(attestationData))
      .digest('base64');

    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

    return {
      token,
      expiresAt,
      trustLevel
    };
  }

  /**
   * Verify app attestation token
   */
  verifyAppAttestation(token: string): {
    isValid: boolean;
    trustLevel?: 'high' | 'medium' | 'low';
    error?: string;
  } {
    try {
      // In a real implementation, you'd decode and verify the token properly
      // This is a simplified version
      const isValidFormat = token.length > 20 && /^[A-Za-z0-9+/=]+$/.test(token);
      
      if (!isValidFormat) {
        return { isValid: false, error: 'Invalid token format' };
      }

      // In production, you'd verify the HMAC signature and decode the payload
      // For demo, we'll assume valid tokens indicate medium trust
      return {
        isValid: true,
        trustLevel: 'medium'
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Token verification failed'
      };
    }
  }
}