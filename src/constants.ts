import type { BetWhen, Replay, ScriptGroup } from './types'

/**
 * 產品名尚未最終定案（handoff README 第 2 節）。所有畫面一律讀這個常數，
 * 不要把「未寄」寫進任何字串裡。另一處是 vite.config.ts 的 manifest。
 */
export const PRODUCT_NAME = '未寄'
export const PRODUCT_TAGLINE = '讓心情有地方放'

/** 預設身體訊號，不可刪。使用者自訂的訊號排在這四個之後。 */
export const BASE_SIGNALS = [
  '臉熱',
  '胸口一緊',
  '笑著說沒關係',
  '話講一半收掉',
] as const

export const REPLAY_OPTIONS: { value: Replay; label: string }[] = [
  { value: 0, label: '沒有了' },
  { value: 1, label: '想過一次' },
  { value: 2, label: '一直在跑' },
]

export const BET_WHEN_OPTIONS: BetWhen[] = [
  '今天之內',
  '這週',
  '下次見面時',
  '不確定',
]

/** 條狀圖天數。預設 14。 */
export const BAR_DAYS = 14
export const BAR_DAYS_OPTIONS = [7, 14, 30] as const

/** 使用者自己加的腳本歸在這一組，永遠置頂。 */
export const OWN_SCRIPT_SITUATION = '我自己加的'

/** 首次啟用時預載。 */
export const DEFAULT_SCRIPTS: ScriptGroup[] = [
  {
    situation: '被插隊、被打斷',
    lastUsedDate: null,
    lines: ['不好意思，請照順序來。', '我先把這段講完，再換你。'],
  },
  {
    situation: '範圍被追加',
    lastUsedDate: null,
    lines: ['這超出原本範圍，我需要重新報價。', '這件事可以做，但要往後排。'],
  },
  {
    situation: '時程不合理',
    lastUsedDate: null,
    lines: ['這個時程我做不到，要拿掉一項。'],
  },
  {
    situation: '不想繼續談',
    lastUsedDate: null,
    lines: ['我現在不想談這件事。', '我需要想一下，明天回你。'],
  },
  {
    situation: '要錢',
    lastUsedDate: null,
    lines: ['上次改的部分還沒付款。', '我想談加薪，可以約個時間嗎？'],
  },
]
