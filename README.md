# 未寄

> 這不是一個記錄情緒的工具，是一個幫情緒**歸位**的工具。

每天問一句「今天，有話沒說出口嗎？」，把沒說出口的那句話、對象、場合、身體反應放下來；累積之後看見自己對誰特別說不出口，並用「賭注」與「腳本」練習下一次真的開口。

單機、本機儲存、不需要帳號、可離線。

## 開發

```bash
npm install
npm run dev       # 開發伺服器
npm run build     # tsc -b && vite build
npm run preview   # 預覽 build 產物（含 service worker）
npm test          # vitest
npm run check     # 型別檢查 + 測試
node scripts/generate-icons.mjs   # 重新產生 PWA 圖示
```

## 設計來源

`design_handoff_place/README.md` 是規格書（顏色、字級、間距、文案皆為最終值），`design_handoff_place/screens/` 是像素比對基準。同資料夾的 `.dc.html` 與 `support.js` 是設計原型，**不是產品程式碼**，不要從那裡複製 inline style。

實作對規格的兩處自主決定，都寫在程式碼註解裡：

- `ScriptGroup` 改存 `lastUsedDate` 而非 README 的 `lastUsedDaysAgo`——存下來的天數不會自己變老，畫面上的「上次用在 N 天前」由日期算出來。
- 外觀切換（跟隨系統／淺／深）是側欄底部一個純文字按鈕。README 第 9 節要求產品要能手動覆寫，但設計稿裡沒有這個控制項（畫布右上角那組是設計工具，不是產品 UI）。

## 結構

```
src/
  constants.ts  copy.ts  types.ts   常數、全部 UI 文案、資料模型
  styles/       theme.css（token）、type.css（三層字體制度）
  store/        persist（localStorage）、useAppStore、selectors（衍生值）
  lib/          date、markdown（匯出）、clipboard
  components/   Chip、ChipGroup、BarChart、Button、Field…
  views/        AppShell ＋ desktop（1a 四分頁）／mobile（1b 逐題流程）
```

**衍生值一律用算的**（對象排行、條狀圖、趨勢句、賭注戰績），`entries` 是唯一真實來源。

## 這個產品最容易被做壞的地方

不要加連續天數、進度百分比、完成率、徽章、推播；不要把「今天還好」做成灰色的「跳過」；不要在使用者寫完之後給鼓勵、分析或建議；不要用漸層、大圓角、插畫來「柔化」介面。溫柔來自留白與文案。

## 尚未實作

- 1c 回顧工作台（≥1200px 三欄：時間軸／詳情／模式）
- 字體子集自打包（目前用 Google Fonts CDN，由 service worker 快取讓離線可用）
