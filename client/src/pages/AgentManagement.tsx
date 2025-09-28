import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  MapPin,
  Phone,
  Clock,
  Shield,
  Activity,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Agent {
  id: string;
  name: string;
  phone: string;
  location: string;
  region: string;
  trustScore: number;
  transactionsToday: number;
  totalTransactions: number;
  suspiciousActivities: number;
  lastSeen: string;
  status: 'active' | 'inactive' | 'suspended';
  performanceScore: number;
  joinDate: string;
  specialization: string[];
}

export default function AgentManagement() {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading agent data
    setTimeout(() => {
      setAgents([
        {
          id: 'agent-001',
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          location: 'Dharwad, Karnataka',
          region: 'North Karnataka',
          trustScore: 95,
          transactionsToday: 47,
          totalTransactions: 2840,
          suspiciousActivities: 0,
          lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          status: 'active',
          performanceScore: 92,
          joinDate: '2023-01-15',
          specialization: ['Rural Banking', 'Crop Loans', 'SHG Management']
        },
        {
          id: 'agent-002',
          name: 'Priya Sharma',
          phone: '+91 98123 45678',
          location: 'Hubli, Karnataka',
          region: 'North Karnataka',
          trustScore: 88,
          transactionsToday: 32,
          totalTransactions: 1950,
          suspiciousActivities: 1,
          lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          status: 'active',
          performanceScore: 87,
          joinDate: '2023-03-22',
          specialization: ['Digital Payments', 'KYC Verification']
        },
        {
          id: 'agent-003',
          name: 'Amit Patel',
          phone: '+91 97654 32109',
          location: 'Vadodara, Gujarat',
          region: 'Central Gujarat',
          trustScore: 45,
          transactionsToday: 8,
          totalTransactions: 340,
          suspiciousActivities: 5,
          lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          status: 'suspended',
          performanceScore: 34,
          joinDate: '2024-08-10',
          specialization: ['General Banking']
        },
        {
          id: 'agent-004',
          name: 'Sunita Devi',
          phone: '+91 94567 89012',
          location: 'Patna, Bihar',
          region: 'Eastern Bihar',
          trustScore: 92,
          transactionsToday: 28,
          totalTransactions: 1567,
          suspiciousActivities: 0,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          status: 'active',
          performanceScore: 89,
          joinDate: '2023-06-08',
          specialization: ['Women Empowerment', 'Micro Finance', 'Financial Literacy']
        },
        {
          id: 'agent-005',
          name: 'Mohammed Ali',
          phone: '+91 93456 78901',
          location: 'Hyderabad, Telangana',
          region: 'Central Telangana',
          trustScore: 76,
          transactionsToday: 0,
          totalTransactions: 892,
          suspiciousActivities: 2,
          lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          status: 'inactive',
          performanceScore: 71,
          joinDate: '2023-11-20',
          specialization: ['Urban Banking', 'Business Loans']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === "all" || agent.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'inactive': return <Clock className="w-4 h-4 text-gray-600" />;
      case 'suspended': return <UserX className="w-4 h-4 text-red-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    suspended: agents.filter(a => a.status === 'suspended').length,
    averageTrust: agents.reduce((sum, a) => sum + a.trustScore, 0) / agents.length
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Agent Management</h1>
            <p className="text-sm opacity-90">Monitor and manage rural banking agents</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Agent Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                </div>
                <UserX className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Trust</p>
                  <p className="text-2xl font-bold text-green-600">{stats.averageTrust.toFixed(0)}%</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search agents by name, location, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-agent-search"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  data-testid="filter-all"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("active")}
                  data-testid="filter-active"
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === "suspended" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("suspended")}
                  data-testid="filter-suspended"
                >
                  Suspended
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredAgents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No agents found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Agent Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {agent.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {agent.location}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(agent.status)}>
                          {getStatusIcon(agent.status)}
                          <span className="ml-1">{agent.status.toUpperCase()}</span>
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Agent Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className={`text-lg font-bold ${getTrustScoreColor(agent.trustScore)}`}>
                          {agent.trustScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Trust Score</div>
                      </div>
                      
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {agent.transactionsToday}
                        </div>
                        <div className="text-xs text-muted-foreground">Today</div>
                      </div>
                      
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {agent.totalTransactions.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className={`text-lg font-bold ${agent.suspiciousActivities > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {agent.suspiciousActivities}
                        </div>
                        <div className="text-xs text-muted-foreground">Suspicious</div>
                      </div>
                    </div>

                    {/* Performance and Specialization */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Performance Score</span>
                          <span className="font-medium">{agent.performanceScore}%</span>
                        </div>
                        <Progress value={agent.performanceScore} className="h-2" />
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {agent.specialization.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Joined: {new Date(agent.joinDate).toLocaleDateString()}</span>
                        <span>Last seen: {getTimeAgo(agent.lastSeen)}</span>
                      </div>
                    </div>

                    {/* Suspicious Activity Alert */}
                    {agent.suspiciousActivities > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-sm text-red-800 dark:text-red-200">
                          {agent.suspiciousActivities} suspicious {agent.suspiciousActivities === 1 ? 'activity' : 'activities'} detected
                        </span>
                        <Button size="sm" variant="outline" className="ml-auto">
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}