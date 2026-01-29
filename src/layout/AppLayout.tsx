import { useMemo, useState, type PropsWithChildren } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuth, logout } from '../lib/auth'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { useTranslation } from 'react-i18next'
import {
  AppstoreOutlined,
  BankOutlined,
  ContactsOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, Typography, theme } from 'antd'

const { Header, Sider, Content } = Layout

const MENU_KEYS = {
  dashboard: '/dashboard',
  customers: '/customers',
  orders: '/orders',
  visits: '/visits',
  finance: '/finance',
} as const

export function AppLayout({ children }: PropsWithChildren) {
  const { token } = theme.useToken()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const menuItems = useMemo(
    () => [
      {
        key: MENU_KEYS.dashboard,
        icon: <AppstoreOutlined />,
        label: <Link to={MENU_KEYS.dashboard}>{t('nav.dashboard')}</Link>,
      },
      {
        key: MENU_KEYS.customers,
        icon: <ContactsOutlined />,
        label: <Link to={MENU_KEYS.customers}>{t('nav.customers')}</Link>,
      },
      {
        key: MENU_KEYS.orders,
        icon: <ShoppingCartOutlined />,
        label: <Link to={MENU_KEYS.orders}>{t('nav.orders')}</Link>,
      },
      {
        key: MENU_KEYS.visits,
        icon: <FileTextOutlined />,
        label: <Link to={MENU_KEYS.visits}>{t('nav.visits')}</Link>,
      },
      {
        key: MENU_KEYS.finance,
        icon: <BankOutlined />,
        label: <Link to={MENU_KEYS.finance}>{t('nav.finance')}</Link>,
      },
    ],
    [t],
  )

  const selectedKeys = useMemo(() => {
    const path = location.pathname
    const exact = menuItems.find((x) => x.key === path)
    if (exact) return [exact.key]
    const prefix = menuItems.find((x) => path.startsWith(x.key))
    return prefix ? [prefix.key] : [MENU_KEYS.dashboard]
  }, [location.pathname, menuItems])

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
            {t('app.title')}
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
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
          <Typography.Text type="secondary">{t('app.tagline')}</Typography.Text>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <LanguageSwitch />
            <Typography.Text>
              {t('app.user')}：{getAuth()?.user ?? '-'}
            </Typography.Text>
            <Button
              size="small"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              {t('app.logout')}
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
