import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.transactions': 'Transactions',
      'nav.security': 'Security',
      'nav.logout': 'Logout',
      
      // Authentication
      'auth.welcome': 'Welcome to Rural Banking',
      'auth.subtitle': 'Secure banking for rural communities',
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.username': 'Username',
      'auth.password': 'Password',
      'auth.phoneNumber': 'Phone Number',
      'auth.accountNumber': 'Account Number',
      'auth.confirmPassword': 'Confirm Password',
      'auth.createAccount': 'Create Account',
      'auth.switchToLogin': 'Already have an account? Login',
      'auth.switchToRegister': "Don't have an account? Register",
      
      // Home/Dashboard
      'home.welcomeBack': 'Welcome back',
      'home.accountBalance': 'Account Balance',
      'home.currency': '₹',
      'home.lastUpdated': 'Last updated',
      'home.quickActions': 'Quick Actions',
      'home.sendMoney': 'Send Money',
      'home.requestMoney': 'Request Money',
      'home.payBills': 'Pay Bills',
      'home.recentTransactions': 'Recent Transactions',
      'home.viewAll': 'View All',
      'home.noTransactions': 'No recent transactions',
      
      // Transactions
      'transactions.title': 'Transaction History',
      'transactions.amount': 'Amount',
      'transactions.type': 'Type',
      'transactions.description': 'Description',
      'transactions.date': 'Date',
      'transactions.status': 'Status',
      'transactions.location': 'Location',
      'transactions.fraudScore': 'Fraud Score',
      'transactions.newTransaction': 'New Transaction',
      'transactions.credit': 'Credit',
      'transactions.debit': 'Debit',
      'transactions.pending': 'Pending',
      'transactions.completed': 'Completed',
      'transactions.failed': 'Failed',
      
      // Security
      'security.title': 'Security Center',
      'security.subtitle': 'Manage your account security',
      'security.fraudAlerts': 'Fraud Alerts',
      'security.noAlerts': 'No active fraud alerts',
      'security.deviceSecurity': 'Device Security',
      'security.trustedDevices': 'Trusted Devices',
      'security.securityScore': 'Security Score',
      'security.dismiss': 'Dismiss',
      'security.investigate': 'Investigate',
      'security.excellentProtection': 'Excellent Protection',
      'security.protected': 'Protected',
      'security.simSwapProtection': 'SIM Swap Protection',
      'security.trustScore': 'Trust Score',
      'security.blockedAttempts': 'Blocked Attempts',
      'security.currentIMEI': 'Current IMEI',
      'security.carrier': 'Carrier',
      'security.networkStatus': 'Network Status',
      'security.lastSimChange': 'Last SIM Change',
      'security.noChangesDetected': 'No changes detected',
      'security.realtimeMonitoring': 'Real-time monitoring active',
      'security.fraudStats': 'Fraud Detection Statistics',
      'security.blockedLoginAttempts': 'Blocked Login Attempts',
      'security.suspiciousTransactions': 'Suspicious Transactions',
      'security.deviceChanges': 'Device Changes',
      'security.offlineTransactions': 'Offline Transactions',
      'security.advancedFraudDetection': 'Advanced Fraud Detection',
      'security.simSwapDetection': 'SIM Swap Detection',
      'security.simSwapDescription': 'Real-time monitoring for SIM card changes and suspicious carrier activities',
      'security.geoLocationAnalysis': 'Geo-location Analysis',
      'security.geoLocationDescription': 'Impossible travel detection and location-based transaction verification',
      'security.offlineFraudDetection': 'Offline Fraud Detection',
      'security.offlineFraudDescription': 'Local fraud validation for poor connectivity areas with sync capability',
      'security.agentBehaviorAnalysis': 'Agent Behavior Analysis',
      'security.agentBehaviorDescription': 'ML-powered monitoring of banking agent transaction patterns',
      'security.traditionalSecurityFeatures': 'Traditional Security Features',
      'security.testAuthentication': 'Test Authentication',
      'security.securityTest': 'Security Test',
      'security.activeProtections': 'Active Protections',
      'security.multiFactorAuth': 'Multi-Factor Authentication',
      'security.multiFactorAuthDesc': 'PIN + SMS verification for enhanced security',
      'security.deviceRecognition': 'Device Recognition',
      'security.deviceRecognitionDesc': 'Detects new devices and suspicious activity',
      'security.transactionEncryption': 'Transaction Encryption',
      'security.transactionEncryptionDesc': 'End-to-end encryption for all transactions',
      'security.fraudMonitoring': 'Fraud Monitoring',
      'security.fraudMonitoringDesc': '24/7 AI-powered fraud detection',
      'security.recentActivity': 'Recent Activity',
      'security.successfulLogin': 'Successful login from trusted device',
      'security.largeTransactionVerified': 'Large transaction verified successfully',
      'security.deviceFingerprintUpdated': 'Device fingerprint updated',
      'security.emergencySecurity': 'Emergency Security',
      'security.emergencySecurityDesc': 'If you suspect unauthorized access to your account',
      'security.lockAccountImmediately': 'Lock My Account Immediately',
      'security.active': 'active',
      
      // Fraud Detection
      'fraud.alertTitle': 'Fraud Alert',
      'fraud.suspiciousActivity': 'Suspicious activity detected',
      'fraud.highRisk': 'High Risk',
      'fraud.mediumRisk': 'Medium Risk',
      'fraud.lowRisk': 'Low Risk',
      'fraud.riskFactors': 'Risk Factors',
      'fraud.recommendation': 'Recommendation',
      
      // Forms
      'form.submit': 'Submit',
      'form.cancel': 'Cancel',
      'form.save': 'Save',
      'form.required': 'This field is required',
      'form.invalidEmail': 'Invalid email address',
      'form.invalidPhone': 'Invalid phone number',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.success': 'Success',
      'common.close': 'Close',
      'common.confirm': 'Confirm',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.settings': 'Settings',
      'common.language': 'Language',
      'common.selectLanguage': 'Select Language',
      
      // Banking specific
      'banking.balance': 'Balance',
      'banking.transfer': 'Transfer Money',
      'banking.deposit': 'Deposit',
      'banking.withdrawal': 'Withdrawal',
      'banking.accountDetails': 'Account Details',
      'banking.transactionId': 'Transaction ID',
      'banking.beneficiary': 'Beneficiary',
      'banking.remarks': 'Remarks',
      
      // Rural banking specific
      'rural.agentAssisted': 'Agent Assisted Transaction',
      'rural.offlineCapable': 'Works Offline',
      'rural.syncPending': 'Sync Pending',
      'rural.lowConnectivity': 'Low Connectivity Mode',
      'rural.simSwapAlert': 'SIM Card Change Detected',
      'rural.deviceTrust': 'Device Trust Score'
    }
  },
  hi: {
    translation: {
      // Navigation  
      'nav.home': 'होम',
      'nav.transactions': 'लेन-देन',
      'nav.security': 'सुरक्षा',
      'nav.logout': 'लॉग आउट',
      
      // Authentication
      'auth.welcome': 'ग्रामीण बैंकिंग में आपका स्वागत है',
      'auth.subtitle': 'ग्रामीण समुदायों के लिए सुरक्षित बैंकिंग',
      'auth.login': 'लॉगिन',
      'auth.register': 'रजिस्टर',
      'auth.username': 'उपयोगकर्ता नाम',
      'auth.password': 'पासवर्ड',
      'auth.phoneNumber': 'फ़ोन नंबर',
      'auth.accountNumber': 'खाता संख्या',
      'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
      'auth.createAccount': 'खाता बनाएं',
      'auth.switchToLogin': 'पहले से खाता है? लॉगिन करें',
      'auth.switchToRegister': 'खाता नहीं है? रजिस्टर करें',
      
      // Home/Dashboard
      'home.welcomeBack': 'वापस स्वागत है',
      'home.accountBalance': 'खाता शेष',
      'home.currency': '₹',
      'home.lastUpdated': 'अंतिम अपडेट',
      'home.quickActions': 'त्वरित कार्य',
      'home.sendMoney': 'पैसे भेजें',
      'home.requestMoney': 'पैसे मांगें',
      'home.payBills': 'बिल भुगतान',
      'home.recentTransactions': 'हाल के लेन-देन',
      'home.viewAll': 'सभी देखें',
      'home.noTransactions': 'कोई हाल का लेन-देन नहीं',
      
      // Transactions
      'transactions.title': 'लेन-देन इतिहास',
      'transactions.amount': 'राशि',
      'transactions.type': 'प्रकार',
      'transactions.description': 'विवरण',
      'transactions.date': 'दिनांक',
      'transactions.status': 'स्थिति',
      'transactions.location': 'स्थान',
      'transactions.fraudScore': 'धोखाधड़ी स्कोर',
      'transactions.newTransaction': 'नया लेन-देन',
      'transactions.credit': 'क्रेडिट',
      'transactions.debit': 'डेबिट',
      'transactions.pending': 'लंबित',
      'transactions.completed': 'पूर्ण',
      'transactions.failed': 'असफल',
      
      // Security
      'security.title': 'सुरक्षा केंद्र',
      'security.subtitle': 'अपनी खाता सुरक्षा प्रबंधित करें',
      'security.fraudAlerts': 'धोखाधड़ी अलर्ट',
      'security.noAlerts': 'कोई सक्रिय धोखाधड़ी अलर्ट नहीं',
      'security.deviceSecurity': 'डिवाइस सुरक्षा',
      'security.trustedDevices': 'विश्वसनीय डिवाइस',
      'security.securityScore': 'सुरक्षा स्कोर',
      'security.dismiss': 'खारिज करें',
      'security.investigate': 'जांच करें',
      'security.excellentProtection': 'उत्कृष्ट सुरक्षा',
      'security.protected': 'सुरक्षित',
      'security.simSwapProtection': 'सिम स्वैप सुरक्षा',
      'security.trustScore': 'विश्वास स्कोर',
      'security.blockedAttempts': 'अवरुद्ध प्रयास',
      'security.currentIMEI': 'वर्तमान IMEI',
      'security.carrier': 'कैरियर',
      'security.networkStatus': 'नेटवर्क स्थिति',
      'security.lastSimChange': 'अंतिम सिम परिवर्तन',
      'security.noChangesDetected': 'कोई परिवर्तन नहीं मिला',
      'security.realtimeMonitoring': 'रीयल-टाइम निगरानी सक्रिय',
      'security.fraudStats': 'धोखाधड़ी का पता लगाने के आंकड़े',
      'security.blockedLoginAttempts': 'अवरुद्ध लॉगिन प्रयास',
      'security.suspiciousTransactions': 'संदिग्ध लेन-देन',
      'security.deviceChanges': 'डिवाइस परिवर्तन',
      'security.offlineTransactions': 'ऑफलाइन लेन-देन',
      'security.advancedFraudDetection': 'उन्नत धोखाधड़ी का पता लगाना',
      'security.simSwapDetection': 'सिम स्वैप का पता लगाना',
      'security.simSwapDescription': 'सिम कार्ड परिवर्तन और संदिग्ध कैरियर गतिविधियों के लिए रीयल-टाइम निगरानी',
      'security.geoLocationAnalysis': 'भू-स्थान विश्लेषण',
      'security.geoLocationDescription': 'असंभव यात्रा का पता लगाना और स्थान-आधारित लेन-देन सत्यापन',
      'security.offlineFraudDetection': 'ऑफलाइन धोखाधड़ी का पता लगाना',
      'security.offlineFraudDescription': 'खराब कनेक्टिविटी वाले क्षेत्रों के लिए स्थानीय धोखाधड़ी सत्यापन',
      'security.agentBehaviorAnalysis': 'एजेंट व्यवहार विश्लेषण',
      'security.agentBehaviorDescription': 'बैंकिंग एजेंट लेन-देन पैटर्न की ML-संचालित निगरानी',
      'security.traditionalSecurityFeatures': 'पारंपरिक सुरक्षा सुविधाएं',
      'security.testAuthentication': 'प्रमाणीकरण परीक्षण',
      'security.securityTest': 'सुरक्षा परीक्षण',
      'security.activeProtections': 'सक्रिय सुरक्षा',
      'security.multiFactorAuth': 'बहु-कारक प्रमाणीकरण',
      'security.multiFactorAuthDesc': 'बेहतर सुरक्षा के लिए PIN + SMS सत्यापन',
      'security.deviceRecognition': 'डिवाइस पहचान',
      'security.deviceRecognitionDesc': 'नए डिवाइस और संदिग्ध गतिविधि का पता लगाता है',
      'security.transactionEncryption': 'लेन-देन एन्क्रिप्शन',
      'security.transactionEncryptionDesc': 'सभी लेन-देन के लिए एंड-टू-एंड एन्क्रिप्शन',
      'security.fraudMonitoring': 'धोखाधड़ी निगरानी',
      'security.fraudMonitoringDesc': '24/7 AI-संचालित धोखाधड़ी का पता लगाना',
      'security.recentActivity': 'हाल की गतिविधि',
      'security.successfulLogin': 'विश्वसनीय डिवाइस से सफल लॉगिन',
      'security.largeTransactionVerified': 'बड़ा लेन-देन सफलतापूर्वक सत्यापित',
      'security.deviceFingerprintUpdated': 'डिवाइस फिंगरप्रिंट अपडेट किया गया',
      'security.emergencySecurity': 'आपातकालीन सुरक्षा',
      'security.emergencySecurityDesc': 'यदि आपको अपने खाते में अनधिकृत पहुंच का संदेह है',
      'security.lockAccountImmediately': 'तुरंत मेरा खाता लॉक करें',
      'security.active': 'सक्रिय',
      
      // Continue with other translations...
      'common.loading': 'लोड हो रहा है...',
      'common.error': 'एक त्रुटि हुई',
      'common.success': 'सफलता',
      'common.language': 'भाषा',
      'common.selectLanguage': 'भाषा चुनें',
      
      'rural.agentAssisted': 'एजेंट सहायक लेन-देन',
      'rural.offlineCapable': 'ऑफलाइन काम करता है',
      'rural.simSwapAlert': 'सिम कार्ड परिवर्तन का पता चला'
    }
  },
  bn: {
    translation: {
      // Navigation  
      'nav.home': 'হোম',
      'nav.transactions': 'লেনদেন',
      'nav.security': 'নিরাপত্তা',
      'nav.logout': 'লগ আউট',
      
      // Authentication
      'auth.welcome': 'গ্রামীণ ব্যাংকিং-এ স্বাগতম',
      'auth.subtitle': 'গ্রামীণ সম্প্রদায়ের জন্য নিরাপদ ব্যাংকিং',
      'auth.login': 'লগইন',
      'auth.register': 'নিবন্ধন',
      'auth.username': 'ব্যবহারকারীর নাম',
      'auth.password': 'পাসওয়ার্ড',
      'auth.phoneNumber': 'ফোন নম্বর',
      'auth.accountNumber': 'অ্যাকাউন্ট নম্বর',
      'auth.confirmPassword': 'পাসওয়ার্ড নিশ্চিত করুন',
      'auth.createAccount': 'অ্যাকাউন্ট তৈরি করুন',
      'auth.switchToLogin': 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন',
      'auth.switchToRegister': 'অ্যাকাউন্ট নেই? নিবন্ধন করুন',
      
      // Home/Dashboard
      'home.welcomeBack': 'ফিরে আসার জন্য স্বাগতম',
      'home.accountBalance': 'অ্যাকাউন্ট ব্যালেন্স',
      'home.currency': '₹',
      'home.lastUpdated': 'সর্বশেষ আপডেট',
      'home.quickActions': 'দ্রুত কার্যক্রম',
      'home.sendMoney': 'টাকা পাঠান',
      'home.requestMoney': 'টাকা চান',
      'home.payBills': 'বিল পরিশোধ',
      'home.recentTransactions': 'সাম্প্রতিক লেনদেন',
      'home.viewAll': 'সব দেখুন',
      'home.noTransactions': 'কোন সাম্প্রতিক লেনদেন নেই',
      
      // Security
      'security.title': 'নিরাপত্তা কেন্দ্র',
      'security.fraudAlerts': 'জালিয়াতি সতর্কতা',
      'security.noAlerts': 'কোন সক্রিয় জালিয়াতি সতর্কতা নেই',
      'security.deviceSecurity': 'ডিভাইস নিরাপত্তা',
      'security.trustedDevices': 'বিশ্বস্ত ডিভাইস',
      'security.securityScore': 'নিরাপত্তা স্কোর',
      'security.dismiss': 'বাতিল করুন',
      'security.investigate': 'তদন্ত করুন',
      
      'common.loading': 'লোড হচ্ছে...',
      'common.error': 'একটি ত্রুটি ঘটেছে',
      'common.success': 'সফল',
      'common.language': 'ভাষা',
      'common.selectLanguage': 'ভাষা নির্বাচন করুন',
      
      'rural.agentAssisted': 'এজেন্ট সহায়তাপ্রাপ্ত লেনদেন',
      'rural.offlineCapable': 'অফলাইনে কাজ করে',
      'rural.simSwapAlert': 'সিম কার্ড পরিবর্তন সনাক্ত হয়েছে'
    }
  },
  ta: {
    translation: {
      // Navigation  
      'nav.home': 'முகப்பு',
      'nav.transactions': 'பரிவர்த்தனைகள்',
      'nav.security': 'பாதுகாப்பு',
      'nav.logout': 'வெளியேறு',
      
      // Authentication
      'auth.welcome': 'கிராமப்புற வங்கியில் வரவேற்கிறோம்',
      'auth.subtitle': 'கிராமப்புற சமூகங்களுக்கான பாதுகாப்பான வங்கி',
      'auth.login': 'உள்நுழைய',
      'auth.register': 'பதிவுசெய்',
      'auth.username': 'பயனர்பெயர்',
      'auth.password': 'கடவுச்சொல்',
      'auth.phoneNumber': 'தொலைபேசி எண்',
      'auth.accountNumber': 'கணக்கு எண்',
      'auth.confirmPassword': 'கடவுச்சொல்லை உறுதிப்படுத்து',
      'auth.createAccount': 'கணக்கை உருவாக்கு',
      'auth.switchToLogin': 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைய',
      'auth.switchToRegister': 'கணக்கு இல்லையா? பதிவுசெய்',
      
      // Home/Dashboard
      'home.welcomeBack': 'மீண்டும் வரவேற்கிறோம்',
      'home.accountBalance': 'கணக்கு இருப்பு',
      'home.currency': '₹',
      'home.lastUpdated': 'கடைசியாக புதுப்பிக்கப்பட்டது',
      'home.quickActions': 'விரைவு செயல்கள்',
      'home.sendMoney': 'பணம் அனுப்பு',
      'home.requestMoney': 'பணம் கேள்',
      'home.payBills': 'பில் செலுத்து',
      'home.recentTransactions': 'சமீபத்திய பரிவர்த்தனைகள்',
      'home.viewAll': 'அனைத்தையும் பார்',
      'home.noTransactions': 'சமீபத்திய பரிவர்த்தனைகள் இல்லை',
      
      // Security
      'security.title': 'பாதுகாப்பு மையம்',
      'security.fraudAlerts': 'மோசடி எச்சரிக்கைகள்',
      'security.noAlerts': 'செயலில் உள்ள மோசடி எச்சரிக்கைகள் இல்லை',
      'security.deviceSecurity': 'சாதன பாதுகாப்பு',
      'security.trustedDevices': 'நம்பகமான சாதனங்கள்',
      'security.securityScore': 'பாதுகாப்பு மதிப்பெண்',
      'security.dismiss': 'நிராகரி',
      'security.investigate': 'விசாரி',
      
      'common.loading': 'ஏற்றுகிறது...',
      'common.error': 'பிழை ஏற்பட்டது',
      'common.success': 'வெற்றி',
      'common.language': 'மொழி',
      'common.selectLanguage': 'மொழியைத் தேர்ந்தெடு',
      
      'rural.agentAssisted': 'முகவர் உதவி பரிவர்த்தனை',
      'rural.offlineCapable': 'ஆஃப்லைனில் வேலை செய்கிறது',
      'rural.simSwapAlert': 'சிம் கார்டு மாற்றம் கண்டறியப்பட்டது'
    }
  },
  te: {
    translation: {
      // Navigation  
      'nav.home': 'హోమ్',
      'nav.transactions': 'లావాదేవీలు',
      'nav.security': 'భద్రత',
      'nav.logout': 'లాగ్ అవుట్',
      
      // Authentication
      'auth.welcome': 'గ్రామీణ బ్యాంకింగ్‌కు స్వాగతం',
      'auth.subtitle': 'గ్రామీణ కమ్యూనిటీల కోసం సురక్షిత బ్యాంకింగ్',
      'auth.login': 'లాగిన్',
      'auth.register': 'రిజిస్టర్',
      'auth.username': 'యూజర్ పేరు',
      'auth.password': 'పాస్‌వర్డ్',
      'auth.phoneNumber': 'ఫోన్ నంబర్',
      'auth.accountNumber': 'ఖాతా నంబర్',
      'auth.confirmPassword': 'పాస్‌వర్డ్ ధృవీకరించండి',
      'auth.createAccount': 'ఖాతా సృష్టించండి',
      'auth.switchToLogin': 'ఇప్పటికే ఖాతా ఉందా? లాగిన్',
      'auth.switchToRegister': 'ఖాతా లేదా? రిజిస్టర్',
      
      // Home/Dashboard
      'home.welcomeBack': 'తిరిగి స్వాగతం',
      'home.accountBalance': 'ఖాతా బ్యాలెన్స్',
      'home.currency': '₹',
      'home.lastUpdated': 'చివరిసారి అప్‌డేట్',
      'home.quickActions': 'త్వరిత చర్యలు',
      'home.sendMoney': 'డబ్బు పంపండి',
      'home.requestMoney': 'డబ్బు అడగండి',
      'home.payBills': 'బిల్లులు చెల్లించండి',
      'home.recentTransactions': 'ఇటీవలి లావాదేవీలు',
      'home.viewAll': 'అన్నింటినీ చూడండి',
      'home.noTransactions': 'ఇటీవలి లావాదేవీలు లేవు',
      
      // Security
      'security.title': 'భద్రతా కేంద్రం',
      'security.fraudAlerts': 'మోసం హెచ్చరికలు',
      'security.noAlerts': 'చురుకైన మోసం హెచ్చరికలు లేవు',
      'security.deviceSecurity': 'పరికర భద్రత',
      'security.trustedDevices': 'విశ్వసనీయ పరికరాలు',
      'security.securityScore': 'భద్రతా స్కోర్',
      'security.dismiss': 'తోసివేయండి',
      'security.investigate': 'దర్యాప్తు చేయండి',
      
      'common.loading': 'లోడ్ అవుతోంది...',
      'common.error': 'ఒక దోషం జరిగింది',
      'common.success': 'విజయం',
      'common.language': 'భాష',
      'common.selectLanguage': 'భాష ఎంచుకోండి',
      
      'rural.agentAssisted': 'ఏజెంట్ సహాయక లావాదేవీ',
      'rural.offlineCapable': 'ఆఫ్‌లైన్‌లో పని చేస్తుంది',
      'rural.simSwapAlert': 'సిమ్ కార్డ్ మార్పు గుర్తించబడింది'
    }
  },
  gu: {
    translation: {
      // Navigation  
      'nav.home': 'હોમ',
      'nav.transactions': 'વ્યવહારો',
      'nav.security': 'સુરક્ષા',
      'nav.logout': 'લૉગ આઉટ',
      
      // Authentication
      'auth.welcome': 'ગ્રામીણ બેંકિંગમાં આપનું સ્વાગત છે',
      'auth.subtitle': 'ગ્રામીણ સમુદાયો માટે સુરક્ષિત બેંકિંગ',
      'auth.login': 'લૉગિન',
      'auth.register': 'નોંધણી',
      'auth.username': 'વપરાશકર્તા નામ',
      'auth.password': 'પાસવર્ડ',
      'auth.phoneNumber': 'ફોન નંબર',
      'auth.accountNumber': 'ખાતા નંબર',
      'auth.confirmPassword': 'પાસવર્ડની પુષ્ટિ કરો',
      'auth.createAccount': 'ખાતું બનાવો',
      'auth.switchToLogin': 'પહેલેથી ખાતું છે? લૉગિન',
      'auth.switchToRegister': 'ખાતું નથી? નોંધણી',
      
      // Home/Dashboard
      'home.welcomeBack': 'પાછા આવવા બદલ સ્વાગત',
      'home.accountBalance': 'ખાતાની બેલેન્સ',
      'home.currency': '₹',
      'home.lastUpdated': 'છેલ્લે અપડેટ થયું',
      'home.quickActions': 'ઝડપી ક્રિયાઓ',
      'home.sendMoney': 'પૈસા મોકલો',
      'home.requestMoney': 'પૈસા માંગો',
      'home.payBills': 'બિલ ચૂકવો',
      'home.recentTransactions': 'તાજેતરના વ્યવહારો',
      'home.viewAll': 'બધું જુઓ',
      'home.noTransactions': 'કોઈ તાજેતરના વ્યવહારો નથી',
      
      // Security
      'security.title': 'સુરક્ષા કેન્દ્ર',
      'security.fraudAlerts': 'છેતરપિંડી ચેતવણીઓ',
      'security.noAlerts': 'કોઈ સક્રિય છેતરપિંડી ચેતવણીઓ નથી',
      'security.deviceSecurity': 'ઉપકરણ સુરક્ષા',
      'security.trustedDevices': 'વિશ્વસનીય ઉપકરણો',
      'security.securityScore': 'સુરક્ષા સ્કોર',
      'security.dismiss': 'નકારો',
      'security.investigate': 'તપાસ કરો',
      
      'common.loading': 'લોડ થઈ રહ્યું છે...',
      'common.error': 'એક ભૂલ આવી',
      'common.success': 'સફળતા',
      'common.language': 'ભાષા',
      'common.selectLanguage': 'ભાષા પસંદ કરો',
      
      'rural.agentAssisted': 'એજન્ટ સહાયિત વ્યવહાર',
      'rural.offlineCapable': 'ઑફલાઇન કામ કરે છે',
      'rural.simSwapAlert': 'સિમ કાર્ડ બદલાવ જાણવા મળ્યું'
    }
  },
  pa: {
    translation: {
      // Navigation  
      'nav.home': 'ਘਰ',
      'nav.transactions': 'ਲੈਣ-ਦੇਣ',
      'nav.security': 'ਸੁਰੱਖਿਆ',
      'nav.logout': 'ਲਾਗ ਆਊਟ',
      
      // Authentication
      'auth.welcome': 'ਪਿੰਡੀ ਬੈਂਕਿੰਗ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ',
      'auth.subtitle': 'ਪਿੰਡੀ ਭਾਈਚਾਰਿਆਂ ਲਈ ਸੁਰੱਖਿਤ ਬੈਂਕਿੰਗ',
      'auth.login': 'ਲਾਗਇਨ',
      'auth.register': 'ਰਜਿਸਟਰ',
      'auth.username': 'ਯੂਜ਼ਰ ਨਾਮ',
      'auth.password': 'ਪਾਸਵਰਡ',
      'auth.phoneNumber': 'ਫ਼ੋਨ ਨੰਬਰ',
      'auth.accountNumber': 'ਖਾਤਾ ਨੰਬਰ',
      'auth.confirmPassword': 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
      'auth.createAccount': 'ਖਾਤਾ ਬਣਾਓ',
      'auth.switchToLogin': 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ? ਲਾਗਇਨ',
      'auth.switchToRegister': 'ਖਾਤਾ ਨਹੀਂ ਹੈ? ਰਜਿਸਟਰ',
      
      // Home/Dashboard
      'home.welcomeBack': 'ਵਾਪਸ ਆਉਣ ਲਈ ਸਵਾਗਤ',
      'home.accountBalance': 'ਖਾਤਾ ਬਕਾਇਆ',
      'home.currency': '₹',
      'home.lastUpdated': 'ਆਖਰੀ ਵਾਰ ਅੱਪਡੇਟ',
      'home.quickActions': 'ਤੇਜ਼ ਕਾਰਵਾਈਆਂ',
      'home.sendMoney': 'ਪੈਸੇ ਭੇਜੋ',
      'home.requestMoney': 'ਪੈਸੇ ਮੰਗੋ',
      'home.payBills': 'ਬਿੱਲ ਭਰੋ',
      'home.recentTransactions': 'ਹਾਲ ਦੇ ਲੈਣ-ਦੇਣ',
      'home.viewAll': 'ਸਭ ਵੇਖੋ',
      'home.noTransactions': 'ਕੋਈ ਹਾਲ ਦੇ ਲੈਣ-ਦੇਣ ਨਹੀਂ',
      
      // Security
      'security.title': 'ਸੁਰੱਖਿਆ ਕੇਂਦਰ',
      'security.fraudAlerts': 'ਧੋਖਾਧੜੀ ਚੇਤਾਵਨੀਆਂ',
      'security.noAlerts': 'ਕੋਈ ਸਰਗਰਮ ਧੋਖਾਧੜੀ ਚੇਤਾਵਨੀਆਂ ਨਹੀਂ',
      'security.deviceSecurity': 'ਡਿਵਾਇਸ ਸੁਰੱਖਿਆ',
      'security.trustedDevices': 'ਭਰੋਸੇਮੰਦ ਡਿਵਾਇਸ',
      'security.securityScore': 'ਸੁਰੱਖਿਆ ਸਕੋਰ',
      'security.dismiss': 'ਰੱਦ ਕਰੋ',
      'security.investigate': 'ਜਾਂਚ ਕਰੋ',
      
      'common.loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      'common.error': 'ਇੱਕ ਗਲਤੀ ਹੋਈ',
      'common.success': 'ਸਫਲਤਾ',
      'common.language': 'ਭਾਸ਼ਾ',
      'common.selectLanguage': 'ਭਾਸ਼ਾ ਚੁਣੋ',
      
      'rural.agentAssisted': 'ਏਜੰਟ ਸਹਾਇਤਾ ਲੈਣ-ਦੇਣ',
      'rural.offlineCapable': 'ਔਫਲਾਇਨ ਕੰਮ ਕਰਦਾ ਹੈ',
      'rural.simSwapAlert': 'ਸਿਮ ਕਾਰਡ ਤਬਦੀਲੀ ਪਤਾ ਲਗਾਈ ਗਈ'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;