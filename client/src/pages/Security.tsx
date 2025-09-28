import AuthenticationCard from "@/components/AuthenticationCard";
import SecurityBadge from "@/components/SecurityBadge";
import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, Lock, Eye, AlertTriangle, CreditCard, Activity, Clock, MapPin, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Security() {
  const { t } = useTranslation();
  const [deviceStatus] = useState<"trusted" | "new" | "suspicious">("trusted");
  const [securityScore] = useState(98);
  const [simSwapData, setSimSwapData] = useState({
    lastSimChange: null as Date | null,
    currentIMEI: '867532045123456',
    carrierName: 'Airtel',
    networkStatus: 'active',
    trustScore: 95,
    monitoringActive: true
  });
  const [fraudDetectionStats, setFraudDetectionStats] = useState({
    blockedAttempts: 5,
    suspiciousTransactions: 12,
    simSwapAttempts: 0,
    deviceChanges: 2,
    offlineTransactions: 18
  });

  const handleAuthenticate = (pin: string) => {
    console.log('Authentication completed from security page:', pin);
  };

  const securityFeatures = [
    {
      icon: Shield,
      title: "Multi-Factor Authentication",
      description: "PIN + SMS verification for enhanced security",
      status: "active",
      color: "text-green-600"
    },
    {
      icon: Smartphone,
      title: "Device Recognition",
      description: "Detects new devices and suspicious activity",
      status: "active", 
      color: "text-green-600"
    },
    {
      icon: Lock,
      title: "Transaction Encryption",
      description: "End-to-end encryption for all transactions",
      status: "active",
      color: "text-green-600"
    },
    {
      icon: Eye,
      title: "Fraud Monitoring",
      description: "24/7 AI-powered fraud detection",
      status: "active",
      color: "text-green-600"
    }
  ];

  const recentSecurityEvents = [
    {
      id: "1",
      type: "login",
      description: "Successful login from trusted device",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "safe"
    },
    {
      id: "2", 
      type: "transaction",
      description: "Large transaction verified successfully",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "safe"
    },
    {
      id: "3",
      type: "device",
      description: "Device fingerprint updated",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: "info"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{t('security.title')}</h1>
            <p className="text-sm opacity-90">Manage your account security</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Security Score */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-green-600" />
              {t('security.securityScore')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{securityScore}%</div>
                <div className="text-sm text-muted-foreground">Excellent Protection</div>
              </div>
              <SecurityBadge status="verified" label="Protected" />
            </div>
          </CardContent>
        </Card>

        {/* SIM Swap Monitoring Dashboard */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-5 h-5 text-blue-600" />
              SIM Swap Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{simSwapData.trustScore}%</div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{fraudDetectionStats.simSwapAttempts}</div>
                <div className="text-xs text-muted-foreground">Blocked Attempts</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current IMEI:</span>
                <span className="font-mono text-xs">{simSwapData.currentIMEI}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Carrier:</span>
                <span className="font-medium">{simSwapData.carrierName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network Status:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 capitalize">{simSwapData.networkStatus}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last SIM Change:</span>
                <span>{simSwapData.lastSimChange ? simSwapData.lastSimChange.toLocaleDateString() : 'No changes detected'}</span>
              </div>
            </div>

            {simSwapData.monitoringActive && (
              <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">Real-time monitoring active</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fraud Detection Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-red-600" />
              Fraud Detection Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-xl font-bold text-red-600">{fraudDetectionStats.blockedAttempts}</div>
                <div className="text-xs text-muted-foreground">Blocked Login Attempts</div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <div className="text-xl font-bold text-amber-600">{fraudDetectionStats.suspiciousTransactions}</div>
                <div className="text-xs text-muted-foreground">Suspicious Transactions</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{fraudDetectionStats.deviceChanges}</div>
                <div className="text-xs text-muted-foreground">Device Changes</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{fraudDetectionStats.offlineTransactions}</div>
                <div className="text-xs text-muted-foreground">Offline Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Test */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Test Authentication</h2>
          <AuthenticationCard
            title="Security Test"
            onAuthenticate={handleAuthenticate}
            deviceStatus={deviceStatus}
          />
        </div>

        {/* Advanced Fraud Detection Features */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Advanced Fraud Detection</h2>
          
          <div className="grid gap-3">
            <Card className="hover-elevate bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 mt-1 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">SIM Swap Detection</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-time monitoring for SIM card changes and suspicious carrier activities
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">Geo-location Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Impossible travel detection and location-based transaction verification
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <WifiOff className="w-5 h-5 mt-1 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">Offline Fraud Detection</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Local fraud validation for poor connectivity areas with sync capability
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 mt-1 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">Agent Behavior Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      ML-powered monitoring of banking agent transaction patterns
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Traditional Security Features */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Traditional Security Features</h2>
          
          <div className="grid gap-3">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-1 ${feature.color}`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          
          <div className="space-y-2">
            {recentSecurityEvents.map((event) => (
              <Card key={event.id} className="hover-elevate">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.status === 'safe' ? 'bg-green-500' : 
                      event.status === 'info' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short', 
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Emergency Actions */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5" />
              Emergency Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              If you suspect unauthorized access to your account
            </p>
            <Button 
              variant="outline" 
              className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
              onClick={() => console.log('Emergency lock initiated')}
              data-testid="button-emergency-lock"
            >
              Lock My Account Immediately
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}