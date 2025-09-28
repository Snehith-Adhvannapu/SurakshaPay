export const INDIAN_LANGUAGES = {
  'en': { name: 'English', nativeName: 'English', script: 'Latin' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  'bn': { name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  'te': { name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  'mr': { name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  'ta': { name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  'ur': { name: 'Urdu', nativeName: 'اردو', script: 'Arabic' },
  'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  'kn': { name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  'ml': { name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  'or': { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia' },
  'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  'as': { name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali' },
  'ks': { name: 'Kashmiri', nativeName: 'कॉशुर', script: 'Devanagari' },
  'sd': { name: 'Sindhi', nativeName: 'सिन्धी', script: 'Devanagari' },
  'ne': { name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari' },
  'sa': { name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari' },
  'mai': { name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari' },
  'bho': { name: 'Bhojpuri', nativeName: 'भोजपुरी', script: 'Devanagari' },
  'kok': { name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari' },
  'mni': { name: 'Manipuri', nativeName: 'মৈতৈলোন্', script: 'Bengali' },
  'sat': { name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki' }
};

export type LanguageCode = keyof typeof INDIAN_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';