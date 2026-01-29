import { Button, Card, Form, Input, Typography } from 'antd'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../lib/auth'

type LoginForm = {
  user: string
  password: string
}

export function LoginPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()

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
          登录
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          这是前端 Demo 登录页（未接后端）。随便输入账号密码即可进入。
        </Typography.Paragraph>

        <Form<LoginForm>
          layout="vertical"
          initialValues={{ user: 'Carl', password: '123456' }}
          onFinish={onFinish}
        >
          <Form.Item name="user" label="用户名" rules={[{ required: true }]}>
            <Input autoFocus placeholder="例如：Carl" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password placeholder="任意" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}
