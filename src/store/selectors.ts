import { BASE_SIGNALS } from '../constants'
import * as copy from '../copy'
import { lastNDays, shiftDays, todayISO } from '../lib/date'
import type { Bet, Entry } from '../types'

/**
 * 衍生值一律用算的，不另存。entries 是唯一真實來源。
 */

export interface WhoCount {
  who: string
  count: number
}

/** 對象排行：依出現次數排序，最多 6 筆。看的不是次數，是名單。 */
export function whoRanking(entries: Entry[], limit = 6): WhoCount[] {
  const counts = new Map<string, number>()
  for (const e of entries) {
    if (!e.had) continue
    const who = e.who?.trim()
    if (!who) continue
    counts.set(who, (counts.get(who) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([who, count]) => ({ who, count }))
    .sort((a, b) => b.count - a.count || a.who.localeCompare(b.who))
    .slice(0, limit)
}

export type BarKind = 'none' | 'ok' | 'had'

export interface Bar {
  date: string
  height: number
  kind: BarKind
}

/**
 * 條狀圖。高度公式：有記錄 12 + replay × 18；「今天還好」6；無資料 3。
 * 顏色由 kind 決定（had → --mine，ok → --accent，none → --rule）。
 */
export function barSeries(
  entries: Entry[],
  days: number,
  endISO: string = todayISO(),
): Bar[] {
  const byDate = new Map(entries.map((e) => [e.date, e]))
  return lastNDays(days, endISO).map((date) => {
    const e = byDate.get(date)
    if (!e) return { date, height: 3, kind: 'none' as const }
    if (!e.had) return { date, height: 6, kind: 'ok' as const }
    return { date, height: 12 + (e.replay ?? 0) * 18, kind: 'had' as const }
  })
}

/** 趨勢句。有資料與沒資料是兩句不同的話，都不是評價。 */
export function trendSentence(entries: Entry[]): string {
  return entries.length > 0 ? copy.pattern.trendWithData : copy.pattern.trendEmpty
}

/** 賭注戰績——這一行是「賭注」分頁說服力的來源。 */
export function betRecord(bets: Bet[]): string {
  const settled = bets.filter((b) => b.outcome !== null)
  if (settled.length === 0) return copy.bets.recordEmpty
  const softer = settled.filter((b) => b.outcome === 'softer').length
  return copy.bets.recordWith(settled.length, softer)
}

/** 預設訊號永遠在前，使用者自訂的接在後面。 */
export function allSignals(customSignals: string[]): string[] {
  return [...BASE_SIGNALS, ...customSignals]
}

export function entryForDate(entries: Entry[], date: string): Entry | undefined {
  return entries.find((e) => e.date === date)
}

/** 工作台左欄的時間軸：最近三週，新的在上面。 */
export function recentEntries(
  entries: Entry[],
  days = 21,
  endISO: string = todayISO(),
): Entry[] {
  const from = shiftDays(endISO, -(days - 1))
  return entries
    .filter((e) => e.date >= from && e.date <= endISO)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * 同一個對象，在這一天之前發生過的。
 * 這是工作台真正的用處——一個名字底下累積的那幾句話擺在一起，形狀才看得出來。
 */
export function sameWhoBefore(entries: Entry[], entry: Entry): Entry[] {
  const who = entry.who?.trim()
  if (!who) return []
  return entries
    .filter(
      (e) => e.had && e.date < entry.date && e.who?.trim() === who && e.line?.trim(),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function waitingBets(bets: Bet[]): Bet[] {
  return bets.filter((b) => b.outcome === null)
}

export function settledBets(bets: Bet[]): Bet[] {
  return bets.filter((b) => b.outcome !== null)
}
