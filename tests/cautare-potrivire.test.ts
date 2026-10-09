import { describe, expect, it } from 'vitest'
import { continutPaletaContract } from '../src/components/global/PaletaCautare'
import { CUVINTE_DE_LEGATURA, continutPaleta, cuvinteInterogare, normalizeaza, potrivesteInterogarea } from '../src/components/global/paleta'
import { navigatieEn } from '../src/content/navigatie-en'
import { navigatieRoMd } from '../src/content/navigatie-ro-md'
import { RUTE, type Ruta } from '../src/content/rute'
import { RUTE_EN } from '../src/content/rute-en'
import { RUTE_RO_MD } from '../src/content/rute-ro-md'

/**
 * Potrivirea paletei de cautare (Ctrl K) pe CUVINTE, nu pe sirul intreg.
 *
 * DEFECTUL MASURAT pe baza (09.10, ambele domenii, in browser): "termene păstrare", "termene pastrare",
 * "google comparatie" si "pret enterprise" dadeau "Nu am gasit nimic", desi "termene de păstrare" gasea ghidul:
 * interogarea intreaga trebuia sa fie subsir al unui camp. Acum fiecare cuvant ramas (fara cuvintele de legatura
 * scurte) trebuie sa apara intr-un camp, in orice ordine, fara diacritice.
 *
 * DATELE sunt cele reale: rutele editiilor (`RUTE_RO_MD`, `RUTE_EN`) cu contractele lor de navigatie, si rutele
 * build-ului romanesc (`RUTE`). Nicio asteptare nu numeste un titlu scris de mana: tinta fiecarui caz e ruta gasita
 * de interogarea de control ("termene de păstrare"), deci un titlu schimbat de o felie de limba nu inroseste proba.
 *
 * MARTORII: regula veche (subsir al interogarii intregi), rulata pe aceleasi date, NU gaseste cazurile multi-cuvant -
 * deci verdictul nou nu vine dintr-o masuratoare oarba; o interogare fara pereche ramane fara rezultat, iar un cuvant
 * fara pereche alaturi de unul bun scoate rezultatul.
 */

const caiDin = (rute: readonly Ruta[]): ReadonlySet<string> => new Set(rute.map((r) => r.cale))
const cai = (grupuri: { elemente: { cale: string }[] }[]): string[] => grupuri.flatMap((g) => g.elemente.map((e) => e.cale))

/** Regula de dinainte, pastrata numai ca martor: interogarea intreaga, ca subsir al unui camp. */
const potrivireVeche = (q: string, ...campuri: string[]) => campuri.some((c) => normalizeaza(c).includes(normalizeaza(q)))

describe('potrivesteInterogarea: cuvinte, orice ordine, fara diacritice si fara cuvinte de legatura', () => {
  const titlu = 'Termene de păstrare în Moldova'

  it('toate formele cerute gasesc acelasi titlu', () => {
    for (const q of ['termene păstrare', 'termene pastrare', 'pastrare termene', 'termene de păstrare', 'TERMENE  Păstrare', 'moldova termene'])
      expect(potrivesteInterogarea(normalizeaza(q), titlu), q).toBe(true)
  })

  it('martor POZITIV: regula veche nu gasea cazurile multi-cuvant pe care regula noua le gaseste', () => {
    expect(potrivireVeche('termene păstrare', titlu)).toBe(false)
    expect(potrivireVeche('pastrare termene', titlu)).toBe(false)
    expect(potrivireVeche('termene de păstrare', titlu)).toBe(true)
  })

  it('martor NEGATIV: un cuvant fara pereche scoate rezultatul; o interogare fara pereche nu gaseste nimic', () => {
    expect(potrivesteInterogarea(normalizeaza('termene qzxv'), titlu)).toBe(false)
    expect(potrivesteInterogarea(normalizeaza('qzxv wplk'), titlu)).toBe(false)
  })

  it('cuvintele se pot imparti intre campuri (titlu si descriere)', () => {
    expect(potrivesteInterogarea(normalizeaza('pret enterprise'), 'Prețuri', 'Pachete pentru echipe și enterprise')).toBe(true)
    expect(potrivesteInterogarea(normalizeaza('pret enterprise'), 'Prețuri', 'Pachete pentru echipe')).toBe(false)
  })

  it('cuvintele de legatura scurte se ignora; o interogare numai din ele ramane ce era', () => {
    expect(cuvinteInterogare(normalizeaza('termene de păstrare'))).toEqual(['termene', 'pastrare'])
    expect(cuvinteInterogare(normalizeaza('retention of records'))).toEqual(['retention', 'records'])
    expect(cuvinteInterogare('de')).toEqual(['de'])
    expect(potrivesteInterogarea('de', 'Ghiduri de arhivare')).toBe(true)
    expect(potrivesteInterogarea('de', 'Prețuri')).toBe(false)
    // lista e deja normalizata (fara diacritice), altfel "și" n-ar fi prins dupa normalizare
    for (const c of CUVINTE_DE_LEGATURA) expect(normalizeaza(c), c).toBe(c)
  })
})

describe('paleta pe datele reale ale editiilor', () => {
  it('ro-MD: "termene păstrare" si variantele gasesc exact ce gaseste "termene de păstrare"; martorul fara pereche, nimic', () => {
    const paleta = navigatieRoMd(undefined, undefined, caiDin(RUTE_RO_MD)).paleta
    const ruleaza = (q: string) => cai(continutPaletaContract(paleta, q, caiDin(RUTE_RO_MD), RUTE_RO_MD, []))
    const control = ruleaza('termene de păstrare')
    expect(control.length, 'controlul gaseste ceva').toBeGreaterThan(0)
    for (const q of ['termene păstrare', 'termene pastrare', 'pastrare termene']) expect(ruleaza(q), q).toEqual(control)
    expect(ruleaza('qzxv wplk')).toEqual([])
    expect(ruleaza('termene qzxv')).toEqual([])
  })

  it('en: "retention of records" gaseste ce gaseste "records retention"', () => {
    const paleta = navigatieEn(undefined, caiDin(RUTE_EN)).paleta
    const ruleaza = (q: string) => cai(continutPaletaContract(paleta, q, caiDin(RUTE_EN), RUTE_EN, []))
    const control = ruleaza('records retention')
    expect(control.length).toBeGreaterThan(0)
    expect(ruleaza('retention of records')).toEqual(control)
    expect(ruleaza('qzxv wplk')).toEqual([])
  })

  it('ro-RO (build-ul probelor): aceeasi regula prin continutPaleta', () => {
    const ruleaza = (q: string) => cai(continutPaleta(q, caiDin(RUTE), RUTE, []))
    const control = ruleaza('termene de păstrare')
    expect(control.length).toBeGreaterThan(0)
    expect(ruleaza('pastrare termene')).toEqual(control)
    expect(ruleaza('qzxv wplk')).toEqual([])
  })
})
