import BalanceCard from "@/components/BalanceCard";
import TransactionCard from "@/components/TransactionCard";
import FraudAlertCard from "@/components/FraudAlertCard";
import SecurityBadge from "@/components/SecurityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile', { headers });
      const profile = await profileResponse.json();
      setUserProfile(profile);

      // Fetch balance
      const balanceResponse = await fetch('/api/user/balance', { headers });
      const balanceData = await balanceResponse.json();
      setBalance(balanceData.balance);

      // Fetch recent transactions
      const transactionsResponse = await fetch('/api/user/transactions?limit=5', { headers });
      const transactionsData = await transactionsResponse.json();
      setRecentTransactions(transactionsData.transactions.map(tx => ({
        ...tx,
        securityStatus: tx.fraudScore > 70 ? 'warning' : 'verified'
      })));

      // Fetch fraud alerts
      const alertsResponse = await fetch('/api/user/fraud-alerts?active=true', { headers });
      const alertsData = await alertsResponse.json();
      setFraudAlerts(alertsData.alerts);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRefreshBalance = async () => {
    console.log('Refreshing balance...');
    await fetchUserData();
  };

  const handleViewTransactionDetails = (id: string) => {
    console.log('View transaction details:', id);
  };

  const handleDismissAlert = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/user/fraud-alerts/${id}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFraudAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleReportFalse = async (id: string) => {
    console.log('Reporting false alert:', id);
    await handleDismissAlert(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

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
          accountNumber={userProfile?.accountNumber || ""}
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

        {/* Fraud Alerts */}
        {fraudAlerts.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Security Alerts ({fraudAlerts.length})
            </h2>
            {fraudAlerts.slice(0, 2).map((alert) => (
              <FraudAlertCard
                key={alert.id}
                alert={{
                  id: alert.id,
                  type: alert.alertType,
                  title: alert.title,
                  description: alert.description,
                  severity: alert.severity,
                  timestamp: alert.timestamp,
                  actionRequired: alert.actionRequired
                }}
                onDismiss={handleDismissAlert}
                onReportFalse={handleReportFalse}
              />
            ))}
          </div>
        )}

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