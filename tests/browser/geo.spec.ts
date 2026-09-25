import { expect, test } from '@playwright/test'
import { RUTE } from '../../src/content/rute'
import { pornesteFixturile, type ServerFixturi } from './ajutor/fixturi'
import {
  FEREASTRA_RASPUNS,
  PRAG_PARITATE,
  masoaraMetadataSociala,
  masoaraParitatea,
  masoaraRaspunsul,
  type DeclaratieRaspuns,
} from './ajutor/geo'
import { RADACINA } from './ajutor/proiect'
import { citesteDeclaratiile } from './ajutor/raspunsuri'

/**
 * GEO pe build-ul real (felia seo-geo-gdpr, planul valului S4 §8.3): ce ajunge la un robot care
 * NU executa JavaScript. Detectoarele sunt in `ajutor/geo.ts`; pagina reala si martorii trec prin
 * aceleasi functii.
 *
 *   G-AI-01  paritatea: cel putin 95% din propozitiile paginii randate exista in HTML-ul servit
 *            (piesele animate isi au starea statica in HTML, plan §8.3);
 *   G-AI-02  raspunsul: entitatile declarate de ruta si titlul `<h1>` in primele 400 de cuvinte din
 *            `<main>`, primul paragraf autonom. Declaratia sta in fisierul feliei care detine ruta,
 *            `config/seo/<felia>.json` (regulile: `ajutor/raspunsuri.ts`);
 *   social   `og:url` e canonical-ul si `og:title` e titlul, pe fiecare ruta (cardul social arata
 *            pagina, nu startul mostenit din layout); og:image si twitter:image exista, pe originea
 *            site-ului, si raspund 200 image/png de la serverul local. O pagina care isi declara
 *            `openGraph` pierde imaginea din layout daca nu o da singura (`metadataPagina` o da).
 *
 * Rutele vin din `RUTE`, nu dintr-o lista scrisa aici: o ruta noua intra singura in proba, iar
 * daca nu-si declara raspunsul, proba spune pe nume si in ce fisier trebuia declarat.
 */

const CAI = RUTE.map((r) => r.cale)
const DECLARATII = citesteDeclaratiile(RADACINA, CAI)

let fixturi: ServerFixturi

test.beforeAll(async () => {
  fixturi = await pornesteFixturile()
})

test.afterAll(async () => {
  await fixturi.oprire()
})

test.describe('G-AI-01 paritate HTML servit / randat', () => {
  for (const cale of CAI) {
    test('pagina reala ' + cale + ': propozitiile randate sunt in HTML-ul servit', async ({ browser, baseURL }) => {
      const m = await masoaraParitatea(browser, (baseURL ?? '') + cale)
      console.log(
        '[G-AI-01] ' + cale + ' | innerWidth CITIT: ' + m.innerWidth + ' | propozitii randate: ' + m.propozitii +
          ' | in HTML-ul servit: ' + m.gasite + ' | acoperire: ' + m.acoperire.toFixed(4) +
          (m.lipsa.length ? ' | lipsa: ' + JSON.stringify(m.lipsa.slice(0, 8)) : ''),
      )
      expect(m.acoperire, 'text construit din JavaScript pe ' + cale + ': ' + JSON.stringify(m.lipsa.slice(0, 8))).toBeGreaterThanOrEqual(
        PRAG_PARITATE,
      )
    })
  }

  test('martor POZITIV: textul pus in pagina de JavaScript TREBUIE prins', async ({ browser }) => {
    const m = await masoaraParitatea(browser, fixturi.baza + '/brut/rau')
    console.log('[G-AI-01 martor pozitiv] acoperire: ' + m.acoperire.toFixed(4) + ' din ' + m.propozitii)
    expect(m.acoperire).toBeLessThan(PRAG_PARITATE)
  })

  test('martor NEGATIV: pagina servita intreaga NU trebuie prinsa', async ({ browser }) => {
    const m = await masoaraParitatea(browser, fixturi.baza + '/brut/bun')
    console.log('[G-AI-01 martor negativ] acoperire: ' + m.acoperire.toFixed(4) + ' din ' + m.propozitii)
    expect(m.acoperire).toBeGreaterThanOrEqual(PRAG_PARITATE)
  })
})

