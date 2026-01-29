import type { Customer, FinanceRecord, Order, Visit } from '../types'

export const seedCustomers: Customer[] = [
  {
    id: 'c_001',
    name: '海狮科技',
    industry: 'SaaS',
    level: 'A',
    phone: '+65 8108 1846',
    email: 'contact@sealions.example',
    address: 'Singapore',
    owner: 'Carl',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-20',
  },
  {
    id: 'c_002',
    name: '星河贸易',
    industry: 'Trading',
    level: 'B',
    phone: '+65 6123 4567',
    email: 'sales@milkyway.example',
    address: 'Singapore',
    owner: 'Carl',
    createdAt: '2026-01-05',
    updatedAt: '2026-01-18',
  },
]

export const seedOrders: Order[] = [
  {
    id: 'o_1001',
    customerId: 'c_001',
    customerName: '海狮科技',
    title: 'CRM 前端实施（一期）',
    amount: 18000,
    status: 'confirmed',
    createdAt: '2026-01-10',
  },
  {
    id: 'o_1002',
    customerId: 'c_002',
    customerName: '星河贸易',
    title: 'BI 报表定制',
    amount: 6800,
    status: 'draft',
    createdAt: '2026-01-22',
  },
]

export const seedVisits: Visit[] = [
  {
    id: 'v_9001',
    customerId: 'c_001',
    customerName: '海狮科技',
    date: '2026-01-12',
    method: 'onsite',
    summary: '确认一期范围：客户管理/订单/拜访/财务；对接方式后续定。',
    nextAction: '输出 PRD + 页面原型',
    owner: 'Carl',
  },
  {
    id: 'v_9002',
    customerId: 'c_002',
    customerName: '星河贸易',
    date: '2026-01-24',
    method: 'call',
    summary: '了解现有流程，确认需要付款节点提醒。',
    nextAction: '发报价单 + timeline',
    owner: 'Carl',
  },
]

export const seedFinance: FinanceRecord[] = [
  {
    id: 'f_7001',
    customerId: 'c_001',
    customerName: '海狮科技',
    type: 'invoice',
    amount: 18000,
    date: '2026-01-15',
    status: 'pending',
    note: '待客户确认 PO 后开票',
  },
  {
    id: 'f_7002',
    customerId: 'c_002',
    customerName: '星河贸易',
    type: 'payment',
    amount: 3000,
    date: '2026-01-26',
    status: 'done',
    note: '预付款',
  },
]
