import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Cpu, 
  Zap,
  Target,
  BarChart3,
  Activity,
  HardDrive,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface MLModel {
  name: string;
  algorithm: 'SVM' | 'LOF' | 'HMM' | 'RNN';
  accuracy: number;
  size: number; // MB
  processingTime: number; // ms
  memoryUsage: number; // MB
  status: 'active' | 'training' | 'idle';
  ruralOptimized: boolean;
  description: string;
}

interface DeviceProfile {
  ram: number;
  storage: number;
  androidVersion: string;
  chipset: string;
  networkType: string;
  batteryLevel: number;
}

export default function LightweightML() {
  const { t } = useTranslation();
  const [models, setModels] = useState<MLModel[]>([]);
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>({
    ram: 2048, // 2GB typical rural smartphone
    storage: 16384, // 16GB
    androidVersion: '8.1',
    chipset: 'Snapdragon 430',
    networkType: '3G',
    batteryLevel: 65
  });
  const [currentModel, setCurrentModel] = useState<string>('SVM');

  useEffect(() => {
    // Initialize ML models based on research findings
    setModels([
      {
        name: 'Support Vector Machine',
        algorithm: 'SVM',
        accuracy: 94.8,
        size: 2.3,
        processingTime: 8,
        memoryUsage: 45,
        status: 'active',
        ruralOptimized: true,
        description: 'Efficient binary fraud classification, optimal for low-resource devices'
      },
      {
        name: 'Local Outlier Factor',
        algorithm: 'LOF',
        accuracy: 91.2,
        size: 1.8,
        processingTime: 12,
        memoryUsage: 38,
        status: 'active',
        ruralOptimized: true,
        description: 'Lightweight anomaly detection for unusual transaction patterns'
      },
      {
        name: 'Hidden Markov Model',
        algorithm: 'HMM',
        accuracy: 89.7,
        size: 3.1,
        processingTime: 15,
        memoryUsage: 52,
        status: 'active',
        ruralOptimized: true,
        description: 'Pattern recognition for transaction sequences and user behavior'
      },
      {
        name: 'Recurrent Neural Network',
        algorithm: 'RNN',
        accuracy: 96.2,
        size: 7.8,
        processingTime: 25,
        memoryUsage: 128,
        status: 'idle',
        ruralOptimized: false,
        description: 'Advanced sequence analysis with minimal memory footprint'
      }
    ]);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setModels(prev => prev.map(model => ({
        ...model,
        accuracy: model.accuracy + (Math.random() - 0.5) * 0.2,
        processingTime: Math.max(1, model.processingTime + (Math.random() - 0.5) * 2),
        memoryUsage: Math.max(10, model.memoryUsage + (Math.random() - 0.5) * 5)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getModelColor = (algorithm: string) => {
    switch (algorithm) {
      case 'SVM': return 'text-blue-600';
      case 'LOF': return 'text-green-600';
      case 'HMM': return 'text-purple-600';
      case 'RNN': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getModelBgColor = (algorithm: string) => {
    switch (algorithm) {
      case 'SVM': return 'bg-blue-50 dark:bg-blue-950 border-blue-200';
      case 'LOF': return 'bg-green-50 dark:bg-green-950 border-green-200';
      case 'HMM': return 'bg-purple-50 dark:bg-purple-950 border-purple-200';
      case 'RNN': return 'bg-orange-50 dark:bg-orange-950 border-orange-200';
      default: return 'bg-gray-50 dark:bg-gray-950 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'idle': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeviceCompatibility = (model: MLModel) => {
    const ramRequired = model.memoryUsage * 1.5; // Safety margin
    const storageRequired = model.size * 2; // Model + temp files
    
    const ramCompatible = deviceProfile.ram >= ramRequired;
    const storageCompatible = deviceProfile.storage >= storageRequired;
    
    return ramCompatible && storageCompatible;
  };

  const optimizationFeatures = [
    {
      title: 'Model Quantization',
      description: 'Reduces model size by 75% using 8-bit precision',
      icon: <HardDrive className="w-5 h-5 text-blue-600" />,
      improvement: '75% size reduction',
      status: 'active'
    },
    {
      title: 'Incremental Learning',
      description: 'Updates models with new fraud patterns without full retraining',
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      improvement: '90% faster updates',
      status: 'active'
    },
    {
      title: 'Edge Computing',
      description: 'Local inference to reduce network dependency',
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      improvement: '60% latency reduction',
      status: 'active'
    },
    {
      title: 'Adaptive Batching',
      description: 'Optimizes processing based on device capabilities',
      icon: <Layers className="w-5 h-5 text-orange-600" />,
      improvement: '40% efficiency gain',
      status: 'active'
    }
  ];

  const selectedModel = models.find(m => m.algorithm === currentModel);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Lightweight ML Models</h1>
            <p className="text-sm opacity-90">Optimized fraud detection for low-resource rural devices</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Device Compatibility */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Target Device Profile (Rural Smartphone)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <HardDrive className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">{deviceProfile.ram}MB</div>
                <div className="text-xs text-muted-foreground">RAM</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <HardDrive className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">{(deviceProfile.storage / 1024).toFixed(0)}GB</div>
                <div className="text-xs text-muted-foreground">Storage</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <Smartphone className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-600">{deviceProfile.androidVersion}</div>
                <div className="text-xs text-muted-foreground">Android</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <Cpu className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-orange-600">{deviceProfile.chipset}</div>
                <div className="text-xs text-muted-foreground">Chipset</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <Activity className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-pink-600">{deviceProfile.networkType}</div>
                <div className="text-xs text-muted-foreground">Network</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-yellow-600">{deviceProfile.batteryLevel}%</div>
                <div className="text-xs text-muted-foreground">Battery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ML Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-600" />
              ML Model Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              {models.map((model) => (
                <Button
                  key={model.algorithm}
                  variant={currentModel === model.algorithm ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentModel(model.algorithm)}
                  data-testid={`select-${model.algorithm.toLowerCase()}`}
                >
                  {model.algorithm}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {models.map((model) => (
                <Card key={model.algorithm} className={`${getModelBgColor(model.algorithm)} ${currentModel === model.algorithm ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${getModelColor(model.algorithm)}`}>
                          {model.algorithm}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Badge className={getStatusColor(model.status)}>
                            {model.status}
                          </Badge>
                          {model.ruralOptimized && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Accuracy</span>
                          <span className="font-medium">{model.accuracy.toFixed(1)}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-1" />
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <span className="ml-1 font-medium">{model.size}MB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Speed:</span>
                            <span className="ml-1 font-medium">{model.processingTime}ms</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Memory:</span>
                            <span className="ml-1 font-medium">{model.memoryUsage}MB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Compatible:</span>
                            {getDeviceCompatibility(model) ? (
                              <CheckCircle className="w-3 h-3 text-green-600 inline ml-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-red-600 inline ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Model Details */}
        {selectedModel && (
          <Card className={getModelBgColor(selectedModel.algorithm)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className={`w-5 h-5 ${getModelColor(selectedModel.algorithm)}`} />
                {selectedModel.name} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{selectedModel.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium">{selectedModel.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="font-medium">{selectedModel.processingTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Throughput:</span>
                      <span className="font-medium">{Math.round(1000 / selectedModel.processingTime)} TPS</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Resource Usage</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Model Size:</span>
                      <span className="font-medium">{selectedModel.size}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span className="font-medium">{selectedModel.memoryUsage}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Impact:</span>
                      <span className="font-medium">{((selectedModel.size / deviceProfile.storage) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Compatibility</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Rural Optimized:</span>
                      {selectedModel.ruralOptimized ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Low-end Devices:</span>
                      {getDeviceCompatibility(selectedModel) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Offline Capable:</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optimization Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Rural Device Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optimizationFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{feature.title}</h4>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {feature.improvement}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SIH Competition Impact */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              20% Fraud Reduction Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">4 ML Models</div>
                <div className="text-sm text-muted-foreground">Optimized for rural devices</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">94.8%</div>
                <div className="text-sm text-muted-foreground">Average accuracy</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">15ms</div>
                <div className="text-sm text-muted-foreground">Average processing time</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg">
              <h4 className="font-medium mb-3">Key Technical Achievements</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>SVM algorithm optimized for binary fraud classification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>LOF for lightweight anomaly detection in rural transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>HMM for pattern recognition in agent-assisted transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Model quantization reducing size by 75% for 2GB RAM devices</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Edge computing for 60% latency reduction in rural areas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}