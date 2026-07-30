import { describe, expect, it } from 'vitest'
import * as copy from '../copy'
import type { Bet, Entry } from '../types'
import {
  barSeries,
  betRecord,
  recentEntries,
  sameWhoBefore,
  trendSentence,
  whoRanking,
} from './selectors'

const entry = (over: Partial<Entry> & { date: string }): Entry => ({
  had: true,
  signals: [],
  replay: 0,
  ...over,
})

describe('whoRanking', () => {
  it('依次數排序，最多六筆', () => {
    const entries = [
      ...Array.from({ length: 3 }, (_, i) =>
        entry({ date: `2026-07-0${i + 1}`, who: '客戶 A' }),
      ),
      entry({ date: '2026-07-04', who: '主管' }),
      entry({ date: '2026-07-05', who: '主管' }),
      entry({ date: '2026-07-06', who: '房東' }),
    ]
    expect(whoRanking(entries)).toEqual([
      { who: '客戶 A', count: 3 },
      { who: '主管', count: 2 },
      { who: '房東', count: 1 },
    ])
  })

  it('忽略「今天還好」與沒寫對象的日子', () => {
    const entries = [
      entry({ date: '2026-07-01', had: false, replay: null }),
      entry({ date: '2026-07-02', who: '   ' }),
      entry({ date: '2026-07-03' }),
      entry({ date: '2026-07-04', who: '同事 K' }),
    ]
    expect(whoRanking(entries)).toEqual([{ who: '同事 K', count: 1 }])
  })
})

describe('barSeries', () => {
  it('高度是 12 + replay × 18；還好是 6；空白是 3', () => {
    const entries = [
      entry({ date: '2026-07-28', replay: 0 }),
      entry({ date: '2026-07-29', replay: 1 }),
      entry({ date: '2026-07-30', replay: 2 }),
      entry({ date: '2026-07-31', had: false, replay: null }),
    ]
    const bars = barSeries(entries, 5, '2026-07-31')
    expect(bars.map((b) => [b.date, b.height, b.kind])).toEqual([
      ['2026-07-27', 3, 'none'],
      ['2026-07-28', 12, 'had'],
      ['2026-07-29', 30, 'had'],
      ['2026-07-30', 48, 'had'],
      ['2026-07-31', 6, 'ok'],
    ])
  })

  it('空狀態也回傳整段日期，留白本身是資訊', () => {
    const bars = barSeries([], 14, '2026-07-31')
    expect(bars).toHaveLength(14)
    expect(bars.every((b) => b.kind === 'none' && b.height === 3)).toBe(true)
  })
})

describe('recentEntries', () => {
  it('只取最近三週，新的在上面', () => {
    const entries = [
      entry({ date: '2026-07-05' }), // 27 天前，超出範圍
      entry({ date: '2026-07-11' }), // 21 天前，剛好是邊界內的第一天
      entry({ date: '2026-07-20' }),
      entry({ date: '2026-07-31' }),
    ]
    expect(recentEntries(entries, 21, '2026-07-31').map((e) => e.date)).toEqual([
      '2026-07-31',
      '2026-07-20',
      '2026-07-11',
    ])
  })
})

describe('sameWhoBefore', () => {
  const client = (date: string, line: string) =>
    entry({ date, who: '客戶 A', line })

  it('只回同一個對象、且在這天之前的，新的在上面', () => {
    const target = client('2026-07-30', '這超出原本範圍。')
    const entries = [
      client('2026-07-23', '請照順序來。'),
      client('2026-07-27', '上次改的部分還沒付款。'),
      client('2026-08-02', '之後才發生的不算'),
      entry({ date: '2026-07-25', who: '媽媽', line: '我現在不想談。' }),
      target,
    ]
    expect(sameWhoBefore(entries, target).map((e) => e.line)).toEqual([
      '上次改的部分還沒付款。',
      '請照順序來。',
    ])
  })

  it('沒寫對象或沒寫那句話的不算', () => {
    const target = client('2026-07-30', '這超出原本範圍。')
    expect(sameWhoBefore([client('2026-07-20', '   '), target], target)).toEqual([])
    expect(sameWhoBefore([target], entry({ date: '2026-07-30' }))).toEqual([])
  })
})

describe('trendSentence', () => {
  it('沒資料時說這裡還很空', () => {
    expect(trendSentence([])).toBe(copy.pattern.trendEmpty)
  })
  it('有資料時不評價', () => {
    expect(trendSentence([entry({ date: '2026-07-31' })])).toBe(
      copy.pattern.trendWithData,
    )
  })
})

describe('betRecord', () => {
  const bet = (over: Partial<Bet>): Bet => ({
    id: Math.random().toString(),
    date: '2026-07-31',
    line: '',
    bet: '語氣變差',
    when: '這週',
    outcome: null,
    ...over,
  })

  it('沒結案時給的是邀請，不是零分', () => {
    expect(betRecord([bet({}), bet({})])).toBe(copy.bets.recordEmpty)
  })

  it('只算已結案的，並數出溫和的次數', () => {
    const bets = [
      bet({ outcome: 'softer' }),
      bet({ outcome: 'softer' }),
      bet({ outcome: 'worse' }),
      bet({ outcome: null }),
    ]
    expect(betRecord(bets)).toBe(copy.bets.recordWith(3, 2))
  })
})
