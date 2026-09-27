import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaAutomatizari from '../src/app/functionalitati/automatizari-ai/page'
import PaginaCautare from '../src/app/functionalitati/cautare-ai/page'
import PaginaPortal from '../src/app/functionalitati/portal-clienti/page'
import {
  aparitie,
  caractereDupaProgres,
  caractereScrise,
  CELULA_GRILA,
  decalajGrila,
  deriva,
  durataScrierii,
  progresSectiune,
  treapta,
} from '../src/components/cinema/progres'
import { ZI_UITAT, ziuaAsteptarii } from '../src/components/functionalitati/automatizari-ai/Asteptare'
import { PRAG_INIMA, pragRol } from '../src/components/functionalitati/automatizari-ai/Flux'
import { PRAGURI_AVALANSA } from '../src/components/functionalitati/cautare-ai/Avalansa'
import { formatTimp } from '../src/components/functionalitati/cautare-ai/Frustrare'
import { SCRIERE_LUMINA } from '../src/components/functionalitati/cautare-ai/Lumina'
import { cuPunctDeMii, necititeLa, pragArbore } from '../src/components/functionalitati/portal-clienti/Arbore'
import { CICLU_MS, PAUZA_MS, rolUrmator } from '../src/components/functionalitati/portal-clienti/CameraPortal'
import { ASEZARE_ETICHETE } from '../src/components/functionalitati/portal-clienti/Etichete'
import { firePraf } from '../src/components/functionalitati/portal-clienti/PrafSiFantome'
import * as AUTOMATIZARI from '../src/content/functionalitati/automatizari-ai'
import * as CAUTARE from '../src/content/functionalitati/cautare-ai'
import * as PORTAL from '../src/content/functionalitati/portal-clienti'
import { RUTE } from '../src/content/rute'

/**
 * Probele feliei `cinema-1` care nu cer navigator: logica pura a cadrului cinema, pragurile machetelor
 * contra masuratorilor din fise, starea statica a celor trei pagini randate pe server si regulile
 * continutului (lungimi SEO, date fictive care nu pot fi ale nimanui, un singur h1).
 *
 * ASTEPTARILE VIN DIN FISE, nu din cod: pragurile avalansei se verifica pe intervalele masurate la pas de
 * 60 px (functionalitati__cautare-ai.md S1), formulele pe punctele citate in fise (pivotul, arborele,
 * contorul de zile, scrierea din bara de cautare). Asa, o constanta schimbata in cod nu isi poate trage
 * proba dupa ea.
 */

const PAGINI = {
  '/functionalitati/cautare-ai': renderToStaticMarkup(createElement(PaginaCautare)),
  '/functionalitati/automatizari-ai': renderToStaticMarkup(createElement(PaginaAutomatizari)),
  '/functionalitati/portal-clienti': renderToStaticMarkup(createElement(PaginaPortal)),
} as const

/** Textul aproximativ al unui HTML: fara scripturi, fara etichete, cu spatiile stranse. */
const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')

/** Cifra de control a unui cod fiscal romanesc (cheia 753217532, suma x 10 mod 11, 10 devine 0). */
function cifraControlCui(corp: string): number {
  const cheie = '753217532'
  let suma = 0
  for (let i = 0; i < corp.length; i++) {
    suma += Number(corp[corp.length - 1 - i]) * Number(cheie[cheie.length - 1 - i])
  }
  return ((suma * 10) % 11) % 10
}

function cuiValid(cod: string): boolean {
  const cifre = cod.replace(/\D/g, '')
  if (cifre.length < 2 || cifre.length > 10) return false
  return Number(cifre.slice(-1)) === cifraControlCui(cifre.slice(0, -1))
}

