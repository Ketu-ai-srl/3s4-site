import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import manifest from '../src/app/manifest'
import { CULOARE_MARCA, FUNDAL_MARCA, NUME_SCURT_MARCA, TOKEN_CULOARE_MARCA } from '../src/components/global/culoare-marca'
import { BRAND } from '../src/content/entitate'

/**
 * Marca in navigator (livrarea S4-5): manifestul aplicatiei web si `theme-color` din viewport.
 * Culoarea nu are voie sa fie un hex nou: e valoarea tokenului din `globals.css`, citita aici din
 * fisier, ca o schimbare a tokenului sa inroseasca proba in loc sa lase manifestul pe culoarea veche.
 */

const RADACINA = join(__dirname, '..')
const CSS = readFileSync(join(RADACINA, 'src', 'app', 'globals.css'), 'utf8')

/** Valoarea unui token `--nume: #hex;` din CSS, sau null. */
function valoareToken(css: string, nume: string): string | null {
  // Numele tokenului are numai litere, cifre si cratime, deci intra in expresie fara scapare.
  const m = css.match(new RegExp('^[ \\t]*' + nume + ':[ \\t]*(#[0-9a-fA-F]{3,8})[ \\t]*;', 'm'))
  return m ? m[1].toLowerCase() : null
}

describe('marca in navigator (livrare S4-5)', () => {
  it('culoarea marcii este tokenul --color-albastru, iar fundalul tokenul --color-alb', () => {
    expect(valoareToken(CSS, TOKEN_CULOARE_MARCA)).toBe(CULOARE_MARCA)
    expect(valoareToken(CSS, '--color-alb')).toBe(FUNDAL_MARCA)
  })

  it('manifestul: numele marcii, numele scurt, culoarea si iconitele din src/app', () => {
    const m = manifest()
    expect(m.name).toBe(BRAND.nume)
    expect(m.name).toBe('3S Scan Store Solve')
    expect(m.short_name).toBe(NUME_SCURT_MARCA)
    expect(m.short_name).toBe('3S')
    expect(m.theme_color).toBe(CULOARE_MARCA)
    expect(m.background_color).toBe(FUNDAL_MARCA)
    expect(m.start_url).toBe('/')
    const surse = (m.icons ?? []).map((i) => i.src)
    expect(surse).toEqual(['/icon.svg', '/favicon.ico'])
    for (const s of surse) expect(readFileSync(join(RADACINA, 'src', 'app', s.slice(1))).length, s).toBeGreaterThan(0)
  })

  it('theme-color din viewport vine din aceeasi constanta ca manifestul', () => {
    // Layout-ul nu se poate importa in vitest (next/font ruleaza numai in compilatorul Next), deci se
    // citeste sursa; valoarea servita e masurata in tests/browser/livrare.spec.ts (meta theme-color).
    const layout = readFileSync(join(RADACINA, 'src', 'app', 'layout.tsx'), 'utf8')
    expect(layout).toMatch(/export const viewport: Viewport = \{\s*themeColor: CULOARE_MARCA,\s*\}/)
    expect(layout).toContain('import { CULOARE_MARCA } from "@/components/global/culoare-marca"')
  })

  it('manifestul nu poarta date de firma (plan §7)', () => {
    const text = JSON.stringify(manifest())
    expect(text).not.toMatch(/SRL|S\.R\.L\.|CUI|J\d{2}\//)
  })

  it('martor POZITIV: un token schimbat in CSS nu mai e egal cu culoarea marcii', () => {
    const schimbat = CSS.replace(new RegExp('(' + TOKEN_CULOARE_MARCA + ':[ \\t]*)#[0-9a-fA-F]{6}'), '$1#123456')
    expect(schimbat).not.toBe(CSS)
    expect(valoareToken(schimbat, TOKEN_CULOARE_MARCA)).not.toBe(CULOARE_MARCA)
  })

  it('martor NEGATIV: un token inexistent nu se citeste ca valoare', () => {
    expect(valoareToken(CSS, '--color-nu-exista-la-livrare')).toBeNull()
  })
})
