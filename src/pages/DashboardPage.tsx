import { Line } from '@ant-design/plots'
import { Card, Col, Row, Statistic, Typography } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCrm } from '../store/CrmProvider'

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function ymKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

// (removed unused helper)

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

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

  const monthSeries = useMemo(() => {
    const now = new Date()
    const month = ymKey(now)
    const dim = daysInMonth(now)

    // init full month buckets for smooth charts
    const customerIncr = new Map<string, number>()
    const income = new Map<string, number>()
    for (let i = 1; i <= dim; i++) {
      const key = `${month}-${pad2(i)}`
      customerIncr.set(key, 0)
      income.set(key, 0)
    }

    // customers: group by createdAt day (ISO string)
    customers.forEach((c) => {
      if (!c.createdAt) return
      const day = String(c.createdAt).slice(0, 10) // YYYY-MM-DD
      if (day.startsWith(month)) customerIncr.set(day, (customerIncr.get(day) ?? 0) + 1)
    })

    // finance income: payment + done, group by date (YYYY-MM-DD)
    finance
      .filter((f) => f.type === 'payment' && f.status === 'done')
      .forEach((f) => {
        const day = String(f.date).slice(0, 10)
        if (!day.startsWith(month)) return
        income.set(day, (income.get(day) ?? 0) + (Number(f.amount) || 0))
      })

    const customersData = Array.from(customerIncr.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, value]) => ({ date, value }))

    const incomeData = Array.from(income.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, value]) => ({ date, value }))

    return { month, customersData, incomeData }
  }, [customers, finance])

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
        <Col xs={24} lg={12}>
          <Card title={`${t('dashboard.monthlyCustomerIncr')} (${monthSeries.month})`}>
            <Line
              height={260}
              data={monthSeries.customersData}
              xField="date"
              yField="value"
              smooth
              tooltip={{ showMarkers: false }}
              xAxis={{ tickCount: 6 }}
              yAxis={{ min: 0 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={`${t('dashboard.monthlyIncome')} (${monthSeries.month})`}>
            <Line
              height={260}
              data={monthSeries.incomeData}
              xField="date"
              yField="value"
              smooth
              tooltip={{ showMarkers: false }}
              xAxis={{ tickCount: 6 }}
              yAxis={{ min: 0 }}
            />
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
