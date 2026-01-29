import { Button, Card, Form, Input, Typography } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../lib/auth'

type LoginForm = {
  user: string
  password: string
}

export function LoginPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const next = useMemo(() => {
    const n = sp.get('next')
    return n ? decodeURIComponent(n) : '/dashboard'
  }, [sp])

  async function onFinish(values: LoginForm) {
    // Demo only: accept any non-empty user/password.
    if (!values.user || !values.password) return
    login(values.user)
    navigate(next, { replace: true })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 420 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {t('login.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary">{t('login.subtitle')}</Typography.Paragraph>

        <Form<LoginForm>
          layout="vertical"
          initialValues={{ user: 'Carl', password: '123456' }}
          onFinish={onFinish}
        >
          <Form.Item name="user" label={t('login.username')} rules={[{ required: true }]}>
            <Input autoFocus placeholder="Carl" />
          </Form.Item>
          <Form.Item name="password" label={t('login.password')} rules={[{ required: true }]}>
            <Input.Password placeholder="" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {t('login.button')}
          </Button>
        </Form>
      </Card>
    </div>
  )
}
