import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** 主按鈕在 1a 表單是 17px、在提問畫面是 18px */
  size?: 17 | 18
}

/**
 * 全站只有兩種按鈕：實心的 ink 主按鈕，與只有一條 rule 線的次按鈕。
 * hover 只調 opacity——不加陰影、不位移。
 */
export function Button({
  variant = 'primary',
  size = 18,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  const base =
    'rounded-[2px] border cursor-pointer transition-opacity hover:opacity-85 disabled:cursor-default disabled:hover:opacity-100'

  const look =
    variant === 'primary'
      ? `bg-ink border-ink text-on-ink ${size === 18 ? 't-btn-18' : 't-btn-17'}`
      : 'bg-transparent border-rule text-muted t-ui-15'

  return <button type={type} className={`${base} ${look} ${className}`} {...rest} />
}
