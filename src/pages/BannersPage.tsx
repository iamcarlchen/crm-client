import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { crmApi } from '../api/crm'
import type { BannerDto } from '../api/types'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type BannerForm = {
  name: string
  position: string
  status: 'DRAFT' | 'ONLINE' | 'OFFLINE'
  imageUrl?: string
  linkUrl?: string
  locale?: string
  timeRange?: any
}

const POSITIONS = [
  { label: 'HOME_TOP', value: 'HOME_TOP' },
  { label: 'HOME_MID', value: 'HOME_MID' },
  { label: 'HOME_BOTTOM', value: 'HOME_BOTTOM' },
]

export function BannersPage() {
  const { t } = useTranslation()

  const [list, setList] = useState<BannerDto[]>([])
  const [loading, setLoading] = useState(false)

  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined)
  const [filterPosition, setFilterPosition] = useState<string | undefined>(undefined)
  const [filterName, setFilterName] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BannerDto | null>(null)
  const [form] = Form.useForm<BannerForm>()

  async function reload() {
    setLoading(true)
    try {
      const data = await crmApi.banners.list({
        status: filterStatus,
        position: filterPosition,
      })
      const nameQ = filterName.trim().toLowerCase()
      const filtered = nameQ
        ? data.filter((x) => (x.name || '').toLowerCase().includes(nameQ))
        : data
      setList(filtered)
    } catch {
      message.error(t('banners.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPosition])

  function reset() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const v = await form.validateFields()
    const startAt = v.timeRange?.[0] ? dayjs(v.timeRange[0]).toISOString() : undefined
    const endAt = v.timeRange?.[1] ? dayjs(v.timeRange[1]).toISOString() : undefined

    const payload = {
      name: v.name,
      position: v.position,
      status: v.status,
      imageUrl: v.imageUrl,
      linkUrl: v.linkUrl,
      locale: v.locale,
      startAt,
      endAt,
    }

    try {
      if (editing) {
        await crmApi.banners.update(editing.id, payload as any)
        message.success(t('common.save'))
      } else {
        await crmApi.banners.create(payload as any)
        message.success(t('common.add'))
      }
      reset()
      await reload()
    } catch {
      message.error(t('banners.saveFailed'))
    }
  }

  const data = useMemo(
    () => [...list].sort((a, b) => ((a.updatedAt || '') < (b.updatedAt || '') ? 1 : -1)),
    [list],
  )

  const columns = useMemo(
    () => [
      { title: t('banners.id'), dataIndex: 'id', key: 'id', width: 90 },
      { title: t('banners.name'), dataIndex: 'name', key: 'name', ellipsis: true },
      { title: t('banners.position'), dataIndex: 'position', key: 'position', width: 140 },
      {
        title: t('banners.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (v: BannerDto['status']) => {
          const color = v === 'ONLINE' ? 'green' : v === 'OFFLINE' ? 'red' : 'default'
          return <Tag color={color}>{v}</Tag>
        },
      },
      { title: t('banners.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
      {
        title: t('common.actions'),
        key: 'actions',
        width: 160,
        render: (_: unknown, row: BannerDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  name: row.name,
                  position: row.position,
                  status: row.status,
                  imageUrl: row.imageUrl,
                  linkUrl: row.linkUrl,
                  locale: row.locale,
                  timeRange:
                    row.startAt || row.endAt
                      ? [row.startAt ? dayjs(row.startAt) : null, row.endAt ? dayjs(row.endAt) : null]
                      : undefined,
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
                    await crmApi.banners.remove(row.id)
                    await reload()
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
    [form, reload, t],
  )

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {t('banners.title')}
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null)
            form.setFieldsValue({
              name: '',
              position: 'HOME_TOP',
              status: 'DRAFT',
              imageUrl: '',
              linkUrl: '',
              locale: '',
              timeRange: undefined,
            })
            setOpen(true)
          }}
        >
          {t('banners.add')}
        </Button>
      </Space>

      <Card style={{ marginBottom: 12 }}>
        <Space wrap>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>{t('banners.filterStatus')}</div>
            <Select
              allowClear
              style={{ width: 160 }}
              value={filterStatus}
              onChange={(v) => setFilterStatus(v)}
              options={[
                { label: 'DRAFT', value: 'DRAFT' },
                { label: 'ONLINE', value: 'ONLINE' },
                { label: 'OFFLINE', value: 'OFFLINE' },
              ]}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>{t('banners.filterPosition')}</div>
            <Select
              allowClear
              style={{ width: 180 }}
              value={filterPosition}
              onChange={(v) => setFilterPosition(v)}
              options={POSITIONS}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>{t('banners.filterName')}</div>
            <Input
              style={{ width: 220 }}
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder={t('banners.filterNamePlaceholder')}
              onPressEnter={() => reload()}
            />
          </div>
          <Button onClick={() => reload()} style={{ marginTop: 18 }}>
            {t('common.filter')}
          </Button>
        </Space>
      </Card>

      <Card>
        <Table rowKey="id" columns={columns as any} dataSource={data} loading={loading} />
      </Card>

      <Modal
        title={editing ? t('banners.edit') : t('banners.add')}
        open={open}
        onCancel={reset}
        onOk={onSubmit}
        width={900}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'DRAFT', position: 'HOME_TOP' }}>
          <Form.Item name="name" label={t('banners.name')} rules={[{ required: true }]}>
            <Input placeholder={t('banners.namePlaceholder')} />
          </Form.Item>

          <Form.Item name="position" label={t('banners.position')} rules={[{ required: true }]}>
            <Select options={POSITIONS} />
          </Form.Item>

          <Form.Item name="status" label={t('banners.status')} rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'DRAFT', value: 'DRAFT' },
                { label: 'ONLINE', value: 'ONLINE' },
                { label: 'OFFLINE', value: 'OFFLINE' },
              ]}
            />
          </Form.Item>

          <Form.Item name="locale" label={t('banners.locale')}>
            <Input placeholder="zh-CN / en-US" />
          </Form.Item>

          <Form.Item name="timeRange" label={t('banners.timeRange')}>
            <DatePicker.RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Typography.Title level={5} style={{ marginTop: 12 }}>
            {t('banners.material')}
          </Typography.Title>

          <Form.Item name="imageUrl" label={t('banners.imageUrl')}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="linkUrl" label={t('banners.linkUrl')}>
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
