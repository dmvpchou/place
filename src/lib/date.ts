/** 全部日期都用本地時區的 YYYY-MM-DD 字串，不用 UTC——跨日以使用者所在地為準。 */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** MM-DD，1c 時間軸用 */
export function toShortDate(iso: string): string {
  return iso.slice(5)
}

/** 從 iso 往回推 n 天的日期字串 */
export function shiftDays(iso: string, delta: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + delta)
  return toISODate(d)
}

/** 最近 n 天的日期字串，由舊到新，最後一天是 endISO */
export function lastNDays(n: number, endISO: string = todayISO()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(shiftDays(endISO, -i))
  return out
}

export function daysBetween(fromISO: string, toISOStr: string): number {
  const ms = parseISODate(toISOStr).getTime() - parseISODate(fromISO).getTime()
  return Math.round(ms / 86_400_000)
}
