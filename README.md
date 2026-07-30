# 未寄 · Place

**讓心情有地方放。** A place to put how you feel.

[繁體中文](#繁體中文) · [English](#english)

---

## 繁體中文

> 這不是一個記錄情緒的工具，是一個幫情緒**歸位**的工具。

每天問一句「今天，有話沒說出口嗎？」，把沒說出口的那句話、對象、場合、身體反應放下來。累積之後，看見自己對誰特別說不出口，並用「賭注」與「腳本」練習下一次真的開口。

單機、本機儲存、不需要帳號、可離線。所有內容只有你看得到。

### 只有你看得到

這不是一句行銷詞，是這個產品的實作方式。

- **沒有帳號、沒有伺服器、沒有雲端同步。** 沒有地方可以登入，因為沒有東西在別的地方。
- **沒有分析、沒有追蹤、沒有遙測。** 專案裡沒有任何一行統計或回報的程式碼。
- **沒有任何使用者資料離開這台裝置。** 你寫的每一句話、每一個對象、每一次賭注，都只存在瀏覽器的 localStorage 裡。想帶走就用「匯出 Markdown」，那是複製到你自己的剪貼簿，不經過任何人。
- **連空白也是私密的。** 哪幾天你沒寫、哪幾天寫了「今天還好」，同樣只有你知道。留白是資訊，那份資訊也是你的。

唯一會對外發出的請求是 Google Fonts CDN 的字體檔（首次載入後由 service worker 快取，之後離線可用）。那個請求不包含你寫的任何內容，但它確實會讓 Google 看到你的 IP——把字體子集自打包、拿掉這個相依，列在下面的待辦裡。

日後若真的做雲端同步，資料必須先加密才能離開裝置。

### 為什麼

**原點・亞洲家長。**「忍一下就過去了。」我們是被這樣帶大的：別吵、別給人添麻煩、別人會怎麼看。情緒不是不被允許，是從來沒有被分配到位置。於是那句話就留在原地——不會消失，只會在半夜、在洗澡的時候、在下一次同樣的場合，自己跑出來。

**方法・整理術。** 佐藤可士和說，整理不是把東西丟掉，是先問出真正的核心，再讓每一樣東西回到它該在的位置。房間亂，不是因為東西太多，是因為沒有位置。心情也一樣。所以流程固定為三步：

1. **拿出來** — 把那句沒說出口的話，原封不動寫下來。不修飾、不解釋。
2. **歸位** — 問三個問題就好：對誰、什麼場合、身體怎麼了。這是給它一個座標。
3. **留白** — 空著的日子不補、不催、不獎勵。留白本身也是資訊。

### 四個分頁

四個分頁不是四個功能，是同一個整理動作的四個階段。

| 分頁 | 階段 | 做什麼 |
|---|---|---|
| 今天 | 拿出來 | 記錄今天沒說出口的那句話 |
| 模式 | 歸位後的觀察 | 看出對誰特別說不出口 |
| 賭注 | 校正預期 | 把腦裡演的最壞情況寫下來，事後對答案 |
| 腳本 | 備用 | 整理好的句子，下次直接拿出來用 |

### 刻意不做的事

- 不做連續天數、進度百分比、完成率、徽章、推播催促。
- 「今天還好」不是灰色的「跳過」，它是平權的答案，會被記成一筆資料。
- 使用者寫完之後不給鼓勵、分析或建議。
- 不用漸層、大圓角、插畫角色來「柔化」介面。溫柔來自留白與文案，不是視覺裝飾。

它應該安靜、像一張紙、不催你。

### 開發

```bash
npm install
npm run dev       # 開發伺服器
npm run build     # tsc -b && vite build
npm run preview   # 預覽 build 產物（含 service worker）
npm test          # vitest
npm run check     # 型別檢查 + 測試
node scripts/generate-icons.mjs   # 重新產生 PWA 圖示
```

Vite + React 19 + TypeScript + Tailwind v4，純前端 SPA，無後端。

```
src/
  constants.ts  copy.ts  types.ts   常數、全部 UI 文案、資料模型
  styles/       theme.css（色彩 token）、type.css（三層字體制度）
  store/        persist（localStorage）、useAppStore、selectors（衍生值）
  lib/          date、markdown（匯出）、clipboard
  components/   Chip、ChipGroup、BarChart、Button、Field…
  views/        AppShell ＋ desktop（四分頁）／mobile（逐題流程）
```

兩件實作上的原則：

- **`entries` 是唯一真實來源。** 對象排行、條狀圖、趨勢句、賭注戰績一律由 `selectors.ts` 算出來，不另存。
- **字級不是自由值。** 三層字體制度（引句層／機器層／介面層）收斂成 `type.css` 的語意 class，不在 JSX 裡寫 `text-[13.5px]/[1.95]`。

### 尚未實作

- 寬螢幕（≥1200px）的三欄回顧工作台：時間軸／詳情／模式同時在眼前。
- 字體子集自打包，拿掉對 Google Fonts CDN 的相依，讓對外請求歸零。

---

## English

> Place is not a tool for recording feelings. It is a tool for putting them **back where they belong**.

Once a day it asks one question — "Anything you didn't say out loud today?" — and lets you put down the sentence you swallowed, who it was for, what the situation was, and what your body did. Over time you start to see who you specifically can't speak up to, and two practice tools ("Bets" and "Scripts") help you actually say it next time.

Local-first, stored on your device, no account, works offline. Nobody else can see any of it.

### Nobody else can see any of it

That isn't a marketing line. It's how the thing is built.

- **No account, no server, no cloud sync.** There is nowhere to log in, because nothing is anywhere else.
- **No analytics, no tracking, no telemetry.** There is not a single line of reporting code in this project.
- **No user data ever leaves your device.** Every sentence, every name, every bet lives in your browser's localStorage. "Export Markdown" copies it to your own clipboard — it passes through no one.
- **The blanks are private too.** Which days you skipped, which days you answered "today was fine" — that's yours as well. A blank is information, and that information belongs to you.

The one outbound request is for font files from the Google Fonts CDN (cached by the service worker after first load, so offline still works). That request carries none of what you write, but it does expose your IP to Google — bundling font subsets to remove that dependency is on the list below.

If cloud sync is ever built, data must be encrypted before it leaves the device.

### Why

**Where it comes from: Asian parenting.** "Just put up with it and it'll pass." That's how many of us were raised: don't make noise, don't be a burden, think about how it looks. Feelings weren't forbidden — they were simply never assigned a place to go. So the sentence stays where it is. It doesn't disappear; it comes back at midnight, in the shower, the next time you're in the same room with the same person.

**The method: Kashiwa Sato's approach to organizing.** Sato argues that tidying isn't about throwing things away — it's about finding the true core first, then letting every object return to where it belongs. A messy room isn't messy because there's too much stuff; it's messy because nothing has a place. Feelings work the same way. So the flow is fixed at three steps:

1. **Take it out** — write the unsaid sentence down exactly as it was. No polishing, no explaining.
2. **Put it in place** — three questions only: to whom, in what situation, what your body did. That gives it coordinates.
3. **Leave it blank** — empty days are not backfilled, nagged about, or rewarded. The blank is information too.

### Four tabs

Not four features — four stages of the same act of tidying.

| Tab | Stage | What it does |
|---|---|---|
| Today | Take it out | Record the sentence you didn't say |
| Pattern | Observation | See who you specifically can't speak up to |
| Bets | Recalibration | Write down the worst case you rehearsed, then check it against reality |
| Scripts | Spare parts | Sentences prepared in advance, ready to use |

### Deliberately absent

- No streaks, no progress percentages, no completion rates, no badges, no nagging notifications.
- "Today was fine" is not a greyed-out "skip". It is an equal answer and is stored as an entry.
- No encouragement, analysis, or advice after you finish writing.
- No warm gradients, big rounded corners, or illustrated mascots to "soften" the interface. The gentleness comes from whitespace and wording, not decoration.

It should be quiet, like a sheet of paper, and it should never rush you.

### Development

```bash
npm install
npm run dev       # dev server
npm run build     # tsc -b && vite build
npm run preview   # preview the build, service worker included
npm test          # vitest
npm run check     # typecheck + tests
node scripts/generate-icons.mjs   # regenerate PWA icons
```

Vite + React 19 + TypeScript + Tailwind v4. Front-end only, no backend.

Two implementation rules worth knowing:

- **`entries` is the single source of truth.** The person ranking, bar chart, trend sentence, and bet record are all derived in `selectors.ts` and never stored.
- **Type sizes are not free-form.** A three-layer type system (quote / machine / interface) is collapsed into semantic classes in `type.css`; no `text-[13.5px]/[1.95]` in JSX.

### Not built yet

- The three-column review workbench for wide screens (≥1200px): timeline, detail, and patterns side by side.
- Self-hosted font subsets, removing the Google Fonts CDN dependency so outbound requests drop to zero.
