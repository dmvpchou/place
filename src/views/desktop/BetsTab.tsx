import { useState } from 'react'
import { Chip } from '../../components/Chip'
import { RadioChipGroup } from '../../components/ChipGroup'
import { inputBase, inputClass } from '../../components/Field'
import { Lines } from '../../components/Lines'
import { BET_WHEN_OPTIONS } from '../../constants'
import * as copy from '../../copy'
import { betRecord, settledBets, waitingBets } from '../../store/selectors'
import { addBet, setBetNote, settleBet, useAppState } from '../../store/useAppStore'
import type { Bet, BetOutcome, BetWhen } from '../../types'

const OUTCOMES: BetOutcome[] = ['softer', 'same', 'worse']

/** 結果標籤的顏色：溫和是系統色，一樣是灰，糟是使用者自己的顏色。 */
const OUTCOME_COLOR: Record<BetOutcome, string> = {
  softer: 'var(--accent)',
  same: 'var(--muted)',
  worse: 'var(--mine)',
}

export function BetsTab({ prefillLine }: { prefillLine: string | null }) {
  const { bets } = useAppState()
  // 從「今天」帶過來的那句話填進①欄。切分頁時本元件會重新掛載，所以放在初始值。
  const [line, setLine] = useState(prefillLine ?? '')
  const [bet, setBet] = useState('')
  const [when, setWhen] = useState<BetWhen>(BET_WHEN_OPTIONS[0])

  const waiting = waitingBets(bets)
  const settled = settledBets(bets)
  // 全站唯一的必填驗證：沒寫②就押不下去。
  const canSubmit = bet.trim().length > 0

  function submit() {
    if (!canSubmit) return
    addBet({ line, bet, when })
    setLine('')
    setBet('')
    setWhen(BET_WHEN_OPTIONS[0])
  }

  return (
    <div className="anim-enter">
      <div className="t-mono-11 text-muted">{copy.bets.eyebrow}</div>
      <div className="t-quote-30 mt-[16px] mb-[14px] text-ink">
        <Lines text={copy.bets.title} />
      </div>
      <p className="t-ui-14 t-pretty mt-0 mb-[8px] text-muted">
        <Lines text={copy.bets.intro} />
      </p>

      {/* 戰績列——這個分頁的說服力來自這一行 */}
      <div className="flex items-center gap-[8px] pt-[14px] pb-[26px]">
        <span className="t-mono-11-data text-muted">{copy.bets.recordLabel}</span>
        <span className="h-px flex-1 bg-rule" />
        <span className="t-ui-15 text-mine">{betRecord(bets)}</span>
      </div>

      <div className="rounded-[2px] border border-rule bg-wash-2 p-[20px]">
        <div className="t-mono-11 mb-[14px] text-muted">{copy.bets.newEyebrow}</div>

        <label className="t-label-125 mb-[7px] block text-muted" htmlFor="bet-line">
          {copy.bets.fieldLine.label}
        </label>
        <input
          id="bet-line"
          className={`${inputBase} t-quote-15 mb-[16px]`}
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder={copy.bets.fieldLine.placeholder}
        />

        <label className="t-label-125 mb-[7px] block text-muted" htmlFor="bet-bet">
          {copy.bets.fieldBet.label}
        </label>
        <input
          id="bet-bet"
          className={`${inputClass} mb-[16px]`}
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          placeholder={copy.bets.fieldBet.placeholder}
        />

        <div className="t-label-125 mb-[7px] text-muted">{copy.bets.fieldWhen.label}</div>
        <div className="mb-[18px]">
          <RadioChipGroup
            label={copy.bets.fieldWhen.label}
            options={BET_WHEN_OPTIONS.map((w) => ({ value: w, label: w }))}
            value={when}
            onSelect={setWhen}
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={`t-quote-17 w-full rounded-[2px] border px-[12px] py-[14px] ${
            canSubmit
              ? 'cursor-pointer border-ink bg-ink text-on-ink transition-opacity hover:opacity-85'
              : 'cursor-default border-rule bg-transparent text-dim'
          }`}
        >
          {canSubmit ? copy.bets.submit : copy.bets.submitDisabled}
        </button>
      </div>

      <div className="t-mono-11 mt-[34px] mb-[4px] text-muted">
        {copy.bets.waitingTitle(waiting.length)}
      </div>
      {waiting.map((b) => (
        <WaitingBet key={b.id} bet={b} />
      ))}

      <div className="t-mono-11 mt-[34px] mb-[4px] text-muted">
        {copy.bets.settledTitle(settled.length)}
      </div>
      {settled.map((b) => (
        <SettledBet key={b.id} bet={b} />
      ))}

      <p className="t-ui-135 t-pretty m-0 border-t border-rule pt-[18px] text-muted">
        {copy.bets.note}
      </p>
    </div>
  )
}

function WaitingBet({ bet }: { bet: Bet }) {
  return (
    <div className="border-t border-rule py-[18px]">
      <div className="t-mono-11-data text-muted">
        {bet.date} · {bet.when}
      </div>
      <div className="t-quote-16 mt-[8px] mb-[2px] text-mine">
        「{bet.line || copy.bets.emptyLine}」
      </div>
      <div className="t-ui-15 mb-[14px] leading-[1.8] text-ink">
        {copy.bets.myBet(bet.bet)}
      </div>
      <div className="t-label-125 mb-[8px] text-muted">{copy.bets.outcomeLabel}</div>
      <div role="group" aria-label={copy.bets.outcomeLabel} className="flex flex-wrap gap-[7px]">
        {OUTCOMES.map((o) => (
          <Chip key={o} onClick={() => settleBet(bet.id, o)}>
            {copy.outcomeLabels[o]}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function SettledBet({ bet }: { bet: Bet }) {
  const [note, setNote] = useState(bet.note ?? '')
  const [editing, setEditing] = useState(false)
  const color = OUTCOME_COLOR[bet.outcome!]

  return (
    <div className="border-t border-rule py-[18px]">
      <div className="flex items-baseline gap-[9px]">
        <span className="t-mono-11-data text-muted">{bet.date}</span>
        <span
          className="t-mono-105 rounded-full border px-[8px] py-[2px]"
          style={{ borderColor: color, color }}
        >
          {copy.outcomeLabels[bet.outcome!]}
        </span>
      </div>
      <div className="t-ui-15 mt-[8px] leading-[1.8] text-muted">
        {copy.bets.myBet(bet.bet)}
      </div>

      {editing ? (
        <input
          autoFocus
          className={`${inputBase} t-quote-15 mt-[6px]`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => {
            setBetNote(bet.id, note)
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
          placeholder={copy.bets.actualEmpty}
          aria-label={copy.bets.actual('')}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="t-quote-18 block w-full cursor-text border-0 bg-transparent p-0 text-left text-ink"
        >
          {bet.note?.trim()
            ? copy.bets.actual(bet.note.trim())
            : copy.bets.actualEmpty}
        </button>
      )}
    </div>
  )
}
