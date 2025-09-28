import BalanceCard from "@/components/BalanceCard";
import TransactionCard from "@/components/TransactionCard";
import FraudAlertCard from "@/components/FraudAlertCard";
import SecurityBadge from "@/components/SecurityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

export default function Home() {
  //todo: remove mock functionality
  const [balance] = useState(45720.50);
  const [recentTransactions] = useState([
    {
      id: "txn-001",
      type: "debit" as const,
      amount: 2500,
      description: "Payment to Local Grocery Store",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      securityStatus: "verified" as const,
      location: "Village Market, Rajasthan"
    },
    {
      id: "txn-002", 
      type: "credit" as const,
      amount: 5000,
      description: "Government Benefit Transfer",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      securityStatus: "verified" as const
    }
  ]);

  const [fraudAlert] = useState({
    id: "alert-001",
    type: "sim_swap" as const,
    title: "SIM Card Change Detected",
    description: "We detected your SIM card was changed or replaced. If this was not done by you, please secure your account immediately.",
    severity: "danger" as const,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    actionRequired: true
  });

  const handleRefreshBalance = () => {
    console.log('Balance refreshed from home page');
  };

  const handleViewTransactionDetails = (id: string) => {
    console.log('View transaction details:', id);
  };

  const handleDismissAlert = (id: string) => {
    console.log('Alert dismissed:', id);
  };

  const handleReportFalse = (id: string) => {
    console.log('Reporting unauthorized activity:', id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">RuralBank Security</h1>
            <p className="text-sm opacity-90">Secure Banking for Rural India</p>
          </div>
          <SecurityBadge status="verified" label="System Secure" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Section */}
        <BalanceCard
          balance={balance}
          accountNumber="1234567890"
          lastUpdated={new Date().toISOString()}
          securityStatus="verified"
          onRefresh={handleRefreshBalance}
        />

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-green-600" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-xs text-muted-foreground">Protection Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-xs text-muted-foreground">Monitoring</div>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Alert */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Security Alerts
          </h2>
          <FraudAlertCard
            alert={fraudAlert}
            onDismiss={handleDismissAlert}
            onReportFalse={handleReportFalse}
          />
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h2>
            <Button variant="outline" size="sm" data-testid="button-view-all">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onViewDetails={handleViewTransactionDetails}
              />
            ))}
          </div>
        </div>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-blue-600" />
              Rural Banking Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">SIM swap detection active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Phishing protection enabled</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Low-bandwidth optimization</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}