export type StorageKey = 'crm.customers' | 'crm.orders' | 'crm.visits' | 'crm.finance'

export function loadJson<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson<T>(key: StorageKey, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}
