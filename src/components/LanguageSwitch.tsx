import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { setLang } from '../i18n'

export function LanguageSwitch() {
  const { i18n } = useTranslation()

  return (
    <Select
      size="small"
      value={(i18n.language as any) ?? 'zh'}
      style={{ width: 110 }}
      options={[
        { value: 'zh', label: '中文' },
        { value: 'en', label: 'English' },
      ]}
      onChange={(v) => setLang(v)}
    />
  )
}
