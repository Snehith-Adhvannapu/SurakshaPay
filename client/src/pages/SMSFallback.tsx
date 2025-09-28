import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Phone, 
  Signal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  Wifi,
  WifiOff,
  Send,
  Users,
  Globe,
  Shield,
  Activity,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface SMSMessage {
  id: string;
  type: 'fraud_alert' | 'transaction_otp' | 'balance_inquiry' | 'status_update';
  recipient: string;
  content: string;
  language: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  networkType: '2G' | '3G' | '4G' | 'No Signal';
}

interface SMSTemplate {
  type: string;
  template: { [key: string]: string };
  priority: 'high' | 'medium' | 'low';
  maxLength: number;
}

export default function SMSFallback() {
  const { t } = useTranslation();
  const [networkStatus, setNetworkStatus] = useState<string>('4G');
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [testMessage, setTestMessage] = useState({
    type: 'fraud_alert',
    recipient: '+91 98765 43210',
    amount: '15000',
    location: 'Dharwad, Karnataka'
  });

  useEffect(() => {
    // Initialize with demo SMS messages
    setSmsMessages([
      {
        id: 'sms-001',
        type: 'fraud_alert',
        recipient: '+91 98765 43210',
        content: '🚨 FRAUD ALERT: Suspicious transaction of ₹25,000 detected on your account. If not authorized, reply BLOCK. - Rural Bank',
        language: 'en',
        sentAt: new Date(Date.now() - 5 * 60 * 1000),
        status: 'delivered',
        networkType: '3G'
      },
      {
        id: 'sms-002',
        type: 'transaction_otp',
        recipient: '+91 98123 45678',
        content: 'Your OTP for transaction of ₹2,500 is: 847392. Valid for 5 minutes. Do not share. - Rural Bank',
        language: 'en',
        sentAt: new Date(Date.now() - 2 * 60 * 1000),
        status: 'delivered',
        networkType: '2G'
      },
      {
        id: 'sms-003',
        type: 'balance_inquiry',
        recipient: '+91 97654 32109',
        content: 'आपका खाता शेष: ₹8,450.75 | उपलब्ध शेष: ₹8,450.75 | अंतिम लेनदेन: ₹500 Dr 28/09/25 - ग्रामीण बैंक',
        language: 'hi',
        sentAt: new Date(Date.now() - 10 * 60 * 1000),
        status: 'delivered',
        networkType: '2G'
      }
    ]);

    // Simulate network status changes
    const interval = setInterval(() => {
      const statuses = ['4G', '3G', '2G', 'No Signal'];
      const currentIndex = statuses.indexOf(networkStatus);
      const nextIndex = (currentIndex + 1) % statuses.length;
      setNetworkStatus(statuses[nextIndex]);
    }, 8000);

    return () => clearInterval(interval);
  }, [networkStatus]);

  const smsTemplates: SMSTemplate[] = [
    {
      type: 'fraud_alert',
      template: {
        en: '🚨 FRAUD ALERT: Suspicious transaction of ₹{amount} detected at {location}. If not authorized, reply BLOCK. - Rural Bank',
        hi: '🚨 धोखाधड़ी चेतावनी: {location} में ₹{amount} का संदिग्ध लेनदेन। यदि अधिकृत नहीं है तो BLOCK का उत्तर दें। - ग्रामीण बैंक',
        bn: '🚨 জালিয়াতি সতর্কতা: {location} এ ₹{amount} এর সন্দেহজনক লেনদেন। অনুমোদিত না হলে BLOCK উত্তর দিন। - গ্রামীণ ব্যাংক',
        ta: '🚨 மோசடி எச்சரிக்கை: {location} இல் ₹{amount} சந்தேகத்திற்குரிய பரிவர்த்தனை। அங்கீகரிக்கப்படவில்லை எனில் BLOCK பதிலளிக்கவும். - கிராமीய வங்கி',
        te: '🚨 మోసం హెచ్చరిక: {location} లో ₹{amount} అనుమానాస్పద లావాదేవీ. అధికారిక కాకపోతే BLOCK అని రిప్లై చేయండి। - గ్రామీణ బ్యాంక్',
        gu: '🚨 છેતરપિંડી ચેતવણી: {location} માં ₹{amount} નો શંકાસ્પદ વ્યવહાર. અધિકૃત નથી તો BLOCK જવાબ આપો. - ગ્રામીણ બેંક',
        pa: '🚨 ਧੋਖਾਧੜੀ ਚੇਤਾਵਨੀ: {location} ਵਿੱਚ ₹{amount} ਦਾ ਸ਼ੱਕੀ ਲੈਣ-ਦੇਣ। ਜੇ ਅਧਿਕਾਰਿਤ ਨਹੀਂ ਤਾਂ BLOCK ਜਵਾਬ ਦਿਓ। - ਪਿੰਡੂ ਬੈਂਕ'
      },
      priority: 'high',
      maxLength: 160
    },
    {
      type: 'transaction_otp',
      template: {
        en: 'Your OTP for transaction of ₹{amount} is: {otp}. Valid for 5 minutes. Do not share. - Rural Bank',
        hi: 'आपका ₹{amount} के लेनदेन के लिए OTP: {otp}। 5 मिनट के लिए वैध। साझा न करें। - ग्रामीण बैंक',
        bn: 'আপনার ₹{amount} লেনদেনের জন্য OTP: {otp}। ৫ মিনিটের জন্য বৈধ। শেয়ার করবেন না। - গ্রামীণ ব্যাংক',
        ta: 'உங்கள் ₹{amount} பரிவர்த்தனைக்கான OTP: {otp}। 5 நிமிடங்களுக்கு செல்லும். பகிர வேண்டாம். - கிராமீய வங்கி',
        te: 'మీ ₹{amount} లావాదేవీకి OTP: {otp}। 5 నిమిషాలకు చెల్లుతుంది। పంచుకోవద్দు। - గ్రామీణ బ్యాంక్',
        gu: 'તમારા ₹{amount} વ્યવહાર માટે OTP: {otp}। 5 મિનિટ માટે વૈધ। શેર કરશો નહીં। - ગ્રામીણ બેંક',
        pa: 'ਤੁਹਾਡੇ ₹{amount} ਲੈਣ-ਦੇਣ ਲਈ OTP: {otp}। 5 ਮਿੰਟ ਲਈ ਵੈਧ। ਸਾਂਝਾ ਨਾ ਕਰੋ। - ਪਿੰਡੂ ਬੈਂਕ'
      },
      priority: 'high',
      maxLength: 160
    },
    {
      type: 'balance_inquiry',
      template: {
        en: 'Account Balance: ₹{balance} | Available: ₹{available} | Last Transaction: ₹{lastAmount} {type} {date} - Rural Bank',
        hi: 'खाता शेष: ₹{balance} | उपलब्ध: ₹{available} | अंतिम लेनदेन: ₹{lastAmount} {type} {date} - ग्रामीण बैंक',
        bn: 'অ্যাকাউন্ট ব্যালেন্স: ₹{balance} | উপলব্ধ: ₹{available} | শেষ লেনদেন: ₹{lastAmount} {type} {date} - গ্রামীণ ব্যাংক',
        ta: 'கணக்கு இருப்பு: ₹{balance} | கிடைக்கும்: ₹{available} | கடைசி பரிவர்த்தனை: ₹{lastAmount} {type} {date} - கிராமீய வங்கி',
        te: 'ఖాతా నిల్వ: ₹{balance} | అందుబాటులో: ₹{available} | చివరి లావాదేవీ: ₹{lastAmount} {type} {date} - గ్రామీణ బ్యాంక్',
        gu: 'ખાતાનું બેલેન્સ: ₹{balance} | ઉપલબ્ધ: ₹{available} | છેલ્લો વ્યવહાર: ₹{lastAmount} {type} {date} - ગ્રામીણ બેંક',
        pa: 'ਖਾਤਾ ਬਕਾਇਆ: ₹{balance} | ਉਪਲਬਧ: ₹{available} | ਆਖਰੀ ਲੈਣ-ਦੇਣ: ₹{lastAmount} {type} {date} - ਪਿੰਡੂ ਬੈਂਕ'
      },
      priority: 'medium',
      maxLength: 160
    }
  ];

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case '4G': return <Wifi className="w-4 h-4 text-green-600" />;
      case '3G': return <Signal className="w-4 h-4 text-blue-600" />;
      case '2G': return <Signal className="w-4 h-4 text-yellow-600" />;
      case 'No Signal': return <WifiOff className="w-4 h-4 text-red-600" />;
      default: return <Signal className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNetworkColor = (type: string) => {
    switch (type) {
      case '4G': return 'text-green-600';
      case '3G': return 'text-blue-600';
      case '2G': return 'text-yellow-600';
      case 'No Signal': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud_alert': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'transaction_otp': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'balance_inquiry': return <Activity className="w-4 h-4 text-green-600" />;
      case 'status_update': return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const sendTestMessage = () => {
    const template = smsTemplates.find(t => t.type === testMessage.type);
    if (!template) return;

    const content = template.template[selectedLanguage]
      .replace('{amount}', testMessage.amount)
      .replace('{location}', testMessage.location)
      .replace('{otp}', Math.floor(100000 + Math.random() * 900000).toString());

    const newMessage: SMSMessage = {
      id: `sms-${Date.now()}`,
      type: testMessage.type as any,
      recipient: testMessage.recipient,
      content,
      language: selectedLanguage,
      sentAt: new Date(),
      status: 'pending',
      networkType: networkStatus as any
    };

    setSmsMessages(prev => [newMessage, ...prev]);

    // Simulate delivery
    setTimeout(() => {
      setSmsMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, status: networkStatus === 'No Signal' ? 'failed' : 'delivered' }
          : msg
      ));
    }, 2000);
  };

  const networkStats = {
    deliveryRate: networkStatus === 'No Signal' ? 0 : networkStatus === '2G' ? 95 : networkStatus === '3G' ? 98 : 99,
    avgDeliveryTime: networkStatus === 'No Signal' ? 0 : networkStatus === '2G' ? 15 : networkStatus === '3G' ? 8 : 3,
    costPerSMS: 0.15,
    ruralCoverage: networkStatus === '2G' ? 85 : networkStatus === '3G' ? 70 : 45
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">SMS Fallback System</h1>
            <p className="text-sm opacity-90">Critical banking notifications via SMS for rural areas</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Badge className={`${getNetworkColor(networkStatus)} border`}>
              {getNetworkIcon(networkStatus)}
              <span className="ml-1">{networkStatus}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Network Status & Stats */}
        <Card className={`border-2 ${
          networkStatus === 'No Signal' ? 'border-red-200 bg-red-50 dark:bg-red-950' :
          networkStatus === '2G' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' :
          'border-green-200 bg-green-50 dark:bg-green-950'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Network Status & SMS Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className={`text-lg font-bold ${getNetworkColor(networkStatus)}`}>
                  {networkStats.deliveryRate}%
                </div>
                <div className="text-xs text-muted-foreground">Delivery Rate</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">
                  {networkStats.avgDeliveryTime}s
                </div>
                <div className="text-xs text-muted-foreground">Avg Delivery</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <Zap className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">
                  ₹{networkStats.costPerSMS}
                </div>
                <div className="text-xs text-muted-foreground">Cost per SMS</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                <Globe className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-600">
                  {networkStats.ruralCoverage}%
                </div>
                <div className="text-xs text-muted-foreground">Rural Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Send Test SMS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type</Label>
                <Select value={testMessage.type} onValueChange={(value) => setTestMessage({...testMessage, type: value})}>
                  <SelectTrigger data-testid="select-message-type">
                    <SelectValue placeholder="Select message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fraud_alert">🚨 Fraud Alert</SelectItem>
                    <SelectItem value="transaction_otp">🔐 Transaction OTP</SelectItem>
                    <SelectItem value="balance_inquiry">💰 Balance Inquiry</SelectItem>
                    <SelectItem value="status_update">📄 Status Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger data-testid="select-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                    <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Number</Label>
                <Input
                  id="recipient"
                  value={testMessage.recipient}
                  onChange={(e) => setTestMessage({...testMessage, recipient: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                  data-testid="input-recipient"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  value={testMessage.amount}
                  onChange={(e) => setTestMessage({...testMessage, amount: e.target.value})}
                  placeholder="15000"
                  data-testid="input-amount"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={testMessage.location}
                onChange={(e) => setTestMessage({...testMessage, location: e.target.value})}
                placeholder="Dharwad, Karnataka"
                data-testid="input-location"
              />
            </div>
            
            <Button 
              onClick={sendTestMessage}
              className="w-full"
              disabled={networkStatus === 'No Signal'}
              data-testid="button-send-sms"
            >
              <Send className="w-4 h-4 mr-2" />
              Send SMS ({selectedLanguage.toUpperCase()})
            </Button>
            
            {networkStatus === 'No Signal' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>No network signal - SMS delivery will fail</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Message History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              SMS Message History
              {smsMessages.length > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {smsMessages.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smsMessages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getMessageTypeIcon(message.type)}
                      <span className="font-medium capitalize">
                        {message.type.replace('_', ' ')}
                      </span>
                      <Badge className="text-xs">
                        {message.language.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(message.status)}>
                        {message.status.toUpperCase()}
                      </Badge>
                      <Badge className={`${getNetworkColor(message.networkType)} border`}>
                        {getNetworkIcon(message.networkType)}
                        <span className="ml-1">{message.networkType}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">To:</span>
                      <span className="ml-2 font-medium">{message.recipient}</span>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border text-sm">
                      {message.content}
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sent: {message.sentAt.toLocaleTimeString()}</span>
                      <span>Length: {message.content.length}/160 chars</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {smsMessages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No SMS messages sent yet</p>
                  <p className="text-sm text-muted-foreground">
                    Send a test message to see it appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Multi-language Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Multi-language SMS Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {smsTemplates.map((template, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium capitalize flex items-center gap-2">
                      {getMessageTypeIcon(template.type)}
                      {template.type.replace('_', ' ')}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        template.priority === 'high' ? 'bg-red-100 text-red-800' :
                        template.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {template.priority} priority
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {template.maxLength} chars max
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(template.template).map(([lang, content]) => (
                      <div key={lang} className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {lang.toUpperCase()}
                        </div>
                        <div className="text-sm">{content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SIH Competition Benefits */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Rural Banking Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">95%</div>
                <div className="text-sm text-muted-foreground">2G Network Coverage</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">7 Languages</div>
                <div className="text-sm text-muted-foreground">Regional Support</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">₹0.15</div>
                <div className="text-sm text-muted-foreground">Cost per Alert</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Key Features for Rural Banking</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Works on basic feature phones (no internet required)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Multi-language fraud alerts in regional scripts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>2G network compatible (95% rural coverage)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Instant fraud alerts bypass poor internet</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>OTP delivery for secure transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Balance inquiry via SMS without app</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}