// 產生 PWA 圖示。設計稿沒有任何圖片素材，所以圖示就是產品自己的裝飾引號
// 「　」——兩個角括號，畫在 canvas 底色上。純幾何，不需要字體或 rasterizer。
//
// 用法：node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const CANVAS = [0xef, 0xee, 0xe9] // --canvas 淺色
const INK = [0x1e, 0x21, 0x1c] // --ink 淺色

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: truecolour
  // 10–12: compression / filter / interlace 皆為 0
  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    raw[row] = 0 // filter type: none
    for (let x = 0; x < size; x++) {
      const p = pixels[y * size + x]
      raw[row + 1 + x * 3] = p[0]
      raw[row + 2 + x * 3] = p[1]
      raw[row + 3 + x * 3] = p[2]
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function render(size) {
  const px = new Array(size * size).fill(CANVAS)
  const put = (x0, y0, w, h) => {
    for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
      for (let x = Math.round(x0); x < Math.round(x0 + w); x++) {
        if (x >= 0 && y >= 0 && x < size && y < size) px[y * size + x] = INK
      }
    }
  }
  // 圖示在 maskable 安全區（中央 80%）內：兩個角括號各佔約 26% 邊長。
  const u = size / 100
  const t = Math.max(1, Math.round(4 * u)) // 筆畫粗細
  const arm = 26 * u // 角括號臂長

  // 左上角括號「
  put(22 * u, 30 * u, arm, t)
  put(22 * u, 30 * u, t, arm)
  // 右下角括號」
  put(78 * u - arm, 70 * u - t, arm, t)
  put(78 * u - t, 70 * u - arm, t, arm)

  return px
}

mkdirSync(resolve(ROOT, 'public/icons'), { recursive: true })
for (const size of [192, 512]) {
  const file = resolve(ROOT, `public/icons/icon-${size}.png`)
  writeFileSync(file, png(size, render(size)))
  console.log(`wrote ${file}`)
}
