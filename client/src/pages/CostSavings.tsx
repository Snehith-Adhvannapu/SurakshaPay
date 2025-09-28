import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  Banknote,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CostSavingsCalculation {
  fraudLossReduction: number;
  operationalSavings: number;
  complianceSavings: number;
  efficiencySavings: number;
  totalSavings: number;
  roi: number;
  paybackPeriod: number;
}

interface BankProfile {
  customerBase: number;
  monthlyTransactions: number;
  averageTransactionValue: number;
  currentFraudRate: number;
  implementationCost: number;
  operationalCost: number;
}

export default function CostSavings() {
  const { t } = useTranslation();
  const [bankProfile, setBankProfile] = useState<BankProfile>({
    customerBase: 100000,
    monthlyTransactions: 500000,
    averageTransactionValue: 2500,
    currentFraudRate: 0.5, // 0.5%
    implementationCost: 5000000, // ₹50 lakhs
    operationalCost: 200000 // ₹2 lakhs per month
  });
  const [calculations, setCalculations] = useState<CostSavingsCalculation | null>(null);
  const [bankSize, setBankSize] = useState<string>('medium');

  const calculateSavings = () => {
    const monthlyTransactionVolume = bankProfile.monthlyTransactions * bankProfile.averageTransactionValue;
    const annualTransactionVolume = monthlyTransactionVolume * 12;
    
    // Current fraud losses
    const currentFraudLoss = annualTransactionVolume * (bankProfile.currentFraudRate / 100);
    
    // Fraud reduction with our system (85% reduction)
    const fraudReductionRate = 0.85;
    const fraudLossReduction = currentFraudLoss * fraudReductionRate;
    
    // Operational savings
    // Reduced manual review costs (₹500 per manual review, 80% reduction)
    const manualReviews = bankProfile.monthlyTransactions * 0.1 * 12; // 10% need manual review
    const manualReviewCost = manualReviews * 500;
    const operationalSavings = manualReviewCost * 0.8; // 80% reduction
    
    // Compliance savings
    // Reduced regulatory fines and audit costs
    const complianceSavings = 2000000; // ₹20 lakhs annual savings
    
    // Efficiency savings
    // Faster transaction processing, reduced customer service costs
    const efficiencySavings = bankProfile.customerBase * 50; // ₹50 per customer annually
    
    const totalSavings = fraudLossReduction + operationalSavings + complianceSavings + efficiencySavings;
    const totalCost = bankProfile.implementationCost + (bankProfile.operationalCost * 12);
    
    const roi = ((totalSavings - totalCost) / totalCost) * 100;
    const paybackPeriod = bankProfile.implementationCost / (totalSavings / 12);
    
    setCalculations({
      fraudLossReduction,
      operationalSavings,
      complianceSavings,
      efficiencySavings,
      totalSavings,
      roi,
      paybackPeriod
    });
  };

  const updateBankSize = (size: string) => {
    setBankSize(size);
    
    const profiles = {
      small: {
        customerBase: 25000,
        monthlyTransactions: 100000,
        averageTransactionValue: 1500,
        currentFraudRate: 0.8,
        implementationCost: 2000000,
        operationalCost: 100000
      },
      medium: {
        customerBase: 100000,
        monthlyTransactions: 500000,
        averageTransactionValue: 2500,
        currentFraudRate: 0.5,
        implementationCost: 5000000,
        operationalCost: 200000
      },
      large: {
        customerBase: 500000,
        monthlyTransactions: 2500000,
        averageTransactionValue: 3500,
        currentFraudRate: 0.3,
        implementationCost: 15000000,
        operationalCost: 500000
      }
    };
    
    setBankProfile(profiles[size as keyof typeof profiles]);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const industryBenchmarks = {
    traditionalFraudDetection: {
      accuracy: 76.5,
      falsePositiveRate: 15.3,
      processingTime: 890,
      annualCost: 8000000
    },
    ourSystem: {
      accuracy: 96.7,
      falsePositiveRate: 2.3,
      processingTime: 84,
      annualCost: bankProfile.operationalCost * 12
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Cost Savings Calculator</h1>
            <p className="text-sm opacity-90">ROI analysis for rural banking fraud detection system</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Bank Profile Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Bank Profile Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankSize">Bank Size</Label>
              <Select value={bankSize} onValueChange={updateBankSize}>
                <SelectTrigger data-testid="select-bank-size">
                  <SelectValue placeholder="Select bank size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small Bank (25K customers)</SelectItem>
                  <SelectItem value="medium">Medium Bank (100K customers)</SelectItem>
                  <SelectItem value="large">Large Bank (500K customers)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customers">Customer Base</Label>
                <Input
                  id="customers"
                  type="number"
                  value={bankProfile.customerBase}
                  onChange={(e) => setBankProfile({...bankProfile, customerBase: parseInt(e.target.value) || 0})}
                  data-testid="input-customer-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transactions">Monthly Transactions</Label>
                <Input
                  id="transactions"
                  type="number"
                  value={bankProfile.monthlyTransactions}
                  onChange={(e) => setBankProfile({...bankProfile, monthlyTransactions: parseInt(e.target.value) || 0})}
                  data-testid="input-monthly-transactions"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avgValue">Average Transaction Value (₹)</Label>
                <Input
                  id="avgValue"
                  type="number"
                  value={bankProfile.averageTransactionValue}
                  onChange={(e) => setBankProfile({...bankProfile, averageTransactionValue: parseInt(e.target.value) || 0})}
                  data-testid="input-avg-transaction-value"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fraudRate">Current Fraud Rate (%)</Label>
                <Input
                  id="fraudRate"
                  type="number"
                  step="0.1"
                  value={bankProfile.currentFraudRate}
                  onChange={(e) => setBankProfile({...bankProfile, currentFraudRate: parseFloat(e.target.value) || 0})}
                  data-testid="input-fraud-rate"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="implCost">Implementation Cost (₹)</Label>
                <Input
                  id="implCost"
                  type="number"
                  value={bankProfile.implementationCost}
                  onChange={(e) => setBankProfile({...bankProfile, implementationCost: parseInt(e.target.value) || 0})}
                  data-testid="input-implementation-cost"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="opCost">Monthly Operational Cost (₹)</Label>
                <Input
                  id="opCost"
                  type="number"
                  value={bankProfile.operationalCost}
                  onChange={(e) => setBankProfile({...bankProfile, operationalCost: parseInt(e.target.value) || 0})}
                  data-testid="input-operational-cost"
                />
              </div>
            </div>
            
            <Button onClick={calculateSavings} className="w-full" data-testid="button-calculate-savings">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Cost Savings & ROI
            </Button>
          </CardContent>
        </Card>

        {/* Cost Savings Results */}
        {calculations && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Annual Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(calculations.totalSavings)}
                      </p>
                    </div>
                    <Banknote className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {calculations.roi.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Payback Period</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {calculations.paybackPeriod.toFixed(1)} months
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Fraud Loss Reduction</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(calculations.fraudLossReduction)}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  Savings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div>
                        <div className="font-medium">Fraud Loss Reduction</div>
                        <div className="text-sm text-muted-foreground">85% reduction in fraud losses</div>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(calculations.fraudLossReduction)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div>
                        <div className="font-medium">Operational Savings</div>
                        <div className="text-sm text-muted-foreground">Reduced manual reviews & processing</div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculations.operationalSavings)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div>
                        <div className="font-medium">Compliance Savings</div>
                        <div className="text-sm text-muted-foreground">Reduced fines & audit costs</div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(calculations.complianceSavings)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div>
                        <div className="font-medium">Efficiency Savings</div>
                        <div className="text-sm text-muted-foreground">Faster processing & customer service</div>
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        {formatCurrency(calculations.efficiencySavings)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Key Benefits</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>85% reduction in fraud losses</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>90% faster transaction processing</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>80% reduction in manual reviews</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>75% fewer false positives</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>100% RBI compliance coverage</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>24/7 automated monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Industry Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Traditional Fraud Detection</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Accuracy</span>
                        <span className="font-medium text-red-600">{industryBenchmarks.traditionalFraudDetection.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">False Positive Rate</span>
                        <span className="font-medium text-red-600">{industryBenchmarks.traditionalFraudDetection.falsePositiveRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Processing Time</span>
                        <span className="font-medium text-red-600">{industryBenchmarks.traditionalFraudDetection.processingTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Cost</span>
                        <span className="font-medium text-red-600">{formatCurrency(industryBenchmarks.traditionalFraudDetection.annualCost)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Our AI-Powered System</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Accuracy</span>
                        <span className="font-medium text-green-600">{industryBenchmarks.ourSystem.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">False Positive Rate</span>
                        <span className="font-medium text-green-600">{industryBenchmarks.ourSystem.falsePositiveRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Processing Time</span>
                        <span className="font-medium text-green-600">{industryBenchmarks.ourSystem.processingTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Cost</span>
                        <span className="font-medium text-green-600">{formatCurrency(industryBenchmarks.ourSystem.annualCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
                    Performance Improvements
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">+26%</div>
                      <div className="text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">-85%</div>
                      <div className="text-muted-foreground">False Positives</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">-91%</div>
                      <div className="text-muted-foreground">Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">-70%</div>
                      <div className="text-muted-foreground">Annual Cost</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Business Case Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Business Case Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">High ROI</div>
                <div className="text-sm text-muted-foreground">
                  {calculations ? `${calculations.roi.toFixed(0)}%` : '200%+'} annual return on investment
                </div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">Quick Payback</div>
                <div className="text-sm text-muted-foreground">
                  {calculations ? `${calculations.paybackPeriod.toFixed(0)}` : '6'} months payback period
                </div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">Risk Reduction</div>
                <div className="text-sm text-muted-foreground">
                  85% reduction in fraud losses
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}