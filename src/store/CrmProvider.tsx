import { createContext, useContext, type PropsWithChildren } from 'react'
import { useCrmStore } from './useCrmStore'

export type CrmStore = ReturnType<typeof useCrmStore>

const Ctx = createContext<CrmStore | null>(null)

export function CrmProvider({ children }: PropsWithChildren) {
  const store = useCrmStore()
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useCrm() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCrm must be used within <CrmProvider>')
  return v
}
