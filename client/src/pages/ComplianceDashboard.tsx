import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Shield, 
  AlertCircle, 
  FileText, 
  Lock,
  Calendar,
  Award,
  TrendingUp,
  Gavel,
  Users,
  Database
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ComplianceData {
  guidelines: {
    [key: string]: {
      status: 'compliant' | 'non-compliant' | 'pending';
      score: number;
      lastAssessment: string;
      requirements: string[];
    }
  };
  overallScore: number;
  nextAudit: string;
  certificationsHeld: string[];
}

export default function ComplianceDashboard() {
  const { t } = useTranslation();
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/metrics/compliance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setComplianceData(data);
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'non-compliant': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'non-compliant': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">RBI Compliance Dashboard</h1>
              <p className="text-sm opacity-90">Loading compliance status...</p>
            </div>
            <LanguageSelector />
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!complianceData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
          <LanguageSelector />
        </div>
        <div className="p-4">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Failed to load compliance data</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">RBI Compliance Dashboard</h1>
            <p className="text-sm opacity-90">Reserve Bank of India regulatory compliance status</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overall Compliance Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Overall Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="text-4xl font-bold text-green-600">
                  {complianceData.overallScore.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Excellent Compliance Status
                </div>
              </div>
              
              <Progress value={complianceData.overallScore} className="h-3" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Fully Compliant</div>
                  <div className="text-xs text-muted-foreground">All major guidelines met</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Next Audit</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(complianceData.nextAudit).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Trend</div>
                  <div className="text-xs text-muted-foreground">Improving +2.3%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RBI Guidelines Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-blue-600" />
              RBI Guidelines Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(complianceData.guidelines).map(([guideline, data]) => (
              <div key={guideline} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.status)}
                    <h4 className="font-medium">{guideline}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(data.status)}>
                      {data.status.toUpperCase()}
                    </Badge>
                    <span className="text-lg font-bold text-green-600">
                      {data.score.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <Progress value={data.score} className="h-2 mb-3" />
                
                <div className="text-sm text-muted-foreground mb-2">
                  Last Assessment: {new Date(data.lastAssessment).toLocaleDateString()}
                </div>
                
                <div className="space-y-1">
                  {data.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-600" />
              Security Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {complianceData.certificationsHeld.map((cert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Data Protection</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Encryption Coverage</span>
                    <span className="font-medium text-green-600">100%</span>
                  </div>
                  <Progress value={100} className="h-1" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Access Control</span>
                    <span className="font-medium text-green-600">96.2%</span>
                  </div>
                  <Progress value={96.2} className="h-1" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Audit Trail Coverage</span>
                    <span className="font-medium text-green-600">100%</span>
                  </div>
                  <Progress value={100} className="h-1" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Incident Response</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Response Time</span>
                    <span className="font-medium text-blue-600">4.2 min avg</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Detection Rate</span>
                    <span className="font-medium text-green-600">97.8%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>False Positives</span>
                    <span className="font-medium text-green-600">2.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rural Banking Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Rural Banking Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold">98.5%</div>
                <div className="text-xs text-muted-foreground">Financial Inclusion</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Lock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold">22</div>
                <div className="text-xs text-muted-foreground">Languages Supported</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Database className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold">99.97%</div>
                <div className="text-xs text-muted-foreground">Offline Capability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Compliance Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Quarterly Security Review</div>
                  <div className="text-xs text-muted-foreground">Due in 15 days</div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Annual Compliance Audit</div>
                  <div className="text-xs text-muted-foreground">Completed - Excellent rating</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Complete</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}