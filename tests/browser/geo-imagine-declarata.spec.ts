import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { expect, test } from './ajutor/baza'
import { masoaraMetadataSociala, type OriginiLocale } from './ajutor/geo'

/**
 * Imaginea sociala se masoara la adresa DECLARATA in `og:image` / `twitter:image`, nu pe originea paginii deschise
 * (`ajutor/geo.ts`, `origineLocala`). Constatarea criticului feliei 121: pe 3s.com.ro copia engleza de sub `/en` are
 * canonical-ul si cardul social pe 3s.md, iar detectorul cerea imaginea de la serverul copiei; verdictul era corect
 * numai fiindca cele doua imagini aveau aceiasi octeti.
 *
 * Doua servere locale, pornite aici: A serveste pagina si un PNG bun la calea imaginii; B serveste, la ACEEASI cale, o
 * imagine diferita (text declarat image/png). Originea declarata in pagina e o gazda rezervata (RFC 2606), legata de
 * B sau de A prin `origini`. Mutantul: aceeasi pagina, cu imaginea diferita la adresa declarata. Detectorul de dinainte
 * (cererea pe originea paginii) il lasa verde, fiindca A are PNG-ul bun; cel de acum il prinde. Controlul fiecarui
 * martor pozitiv: PNG-ul bun chiar e servit de A la aceeasi cale, deci numai adresa ceruta face diferenta.
 *
 * Fixturile se asambleaza la rulare: numele gazdei si octetii imaginii nu stau pe litere in fisier.
 */

/** PNG-ul de un pixel (acelasi ca in `ajutor/fixturi.ts`), din bucati. */
const PNG = Buffer.from(
  ['iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ', 'AAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='].join(''),
  'base64',
)
const ALTA_IMAGINE = Buffer.from(['<html><body>', 'alta imagine', '</body></html>'].join(''), 'utf8')
const GAZDA_DECLARATA = 'https://' + ['fixtura-declarata', 'test'].join('.')
const CALE_IMAGINE = '/seo/imagine.png'
const CALE_CANONICA = '/seo/pagina-canonica'
/** Copia: alta cale decat a canonical-ului (ca /en/... pe 3s.com.ro, cu canonical-ul pe 3s.md la /...). */
const CALE_COPIE = '/en' + CALE_CANONICA
const TITLU = 'Termenele de pastrare'

function paginaHtml(): string {
  const canonic = GAZDA_DECLARATA + CALE_CANONICA
  const imagine = GAZDA_DECLARATA + CALE_IMAGINE
  return (
    '<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>' + TITLU + '</title>' +
    '<link rel="canonical" href="' + canonic + '">' +
    '<meta property="og:url" content="' + canonic + '">' +
    '<meta property="og:title" content="' + TITLU + '">' +
    '<meta property="og:image" content="' + imagine + '">' +
    '<meta name="twitter:image" content="' + imagine + '">' +
    '</head><body><main><h1>' + TITLU + '</h1></main></body></html>'
  )
}

/** Un server local: pagina (pe cale canonica si pe copie) si imaginea data. */
async function porneste(imagine: Buffer): Promise<{ server: Server; origine: string }> {
  const server = createServer((cerere, raspuns) => {
    const cale = (cerere.url ?? '/').split('?')[0]
    if (cale === CALE_IMAGINE) {
      raspuns.writeHead(200, { 'content-type': 'image/png' }).end(imagine)
    } else if (cale === CALE_CANONICA || cale === CALE_COPIE) {
      raspuns.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(paginaHtml())
    } else {
      raspuns.writeHead(404, { 'content-type': 'text/plain' }).end('nu exista')
    }
  })
  await new Promise<void>((gata) => server.listen(0, '127.0.0.1', gata))
  return { server, origine: 'http://127.0.0.1:' + (server.address() as AddressInfo).port }
}

let a: { server: Server; origine: string }
let b: { server: Server; origine: string }

test.beforeAll(async () => {
  a = await porneste(PNG)
  b = await porneste(ALTA_IMAGINE)
})

test.afterAll(async () => {
  for (const s of [a, b]) if (s) await new Promise((gata) => s.server.close(gata))
})

/** Controlul: la aceeasi cale, serverul paginii (A) serveste PNG-ul bun, adica ce masura detectorul de dinainte. */
async function controlulPaginii(): Promise<void> {
  const r = await fetch(a.origine + CALE_IMAGINE)
  const corp = Buffer.from(await r.arrayBuffer())
  expect(r.status).toBe(200)
  expect(corp.equals(PNG), 'controlul: A serveste PNG-ul bun la calea imaginii').toBe(true)
}

test.describe('imaginea sociala la adresa declarata (og:image, twitter:image)', () => {
  test('martor POZITIV: imaginea diferita la adresa declarata TREBUIE prinsa, desi pagina deschisa are PNG-ul bun', async ({
    browser,
  }) => {
    await controlulPaginii()
    const origini: OriginiLocale = { [GAZDA_DECLARATA]: b.origine }
    const m = await masoaraMetadataSociala(browser, a.origine + CALE_CANONICA, origini)
    console.log('[imagine declarata, mutant] ' + m.imagini.map((i) => i.eticheta + ' -> ' + i.ceruta + ' ' + i.sha256).join(' | '))
    expect(m.abateri).toEqual([
      'og:image se declara image/png, dar nu are semnatura PNG',
      'twitter:image se declara image/png, dar nu are semnatura PNG',
    ])
    expect(m.imagini.map((i) => i.ceruta)).toEqual([b.origine + CALE_IMAGINE, b.origine + CALE_IMAGINE])
  })

  test('martor NEGATIV: aceeasi pagina, cu originea declarata servita de serverul paginii, NU trebuie prinsa', async ({
    browser,
  }) => {
    const m = await masoaraMetadataSociala(browser, a.origine + CALE_CANONICA, { [GAZDA_DECLARATA]: a.origine })
    expect(m.abateri).toEqual([])
    expect(m.imagini.map((i) => i.png)).toEqual([true, true])
  })

  test('martor NEGATIV: fara `origini`, pagina care e chiar documentul canonical isi masoara imaginea pe serverul ei', async ({
    browser,
  }) => {
    const m = await masoaraMetadataSociala(browser, a.origine + CALE_CANONICA)
    expect(m.abateri).toEqual([])
    expect(m.imagini.map((i) => i.ceruta)).toEqual([a.origine + CALE_IMAGINE, a.origine + CALE_IMAGINE])
  })

  test('martor POZITIV: copia cu canonical-ul pe alt document, fara serverul originii declarate, iese NEMASURATA', async ({
    browser,
  }) => {
    await controlulPaginii()
    const m = await masoaraMetadataSociala(browser, a.origine + CALE_COPIE)
    expect(m.abateri).toHaveLength(2)
    for (const abatere of m.abateri) expect(abatere).toContain('NEMASURAT: originea declarata nu are server local')
    expect(m.imagini.map((i) => i.ceruta)).toEqual([null, null])
  })

  test('copia cu canonical-ul pe alt document, cu serverul domeniului canonical dat: imaginea de acolo', async ({ browser }) => {
    const rau = await masoaraMetadataSociala(browser, a.origine + CALE_COPIE, { [GAZDA_DECLARATA]: b.origine })
    expect(rau.abateri).toHaveLength(2)
    const bun = await masoaraMetadataSociala(browser, a.origine + CALE_COPIE, { [GAZDA_DECLARATA]: a.origine })
    expect(bun.abateri).toEqual([])
  })
})
