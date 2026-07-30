import * as copy from '../copy'
import { setTheme, useTheme } from '../store/useAppStore'
import type { Theme } from '../types'

const ORDER: (Theme | null)[] = [null, 'light', 'dark']

/** 跟隨系統 → 淺 → 深 → 跟隨系統。切換只換 CSS 變數，不改結構。 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme()
  const label =
    theme === 'light'
      ? copy.appearance.light
      : theme === 'dark'
        ? copy.appearance.dark
        : copy.appearance.system

  return (
    <button
      type="button"
      onClick={() => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
      className={`t-ui-12 cursor-pointer border-0 bg-transparent py-[6px] text-left text-muted transition-opacity hover:opacity-85 ${className}`}
    >
      {copy.appearance.label(label)}
    </button>
  )
}
