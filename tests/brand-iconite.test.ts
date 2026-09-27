import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Iconitele din fila browserului si de pe ecranul telefonului sunt ale marcii (26.09.2026). Pana atunci
 * `src/app/favicon.ico` era cel implicit al sablonului Next.js (25.931 octeti, triunghiul alb pe cerc
 * negru), vazut de owner in fila browserului.
 */
const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale))
const amprenta = (b: Buffer) => createHash('sha256').update(b).digest('hex')
/** Amprenta favicon-ului implicit din sablonul Next.js, cel inlocuit. */
const FAVICON_SABLON = '2b8ad2d33455a8f736fc3a8ebf8f0bdea8848ad4c0db48a2833bd0f9cd775932'

describe('iconitele marcii', () => {
  it('icon.svg e iconita oficiala 3S, copiata neschimbata', () => {
    expect(citeste('src/app/icon.svg').equals(citeste('public/brand/sigla-3s-iconita.svg'))).toBe(true)
  })

  it('favicon.ico are 16, 32 si 48 px si nu mai e cel din sablon', () => {
    const ico = citeste('src/app/favicon.ico')
    // antetul ICO: rezervat 0, tip 1, numarul de imagini
    expect([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)]).toEqual([0, 1, 3])
    const latimi = [0, 1, 2].map((i) => ico.readUInt8(6 + i * 16) || 256).sort((a, b) => a - b)
    expect(latimi).toEqual([16, 32, 48])
    expect(ico.length).not.toBe(25931)
    expect(amprenta(ico)).not.toBe(FAVICON_SABLON)
  })

  it('iconita pentru ecranul telefonului (conventia Next.js `*-icon.png` din src/app) e un PNG de 180 x 180', () => {
    const nume = readdirSync(join(RADACINA, 'src/app')).filter((f) => f.endsWith('-icon.png'))
    expect(nume).toHaveLength(1)
    const png = citeste('src/app/' + nume[0])
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG')
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([180, 180])
  })
})
