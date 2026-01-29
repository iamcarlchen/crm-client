import { Button, Card, Form, Input, Modal, Space, Table, Tag, Typography, message, type TableColumnsType } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmployeeDto } from '../api/types'
import { crmApi } from '../api/crm'

type EmployeeForm = Omit<EmployeeDto, 'id' | 'createdAt' | 'updatedAt'>

export function EmployeesPage() {
  const { t } = useTranslation()

  const [employees, setEmployees] = useState<EmployeeDto[]>([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EmployeeDto | null>(null)
  const [form] = Form.useForm<EmployeeForm>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await crmApi.employees.list()
      setEmployees(list)
    } catch {
      message.error(t('employees.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const data = useMemo(() => employees, [employees])

  const columns = useMemo<TableColumnsType<EmployeeDto>>(
    () => [
      { title: t('employees.name'), dataIndex: 'name', key: 'name' },
      { title: t('employees.email'), dataIndex: 'email', key: 'email' },
      { title: t('employees.phone'), dataIndex: 'phone', key: 'phone' },
      {
        title: t('employees.role'),
        dataIndex: 'role',
        key: 'role',
        render: (v: string | undefined) => (v ? <Tag>{v}</Tag> : '-'),
      },
      {
        title: t('employees.status'),
        dataIndex: 'status',
        key: 'status',
        render: (v: string | undefined) =>
          v ? <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag> : '-',
      },
      { title: t('employees.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt' },
      {
        title: t('common.actions'),
        key: 'actions',
        render: (_: unknown, row: EmployeeDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  name: row.name,
                  email: row.email,
                  phone: row.phone,
                  role: row.role,
                  status: row.status,
                })
                setOpen(true)
              }}
            >
              {t('common.edit')}
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                Modal.confirm({
                  title: t('common.confirmDeleteTitle'),
                  content: row.name,
                  okText: t('common.delete'),
                  okButtonProps: { danger: true },
                  cancelText: t('common.cancel'),
                  onOk: async () => {
                    await crmApi.employees.remove(row.id)
                    await refresh()
                  },
                })
              }}
            >
              {t('common.delete')}
            </Button>
          </Space>
        ),
      },
    ],
    [form, refresh, t],
  )

  function resetModal() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const values = await form.validateFields()

    try {
      if (editing) {
        await crmApi.employees.update(editing.id, values)
      } else {
        await crmApi.employees.create(values)
      }
      resetModal()
      await refresh()
    } catch {
      message.error(t('employees.saveFailed'))
    }
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {t('employees.title')}
        </Typography.Title>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('employees.addEmployee')}
        </Button>
      </Space>

      <Card>
        <Table<EmployeeDto> rowKey="id" loading={loading} columns={columns} dataSource={data} />
      </Card>

      <Modal
        title={editing ? t('employees.editEmployee') : t('employees.addEmployee')}
        open={open}
        onCancel={resetModal}
        onOk={onSubmit}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('employees.name')} rules={[{ required: true }]}>
            <Input placeholder="Carl" />
          </Form.Item>
          <Form.Item name="email" label={t('employees.email')}>
            <Input placeholder="carl@example.com" />
          </Form.Item>
          <Form.Item name="phone" label={t('employees.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t('employees.role')}>
            <Input placeholder="admin/user" />
          </Form.Item>
          <Form.Item name="status" label={t('employees.status')}>
            <Input placeholder="active/inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
