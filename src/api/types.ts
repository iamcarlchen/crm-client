export type CustomerDto = {
  id: number
  name: string
  industry?: string
  level: 'A' | 'B' | 'C'
  phone?: string
  email?: string
  address?: string
  owner?: string
  createdAt?: string
  updatedAt?: string
}

export type OrderDto = {
  id: number
  customerId: number
  customerName: string
  title: string
  amount: number
  status: string
  createdAt?: string
}

export type VisitDto = {
  id: number
  customerId: number
  customerName: string
  date: string
  method: string
  summary: string
  nextAction?: string
  owner?: string
}

export type FinanceRecordDto = {
  id: number
  customerId: number
  customerName: string
  type: string
  amount: number
  date: string
  status: string
  note?: string
}
