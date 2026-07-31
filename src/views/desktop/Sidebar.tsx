import { PRODUCT_NAME } from '../../constants'
import * as copy from '../../copy'
import { ThemeToggle } from '../../components/ThemeToggle'
import { todayISO } from '../../lib/date'
import type { Tab } from '../../types'
import { MoreMenu } from './MoreMenu'

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
  onOpenRecords,
}: {
  active: Tab
  onSelect: (tab: Tab) => void
  onOpenRecords: () => void
}) {
  return (
    <nav className="flex w-[200px] flex-none flex-col gap-[3px] border-r border-rule px-[22px] py-[30px] max-[899px]:w-full max-[899px]:flex-row max-[899px]:flex-wrap max-[899px]:items-baseline max-[899px]:gap-x-[20px] max-[899px]:border-r-0 max-[899px]:border-b max-[899px]:py-[20px]">
      {/* 收合時品牌獨占一行：分頁橫列擠在同一行會被推到第二行（iPhone 16 上
          「遇到」就掉下去了）。外觀切換跟品牌同一行，右對齊。 */}
      <div className="mb-[26px] max-[899px]:mb-[14px] max-[899px]:w-full">
        <div className="flex items-center gap-[10px]">
          <div className="t-brand flex-1 text-ink">{PRODUCT_NAME}</div>
          <ThemeToggle />
        </div>
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

      <MoreMenu
        className="max-[899px]:ml-auto max-[899px]:py-0"
        resetKey={active}
        onOpenRecords={onOpenRecords}
      />
    </nav>
  )
}
