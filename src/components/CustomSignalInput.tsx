import { useEffect, useRef, useState } from 'react'
import * as copy from '../copy'
import { addCustomSignal } from '../store/useAppStore'
import { Chip } from './Chip'

interface Props {
  placeholder: string
  /** 送出按鈕寬度：1a 是 68px，1b 是 72px */
  submitWidth: number
  /** 加進去之後自動勾選於當次記錄 */
  onAdded: (signal: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 「＋ 自己寫」。展開時 chip 邊框轉實線；送出後收合、加入常駐清單、
 * 自動勾選、清空輸入框。Enter 等同送出。
 */
export function CustomSignalInput({
  placeholder,
  submitWidth,
  onAdded,
  open,
  onOpenChange,
}: Props) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else setText('')
  }, [open])

  function commit() {
    const added = addCustomSignal(text)
    if (added) onAdded(added)
    setText('')
    onOpenChange(false)
  }

  return (
    <>
      <Chip
        look={open ? 'plain' : 'dashed'}
        className={open ? 'text-dim' : ''}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {copy.today.form.signals.add}
      </Chip>

      {open && (
        // w-full 讓這一列在 chip 的 flex-wrap 容器裡自成一行；
        // mt-5px 加上容器的 7px gap 剛好是設計稿的 12px。
        <div className="anim-enter-fast mt-[5px] flex w-full gap-[8px]">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commit()
              }
            }}
            placeholder={placeholder}
            aria-label={copy.today.form.signals.add}
            className="t-ui-14 min-w-0 flex-1 rounded-[2px] border border-rule bg-wash px-[12px] py-[10px] text-ink"
          />
          <button
            type="button"
            onClick={commit}
            style={{ flex: `0 0 ${submitWidth}px` }}
            className="t-chip cursor-pointer rounded-[2px] border border-accent bg-transparent text-accent transition-opacity hover:opacity-85"
          >
            {copy.today.form.signals.addSubmit}
          </button>
        </div>
      )}
    </>
  )
}