describe('progresul si formulele cadrului', () => {
  it('p e 0 cand varful sectiunii atinge mijlocul ferestrei, 0,5 la jumatate, 1 dupa', () => {
    expect(progresSectiune(450, 900, 900)).toBe(0)
    expect(progresSectiune(0, 900, 900)).toBe(0.5)
    expect(progresSectiune(-450, 900, 900)).toBe(1)
    expect(progresSectiune(-5000, 900, 900)).toBe(1)
    expect(progresSectiune(2000, 900, 900)).toBe(0)
    expect(progresSectiune(0, 0, 900)).toBe(0)
  })

  it('aparitia si treptele urmeaza punctele masurate in fise', () => {
    // Pivotul de pe cautare-ai: 0,19 la p 0,143 si 1 la 0,62 (fisa S4).
    expect(aparitie(0.143, 2, 0.05)).toBeCloseTo(0.19, 2)
    expect(aparitie(0.62, 2, 0.05)).toBe(1)
    // Pivotul de pe automatizari-ai: 0,15 la p 0,125 si 0,98 la 0,542 (fisa S3).
    expect(aparitie(0.125, 2, 0.05)).toBeCloseTo(0.15, 2)
    expect(aparitie(0.542, 2, 0.05)).toBeCloseTo(0.98, 2)
    // Arborele din portal: baza .12, panta 6, deriva de 84 px dupa pragul + 0,119 (fisa S1).
    expect(treapta(0, 3, 0.06, 6, 0.12)).toBe(0.12)
    expect(treapta(1, 3, 0.06, 6, 0.12)).toBe(1)
    expect(deriva(0.1, 84, 0.119)).toBe(0)
    expect(deriva(1, 84, 0.119)).toBeCloseTo(74, 0)
  })

  it('grila de fundal e periodica: deplasarea sta in (0, 72] oricat s-ar derula', () => {
    for (const y of [0, 1, 399, 400, 5000, 20000, 123456]) {
      const d = decalajGrila(y)
      expect(d).toBeGreaterThan(0)
      expect(d).toBeLessThanOrEqual(CELULA_GRILA)
    }
    // Perioada: 400 px de derulare x 0,18 = 72 px, adica o celula intreaga.
    expect(decalajGrila(1000)).toBeCloseTo(decalajGrila(1400), 6)
    // Control: sub o perioada deplasarea chiar se schimba.
    expect(decalajGrila(1000)).not.toBeCloseTo(decalajGrila(1200), 3)
  })

  it('scrierea: nimic in primele 500 ms, apoi un caracter la fiecare pas', () => {
    expect(caractereScrise(499, 40)).toBe(0)
    expect(caractereScrise(500, 40)).toBe(1)
    expect(caractereScrise(500 + 32 * 10, 40)).toBe(11)
    expect(caractereScrise(60000, 40)).toBe(40)
    expect(durataScrierii(40, 35)).toBe(500 + 39 * 35)
  })

  it('bara de cautare se scrie dupa derulare: de la p 0,18, completa la 0,5', () => {
    const { start, durata } = SCRIERE_LUMINA
    expect(start).toBe(0.18)
    expect(start + durata).toBeCloseTo(0.5, 6)
    // Punctul masurat al fisei S5: 21 de caractere la p 0,267, pe o intrebare de ~80.
    expect(caractereDupaProgres(0.267, 80, start, durata)).toBe(21)
    const lungime = CAUTARE.EROU_CAUTARE.intrebare.length
    expect(caractereDupaProgres(start, lungime, start, durata)).toBe(0)
    expect(caractereDupaProgres(0.5, lungime, start, durata)).toBe(lungime)
  })
})

