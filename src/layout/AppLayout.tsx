import { useMemo, useState, type PropsWithChildren } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuth, logout } from '../lib/auth'
import {
  AppstoreOutlined,
  BankOutlined,
  ContactsOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, Typography, theme } from 'antd'

const { Header, Sider, Content } = Layout

const MENU_ITEMS = [
  { key: '/dashboard', icon: <AppstoreOutlined />, label: <Link to="/dashboard">概览</Link> },
  { key: '/customers', icon: <ContactsOutlined />, label: <Link to="/customers">客户信息</Link> },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: <Link to="/orders">订单管理</Link> },
  { key: '/visits', icon: <FileTextOutlined />, label: <Link to="/visits">拜访记录</Link> },
  { key: '/finance', icon: <BankOutlined />, label: <Link to="/finance">财务记录</Link> },
]

export function AppLayout({ children }: PropsWithChildren) {
  const { token } = theme.useToken()
  const location = useLocation()
  const navigate = useNavigate()

  const selectedKeys = useMemo(() => {
    const path = location.pathname
    const exact = MENU_ITEMS.find((x) => x.key === path)
    if (exact) return [exact.key]
    const prefix = MENU_ITEMS.find((x) => path.startsWith(x.key))
    return prefix ? [prefix.key] : ['/dashboard']
  }, [location.pathname])

  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light">
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            CRM
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={MENU_ITEMS}
          onClick={(e) => navigate(e.key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography.Text type="secondary">TY · CRM 前端 Demo</Typography.Text>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Typography.Text>
              用户：{getAuth()?.user ?? '未登录'}
            </Typography.Text>
            <Button
              size="small"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              退出
            </Button>
          </div>
        </Header>
        <Content style={{ padding: 16, background: token.colorBgLayout }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
