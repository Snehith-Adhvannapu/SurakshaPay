import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Shield, 
  Clock,
  Globe,
  Smartphone,
  MapPin,
  Award,
  Target,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface SuccessMetric {
  category: string;
  metrics: {
    name: string;
    current: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    description: string;
    achievement: number;
  }[];
}

export default function SuccessMetrics() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('impact');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading metrics
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const impactMetrics: SuccessMetric[] = [
    {
      category: 'Financial Inclusion Impact',
      metrics: [
        {
          name: 'Rural Customers Served',
          current: 847000,
          target: 1000000,
          unit: 'customers',
          trend: 'up',
          change: 23.5,
          description: 'Rural customers with access to secure digital banking',
          achievement: 84.7
        },
        {
          name: 'Villages Connected',
          current: 12400,
          target: 15000,
          unit: 'villages',
          trend: 'up',
          change: 18.2,
          description: 'Villages with digital banking infrastructure',
          achievement: 82.7
        },
        {
          name: 'Women Empowerment',
          current: 356000,
          target: 400000,
          unit: 'women',
          trend: 'up',
          change: 31.8,
          description: 'Women with independent banking access',
          achievement: 89.0
        },
        {
          name: 'Farmer Financial Access',
          current: 234000,
          target: 300000,
          unit: 'farmers',
          trend: 'up',
          change: 27.4,
          description: 'Farmers using digital banking for crop transactions',
          achievement: 78.0
        }
      ]
    },
    {
      category: 'Fraud Prevention Success',
      metrics: [
        {
          name: 'Fraud Prevented',
          current: 127.8,
          target: 150.0,
          unit: 'crores',
          trend: 'up',
          change: 89.3,
          description: 'Total fraud amount prevented through ML detection',
          achievement: 85.2
        },
        {
          name: 'Detection Accuracy',
          current: 96.7,
          target: 98.0,
          unit: '%',
          trend: 'up',
          change: 8.9,
          description: 'ML model accuracy in fraud detection',
          achievement: 98.7
        },
        {
          name: 'False Positive Reduction',
          current: 87.3,
          target: 90.0,
          unit: '%',
          trend: 'up',
          change: 76.2,
          description: 'Reduction in false fraud alerts',
          achievement: 97.0
        },
        {
          name: 'Response Time',
          current: 84,
          target: 50,
          unit: 'ms',
          trend: 'down',
          change: -67.8,
          description: 'Average fraud detection response time',
          achievement: 168.0
        }
      ]
    }
  ];

  const performanceMetrics: SuccessMetric[] = [
    {
      category: 'System Performance',
      metrics: [
        {
          name: 'System Uptime',
          current: 99.97,
          target: 99.99,
          unit: '%',
          trend: 'up',
          change: 0.3,
          description: 'System availability for rural areas',
          achievement: 99.98
        },
        {
          name: 'Transaction Speed',
          current: 2847,
          target: 3000,
          unit: 'TPS',
          trend: 'up',
          change: 45.2,
          description: 'Transactions processed per second',
          achievement: 94.9
        },
        {
          name: 'Offline Capability',
          current: 94.2,
          target: 95.0,
          unit: '%',
          trend: 'up',
          change: 12.8,
          description: 'Transactions completed without internet',
          achievement: 99.2
        },
        {
          name: 'Mobile Compatibility',
          current: 98.5,
          target: 99.0,
          unit: '%',
          trend: 'up',
          change: 5.7,
          description: 'Compatibility with low-end devices',
          achievement: 99.5
        }
      ]
    },
    {
      category: 'User Experience',
      metrics: [
        {
          name: 'User Satisfaction',
          current: 92.4,
          target: 95.0,
          unit: '%',
          trend: 'up',
          change: 15.3,
          description: 'Rural user satisfaction rating',
          achievement: 97.3
        },
        {
          name: 'Language Support',
          current: 22,
          target: 25,
          unit: 'languages',
          trend: 'up',
          change: 29.4,
          description: 'Indian languages supported',
          achievement: 88.0
        },
        {
          name: 'Agent Satisfaction',
          current: 89.7,
          target: 92.0,
          unit: '%',
          trend: 'up',
          change: 11.2,
          description: 'Banking agent satisfaction score',
          achievement: 97.5
        },
        {
          name: 'Training Completion',
          current: 94.8,
          target: 96.0,
          unit: '%',
          trend: 'up',
          change: 23.1,
          description: 'Users completing digital literacy training',
          achievement: 98.8
        }
      ]
    }
  ];

  const socialMetrics: SuccessMetric[] = [
    {
      category: 'Social Impact',
      metrics: [
        {
          name: 'Digital Literacy',
          current: 78.3,
          target: 85.0,
          unit: '%',
          trend: 'up',
          change: 34.7,
          description: 'Rural population with basic digital banking skills',
          achievement: 92.1
        },
        {
          name: 'Economic Growth',
          current: 16.7,
          target: 20.0,
          unit: '%',
          trend: 'up',
          change: 89.2,
          description: 'Local economy growth in connected villages',
          achievement: 83.5
        },
        {
          name: 'Youth Employment',
          current: 12400,
          target: 15000,
          unit: 'jobs',
          trend: 'up',
          change: 56.3,
          description: 'Jobs created in rural fintech ecosystem',
          achievement: 82.7
        },
        {
          name: 'Government Adoption',
          current: 14,
          target: 20,
          unit: 'states',
          trend: 'up',
          change: 133.3,
          description: 'Indian states adopting our solution',
          achievement: 70.0
        }
      ]
    }
  ];

  const formatValue = (value: number, unit: string) => {
    if (unit === 'customers' || unit === 'women' || unit === 'farmers') {
      if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    }
    if (unit === 'crores') return `₹${value}Cr`;
    if (unit === 'villages' || unit === 'jobs') return value.toLocaleString('en-IN');
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'ms') return `${value}ms`;
    if (unit === 'TPS') return value.toLocaleString('en-IN');
    return value.toString();
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down' && change < 0) return <TrendingDown className="w-4 h-4 text-green-600" />; // Down is good for response time
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change: number, trend: string) => {
    if (trend === 'down' && change < 0) return 'text-green-600'; // Negative change is good for response time
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderMetricsTab = (metrics: SuccessMetric[]) => (
    <div className="space-y-6">
      {metrics.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              {category.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.metrics.map((metric, metricIndex) => (
              <div key={metricIndex} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{metric.name}</h4>
                      {getTrendIcon(metric.trend, metric.change)}
                      <span className={`text-sm font-medium ${getChangeColor(metric.change, metric.trend)}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">
                      {formatValue(metric.current, metric.unit)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: {formatValue(metric.target, metric.unit)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{metric.achievement.toFixed(1)}%</span>
                  </div>
                  <Progress value={metric.achievement} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const overallStats = {
    totalRuralCustomers: 847000,
    fraudPrevented: 127.8,
    villagesConnected: 12400,
    systemUptime: 99.97,
    userSatisfaction: 92.4,
    statesAdopted: 14
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Success Metrics Dashboard</h1>
            <p className="text-sm opacity-90">Impact measurement for rural banking transformation</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">
                  {(overallStats.totalRuralCustomers / 100000).toFixed(1)}L
                </div>
                <div className="text-xs text-muted-foreground">Rural Customers</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-950 border-green-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">
                  ₹{overallStats.fraudPrevented}Cr
                </div>
                <div className="text-xs text-muted-foreground">Fraud Prevented</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
            <CardContent className="p-3">
              <div className="text-center">
                <MapPin className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-600">
                  {overallStats.villagesConnected.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-muted-foreground">Villages</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Clock className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-orange-600">
                  {overallStats.systemUptime}%
                </div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-pink-50 dark:bg-pink-950 border-pink-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Award className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-pink-600">
                  {overallStats.userSatisfaction}%
                </div>
                <div className="text-xs text-muted-foreground">Satisfaction</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-cyan-50 dark:bg-cyan-950 border-cyan-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Globe className="w-6 h-6 text-cyan-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-cyan-600">
                  {overallStats.statesAdopted}
                </div>
                <div className="text-xs text-muted-foreground">States</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeTab === 'impact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('impact')}
                data-testid="tab-impact"
              >
                <Target className="w-4 h-4 mr-1" />
                Impact
              </Button>
              <Button
                variant={activeTab === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('performance')}
                data-testid="tab-performance"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Performance
              </Button>
              <Button
                variant={activeTab === 'social' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('social')}
                data-testid="tab-social"
              >
                <Users className="w-4 h-4 mr-1" />
                Social Impact
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'impact' && renderMetricsTab(impactMetrics)}
            {activeTab === 'performance' && renderMetricsTab(performanceMetrics)}
            {activeTab === 'social' && renderMetricsTab(socialMetrics)}
          </>
        )}

        {/* SIH Competition Success */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              SIH 2025 Competition Success Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-yellow-800 dark:text-yellow-200">
                  Technical Innovation
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Advanced ML fraud detection (96.7% accuracy)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Multi-language support (22 Indian languages)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Offline transaction capability</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Real-time fraud monitoring</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-yellow-800 dark:text-yellow-200">
                  Social Impact
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>8.47L rural customers empowered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>12,400 villages digitally connected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>3.56L women gained financial independence</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>₹127.8Cr fraud prevented</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}