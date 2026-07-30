import { useState } from 'react'
import { PRODUCT_NAME } from '../../constants'
import * as copy from '../../copy'
import { Lines } from '../../components/Lines'
import { ThemeToggle } from '../../components/ThemeToggle'
import { copyText } from '../../lib/clipboard'
import { todayISO } from '../../lib/date'
import { exportMarkdown } from '../../lib/markdown'
import { useAppState } from '../../store/useAppStore'
import type { Tab } from '../../types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: copy.nav.today },
  { id: 'pattern', label: copy.nav.pattern },
  { id: 'bets', label: copy.nav.bets },
  { id: 'scripts', label: copy.nav.scripts },
]

/**
 * 側欄。900px 以下收合成頂部橫列（README 第 9 節「響應式」）——
 * 收合時選中態改用文字顏色表示，不留一條浮在半空的左線。
 */
export function Sidebar({
  active,
  onSelect,
  exportOpen,
  onExportOpenChange,
}: {
  active: Tab
  onSelect: (tab: Tab) => void
  exportOpen: boolean
  onExportOpenChange: (open: boolean) => void
}) {
  const { entries, bets } = useAppState()
  const [copiedCount, setCopiedCount] = useState(0)

  async function onExport() {
    if (exportOpen) {
      onExportOpenChange(false)
      return
    }
    await copyText(exportMarkdown(entries, bets))
    setCopiedCount(entries.length)
    onExportOpenChange(true)
  }

  return (
    <nav
      className="flex w-[200px] flex-none flex-col gap-[3px] border-r border-rule px-[22px] py-[30px] max-[899px]:w-full max-[899px]:flex-row max-[899px]:flex-wrap max-[899px]:items-baseline max-[899px]:gap-x-[20px] max-[899px]:border-r-0 max-[899px]:border-b max-[899px]:py-[20px]"
    >
      <div className="mb-[26px] max-[899px]:mr-auto max-[899px]:mb-0">
        <div className="t-quote-17 tracking-[.02em] text-ink">{PRODUCT_NAME}</div>
        <div className="t-mono-11 mt-[2px] text-muted">{todayISO()}</div>
      </div>

      {TABS.map((tab) => {
        const on = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={on ? 'page' : undefined}
            onClick={() => onSelect(tab.id)}
            className={`t-ui-15 -ml-[12px] cursor-pointer border-l-2 py-[7px] pl-[10px] text-left transition-opacity hover:opacity-85 max-[899px]:m-0 max-[899px]:border-l-0 max-[899px]:p-0 ${
              on ? 'border-ink text-ink' : 'border-transparent text-muted'
            }`}
          >
            {tab.label}
          </button>
        )
      })}

      <div className="min-h-[40px] flex-1 max-[899px]:hidden" />

      <button
        type="button"
        onClick={onExport}
        aria-expanded={exportOpen}
        className="t-ui-12 cursor-pointer border-0 bg-transparent py-[6px] text-left text-muted transition-opacity hover:opacity-85 max-[899px]:ml-auto max-[899px]:py-0"
      >
        {copy.nav.export}
      </button>

      <ThemeToggle className="max-[899px]:py-0" />

      {exportOpen && (
        <div className="anim-enter t-mono-11 mt-[8px] rounded-[2px] border border-rule bg-wash-3 px-[12px] py-[11px] leading-[1.7] text-muted max-[899px]:w-full">
          <Lines text={copy.nav.exported(copiedCount)} />
        </div>
      )}
    </nav>
  )
}
