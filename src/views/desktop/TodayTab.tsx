import { useState } from 'react'
import { BarChart } from '../../components/BarChart'
import { Button } from '../../components/Button'
import { RadioChipGroup, ToggleChipGroup } from '../../components/ChipGroup'
import { CustomSignalInput } from '../../components/CustomSignalInput'
import { Field, FieldLabel, inputClass, serifInputClass } from '../../components/Field'
import { Lines } from '../../components/Lines'
import { Rule } from '../../components/Rule'
import { BAR_DAYS, REPLAY_OPTIONS } from '../../constants'
import * as copy from '../../copy'
import { todayISO } from '../../lib/date'
import { allSignals, barSeries, entryForDate } from '../../store/selectors'
import { saveEntry, useAppState } from '../../store/useAppStore'
import type { Entry, Replay, TodayScreen } from '../../types'

interface Draft {
  occasion: string
  who: string
  line: string
  signals: string[]
  replay: Replay | null
}

const emptyDraft: Draft = { occasion: '', who: '', line: '', signals: [], replay: null }

function draftFrom(entry: Entry | undefined): Draft {
  if (!entry) return emptyDraft
  return {
    occasion: entry.occasion ?? '',
    who: entry.who ?? '',
    line: entry.line ?? '',
    signals: [...entry.signals],
    replay: entry.replay,
  }
}

export function TodayTab({ onAskBets }: { onAskBets: (line: string) => void }) {
  const { entries, customSignals } = useAppState()
  const today = todayISO()
  const saved = entryForDate(entries, today)

  // 今天已經放過了就直接看已記錄的樣子，不再問一次同一個問題。
  const [screen, setScreen] = useState<TodayScreen>(() =>
    saved ? (saved.had ? 'done' : 'no-done') : 'ask',
  )
  const [draft, setDraft] = useState<Draft>(() => draftFrom(saved))
  const [sigOpen, setSigOpen] = useState(false)

  const bars = barSeries(entries, BAR_DAYS, today)

  function toggleSignal(signal: string) {
    setDraft((d) => ({
      ...d,
      signals: d.signals.includes(signal)
        ? d.signals.filter((s) => s !== signal)
        : [...d.signals, signal],
    }))
  }

  function openForm() {
    setDraft(draftFrom(entryForDate(entries, today)))
    setSigOpen(false)
    setScreen('form')
  }

  function save() {
    saveEntry({
      date: today,
      had: true,
      occasion: draft.occasion.trim() || undefined,
      who: draft.who.trim() || undefined,
      line: draft.line.trim() || undefined,
      signals: draft.signals,
      // 沒選重播就當作「沒有了」——不逼使用者回答。
      replay: draft.replay ?? 0,
    })
    setSigOpen(false)
    setScreen('done')
  }

  function saveOk() {
    saveEntry({ date: today, had: false, signals: [], replay: null })
    setScreen('no-done')
  }

  return (
    <div>
      <div key={screen} className="anim-enter">
        {screen === 'ask' && <Ask onYes={openForm} onNo={saveOk} />}

        {screen === 'form' && (
          <div>
            <div className="t-quote-30 mb-[26px] text-ink">
              <Lines text={copy.today.form.title} />
            </div>

            <Field label={copy.today.form.occasion.label}>
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  value={draft.occasion}
                  onChange={(e) => setDraft({ ...draft, occasion: e.target.value })}
                  placeholder={copy.today.form.occasion.placeholder}
                />
              )}
            </Field>

            <Field label={copy.today.form.who.label}>
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  value={draft.who}
                  onChange={(e) => setDraft({ ...draft, who: e.target.value })}
                  placeholder={copy.today.form.who.placeholder}
                />
              )}
            </Field>

            <Field label={copy.today.form.line.label}>
              {(id) => (
                <textarea
                  id={id}
                  className={`${serifInputClass} min-h-[88px] resize-y`}
                  value={draft.line}
                  onChange={(e) => setDraft({ ...draft, line: e.target.value })}
                  placeholder={copy.today.form.line.placeholder}
                />
              )}
            </Field>

            <FieldLabel>{copy.today.form.signals.label}</FieldLabel>
            <ToggleChipGroup
              label={copy.today.form.signals.label}
              options={allSignals(customSignals)}
              selected={draft.signals}
              onToggle={toggleSignal}
            >
              <CustomSignalInput
                placeholder={copy.today.form.signals.addPlaceholder}
                submitWidth={68}
                open={sigOpen}
                onOpenChange={setSigOpen}
                onAdded={(signal) =>
                  setDraft((d) => ({
                    ...d,
                    signals: d.signals.includes(signal)
                      ? d.signals
                      : [...d.signals, signal],
                  }))
                }
              />
            </ToggleChipGroup>
            <p className="t-ui-125 mt-[12px] mb-[20px] text-dim">
              {copy.today.form.signals.hint}
            </p>

            <FieldLabel>{copy.today.form.replay.label}</FieldLabel>
            <div className="mb-[24px]">
              <RadioChipGroup
                label={copy.today.form.replay.label}
                options={REPLAY_OPTIONS}
                value={draft.replay}
                onSelect={(replay) => setDraft({ ...draft, replay })}
              />
            </div>

            <div className="flex gap-[10px]">
              <Button size={17} className="flex-1 px-[12px] py-[15px]" onClick={save}>
                {copy.today.form.submit}
              </Button>
              <Button
                variant="secondary"
                className="flex-none basis-[128px] px-[12px] py-[15px]"
                onClick={() => {
                  // 草稿不保留：這裡不是待辦事項，沒寫完就是沒寫完。
                  setSigOpen(false)
                  const existing = entryForDate(entries, today)
                  if (existing) setScreen(existing.had ? 'done' : 'no-done')
                  else setScreen('ask')
                }}
              >
                {copy.today.form.later}
              </Button>
            </div>
          </div>
        )}

        {screen === 'done' && saved?.had && (
          <Done entry={saved} onEdit={openForm} onAskBets={onAskBets} />
        )}

        {screen === 'no-done' && (
          <div>
            <div className="t-quote-30 mb-[14px] text-ink">{copy.today.noDone.title}</div>
            <p className="t-ui-15-loose m-0 text-muted">{copy.today.noDone.note}</p>
            <button
              type="button"
              onClick={openForm}
              className="t-ui-135 cursor-pointer border-0 bg-transparent p-0 pt-[20px] text-accent hover:text-accent-hi"
            >
              {copy.today.noDone.link}
            </button>
          </div>
        )}
      </div>

      <Rule className="mt-[36px] mb-[22px]" />
      <BarChart bars={bars} />
    </div>
  )
}

