import { Lines } from '../../components/Lines'
import { Rule } from '../../components/Rule'
import * as copy from '../../copy'
import { trendSentence, whoRanking } from '../../store/selectors'
import { useAppState } from '../../store/useAppStore'

export function PatternTab() {
  const { entries } = useAppState()
  const ranking = whoRanking(entries)

  return (
    <div className="anim-enter">
      <div className="t-mono-11 text-muted">{copy.pattern.eyebrow}</div>
      <div className="t-quote-30 mt-[16px] mb-[26px] text-ink">
        <Lines text={copy.pattern.title} />
      </div>

      {ranking.map(({ who, count }) => (
        <div
          key={who}
          className="flex items-center gap-[12px] border-b border-rule py-[11px]"
        >
          <b className="t-ui-15 flex-1 font-normal text-ink">{who}</b>
          {/* 長條是名單的長度感，不是分數。上限 120px。 */}
          <i
            aria-hidden
            className="h-[6px] rounded-[1px] bg-mine"
            style={{ width: Math.min(count * 30, 120) }}
          />
          <span className="t-mono-11-data min-w-[18px] text-right text-muted">
            {count}
          </span>
        </div>
      ))}

      <p className="t-ui-135 t-pretty mt-[18px] text-muted">
        <Lines text={copy.pattern.note} />
      </p>

      <Rule className="mt-[34px] mb-[22px]" />

      <p className="t-quote-20 t-pretty m-0 text-ink">{trendSentence(entries)}</p>
    </div>
  )
}
