import AuthenticationCard from "@/components/AuthenticationCard";
import SecurityBadge from "@/components/SecurityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, Lock, Eye, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Security() {
  const [deviceStatus] = useState<"trusted" | "new" | "suspicious">("trusted");
  const [securityScore] = useState(98);

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
        <h1 className="text-xl font-semibold">Security Center</h1>
        <p className="text-sm opacity-90">Manage your account security</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Security Score */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-green-600" />
              Security Score
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

        {/* Authentication Test */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Test Authentication</h2>
          <AuthenticationCard
            title="Security Test"
            onAuthenticate={handleAuthenticate}
            deviceStatus={deviceStatus}
          />
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Active Protections</h2>
          
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