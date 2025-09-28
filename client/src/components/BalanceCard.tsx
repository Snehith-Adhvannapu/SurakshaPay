import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SecurityBadge from "./SecurityBadge";
import { Eye, EyeOff, RefreshCw, Wallet } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  balance: number;
  accountNumber: string;
  lastUpdated: string;
  securityStatus: "verified" | "pending" | "warning";
  onRefresh: () => void;
}

export default function BalanceCard({ 
  balance, 
  accountNumber, 
  lastUpdated, 
  securityStatus,
  onRefresh 
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2 
    }).format(amount);
  };

  const formatAccountNumber = (account: string) => {
    return `****${account.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('Refreshing balance...');
    setTimeout(() => {
      setIsRefreshing(false);
      onRefresh();
    }, 1500);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900" data-testid="card-balance">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Account Balance
        </CardTitle>
        <SecurityBadge 
          status={securityStatus} 
          label={securityStatus === 'verified' ? 'Secure' : securityStatus === 'pending' ? 'Syncing' : 'Check Required'} 
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {showBalance ? formatBalance(balance) : '****'}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setShowBalance(!showBalance)}
                data-testid="button-toggle-balance"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              A/c: {formatAccountNumber(accountNumber)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Last updated: {formatTime(lastUpdated)}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}