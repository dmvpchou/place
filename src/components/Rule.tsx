/** 分隔一律用 1px 線，不用卡片浮起。 */
export function Rule({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-rule ${className}`} />
}
