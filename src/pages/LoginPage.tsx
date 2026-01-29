import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth'
import { decodeJwt, setAuth } from '../lib/auth'

type LoginForm = {
  user: string
  password: string
}

export function LoginPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const next = useMemo(() => {
    const n = sp.get('next')
    return n ? decodeURIComponent(n) : '/dashboard'
  }, [sp])

  async function onFinish(values: LoginForm) {
    if (!values.user || !values.password) return

    setLoading(true)
    try {
      const res = await authApi.login({ username: values.user, password: values.password })
      const token = res.token ?? res.accessToken ?? res.access_token
      if (!token) throw new Error('Missing token in /auth/login response')

      const payload = decodeJwt<{ username?: string; role?: string }>(token)

      setAuth({
        token,
        loggedInAt: new Date().toISOString(),
        user: {
          username: res.user?.username ?? payload?.username ?? values.user,
          role: res.user?.role ?? payload?.role,
        },
      })

      navigate(next, { replace: true })
    } catch {
      message.error(t('login.failed'))
    } finally {
      setLoading(false)
    }
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

        <Form<LoginForm> layout="vertical" initialValues={{ user: '', password: '' }} onFinish={onFinish}>
          <Form.Item name="user" label={t('login.username')} rules={[{ required: true }]}>
            <Input autoFocus placeholder="carl" />
          </Form.Item>
          <Form.Item name="password" label={t('login.password')} rules={[{ required: true }]}>
            <Input.Password placeholder="" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('login.button')}
          </Button>
        </Form>
      </Card>
    </div>
  )
}
