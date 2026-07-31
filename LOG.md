# 開發日誌

## 踩過的坑（持續累積）

### 兩個 `.t-*` 字體 class 疊在同一個元素上會互蓋

- **症狀**：`className={`${inputClass} t-quote-15`}` 想讓賭注①欄用明體，結果吃到黑體。
- **原因**：兩個 class 都用 `font:` shorthand，勝負由**樣式表裡的定義順序**決定，不是 class 屬性的書寫順序。`.t-ui-15` 定義在 `.t-quote-15` 後面，所以永遠贏。
- **解法**：`Field.tsx` 拆出不含字體的 `inputBase`，字體 class 一個元素只接一個。
- **教訓**：語意排版 class 用 shorthand 很方便，但也讓「疊加」失效。要嘛全用 shorthand 且保證只接一個，要嘛拆成 `font-size`/`line-height` 分開寫。

### 規格裡的 `lastUsedDaysAgo` 是會過期的快照

- **症狀**：複製腳本後顯示「上次用在 0 天前」，但這個 0 存進 localStorage 之後永遠不會變老。
- **原因**：設計規格的資料模型把「天數」當成儲存欄位，天數是衍生值，會隨時間改變。
- **解法**：改存 `lastUsedDate: string | null`，畫面上用 `daysBetween(lastUsedDate, todayISO())` 算。
- **教訓**：規格給的資料模型不是聖旨。任何「距今多久」的欄位都該存時間點，不存差值。

### Tailwind v4 沒有 `duration-250`

- **症狀**：進度點的寬度轉場沒有動畫。
- **原因**：預設 duration scale 只有 75/100/150/200/300/500/700/1000，`duration-250` 不存在，class 被靜默忽略。
- **解法**：`duration-[250ms]`。
- **教訓**：Tailwind 對不存在的 class 不會報錯。設計稿給的非標準數值一律先確認在不在 scale 裡。

### `defineConfig` 要從 `vitest/config` import

- **症狀**：`vite.config.ts` 加了 `test: {...}` 之後 `tsc -b` 型別錯誤。
- **原因**：從 `vite` import 的 `defineConfig` 不認得 `test` 欄位。
- **解法**：`import { defineConfig } from 'vitest/config'`。

### `npm audit fix` 修不掉 vite-plugin-pwa 的相依警告

- **症狀**：安裝後 8 個 high severity（brace-expansion DoS），`npm audit fix` 跑完數字不變。
- **原因**：漏洞在 `vite-plugin-pwa → workbox-build → … → brace-expansion` 這條鏈的深處，沒有 non-breaking 的修法。
- **解法**：`package.json` 加 `"overrides": { "brace-expansion": "^5.0.9" }`，重裝後歸零。
- **教訓**：`audit fix` 沒動靜時看的是「有沒有 non-breaking 版本」，不是「修不了」。overrides 通常可解。

### PWA 的 service worker 在 dev server 下不會啟用

- **症狀**：`npm run dev` 開著卻找不到 SW，也沒有任何 cache。
- **原因**：`vite-plugin-pwa` 預設只在 build 產物啟用（沒開 `devOptions`）。
- **解法**：離線一定要用 `npm run build && npm run preview` 驗。真正的驗法是**把 preview server 砍掉再重整**——還能載入才叫離線可用。

### Chrome 的 `resize_window` 對最大化視窗無效

- **症狀**：要驗 <768px 的逐題流程，呼叫 resize 顯示成功，但 `window.innerWidth` 一直是 1536。
- **原因**：視窗被 OS 最大化/管理時，resize 不會生效。
- **解法**：注入一個固定寬度的 iframe 指向同一個 origin：`document.body.innerHTML = '<iframe src="/" style="width:400px;height:820px">'`。iframe 的寬度會驅動裡面的 media query 與 `matchMedia`。

### 在 Bash 工具裡用了 PowerShell 的 here-string

- **症狀**：第一個 commit 的訊息開頭多了一行 `@`，結尾也多一個 `@`。
- **原因**：`git commit -m @'...'@` 是 PowerShell 語法，在 Bash 裡 `@'` 只是普通字元。
- **解法**：`git commit -F - <<'EOF' … EOF`。已用 `--amend` 修正。
- **教訓**：這個環境兩種 shell 並存，多行字串的寫法不共用。

### `taskkill` 用 WINDOWTITLE filter 殺 node 是危險且無效的

- **症狀**：想停掉 preview server，用 `taskkill //F //FI "WINDOWTITLE eq *" //IM node.exe`，結果什麼都沒殺到。
- **風險**：這條指令若真的命中，會連使用者其他無關的 node 程序一起殺掉。
- **解法**：`netstat -ano | grep :4178` 找出 PID，再 `taskkill //F //PID <pid>`。
- **教訓**：關掉背景服務要用 port → PID 定位，永遠不要對 `node.exe` 下 `/IM`。

