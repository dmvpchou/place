import type { BetOutcome, Replay } from './types'

/**
 * 全部 UI 文案。逐字取自 handoff README，**不要改寫語氣**——
 * 不評價、不催促、不給建議、不用驚嘆號、不用表情符號。
 * 換行以 \n 表示，畫面端用 <Lines> 拆行。
 */

export const today = {
  ask: {
    ornament: '「　」',
    question: '今天，\n有話沒說出口嗎？',
    yes: '有',
    no: '今天還好',
    note: '沒有也是一筆。不用每天都有東西可寫。',
  },
  form: {
    title: '慢慢來，\n先把那句話放下來。',
    occasion: { label: '那是什麼時候的事', placeholder: '例：跟客戶談範圍的時候' },
    who: { label: '當時和誰', placeholder: '例：客戶、同事、店員' },
    line: {
      label: '你想說、但沒說出口的那句',
      placeholder: '想到什麼寫什麼，只有你看得到',
    },
    signals: {
      label: '那個當下，身體怎麼了',
      add: '＋ 自己寫',
      addPlaceholder: '例：手一直在抖、講話變快',
      addSubmit: '加進去',
      hint: '自己寫的說法會留下來，下次直接出現在上面。',
    },
    replay: { label: '後來還在心裡重播嗎' },
    submit: '先放這裡',
    later: '等一下再說',
  },
  done: {
    title: '放好了。',
    emptyLine: '（先空著）',
    edit: '想改一下',
    toBets: '如果我說了，會怎樣？→',
  },
  noDone: {
    title: '好，今天就這樣。',
    note: '沒有卡住的日子，也值得記一筆。',
    link: '其實有一件事…',
  },
}

/** 已記錄畫面的後記，依重播程度變化。不是鼓勵，是陳述。 */
export const afterword: Record<Replay, string> = {
  2: '還在心裡跑，代表它對你重要。今天寫下來，已經是一次練習了。',
  1: '想過一次也沒什麼。放著就好。',
  0: '沒有留下來，那就先放著。',
}

export const barChart = {
  label: (n: number) => `最近 ${n} 天`,
  note: '高的地方，是那天還在心裡跑的程度。\n這裡不是要你填滿，空著也很好。',
}

export const pattern = {
  eyebrow: '模式',
  title: '對誰會，\n對誰不會。',
  note: '看的不是次數，是名單。\n知道自己對誰特別說不出口，比責備自己不敢爭取，有用得多。',
  trendWithData: '跟上一週差不多。這種事本來就走得慢，不急。',
  trendEmpty: '這裡還很空。先記個兩三週，名單自己會浮出來。',
}

export const bets = {
  eyebrow: '賭注',
  title: '開口之前，\n先猜猜對方會怎樣。',
  intro:
    '你沒說出口，通常是因為心裡先演了一場最壞的。\n把那場戲寫下來，事後回來對答案——這是唯一能拆掉它的方法。',
  recordLabel: '目前戰績',
  recordWith: (settled: number, softer: number) =>
    `已知答案 ${settled} 次，其中 ${softer} 次對方比你賭的溫和。`,
  recordEmpty: '還沒有結案的賭注。第一次回填之後，這裡會告訴你答案。',
  newEyebrow: '下一個賭注',
  fieldLine: {
    label: '① 如果我把這句話說出口',
    placeholder: '從「今天」帶過來，或直接寫',
  },
  fieldBet: {
    label: '② 我賭對方會…',
    placeholder: '例：語氣變差，然後拖著不回我',
  },
  fieldWhen: { label: '③ 什麼時候能知道答案' },
  submitDisabled: '先寫②，才押得下去',
  submit: '押下去',
  waitingTitle: (n: number) => `等結果 · ${n}`,
  settledTitle: (n: number) => `已經知道答案 · ${n}`,
  emptyLine: '（沒寫那句話）',
  myBet: (text: string) => `我賭：${text}`,
  outcomeLabel: '後來呢？',
  actual: (text: string) => `實際上：${text}`,
  actualEmpty: '（等你回來補一句實際發生的事）',
  note: '賭錯不用檢討。你只需要注意一件事：你常常錯在哪一邊。',
}

export const outcomeLabels: Record<BetOutcome, string> = {
  softer: '比我想的溫和',
  same: '跟我賭的一樣',
  worse: '比我想的糟',
}

export const scripts = {
  eyebrow: '腳本',
  title: '先寫好，\n就不必靠當下的勇氣。',
  intro: '照場合分類。下次遇到，翻到那一段，照著唸就好。',
  groupHead: (situation: string) => `遇到 · ${situation}`,
  lastUsed: (days: number | null) =>
    days === null ? '還沒用過' : `上次用在 ${days} 天前`,
  copy: '複製',
  copied: '已複製',
  addPlaceholder: '加一句自己的話',
  addSubmit: '先存起來',
  note: '平述就好，不用解釋，也不用給理由。理由給得越多，越像在請求同意。\n說完可以停下來——沉默會替你工作。',
}

/**
 * 外觀切換。設計稿右上角那組按鈕是畫布的檢視工具，不是產品 UI；
 * 但 README 第 9 節要求產品自己要能手動覆寫，所以這裡用最安靜的做法：
 * 一個和「匯出 Markdown」同級的純文字按鈕。
 */
export const appearance = {
  label: (mode: string) => `外觀 · ${mode}`,
  system: '跟隨系統',
  light: '淺',
  dark: '深',
}

export const nav = {
  today: '今天',
  pattern: '模式',
  bets: '賭注',
  scripts: '腳本',
  export: '匯出 Markdown',
  exported: (n: number) => `已複製 ${n} 天記錄\n可貼進 Obsidian`,
}

export const wizard = {
  steps: ['開場', '那句話', '對誰', '身體', '重播', '放好'],
  progress: (n: number) => `${n} / 6`,
  step1: {
    question: '今天，有話沒說出口嗎？',
    yes: '有，我想放下來',
    no: '今天還好',
  },
  step2: {
    question: '你想說、但沒說出口的那句是什麼？',
    placeholder: '想到什麼寫什麼，只有你看得到',
    hint: '不用寫得好，寫得像你當時想的就好。',
  },
  step3: {
    question: '當時是和誰？',
    placeholder: '例：客戶、同事、店員',
    hint: '寫得夠具體，之後名單才看得出來。',
  },
  step4: {
    question: '那個當下，身體怎麼了？',
    addPlaceholder: '用你自己的說法',
    hint: '沒有標準答案。你自己寫的說法會留下來。',
  },
  step5: {
    question: '後來還在心裡重播嗎？',
    hint: '只是想知道它有沒有跟著你回家。',
  },
  step6: {
    question: '放好了。',
    okLine: '今天還好。',
    labels: { who: '對誰', signals: '身體', replay: '重播' },
  },
  prev: '上一題',
  next: '下一題',
  save: '先放這裡',
  restart: '從頭再看一次',
}

/** 缺值一律以全形破折號代替，不留空。 */
export const EMPTY = '—'