describe('pragurile machetelor, contra masuratorilor', () => {
  it('avalansa: fiecare prag k/14 cade in intervalul masurat al randului lui', () => {
    // Fisa S1: pasul de 60 px (1/30 dintr-o sectiune de 1800 px) la care randul era deja aprins.
    const aprinsLa = [0.017, 0.083, 0.15, 0.217, 0.317, 0.383, 0.45, 0.517, 0.583, 0.65, 0.717, 0.817, 0.883]
    const pas = 60 / 1800
    expect(PRAGURI_AVALANSA).toHaveLength(13)
    PRAGURI_AVALANSA.forEach((prag, k) => {
      expect(prag, 'randul ' + (k + 1)).toBeLessThanOrEqual(aprinsLa[k] + 1e-9)
      expect(prag, 'randul ' + (k + 1)).toBeGreaterThan(aprinsLa[k] - pas)
    })
    // Captura referintei la p = 0,8 are randul 12 aprins, iar randul 13 (tinta) inca stins.
    expect(PRAGURI_AVALANSA[11]).toBeLessThanOrEqual(0.8)
    expect(PRAGURI_AVALANSA[12]).toBeGreaterThan(0.8)
  })

  it('contoarele din cautare se scriu "X h Y min" (SI, decizia D15)', () => {
    expect(formatTimp(0)).toBe('0 h 0 min')
    expect(formatTimp(98)).toBe('1 h 38 min')
    expect(formatTimp(59.6)).toBe('1 h 0 min')
  })

  it('asteptarea: ziua 2 la p 0,167, ziua 7 la 0,9; starea "uitat" intre 0,367 si 0,433', () => {
    expect(ziuaAsteptarii(0.1)).toBe(1)
    expect(ziuaAsteptarii(0.167)).toBe(2)
    expect(ziuaAsteptarii(0.9)).toBe(7)
    expect(ziuaAsteptarii(1)).toBe(7)
    expect(ziuaAsteptarii(0.367)).toBeLessThan(ZI_UITAT)
    expect(ziuaAsteptarii(0.433)).toBeGreaterThanOrEqual(ZI_UITAT)
  })

  it('fluxul: inima intre 0,091 si 0,152; razele pe rand, in ordinea drumului actului', () => {
    expect(PRAG_INIMA).toBeGreaterThan(0.091)
    expect(PRAG_INIMA).toBeLessThan(0.152)
    const praguri = AUTOMATIZARI.ROLURI.map((_, i) => pragRol(i))
    expect(new Set(praguri).size).toBe(AUTOMATIZARI.ROLURI.length)
    const inOrdine = AUTOMATIZARI.FLUX.ordine.map((i) => pragRol(i))
    expect(inOrdine).toEqual([...inOrdine].sort((a, b) => a - b))
    expect(Math.min(...praguri)).toBeGreaterThan(PRAG_INIMA)
  })

  it('arborele din portal: s_1 = 0,05, s_i = 0,06 i; la p = 1 fiecare rand e aprins; contorul cu punct de mii', () => {
    const total = PORTAL.ARBORE.randuri.length
    expect(total).toBe(16)
    expect(pragArbore(1, total)).toBe(0.05)
    for (let i = 2; i <= 14; i++) expect(pragArbore(i, total)).toBeCloseTo(0.06 * i, 6)
    // Abaterea de contrast: la referinta ultimul rand porneste la 0,92 si ramane la .48 in starea
    // finala (text 2,0:1). Aici porneste cu randul 14, deci starea finala (p = 1) are toate randurile
    // la cel putin .95: opacitatea randului e min(1, 6 (p - s_i)).
    expect(pragArbore(total - 1, total)).toBe(pragArbore(total - 2, total))
    for (let i = 0; i < total; i++) expect(Math.min(1, 6 * (1 - pragArbore(i, total))), 'randul ' + i).toBeGreaterThanOrEqual(0.95)
    expect(cuPunctDeMii(1318)).toBe('1.318')
    expect(cuPunctDeMii(999)).toBe('999')
    expect(cuPunctDeMii(1234567)).toBe('1.234.567')
    expect(necititeLa(0)).toBe(PORTAL.NECITITE_START)
    expect(necititeLa(1)).toBe(PORTAL.NECITITE_START + 24)
  })

  it('comutatorul: ciclul client -> contabil -> echipa -> client, 2,5 s, pauza 10 s', () => {
    expect(rolUrmator('client')).toBe('contabil')
    expect(rolUrmator('contabil')).toBe('echipa')
    expect(rolUrmator('echipa')).toBe('client')
    // Fisa S6: schimbari masurate la 2,38-2,65 s; dupa un clic, urmatoarea la ~12,4 s.
    expect(CICLU_MS).toBeGreaterThanOrEqual(2380)
    expect(CICLU_MS).toBeLessThanOrEqual(2650)
    expect(PAUZA_MS + CICLU_MS).toBeCloseTo(12400, -3)
  })

  it('grila de drepturi: primele doua pentru toti, ultimele doua doar pentru echipa', () => {
    const matrice = PORTAL.PORTAL.drepturi.map((_, d) => PORTAL.ROLURI_PORTAL.map((r) => PORTAL.areDrept(d, r)))
    expect(matrice).toEqual([
      [true, true, true],
      [true, true, true],
      [false, false, true],
      [false, false, true],
    ])
  })

  it('etichetele: sapte, rotite ca in fisa; praful: 20 de fire in suprafata, acelasi desen', () => {
    expect(ASEZARE_ETICHETE.map((a) => a.rotire)).toEqual([-12, 8, 15, -6, 4, -10, -18])
    expect(PORTAL.ETICHETE.etichete).toHaveLength(ASEZARE_ETICHETE.length)
    const praf = firePraf()
    expect(praf).toHaveLength(20)
    expect(firePraf()).toEqual(praf)
    // Control: alta samanta, alt desen.
    expect(firePraf(7)).not.toEqual(praf)
    for (const f of praf) {
      expect(f.stanga).toBeGreaterThanOrEqual(0)
      expect(f.stanga).toBeLessThanOrEqual(100)
      expect(f.sus).toBeGreaterThanOrEqual(0)
      expect(f.sus).toBeLessThanOrEqual(100)
      expect(f.marime).toBeGreaterThanOrEqual(2)
      expect(f.marime).toBeLessThanOrEqual(5)
      expect(f.opacitate).toBeGreaterThanOrEqual(0.25)
      expect(f.opacitate).toBeLessThanOrEqual(0.42)
    }
  })
})

