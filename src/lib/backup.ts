import { PRODUCT_NAME } from '../constants'
import { migrate, type PersistedState } from '../store/persist'
import { todayISO } from './date'

/**
 * 備份與還原。
 *
 * 這個 app 沒有帳號、沒有同步，所有東西只活在一個瀏覽器的 localStorage 裡：
 * 清一次瀏覽資料、換一支手機、系統回收儲存空間，記錄就沒了。
 * 「匯出 Markdown」是給人讀的，救不回來；這裡的 JSON 是給機器讀的，救得回來。
 *
 * 檔案存在使用者自己的裝置上，不經過任何伺服器。
 */

export const BACKUP_FORMAT = 'weiji.backup.v1'

export interface Backup {
  format: string
  exportedAt: string
  data: PersistedState
}

export function backupFileName(date = todayISO()): string {
  return `${PRODUCT_NAME}-${date}.json`
}

export function toBackup(state: PersistedState): string {
  const backup: Backup = {
    format: BACKUP_FORMAT,
    exportedAt: new Date().toISOString(),
    data: state,
  }
  return JSON.stringify(backup, null, 2)
}

export interface ParsedBackup {
  state: PersistedState
  /** 給確認畫面用的數字，讓使用者知道自己要換上去的是什麼 */
  entryCount: number
  betCount: number
}

/**
 * 讀一份備份。壞掉、不是備份檔、或根本沒有記錄，一律回 null——
 * 由畫面說一句「這個檔案讀不出來」，不丟例外、不寫「錯誤」。
 *
 * 內容的清洗沿用 persist 的 migrate：同一套規則，壞的那筆丟掉就好。
 */
export function parseBackup(text: string): ParsedBackup | null {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object') return null

  const backup = raw as Partial<Backup>
  if (backup.format !== BACKUP_FORMAT || !backup.data) return null

  const state = migrate(backup.data)
  return {
    state,
    entryCount: state.entries.length,
    betCount: state.bets.length,
  }
}

/** 把備份存成檔案。用 Blob + <a download>，不上傳任何東西。 */
export function downloadBackup(state: PersistedState, fileName = backupFileName()) {
  const blob = new Blob([toBackup(state)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 讓瀏覽器先接手下載再釋放
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
