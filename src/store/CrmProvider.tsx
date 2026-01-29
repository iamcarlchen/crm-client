import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { crmApi } from '../api/crm'
import type { CustomerDto, FinanceRecordDto, OrderDto, VisitDto } from '../api/types'

export type CrmStore = {
  customers: CustomerDto[]
  orders: OrderDto[]
  visits: VisitDto[]
  finance: FinanceRecordDto[]

  refreshAll: () => Promise<void>

  createCustomer: (payload: Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCustomer: (id: number, payload: Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>

  createOrder: (payload: { customerId: number; title: string; amount: number; status: string }) => Promise<void>
  updateOrder: (id: number, payload: { customerId: number; title: string; amount: number; status: string }) => Promise<void>
  deleteOrder: (id: number) => Promise<void>

  createVisit: (payload: { customerId: number; date: string; method: string; summary: string; nextAction?: string; owner?: string }) => Promise<void>
  updateVisit: (id: number, payload: { customerId: number; date: string; method: string; summary: string; nextAction?: string; owner?: string }) => Promise<void>
  deleteVisit: (id: number) => Promise<void>

  createFinance: (payload: { customerId: number; type: string; amount: number; date: string; status: string; note?: string }) => Promise<void>
  updateFinance: (id: number, payload: { customerId: number; type: string; amount: number; date: string; status: string; note?: string }) => Promise<void>
  deleteFinance: (id: number) => Promise<void>

  customerIndex: Map<number, CustomerDto>
}

const Ctx = createContext<CrmStore | null>(null)

export function CrmProvider({ children }: PropsWithChildren) {
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [visits, setVisits] = useState<VisitDto[]>([])
  const [finance, setFinance] = useState<FinanceRecordDto[]>([])

  async function refreshAll() {
    // Fetch independently so one broken endpoint doesn't blank the whole app.
    const results = await Promise.allSettled([
      crmApi.customers.list(),
      crmApi.orders.list(),
      crmApi.visits.list(),
      crmApi.finance.list(),
    ])

    const [c, o, v, f] = results

    if (c.status === 'fulfilled') setCustomers(c.value)
    if (o.status === 'fulfilled') setOrders(o.value)
    if (v.status === 'fulfilled') setVisits(v.value)
    if (f.status === 'fulfilled') setFinance(f.value)

    // If any failed (401 / backend down / endpoint error), keep existing state for that slice.
  }

  useEffect(() => {
    void refreshAll()
  }, [])

  const customerIndex = useMemo(() => {
    const m = new Map<number, CustomerDto>()
    customers.forEach((c) => m.set(c.id, c))
    return m
  }, [customers])

  const store: CrmStore = {
    customers,
    orders,
    visits,
    finance,

    refreshAll,

    createCustomer: async (payload) => {
      await crmApi.customers.create(payload)
      await refreshAll()
    },
    updateCustomer: async (id, payload) => {
      await crmApi.customers.update(id, payload)
      await refreshAll()
    },
    deleteCustomer: async (id) => {
      await crmApi.customers.remove(id)
      await refreshAll()
    },

    createOrder: async (payload) => {
      await crmApi.orders.create(payload)
      await refreshAll()
    },
    updateOrder: async (id, payload) => {
      await crmApi.orders.update(id, payload)
      await refreshAll()
    },
    deleteOrder: async (id) => {
      await crmApi.orders.remove(id)
      await refreshAll()
    },

    createVisit: async (payload) => {
      await crmApi.visits.create(payload)
      await refreshAll()
    },
    updateVisit: async (id, payload) => {
      await crmApi.visits.update(id, payload)
      await refreshAll()
    },
    deleteVisit: async (id) => {
      await crmApi.visits.remove(id)
      await refreshAll()
    },

    createFinance: async (payload) => {
      await crmApi.finance.create(payload)
      await refreshAll()
    },
    updateFinance: async (id, payload) => {
      await crmApi.finance.update(id, payload)
      await refreshAll()
    },
    deleteFinance: async (id) => {
      await crmApi.finance.remove(id)
      await refreshAll()
    },

    customerIndex,
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useCrm() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCrm must be used within <CrmProvider>')
  return v
}
