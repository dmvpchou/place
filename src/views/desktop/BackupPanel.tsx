import { useEffect, useRef, useState } from 'react'
import * as copy from '../../copy'
import {
  backupFileName,
  downloadBackup,
  parseBackup,
  type ParsedBackup,
} from '../../lib/backup'
import { replaceAll, useAppState } from '../../store/useAppStore'

type Stage =
  | { kind: 'closed' }
  | { kind: 'menu' }
  | { kind: 'saved'; fileName: string }
  | { kind: 'picked'; parsed: ParsedBackup }
  | { kind: 'unreadable' }
  | { kind: 'restored' }

const linkClass =
  't-ui-12 cursor-pointer border-0 bg-transparent p-0 text-left text-accent hover:text-accent-hi'

/**
 * 側欄底部的「備份」。點開後「存成檔案」與「從備份還原」並列——
 * 還原不能藏在存檔之後：真正需要還原的人，資料通常剛好已經沒了。
 *
 * 還原是全站唯一會蓋掉既有記錄的動作，所以一定先讓使用者看到
 * 「這份備份有幾天記錄」再問一次。
 */
export function BackupPanel({
  className = '',
  resetKey,
}: {
  className?: string
  /** 這個值一變就收起面板（切換分頁時），與「匯出」的行為一致 */
  resetKey?: string
}) {
  const state = useAppState()
  const [stage, setStage] = useState<Stage>({ kind: 'closed' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => setStage({ kind: 'closed' }), [resetKey])

  function save() {
    const fileName = backupFileName()
    downloadBackup(state, fileName)
    setStage({ kind: 'saved', fileName })
  }

  async function onPick(file: File | undefined) {
    if (!file) return
    const parsed = parseBackup(await file.text())
    setStage(parsed ? { kind: 'picked', parsed } : { kind: 'unreadable' })
  }

  const open = stage.kind !== 'closed'

  return (
    <>
      <button
        type="button"
        onClick={() => setStage(open ? { kind: 'closed' } : { kind: 'menu' })}
        aria-expanded={open}
        className={`t-ui-12 cursor-pointer border-0 bg-transparent py-[6px] text-left text-muted transition-opacity hover:opacity-85 ${className}`}
      >
        {copy.backup.action}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          void onPick(e.target.files?.[0])
          e.target.value = '' // 讓同一個檔案可以再選一次
        }}
      />

      {open && (
        <div className="anim-enter mt-[8px] rounded-[2px] border border-rule bg-wash-3 px-[12px] py-[11px] max-[899px]:w-full">
          {stage.kind === 'menu' && (
            <>
              <p className="t-ui-12 mt-0 mb-[10px] leading-[1.7] text-dim">
                {copy.backup.why}
              </p>
              <div className="flex gap-[14px]">
                <button type="button" onClick={save} className={linkClass}>
                  {copy.backup.save}
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={linkClass}
                >
                  {copy.backup.restore}
                </button>
              </div>
            </>
          )}

          {stage.kind === 'saved' && (
            <>
              <div className="t-mono-11 leading-[1.7] text-muted">
                {copy.backup.saved(stage.fileName)}
              </div>
              <p className="t-ui-12 mt-[6px] mb-0 text-dim">{copy.backup.hint}</p>
            </>
          )}

          {stage.kind === 'picked' && (
            <>
              <div className="t-ui-12 leading-[1.7] text-ink">
                {copy.backup.found(stage.parsed.entryCount, stage.parsed.betCount)}
              </div>
              <p className="t-ui-12 mt-[6px] mb-[10px] leading-[1.7] text-muted">
                {copy.backup.willReplace}
              </p>
              <div className="flex gap-[14px]">
                <button
                  type="button"
                  onClick={() => {
                    replaceAll(stage.parsed.state)
                    setStage({ kind: 'restored' })
                    // 整份資料被換掉了，但畫面的狀態是各自在掛載時算出來的
                    // （「今天」的四種狀態、逐題流程的進度、工作台選了哪一天）。
                    // 換完重載一次，讓每個畫面都從新資料重新算，不留任何舊的殘影。
                    setTimeout(() => window.location.reload(), 800)
                  }}
                  className={linkClass}
                >
                  {copy.backup.confirm}
                </button>
                <button
                  type="button"
                  onClick={() => setStage({ kind: 'closed' })}
                  className="t-ui-12 cursor-pointer border-0 bg-transparent p-0 text-muted hover:opacity-85"
                >
                  {copy.backup.cancel}
                </button>
              </div>
            </>
          )}

          {stage.kind === 'unreadable' && (
            <div className="t-ui-12 leading-[1.7] text-muted">
              {copy.backup.unreadable}
            </div>
          )}

          {stage.kind === 'restored' && (
            <div className="t-ui-12 leading-[1.7] text-muted">{copy.backup.restored}</div>
          )}
        </div>
      )}
    </>
  )
}
