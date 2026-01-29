import { Area } from '@ant-design/plots'
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Grid,
  InputNumber,
  Row,
  Segmented,
  Slider,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  cancelOrder,
  createMockSpotFeed,
  loadOrders,
  placeOrder,
  saveOrders,
  splitOrders,
  tryFillLimitOrders,
  type SpotOrder,
  type SpotSymbol,
  type Ticker,
  type Trade,
} from '../lib/spotMock'

type OrderForm = {
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  price?: number
  qty: number
}

function fmtNum(n: number, d = 2) {
  return Number.isFinite(n) ? n.toFixed(d) : '-'
}

function fmtTs(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export function SpotPage() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const symbol: SpotSymbol = 'BTC/USDT'

  const feedRef = useRef(createMockSpotFeed(symbol))

  const [ticker, setTicker] = useState<Ticker>(() => feedRef.current.getSnapshot().ticker)
  const [orderBook, setOrderBook] = useState(() => feedRef.current.getSnapshot().orderBook)
  const [trades, setTrades] = useState<Trade[]>(() => feedRef.current.getSnapshot().trades)

  const [orders, setOrders] = useState<SpotOrder[]>(() => loadOrders())

  // mini price series for chart (mock)
  const [series, setSeries] = useState<{ t: string; price: number }[]>(() => {
    const now = Date.now()
    return Array.from({ length: 60 }).map((_, i) => ({
      t: fmtTs(now - (60 - i) * 1000),
      price: ticker.last,
    }))
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      const snap = feedRef.current.getSnapshot()
      setTicker(snap.ticker)
      setOrderBook(snap.orderBook)
      setTrades(snap.trades)

      setSeries((prev) => {
        const next = [...prev, { t: fmtTs(snap.ticker.ts), price: snap.ticker.last }]
        return next.slice(-120)
      })

      setOrders((prev) => {
        const next = tryFillLimitOrders(prev, snap.ticker.last)
        if (next !== prev) saveOrders(next)
        return next
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  const { open: openOrders, history: orderHistory } = useMemo(() => splitOrders(orders), [orders])

  const changeColor = ticker.change24hPct >= 0 ? 'green' : 'red'

  const [form] = Form.useForm<OrderForm>()
  const [placing, setPlacing] = useState(false)
  const [orderTab, setOrderTab] = useState<'open' | 'history'>('open')

  async function submit() {
    const v = await form.validateFields()
    setPlacing(true)
    try {
      const o = placeOrder({
        symbol,
        side: v.side,
        type: v.type,
        qty: v.qty,
        price: v.type === 'limit' ? v.price : undefined,
        lastPrice: ticker.last,
      })

      setOrders((prev) => [o, ...prev].slice(0, 200))

      // reset qty only
      form.setFieldsValue({ qty: 0.01 })
    } finally {
      setPlacing(false)
    }
  }

  const bookColumns = useMemo(
    () => [
      {
        title: 'Price(USDT)',
        dataIndex: 'price',
        key: 'price',
        render: (v: number, row: any) => (
          <Typography.Text style={{ color: row.__side === 'bid' ? '#0a7' : '#c03' }}>
            {fmtNum(v, 2)}
          </Typography.Text>
        ),
      },
      { title: 'Amount(BTC)', dataIndex: 'qty', key: 'qty', render: (v: number) => fmtNum(v, 6) },
    ],
    [],
  )

  const tradeColumns = useMemo(
    () => [
      { title: 'Time', dataIndex: 'ts', key: 'ts', render: (v: number) => fmtTs(v) },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: (v: number, row: Trade) => (
          <Typography.Text style={{ color: row.side === 'buy' ? '#0a7' : '#c03' }}>
            {fmtNum(v, 2)}
          </Typography.Text>
        ),
      },
      { title: 'Qty', dataIndex: 'qty', key: 'qty', render: (v: number) => fmtNum(v, 6) },
      {
        title: 'Side',
        dataIndex: 'side',
        key: 'side',
        render: (v: Trade['side']) => <Tag color={v === 'buy' ? 'green' : 'red'}>{v.toUpperCase()}</Tag>,
      },
    ],
    [],
  )

  const orderColumns = useMemo(
    () => [
      { title: 'Time', dataIndex: 'createdAt', key: 'createdAt', render: (v: number) => fmtTs(v) },
      { title: 'Symbol', dataIndex: 'symbol', key: 'symbol' },
      {
        title: 'Side',
        dataIndex: 'side',
        key: 'side',
        render: (v: SpotOrder['side']) => <Tag color={v === 'buy' ? 'green' : 'red'}>{v.toUpperCase()}</Tag>,
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (v: SpotOrder['type']) => <Tag>{v.toUpperCase()}</Tag>,
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: (v: number | undefined, row: SpotOrder) => (row.type === 'market' ? 'MKT' : fmtNum(v ?? 0, 2)),
      },
      { title: 'Qty', dataIndex: 'qty', key: 'qty', render: (v: number) => fmtNum(v, 6) },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (v: SpotOrder['status']) => {
          const color = v === 'OPEN' ? 'blue' : v === 'FILLED' ? 'green' : 'default'
          return <Tag color={color}>{v}</Tag>
        },
      },
      {
        title: 'Action',
        key: 'action',
        render: (_: any, row: SpotOrder) =>
          row.status === 'OPEN' ? (
            <Button size="small" danger onClick={() => setOrders((prev) => cancelOrder(prev, row.id))}>
              Cancel
            </Button>
          ) : null,
      },
    ],
    [],
  )

  const mergedBids = useMemo(() => orderBook.bids.map((x) => ({ ...x, __side: 'bid' })), [orderBook.bids])
  const mergedAsks = useMemo(() => orderBook.asks.map((x) => ({ ...x, __side: 'ask' })), [orderBook.asks])

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
            {symbol} Spot
          </Typography.Title>
          <Typography.Text type="secondary">Mock spot trading UI</Typography.Text>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 0, color: changeColor }}>
            {fmtNum(ticker.last, 2)}
          </Typography.Title>
          <Typography.Text style={{ color: changeColor }}>
            {ticker.change24hPct >= 0 ? '+' : ''}
            {fmtNum(ticker.change24hPct, 2)}%
          </Typography.Text>
        </div>
      </Space>

      <Row gutter={12}>
        <Col xs={24} lg={16}>
          <Card style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col xs={12} md={6}>
                <Typography.Text type="secondary">24h High</Typography.Text>
                <div>{fmtNum(ticker.high24h, 2)}</div>
              </Col>
              <Col xs={12} md={6}>
                <Typography.Text type="secondary">24h Low</Typography.Text>
                <div>{fmtNum(ticker.low24h, 2)}</div>
              </Col>
              <Col xs={12} md={6}>
                <Typography.Text type="secondary">24h Vol (BTC)</Typography.Text>
                <div>{fmtNum(ticker.vol24h, 4)}</div>
              </Col>
              <Col xs={12} md={6}>
                <Typography.Text type="secondary">Last update</Typography.Text>
                <div>{fmtTs(ticker.ts)}</div>
              </Col>
            </Row>
          </Card>

          <Card title="Chart" style={{ marginBottom: 12 }}>
            {/* @ant-design/plots has slightly different prop typings between chart types;
                cast to any to keep TS strict mode happy. */}
            <Area
              {...({
                height: 280,
                data: series,
                xField: 't',
                yField: 'price',
                tooltip: { showMarkers: false },
                axis: { x: { tickCount: isMobile ? 4 : 8 } },
                area: { style: { fillOpacity: 0.2 } },
                line: { style: { stroke: '#1677ff' } },
              } as any)}
            />
          </Card>

          <Card title="Orders">
            <Segmented
              value={orderTab}
              onChange={(v) => setOrderTab(v as any)}
              options={[
                { label: `Open (${openOrders.length})`, value: 'open' },
                { label: `History (${orderHistory.length})`, value: 'history' },
              ]}
              style={{ marginBottom: 12 }}
            />

            <Table
              rowKey="id"
              size={isMobile ? 'small' : 'middle'}
              scroll={isMobile ? { x: 820 } : undefined}
              columns={orderColumns as any}
              dataSource={orderTab === 'open' ? openOrders : orderHistory}
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Spot" style={{ marginBottom: 12 }}>
            <Form<OrderForm>
              form={form}
              layout="vertical"
              initialValues={{ side: 'buy', type: 'limit', price: ticker.last, qty: 0.01 }}
            >
              <Form.Item name="side" label="Side" rules={[{ required: true }]}>
                <Segmented options={[{ label: 'Buy', value: 'buy' }, { label: 'Sell', value: 'sell' }]} />
              </Form.Item>

              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Segmented options={[{ label: 'Limit', value: 'limit' }, { label: 'Market', value: 'market' }]} />
              </Form.Item>

              <Form.Item shouldUpdate noStyle>
                {() => {
                  const type = form.getFieldValue('type') as OrderForm['type']
                  return type === 'limit' ? (
                    <Form.Item
                      name="price"
                      label="Price (USDT)"
                      rules={[{ required: true, message: 'Price required for limit order' }]}
                    >
                      <InputNumber style={{ width: '100%' }} min={1} precision={2} />
                    </Form.Item>
                  ) : (
                    <div style={{ marginBottom: 12 }}>
                      <Typography.Text type="secondary">Price</Typography.Text>
                      <div>Market ({fmtNum(ticker.last, 2)})</div>
                    </div>
                  )
                }}
              </Form.Item>

              <Form.Item name="qty" label="Amount (BTC)" rules={[{ required: true, message: 'Amount required' }]}>
                <InputNumber style={{ width: '100%' }} min={0.0001} step={0.0001} precision={6} />
              </Form.Item>

              <Form.Item shouldUpdate noStyle>
                {() => {
                  const qty = Number(form.getFieldValue('qty') || 0)
                  const type = form.getFieldValue('type') as OrderForm['type']
                  const price = type === 'limit' ? Number(form.getFieldValue('price') || 0) : ticker.last
                  const total = qty * price
                  return (
                    <>
                      <Slider
                        min={0}
                        max={100}
                        step={25}
                        value={Math.min(100, Math.max(0, Math.round((qty / 0.04) * 100)))}
                        onChange={(p) => form.setFieldsValue({ qty: Math.max(0.0001, (Number(p) / 100) * 0.04) })}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Typography.Text type="secondary">Est. Total</Typography.Text>
                        <Typography.Text>{fmtNum(total, 2)} USDT</Typography.Text>
                      </div>
                    </>
                  )
                }}
              </Form.Item>

              <Button type="primary" block loading={placing} onClick={() => void submit()}>
                Place Order
              </Button>
            </Form>

            <Divider style={{ margin: '12px 0' }} />
            <Typography.Text type="secondary">Balances (mock)</Typography.Text>
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Card size="small">
                  <Typography.Text type="secondary">USDT</Typography.Text>
                  <div>10,000.00</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Typography.Text type="secondary">BTC</Typography.Text>
                  <div>0.250000</div>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card title="Order Book" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={12}>
                <Typography.Text type="secondary">Asks</Typography.Text>
                <Table
                  rowKey={(r) => `a_${r.price}`}
                  size="small"
                  columns={bookColumns as any}
                  dataSource={mergedAsks}
                  pagination={false}
                  scroll={{ y: 260 }}
                />
              </Col>
              <Col span={12}>
                <Typography.Text type="secondary">Bids</Typography.Text>
                <Table
                  rowKey={(r) => `b_${r.price}`}
                  size="small"
                  columns={bookColumns as any}
                  dataSource={mergedBids}
                  pagination={false}
                  scroll={{ y: 260 }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="Trades">
            <Table
              rowKey="id"
              size="small"
              columns={tradeColumns as any}
              dataSource={trades}
              pagination={false}
              scroll={{ y: 260 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
