import { useSyncExternalStore } from 'react'
import { OWN_SCRIPT_SITUATION } from '../constants'
import { todayISO } from '../lib/date'
import type { Bet, BetOutcome, BetWhen, Entry, Theme } from '../types'
import {
  load,
  loadTheme,
  save,
  saveTheme,
  type PersistedState,
} from './persist'

/**
 * 單一 store。狀態表照 handoff README 第 10 節，但只存「真實來源」：
 * 對象排行、條狀圖、趨勢句、賭注戰績都由 selectors 算出來，不進這裡。
 */

let state: PersistedState = load()
let theme: Theme | null = loadTheme()

const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function set(next: Partial<PersistedState>) {
  state = { ...state, ...next }
  save(state)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppState(): PersistedState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  )
}

export function useTheme(): Theme | null {
  return useSyncExternalStore(
    subscribe,
    () => theme,
    () => theme,
  )
}

/* ── actions ──────────────────────────────────────────────── */

/** 每日一筆：同一天再存就覆寫，不會長出第二筆。 */
export function saveEntry(entry: Entry) {
  const rest = state.entries.filter((e) => e.date !== entry.date)
  set({ entries: [...rest, entry].sort((a, b) => a.date.localeCompare(b.date)) })
}

/** 自訂訊號加入後成為常駐選項，之後每次都出現在預設訊號後面。 */
export function addCustomSignal(signal: string): string | null {
  const value = signal.trim()
  if (!value) return null
  if (!state.customSignals.includes(value)) {
    set({ customSignals: [...state.customSignals, value] })
  }
  return value
}

export function addBet(input: { line: string; bet: string; when: BetWhen }) {
  const bet: Bet = {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: todayISO(),
    line: input.line.trim(),
    bet: input.bet.trim(),
    when: input.when,
    outcome: null,
  }
  set({ bets: [...state.bets, bet] })
}

export function settleBet(id: string, outcome: BetOutcome) {
  set({
    bets: state.bets.map((b) => (b.id === id ? { ...b, outcome } : b)),
  })
}

/** 回填「實際上發生了什麼」。空字串代表清掉。 */
export function setBetNote(id: string, note: string) {
  set({
    bets: state.bets.map((b) =>
      b.id === id ? { ...b, note: note.trim() || undefined } : b,
    ),
  })
}

/** 新增的句子歸入置頂的「我自己加的」組。 */
export function addScript(line: string) {
  const value = line.trim()
  if (!value) return
  const own = state.scripts.find((g) => g.situation === OWN_SCRIPT_SITUATION)
  if (own) {
    set({
      scripts: state.scripts.map((g) =>
        g.situation === OWN_SCRIPT_SITUATION ? { ...g, lines: [...g.lines, value] } : g,
      ),
    })
  } else {
    set({
      scripts: [
        { situation: OWN_SCRIPT_SITUATION, lastUsedDate: null, lines: [value] },
        ...state.scripts,
      ],
    })
  }
}

/** 複製一句腳本就當作「用過」，組頭的「上次用在 N 天前」由此更新。 */
export function markScriptUsed(situation: string) {
  set({
    scripts: state.scripts.map((g) =>
      g.situation === situation ? { ...g, lastUsedDate: todayISO() } : g,
    ),
  })
}

/** null ＝ 跟隨系統。 */
export function setTheme(next: Theme | null) {
  theme = next
  saveTheme(next)
  if (next === null) document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', next)
  emit()
}

/** 測試用：清掉記憶體與 localStorage 的狀態。 */
export function __resetForTests(next?: Partial<PersistedState>) {
  state = { ...load(), ...next }
  emit()
}
