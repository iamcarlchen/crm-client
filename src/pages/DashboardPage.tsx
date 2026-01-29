import { Card, Col, Row, Statistic, Typography } from 'antd'
import { useMemo } from 'react'
import { useCrm } from '../store/CrmProvider'

export function DashboardPage() {
  const { customers, orders, finance } = useCrm()

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
        概览
      </Typography.Title>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="客户数" value={customers.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="订单数" value={orders.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="订单总额" value={sums.totalOrder} precision={2} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="待开票" value={sums.pendingInvoice} precision={2} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="最近拜访（示例数据）">
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              你可以在「拜访记录」里新增/编辑/删除记录；当前数据保存在浏览器 localStorage。
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="财务回款（示例数据）">
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              已回款：{sums.donePayment.toFixed(2)}；待开票：{sums.pendingInvoice.toFixed(2)}。
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
