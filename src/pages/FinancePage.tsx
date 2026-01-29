import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import { CustomerSelect } from '../components/CustomerSelect'
import { useCrm } from '../store/CrmProvider'
import type { FinanceRecordDto } from '../api/types'

type FinanceForm = {
  customerId: number
  type: string
  amount: number
  date: string
  status: string
  note?: string
}

const typeColor: Record<string, string> = {
  invoice: 'blue',
  payment: 'green',
  refund: 'red',
}

const statusColor: Record<string, string> = {
  pending: 'gold',
  done: 'green',
}

export function FinancePage() {
  const { customers, finance, createFinance, updateFinance, deleteFinance } = useCrm()

  const [filterType, setFilterType] = useState<string | 'all'>('all')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceRecordDto | null>(null)
  const [form] = Form.useForm<FinanceForm>()

  const data = useMemo(() => {
    const arr = [...finance].sort((a, b) => (a.date < b.date ? 1 : -1))
    if (filterType === 'all') return arr
    return arr.filter((r) => r.type === filterType)
  }, [filterType, finance])

  const columns = useMemo(
    () => [
      { title: '日期', dataIndex: 'date', key: 'date' },
      { title: '客户', dataIndex: 'customerName', key: 'customerName' },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        render: (v: string) => <Tag color={typeColor[v] ?? 'default'}>{v}</Tag>,
      },
      {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (v: number) => v.toFixed(2),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (v: string) => <Tag color={statusColor[v] ?? 'default'}>{v}</Tag>,
      },
      { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, row: FinanceRecordDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  customerId: row.customerId,
                  type: row.type,
                  amount: row.amount,
                  date: row.date,
                  status: row.status,
                  note: row.note,
                })
                setOpen(true)
              }}
            >
              编辑
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确认删除该财务记录？',
                  content: `${row.customerName} · ${row.type} · ${row.amount}`,
                  okText: '删除',
                  okButtonProps: { danger: true },
                  cancelText: '取消',
                  onOk: () => deleteFinance(row.id),
                })
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [deleteFinance, form],
  )

  function resetModal() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const values = await form.validateFields()

    if (editing) {
      await updateFinance(editing.id, values)
      resetModal()
      return
    }

    await createFinance(values)
    resetModal()
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          财务记录
        </Typography.Title>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增记录
        </Button>
      </Space>

      <Card>
        <Space style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary">筛选类型：</Typography.Text>
          <Segmented
            value={filterType}
            onChange={(v) => setFilterType(v as any)}
            options={['all', 'invoice', 'payment', 'refund']}
          />
        </Space>
        <Table rowKey="id" columns={columns as any} dataSource={data} />
      </Card>

      <Modal
        title={editing ? '编辑财务记录' : '新增财务记录'}
        open={open}
        onCancel={resetModal}
        onOk={onSubmit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ type: 'invoice', status: 'pending' }}>
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <CustomerSelect customers={customers} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Input placeholder="invoice/payment/refund" />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Input placeholder="pending/done" />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
