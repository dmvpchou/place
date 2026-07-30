import { DEFAULT_SCRIPTS } from '../constants'
import type { Bet, Entry, ScriptGroup, Theme } from '../types'

/**
 * 全部本機儲存，不需要帳號。文案一再向使用者承諾「只有你看得到」——
 * 這裡不得加入任何對外傳輸。日後若要同步，資料必須加密。
 */
export const STORAGE_KEY = 'weiji.v1'
/** 與 index.html 裡的開機腳本共用，改這裡要一起改。 */
export const THEME_KEY = 'weiji.theme'

export const SCHEMA_VERSION = 1

export interface PersistedState {
  schemaVersion: number
  entries: Entry[]
  customSignals: string[]
  bets: Bet[]
  scripts: ScriptGroup[]
}

export function emptyState(): PersistedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    entries: [],
    customSignals: [],
    bets: [],
    // 首次啟用預載預設腳本；其餘一切空狀態起手。
    scripts: DEFAULT_SCRIPTS.map((g) => ({ ...g, lines: [...g.lines] })),
  }
}

const isString = (v: unknown): v is string => typeof v === 'string'

/** 舊資料缺欄位就補預設值，型別不對就丟掉那一筆——不讓壞資料炸掉整個 app。 */
export function migrate(raw: unknown): PersistedState {
  const base = emptyState()
  if (!raw || typeof raw !== 'object') return base
  const data = raw as Partial<PersistedState>

  const entries: Entry[] = Array.isArray(data.entries)
    ? data.entries.filter(
        (e): e is Entry =>
          !!e && isString((e as Entry).date) && typeof (e as Entry).had === 'boolean',
      ).map((e) => ({
        ...e,
        signals: Array.isArray(e.signals) ? e.signals.filter(isString) : [],
        replay: e.replay === 0 || e.replay === 1 || e.replay === 2 ? e.replay : null,
      }))
    : base.entries

  const bets: Bet[] = Array.isArray(data.bets)
    ? data.bets.filter(
        (b): b is Bet => !!b && isString((b as Bet).id) && isString((b as Bet).bet),
      )
    : base.bets

  const scripts: ScriptGroup[] = Array.isArray(data.scripts)
    ? data.scripts
        .filter((g): g is ScriptGroup => !!g && isString((g as ScriptGroup).situation))
        .map((g) => ({
          situation: g.situation,
          lastUsedDate: isString(g.lastUsedDate) ? g.lastUsedDate : null,
          lines: Array.isArray(g.lines) ? g.lines.filter(isString) : [],
        }))
    : base.scripts

  return {
    schemaVersion: SCHEMA_VERSION,
    entries,
    customSignals: Array.isArray(data.customSignals)
      ? data.customSignals.filter(isString)
      : base.customSignals,
    bets,
    scripts,
  }
}

export function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    return migrate(JSON.parse(raw))
  } catch {
    // 無痕模式、配額用盡、JSON 壞掉——一律當作全新開始，不打擾使用者。
    return emptyState()
  }
}

export function save(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* 存不進去就算了，不報錯 */
  }
}

export function loadTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function saveTheme(theme: Theme | null): void {
  try {
    if (theme === null) localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* 同上 */
  }
}
