import { useState } from 'react'
import { BarChart } from '../../components/BarChart'
import { Lines } from '../../components/Lines'
import { BAR_DAYS, REPLAY_OPTIONS } from '../../constants'
import * as copy from '../../copy'
import { toShortDate, todayISO } from '../../lib/date'
import {
  barSeries,
  entryForDate,
  recentEntries,
  sameWhoBefore,
  trendSentence,
  whoRanking,
} from '../../store/selectors'
import { useAppState } from '../../store/useAppStore'
import type { Entry } from '../../types'

/**
 * 1c 回顧工作台。
 *
 * scope='recent'：≥1200px 時「模式」分頁的進階視圖，時間軸與條狀圖同樣是最近 14 天。
 * scope='all'   ：從「⋯ → 完整紀錄」進來，時間軸不設上限。
 *
 * 右欄就是原本的模式，左欄與中欄多給了一件四分頁做不到的事——回頭看過去那幾天。
 * 窄一點的螢幕放不下三欄：<1200px 收掉右欄（模式本來就有自己的分頁），
 * <900px 一次只顯示列表或詳情。
 */
export function Workbench({
  scope = 'recent',
  narrow = false,
}: {
  scope?: 'recent' | 'all'
  narrow?: boolean
}) {
  const { entries } = useAppState()
  const today = todayISO()
  const timeline =
    scope === 'all'
      ? [...entries].sort((a, b) => b.date.localeCompare(a.date))
      : recentEntries(entries, BAR_DAYS, today)

  const [selected, setSelected] = useState<string | null>(null)
  // 窄螢幕一次只看得到一欄：預設先看列表，點了某一天才換成詳情。
  const [showDetail, setShowDetail] = useState(false)
  // 沒選過就看最新的那一筆。
  const selectedDate = selected ?? timeline[0]?.date ?? null
  const entry = selectedDate ? entryForDate(entries, selectedDate) : undefined

  return (
    <div className="anim-enter flex min-h-[640px] flex-1">
      {/* 左欄 · 時間軸 */}
      <div
        className={`flex w-[300px] flex-none flex-col border-r border-rule max-[899px]:w-full max-[899px]:border-r-0 ${
          narrow && showDetail ? 'hidden' : ''
        }`}
      >
        {/* 設計稿的 1c 是完整的 app 外框，表頭掛著產品名；這裡它是「模式」分頁的
            內容，左邊兩欄外就是側欄的品牌了，再掛一次會像 bug。只留筆數。 */}
        <div className="border-b border-rule px-[24px] pt-[26px] pb-[18px]">
          <div className="t-mono-11 text-muted">
            {timeline.length === 0
              ? copy.workbench.countEmpty
              : scope === 'all'
                ? copy.workbench.countAll(timeline.length)
                : copy.workbench.count(timeline.length)}
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-auto">
          {timeline.map((e) => (
            <TimelineRow
              key={e.date}
              entry={e}
              selected={e.date === selectedDate}
              onSelect={() => {
                setSelected(e.date)
                setShowDetail(true)
              }}
            />
          ))}
        </div>
      </div>

      {/* 中欄 · 詳情 */}
      <div
        className={`min-w-0 flex-1 px-[40px] py-[32px] max-[899px]:px-[26px] ${
          narrow && !showDetail ? 'hidden' : ''
        }`}
      >
        {narrow && (
          <button
            type="button"
            onClick={() => setShowDetail(false)}
            className="t-ui-12 mb-[14px] cursor-pointer border-0 bg-transparent p-0 text-accent hover:text-accent-hi"
          >
            {copy.workbench.back}
          </button>
        )}
        {entry && (
          <>
            <div className="t-mono-11 text-muted">{entry.date}</div>
            {entry.had ? <Detail entry={entry} entries={entries} /> : <NoEntry />}
          </>
        )}
      </div>

      {/* 右欄 · 模式 */}
      {/* 右欄在 <1200px 收起來：模式本來就有自己的分頁，不必在這裡再擠一次 */}
      <div className="w-[250px] flex-none border-l border-rule bg-wash-2 px-[24px] py-[28px] max-[1199px]:hidden">
        <div className="t-mono-11 text-muted">{copy.pattern.eyebrow}</div>
        <div className="t-quote-19-tight mt-[12px] mb-[20px] text-ink">
          <Lines text={copy.pattern.title} />
        </div>

        {whoRanking(entries).map(({ who, count }) => (
          <div
            key={who}
            className="flex items-center gap-[10px] border-b border-rule-soft py-[9px]"
          >
            <b className="t-ui-14-list flex-1 font-normal text-ink">{who}</b>
            <i
              aria-hidden
              className="h-[5px] rounded-[1px] bg-mine"
              style={{ width: Math.min(count * 22, 80) }}
            />
            <span className="t-mono-105 text-muted">{count}</span>
          </div>
        ))}

        <div className="mt-[26px] mb-[18px] h-px bg-rule" />
        <BarChart
          bars={barSeries(entries, BAR_DAYS, today)}
          height={52}
          gap={4}
          showNote={false}
        />
        <p className="t-ui-125 t-pretty mt-[14px] leading-[1.9] text-muted">
          {trendSentence(entries)}
        </p>
      </div>
    </div>
  )
}

