// Language context provider
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.predict': { en: 'Predict', hi: 'भविष्यवाणी' },
  'nav.about': { en: 'About', hi: 'हमारे बारे में' },
  'nav.admin': { en: 'Admin', hi: 'प्रशासन' },
  'nav.login': { en: 'Login', hi: 'लॉगिन' },
  
  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', hi: 'वापसी पर स्वागत है' },
  'dashboard.happening': { en: "Here's what's happening on your farm today.", hi: 'आज आपके खेत में यह हो रहा है।' },
  'dashboard.quickPredict': { en: 'Quick Predict', hi: 'त्वरित भविष्यवाणी' },
  'dashboard.currentWeather': { en: 'Current Weather', hi: 'वर्तमान मौसम' },
  'dashboard.weatherDesc': { en: 'Real-time weather conditions for your location', hi: 'आपके स्थान के लिए वास्तविक समय मौसम की स्थिति' },
  'dashboard.temperature': { en: 'Temperature', hi: 'तापमान' },
  'dashboard.humidity': { en: 'Humidity', hi: 'आर्द्रता' },
  'dashboard.windSpeed': { en: 'Wind Speed', hi: 'हवा की गति' },
  'dashboard.conditions': { en: 'Conditions', hi: 'स्थितियां' },
  'dashboard.recentPredictions': { en: 'Recent Predictions', hi: 'हाल की भविष्यवाणियां' },
  'dashboard.recentPredictionsDesc': { en: 'Your latest crop disease analyses', hi: 'आपके नवीनतम फसल रोग विश्लेषण' },
  'dashboard.newPrediction': { en: 'New Prediction', hi: 'नई भविष्यवाणी' },
  'dashboard.weatherAlerts': { en: 'Weather Alerts', hi: 'मौसम चेतावनी' },
  'dashboard.weatherAlertsDesc': { en: 'Important weather notifications', hi: 'महत्वपूर्ण मौसम सूचनाएं' },
  'dashboard.seasonalTips': { en: 'Seasonal Tips', hi: 'मौसमी सुझाव' },
  'dashboard.seasonalTipsDesc': { en: 'Expert farming advice for this season', hi: 'इस मौसम के लिए विशेषज्ञ कृषि सलाह' },
  
  // Predict
  'predict.title': { en: 'AI Disease Prediction', hi: 'AI रोग भविष्यवाणी' },
  'predict.description': { en: 'Upload an image of your crop to get instant disease diagnosis and treatment recommendations', hi: 'तुरंत रोग निदान और उपचार सिफारिशें प्राप्त करने के लिए अपनी फसल की एक छवि अपलोड करें' },
  'predict.chooseCrop': { en: 'Choose Crop Type', hi: 'फसल प्रकार चुनें' },
  'predict.selectCrop': { en: 'Select crop type', hi: 'फसल प्रकार चुनें' },
  'predict.uploadImage': { en: 'Upload Crop Image', hi: 'फसल छवि अपलोड करें' },
  'predict.dragDrop': { en: 'Drag and drop an image here, or click to select', hi: 'यहां एक छवि खींचें और छोड़ें, या चुनने के लिए क्लिक करें' },
  'predict.analyzing': { en: 'Analyzing image...', hi: 'छवि का विश्लेषण कर रहे हैं...' },
  'predict.predictDisease': { en: 'Predict Disease', hi: 'रोग की भविष्यवाणी करें' },
  'predict.tips': { en: 'Tips for better results', hi: 'बेहतर परिणामों के लिए सुझाव' },
  'predict.tip1': { en: 'Take clear, well-lit photos', hi: 'स्पष्ट, अच्छी तरह से प्रकाशित फोटो लें' },
  'predict.tip2': { en: 'Focus on affected areas', hi: 'प्रभावित क्षेत्रों पर ध्यान दें' },
  'predict.tip3': { en: 'Capture close-up details', hi: 'क्लोज-अप विवरण कैप्चर करें' },
  'predict.results': { en: 'Prediction Results', hi: 'भविष्यवाणी परिणाम' },
  'predict.confidence': { en: 'Confidence', hi: 'आत्मविश्वास' },
  'predict.symptoms': { en: 'Symptoms', hi: 'लक्षण' },
  'predict.treatments': { en: 'Recommended Treatments', hi: 'अनुशंसित उपचार' },
  'predict.preventiveTips': { en: 'Preventive Tips', hi: 'निवारक सुझाव' },
  'predict.newAnalysis': { en: 'New Analysis', hi: 'नया विश्लेषण' },
  
  // Admin
  'admin.title': { en: 'Admin Dashboard', hi: 'प्रशासन डैशबोर्ड' },
  'admin.description': { en: 'System overview and statistics', hi: 'सिस्टम अवलोकन और आंकड़े' },
  'admin.totalUsers': { en: 'Total Users', hi: 'कुल उपयोगकर्ता' },
  'admin.totalPredictions': { en: 'Total Predictions', hi: 'कुल भविष्यवाणियां' },
  'admin.avgConfidence': { en: 'Avg Confidence', hi: 'औसत आत्मविश्वास' },
  'admin.predictionsOverTime': { en: 'Predictions Over Time', hi: 'समय के साथ भविष्यवाणियां' },
  'admin.dailyPredictions': { en: 'Daily predictions trend for the past week', hi: 'पिछले सप्ताह के लिए दैनिक भविष्यवाणी रुझान' },
  'admin.date': { en: 'Date', hi: 'तारीख' },
  'admin.predictions': { en: 'Predictions', hi: 'भविष्यवाणियां' },
  
  // About
  'about.title': { en: 'AgriAidAI', hi: 'एग्रीएड AI' },
  'about.subtitle': { en: 'Empowering farmers worldwide with AI-driven crop disease detection and smart agricultural insights.', hi: 'AI-संचालित फसल रोग का पता लगाने और स्मार्ट कृषि अंतर्दृष्टि के साथ दुनिया भर के किसानों को सशक्त बनाना।' },
  'about.mission': { en: 'Our Mission', hi: 'हमारा मिशन' },
  'about.supportFarmers': { en: 'Support Farmers', hi: 'किसानों का समर्थन करें' },
  'about.protectCrops': { en: 'Protect Crops', hi: 'फसलों की रक्षा करें' },
  'about.driveInnovation': { en: 'Drive Innovation', hi: 'नवाचार को बढ़ावा दें' },
  'about.whyChoose': { en: 'Why Choose AgriAidAI?', hi: 'एग्रीएड AI क्यों चुनें?' },
  'about.technology': { en: 'About Our Technology', hi: 'हमारी तकनीक के बारे में' },
  'about.commitment': { en: 'Our Commitment', hi: 'हमारी प्रतिबद्धता' },
  'about.farmerSupport': { en: 'Farmer Support', hi: 'किसान समर्थन' },
  'about.contactSupport': { en: 'Contact Support', hi: 'समर्थन से संपर्क करें' },
  'about.helpCenter': { en: 'Visit Help Center', hi: 'सहायता केंद्र पर जाएं' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
