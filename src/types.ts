/** 0 沒有了 / 1 想過一次 / 2 一直在跑 */
export type Replay = 0 | 1 | 2

export interface Entry {
  /** YYYY-MM-DD，每日一筆 */
  date: string
  /** false ＝「今天還好」。這是平權的答案，不是跳過。 */
  had: boolean
  occasion?: string
  who?: string
  /** 那句沒說出口的話 */
  line?: string
  /** 身體訊號，可複選，可自訂 */
  signals: string[]
  replay: Replay | null
}

export type BetWhen = '今天之內' | '這週' | '下次見面時' | '不確定'
export type BetOutcome = 'softer' | 'same' | 'worse'

export interface Bet {
  id: string
  date: string
  /** 如果我把這句話說出口 */
  line: string
  /** 我賭對方會…（唯一必填） */
  bet: string
  when: BetWhen
  outcome: BetOutcome | null
  /** 實際發生的事 */
  note?: string
}

export interface ScriptGroup {
  /** 遇到 · <場合> */
  situation: string
  /**
   * handoff README 的資料模型寫的是 `lastUsedDaysAgo: number | null`，
   * 但那是個會過期的快照——存下來的「0 天前」明天還是會顯示 0 天前。
   * 這裡改存日期，畫面上的「上次用在 N 天前」由它算出來。
   */
  lastUsedDate: string | null
  lines: string[]
}

export type Theme = 'light' | 'dark'
/** 'records'（完整紀錄）不在分頁列上，是從「⋯」進來的回顧視圖。 */
export type Tab = 'today' | 'pattern' | 'bets' | 'scripts' | 'records'
export type TodayScreen = 'ask' | 'form' | 'done' | 'no-done'