describe('starea statica, randata pe server', () => {
  it('fiecare pagina are un singur h1', () => {
    for (const [cale, html] of Object.entries(PAGINI)) {
      expect((html.match(/<h1[\s>]/g) ?? []).length, cale).toBe(1)
    }
  })

  it('textele scrise sunt intregi in HTML-ul servit', () => {
    expect(text(PAGINI['/functionalitati/cautare-ai'])).toContain(CAUTARE.EROU_CAUTARE.intrebare)
    expect(text(PAGINI['/functionalitati/automatizari-ai'])).toContain(AUTOMATIZARI.EROU_AUTOMATIZARI.subtitlu)
    expect(text(PAGINI['/functionalitati/portal-clienti'])).toContain(PORTAL.EROU_PORTAL.cerere)
  })

  it('contoarele stau la valoarea finala (p = 1)', () => {
    const cautare = text(PAGINI['/functionalitati/cautare-ai'])
    expect(cautare).toContain(formatTimp(CAUTARE.FRUSTRARE.maxime.minute))
    const automatizari = text(PAGINI['/functionalitati/automatizari-ai'])
    expect(automatizari).toContain(AUTOMATIZARI.ASTEPTARE.zi + ' 7')
    expect(automatizari).toContain(AUTOMATIZARI.ASTEPTARE.stareUitat)
    expect(automatizari).not.toContain(AUTOMATIZARI.ASTEPTARE.zi + ' 1 ')
    const portal = text(PAGINI['/functionalitati/portal-clienti'])
    expect(portal).toContain(cuPunctDeMii(PORTAL.NECITITE_START + 24))
  })

  it('comutatorul porneste pe "client": un singur buton apasat', () => {
    const html = PAGINI['/functionalitati/portal-clienti']
    const apasate = [...html.matchAll(/aria-pressed="true"[^>]*>(?:<span[^>]*><\/span>)?([^<]+)</g)].map((m) => m[1])
    expect(apasate).toEqual([PORTAL.PORTAL.roluri.client.buton])
    expect((html.match(/aria-pressed="false"/g) ?? []).length).toBe(2)
  })

  it('fiecare macheta isi declara datele ca exemplu', () => {
    for (const [cale, html] of Object.entries(PAGINI)) {
      const machete = (html.match(/data-macheta="/g) ?? []).length
      const declaratii = (html.match(/<figcaption class="doar-cititor">Exemplu/g) ?? []).length
      expect(machete, cale).toBeGreaterThan(2)
      expect(declaratii, cale).toBeGreaterThanOrEqual(machete)
    }
  })

  it('CTA-ul duce la inregistrare numai cand ruta exista; altfel ramane inert', () => {
    const caiExistente = new Set(RUTE.map((r) => r.cale))
    for (const [cale, html] of Object.entries(PAGINI)) {
      const legaturi = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1])
      for (const href of legaturi) {
        expect(caiExistente.has(href) || href.startsWith('#'), cale + ' -> ' + href).toBe(true)
      }
      if (caiExistente.has('/inregistrare')) expect(legaturi, cale).toContain('/inregistrare')
      else expect(html, cale).toContain('data-tinta-lipsa="/inregistrare"')
    }
  })
})

