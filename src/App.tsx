import { useSyncExternalStore } from 'react'
import { AppShell } from './views/AppShell'

const NARROW = '(max-width: 767px)'
const WIDE = '(min-width: 1200px)'

function watch(query: string) {
  return {
    subscribe(cb: () => void) {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    get: () => window.matchMedia(query).matches,
  }
}

const narrowMQ = watch(NARROW)
const wideMQ = watch(WIDE)

/**
 * <768px 時「今天」改用 1b 的逐題流程；≥1200px 時「模式」改用 1c 工作台。
 * 三種模式共用同一份資料——換的是看的方式，不是產品。
 */
export default function App() {
  const narrow = useSyncExternalStore(narrowMQ.subscribe, narrowMQ.get, () => false)
  const wide = useSyncExternalStore(wideMQ.subscribe, wideMQ.get, () => false)
  return <AppShell narrow={narrow} wide={wide} />
}
