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
      'security.fraudAlerts': 'Fraud Alerts',
      'security.noAlerts': 'No active fraud alerts',
      'security.deviceSecurity': 'Device Security',
      'security.trustedDevices': 'Trusted Devices',
      'security.securityScore': 'Security Score',
      'security.dismiss': 'Dismiss',
      'security.investigate': 'Investigate',
      
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
      'security.fraudAlerts': 'धोखाधड़ी अलर्ट',
      'security.noAlerts': 'कोई सक्रिय धोखाधड़ी अलर्ट नहीं',
      'security.deviceSecurity': 'डिवाइस सुरक्षा',
      'security.trustedDevices': 'विश्वसनीय डिवाइस',
      'security.securityScore': 'सुरक्षा स्कोर',
      'security.dismiss': 'खारिज करें',
      'security.investigate': 'जांच करें',
      
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
  }
  // Additional languages can be added here - for demo, I'm showing EN and HI
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