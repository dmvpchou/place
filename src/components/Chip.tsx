import type { ButtonHTMLAttributes } from 'react'

type Look = 'plain' | 'selected' | 'dashed'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  look?: Look
}

/** chip 是全站唯一的圓角元件（999px）。未選只有一條線，選中才上 accent 底。 */
export function Chip({ look = 'plain', className = '', ...rest }: Props) {
  const looks: Record<Look, string> = {
    plain: 'bg-transparent border border-rule text-muted',
    selected: 'bg-accent border border-accent text-on-accent',
    dashed: 'bg-transparent border border-dashed border-rule text-dim',
  }
  return (
    <button
      type="button"
      className={`t-chip cursor-pointer rounded-full px-[14px] py-[8px] transition-opacity hover:opacity-85 ${looks[look]} ${className}`}
      {...rest}
    />
  )
}
