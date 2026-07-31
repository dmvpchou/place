import { useState } from 'react'
import * as copy from '../copy'
import type { Tab } from '../types'
import { BetsTab } from './desktop/BetsTab'
import { PatternTab } from './desktop/PatternTab'
import { ScriptsTab } from './desktop/ScriptsTab'
import { Sidebar } from './desktop/Sidebar'
import { TodayTab } from './desktop/TodayTab'
import { Workbench } from './desktop/Workbench'
import { WizardShell } from './mobile/WizardShell'

/**
 * 四個分頁平權——它們不是四個功能，是同一個整理動作的四個階段。
 * 分頁切換即時、無過場，只有內容區的進場動畫。
 *
 * 「完整紀錄」不在分頁列上：它是從「⋯」進來的回顧視圖，不是第五個階段。
 *
 * 響應式（README 第 9 節）：
 *   ≥900px  兩欄
 *   <900px  側欄收合成頂部橫列
 *   <768px  「今天」的記錄流程改用 1b 的逐題模式，其餘分頁沿用同一份版面
 */
export function AppShell({ narrow, wide }: { narrow: boolean; wide: boolean }) {
  const [tab, setTab] = useState<Tab>('today')
  const [betLine, setBetLine] = useState<string | null>(null)

  function go(next: Tab) {
    setTab(next)
  }

  // ≥1200px 的「模式」換成工作台；「完整紀錄」則不分寬度都是工作台。
  const workbench = tab === 'records' || (wide && tab === 'pattern')

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col bg-paper">
      <div className="flex flex-1 max-[899px]:flex-col">
        <Sidebar active={tab} onSelect={go} onOpenRecords={() => go('records')} />
        <main
          className={`flex min-w-0 flex-1 flex-col ${
            workbench
              ? ''
              : 'max-w-[560px] px-[44px] pt-[36px] pb-[44px] max-[899px]:px-[26px] max-[767px]:pt-[30px] max-[767px]:pb-[34px]'
          }`}
        >
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
          {tab === 'pattern' && (wide ? <Workbench narrow={narrow} /> : <PatternTab />)}
          {tab === 'records' && <Workbench scope="all" narrow={narrow} />}
          {tab === 'bets' && <BetsTab prefillLine={betLine} />}
          {tab === 'scripts' && <ScriptsTab />}
        </main>
      </div>

      <footer className="t-mono-105 border-t border-rule px-[22px] py-[16px] text-dim">
        {copy.footer}
      </footer>
    </div>
  )
}