function Ask({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div>
      <div aria-hidden className="t-ornament text-rule select-none">
        {copy.today.ask.ornament}
      </div>
      <div className="t-quote-30 mt-[16px] mb-[28px] text-ink">
        <Lines text={copy.today.ask.question} />
      </div>
      <div className="flex gap-[10px]">
        <Button className="flex-1 px-[12px] py-[16px]" onClick={onYes}>
          {copy.today.ask.yes}
        </Button>
        <Button
          variant="secondary"
          className="flex-none basis-[128px] px-[12px] py-[16px]"
          onClick={onNo}
        >
          {copy.today.ask.no}
        </Button>
      </div>
      <p className="t-ui-135 mt-[18px] text-muted">{copy.today.ask.note}</p>
    </div>
  )
}

function Done({
  entry,
  onEdit,
  onAskBets,
}: {
  entry: Entry
  onEdit: () => void
  onAskBets: (line: string) => void
}) {
  const meta = [entry.occasion?.trim() || copy.EMPTY, entry.who?.trim() || copy.EMPTY]
  return (
    <div>
      <div className="t-quote-30 mb-[14px] text-ink">{copy.today.done.title}</div>
      <div className="t-mono-11-data text-muted">{meta.join(' · ')}</div>
      <div className="t-quote-20 mt-[10px] text-mine">
        「{entry.line?.trim() || copy.today.done.emptyLine}」
      </div>
      {entry.signals.length > 0 && (
        <div className="t-mono-11-data mt-[12px] text-muted">
          {entry.signals.join('、')}
        </div>
      )}
      <p className="t-ui-135 mt-[18px] text-muted">{copy.afterword[entry.replay ?? 0]}</p>
      <div className="flex gap-[18px] pt-[20px]">
        <button
          type="button"
          onClick={onEdit}
          className="t-ui-135 cursor-pointer border-0 bg-transparent p-0 text-accent hover:text-accent-hi"
        >
          {copy.today.done.edit}
        </button>
        <button
          type="button"
          onClick={() => onAskBets(entry.line?.trim() ?? '')}
          className="t-ui-135 cursor-pointer border-0 bg-transparent p-0 text-accent hover:text-accent-hi"
        >
          {copy.today.done.toBets}
        </button>
      </div>
    </div>
  )
}
