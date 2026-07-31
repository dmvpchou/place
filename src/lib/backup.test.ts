import { describe, expect, it } from 'vitest'
import { emptyState } from '../store/persist'
import { BACKUP_FORMAT, backupFileName, parseBackup, toBackup } from './backup'
import type { PersistedState } from '../store/persist'

function sample(): PersistedState {
  const s = emptyState()
  s.entries.push(
    { date: '2026-07-30', had: true, who: '客戶 A', line: '這超出原本範圍。', signals: ['臉熱'], replay: 2 },
    { date: '2026-07-31', had: false, signals: [], replay: null },
  )
  s.customSignals.push('手一直在抖')
  s.bets.push({
    id: 'a',
    date: '2026-07-30',
    line: '這超出原本範圍。',
    bet: '語氣變差',
    when: '這週',
    outcome: 'softer',
    note: '對方直接說好。',
  })
  return s
}

describe('toBackup / parseBackup', () => {
  it('存出去再讀回來是同一份', () => {
    const state = sample()
    const parsed = parseBackup(toBackup(state))
    expect(parsed).not.toBeNull()
    expect(parsed!.state.entries).toEqual(state.entries)
    expect(parsed!.state.bets).toEqual(state.bets)
    expect(parsed!.state.customSignals).toEqual(['手一直在抖'])
  })

  it('回傳筆數給確認畫面用', () => {
    const parsed = parseBackup(toBackup(sample()))
    expect(parsed!.entryCount).toBe(2)
    expect(parsed!.betCount).toBe(1)
  })

  it('不是 JSON、不是備份檔、缺 data 一律回 null，不丟例外', () => {
    expect(parseBackup('不是 JSON')).toBeNull()
    expect(parseBackup('"只是一個字串"')).toBeNull()
    expect(parseBackup(JSON.stringify({ format: '別的 app', data: {} }))).toBeNull()
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT }))).toBeNull()
  })

  it('壞掉的那一筆丟掉，其餘照樣救回來', () => {
    const text = JSON.stringify({
      format: BACKUP_FORMAT,
      exportedAt: '2026-07-31T00:00:00.000Z',
      data: {
        entries: [{ date: '2026-07-30', had: true }, null, { had: true }],
        bets: [],
        customSignals: ['臉熱'],
        scripts: [],
      },
    })
    const parsed = parseBackup(text)
    expect(parsed!.entryCount).toBe(1)
    expect(parsed!.state.entries[0].signals).toEqual([])
  })

  it('空狀態也備份得起來', () => {
    const parsed = parseBackup(toBackup(emptyState()))
    expect(parsed!.entryCount).toBe(0)
    expect(parsed!.state.scripts.length).toBeGreaterThan(0)
  })
})

describe('backupFileName', () => {
  it('檔名帶日期與 .json', () => {
    expect(backupFileName('2026-07-31')).toMatch(/-2026-07-31\.json$/)
  })
})
