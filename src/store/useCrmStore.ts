import { useEffect, useMemo, useState } from 'react'
import type { Customer, FinanceRecord, Order, Visit } from '../types'
import { loadJson, saveJson } from '../lib/storage'
import { seedCustomers, seedFinance, seedOrders, seedVisits } from '../lib/seed'

export function useCrmStore() {
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadJson('crm.customers', seedCustomers),
  )
  const [orders, setOrders] = useState<Order[]>(() => loadJson('crm.orders', seedOrders))
  const [visits, setVisits] = useState<Visit[]>(() => loadJson('crm.visits', seedVisits))
  const [finance, setFinance] = useState<FinanceRecord[]>(() =>
    loadJson('crm.finance', seedFinance),
  )

  useEffect(() => saveJson('crm.customers', customers), [customers])
  useEffect(() => saveJson('crm.orders', orders), [orders])
  useEffect(() => saveJson('crm.visits', visits), [visits])
  useEffect(() => saveJson('crm.finance', finance), [finance])

  const customerIndex = useMemo(() => {
    const m = new Map<string, Customer>()
    customers.forEach((c) => m.set(c.id, c))
    return m
  }, [customers])

  return {
    customers,
    setCustomers,
    orders,
    setOrders,
    visits,
    setVisits,
    finance,
    setFinance,
    customerIndex,
  }
}
