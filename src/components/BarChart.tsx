import * as copy from '../copy'
import type { Bar } from '../store/selectors'
import { Lines } from './Lines'

const KIND_STYLE = {
  none: { background: 'var(--rule)', opacity: 0.55 },
  ok: { background: 'var(--accent)', opacity: 1 },
  had: { background: 'var(--mine)', opacity: 1 },
} as const

/**
 * 最近 N 天。空著的日子只有一條 3px 的線——留白本身是資訊，
 * 所以這裡不做連續天數、不做填滿率。
 */
export function BarChart({
  bars,
  height = 60,
  gap = 6,
  showNote = true,
}: {
  bars: Bar[]
  height?: number
  gap?: number
  showNote?: boolean
}) {
  return (
    <div>
      <div className="t-mono-11 mb-[14px] text-muted">
        {copy.barChart.label(bars.length)}
      </div>
      <div className="flex items-end" style={{ height, gap }}>
        {bars.map((bar) => (
          <div
            key={bar.date}
            title={bar.date}
            className="flex-1 rounded-[1px]"
            style={{ height: bar.height, ...KIND_STYLE[bar.kind] }}
          />
        ))}
      </div>
      {showNote && (
        <p className="t-ui-135 t-pretty mt-[16px] text-muted">
          <Lines text={copy.barChart.note} />
        </p>
      )}
    </div>
  )
}
