import * as copy from '../../copy'

/** 六個點。已完成是使用者的顏色，當前那顆變長，還沒到的只有一條線。 */
export function ProgressDots({ step }: { step: number }) {
  return (
    <div className="mb-[38px] flex items-center gap-[7px]">
      {copy.wizard.steps.map((label, i) => (
        <i
          key={label}
          aria-hidden
          className="h-[6px] rounded-full transition-[width] duration-[250ms] ease-out"
          style={{
            width: i === step ? 18 : 6,
            background:
              i < step ? 'var(--mine)' : i === step ? 'var(--ink)' : 'var(--rule)',
          }}
        />
      ))}
      <div className="flex-1" />
      <div className="t-mono-11 text-muted">{copy.wizard.progress(step + 1)}</div>
    </div>
  )
}
