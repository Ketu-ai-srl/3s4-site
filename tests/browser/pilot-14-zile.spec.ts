import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { durate30, pilot14, pilot30, textDinHtml } from './ajutor/pilot'

/**
 * Durata pilotului gratuit pe CAILE SERVITE (decizia owner-ului din 05.10.2026: 14 zile pe toate editiile).
 *
 * Doua servere: build-ul RO al probelor (serverul din `playwright.config.ts`) si copia 3s.md construita cu profilul
 * aplicatiei (`ajutor/copie-3s-md.ts`). Caile NU se scriu aici: se iau din `/sitemap.xml` al fiecarui server, plus
 * `/llms.txt`. Pe fiecare cale, pe raspunsul servit (HTML cu JSON-LD si fluxul RSC, sau text), detectorul din
 * `ajutor/pilot.ts` cere zero propozitii cu un pilot de 30 de zile.
 *
 * CONTROALE, ca un "zero" sa nu vina dintr-o masuratoare oarba:
 *   - lista: fiecare server are mai mult de 10 cai in harta, toate cu 200, si toate masurate;
 *   - durata vazuta: pe fiecare server detectorul gaseste macar o durata de 30 de zile care ramane (valabilitatea
 *     ofertei, termene juridice, blogul RO), deci citeste textul servit si o filtreaza, nu e surd;
 *   - pilotul nou: pe 3s.md pilotul de 14 zile apare atat pe editia en (cai fara /ro), cat si pe ro-MD (/ro...),
 *     iar /pricing si /ro il au fiecare;
 *   - martorii detectorului (pozitiv si negativ) sunt in `tests/pilot-14-zile.test.ts`.
 */

type Masurare = { cai: number; durate30: number; probleme: string[]; cu14: Map<string, number> }

function caleDin(adresa: string): string {
  return new URL(adresa).pathname
}

async function masoara(baza: string): Promise<Masurare> {
  const harta = await (await fetch(baza + '/sitemap.xml')).text()
  const cai = [...new Set([...harta.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => caleDin(m[1].trim())))]
  cai.push('/llms.txt')
  const rezultat: Masurare = { cai: 0, durate30: 0, probleme: [], cu14: new Map() }
  for (const cale of cai) {
    const r = await fetch(baza + cale)
    const corp = await r.text()
    rezultat.cai++
    if (r.status !== 200) {
      rezultat.probleme.push(cale + ': status ' + r.status)
      continue
    }
    const text = cale.endsWith('.txt') ? corp : textDinHtml(corp)
    rezultat.durate30 += durate30(text)
    for (const p of pilot30(text)) rezultat.probleme.push(cale + ': ' + p)
    const n14 = pilot14(text).length
    if (n14 > 0) rezultat.cu14.set(cale, n14)
  }
  return rezultat
}

/** Martorii pe forma servita (HTML cu etichete si entitati), asamblati la rulare; cei pe text sunt in proba vitest. */
const TREI_ZECI = '3' + '0'

test('martor POZITIV: pilotul de 30 de zile e prins in HTML servit, si in banda de cifre impartita pe doua elemente', () => {
  const forme = [
    '<html><body><p>Every start is a free ' + TREI_ZECI + '-day pilot.</p></body></html>',
    '<div><span>' + TREI_ZECI + '&nbsp;de zile</span><span>de pilot gratuit</span></div>',
    '<script type="application/ld+json">{"description":"Enterprise from EUR 800. Free ' + TREI_ZECI + '-day pilot."}</script>',
  ]
  for (const f of forme) expect(pilot30(textDinHtml(f)), f).toHaveLength(1)
})

test('martor NEGATIV: valabilitatea ofertei si pilotul de 14 zile nu sunt acuzate; durata de 30 de zile ramasa e vazuta', () => {
  const oferta = '<p>After the pilot, we confirm the plan and the price in a written offer, valid for ' + TREI_ZECI + ' days.</p>'
  const corect = '<p>Every start is a free 14-day pilot.</p><p>Pilot gratuit de 14 zile, asistat.</p>'
  expect(pilot30(textDinHtml(oferta + corect))).toEqual([])
  expect(durate30(textDinHtml(oferta))).toBe(1)
  expect(pilot14(textDinHtml(corect))).toHaveLength(2)
})

test.describe('build-ul RO', () => {
  test('zero pilot de 30 de zile pe caile servite, cu controalele listei si ale duratei vazute', async ({ baseURL }) => {
    test.setTimeout(300_000)
    const m = await masoara(String(baseURL).replace(/\/+$/, ''))
    console.log('[pilot-14-zile] RO: cai ' + m.cai + ', durate de 30 de zile vazute ' + m.durate30 + ', cai cu pilotul de 14 zile ' + m.cu14.size + ', probleme ' + m.probleme.length)
    expect(m.cai).toBeGreaterThan(10)
    expect(m.probleme).toEqual([])
    expect(m.durate30).toBeGreaterThan(0)
  })
})

test.describe('copia 3s.md', () => {
  let copie: Copie3sMd

  test.beforeAll(async () => {
    test.setTimeout(600_000)
    copie = await pornesteCopia3sMd()
  })

  test.afterAll(async () => {
    await copie?.opreste()
  })

  test('zero pilot de 30 de zile pe caile servite; pilotul de 14 zile pe ambele editii', async () => {
    test.setTimeout(300_000)
    const m = await masoara(copie.baza)
    const en = [...m.cu14.keys()].filter((c) => !/^\/ro(\/|$)/.test(c))
    const roMd = [...m.cu14.keys()].filter((c) => /^\/ro(\/|$)/.test(c))
    console.log('[pilot-14-zile] 3s.md: cai ' + m.cai + ', durate de 30 de zile vazute ' + m.durate30 + ', cai cu pilotul de 14 zile en ' + en.length + ' / ro-MD ' + roMd.length + ', probleme ' + m.probleme.length)
    expect(m.cai).toBeGreaterThan(10)
    expect(m.probleme).toEqual([])
    expect(m.durate30).toBeGreaterThan(0)
    expect(en).toContain('/pricing')
    expect(roMd).toContain('/ro')
  })
})
