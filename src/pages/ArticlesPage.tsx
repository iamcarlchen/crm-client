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
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import {
  createArticle,
  loadArticles,
  saveArticles,
  updateArticle,
  type Article,
} from '../lib/articles'
import { RichEditor } from '../components/RichEditor'

type ArticleForm = {
  title: string
  coverUrl?: string
  tags?: string
  status: 'draft' | 'published'
  contentHtml: string
}

export function ArticlesPage() {
  const [list, setList] = useState<Article[]>(() => loadArticles())
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form] = Form.useForm<ArticleForm>()

  const data = useMemo(() => [...list].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)), [list])

  function reset() {
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  async function onSubmit() {
    const v = await form.validateFields()
    const tags = (v.tags || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

    if (editing) {
      const next = list.map((a) => (a.id === editing.id ? updateArticle(a, { ...v, tags }) : a))
      setList(next)
      saveArticles(next)
      message.success('已保存')
      reset()
      return
    }

    const a = createArticle({
      title: v.title,
      coverUrl: v.coverUrl,
      tags,
      status: v.status,
      contentHtml: v.contentHtml,
    })
    const next = [a, ...list]
    setList(next)
    saveArticles(next)
    message.success('已创建')
    reset()
  }

  const columns = useMemo(
    () => [
      { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (v: Article['status']) => (
          <Tag color={v === 'published' ? 'green' : 'default'}>{v}</Tag>
        ),
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags: string[]) => (
          <Space wrap>
            {(tags || []).slice(0, 4).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </Space>
        ),
      },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, row: Article) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(row)
                form.setFieldsValue({
                  title: row.title,
                  coverUrl: row.coverUrl,
                  tags: (row.tags || []).join(', '),
                  status: row.status,
                  contentHtml: row.contentHtml,
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
                  title: '确认删除该文章？',
                  content: row.title,
                  okText: '删除',
                  okButtonProps: { danger: true },
                  cancelText: '取消',
                  onOk: () => {
                    const next = list.filter((x) => x.id !== row.id)
                    setList(next)
                    saveArticles(next)
                  },
                })
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [form, list],
  )

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          文章管理
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null)
            form.setFieldsValue({
              title: '',
              coverUrl: '',
              tags: '',
              status: 'draft',
              contentHtml: '<p></p>',
            })
            setOpen(true)
          }}
        >
          新建文章
        </Button>
      </Space>

      <Card>
        <Table rowKey="id" columns={columns as any} dataSource={data} />
      </Card>

      <Modal
        title={editing ? '编辑文章' : '新建文章'}
        open={open}
        onCancel={reset}
        onOk={onSubmit}
        width={980}
        okText="保存"
        cancelText="取消"
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'draft', contentHtml: '<p></p>' }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="例如：比特币现货交易入门" />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面图 URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="crypto, btc, tutorial" />
          </Form.Item>

          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Segmented
              options={[
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="contentHtml"
            label="内容（富媒体编辑器）"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            {/* Controlled editor */}
            <RichEditor
              value={form.getFieldValue('contentHtml')}
              onChange={(html) => form.setFieldValue('contentHtml', html)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
