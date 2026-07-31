import { describe, expect, it } from 'vitest'
import type { Bet, Entry } from '../types'
import { bets as betsCopy } from '../copy'
import { exportMarkdown } from './markdown'

const entries: Entry[] = [
  {
    date: '2026-07-30',
    had: true,
    occasion: '跟客戶談範圍的時候',
    who: '客戶 A',
    line: '這已經超出原本說好的了。',
    signals: ['胸口一緊', '笑著說沒關係'],
    replay: 2,
  },
  { date: '2026-07-31', had: false, signals: [], replay: null },
]

describe('exportMarkdown', () => {
  it('新的在前，「今天還好」也是一筆', () => {
    const md = exportMarkdown(entries)
    expect(md.indexOf('## 2026-07-31')).toBeLessThan(md.indexOf('## 2026-07-30'))
    expect(md).toContain('今天還好。')
  })

  it('那句話用引言區塊，身體與重播照實寫', () => {
    const md = exportMarkdown(entries)
    expect(md).toContain('> 這已經超出原本說好的了。')
    expect(md).toContain('跟客戶談範圍的時候 · 客戶 A')
    expect(md).toContain('身體：胸口一緊、笑著說沒關係')
    expect(md).toContain('重播：一直在跑')
  })

  it('缺欄位以破折號代替，不留空', () => {
    const md = exportMarkdown([
      { date: '2026-07-29', had: true, signals: [], replay: 0 },
    ])
    expect(md).toContain('— · —')
  })

  it('沒有賭注時不長出那一段', () => {
    expect(exportMarkdown(entries)).not.toContain(`## ${betsCopy.eyebrow}`)
  })

  it('有賭注時附上結果與實際發生的事', () => {
    const bets: Bet[] = [
      {
        id: 'a',
        date: '2026-07-30',
        line: '這已經超出原本說好的了。',
        bet: '語氣變差，然後拖著不回我',
        when: '這週',
        outcome: 'softer',
        note: '對方直接說好，還多給了三天。',
      },
    ]
    const md = exportMarkdown(entries, bets)
    expect(md).toContain(`## ${betsCopy.eyebrow}`)
    expect(md).toContain('結果：比我想的溫和')
    expect(md).toContain('實際上：對方直接說好，還多給了三天。')
  })
})
