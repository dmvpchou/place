import { useState } from 'react'
import type { Tab } from '../types'
import { BetsTab } from './desktop/BetsTab'
import { PatternTab } from './desktop/PatternTab'
import { ScriptsTab } from './desktop/ScriptsTab'
import { Sidebar } from './desktop/Sidebar'
import { TodayTab } from './desktop/TodayTab'
import { WizardShell } from './mobile/WizardShell'

/**
 * 四個分頁平權——它們不是四個功能，是同一個整理動作的四個階段。
 * 分頁切換即時、無過場，只有內容區的進場動畫。
 *
 * 響應式（README 第 9 節）：
 *   ≥900px  1a 兩欄
 *   <900px  側欄收合成頂部橫列
 *   <768px  「今天」的記錄流程改用 1b 的逐題模式，其餘三個分頁沿用同一份版面
 */
export function AppShell({ narrow }: { narrow: boolean }) {
  const [tab, setTab] = useState<Tab>('today')
  const [exportOpen, setExportOpen] = useState(false)
  const [betLine, setBetLine] = useState<string | null>(null)

  function go(next: Tab) {
    setTab(next)
    setExportOpen(false) // 切換分頁時關閉匯出小視窗
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[900px] bg-paper max-[899px]:flex-col">
      <Sidebar
        active={tab}
        onSelect={go}
        exportOpen={exportOpen}
        onExportOpenChange={setExportOpen}
      />
      <main className="flex min-w-0 max-w-[560px] flex-1 flex-col px-[44px] pt-[36px] pb-[44px] max-[899px]:px-[26px] max-[767px]:pt-[30px] max-[767px]:pb-[34px]">
        {tab === 'today' &&
          (narrow ? (
            <WizardShell />
          ) : (
            <TodayTab
              onAskBets={(line) => {
                setBetLine(line)
                go('bets')
              }}
            />
          ))}
        {tab === 'pattern' && <PatternTab />}
        {tab === 'bets' && <BetsTab prefillLine={betLine} />}
        {tab === 'scripts' && <ScriptsTab />}
      </main>
    </div>
  )
}
