import { useRef, type ReactNode } from 'react'
import { Chip } from './Chip'

/** chip 群組的外框：多選用 role="group"，單選用 radio 語意。 */

interface ToggleProps {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  /** 「＋ 自己寫」那顆接在最後 */
  children?: ReactNode
}

export function ToggleChipGroup({
  label,
  options,
  selected,
  onToggle,
  children,
}: ToggleProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-[7px]">
      {options.map((opt) => {
        const on = selected.includes(opt)
        return (
          <Chip
            key={opt}
            look={on ? 'selected' : 'plain'}
            aria-pressed={on}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </Chip>
        )
      })}
      {children}
    </div>
  )
}

interface RadioProps<T> {
  label: string
  options: { value: T; label: string }[]
  value: T | null
  onSelect: (value: T) => void
}

export function RadioChipGroup<T extends string | number>({
  label,
  options,
  value,
  onSelect,
}: RadioProps<T>) {
  const ref = useRef<HTMLDivElement>(null)

  // radio group 的標準鍵盤行為：方向鍵移動即選取，整組只佔一個 tab stop。
  function onKeyDown(e: React.KeyboardEvent) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']
    if (!keys.includes(e.key)) return
    e.preventDefault()
    const current = options.findIndex((o) => o.value === value)
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
    const start = current === -1 ? 0 : current
    const next = (start + delta + options.length) % options.length
    onSelect(options[next].value)
    const buttons = ref.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    buttons?.[next]?.focus()
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex flex-wrap gap-[7px]"
    >
      {options.map((opt, i) => {
        const on = opt.value === value
        return (
          <Chip
            key={String(opt.value)}
            role="radio"
            aria-checked={on}
            tabIndex={on || (value === null && i === 0) ? 0 : -1}
            look={on ? 'selected' : 'plain'}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </Chip>
        )
      })}
    </div>
  )
}
