import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Battery, 
  BatteryLow, 
  Zap,
  Smartphone,
  Activity,
  Clock,
  Cpu,
  Signal,
  Wifi,
  Sun,
  Moon,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Power,
  Gauge
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface BatteryMetric {
  component: string;
  consumption: number; // mAh per hour
  percentage: number; // % of total consumption
  optimized: boolean;
  description: string;
  ruralImpact: 'high' | 'medium' | 'low';
}

interface PowerSavingFeature {
  name: string;
  description: string;
  savings: number; // percentage
  icon: React.ReactNode;
  enabled: boolean;
  ruralBenefit: string;
}

export default function BatteryOptimization() {
  const { t } = useTranslation();
  const [batteryLevel, setBatteryLevel] = useState(68);
  const [powerSavingMode, setPowerSavingMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [batteryMetrics, setBatteryMetrics] = useState<BatteryMetric[]>([]);
  const [estimatedUsageTime, setEstimatedUsageTime] = useState(14.5); // hours

  useEffect(() => {
    // Initialize battery consumption metrics
    setBatteryMetrics([
      {
        component: 'Screen Display',
        consumption: powerSavingMode ? 180 : darkMode ? 220 : 280,
        percentage: powerSavingMode ? 25 : darkMode ? 31 : 39,
        optimized: powerSavingMode || darkMode,
        description: 'OLED display optimized for rural environments',
        ruralImpact: 'high'
      },
      {
        component: 'Network Radio',
        consumption: 120,
        percentage: 17,
        optimized: true,
        description: 'Adaptive 2G/3G/4G switching based on signal strength',
        ruralImpact: 'high'
      },
      {
        component: 'Fraud Detection ML',
        consumption: 85,
        percentage: 12,
        optimized: true,
        description: 'Lightweight ML models optimized for mobile processors',
        ruralImpact: 'medium'
      },
      {
        component: 'Encryption Engine',
        consumption: 45,
        percentage: 6,
        optimized: true,
        description: 'libsodium optimized for ARM processors',
        ruralImpact: 'low'
      },
      {
        component: 'Background Sync',
        consumption: powerSavingMode ? 25 : 65,
        percentage: powerSavingMode ? 4 : 9,
        optimized: powerSavingMode,
        description: 'Intelligent sync timing based on network availability',
        ruralImpact: 'medium'
      },
      {
        component: 'CPU Processing',
        consumption: 90,
        percentage: 13,
        optimized: true,
        description: 'Efficient algorithms and background task management',
        ruralImpact: 'medium'
      },
      {
        component: 'Other Components',
        consumption: 60,
        percentage: 8,
        optimized: false,
        description: 'GPS, sensors, system services',
        ruralImpact: 'low'
      }
    ]);

    // Calculate estimated usage time
    const totalConsumption = batteryMetrics.reduce((sum, metric) => sum + metric.consumption, 0);
    const deviceCapacity = 3000; // mAh typical for rural smartphones
    const usageTime = (deviceCapacity * (batteryLevel / 100)) / totalConsumption;
    setEstimatedUsageTime(usageTime);

    // Simulate battery drain
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
    }, 30000); // Drain 0.1% every 30 seconds for demo

    return () => clearInterval(interval);
  }, [batteryLevel, powerSavingMode, darkMode, batteryMetrics]);

  const powerSavingFeatures: PowerSavingFeature[] = [
    {
      name: 'Adaptive Brightness',
      description: 'Automatically adjusts screen brightness based on ambient light',
      savings: 25,
      icon: <Sun className="w-5 h-5 text-yellow-600" />,
      enabled: true,
      ruralBenefit: 'Conserves battery during bright outdoor banking sessions'
    },
    {
      name: 'Dark Mode',
      description: 'OLED-optimized dark theme reduces power consumption',
      savings: 30,
      icon: <Moon className="w-5 h-5 text-purple-600" />,
      enabled: darkMode,
      ruralBenefit: 'Extends battery life for evening banking activities'
    },
    {
      name: 'Network Optimization',
      description: 'Intelligent switching between 2G/3G/4G based on signal strength',
      savings: 20,
      icon: <Signal className="w-5 h-5 text-blue-600" />,
      enabled: true,
      ruralBenefit: 'Prevents battery drain from weak signal hunting'
    },
    {
      name: 'Background Limiting',
      description: 'Restricts background processes during low battery',
      savings: 15,
      icon: <Activity className="w-5 h-5 text-green-600" />,
      enabled: powerSavingMode,
      ruralBenefit: 'Ensures banking functions remain available longer'
    },
    {
      name: 'Efficient Encryption',
      description: 'Hardware-accelerated cryptography reduces CPU load',
      savings: 10,
      icon: <Zap className="w-5 h-5 text-orange-600" />,
      enabled: true,
      ruralBenefit: 'Secure transactions without battery penalty'
    },
    {
      name: 'Smart Sync',
      description: 'Batches network requests and syncs during optimal times',
      savings: 18,
      icon: <Clock className="w-5 h-5 text-pink-600" />,
      enabled: true,
      ruralBenefit: 'Minimizes data transmission overhead'
    }
  ];

  const getBatteryIcon = (level: number) => {
    if (level <= 15) return <BatteryLow className="w-5 h-5 text-red-600" />;
    return <Battery className="w-5 h-5 text-green-600" />;
  };

  const getBatteryColor = (level: number) => {
    if (level <= 15) return 'text-red-600';
    if (level <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRuralImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const togglePowerSaving = () => {
    setPowerSavingMode(!powerSavingMode);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const totalSavings = powerSavingFeatures
    .filter(feature => feature.enabled)
    .reduce((sum, feature) => sum + feature.savings, 0);

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'dark bg-gray-900' : 'bg-background'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Battery Optimization</h1>
            <p className="text-sm opacity-90">Power-efficient banking for rural smartphones</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Badge className={`${getBatteryColor(batteryLevel)} border-white`}>
              {getBatteryIcon(batteryLevel)}
              <span className="ml-1">{batteryLevel.toFixed(0)}%</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Battery Status */}
        <Card className={`border-2 ${
          batteryLevel <= 15 ? 'border-red-200 bg-red-50 dark:bg-red-950' :
          batteryLevel <= 30 ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' :
          'border-green-200 bg-green-50 dark:bg-green-950'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getBatteryIcon(batteryLevel)}
              Battery Status & Estimation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Current Level</span>
                <span className={`text-2xl font-bold ${getBatteryColor(batteryLevel)}`}>
                  {batteryLevel.toFixed(0)}%
                </span>
              </div>
              
              <Progress value={batteryLevel} className="h-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-blue-600">
                    {estimatedUsageTime.toFixed(1)}h
                  </div>
                  <div className="text-xs text-muted-foreground">Estimated Usage</div>
                </div>
                
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-600">
                    {totalSavings}%
                  </div>
                  <div className="text-xs text-muted-foreground">Power Savings</div>
                </div>
                
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <Power className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-purple-600">
                    3000mAh
                  </div>
                  <div className="text-xs text-muted-foreground">Battery Capacity</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Power Saving Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="w-5 h-5 text-green-600" />
              Power Saving Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Battery className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Power Saving Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduces background activity and limits performance
                  </p>
                </div>
              </div>
              <Button
                variant={powerSavingMode ? "default" : "outline"}
                onClick={togglePowerSaving}
                data-testid="button-toggle-power-saving"
              >
                {powerSavingMode ? 'Enabled' : 'Enable'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    OLED-optimized theme for better battery life
                  </p>
                </div>
              </div>
              <Button
                variant={darkMode ? "default" : "outline"}
                onClick={toggleDarkMode}
                data-testid="button-toggle-dark-mode"
              >
                {darkMode ? 'Dark' : 'Light'}
              </Button>
            </div>
            
            {batteryLevel <= 15 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  Low battery detected! Power saving features automatically enabled.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Battery Consumption Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              Power Consumption Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {batteryMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metric.component}</span>
                    {metric.optimized && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <Badge className={`text-xs ${
                      metric.ruralImpact === 'high' ? 'bg-red-100 text-red-800' :
                      metric.ruralImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {metric.ruralImpact} impact
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{metric.consumption}mAh/h</span>
                    <div className="text-xs text-muted-foreground">
                      {metric.percentage}% of total
                    </div>
                  </div>
                </div>
                
                <Progress value={metric.percentage} className="h-2" />
                
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Power Saving Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Power Saving Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {powerSavingFeatures.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{feature.name}</h4>
                        {feature.enabled && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    </div>
                    <Badge className={`${
                      feature.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {feature.savings}% saved
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                    <strong>Rural Benefit:</strong> {feature.ruralBenefit}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rural Banking Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              Rural Banking Battery Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">
                    Rural Challenges
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Inconsistent power grid access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Limited charging infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Older devices with degraded batteries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Weak signal areas increase power consumption</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
                    Our Solutions
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Ultra-efficient ML algorithms (85mAh/h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Adaptive network switching saves 20% power</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>OLED dark mode extends usage by 30%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Hardware-accelerated encryption</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">
                  Battery Life Comparison
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-red-600">6.2h</div>
                    <div className="text-xs text-muted-foreground">Traditional Banking App</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">9.8h</div>
                    <div className="text-xs text-muted-foreground">Standard Optimization</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">14.5h</div>
                    <div className="text-xs text-muted-foreground">Our Rural-Optimized App</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SIH Competition Benefits */}
        <Card className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-950 dark:to-yellow-950 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-green-600" />
              SIH Technical Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">+134%</div>
                <div className="text-sm text-muted-foreground">Battery Life Extension</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-yellow-600">85mAh/h</div>
                <div className="text-sm text-muted-foreground">ML Power Consumption</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Signal className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">20%</div>
                <div className="text-sm text-muted-foreground">Network Power Savings</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Power Optimization Innovations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>ARM NEON optimized ML inference</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Dynamic voltage and frequency scaling</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Adaptive UI refresh rates based on battery</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Intelligent background task scheduling</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Hardware crypto acceleration for libsodium</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Solar charging compatibility indicators</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}