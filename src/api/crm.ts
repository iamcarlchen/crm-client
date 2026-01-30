import { api } from './http'
import type { CustomerDto, EmployeeDto, FinanceRecordDto, NewsDto, OrderDto, VisitDto } from './types'

export const crmApi = {
  customers: {
    list: () => api<CustomerDto[]>('/customers'),
    create: (payload: Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>) =>
      api<CustomerDto>('/customers', { method: 'POST', json: payload }),
    update: (id: number, payload: Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>) =>
      api<CustomerDto>(`/customers/${id}`, { method: 'PUT', json: payload }),
    remove: (id: number) => api<void>(`/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => api<OrderDto[]>('/orders'),
    create: (payload: { customerId: number; title: string; amount: number; status: string }) =>
      api<OrderDto>('/orders', { method: 'POST', json: payload }),
    update: (
      id: number,
      payload: { customerId: number; title: string; amount: number; status: string },
    ) => api<OrderDto>(`/orders/${id}`, { method: 'PUT', json: payload }),
    remove: (id: number) => api<void>(`/orders/${id}`, { method: 'DELETE' }),
  },
  visits: {
    list: () => api<VisitDto[]>('/visits'),
    create: (payload: {
      customerId: number
      date: string
      method: string
      summary: string
      nextAction?: string
      owner?: string
    }) => api<VisitDto>('/visits', { method: 'POST', json: payload }),
    update: (
      id: number,
      payload: {
        customerId: number
        date: string
        method: string
        summary: string
        nextAction?: string
        owner?: string
      },
    ) => api<VisitDto>(`/visits/${id}`, { method: 'PUT', json: payload }),
    remove: (id: number) => api<void>(`/visits/${id}`, { method: 'DELETE' }),
  },
  finance: {
    list: () => api<FinanceRecordDto[]>('/finance-records'),
    create: (payload: {
      customerId: number
      type: string
      amount: number
      date: string
      status: string
      note?: string
    }) => api<FinanceRecordDto>('/finance-records', { method: 'POST', json: payload }),
    update: (
      id: number,
      payload: {
        customerId: number
        type: string
        amount: number
        date: string
        status: string
        note?: string
      },
    ) => api<FinanceRecordDto>(`/finance-records/${id}`, { method: 'PUT', json: payload }),
    remove: (id: number) => api<void>(`/finance-records/${id}`, { method: 'DELETE' }),
  },
  employees: {
    list: () => api<EmployeeDto[]>('/employees'),
    create: (payload: Omit<EmployeeDto, 'id' | 'createdAt' | 'updatedAt'>) =>
      api<EmployeeDto>('/employees', { method: 'POST', json: payload }),
    update: (id: number, payload: Omit<EmployeeDto, 'id' | 'createdAt' | 'updatedAt'>) =>
      api<EmployeeDto>(`/employees/${id}`, { method: 'PUT', json: payload }),
    remove: (id: number) => api<void>(`/employees/${id}`, { method: 'DELETE' }),
  },
  news: {
    list: (status?: string) =>
      api<NewsDto[]>(status ? `/news?status=${encodeURIComponent(status)}` : '/news'),
    create: (payload: Omit<NewsDto, 'id' | 'createdAt' | 'updatedAt'>) =>
      api<NewsDto>('/news', { method: 'POST', json: payload }),
    update: (id: number, payload: Omit<NewsDto, 'id' | 'createdAt' | 'updatedAt'>) =>
      api<NewsDto>(`/news/${id}`, { method: 'PUT', json: payload }),
    remove: (id: number) => api<void>(`/news/${id}`, { method: 'DELETE' }),
  },
}
