import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SCRIPTS } from '../constants'
import { emptyState, load, migrate, save, STORAGE_KEY } from './persist'

describe('emptyState', () => {
  it('首次啟用預載預設腳本，其餘一切空狀態起手', () => {
    const s = emptyState()
    expect(s.entries).toEqual([])
    expect(s.bets).toEqual([])
    expect(s.customSignals).toEqual([])
    expect(s.scripts.map((g) => g.situation)).toEqual(
      DEFAULT_SCRIPTS.map((g) => g.situation),
    )
  })
})

describe('migrate', () => {
  it('缺欄位補預設值', () => {
    const s = migrate({ entries: [{ date: '2026-07-31', had: true }] })
    expect(s.entries[0].signals).toEqual([])
    expect(s.entries[0].replay).toBeNull()
    expect(s.scripts.length).toBe(DEFAULT_SCRIPTS.length)
  })

  it('丟掉壞掉的那一筆，不炸掉整份資料', () => {
    const s = migrate({
      entries: [{ date: '2026-07-31', had: true }, null, { had: true }, 42],
    })
    expect(s.entries).toHaveLength(1)
  })

  it('replay 只收 0 / 1 / 2', () => {
    const s = migrate({
      entries: [{ date: '2026-07-31', had: true, signals: [], replay: 9 }],
    })
    expect(s.entries[0].replay).toBeNull()
  })

  it('完全不是物件時回到空狀態', () => {
    expect(migrate('壞掉的字串').entries).toEqual([])
    expect(migrate(null).entries).toEqual([])
  })
})

describe('load / save', () => {
  beforeEach(() => localStorage.clear())

  it('存進去再讀回來是同一份', () => {
    const s = emptyState()
    s.entries.push({ date: '2026-07-31', had: true, signals: ['臉熱'], replay: 1 })
    s.customSignals.push('手一直在抖')
    save(s)
    const back = load()
    expect(back.entries).toEqual(s.entries)
    expect(back.customSignals).toEqual(['手一直在抖'])
  })

  it('localStorage 裡是壞 JSON 時當作全新開始，不丟錯', () => {
    localStorage.setItem(STORAGE_KEY, '{ 不是 JSON')
    expect(() => load()).not.toThrow()
    expect(load().entries).toEqual([])
  })
})