/** Declaratia fixturilor de raspuns: entitatile sunt in paragrafele fixturii. */
const DECLARATIE_FIXTURA: DeclaratieRaspuns = {
  intrebare: 'Cum se preda arhiva unei institutii?',
  entitati: ['proces-verbal', 'opis'],
}

test.describe('G-AI-02 raspunsul in primele ' + FEREASTRA_RASPUNS + ' de cuvinte', () => {
  test('declaratiile: un fisier pe felie, fiecare ruta numai in fisierul feliei ei', () => {
    console.log(
      '[G-AI-02 declaratii] rute: ' + CAI.length + ' | declarate: ' + DECLARATII.declaratii.size + ' | abateri: ' +
        (DECLARATII.abateri.join('; ') || '(niciuna)'),
    )
    expect(DECLARATII.abateri).toEqual([])
  })

  for (const cale of CAI) {
    test('pagina reala ' + cale + ': entitatile si titlul sunt in fereastra', async ({ browser, baseURL }) => {
      const declaratie = DECLARATII.declaratii.get(cale)
      expect(
        declaratie,
        'ruta ' + cale + ' nu isi declara raspunsul in ' + DECLARATII.fisierAsteptat.get(cale) + ', cheia raspuns_autonom',
      ).toBeDefined()
      const m = await masoaraRaspunsul(browser, (baseURL ?? '') + cale, declaratie as DeclaratieRaspuns)
      console.log(
        '[G-AI-02] ' + cale + ' | cuvinte in <main>: ' + m.cuvinteMain + ' | primul paragraf: ' +
          m.cuvintePrimulParagraf + ' cuvinte | abateri: ' + (m.abateri.join('; ') || '(niciuna)'),
      )
      expect(m.cuvinteMain, 'masuratoare goala pe ' + cale).toBeGreaterThan(0)
      expect(m.abateri, 'G-AI-02 pe ' + cale).toEqual([])
    })
  }

  test('martor NEGATIV: raspuns devreme, paragraf autonom de 30-80 de cuvinte', async ({ browser }) => {
    const m = await masoaraRaspunsul(browser, fixturi.baza + '/raspuns/bun', DECLARATIE_FIXTURA)
    console.log('[G-AI-02 martor negativ] ' + m.cuvintePrimulParagraf + ' cuvinte | ' + (m.abateri.join('; ') || '(niciuna)'))
    expect(m.cuvinteMain).toBeGreaterThan(FEREASTRA_RASPUNS)
    expect(m.abateri).toEqual([])
  })

  test('martor POZITIV: entitatea abia dupa ' + FEREASTRA_RASPUNS + ' de cuvinte TREBUIE prinsa', async ({ browser }) => {
    const m = await masoaraRaspunsul(browser, fixturi.baza + '/raspuns/tarziu', DECLARATIE_FIXTURA)
    console.log('[G-AI-02 martor pozitiv, tarziu] ' + m.abateri.join('; '))
    // Controlul fixturii: entitatea chiar exista in pagina, doar ca prea tarziu.
    expect(m.cuvinteMain).toBeGreaterThan(FEREASTRA_RASPUNS + 50)
    expect(m.entitatiLipsa).toEqual(['opis'])
  })

  test('martor POZITIV: paragraful care incepe cu un pronume de reluare TREBUIE prins', async ({ browser }) => {
    const m = await masoaraRaspunsul(browser, fixturi.baza + '/raspuns/reluare', DECLARATIE_FIXTURA)
    console.log('[G-AI-02 martor pozitiv, reluare] ' + m.abateri.join('; '))
    expect(m.entitatiLipsa).toEqual([])
    expect(m.abateri.some((a) => a.includes('incepe cu'))).toBe(true)
  })

  test('martor POZITIV: primul paragraf sub 30 de cuvinte TREBUIE prins, scutirea fara motiv la fel', async ({
    browser,
  }) => {
    const m = await masoaraRaspunsul(browser, fixturi.baza + '/raspuns/scurt', DECLARATIE_FIXTURA)
    console.log('[G-AI-02 martor pozitiv, scurt] ' + m.abateri.join('; '))
    expect(m.abateri.some((a) => a.includes('primul paragraf are'))).toBe(true)
    const faraMotiv = await masoaraRaspunsul(browser, fixturi.baza + '/raspuns/scurt', {
      ...DECLARATIE_FIXTURA,
      fara_regula_paragrafului: 'scurt',
    })
    expect(faraMotiv.abateri.some((a) => a.includes('nu are motiv scris'))).toBe(true)
  })
})

