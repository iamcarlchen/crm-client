import { Button, Card, Form, Input, Modal, Space, Table, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useCrm } from '../store/CrmProvider'
import type { CustomerDto } from '../api/types'

type CustomerForm = Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>

export function CustomersPage() {
  const { customers, createCustomer, updateCustomer, deleteCustomer } = useCrm()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerDto | null>(null)
  const [form] = Form.useForm<CustomerForm>()

  const data = useMemo(() => customers, [customers])

  const columns = useMemo(
    () => [
      { title: '客户名称', dataIndex: 'name', key: 'name' },
      { title: '行业', dataIndex: 'industry', key: 'industry' },
      {
        title: '等级',
        dataIndex: 'level',
        key: 'level',
        render: (v: CustomerDto['level']) => {
          const color = v === 'A' ? 'red' : v === 'B' ? 'gold' : 'green'
          return <Tag color={color}>{v}</Tag>
        },
      },
      { title: '电话', dataIndex: 'phone', key: 'phone' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '负责人', dataIndex: 'owner', key: 'owner' },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, row: CustomerDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  name: row.name,
                  industry: row.industry,
                  level: row.level,
                  phone: row.phone,
                  email: row.email,
                  address: row.address,
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
                  title: '确认删除该客户？',
                  content: row.name,
                  okText: '删除',
                  okButtonProps: { danger: true },
                  cancelText: '取消',
                  onOk: () => deleteCustomer(row.id),
                })
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [form, deleteCustomer],
  )

  function resetModal() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const values = await form.validateFields()

    if (editing) {
      await updateCustomer(editing.id, values)
      resetModal()
      return
    }

    await createCustomer(values)
    resetModal()
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          客户信息管理
        </Typography.Title>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增客户
        </Button>
      </Space>

      <Card>
        <Table rowKey="id" columns={columns as any} dataSource={data} />
      </Card>

      <Modal
        title={editing ? '编辑客户' : '新增客户'}
        open={open}
        onCancel={resetModal}
        onOk={onSubmit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="客户名称" rules={[{ required: true }]}>
            <Input placeholder="例如：海狮科技" />
          </Form.Item>
          <Form.Item name="industry" label="行业">
            <Input placeholder="例如：SaaS" />
          </Form.Item>
          <Form.Item name="level" label="等级" rules={[{ required: true }]}>
            <Input placeholder="A/B/C" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
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
