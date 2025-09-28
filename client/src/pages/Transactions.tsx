import TransactionCard from "@/components/TransactionCard";
import SecurityBadge from "@/components/SecurityBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Download } from "lucide-react";
import { useState } from "react";

export default function Transactions() {
  //todo: remove mock functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions] = useState([
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
    },
    {
      id: "txn-003",
      type: "debit" as const,
      amount: 750,
      description: "Mobile Recharge",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      securityStatus: "verified" as const
    },
    {
      id: "txn-004",
      type: "debit" as const,
      amount: 15000,
      description: "Large withdrawal - ATM",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      securityStatus: "warning" as const,
      location: "City Branch ATM"
    }
  ]);

  const handleViewTransactionDetails = (id: string) => {
    console.log('View transaction details:', id);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.amount.toString().includes(searchQuery)
  );

  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-semibold">Transaction History</h1>
        <p className="text-sm opacity-90">Your secure transaction records</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-green-50 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Credit</div>
              <div className="text-lg font-semibold text-green-600">
                ₹{totalCredit.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Debit</div>
              <div className="text-lg font-semibold text-red-600">
                ₹{totalDebit.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by description or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-filter">
                <Filter className="w-3 h-3 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm" data-testid="button-download">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Transaction Security</p>
                <p className="text-xs text-muted-foreground">All transactions verified</p>
              </div>
              <SecurityBadge status="verified" label="All Secure" />
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Recent Transactions ({filteredTransactions.length})
            </h2>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onViewDetails={handleViewTransactionDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredTransactions.length > 0 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => console.log('Loading more transactions')}
              data-testid="button-load-more"
            >
              Load More Transactions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}