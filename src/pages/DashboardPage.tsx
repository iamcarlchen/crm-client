import { Card, Col, Row, Statistic, Typography } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCrm } from '../store/CrmProvider'

export function DashboardPage() {
  const { customers, orders, finance } = useCrm()
  const { t } = useTranslation()

  const sums = useMemo(() => {
    const totalOrder = orders.reduce((acc, o) => acc + o.amount, 0)
    const pendingInvoice = finance
      .filter((f) => f.type === 'invoice' && f.status === 'pending')
      .reduce((acc, f) => acc + f.amount, 0)
    const donePayment = finance
      .filter((f) => f.type === 'payment' && f.status === 'done')
      .reduce((acc, f) => acc + f.amount, 0)

    return { totalOrder, pendingInvoice, donePayment }
  }, [finance, orders])

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('dashboard.title')}
      </Typography.Title>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t('dashboard.customersCount')} value={customers.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t('dashboard.ordersCount')} value={orders.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t('dashboard.ordersTotal')} value={sums.totalOrder} precision={2} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t('dashboard.pendingInvoice')} value={sums.pendingInvoice} precision={2} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title={t('dashboard.recentVisits')}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {t('dashboard.hint')}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={t('dashboard.financeSummary')}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {t('dashboard.received')}：{sums.donePayment.toFixed(2)}；{t('dashboard.pending')}：
              {sums.pendingInvoice.toFixed(2)}。
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
