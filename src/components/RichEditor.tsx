import { LinkOutlined, PictureOutlined } from '@ant-design/icons'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Button, Divider, Space } from 'antd'
import { useEffect } from 'react'

export function RichEditor(props: {
  value: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false }),
    ],
    content: props.value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'crm-editor ProseMirror',
      },
    },
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML())
    },
  })

  // keep in sync when switching articles
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== (props.value || '<p></p>')) {
      editor.commands.setContent(props.value || '<p></p>')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, editor])

  if (!editor) return null

  return (
    <div>
      <Space wrap>
        <Button size="small" type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </Button>
        <Button size="small" type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button size="small" type={editor.isActive('bold') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button size="small" type={editor.isActive('italic') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button size="small" type={editor.isActive('underline') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </Button>
        <Button size="small" type={editor.isActive('bulletList') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </Button>
        <Button size="small" type={editor.isActive('orderedList') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </Button>
        <Button size="small" type={editor.isActive('blockquote') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </Button>
        <Button size="small" type={editor.isActive('codeBlock') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </Button>

        <Divider type="vertical" />

        <Button
          size="small"
          icon={<LinkOutlined />}
          onClick={() => {
            const prev = editor.getAttributes('link').href
            const url = window.prompt('Link URL', prev || 'https://')
            if (url === null) return
            if (url === '') {
              editor.chain().focus().unsetLink().run()
              return
            }
            editor.chain().focus().setLink({ href: url }).run()
          }}
        >
          Link
        </Button>

        <Button
          size="small"
          icon={<PictureOutlined />}
          onClick={() => {
            const url = window.prompt('Image URL', 'https://')
            if (!url) return
            editor.chain().focus().setImage({ src: url }).run()
          }}
        >
          Image
        </Button>
      </Space>

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, background: '#fff' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
