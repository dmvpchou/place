import { useState } from 'react'
import { Button } from '../../components/Button'
import { RadioChipGroup, ToggleChipGroup } from '../../components/ChipGroup'
import { CustomSignalInput } from '../../components/CustomSignalInput'
import { Lines } from '../../components/Lines'
import { REPLAY_OPTIONS } from '../../constants'
import * as copy from '../../copy'
import { todayISO } from '../../lib/date'
import { allSignals } from '../../store/selectors'
import { saveEntry, useAppState } from '../../store/useAppStore'
import type { Replay } from '../../types'
import { ProgressDots } from './ProgressDots'

interface Draft {
  line: string
  who: string
  signals: string[]
  replay: Replay | null
}

const emptyDraft: Draft = { line: '', who: '', signals: [], replay: null }

const textareaClass =
  't-input-serif-17 w-full min-h-[120px] resize-none rounded-[2px] border border-rule bg-wash-3 p-[14px] text-ink'

/**
 * 1b 一次一題。把長表拆成六個呼吸——填寫壓力最低，代價是回顧慢，
 * 所以只在窄螢幕用。
 */
export function WizardShell() {
  const { customSignals } = useAppState()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [okDay, setOkDay] = useState(false)
  const [sigOpen, setSigOpen] = useState(false)

  function go(next: number) {
    setSigOpen(false) // 切換步驟時關閉自訂訊號輸入框
    setStep(next)
  }

  function save() {
    saveEntry({
      date: todayISO(),
      had: true,
      who: draft.who.trim() || undefined,
      line: draft.line.trim() || undefined,
      signals: draft.signals,
      replay: draft.replay ?? 0,
    })
    go(5)
  }

  function saveOk() {
    saveEntry({ date: todayISO(), had: false, signals: [], replay: null })
    setOkDay(true)
    go(5)
  }

  function restart() {
    setDraft(emptyDraft)
    setOkDay(false)
    go(0)
  }

  function toggleSignal(signal: string) {
    setDraft((d) => ({
      ...d,
      signals: d.signals.includes(signal)
        ? d.signals.filter((s) => s !== signal)
        : [...d.signals, signal],
    }))
  }

  const question = [
    copy.wizard.step1.question,
    copy.wizard.step2.question,
    copy.wizard.step3.question,
    copy.wizard.step4.question,
    copy.wizard.step5.question,
    copy.wizard.step6.question,
  ][step]

  return (
    // 外框的 padding 與底色由 AppShell 的 <main> 提供，這裡只負責流程本身。
    <div className="flex flex-1 flex-col">
      <ProgressDots step={step} />

      <div key={step} className="anim-enter flex-1">
        <div className="t-mono-11 text-muted">{copy.wizard.steps[step]}</div>
        <div className="t-quote-27 mt-[14px] mb-[26px] text-ink">{question}</div>

        {step === 0 && (
          <div className="flex flex-col gap-[10px]">
            <Button className="px-[14px] py-[17px] text-left" onClick={() => go(1)}>
              {copy.wizard.step1.yes}
            </Button>
            <Button
              variant="secondary"
              className="px-[14px] py-[17px] text-left"
              onClick={saveOk}
            >
              {copy.wizard.step1.no}
            </Button>
          </div>
        )}

        {step === 1 && (
          <Text
            value={draft.line}
            onChange={(line) => setDraft({ ...draft, line })}
            placeholder={copy.wizard.step2.placeholder}
            label={copy.wizard.step2.question}
            hint={copy.wizard.step2.hint}
          />
        )}

        {step === 2 && (
          <Text
            value={draft.who}
            onChange={(who) => setDraft({ ...draft, who })}
            placeholder={copy.wizard.step3.placeholder}
            label={copy.wizard.step3.question}
            hint={copy.wizard.step3.hint}
          />
        )}

        {step === 3 && (
          <div>
            <ToggleChipGroup
              label={copy.wizard.step4.question}
              options={allSignals(customSignals)}
              selected={draft.signals}
              onToggle={toggleSignal}
            >
              <CustomSignalInput
                placeholder={copy.wizard.step4.addPlaceholder}
                submitWidth={72}
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
            <p className="t-ui-13-hint mt-[16px] text-muted">{copy.wizard.step4.hint}</p>
          </div>
        )}

        {step === 4 && (
          <div>
            <RadioChipGroup
              label={copy.wizard.step5.question}
              options={REPLAY_OPTIONS}
              value={draft.replay}
              onSelect={(replay) => setDraft({ ...draft, replay })}
            />
            <p className="t-ui-13-hint mt-[16px] text-muted">{copy.wizard.step5.hint}</p>
          </div>
        )}

        {step === 5 && <Summary draft={draft} okDay={okDay} />}
      </div>

      <div className="mt-[28px] flex items-center gap-[10px]">
        {step >= 1 && step <= 4 && (
          <>
            <Button
              variant="secondary"
              className="t-ui-14-btn px-[18px] py-[14px]"
              onClick={() => go(step - 1)}
            >
              {copy.wizard.prev}
            </Button>
            <Button
              className="t-btn-16 flex-1 px-[18px] py-[14px]"
              onClick={() => (step === 4 ? save() : go(step + 1))}
            >
              {step === 4 ? copy.wizard.save : copy.wizard.next}
            </Button>
          </>
        )}
        {step === 5 && (
          <Button
            variant="secondary"
            className="t-ui-14-btn flex-1 px-[18px] py-[14px]"
            onClick={restart}
          >
            {copy.wizard.restart}
          </Button>
        )}
      </div>
    </div>
  )
}

function Text({
  value,
  onChange,
  placeholder,
  hint,
  label,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  hint: string
  label: string
}) {
  return (
    <div>
      <textarea
        className={textareaClass}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <p className="t-ui-13-hint mt-[14px] text-muted">{hint}</p>
    </div>
  )
}

function Summary({ draft, okDay }: { draft: Draft; okDay: boolean }) {
  const rows = [
    [copy.wizard.step6.labels.who, okDay ? copy.EMPTY : draft.who.trim() || copy.EMPTY],
    [
      copy.wizard.step6.labels.signals,
      okDay || draft.signals.length === 0 ? copy.EMPTY : draft.signals.join('、'),
    ],
    [
      copy.wizard.step6.labels.replay,
      okDay ? copy.EMPTY : (REPLAY_OPTIONS.find((r) => r.value === (draft.replay ?? 0))?.label ?? copy.EMPTY),
    ],
  ]

  return (
    <div>
      <div className="t-quote-20 leading-[1.8] text-mine">
        {okDay ? copy.wizard.step6.okLine : `「${draft.line.trim() || copy.today.done.emptyLine}」`}
      </div>
      <div className="mt-[24px] mb-[18px] h-px bg-rule" />
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-[14px] py-[8px]">
          <div className="t-mono-11-data flex-none basis-[72px] text-muted">{k}</div>
          <div className="t-ui-14-row flex-1 text-ink">{v}</div>
        </div>
      ))}
      <p className="t-ui-135 mt-[22px] text-muted">
        <Lines
          text={okDay ? copy.today.noDone.note : copy.afterword[draft.replay ?? 0]}
        />
      </p>
    </div>
  )
}
