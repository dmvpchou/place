import { useSyncExternalStore } from 'react'
import { AppShell } from './views/AppShell'

const NARROW = '(max-width: 767px)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(NARROW)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/**
 * <768px 時「今天」改用 1b 的逐題流程。
 * 兩種模式共用同一份資料——換的是填寫的節奏，不是產品。
 */
export default function App() {
  const narrow = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW).matches,
    () => false,
  )
  return <AppShell narrow={narrow} />
}
