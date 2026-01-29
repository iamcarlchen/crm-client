export type Article = {
  id: string
  title: string
  coverUrl?: string
  tags: string[]
  status: 'draft' | 'published'
  contentHtml: string
  createdAt: string
  updatedAt: string
}

const KEY = 'crm:articles'

function nowIso() {
  return new Date().toISOString()
}

function id() {
  return `a_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as Article[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveArticles(list: Article[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function createArticle(payload: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Article {
  const t = nowIso()
  return { ...payload, id: id(), createdAt: t, updatedAt: t }
}

export function updateArticle(a: Article, patch: Partial<Omit<Article, 'id' | 'createdAt'>>): Article {
  return { ...a, ...patch, updatedAt: nowIso() }
}