### 同一支模組裡 const 互相引用，順序就是求值順序

- **症狀**：把 `bets.eyebrow` 改成引用 `nav.bets` 之後，畫面整個空白，console 是 `ReferenceError: Cannot access 'nav' before initialization`。
- **原因**：`copy.ts` 裡 `bets` 宣告在 `nav` 前面。`const` 會 hoist 但處在 TDZ，模組由上而下求值時 `bets` 先算，那時 `nav` 還沒初始化。
- **解法**：把 `nav` 移到 `bets` 與 `scripts` 之前。
- **教訓**：這種錯只在「一個 const 的初始值引用另一個 const」時才會出現，型別檢查不會擋——TypeScript 認為型別沒問題。順序要自己顧。

### git 一直跳 CRLF 警告

- **症狀**：每次 `git add` 都刷一排 `LF will be replaced by CRLF`。
- **原因**：Windows 預設 `core.autocrlf=true`，而檔案是以 LF 寫入的。
- **現況**：不影響內容，暫時不處理。若之後覺得吵，加 `.gitattributes` 指定 `* text=auto eol=lf`。

---

## 2026-07-31 · 第四輪：窄螢幕的頂部橫列與分頁改名

起因：iPhone 16（393px）上「腳本」被擠到第二行。

**完成事項**

- 收合時品牌獨占一行，日期改成與品牌同一行（不多佔一列高度），分頁橫列因此排得下。頂部橫列從三行變兩行。
- 分頁改名：「賭注」→ **如果**、「腳本」→ **遇到**。頁面眉標與 Markdown 匯出的段落標題都引用同一個常數，不會各叫各的。
- 「匯出 Markdown」→「**匯出**」。展開後的回饋仍寫著「可貼進 Obsidian」，格式資訊留在那裡就夠了。
- 外觀切換改成單一字元：◐ 跟隨系統／○ 淺／● 深。
- 實測 393px：六個按鈕（今天、模式、如果、遇到、匯出、◐）全在同一行，內容寬 349px 用掉 257px。

**決策與備註**

- **改名的理由不只是排版。** 「如果」正是那個分頁自己在說的話（「如果我說了，會怎樣？」），「遇到」正是每一組腳本的組頭（「遇到 · 場合」）。名字往內容靠，不是為了短而短。
- **中間一度用過「what if」**，做出來看了才發現兩個問題：它是整個介面唯一的英文，以及它比「賭注」寬（47px vs 30px），單看是讓換行更糟。換成「如果」之後四個分頁都是 30px 等寬，節奏才對。
- **圖示用文字字元，不用圖檔。** 設計本來就沒有任何圖片素材，「＋」「→」都是字元，◐○● 沿用同一套做法。純圖示按鈕補上 `aria-label`，否則螢幕閱讀器只會唸到一個圓圈。
- **內文仍然說「賭注」「押下去」**（「還沒有結案的賭注」「下一個賭注」「我賭對方會…」）。改的是分頁名，那套「押注 → 對答案」的說法是這個機制的核心語彙，沒有跟著動。若要一起換再說。

---

## 2026-07-31 · 第三輪：字體自己託管，對外請求歸零

**完成事項**

- `scripts/fetch-fonts.mjs`：向 Google css2 端點要 CSS，把 213 個帶 `unicode-range` 的 woff2 分片下載到 `public/fonts/`，並產生 `public/fonts.css`（本機路徑）。共 5.6 MB。
- `index.html` 拿掉 Google Fonts 的 preconnect 與 stylesheet，改指向自己的 `/fonts.css`。
- service worker：字體不進 precache，改用 CacheFirst 的 runtime cache。
- 補上 `public/fonts/OFL.txt`（SIL Open Font License 1.1）。
- README 的隱私段落改成「沒有任何對外請求」，並新增「字體」一節說明分片做法與授權。
- 實測：`dist/` 全域搜尋沒有任何 googleapis／gstatic；preview 載入 24 筆請求全是 same-origin；213 片只抓了 15 片；把 preview server 砍掉後重整仍正常顯示中文。

**決策與備註**

- **只抓 400 一個字重。** `type.css` 的 37 個 class 全是 400，設計稿雖然載了 400;500，但實作沒有一處用到 500。少一半體積。
- **不自己跑 pyftsubset，直接用 Google 已經切好的分片。** 切分策略（哪些字碼一組）是 Google 長期調過的，自己重切只會更差；而且不必引入 Python 字體工具鏈。腳本只做「下載 + 改寫路徑」。
- **字體 CSS 獨立成 `public/fonts.css`，不進 app 的 CSS bundle。** 213 條 `@font-face` 有 227KB，混進 bundle 會讓 app CSS 從 17KB 變成 216KB，而且每次改樣式使用者都要重抓一次。拆開後 app CSS 回到 16.8KB。
- **字體不 precache。** 5.6MB 全部 precache 等於要使用者第一次開就下載一整套中文字，完全違背分片的用意。改用 runtime cache：抓過哪片就留哪片。

