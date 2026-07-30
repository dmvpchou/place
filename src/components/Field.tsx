import { useId, type ReactNode } from 'react'

/** 欄位標籤 → 輸入框固定 8px，欄位組之間 18px。 */
export function Field({
  label,
  children,
  className = 'mb-[18px]',
}: {
  label: string
  children: (id: string) => ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="t-label mb-[8px] block text-muted">
        {label}
      </label>
      {children(id)}
    </div>
  )
}

/** 群組型欄位（chip）沒有單一 input 可以 htmlFor，改用純標題。 */
export function FieldLabel({ children }: { children: ReactNode }) {
  return <div className="t-label mb-[8px] text-muted">{children}</div>
}

/**
 * 輸入框的框線與底色。字體另外接一個 .t-* class——
 * 兩個 .t-* class 疊在同一個元素上會互相蓋掉（font 是 shorthand），所以只接一個。
 */
export const inputBase =
  'w-full rounded-[2px] border border-rule bg-wash px-[12px] py-[11px] text-ink'

export const inputClass = `${inputBase} t-ui-15`
/** 只有「那句話」用明體。 */
export const serifInputClass = `${inputBase} t-input-serif`
