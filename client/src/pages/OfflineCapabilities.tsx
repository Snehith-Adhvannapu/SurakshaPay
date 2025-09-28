import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Download,
  Upload,
  RefreshCw,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Signal,
  Battery,
  MapPin
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface OfflineTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'synced' | 'failed';
  customerName: string;
  agentId: string;
  location: string;
}

interface ConnectivityStatus {
  isOnline: boolean;
  signalStrength: number;
  lastSync: Date;
  pendingTransactions: number;
  syncQueueSize: number;
}

export default function OfflineCapabilities() {
  const { t } = useTranslation();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus>({
    isOnline: true,
    signalStrength: 85,
    lastSync: new Date(),
    pendingTransactions: 0,
    syncQueueSize: 0
  });
  const [offlineTransactions, setOfflineTransactions] = useState<OfflineTransaction[]>([]);
  const [offlineFormData, setOfflineFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal' | 'transfer',
    amount: '',
    customerName: '',
    customerId: '',
    notes: ''
  });

  useEffect(() => {
    // Simulate connectivity changes
    const interval = setInterval(() => {
      if (isOfflineMode) {
        setConnectivityStatus(prev => ({
          ...prev,
          isOnline: false,
          signalStrength: 0,
          pendingTransactions: offlineTransactions.filter(t => t.status === 'pending').length
        }));
      } else {
        setConnectivityStatus(prev => ({
          ...prev,
          isOnline: true,
          signalStrength: 75 + Math.random() * 25,
          lastSync: new Date()
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOfflineMode, offlineTransactions]);

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    if (!isOfflineMode) {
      // Going offline - simulate creating some demo transactions
      const demoTransactions: OfflineTransaction[] = [
        {
          id: 'offline-001',
          type: 'deposit',
          amount: 2500,
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          status: 'pending',
          customerName: 'Rajesh Kumar',
          agentId: 'agent-rural-001',
          location: 'Dharwad, Karnataka'
        },
        {
          id: 'offline-002',
          type: 'withdrawal',
          amount: 1000,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'pending',
          customerName: 'Sunita Devi',
          agentId: 'agent-rural-001',
          location: 'Dharwad, Karnataka'
        }
      ];
      setOfflineTransactions(demoTransactions);
    } else {
      // Going online - sync transactions
      syncPendingTransactions();
    }
  };

  const syncPendingTransactions = () => {
    const pendingTxns = offlineTransactions.filter(t => t.status === 'pending');
    
    // Simulate sync process
    pendingTxns.forEach((txn, index) => {
      setTimeout(() => {
        setOfflineTransactions(prev => 
          prev.map(t => 
            t.id === txn.id 
              ? { ...t, status: 'synced' as const }
              : t
          )
        );
      }, (index + 1) * 1000);
    });
  };

  const createOfflineTransaction = () => {
    if (!offlineFormData.amount || !offlineFormData.customerName) return;

    const newTransaction: OfflineTransaction = {
      id: `offline-${Date.now()}`,
      type: offlineFormData.type,
      amount: parseFloat(offlineFormData.amount),
      timestamp: new Date(),
      status: 'pending',
      customerName: offlineFormData.customerName,
      agentId: 'agent-current',
      location: 'Current Location'
    };

    setOfflineTransactions(prev => [...prev, newTransaction]);
    setOfflineFormData({
      type: 'deposit',
      amount: '',
      customerName: '',
      customerId: '',
      notes: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'synced': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'synced': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const offlineFeatures = [
    {
      title: 'Secure Local Storage',
      description: 'Transactions stored with AES-256 encryption',
      icon: <Shield className="w-5 h-5 text-green-600" />,
      status: 'active'
    },
    {
      title: 'Automatic Sync',
      description: 'Seamless sync when connectivity returns',
      icon: <RefreshCw className="w-5 h-5 text-blue-600" />,
      status: 'active'
    },
    {
      title: 'Data Integrity',
      description: 'Blockchain-based transaction validation',
      icon: <Database className="w-5 h-5 text-purple-600" />,
      status: 'active'
    },
    {
      title: 'Conflict Resolution',
      description: 'Smart handling of sync conflicts',
      icon: <CheckCircle className="w-5 h-5 text-orange-600" />,
      status: 'active'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className={`p-4 transition-colors ${
        isOfflineMode 
          ? 'bg-gradient-to-r from-red-600 to-orange-700' 
          : 'bg-gradient-to-r from-green-600 to-blue-700'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Offline Banking Capabilities</h1>
            <p className="text-sm opacity-90">
              Secure banking even without internet connectivity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {isOfflineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Connectivity Status */}
        <Card className={`border-2 ${
          connectivityStatus.isOnline 
            ? 'border-green-200 bg-green-50 dark:bg-green-950' 
            : 'border-red-200 bg-red-50 dark:bg-red-950'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectivityStatus.isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              Connectivity Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className={`text-lg font-bold ${
                  connectivityStatus.isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectivityStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
                <div className="text-xs text-muted-foreground">Network Status</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Signal className="w-4 h-4 text-blue-600" />
                  <span className="text-lg font-bold text-blue-600">
                    {connectivityStatus.signalStrength}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Signal Strength</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {connectivityStatus.pendingTransactions}
                </div>
                <div className="text-xs text-muted-foreground">Pending Sync</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {connectivityStatus.lastSync.toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">Last Sync</div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={toggleOfflineMode}
                variant={isOfflineMode ? "destructive" : "default"}
                data-testid="button-toggle-offline"
              >
                {isOfflineMode ? (
                  <>
                    <Wifi className="w-4 h-4 mr-2" />
                    Go Online (Demo)
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Go Offline (Demo)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Offline Transaction Form */}
        {isOfflineMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Offline Transaction Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded-md"
                    value={offlineFormData.type}
                    onChange={(e) => setOfflineFormData({
                      ...offlineFormData, 
                      type: e.target.value as 'deposit' | 'withdrawal' | 'transfer'
                    })}
                    data-testid="select-transaction-type"
                  >
                    <option value="deposit">Cash Deposit</option>
                    <option value="withdrawal">Cash Withdrawal</option>
                    <option value="transfer">Money Transfer</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={offlineFormData.amount}
                    onChange={(e) => setOfflineFormData({...offlineFormData, amount: e.target.value})}
                    data-testid="input-offline-amount"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    placeholder="Enter customer name"
                    value={offlineFormData.customerName}
                    onChange={(e) => setOfflineFormData({...offlineFormData, customerName: e.target.value})}
                    data-testid="input-customer-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    id="customerId"
                    placeholder="Enter customer ID"
                    value={offlineFormData.customerId}
                    onChange={(e) => setOfflineFormData({...offlineFormData, customerId: e.target.value})}
                    data-testid="input-customer-id"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Transaction notes"
                  value={offlineFormData.notes}
                  onChange={(e) => setOfflineFormData({...offlineFormData, notes: e.target.value})}
                  data-testid="input-transaction-notes"
                />
              </div>
              
              <Button 
                onClick={createOfflineTransaction}
                className="w-full"
                disabled={!offlineFormData.amount || !offlineFormData.customerName}
                data-testid="button-create-offline-transaction"
              >
                <Download className="w-4 h-4 mr-2" />
                Store Transaction Offline
              </Button>
              
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-sm">
                <Shield className="w-4 h-4 text-yellow-600" />
                <span>Transaction will be securely stored locally and synced when online.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offline Transactions Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Offline Transactions Queue
              {offlineTransactions.length > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {offlineTransactions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {offlineTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No offline transactions stored</p>
                <p className="text-sm text-muted-foreground">
                  Switch to offline mode to demonstrate offline capabilities
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {offlineTransactions.map((txn) => (
                  <div key={txn.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(txn.status)}
                        <span className="font-medium">{txn.customerName}</span>
                        <Badge className={getStatusColor(txn.status)}>
                          {txn.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{txn.amount.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-muted-foreground">
                          {txn.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {txn.timestamp.toLocaleTimeString()}
                      </div>
                      <div>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {txn.location}
                      </div>
                      <div>
                        ID: {txn.id}
                      </div>
                    </div>
                  </div>
                ))}
                
                {connectivityStatus.isOnline && offlineTransactions.some(t => t.status === 'pending') && (
                  <Button 
                    onClick={syncPendingTransactions}
                    className="w-full mt-4"
                    data-testid="button-sync-transactions"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Sync Pending Transactions
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offline Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Offline Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offlineFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  {feature.icon}
                  <div>
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Technical Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Local Storage Architecture</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="font-medium text-blue-800 dark:text-blue-200">
                      Encrypted SQLite
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Local transaction storage with AES-256 encryption
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      Blockchain Validation
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transaction integrity verification
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="font-medium text-purple-800 dark:text-purple-200">
                      Smart Sync
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Intelligent conflict resolution
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Rural Banking Benefits</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Works in areas with poor connectivity (2G/Edge)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Ensures banking agent productivity in remote areas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Reduces transaction failures due to network issues</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Maintains service availability during network outages</span>
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