describe('continutul', () => {
  const meta = [CAUTARE.META_CAUTARE_AI, AUTOMATIZARI.META_AUTOMATIZARI_AI, PORTAL.META_PORTAL_CLIENTI]

  it('titlurile au 15-65 de caractere, descrierile 50-160', () => {
    for (const m of meta) {
      expect(m.titlu.length, m.titlu).toBeGreaterThanOrEqual(15)
      expect(m.titlu.length, m.titlu).toBeLessThanOrEqual(65)
      expect(m.descriere.length, m.descriere).toBeGreaterThanOrEqual(50)
      expect(m.descriere.length, m.descriere).toBeLessThanOrEqual(160)
    }
  })

  it('codul fiscal din macheta are cifra de control gresita, deci nu e al nimanui', () => {
    const rand = PORTAL.PORTAL.randuri.find((r) => r.cheie.startsWith('CUI'))
    expect(rand).toBeDefined()
    const cod = rand?.valoare ?? ''
    expect(cod.replace(/\D/g, '').length).toBeGreaterThanOrEqual(6)
    expect(cuiValid(cod)).toBe(false)
    // Control: acelasi validator primeste codul cu cifra de control calculata (construit aici, nescris).
    const corp = cod.replace(/\D/g, '').slice(0, -1)
    expect(cuiValid(corp + String(cifraControlCui(corp)))).toBe(true)
  })

  it('adresele de e-mail din machete sunt pe domeniul rezervat .example', () => {
    const toate = Object.values(PAGINI).join(' ')
    const adrese = [...toate.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)].map((m) => m[0])
    expect(adrese.length).toBeGreaterThan(0)
    for (const a of adrese) expect(a.endsWith('.example'), a).toBe(true)
  })

  it('nicio liniuta lunga in HTML-ul paginilor, nici in atribute', () => {
    const liniute = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']')
    for (const [cale, html] of Object.entries(PAGINI)) expect(liniute.test(html), cale).toBe(false)
    // Control: expresia prinde liniuta cand ea exista.
    expect(liniute.test('a ' + String.fromCharCode(0x2014) + ' b')).toBe(true)
  })

  it('registrul feliei acopera cele trei pagini, cu stari cunoscute', () => {
    const registru = JSON.parse(readFileSync('src/content/afirmatii/cinema-1.json', 'utf8')) as Array<{
      unde: string
      stare: string
      sursa: string
      confirmat_de: string
    }>
    const unde = registru.map((a) => a.unde).join(', ')
    for (const fisier of ['cautare-ai.ts', 'automatizari-ai.ts', 'portal-clienti.ts']) {
      expect(unde).toContain('src/content/functionalitati/' + fisier)
    }
    for (const a of registru) {
      expect(['confirmat', 'neconfirmat', 'retras']).toContain(a.stare)
      if (a.stare === 'confirmat') {
        expect(a.sursa.length).toBeGreaterThan(20)
        expect(a.confirmat_de.length).toBeGreaterThan(0)
      }
    }
  })

  it('rutele feliei sunt in RUTE, sub marcajul ei, in ordinea din meniu', () => {
    const textRute = readFileSync('src/content/rute.ts', 'utf8')
    const start = textRute.indexOf('// <<felie:cinema-1>>')
    const stop = textRute.indexOf('// <<felie:cinema-2>>')
    expect(start).toBeGreaterThan(0)
    expect(stop).toBeGreaterThan(start)
    const cai = [...textRute.slice(start, stop).matchAll(/cale: "([^"]+)"/g)].map((m) => m[1])
    expect(cai).toEqual(['/functionalitati/cautare-ai', '/functionalitati/automatizari-ai', '/functionalitati/portal-clienti'])
  })
})
