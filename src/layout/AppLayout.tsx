import { useMemo, useState, type PropsWithChildren, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUserDisplayName, isAdmin, logout } from '../lib/auth'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { useTranslation } from 'react-i18next'
import {
  AppstoreOutlined,
  BankOutlined,
  ContactsOutlined,
  FileTextOutlined,
  LineChartOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Drawer, Grid, Layout, Menu, Typography, theme } from 'antd'

const { Header, Sider, Content } = Layout

const MENU_KEYS = {
  dashboard: '/dashboard',
  customers: '/customers',
  orders: '/orders',
  visits: '/visits',
  finance: '/finance',
  spot: '/spot',
  articles: '/articles',
  employees: '/employees',
} as const

export function AppLayout({ children }: PropsWithChildren) {
  const { token } = theme.useToken()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const menuItems = useMemo(() => {
    const items: { key: string; icon: ReactNode; label: ReactNode }[] = [
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
      {
        key: MENU_KEYS.spot,
        icon: <LineChartOutlined />,
        label: <Link to={MENU_KEYS.spot}>{t('nav.spot')}</Link>,
      },
    ]

    if (isAdmin()) {
      items.push({
        key: MENU_KEYS.employees,
        icon: <TeamOutlined />,
        label: <Link to={MENU_KEYS.employees}>{t('nav.employees')}</Link>,
      })
    }

    return items
  }, [t])

  const selectedKeys = useMemo(() => {
    const path = location.pathname
    const exact = menuItems.find((x) => x.key === path)
    if (exact) return [exact.key]
    const prefix = menuItems.find((x) => path.startsWith(x.key))
    return prefix ? [prefix.key] : [MENU_KEYS.dashboard]
  }, [location.pathname, menuItems])

  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md // xs/sm

  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sideMenu = (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      items={menuItems}
      onClick={(e) => {
        navigate(e.key)
        setDrawerOpen(false)
      }}
      style={{ borderRight: 0 }}
    />
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile ? (
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
            <Typography.Title level={5} style={{ margin: 0, whiteSpace: 'nowrap' }}>
              {t('app.title')}
            </Typography.Title>
          </div>
          {sideMenu}
        </Sider>
      ) : (
        <Drawer
          title={t('app.title')}
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0 }}
        >
          {sideMenu}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: isMobile ? '0 12px' : '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {isMobile ? (
              <Button
                type="text"
                aria-label="menu"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            ) : null}
            <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('app.tagline')}
            </Typography.Text>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <LanguageSwitch />
            {!isMobile ? (
              <Typography.Text>
                {t('app.user')}：{getUserDisplayName()}
              </Typography.Text>
            ) : null}
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

        <Content style={{ padding: isMobile ? 12 : 16, background: token.colorBgLayout }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
