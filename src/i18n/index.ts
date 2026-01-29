import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './zh'
import en from './en'

const LANG_KEY = 'crm.lang'

export function getInitialLang(): 'zh' | 'en' {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved === 'en' || saved === 'zh') return saved
  const nav = navigator.language?.toLowerCase() ?? ''
  return nav.startsWith('zh') ? 'zh' : 'en'
}

export function setLang(lang: 'zh' | 'en') {
  localStorage.setItem(LANG_KEY, lang)
  i18n.changeLanguage(lang)
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    lng: getInitialLang(),
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
  })

export default i18n