test.describe('metadata sociala: og:url = canonical, og:title = titlu, og:image si twitter:image servite', () => {
  const descrieImagini = (m: Awaited<ReturnType<typeof masoaraMetadataSociala>>) =>
    m.imagini
      .map((i) => i.eticheta + ' ' + (i.adresa ?? '(lipsa)') + ' -> ' + (i.status ?? '-') + ' ' + (i.tip ?? '-') + ' ' + i.octeti + ' B' + (i.png ? ' PNG' : ''))
      .join(' | ')

  for (const cale of CAI) {
    test('pagina reala ' + cale + ': cardul social arata pagina insasi, cu imaginea ei', async ({ browser, baseURL }) => {
      const m = await masoaraMetadataSociala(browser, (baseURL ?? '') + cale)
      console.log(
        '[social] ' + cale + ' | canonical: ' + m.canonical + ' | og:url: ' + m.ogUrl + ' | ' + descrieImagini(m) +
          ' | abateri: ' + (m.abateri.join('; ') || '(niciuna)'),
      )
      expect(m.abateri).toEqual([])
      // Controlul: imaginile chiar s-au cerut si au venit, nu doar ca nimeni nu s-a plans.
      expect(m.imagini.map((i) => i.octeti > 0 && i.png)).toEqual([true, true])
    })
  }

  test('martor POZITIV: cardul mostenit de la start pe o pagina interioara TREBUIE prins', async ({ browser }) => {
    const m = await masoaraMetadataSociala(browser, fixturi.baza + '/seo/og-mostenit')
    expect(m.abateri.length).toBe(2)
  })

  test('martor POZITIV: cardul fara og:image si fara twitter:image TREBUIE prins', async ({ browser }) => {
    const m = await masoaraMetadataSociala(browser, fixturi.baza + '/seo/og-fara-imagine')
    console.log('[social martor pozitiv, fara imagine] ' + m.abateri.join('; '))
    expect(m.abateri).toEqual(['lipseste og:image', 'lipseste twitter:image'])
  })

  test('martor POZITIV: imaginea care da 404 sau o pagina HTML TREBUIE prinsa', async ({ browser }) => {
    const m = await masoaraMetadataSociala(browser, fixturi.baza + '/seo/og-imagine-moarta')
    console.log('[social martor pozitiv, imagine moarta] ' + descrieImagini(m) + ' | ' + m.abateri.join('; '))
    expect(m.abateri).toHaveLength(2)
    expect(m.abateri[0]).toMatch(/^og:image raspunde 404 /)
    expect(m.abateri[1]).toMatch(/^twitter:image are tipul text\/html/)
  })

  test('martor POZITIV: imaginea care nu e PNG si imaginea de pe alta gazda TREBUIE prinse', async ({ browser }) => {
    const m = await masoaraMetadataSociala(browser, fixturi.baza + '/seo/og-imagine-falsa')
    console.log('[social martor pozitiv, imagine falsa sau straina] ' + descrieImagini(m) + ' | ' + m.abateri.join('; '))
    expect(m.abateri).toHaveLength(2)
    expect(m.abateri[0]).toBe('og:image se declara image/png, dar nu are semnatura PNG')
    expect(m.abateri[1]).toMatch(/^twitter:image \(https:\/\/imagini\.alta-gazda\.test\/.*\) nu e pe originea canonical-ului/)
    // Controlul: imaginea straina e altfel buna (PNG servit), deci o prinde numai verificarea originii.
    expect(m.imagini[1].png).toBe(true)
  })

  test('martor NEGATIV: cardul propriu al paginii, cu imaginea PNG servita, NU trebuie prins', async ({ browser }) => {
    const m = await masoaraMetadataSociala(browser, fixturi.baza + '/seo/og-bun')
    console.log('[social martor negativ] ' + descrieImagini(m))
    expect(m.canonical).not.toBeNull()
    expect(m.abateri).toEqual([])
    expect(m.imagini.map((i) => i.png)).toEqual([true, true])
  })
})
