export type Customer = {
  id: string
  name: string
  industry?: string
  level: 'A' | 'B' | 'C'
  phone?: string
  email?: string
  address?: string
  owner?: string
  createdAt: string // ISO date
  updatedAt: string // ISO date
}

export type Order = {
  id: string
  customerId: string
  customerName: string
  title: string
  amount: number
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled'
  createdAt: string
}

export type Visit = {
  id: string
  customerId: string
  customerName: string
  date: string
  method: 'call' | 'onsite' | 'online'
  summary: string
  nextAction?: string
  owner?: string
}

export type FinanceRecord = {
  id: string
  customerId: string
  customerName: string
  type: 'invoice' | 'payment' | 'refund'
  amount: number
  date: string
  status: 'pending' | 'done'
  note?: string
}
