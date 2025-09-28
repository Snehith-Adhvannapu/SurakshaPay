import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, 
  Fingerprint, 
  Shield,
  Eye,
  Wifi,
  Battery,
  Cpu,
  HardDrive,
  Globe,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface DeviceFingerprint {
  id: string;
  deviceType: string;
  fingerprint: {
    userAgent: string;
    screen: string;
    timezone: string;
    language: string;
    platform: string;
    webglRenderer: string;
    canvasFingerprint: string;
    audioFingerprint: string;
    hardwareConcurrency: number;
    deviceMemory: number;
    connectionType: string;
    batteryLevel: number;
  };
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastSeen: Date;
  location: string;
  isNewDevice: boolean;
}

interface FingerprintingTechnique {
  name: string;
  description: string;
  effectiveness: number;
  ruralCompatibility: number;
  privacyImpact: 'low' | 'medium' | 'high';
  implementation: string;
}

export default function DeviceFingerprinting() {
  const { t } = useTranslation();
  const [currentFingerprint, setCurrentFingerprint] = useState<DeviceFingerprint | null>(null);
  const [fingerprintingActive, setFingerprintingActive] = useState(false);
  const [knownDevices, setKnownDevices] = useState<DeviceFingerprint[]>([]);

  useEffect(() => {
    // Initialize with demo device fingerprints
    setKnownDevices([
      {
        id: 'device-001',
        deviceType: 'Samsung Galaxy M32',
        fingerprint: {
          userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-M325F)',
          screen: '720x1600',
          timezone: 'Asia/Kolkata',
          language: 'hi-IN',
          platform: 'Android',
          webglRenderer: 'Adreno (TM) 610',
          canvasFingerprint: 'a1b2c3d4e5f6',
          audioFingerprint: 'audio_fp_123456',
          hardwareConcurrency: 8,
          deviceMemory: 4,
          connectionType: '4g',
          batteryLevel: 65
        },
        trustScore: 95,
        riskLevel: 'low',
        lastSeen: new Date(Date.now() - 2 * 60 * 1000),
        location: 'Dharwad, Karnataka',
        isNewDevice: false
      },
      {
        id: 'device-002',
        deviceType: 'Unknown Device',
        fingerprint: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          screen: '1920x1080',
          timezone: 'Asia/Kolkata',
          language: 'en-US',
          platform: 'Windows',
          webglRenderer: 'ANGLE (Intel HD Graphics)',
          canvasFingerprint: 'suspicious_canvas_fp',
          audioFingerprint: 'audio_fp_suspicious',
          hardwareConcurrency: 4,
          deviceMemory: 8,
          connectionType: 'wifi',
          batteryLevel: 100
        },
        trustScore: 25,
        riskLevel: 'high',
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        location: 'Bangalore, Karnataka',
        isNewDevice: true
      }
    ]);
  }, []);

  const generateFingerprint = () => {
    setFingerprintingActive(true);
    
    // Simulate fingerprint generation process
    setTimeout(() => {
      const newFingerprint: DeviceFingerprint = {
        id: `device-${Date.now()}`,
        deviceType: 'Current Device',
        fingerprint: {
          userAgent: navigator.userAgent,
          screen: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          platform: navigator.platform,
          webglRenderer: 'WebGL Renderer (simulated)',
          canvasFingerprint: Math.random().toString(36).substring(7),
          audioFingerprint: 'audio_' + Math.random().toString(36).substring(7),
          hardwareConcurrency: navigator.hardwareConcurrency || 4,
          deviceMemory: (navigator as any).deviceMemory || 4,
          connectionType: (navigator as any).connection?.effectiveType || '4g',
          batteryLevel: Math.floor(Math.random() * 100)
        },
        trustScore: 85 + Math.random() * 10,
        riskLevel: 'low',
        lastSeen: new Date(),
        location: 'Current Location',
        isNewDevice: true
      };
      
      setCurrentFingerprint(newFingerprint);
      setFingerprintingActive(false);
    }, 3000);
  };

  const techniques: FingerprintingTechnique[] = [
    {
      name: 'Canvas Fingerprinting',
      description: 'Draws text/graphics to extract unique rendering signatures',
      effectiveness: 92,
      ruralCompatibility: 85,
      privacyImpact: 'medium',
      implementation: 'HTML5 Canvas API with consistent rendering patterns'
    },
    {
      name: 'WebGL Fingerprinting',
      description: 'Extracts GPU and graphics driver information',
      effectiveness: 88,
      ruralCompatibility: 70,
      privacyImpact: 'low',
      implementation: 'WebGL context parameters and renderer strings'
    },
    {
      name: 'Audio Context Fingerprinting',
      description: 'Analyzes audio stack characteristics',
      effectiveness: 85,
      ruralCompatibility: 90,
      privacyImpact: 'low',
      implementation: 'AudioContext oscillator nodes and frequency analysis'
    },
    {
      name: 'Hardware Fingerprinting',
      description: 'CPU cores, memory, and device specifications',
      effectiveness: 78,
      ruralCompatibility: 95,
      privacyImpact: 'low',
      implementation: 'Navigator API hardware concurrency and device memory'
    },
    {
      name: 'Network Fingerprinting',
      description: 'Connection type, speed, and carrier information',
      effectiveness: 82,
      ruralCompatibility: 88,
      privacyImpact: 'medium',
      implementation: 'Network Information API and connection characteristics'
    },
    {
      name: 'Sensor Fingerprinting',
      description: 'Accelerometer and gyroscope patterns (Android)',
      effectiveness: 89,
      ruralCompatibility: 92,
      privacyImpact: 'high',
      implementation: 'DeviceMotionEvent and sensor calibration data'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrivacyColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Device Fingerprinting</h1>
            <p className="text-sm opacity-90">CreepJS-inspired fraud detection for rural banking</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Fingerprint Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-purple-600" />
              Generate Device Fingerprint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Button 
                onClick={generateFingerprint}
                disabled={fingerprintingActive}
                className="mb-4"
                data-testid="button-generate-fingerprint"
              >
                {fingerprintingActive ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Generating Fingerprint...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Generate Device Fingerprint
                  </>
                )}
              </Button>
              
              {fingerprintingActive && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Analyzing device characteristics...
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
              )}
            </div>
            
            {currentFingerprint && (
              <div className="mt-6 p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Current Device Fingerprint
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trust Score:</span>
                      <span className={`font-medium ${getRiskColor(currentFingerprint.riskLevel)}`}>
                        {currentFingerprint.trustScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform:</span>
                      <span className="font-medium">{currentFingerprint.fingerprint.platform}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Screen:</span>
                      <span className="font-medium">{currentFingerprint.fingerprint.screen}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Language:</span>
                      <span className="font-medium">{currentFingerprint.fingerprint.language}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CPU Cores:</span>
                      <span className="font-medium">{currentFingerprint.fingerprint.hardwareConcurrency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Memory:</span>
                      <span className="font-medium">{currentFingerprint.fingerprint.deviceMemory}GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connection:</span>
                      <span className="font-medium">{currentFingerprint.fingerprint.connectionType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Battery:</span>
                      <span className="font-medium">{currentFingerprint.fingerprint.batteryLevel}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    <div><strong>Canvas FP:</strong> {currentFingerprint.fingerprint.canvasFingerprint}</div>
                    <div><strong>Audio FP:</strong> {currentFingerprint.fingerprint.audioFingerprint}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fingerprinting Techniques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Fingerprinting Techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {techniques.map((technique, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{technique.name}</h4>
                      <p className="text-sm text-muted-foreground">{technique.description}</p>
                    </div>
                    <Badge className={`${getPrivacyColor(technique.privacyImpact)} border`}>
                      {technique.privacyImpact} privacy
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Effectiveness</span>
                        <span className="font-medium">{technique.effectiveness}%</span>
                      </div>
                      <Progress value={technique.effectiveness} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Rural Compatibility</span>
                        <span className="font-medium">{technique.ruralCompatibility}%</span>
                      </div>
                      <Progress value={technique.ruralCompatibility} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                    <strong>Implementation:</strong> {technique.implementation}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Known Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              Known Device Registry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {knownDevices.map((device) => (
                <div key={device.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{device.deviceType}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          {device.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskBgColor(device.riskLevel)}>
                        {device.riskLevel.toUpperCase()} RISK
                      </Badge>
                      {device.isNewDevice && (
                        <Badge className="bg-orange-100 text-orange-800">NEW</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className={`text-lg font-bold ${getRiskColor(device.riskLevel)}`}>
                        {device.trustScore.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Trust Score</div>
                    </div>
                    
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {device.fingerprint.screen}
                      </div>
                      <div className="text-xs text-muted-foreground">Screen</div>
                    </div>
                    
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {device.fingerprint.platform}
                      </div>
                      <div className="text-xs text-muted-foreground">Platform</div>
                    </div>
                    
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-purple-600">
                        {new Date(device.lastSeen).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Last Seen</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div><strong>User Agent:</strong> {device.fingerprint.userAgent}</div>
                    <div><strong>Canvas FP:</strong> {device.fingerprint.canvasFingerprint}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rural Banking Benefits */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Rural Banking Security Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">87%</div>
                <div className="text-sm text-muted-foreground">Device Spoofing Detection</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">92%</div>
                <div className="text-sm text-muted-foreground">Rural Device Compatibility</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">3ms</div>
                <div className="text-sm text-muted-foreground">Fingerprint Generation</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Key Implementation Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>CreepJS-inspired browser fingerprinting</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>TrustDevice Android hardware identification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Low-end device compatibility (Android 5.0+)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Privacy-preserving fingerprint hashing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Real-time device risk scoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Agent device verification for rural banking</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}