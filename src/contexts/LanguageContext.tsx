import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

type Language = 'en' | 'ur'

type Translations = {
  [key: string]: {
    en: string
    ur: string
  }
}

const translations: Translations = {
  appName: { en: 'Safaakar', ur: 'صفاکار' },
  login: { en: 'Login', ur: 'لاگ ان' },
  signup: { en: 'Sign Up', ur: 'سائن اپ' },
  email: { en: 'Email', ur: 'ای میل' },
  password: { en: 'Password', ur: 'پاس ورڈ' },
  address: { en: 'Address', ur: 'پتہ' },
  role: { en: 'Role', ur: 'کردار' },
  resident: { en: 'Resident', ur: 'رہائشی' },
  supervisor: { en: 'Supervisor', ur: 'نگران' },
  logout: { en: 'Logout', ur: 'لاگ آؤٹ' },
  home: { en: 'Home', ur: 'ہوم' },
  reports: { en: 'Reports', ur: 'رپورٹیں' },
  education: { en: 'Education', ur: 'تعلیم' },
  myScore: { en: 'My Score', ur: 'میرا سکور' },
  dashboard: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  todayPickup: { en: "Today's Trash Pickup", ur: 'آج کا کچرا اٹھانا' },
  markCollected: { en: 'Mark as Collected', ur: 'جمع شدہ کے طور پر نشان زد کریں' },
  collected: { en: 'Collected', ur: 'جمع' },
  pending: { en: 'Pending', ur: 'زیر التواء' },
  reportIssue: { en: 'Report Issue', ur: 'مسئلہ کی رپورٹ کریں' },
  uploadPhoto: { en: 'Upload Photo', ur: 'تصویر اپ لوڈ کریں' },
  comment: { en: 'Comment', ur: 'تبصرہ' },
  submitReport: { en: 'Submit Report', ur: 'رپورٹ جمع کروائیں' },
  residentDashboard: { en: 'Resident Dashboard', ur: 'رہائشی ڈیش بورڈ' },
  supervisorDashboard: { en: 'Supervisor Dashboard', ur: 'نگران ڈیش بورڈ' },
  allResidents: { en: 'All Residents', ur: 'تمام رہائشی' },
  status: { en: 'Status', ur: 'حیثیت' },
  issueReported: { en: 'Issue Reported', ur: 'مسئلہ کی رپورٹ' },
  viewPhoto: { en: 'View Photo', ur: 'تصویر دیکھیں' },
  markResolved: { en: 'Mark Resolved', ur: 'حل شدہ نشان زد کریں' },
  open: { en: 'Open', ur: 'کھلا' },
  resolved: { en: 'Resolved', ur: 'حل ہو گیا' },
  carbonFootprint: { en: 'How to Reduce Your Carbon Footprint', ur: 'اپنے کارbon فوٹ پرنٹ کو کیسے کم کریں' },
  complianceScore: { en: 'Your Compliance Score', ur: 'آپ کا تعمیل سکور' },
  collectedDays: { en: 'Collected Days', ur: 'جمع شدہ دن' },
  totalDays: { en: 'Total Days', ur: 'کل دن' },
  score: { en: 'Score', ur: 'سکور' },
  filter: { en: 'Filter', ur: 'فلٹر' },
  all: { en: 'All', ur: 'تمام' },
  yes: { en: 'Yes', ur: 'ہاں' },
  no: { en: 'No', ur: 'نہیں' },
  reportedIssues: { en: 'Reported Issues', ur: 'رپورٹ شدہ مسائل' },
  language: { en: 'Language', ur: 'زبان' },
  supervisorCode: { en: 'Supervisor Code', ur: 'نگران کوڈ' },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile, user } = useAuth()
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (profile?.language) {
      setLanguageState(profile.language)
    }
  }, [profile])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)

    if (user) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', user.id)
    }
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
