export type SpotSymbol = 'BTC/USDT'

export type Ticker = {
  symbol: SpotSymbol
  last: number
  change24hPct: number
  high24h: number
  low24h: number
  vol24h: number // base asset volume
  ts: number
}

export type OrderBookLevel = { price: number; qty: number }
export type OrderBook = { bids: OrderBookLevel[]; asks: OrderBookLevel[]; ts: number }

export type Trade = {
  id: string
  side: 'buy' | 'sell'
  price: number
  qty: number
  ts: number
}

export type SpotOrder = {
  id: string
  symbol: SpotSymbol
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  price?: number
  qty: number
  status: 'OPEN' | 'FILLED' | 'CANCELED'
  filledQty: number
  avgPrice?: number
  createdAt: number
  updatedAt: number
}

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function round(n: number, d: number) {
  const p = Math.pow(10, d)
  return Math.round(n * p) / p
}

export function createMockSpotFeed(symbol: SpotSymbol = 'BTC/USDT') {
  // Start around a realistic-ish BTC price.
  let last = 85600
  let open24h = last * (1 - 0.02)
  let high24h = last
  let low24h = last
  let vol24h = 0

  let trades: Trade[] = []
  let orderBook: OrderBook = { bids: [], asks: [], ts: Date.now() }

  // Simple candle-less random walk + microstructure.
  function tick() {
    const ts = Date.now()

    const drift = rnd(-0.35, 0.35)
    const jump = Math.random() < 0.02 ? rnd(-25, 25) : 0
    last = Math.max(1, last + drift + jump)

    high24h = Math.max(high24h, last)
    low24h = Math.min(low24h, last)

    // trades
    const tradeCount = Math.floor(rnd(2, 6))
    for (let i = 0; i < tradeCount; i++) {
      const side: Trade['side'] = Math.random() > 0.5 ? 'buy' : 'sell'
      const price = round(last + rnd(-2.5, 2.5), 2)
      const qty = round(rnd(0.0005, 0.03), 6)
      vol24h += qty
      trades.unshift({ id: id('t'), side, price, qty, ts: ts - i * 120 })
    }
    trades = trades.slice(0, 60)

    // order book around last
    const levels = 18
    const bids: OrderBookLevel[] = []
    const asks: OrderBookLevel[] = []
    for (let i = 1; i <= levels; i++) {
      const step = 1 + i * 0.8
      bids.push({ price: round(last - step, 2), qty: round(rnd(0.01, 0.35), 6) })
      asks.push({ price: round(last + step, 2), qty: round(rnd(0.01, 0.35), 6) })
    }
    orderBook = { bids, asks, ts }

    const change24hPct = ((last - open24h) / open24h) * 100

    const ticker: Ticker = {
      symbol,
      last: round(last, 2),
      change24hPct: round(change24hPct, 2),
      high24h: round(high24h, 2),
      low24h: round(low24h, 2),
      vol24h: round(vol24h, 4),
      ts,
    }

    return { ticker, orderBook, trades }
  }

  function reset24hAnchor() {
    open24h = last
    high24h = last
    low24h = last
    vol24h = 0
  }

  // Seed initial data
  for (let i = 0; i < 5; i++) tick()

  return {
    symbol,
    getSnapshot: () => {
      const { ticker, orderBook: ob, trades: tr } = tick()
      return { ticker, orderBook: ob, trades: tr }
    },
    reset24hAnchor,
  }
}

const ORDERS_KEY = 'crm:spot:orders'

export function loadOrders(): SpotOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? (JSON.parse(raw) as SpotOrder[]) : []
  } catch {
    return []
  }
}

export function saveOrders(orders: SpotOrder[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function placeOrder(params: {
  symbol: SpotSymbol
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  qty: number
  price?: number
  lastPrice: number
}): SpotOrder {
  const now = Date.now()
  const o: SpotOrder = {
    id: id('o'),
    symbol: params.symbol,
    side: params.side,
    type: params.type,
    price: params.type === 'limit' ? params.price : undefined,
    qty: params.qty,
    status: 'OPEN',
    filledQty: 0,
    createdAt: now,
    updatedAt: now,
  }

  // Market fills immediately
  if (params.type === 'market') {
    o.status = 'FILLED'
    o.filledQty = o.qty
    o.avgPrice = params.lastPrice
    o.updatedAt = now
  }

  return o
}

export function tryFillLimitOrders(orders: SpotOrder[], lastPrice: number): SpotOrder[] {
  const now = Date.now()
  return orders.map((o) => {
    if (o.status !== 'OPEN' || o.type !== 'limit' || !o.price) return o

    // Very simple fill condition: buy fills when last <= price, sell fills when last >= price
    const canFill = o.side === 'buy' ? lastPrice <= o.price : lastPrice >= o.price
    if (!canFill) return o

    return {
      ...o,
      status: 'FILLED',
      filledQty: o.qty,
      avgPrice: lastPrice,
      updatedAt: now,
    }
  })
}

export function cancelOrder(orders: SpotOrder[], id: string): SpotOrder[] {
  const now = Date.now()
  return orders.map((o) =>
    o.id === id && o.status === 'OPEN' ? { ...o, status: 'CANCELED', updatedAt: now } : o,
  )
}

export function splitOrders(orders: SpotOrder[]) {
  const open = orders.filter((o) => o.status === 'OPEN')
  const history = orders.filter((o) => o.status !== 'OPEN')
  return { open, history }
}
