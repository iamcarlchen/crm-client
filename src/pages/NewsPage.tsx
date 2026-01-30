import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { crmApi } from '../api/crm'
import type { NewsDto } from '../api/types'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type NewsForm = {
  title: string
  source?: string
  sourceUrl?: string
  summary?: string
  content?: string
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt?: any
}

export function NewsPage() {
  const { t } = useTranslation()

  const [list, setList] = useState<NewsDto[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<NewsDto | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL')
  const [form] = Form.useForm<NewsForm>()

  async function reload() {
    setLoading(true)
    try {
      const data = await crmApi.news.list(filterStatus === 'ALL' ? undefined : filterStatus)
      setList(data)
    } catch {
      message.error(t('news.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus])

  function reset() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const v = await form.validateFields()
    const payload = {
      title: v.title,
      source: v.source,
      sourceUrl: v.sourceUrl,
      summary: v.summary,
      content: v.content,
      status: v.status,
      publishedAt: v.publishedAt ? dayjs(v.publishedAt).toISOString() : undefined,
    }

    try {
      if (editing) {
        await crmApi.news.update(editing.id, payload as any)
        message.success(t('common.save'))
      } else {
        await crmApi.news.create(payload as any)
        message.success(t('common.add'))
      }
      reset()
      await reload()
    } catch {
      message.error(t('news.saveFailed'))
    }
  }

  const data = useMemo(
    () => [...list].sort((a, b) => ((a.updatedAt || '') < (b.updatedAt || '') ? 1 : -1)),
    [list],
  )

  const columns = useMemo(
    () => [
      { title: t('news.titleCol'), dataIndex: 'title', key: 'title', ellipsis: true },
      {
        title: t('news.status'),
        dataIndex: 'status',
        key: 'status',
        render: (v: NewsDto['status']) => (
          <Tag color={v === 'PUBLISHED' ? 'green' : 'default'}>{v}</Tag>
        ),
      },
      { title: t('news.source'), dataIndex: 'source', key: 'source', ellipsis: true },
      { title: t('news.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt' },
      {
        title: t('common.actions'),
        key: 'actions',
        render: (_: unknown, row: NewsDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  title: row.title,
                  source: row.source,
                  sourceUrl: row.sourceUrl,
                  summary: row.summary,
                  content: row.content,
                  status: row.status,
                  publishedAt: row.publishedAt ? dayjs(row.publishedAt) : undefined,
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
                  content: row.title,
                  okText: t('common.delete'),
                  okButtonProps: { danger: true },
                  cancelText: t('common.cancel'),
                  onOk: async () => {
                    await crmApi.news.remove(row.id)
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
          {t('news.title')}
        </Typography.Title>
        <Space>
          <Segmented
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as any)}
            options={[
              { label: t('news.all'), value: 'ALL' },
              { label: t('news.draft'), value: 'DRAFT' },
              { label: t('news.published'), value: 'PUBLISHED' },
            ]}
          />
          <Button
            type="primary"
            onClick={() => {
              setEditing(null)
              form.setFieldsValue({
                title: '',
                source: '',
                sourceUrl: '',
                summary: '',
                content: '',
                status: 'DRAFT',
                publishedAt: undefined,
              })
              setOpen(true)
            }}
          >
            {t('news.add')}
          </Button>
        </Space>
      </Space>

      <Card>
        <Table rowKey="id" columns={columns as any} dataSource={data} loading={loading} />
      </Card>

      <Modal
        title={editing ? t('news.edit') : t('news.add')}
        open={open}
        onCancel={reset}
        onOk={onSubmit}
        width={840}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'DRAFT' }}>
          <Form.Item name="title" label={t('news.titleCol')} rules={[{ required: true }]}>
            <Input placeholder="例如：美联储维持利率不变" />
          </Form.Item>
          <Form.Item name="source" label={t('news.source')}>
            <Input placeholder="Reuters / Bloomberg / ..." />
          </Form.Item>
          <Form.Item name="sourceUrl" label={t('news.sourceUrl')}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="summary" label={t('news.summary')}>
            <Input.TextArea rows={2} placeholder="一句话摘要" />
          </Form.Item>

          <Form.Item name="status" label={t('news.status')} rules={[{ required: true }]}>
            <Segmented
              options={[
                { label: t('news.draft'), value: 'DRAFT' },
                { label: t('news.published'), value: 'PUBLISHED' },
              ]}
            />
          </Form.Item>

          <Form.Item name="publishedAt" label={t('news.publishedAt')}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="content" label={t('news.content')}>
            <Input.TextArea rows={10} placeholder="新闻正文..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
