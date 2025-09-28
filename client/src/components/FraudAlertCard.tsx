import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SecurityBadge from "./SecurityBadge";
import { AlertTriangle, X, CheckCircle, MessageSquare } from "lucide-react";

interface FraudAlert {
  id: string;
  type: "sim_swap" | "fake_app" | "phishing" | "unauthorized";
  title: string;
  description: string;
  severity: "warning" | "danger";
  timestamp: string;
  actionRequired: boolean;
}

interface FraudAlertCardProps {
  alert: FraudAlert;
  onDismiss: (id: string) => void;
  onReportFalse: (id: string) => void;
}

const alertTypeConfig = {
  sim_swap: {
    icon: MessageSquare,
    title: "SIM Card Activity",
    color: "text-red-600"
  },
  fake_app: {
    icon: AlertTriangle,
    title: "App Security",
    color: "text-amber-600"
  },
  phishing: {
    icon: MessageSquare,
    title: "Suspicious Message",
    color: "text-red-600"
  },
  unauthorized: {
    icon: AlertTriangle,
    title: "Account Activity",
    color: "text-red-600"
  }
};

export default function FraudAlertCard({ alert, onDismiss, onReportFalse }: FraudAlertCardProps) {
  const config = alertTypeConfig[alert.type];
  const Icon = config.icon;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-l-4 border-l-red-500" data-testid={`card-fraud-alert-${alert.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <div>
              <CardTitle className="text-base font-medium">{alert.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{formatTime(alert.timestamp)}</p>
            </div>
          </div>
          <SecurityBadge 
            status={alert.severity} 
            label={alert.severity === 'danger' ? 'High Risk' : 'Medium Risk'} 
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {alert.description}
        </p>
        
        {alert.actionRequired && (
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-1">Action Required:</p>
            <p className="text-xs text-red-700">
              Please review this activity immediately and confirm if this was authorized by you.
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={() => {
              console.log(`Dismissing alert ${alert.id}`);
              onDismiss(alert.id);
            }}
            data-testid="button-dismiss-alert"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            I Authorized This
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              console.log(`Reporting false alert ${alert.id}`);
              onReportFalse(alert.id);
            }}
            data-testid="button-report-false"
          >
            <X className="w-3 h-3 mr-1" />
            Not Me - Secure My Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}