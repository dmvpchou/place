// 把 Noto Serif TC / Noto Sans TC 自己託管起來，拿掉對 Google Fonts CDN 的相依。
//
// 中文字體全集太大，不能整包塞給使用者。做法沿用 Google 自己的切法：
// 向 css2 端點要一份 CSS，它會回傳上百條帶 unicode-range 的 @font-face，
// 每條指向一個只含那段字碼的 woff2 分片。這裡把分片全部下載回來，
// 再把 CSS 改寫成本機路徑。瀏覽器只會抓它真正需要的那幾片。
//
// 只抓 400：全站 type.css 的 37 個 class 都是 400，沒有一處用到 500。
//
// 用法：node scripts/fetch-fonts.mjs
import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public/fonts')
// 獨立成一支 public 檔案，不進 app 的 CSS bundle：
// 213 條 @font-face 有 216KB，混進 bundle 會讓每次改樣式都要使用者重抓一次。
const CSS_OUT = resolve(ROOT, 'public/fonts.css')

const FAMILIES = [
  { name: 'Noto Serif TC', slug: 'noto-serif-tc' },
  { name: 'Noto Sans TC', slug: 'noto-sans-tc' },
]

// 沒有這個 UA，css2 會回傳 ttf 而不是 woff2。
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const query = FAMILIES.map((f) => `family=${f.name.replace(/ /g, '+')}:wght@400`).join(
  '&',
)
const cssUrl = `https://fonts.googleapis.com/css2?${query}&display=swap`

const slugOf = (family) =>
  FAMILIES.find((f) => f.name === family)?.slug ?? family.toLowerCase().replace(/ /g, '-')

async function main() {
  console.log(`fetching ${cssUrl}`)
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text()

  const blocks = [...css.matchAll(/@font-face \{([^}]+)\}/g)]
  if (blocks.length === 0) throw new Error('沒有解析到任何 @font-face，css2 的格式可能變了')

  mkdirSync(OUT_DIR, { recursive: true })

  const out = [
    '/* 由 scripts/fetch-fonts.mjs 產生，不要手改。',
    ' * 分片沿用 Google 的 unicode-range 切法，瀏覽器只會抓它需要的那幾片。',
    ' * 字體為 Noto Sans TC / Noto Serif TC，SIL Open Font License 1.1（見 public/fonts/OFL.txt）。',
    ' */',
    '',
  ]
  let total = 0
  let downloaded = 0
  const unnumbered = new Map()

  for (const [, body] of blocks) {
    const family = /font-family:\s*'([^']+)'/.exec(body)?.[1]
    const url = /src:\s*url\(([^)]+)\)/.exec(body)?.[1]
    const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1]
    if (!family || !url || !range) throw new Error('@font-face 解析失敗')
    // 分片編號在檔名裡：….123.woff2。最後一片（拉丁字母那段）沒有編號，
    // 用 x0、x1… 補上，確保檔名不撞。
    const slug = slugOf(family)
    const index =
      /\.(\d+)\.woff2$/.exec(url)?.[1] ?? `x${unnumbered.set(slug, (unnumbered.get(slug) ?? -1) + 1).get(slug)}`

    const file = `${slug}-400-${index}.woff2`
    const dest = resolve(OUT_DIR, file)

    if (existsSync(dest)) {
      total += statSync(dest).size
    } else {
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      writeFileSync(dest, buf)
      total += buf.length
      downloaded++
    }

    out.push(
      '@font-face {',
      `  font-family: '${family}';`,
      "  font-style: normal;",
      '  font-weight: 400;',
      '  font-display: swap;',
      `  src: url('/fonts/${file}') format('woff2');`,
      `  unicode-range: ${range.trim()};`,
      '}',
      '',
    )
  }

  writeFileSync(CSS_OUT, out.join('\n'))
  console.log(
    `${blocks.length} 個分片（新下載 ${downloaded}），共 ${(total / 1024 / 1024).toFixed(1)} MB`,
  )
  console.log(`wrote ${CSS_OUT}`)
}

main()
