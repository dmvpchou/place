import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { inputBase } from '../../components/Field'
import { Lines } from '../../components/Lines'
import { OWN_SCRIPT_SITUATION } from '../../constants'
import * as copy from '../../copy'
import { copyText } from '../../lib/clipboard'
import { daysBetween, todayISO } from '../../lib/date'
import { addScript, markScriptUsed, useAppState } from '../../store/useAppStore'
import type { ScriptGroup } from '../../types'

export function ScriptsTab() {
  const { scripts } = useAppState()
  const [draft, setDraft] = useState('')

  // 自己加的永遠置頂。
  const groups = [...scripts].sort((a, b) =>
    a.situation === OWN_SCRIPT_SITUATION ? -1 : b.situation === OWN_SCRIPT_SITUATION ? 1 : 0,
  )

  function submit() {
    addScript(draft)
    setDraft('')
  }

  return (
    <div className="anim-enter">
      <div className="t-mono-11 text-muted">{copy.scripts.eyebrow}</div>
      <div className="t-quote-30 mt-[16px] mb-[14px] text-ink">
        <Lines text={copy.scripts.title} />
      </div>
      <p className="t-ui-14 mt-0 mb-[26px] text-muted">{copy.scripts.intro}</p>

      {groups.map((group) => (
        <Group key={group.situation} group={group} />
      ))}

      <div className="flex gap-[8px] border-t border-rule pt-[20px]">
        <input
          className={`${inputBase} t-quote-15 min-w-0 flex-1`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={copy.scripts.addPlaceholder}
          aria-label={copy.scripts.addPlaceholder}
        />
        <Button
          onClick={submit}
          className="t-ui-14-btn flex-none basis-[84px] px-0 py-[11px]"
        >
          {copy.scripts.addSubmit}
        </Button>
      </div>

      <p className="t-ui-135 t-pretty mt-[18px] text-muted">
        <Lines text={copy.scripts.note} />
      </p>
    </div>
  )
}

function Group({ group }: { group: ScriptGroup }) {
  return (
    <div className="border-t border-rule pt-[18px] pb-[6px]">
      <div className="mb-[12px] flex items-baseline gap-[10px]">
        <div className="t-ui-13 tracking-[.04em] text-muted">
          {copy.scripts.groupHead(group.situation)}
        </div>
        <span className="flex-1" />
        <span className="t-mono-105 flex-none whitespace-nowrap text-dim">
          {copy.scripts.lastUsed(
            group.lastUsedDate ? daysBetween(group.lastUsedDate, todayISO()) : null,
          )}
        </span>
      </div>
      {group.lines.map((line) => (
        <Line key={line} line={line} situation={group.situation} />
      ))}
    </div>
  )
}

function Line({ line, situation }: { line: string; situation: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function onCopy() {
    const ok = await copyText(line)
    if (!ok) return
    markScriptUsed(situation)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start gap-[14px] py-[9px]">
      <div className="t-quote-19 flex-1 text-ink">{line}</div>
      <button
        type="button"
        onClick={onCopy}
        className={`t-ui-12 mt-[6px] flex-none basis-[62px] cursor-pointer rounded-[2px] border bg-transparent py-[6px] transition-opacity hover:opacity-85 ${
          copied ? 'border-accent text-accent' : 'border-rule text-muted'
        }`}
      >
        {copied ? copy.scripts.copied : copy.scripts.copy}
      </button>
    </div>
  )
}