**下一輪待辦**

- 暫無。三個階段的畫面與隱私目標都到位了。

---

## 2026-07-31 · 第二輪：1c 回顧工作台

**完成事項**

- `views/desktop/Workbench.tsx`：三欄回顧工作台（左時間軸 300px／中詳情彈性／右模式 250px）。
- 新增 selectors：`recentEntries`（最近三週、新的在上）、`sameWhoBefore`（同一個對象在這天之前發生過的）。
- `App.tsx` 加上 `(min-width: 1200px)` 的 matchMedia，`AppShell` 在寬螢幕時把「模式」換成工作台，容器 max-width 由 900 放寬到 1280、內容區不受 560px 限制。
- 補 3 個單元測試（時間軸範圍與排序、同對象回溯的過濾條件），共 23 個。
- 型別檢查通過；淺色／深色、有記錄／「今天還好」的詳情、<1200px 的退回都在瀏覽器實際點過。

**決策與備註**

- **工作台掛在「模式」分頁下，不新增第五個分頁。** 規格說 1c 是「回顧」進階視圖但沒說怎麼整合。1c 的右欄本來就是模式的完整內容，左中兩欄補的是 1a 完全沒有的能力——回頭看過去那幾天（1a 的「今天」只看得到今天）。掛在模式底下等於「模式的進階版」，四個分頁平權的結構不動。
- **左欄表頭拿掉了產品名。** 設計稿的 1c 是完整 app 外框，表頭掛著「未寄」；在這裡它是分頁內容，左邊兩欄外就是側欄的品牌，再掛一次會像 bug。只留「11 筆 · 最近三週」。
- **`.t-quote-16` 的行高從 1.75 改成 1.8**，對齊原型（賭注引句與工作台的回溯引句都是 16px/1.8）。
- 新增四個排版 class：`.t-quote-19-tight`、`.t-mono-105-eyebrow`、`.t-mono-11-plain`、`.t-ui-14-list`。都是原型裡確實存在、與既有 class 行高或字距不同的規格。

**下一輪待辦**

- ~~字體子集自打包~~（2026-07-31 第三輪完成）

---

## 2026-07-31 · 第一輪：從設計 handoff 做出第一階段

**完成事項**

- 建立專案骨架：Vite + React 19 + TypeScript + Tailwind v4，純前端 SPA。
- Design tokens 與三層字體制度（`styles/theme.css`、`styles/type.css`）。
- 資料層：localStorage 持久化、單一 store、衍生值 selectors。
- 共用元件：Chip / ChipGroup / BarChart / Button / Field / CustomSignalInput。
- 1a 桌機四分頁：今天（四種狀態）、模式、賭注、腳本，含匯出 Markdown 與跨分頁串接。
- 1b 手機逐題流程（六步）與 <768px 的響應式切換。
- PWA：manifest、service worker、Google Fonts runtime cache、自產圖示。
- 20 個單元測試（selectors / persist / markdown 匯出）。
- 推上 GitHub（public），README 改為中英雙語並加上隱私說明。

**決策與備註**

- **技術棧**選 Vite 而非 Astro/Next：整個 app 都是 client 互動，SSR 幫不上忙。
- **字級收斂成語意 class**：設計稿有大量 13.5px／行高 1.95／letter-spacing .14em 這種值，散在 utility 裡會失控，全部收進 `type.css` 的三層制度。
- **深淺色用 `light-dark()`**：兩組值寫在同一處，手動覆寫只改 `:root[data-theme]` 的 `color-scheme`，不換整組變數。
- **`entries` 是唯一真實來源**：對象排行、條狀圖、趨勢句、賭注戰績全部用算的，不另存。
- **外觀切換是自己加的**：規格要求產品要能手動覆寫深淺色，但設計稿裡沒有這個控制項（畫布右上角那組是設計工具，不是產品 UI）。做成與「匯出 Markdown」同級的純文字按鈕。
- **手機上四個分頁共用同一個 shell**：規格只說 <768px 用逐題流程，沒說模式／賭注／腳本怎麼進去。若不共用，那三個分頁在手機上完全沒有入口。
- **隱私措辭不含糊**：字體目前仍從 Google Fonts CDN 抓，是唯一的對外請求，README 據實寫出並列為待辦，沒有寫成「零請求」。
- **設計 handoff 已移出版控**（`.gitignore`），檔案留在本機 `design_handoff_place/`。內容仍在第一個 commit 的歷史裡，未從歷史移除。
- **英文名定為 Place**；程式碼裡的 `PRODUCT_NAME` 維持「未寄」，那是 UI 語言不是專案名。

**下一輪待辦**

- ~~1c 回顧工作台~~（2026-07-31 第二輪完成）
- ~~字體子集自打包~~（2026-07-31 第三輪完成）
