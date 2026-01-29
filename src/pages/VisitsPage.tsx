import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import { CustomerSelect } from '../components/CustomerSelect'
import { uid } from '../lib/id'
import { useCrm } from '../store/CrmProvider'
import type { Visit } from '../types'

type VisitForm = {
  customerId: string
  date: string
  method: Visit['method']
  summary: string
  nextAction?: string
  owner?: string
}

const methodColor: Record<Visit['method'], string> = {
  call: 'blue',
  onsite: 'green',
  online: 'purple',
}

export function VisitsPage() {
  const { customers, customerIndex, visits, setVisits } = useCrm()

  const [filterMethod, setFilterMethod] = useState<Visit['method'] | 'all'>('all')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Visit | null>(null)
  const [form] = Form.useForm<VisitForm>()

  const data = useMemo(() => {
    const arr = [...visits].sort((a, b) => (a.date < b.date ? 1 : -1))
    if (filterMethod === 'all') return arr
    return arr.filter((v) => v.method === filterMethod)
  }, [filterMethod, visits])

  const columns = useMemo(
    () => [
      { title: '日期', dataIndex: 'date', key: 'date' },
      { title: '客户', dataIndex: 'customerName', key: 'customerName' },
      {
        title: '方式',
        dataIndex: 'method',
        key: 'method',
        render: (v: Visit['method']) => <Tag color={methodColor[v]}>{v}</Tag>,
      },
      {
        title: '摘要',
        dataIndex: 'summary',
        key: 'summary',
        ellipsis: true,
      },
      {
        title: '下一步',
        dataIndex: 'nextAction',
        key: 'nextAction',
        ellipsis: true,
      },
      { title: '负责人', dataIndex: 'owner', key: 'owner' },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, row: Visit) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  customerId: row.customerId,
                  date: row.date,
                  method: row.method,
                  summary: row.summary,
                  nextAction: row.nextAction,
                  owner: row.owner,
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
                  title: '确认删除该拜访记录？',
                  content: `${row.customerName} · ${row.date}`,
                  okText: '删除',
                  okButtonProps: { danger: true },
                  cancelText: '取消',
                  onOk: () => setVisits(visits.filter((v) => v.id !== row.id)),
                })
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [form, setVisits, visits],
  )

  function resetModal() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const values = await form.validateFields()
    const customer = customerIndex.get(values.customerId)
    if (!customer) throw new Error('customer not found')

    if (editing) {
      setVisits(
        visits.map((v) =>
          v.id === editing.id
            ? {
                ...v,
                ...values,
                customerName: customer.name,
              }
            : v,
        ),
      )
      resetModal()
      return
    }

    const next: Visit = {
      id: uid('v_'),
      customerId: values.customerId,
      customerName: customer.name,
      date: values.date,
      method: values.method,
      summary: values.summary,
      nextAction: values.nextAction,
      owner: values.owner,
    }

    setVisits([next, ...visits])
    resetModal()
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          拜访记录
        </Typography.Title>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增拜访
        </Button>
      </Space>

      <Card>
        <Space style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary">筛选方式：</Typography.Text>
          <Segmented
            value={filterMethod}
            onChange={(v) => setFilterMethod(v as any)}
            options={['all', 'call', 'onsite', 'online']}
          />
        </Space>
        <Table rowKey="id" columns={columns as any} dataSource={data} />
      </Card>

      <Modal
        title={editing ? '编辑拜访记录' : '新增拜访记录'}
        open={open}
        onCancel={resetModal}
        onOk={onSubmit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ method: 'call' }}>
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <CustomerSelect customers={customers} />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="method" label="方式" rules={[{ required: true }]}>
            <Input placeholder="call/onsite/online" />
          </Form.Item>
          <Form.Item name="summary" label="摘要" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="nextAction" label="下一步">
            <Input />
          </Form.Item>
          <Form.Item name="owner" label="负责人">
            <Input placeholder="例如：Carl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
