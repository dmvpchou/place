import { PRODUCT_NAME } from '../constants'
import type { Bet, Entry } from '../types'
import { bets as betsCopy, EMPTY, outcomeLabels } from '../copy'

/**
 * 匯出成可貼進 Obsidian 的 Markdown。純文字、無評分、無統計摘要——
 * 這裡只是把使用者自己的話原樣交還給他。
 */

const REPLAY_TEXT = ['沒有了', '想過一次', '一直在跑']

function entryToMarkdown(e: Entry): string {
  if (!e.had) return `## ${e.date}\n\n今天還好。\n`

  const meta = [e.occasion?.trim() || EMPTY, e.who?.trim() || EMPTY].join(' · ')
  const lines = [`## ${e.date}`, '', meta, '']

  const line = e.line?.trim()
  if (line) lines.push(`> ${line.split('\n').join('\n> ')}`, '')

  if (e.signals.length > 0) lines.push(`身體：${e.signals.join('、')}`)
  if (e.replay !== null) lines.push(`重播：${REPLAY_TEXT[e.replay]}`)

  return lines.join('\n').replace(/\n+$/, '') + '\n'
}

function betToMarkdown(b: Bet): string {
  const lines = [`- ${b.date} · ${b.when}`]
  if (b.line.trim()) lines.push(`  - 「${b.line.trim()}」`)
  lines.push(`  - 我賭：${b.bet}`)
  if (b.outcome) lines.push(`  - 結果：${outcomeLabels[b.outcome]}`)
  if (b.note?.trim()) lines.push(`  - 實際上：${b.note.trim()}`)
  return lines.join('\n')
}

export function exportMarkdown(entries: Entry[], bets: Bet[] = []): string {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const out = [`# ${PRODUCT_NAME}`, '']

  for (const e of sorted) out.push(entryToMarkdown(e), '')

  if (bets.length > 0) {
    out.push('---', '', `## ${betsCopy.eyebrow}`, '')
    const sortedBets = [...bets].sort((a, b) => b.date.localeCompare(a.date))
    for (const b of sortedBets) out.push(betToMarkdown(b), '')
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}
