import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SecurityBadge from "./SecurityBadge";
import { ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
  timestamp: string;
  securityStatus: "verified" | "pending" | "warning" | "danger";
  location?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onViewDetails: (id: string) => void;
}

export default function TransactionCard({ transaction, onViewDetails }: TransactionCardProps) {
  const [showAmount, setShowAmount] = useState(true);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover-elevate" data-testid={`card-transaction-${transaction.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ArrowUpDown className={`w-4 h-4 ${transaction.type === 'credit' ? 'text-green-600 rotate-180' : 'text-red-600'}`} />
            <span className="text-sm text-muted-foreground">{formatTime(transaction.timestamp)}</span>
          </div>
          <SecurityBadge 
            status={transaction.securityStatus} 
            label={transaction.securityStatus === 'verified' ? 'Safe' : transaction.securityStatus === 'pending' ? 'Checking' : 'Alert'} 
          />
        </div>
        
        <div className="space-y-2">
          <p className="font-medium text-sm leading-relaxed">{transaction.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {showAmount ? formatAmount(transaction.amount) : '****'}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setShowAmount(!showAmount)}
                data-testid="button-toggle-amount"
              >
                {showAmount ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                console.log(`Viewing details for transaction ${transaction.id}`);
                onViewDetails(transaction.id);
              }}
              data-testid="button-view-details"
            >
              Details
            </Button>
          </div>
          
          {transaction.location && (
            <p className="text-xs text-muted-foreground">Location: {transaction.location}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}