import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as viu from '../src/lib/llms'

/**
 * GAZDUIREA IN `llms.txt` EN (decizia 42 a owner-ului): rezumatul editiei EN spune ca fisierele stau in UE,
 * cu Frankfurt ca regiune principala, si nu mai numeste tara sau „o singura regiune”.
 *
 * `REZUMAT_EN` se foloseste numai pe editia EN (3s.md), deci proba cere si martorul invers: textul editiei
 * ro-RO nu contine nimic din el.
 *
 * MUTANTUL ruleaza pe o COPIE a modulului, scrisa in `node_modules/.cache`, nu pe fisierul viu: copia
 * primeste propozitia veche, asamblata aici la rulare (proba nu poarta literal ce vaneaza), si trebuie
 * prinsa. O a doua copie, nemutata, e martorul mecanismului: daca ea ar pica, rosul mutantului ar putea
 * veni din copiere, nu din propozitie.
 */

type ModulLlms = Pick<typeof viu, 'REZUMAT_EN' | 'textLlms'>

const INT = 'https://3s.md'
const NOUA = 'Files are stored in the EU, with Frankfurt as the primary region.'
// Tara si formele „o singura regiune”, asamblate la rulare
const TARA = ['Germ', 'any'].join('')
const INTERZIS = new RegExp([TARA, 'one (EU )?region', 'single region'].join('|'), 'i')
const VECHE = 'Files are stored in ' + TARA + ', in one ' + 'EU region.'

/** Aparitiile unui sir intr-un text (fara suprapuneri). */
function aparitii(text: string, ac: string): number {
  return text.split(ac).length - 1
}

/** Propozitiile rezumatului: taiate dupa punct si spatiu, fiecare cu punctul ei. */
function propozitii(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

/** Ce incalca un modul fata de contract; lista goala = verde. */
function incalcari(m: ModulLlms): string[] {
  const iesire: string[] = []
  if (!m.REZUMAT_EN.includes('Frankfurt')) iesire.push('REZUMAT_EN fara Frankfurt')
  if (!/\bEU\b/.test(m.REZUMAT_EN)) iesire.push('REZUMAT_EN fara EU')
  const interzis = m.REZUMAT_EN.match(INTERZIS)
  if (interzis) iesire.push('REZUMAT_EN potriveste forma interzisa: ' + interzis[0])
  const en = m.textLlms(INT, 'en')
  const n = aparitii(en, NOUA)
  if (n !== 1) iesire.push('textLlms EN are propozitia noua de ' + n + ' ori')
  if (INTERZIS.test(en)) iesire.push('textLlms EN potriveste forma interzisa')
  const ro = m.textLlms(INT, 'ro-RO')
  for (const p of propozitii(m.REZUMAT_EN)) {
    if (ro.includes(p)) iesire.push('textLlms ro-RO contine din REZUMAT_EN: ' + p)
  }
  return iesire
}

/** Scrie o copie a modulului (cu importurile relative facute absolute) si o importa. */
async function copie(nume: string, schimba: (sursa: string) => string): Promise<{ modul: ModulLlms; sursa: string }> {
  const original = readFileSync(join(process.cwd(), 'src', 'lib', 'llms.ts'), 'utf8')
  const absolut = original.replace(/from "\.\/(editii|site)"/g, 'from "@/lib/$1"')
  // Control: ambele importuri relative au fost rescrise, altfel copia n-ar porni din alt director
  expect(aparitii(absolut, 'from "@/lib/')).toBe(2)
  const sursa = schimba(absolut)
  const dosar = join(process.cwd(), 'node_modules', '.cache', 'proba-llms-en')
  mkdirSync(dosar, { recursive: true })
  const cale = join(dosar, nume + '.ts')
  writeFileSync(cale, sursa, 'utf8')
  const adresa = pathToFileURL(cale).href
  const modul = (await import(/* @vite-ignore */ adresa)) as ModulLlms
  return { modul, sursa }
}

describe('llms.txt EN: gazduirea dupa decizia 42', () => {
  it('modulul viu: REZUMAT_EN si textLlms respecta contractul', () => {
    const gasite = incalcari(viu)
    console.log('[llms-en] incalcari pe modulul viu: ' + gasite.length)
    expect(gasite).toEqual([])
    // Martorii extragerii: propozitiile rezumatului se gasesc toate in textul EN (deci absenta lor din
    // textul ro-RO nu vine dintr-o taiere gresita), iar rezumatul are mai mult de o propozitie.
    const en = viu.textLlms(INT, 'en')
    const p = propozitii(viu.REZUMAT_EN)
    expect(p.length).toBeGreaterThan(1)
    expect(p.filter((x) => !en.includes(x))).toEqual([])
    // Martor ca textul ro-RO e cel romanesc (are titlul de sectiune al editiei RO)
    expect(viu.textLlms(INT, 'ro-RO')).toContain('## Pagini')
  })

  it('tiparul interzis prinde forma veche si nu prinde propozitia noua', () => {
    expect(INTERZIS.test(VECHE)).toBe(true)
    expect(INTERZIS.test('Files are stored in a single region.')).toBe(true)
    expect(INTERZIS.test(NOUA)).toBe(false)
  })

  it('copia nemutata trece (martorul mecanismului), copia cu propozitia veche e prinsa (mutantul)', async () => {
    const martor = await copie('martor', (s) => s)
    expect(incalcari(martor.modul)).toEqual([])

    const mutant = await copie('mutant', (s) => {
      // Mutatia trebuie sa se aplice o data, altfel copia nu e mutantul cerut
      expect(aparitii(s, NOUA)).toBe(1)
      return s.replace(NOUA, VECHE)
    })
    expect(aparitii(mutant.sursa, VECHE)).toBe(1)
    expect(aparitii(mutant.sursa, NOUA)).toBe(0)
    expect(mutant.modul.REZUMAT_EN).toContain(VECHE)
    const gasite = incalcari(mutant.modul)
    console.log('[llms-en] incalcari pe mutant: ' + gasite.length + ' ' + JSON.stringify(gasite))
    expect(gasite.length).toBeGreaterThan(0)
    expect(gasite).toContain('textLlms EN are propozitia noua de 0 ori')
  })
})
