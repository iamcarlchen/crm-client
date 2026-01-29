import { Select } from 'antd'
import { useMemo } from 'react'
import type { Customer } from '../types'

export function CustomerSelect({
  customers,
  value,
  onChange,
  allowClear,
  placeholder,
}: {
  customers: Customer[]
  value?: string
  onChange?: (v: string) => void
  allowClear?: boolean
  placeholder?: string
}) {
  const options = useMemo(
    () => customers.map((c) => ({ label: c.name, value: c.id })),
    [customers],
  )

  return (
    <Select
      showSearch
      optionFilterProp="label"
      options={options}
      value={value}
      allowClear={allowClear}
      placeholder={placeholder ?? '选择客户'}
      onChange={(v) => onChange?.(v)}
      style={{ width: '100%' }}
    />
  )
}
