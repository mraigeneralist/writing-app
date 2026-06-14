// Generates the PWA icon set as PNGs with no native dependencies.
// Design: full-bleed accent background (maskable-safe) with a paper-colored
// "L" monogram for Loom. Re-run with `node scripts/generate-icons.mjs`.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public')
mkdirSync(OUT, { recursive: true })

const ACCENT = [0x5b, 0x57, 0xc7]
const PAPER = [0xfa, 0xf9, 0xf6]

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng(size, draw) {
  // RGBA pixel buffer
  const px = Buffer.alloc(size * size * 4)
  const set = (x, y, [r, g, b], a = 255) => {
    const i = (y * size + x) * 4
    px[i] = r
    px[i + 1] = g
    px[i + 2] = b
    px[i + 3] = a
  }
  draw(set, size)

  // raw scanlines with filter byte 0
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Draw an "L" centered in paper color on the accent field.
function drawIcon(set, size) {
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) set(x, y, ACCENT)

  const u = size / 16 // grid unit
  const stroke = Math.round(u * 2)
  const left = Math.round(u * 5.5)
  const top = Math.round(u * 4)
  const bottom = Math.round(u * 12)
  const right = Math.round(u * 10.5)

  // vertical bar
  for (let y = top; y < bottom; y++)
    for (let x = left; x < left + stroke; x++) set(x, y, PAPER)
  // bottom bar
  for (let y = bottom - stroke; y < bottom; y++)
    for (let x = left; x < right; x++) set(x, y, PAPER)
}

const targets = [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
  ['favicon-48.png', 48],
]

for (const [name, size] of targets) {
  writeFileSync(join(OUT, name), encodePng(size, drawIcon))
  console.log('wrote', name, `${size}x${size}`)
}
