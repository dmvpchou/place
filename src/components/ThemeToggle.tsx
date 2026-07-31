import * as copy from '../copy'
import { setTheme, useTheme } from '../store/useAppStore'
import type { Theme } from '../types'

const ORDER: (Theme | null)[] = [null, 'light', 'dark']

/**
 * 跟隨系統 ◐ → 淺 ○ → 深 ●。切換只換 CSS 變數，不改結構。
 * 用字元而不是文字，是為了讓側欄底部安靜一點；圓的填滿程度本身就說明了狀態。
 * 純圖示按鈕一定要有 aria-label，不然螢幕閱讀器只會唸到一個圓圈。
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme()
  const mode =
    theme === 'light'
      ? copy.appearance.light
      : theme === 'dark'
        ? copy.appearance.dark
        : copy.appearance.system
  const icon =
    theme === 'light'
      ? copy.appearance.icon.light
      : theme === 'dark'
        ? copy.appearance.icon.dark
        : copy.appearance.icon.system
  const label = copy.appearance.label(mode)

  return (
    <button
      type="button"
      onClick={() => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
      aria-label={label}
      title={label}
      className={`t-ui-13 cursor-pointer border-0 bg-transparent py-[6px] text-left text-muted transition-opacity hover:opacity-85 ${className}`}
    >
      {icon}
    </button>
  )
}