function TimelineRow({
  entry,
  selected,
  onSelect,
}: {
  entry: Entry
  selected: boolean
  onSelect: () => void
}) {
  // 圓點的濃度就是那天還在心裡跑的程度。
  const dot = entry.had
    ? { background: 'var(--mine)', opacity: 0.3 + (entry.replay ?? 0) * 0.35 }
    : { background: 'var(--accent)', opacity: 0.8 }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={`w-full cursor-pointer border-0 border-b border-l-2 border-b-rule-soft px-[24px] py-[14px] text-left ${
        selected ? 'border-l-ink bg-wash-3' : 'border-l-transparent bg-transparent'
      }`}
    >
      <div className="flex items-baseline gap-[9px]">
        <span className="t-mono-11-data text-muted">{toShortDate(entry.date)}</span>
        <i aria-hidden className="h-[5px] w-[5px] rounded-full" style={dot} />
        <span className="flex-1" />
        <span className="t-mono-105 text-muted">
          {entry.who?.trim() || copy.EMPTY}
        </span>
      </div>
      {entry.had ? (
        <div className="t-quote-15 truncate text-ink">
          {entry.line?.trim() || copy.today.done.emptyLine}
        </div>
      ) : (
        <div className="t-ui-13 truncate text-muted">{copy.workbench.okLine}</div>
      )}
    </button>
  )
}

function Detail({ entry, entries }: { entry: Entry; entries: Entry[] }) {
  const replay = REPLAY_OPTIONS.find((r) => r.value === (entry.replay ?? 0))?.label
  const facts = [
    [copy.workbench.facts.who, entry.who?.trim() || copy.EMPTY],
    [copy.workbench.facts.occasion, entry.occasion?.trim() || copy.EMPTY],
    [
      copy.workbench.facts.signals,
      entry.signals.length > 0 ? entry.signals.join('、') : copy.EMPTY,
    ],
    [copy.workbench.facts.replay, replay ?? copy.EMPTY],
  ]
  const related = sameWhoBefore(entries, entry)

  return (
    <div>
      <div className="t-quote-26 t-pretty mt-[14px] max-w-[34em] text-ink">
        「{entry.line?.trim() || copy.today.done.emptyLine}」
      </div>

      <div className="mt-[30px] flex flex-wrap gap-[36px]">
        {facts.map(([label, value]) => (
          <div key={label}>
            <div className="t-mono-105-eyebrow text-muted">{label}</div>
            <div className="t-ui-15 mt-[5px] text-ink">{value}</div>
          </div>
        ))}
      </div>

      {related.length > 0 && (
        <>
          <div className="mt-[30px] mb-[20px] h-px bg-rule" />
          <div className="t-mono-11 mb-[12px] text-muted">{copy.workbench.related}</div>
          <div className="flex flex-col gap-[2px]">
            {related.map((e) => (
              <div
                key={e.date}
                className="flex gap-[14px] border-t border-rule-soft py-[10px]"
              >
                <div className="t-mono-11-plain flex-none basis-[80px] text-muted">
                  {toShortDate(e.date)}
                </div>
                <div className="t-quote-16 flex-1 text-mine">{e.line?.trim()}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function NoEntry() {
  return (
    <div>
      <div className="t-quote-26 mt-[14px] text-ink">{copy.workbench.noEntryTitle}</div>
      <p className="t-ui-15-loose t-pretty mt-[10px] text-muted">
        {copy.workbench.noEntryNote}
      </p>
    </div>
  )
}
