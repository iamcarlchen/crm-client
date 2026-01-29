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
import type { OrderDto } from '../api/types'

type OrderForm = {
  customerId: number
  title: string
  amount: number
  status: string
}

const statusColor: Record<string, string> = {
  draft: 'default',
  confirmed: 'blue',
  delivered: 'green',
  cancelled: 'red',
}

export function OrdersPage() {
  const { customers, orders, createOrder, updateOrder, deleteOrder } = useCrm()

  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<OrderDto | null>(null)
  const [form] = Form.useForm<OrderForm>()

  const data = useMemo(() => {
    const arr = [...orders]
    if (filterStatus === 'all') return arr
    return arr.filter((o) => o.status === filterStatus)
  }, [filterStatus, orders])

  const columns = useMemo(
    () => [
      { title: '订单标题', dataIndex: 'title', key: 'title' },
      { title: '客户', dataIndex: 'customerName', key: 'customerName' },
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
      { title: '创建日期', dataIndex: 'createdAt', key: 'createdAt' },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, row: OrderDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  customerId: row.customerId,
                  title: row.title,
                  amount: row.amount,
                  status: row.status,
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
                  title: '确认删除该订单？',
                  content: `${row.customerName} · ${row.title}`,
                  okText: '删除',
                  okButtonProps: { danger: true },
                  cancelText: '取消',
                  onOk: () => deleteOrder(row.id),
                })
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [form, deleteOrder],
  )

  function resetModal() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const values = await form.validateFields()

    if (editing) {
      await updateOrder(editing.id, {
        customerId: values.customerId,
        title: values.title,
        amount: values.amount,
        status: values.status,
      })
      resetModal()
      return
    }

    await createOrder({
      customerId: values.customerId,
      title: values.title,
      amount: values.amount,
      status: values.status,
    })

    resetModal()
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          订单管理
        </Typography.Title>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增订单
        </Button>
      </Space>

      <Card>
        <Space style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary">筛选状态：</Typography.Text>
          <Segmented
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as any)}
            options={['all', 'draft', 'confirmed', 'delivered', 'cancelled']}
          />
        </Space>
        <Table rowKey="id" columns={columns as any} dataSource={data} />
      </Card>

      <Modal
        title={editing ? '编辑订单' : '新增订单'}
        open={open}
        onCancel={resetModal}
        onOk={onSubmit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'draft' }}>
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <CustomerSelect customers={customers} />
          </Form.Item>
          <Form.Item name="title" label="订单标题" rules={[{ required: true }]}>
            <Input placeholder="例如：CRM 前端实施（一期）" />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Input placeholder="draft/confirmed/delivered/cancelled" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
