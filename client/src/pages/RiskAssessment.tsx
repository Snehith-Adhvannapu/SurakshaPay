import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Smartphone,
  Clock,
  Users,
  Calculator,
  Brain,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface RiskFactor {
  category: string;
  factors: {
    name: string;
    value: number;
    weight: number;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

interface RiskAssessmentResult {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  criticalFactors: string[];
  mitigationStrategies: string[];
}

export default function RiskAssessment() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    transactionAmount: '',
    location: '',
    timeOfDay: '',
    deviceType: '',
    userAge: '',
    accountAge: '',
    transactionFrequency: '',
    agentInvolved: 'no'
  });
  const [assessment, setAssessment] = useState<RiskAssessmentResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  const riskFactors: RiskFactor[] = [
    {
      category: 'Transaction Characteristics',
      factors: [
        {
          name: 'Amount Risk',
          value: 25,
          weight: 0.3,
          description: 'Risk based on transaction amount vs user history',
          riskLevel: 'medium'
        },
        {
          name: 'Time Pattern',
          value: 15,
          weight: 0.2,
          description: 'Risk based on unusual timing patterns',
          riskLevel: 'low'
        },
        {
          name: 'Frequency Risk',
          value: 35,
          weight: 0.25,
          description: 'Risk based on transaction velocity',
          riskLevel: 'medium'
        }
      ]
    },
    {
      category: 'User Behavior',
      factors: [
        {
          name: 'Account Maturity',
          value: 10,
          weight: 0.15,
          description: 'Risk based on account age and history',
          riskLevel: 'low'
        },
        {
          name: 'Behavioral Consistency',
          value: 20,
          weight: 0.2,
          description: 'Consistency with past behavior patterns',
          riskLevel: 'low'
        },
        {
          name: 'Digital Literacy',
          value: 30,
          weight: 0.15,
          description: 'User familiarity with digital banking',
          riskLevel: 'medium'
        }
      ]
    },
    {
      category: 'Environmental Factors',
      factors: [
        {
          name: 'Location Risk',
          value: 45,
          weight: 0.25,
          description: 'Risk associated with transaction location',
          riskLevel: 'medium'
        },
        {
          name: 'Device Trust',
          value: 20,
          weight: 0.2,
          description: 'Trust level of the device used',
          riskLevel: 'low'
        },
        {
          name: 'Network Security',
          value: 15,
          weight: 0.15,
          description: 'Security of network connection',
          riskLevel: 'low'
        }
      ]
    }
  ];

  const performRiskAssessment = () => {
    setIsAssessing(true);
    
    // Simulate ML-based risk assessment
    setTimeout(() => {
      const amount = parseFloat(formData.transactionAmount) || 0;
      const hour = parseInt(formData.timeOfDay) || 12;
      
      // Calculate risk score based on various factors
      let riskScore = 0;
      
      // Amount-based risk
      if (amount > 50000) riskScore += 30;
      else if (amount > 20000) riskScore += 15;
      else if (amount > 10000) riskScore += 8;
      else riskScore += 2;
      
      // Time-based risk
      if (hour < 6 || hour > 22) riskScore += 20;
      else if (hour < 9 || hour > 18) riskScore += 8;
      else riskScore += 2;
      
      // Location-based risk
      if (formData.location.toLowerCase().includes('metro') || formData.location.toLowerCase().includes('city')) {
        riskScore += 5;
      } else {
        riskScore += 15; // Rural areas have higher fraud risk
      }
      
      // Agent involvement
      if (formData.agentInvolved === 'yes') {
        riskScore += 10;
      }
      
      // Device type risk
      if (formData.deviceType === 'new') riskScore += 25;
      else if (formData.deviceType === 'shared') riskScore += 15;
      else riskScore += 5;
      
      // Account age risk
      const accountAge = parseInt(formData.accountAge) || 365;
      if (accountAge < 30) riskScore += 20;
      else if (accountAge < 90) riskScore += 10;
      else riskScore += 2;
      
      // Cap at 100
      riskScore = Math.min(riskScore, 100);
      
      const riskLevel: 'low' | 'medium' | 'high' = 
        riskScore >= 70 ? 'high' : 
        riskScore >= 40 ? 'medium' : 'low';
      
      const recommendations: string[] = [];
      const criticalFactors: string[] = [];
      const mitigationStrategies: string[] = [];
      
      if (amount > 20000) {
        criticalFactors.push('High transaction amount');
        recommendations.push('Implement additional verification for large amounts');
        mitigationStrategies.push('Require OTP + biometric verification for amounts > ₹20,000');
      }
      
      if (hour < 6 || hour > 22) {
        criticalFactors.push('Unusual transaction time');
        recommendations.push('Flag transactions outside business hours');
        mitigationStrategies.push('Implement time-based transaction limits');
      }
      
      if (formData.deviceType === 'new') {
        criticalFactors.push('New device detected');
        recommendations.push('Require device registration and verification');
        mitigationStrategies.push('Multi-factor authentication for new devices');
      }
      
      if (formData.agentInvolved === 'yes') {
        criticalFactors.push('Agent-assisted transaction');
        recommendations.push('Monitor agent behavior patterns');
        mitigationStrategies.push('Implement agent accountability measures');
      }
      
      // Add general recommendations based on risk level
      if (riskLevel === 'high') {
        recommendations.push('Manual review required');
        recommendations.push('Contact customer for verification');
        mitigationStrategies.push('Implement cooling-off period');
        mitigationStrategies.push('Require branch verification');
      } else if (riskLevel === 'medium') {
        recommendations.push('Enhanced monitoring');
        recommendations.push('Automated verification checks');
        mitigationStrategies.push('Real-time fraud scoring');
      } else {
        recommendations.push('Standard processing');
        recommendations.push('Routine monitoring');
        mitigationStrategies.push('Continuous behavior analysis');
      }
      
      setAssessment({
        overallScore: riskScore,
        riskLevel,
        recommendations,
        criticalFactors,
        mitigationStrategies
      });
      
      setIsAssessing(false);
    }, 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-50 dark:bg-red-950 border-red-200';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200';
      case 'low': return 'bg-green-50 dark:bg-green-950 border-green-200';
      default: return 'bg-gray-50 dark:bg-gray-950 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Risk Assessment Engine</h1>
            <p className="text-sm opacity-90">AI-powered transaction risk analysis for rural banking</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Risk Assessment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              Transaction Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Transaction Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.transactionAmount}
                  onChange={(e) => setFormData({...formData, transactionAmount: e.target.value})}
                  data-testid="input-transaction-amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select onValueChange={(value) => setFormData({...formData, location: value})}>
                  <SelectTrigger data-testid="select-location">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rural_village">Rural Village</SelectItem>
                    <SelectItem value="rural_town">Rural Town</SelectItem>
                    <SelectItem value="tier2_city">Tier 2 City</SelectItem>
                    <SelectItem value="metro_city">Metro City</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time of Day (Hour)</Label>
                <Input
                  id="time"
                  type="number"
                  min="0"
                  max="23"
                  placeholder="24-hour format (0-23)"
                  value={formData.timeOfDay}
                  onChange={(e) => setFormData({...formData, timeOfDay: e.target.value})}
                  data-testid="input-time-of-day"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device">Device Type</Label>
                <Select onValueChange={(value) => setFormData({...formData, deviceType: value})}>
                  <SelectTrigger data-testid="select-device-type">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trusted">Trusted Device</SelectItem>
                    <SelectItem value="new">New Device</SelectItem>
                    <SelectItem value="shared">Shared Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userAge">User Age</Label>
                <Input
                  id="userAge"
                  type="number"
                  placeholder="Age in years"
                  value={formData.userAge}
                  onChange={(e) => setFormData({...formData, userAge: e.target.value})}
                  data-testid="input-user-age"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountAge">Account Age (Days)</Label>
                <Input
                  id="accountAge"
                  type="number"
                  placeholder="Days since account creation"
                  value={formData.accountAge}
                  onChange={(e) => setFormData({...formData, accountAge: e.target.value})}
                  data-testid="input-account-age"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Transaction Frequency</Label>
                <Select onValueChange={(value) => setFormData({...formData, transactionFrequency: value})}>
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_time">First Time</SelectItem>
                    <SelectItem value="occasional">Occasional (Weekly)</SelectItem>
                    <SelectItem value="regular">Regular (Daily)</SelectItem>
                    <SelectItem value="frequent">Very Frequent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent">Agent Involved?</Label>
                <Select onValueChange={(value) => setFormData({...formData, agentInvolved: value})}>
                  <SelectTrigger data-testid="select-agent-involved">
                    <SelectValue placeholder="Agent assistance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No Agent</SelectItem>
                    <SelectItem value="yes">Agent Assisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={performRiskAssessment} 
              disabled={isAssessing}
              className="w-full"
              data-testid="button-assess-risk"
            >
              {isAssessing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Risk...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Perform Risk Assessment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Risk Assessment Result */}
        {assessment && (
          <Card className={`border-2 ${getRiskBgColor(assessment.riskLevel)}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${getRiskColor(assessment.riskLevel)}`} />
                Risk Assessment Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center space-y-4">
                <div>
                  <div className={`text-4xl font-bold ${getRiskColor(assessment.riskLevel)}`}>
                    {assessment.overallScore}%
                  </div>
                  <div className={`text-lg font-medium ${getRiskColor(assessment.riskLevel)}`}>
                    {assessment.riskLevel.toUpperCase()} RISK
                  </div>
                </div>
                
                <Progress 
                  value={assessment.overallScore} 
                  className="h-3"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Risk (0-39%)</span>
                  <span>Medium Risk (40-69%)</span>
                  <span>High Risk (70-100%)</span>
                </div>
              </div>

              {/* Critical Factors */}
              {assessment.criticalFactors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Critical Risk Factors
                  </h4>
                  <div className="space-y-2">
                    {assessment.criticalFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-3 h-3 text-orange-600 flex-shrink-0" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {assessment.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation Strategies */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  Mitigation Strategies
                </h4>
                <div className="space-y-2">
                  {assessment.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Zap className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span>{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Factor Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Risk Factor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {riskFactors.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h4 className="font-medium mb-3">{category.category}</h4>
                <div className="space-y-3">
                  {category.factors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            factor.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                            factor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {factor.riskLevel}
                          </Badge>
                          <span className="text-sm font-medium">{factor.value}%</span>
                        </div>
                      </div>
                      
                      <Progress value={factor.value} className="h-2" />
                      
                      <p className="text-xs text-muted-foreground">
                        {factor.description} (Weight: {(factor.weight * 100).toFixed(0)}%)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}