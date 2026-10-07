import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import { ASEZARI } from '../../src/lib/asezare'
import { EDITII } from '../../src/lib/editii'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * ADRESELE INEXISTENTE DE SUB `/ro` pe COPIA 3s.md (felia 140; `ajutor/copie-3s-md.ts`, profilul
 * `config/profil-3s-md.json`, plus o analitica proprie sintetica, ca bannerul si butonul de setari din subsol sa existe).
 * Defectul (testul 3s.md in browserul real, M2): orice `/ro/...` inexistent primea 404-ul englezesc - `lang="en"`,
 * legaturi spre paginile EN, ref-ul englezesc in wa.me.
 *
 * Ce se cere pe trei cai inexistente de sub `/ro` (una simpla, una adanca si una din grupul juridic, unde segmentul are
 * `dynamicParams = false`), pe HTML-ul servit: 404, `<html lang="ro">`, `Content-Language` al editiei ro-MD, titlul si
 * H1-ul paginii de negasit romanesti (citite din `src/app/global-not-found.comro.tsx`: pe 3s.com.ro aceeasi editie are
 * aceeasi pagina), neindexare; nicio legatura interna din pagina in afara editiei ro-MD, in afara celei marcate spre
 * engleza (`hreflang="en"`); drumurile din corp sunt exact paginile `/ro` din harta de site a copiei, plus pagina de
 * start; subsolul are legaturile si butonul de setari ale subsolului de pe `/ro/contact`; fiecare legatura wa.me poarta
 * ref-ul pe care tabelul de canale ro-MD il da caii (pagina de start, sau informatiile legale sub `/ro/juridic`), niciuna
 * pe cel englezesc. In browser, la 390 si la 1440: aspectul paginii de negasit englezesti (titlul sub antetul fix, corpul
 * titlurilor interioare, acelasi spatiu de sus, blocul centrat), iar butonul de setari din subsol deschide panoul de
 * consimtamant.
 *
 * DE CE PE HTML-UL SERVIT, nu numai in browser: o pagina de negasit care apare doar dupa JavaScript (Next trimite atunci
 * documentul de eroare, cu `<head>` si fara corp, si randeaza pagina in browser) arata bine in browser si goala pentru
 * oricine citeste octetii - exact cum a fost masurat defectul M2 (curl).
 *
 * MARTORII: POZITIV - aceeasi masuratoare pe o cale inexistenta de la radacina da 404-ul englezesc (deci masuratoarea
 * deosebeste cele doua pagini, iar restul cailor inexistente raman in engleza), si la fel pe caile-vecine ale prefixului:
 * doua care incep cu literele lui `/ro` fara sa fie sub el (`/rox-...`, `/robots-...`) si una care il contine numai in
 * interior. O regula a prefixului slabita (`startsWith('/ro')` fara bara, sau o cautare neancorata) le-ar da pagina
 * romaneasca, iar martorul de la radacina n-ar vedea nimic; NEGATIV - paginile `/ro` existente raspund 200, fara pagina
 * de negasit, si nu au nicio legatura in afara editiei (pagina de negasit nu le ia locul, iar regula legaturilor nu da
 * fals pe o pagina buna).
 *
 * ALEGEREA EDITIEI: middleware-ul pune calea ceruta intr-un antet al CERERII, citit de pagina de negasit globala; niciun
 * raspuns masurat aici nu are voie sa poarte antetele interne (`x-3s-...`, `x-middleware-...`).
 *
 * Cererile browserului catre alte gazde se blocheaza. Caile se asambleaza la rulare.
 */

const INSTANTA = 'https://' + ['statistica', 'proba-140', 'test'].join('.')
const ID_SITE = ['7b2c3d4e', '5f60', '4b7c', '9d8e', '0f1a2b3c4d5e'].join('-')
const PREFIX_RO = EDITII['ro-MD'].prefix

const citeste = (...cale: string[]) => readFileSync(join(RADACINA, ...cale), 'utf8')
const BRAND_NUME = (JSON.parse(citeste('config', 'brand.json')) as { nume: string }).nume

/** H1-ul si titlul documentului unei pagini de negasit globale, citite din sursa ei. */
function textePagina(fisier: string): { h1: string; titlu: string } {
  const text = citeste('src', 'app', fisier)
  const h1 = /<h1[^>]*>([^<]+)<\/h1>/.exec(text)?.[1].trim() ?? ''
  const titlu = /title:\s*"([^"]+)"\s*\+\s*BRAND\.nume/.exec(text)?.[1] ?? ''
  return { h1, titlu: titlu === '' ? '' : titlu + BRAND_NUME }
}
const RO = textePagina('global-not-found.comro.tsx')
const EN = textePagina('global-not-found.en.tsx')

/** Randurile tabelului de canale al unei editii, citite ca text: calea, daca acopera si paginile de sub ea, codul `ref`. */
function tabelCanale(fisier: string): { cale: string; prefix: boolean; ref: string }[] {
  return [...citeste('src', 'content', fisier).matchAll(/cale:\s*"([^"]+)",(\s*prefix:\s*true,)?\s*ref:\s*"([^"]+)"/g)].map((m) => ({
    cale: m[1],
    prefix: m[2] !== undefined,
    ref: m[3],
  }))
}
const TABEL_RO = tabelCanale('navigatie-ro-md.ts')
const TABEL_EN = tabelCanale('navigatie-en.ts')
/**
 * Ref-ul pe care tabelul il da unei cai, dupa regula lui `alegePeCale` (`src/content/navigatie.ts`): randul exact, altfel
 * cel mai lung rand cu prefix care o acopera, altfel randul implicit - pagina de start a editiei (`whatsappPePagina(...,
 * "/ro" | "/")`). O cale inexistenta nu are rand propriu: sub `/ro/juridic` primeste ref-ul informatiilor legale, in rest
 * pe cel al paginii de start.
 */
function refPentru(tabel: { cale: string; prefix: boolean; ref: string }[], implicita: string, cale: string): string {
  const exact = tabel.find((t) => !t.prefix && t.cale === cale)
  if (exact !== undefined) return exact.ref
  const acoperitoare = tabel.filter((t) => t.prefix && cale.startsWith(t.cale + '/')).sort((a, b) => b.cale.length - a.cale.length)[0]
  return acoperitoare?.ref ?? tabel.find((t) => !t.prefix && t.cale === implicita)?.ref ?? ''
}
const REF_RO = refPentru(TABEL_RO, PREFIX_RO, PREFIX_RO)
const REF_EN = refPentru(TABEL_EN, '/', '/')
/** Toate codurile `ref` ale editiei ro-MD: niciunul nu e al editiei EN. */
const REFURI_RO = new Set(TABEL_RO.map((t) => t.ref))

const UNIC = ['nu', 'exista', 'proba', '140'].join('-')
const CAI_RO = [PREFIX_RO + '/' + UNIC, PREFIX_RO + '/' + UNIC + '/adanc', PREFIX_RO + '/juridic/' + UNIC]
const CALE_EN = '/' + UNIC
/** Caile-vecine ale prefixului (vezi MARTORII din antet): doua care incep cu literele lui, una care il contine in interior. */
const CAI_VECINE = [PREFIX_RO + 'x-' + UNIC, PREFIX_RO + 'bots-' + UNIC, '/' + UNIC + PREFIX_RO + '/interior']
const MARTORI_EN = [CALE_EN, ...CAI_VECINE]

let copie: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(420_000)
  copie = await pornesteCopia3sMd({ UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID_SITE })
})

test.afterAll(async () => {
  await copie?.opreste()
})

// ---------------------------------------------------------------------------------- HTML-ul servit

type Legatura = { href: string; hreflang: string | null }

function bucata(html: string, start: RegExp, stop: string): string {
  const m = start.exec(html)
  if (m === null) return ''
  const sfarsit = html.indexOf(stop, m.index)
  return sfarsit < 0 ? '' : html.slice(m.index, sfarsit + stop.length)
}

function legaturi(html: string): Legatura[] {
  return [...html.matchAll(/<a\b[^>]*>/g)].map((m) => ({
    href: (/\shref="([^"]*)"/.exec(m[0])?.[1] ?? '').split('&amp;').join('&'),
    hreflang: /\shreflang="([^"]*)"/i.exec(m[0])?.[1] ?? null,
  }))
}

const interna = (h: string) => h.startsWith('/') && !h.startsWith('//')
const inEditiaRo = (h: string) => h === PREFIX_RO || h.startsWith(PREFIX_RO + '/') || h.startsWith(PREFIX_RO + '#') || h.startsWith(PREFIX_RO + '?')
/** Legaturile interne fara marcaj de alta limba: pe o pagina a editiei ro-MD toate trebuie sa ramana in editie. */
const interneFaraLimba = (html: string) => legaturi(html).filter((l) => interna(l.href) && l.hreflang === null).map((l) => l.href)

/** Codurile `ref` din toate legaturile wa.me ale paginii, si cate legaturi wa.me are. */
function refuriWa(html: string): { legaturi: number; refuri: string[] } {
  const wa = legaturi(html)
    .map((l) => l.href)
    .filter((h) => h.startsWith('https://wa.me/'))
  const refuri = wa.flatMap((h) => [...decodeURIComponent(h.split('?text=')[1] ?? '').matchAll(/\[ref:([^\]]+)\]/g)].map((m) => m[1]))
  return { legaturi: wa.length, refuri: [...new Set(refuri)].sort() }
}

type Masura = {
  status: number
  lang: string
  continutLimba: string
  titlu: string
  h1: string
  robots: string[]
  straine: string[]
  wa: { legaturi: number; refuri: string[] }
  corp: Legatura[]
  subsol: string[]
  setari: string
  interne: string[]
}

async function masoara(cale: string, baza: string = copie.baza, antete: Record<string, string> = {}): Promise<Masura> {
  const r = await fetch(baza + cale, { redirect: 'manual', headers: antete })
  const html = await r.text()
  const subsol = bucata(html, /<footer\b/, '</footer>')
  return {
    status: r.status,
    lang: /<html\b[^>]*\slang="([^"]*)"/.exec(html)?.[1] ?? '',
    continutLimba: r.headers.get('content-language') ?? '',
    titlu: /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '',
    h1: (/<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(bucata(html, /<main\b/, '</main>'))?.[1] ?? '').replace(/<[^>]+>/g, '').trim(),
    robots: [...html.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"/g)].map((m) => m[1]),
    straine: interneFaraLimba(html).filter((h) => !inEditiaRo(h)),
    wa: refuriWa(html),
    corp: legaturi(bucata(html, /<main\b/, '</main>')).filter((l) => interna(l.href)),
    subsol: [...new Set(interneFaraLimba(subsol))].sort(),
    setari: /data-cookie-settings[^>]*>([^<]*)</.exec(subsol)?.[1] ?? '',
    // Antetele interne ale alegerii editiei (calea pusa de middleware pe cerere) nu au voie sa ajunga in raspuns.
    interne: [...r.headers.keys()].filter((n) => /^x-(3s-|middleware-)/i.test(n)),
  }
}

/** Caile `/ro/...` din harta de site a copiei (fara pagina de start a editiei). */
async function paginiRoDinHarta(): Promise<string[]> {
  const harta = await (await fetch(copie.baza + '/sitemap.xml')).text()
  return [...harta.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((c) => c.startsWith(PREFIX_RO + '/')).sort()
}

test('preconditiile probei: textele, codurile ref si caile citite din surse nu sunt goale', () => {
  expect(RO.h1, 'H1-ul paginii de negasit romanesti, din global-not-found.comro.tsx').not.toBe('')
  expect(RO.titlu, 'titlul paginii de negasit romanesti').not.toBe('')
  expect(EN.h1, 'H1-ul paginii de negasit englezesti').not.toBe('')
  expect(EN.titlu, 'titlul paginii de negasit englezesti').not.toBe('')
  expect(REF_RO, 'ref-ul paginii de start ro-MD in tabelul de canale').not.toBe('')
  expect(REF_EN, 'ref-ul paginii de start EN in tabelul de canale').not.toBe('')
  expect(REFURI_RO.has(REF_EN), 'ref-ul EN nu e in tabelul ro-MD').toBe(false)
  // Regula prefixului chiar se exercita: calea juridica primeste alt ref decat cea simpla (altfel cazul ei n-ar masura nimic in plus).
  expect(refPentru(TABEL_RO, PREFIX_RO, CAI_RO[2])).not.toBe(REF_RO)
  expect(refPentru(TABEL_RO, PREFIX_RO, CAI_RO[1])).toBe(REF_RO)
  // Caile-vecine chiar sunt vecine: primele doua incep cu prefixul fara sa fie el sau sub el, a treia il are numai in interior.
  for (const c of CAI_VECINE.slice(0, 2)) expect(c.startsWith(PREFIX_RO) && c !== PREFIX_RO && !c.startsWith(PREFIX_RO + '/'), c).toBe(true)
  expect(CAI_VECINE[2].includes(PREFIX_RO + '/') && !CAI_VECINE[2].startsWith(PREFIX_RO), CAI_VECINE[2]).toBe(true)
  // Niciun rand al tabelului EN nu acopera martorii: fiecare are ref-ul paginii de start EN.
  for (const c of MARTORI_EN) expect(refPentru(TABEL_EN, '/', c), c).toBe(REF_EN)
})

test.describe('M2 ramas: orice cale inexistenta de sub /ro primeste pagina de negasit romaneasca', () => {
  for (const cale of CAI_RO) {
    test(cale + ': 404, lang ro, pagina de negasit romaneasca, legaturi numai in editia ro-MD, ref-ul ro-MD in wa.me', async () => {
      const m = await masoara(cale)
      const contact = await masoara(PREFIX_RO + '/contact')
      const pagini = await paginiRoDinHarta()
      console.log('[140] ' + cale + ' ' + JSON.stringify({ ...m, corp: m.corp.length, subsol: m.subsol.length }))
      expect(m.status).toBe(404)
      expect(m.interne).toEqual([])
      expect(m.lang).toBe(EDITII['ro-MD'].lang)
      expect(m.continutLimba).toBe(EDITII['ro-MD'].inLanguage)
      expect(m.h1).toBe(RO.h1)
      expect(m.titlu).toBe(RO.titlu)
      expect(m.robots.some((r) => r.includes('noindex')), m.robots.join(' | ')).toBe(true)
      // Nicio legatura interna in afara editiei ro-MD, in afara celor marcate spre alta limba.
      expect(m.straine).toEqual([])
      // Corpul: pagina de start a editiei, apoi exact paginile /ro din harta; spre engleza o singura legatura, marcata.
      expect(pagini.length, 'controlul: harta copiei are pagini /ro').toBeGreaterThan(0)
      const drumuri = m.corp.filter((l) => l.hreflang === null).map((l) => l.href)
      expect(drumuri).toContain(PREFIX_RO)
      expect([...new Set(drumuri.filter((h) => h !== PREFIX_RO))].sort()).toEqual(pagini)
      expect(m.corp.filter((l) => l.hreflang !== null)).toEqual([{ href: '/', hreflang: 'en' }])
      // Subsolul paginilor /ro: aceleasi legaturi si acelasi buton de setari ca pe /ro/contact.
      expect(contact.status, 'controlul: /ro/contact raspunde').toBe(200)
      expect(m.subsol.length, 'controlul: subsolul are legaturi').toBeGreaterThan(0)
      expect(m.subsol).toEqual(contact.subsol)
      expect(m.setari, 'butonul de setari din subsol').not.toBe('')
      expect(m.setari).toBe(contact.setari)
      // WhatsApp: legaturi exista (controlul), toate cu ref-ul pe care tabelul ro-MD il da caii.
      expect(m.wa.legaturi).toBeGreaterThan(0)
      expect(m.wa.refuri).toEqual([refPentru(TABEL_RO, PREFIX_RO, cale)])
    })
  }

  for (const cale of MARTORI_EN) {
    test('martor POZITIV ' + cale + ': aceeasi masuratoare pe o cale inexistenta din afara editiei ro-MD da 404-ul englezesc', async () => {
      const m = await masoara(cale)
      console.log('[140] martor ' + cale + ' ' + JSON.stringify({ ...m, corp: m.corp.length, subsol: m.subsol.length, straine: m.straine.length }))
      expect(m.status).toBe(404)
      expect(m.lang).toBe(EDITII.en.lang)
      expect(m.continutLimba).toBe(EDITII.en.inLanguage)
      expect(m.interne).toEqual([])
      expect(m.h1).toBe(EN.h1)
      expect(m.h1).not.toBe(RO.h1)
      expect(m.titlu).toBe(EN.titlu)
      // Regula legaturilor si cea a ref-ului chiar deosebesc paginile: pe 404-ul englezesc dau abateri.
      expect(m.straine.length).toBeGreaterThan(0)
      expect(m.wa.legaturi).toBeGreaterThan(0)
      expect(m.wa.refuri).toEqual([REF_EN])
    })
  }

  test('martor NEGATIV: paginile /ro existente raspund 200, fara pagina de negasit si fara legaturi in afara editiei', async () => {
    const juridic = (await paginiRoDinHarta()).find((c) => c.startsWith(PREFIX_RO + '/juridic/'))
    expect(juridic, 'controlul: harta copiei are un document juridic /ro').toBeDefined()
    for (const cale of [PREFIX_RO, PREFIX_RO + '/contact', juridic as string]) {
      const m = await masoara(cale)
      expect(m.status, cale).toBe(200)
      expect(m.interne, cale).toEqual([])
      expect(m.lang, cale).toBe(EDITII['ro-MD'].lang)
      expect(m.h1, cale).not.toBe(RO.h1)
      expect(m.straine, cale).toEqual([])
    }
  })
})

// ---------------------------------------------------------------------------------- antetul falsificat si 3s.com.ro

/** Numele antetului de cerere cu calea, citit din middleware (cel care il scrie); proba nu-l poarta pe litere. */
const ANTET_CALE = /const ANTET_CALE = '([^']+)'/.exec(citeste('src', 'middleware.ts'))?.[1] ?? ''

test('antetul falsificat de client nu alege editia pe 3s.md: o cale inexistenta de la radacina ramane in engleza', async () => {
  expect(ANTET_CALE, 'controlul: numele antetului citit din middleware').not.toBe('')
  const m = await masoara(CALE_EN, copie.baza, { [ANTET_CALE]: CAI_RO[0] })
  expect(m.status).toBe(404)
  expect(m.lang).toBe(EDITII.en.lang)
  expect(m.h1).toBe(EN.h1)
  expect(m.interne).toEqual([])
})

/**
 * SIMETRICUL PE 3s.com.ro (romana la radacina, engleza sub `/en`): o cale inexistenta de sub `/en` primeste pagina de
 * negasit englezeasca, cu legaturile asezarii (sub `/en`), restul pe cea romaneasca de azi. Copia se construieste cu
 * variabilele din `config/profil-3s-com-ro.json` puse peste cele ale profilului 3s.md (profilul com-ro are toate cheile
 * lui, plus asezarea). MARTORII granitei: caile care incep cu literele lui `/en` fara sa fie sub el si una care il
 * contine numai in interior raman romanesti, la fel o cale de la radacina cu antetul falsificat spre `/en`.
 */
test.describe('simetricul pe 3s.com.ro: orice cale inexistenta de sub /en primeste pagina de negasit englezeasca', () => {
  const COMRO = ASEZARI.ro
  const PREFIX_EN = COMRO.en.prefix
  const CAI_EN_COMRO = [PREFIX_EN + '/' + UNIC, PREFIX_EN + '/legal/' + UNIC]
  const MARTORI_RO_COMRO = ['/' + UNIC, PREFIX_EN + 'glish-' + UNIC, PREFIX_EN + 'x-' + UNIC, '/' + UNIC + PREFIX_EN + '/interior']
  const subEn = (h: string) => h === PREFIX_EN || h.startsWith(PREFIX_EN + '/') || h.startsWith(PREFIX_EN + '#') || h.startsWith(PREFIX_EN + '?')
  let comro: Copie3sMd

  test.beforeAll(async () => {
    test.setTimeout(420_000)
    const profil = mediuProfil3sMd(join(RADACINA, 'config', 'profil-3s-com-ro.json'))
    expect(profil.SITE_ASEZARE, 'controlul: profilul com-ro aseaza romana la radacina').toBe('ro')
    comro = await pornesteCopia3sMd({ ...profil, UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID_SITE })
  })

  test.afterAll(async () => {
    await comro?.opreste()
  })

  test('preconditiile: prefixul englez e nevid, cel romanesc e radacina, martorii sunt vecini ai prefixului', () => {
    expect(PREFIX_EN).not.toBe('')
    expect(COMRO['ro-MD'].prefix).toBe('')
    for (const c of MARTORI_RO_COMRO.slice(1, 3)) expect(c.startsWith(PREFIX_EN) && !c.startsWith(PREFIX_EN + '/'), c).toBe(true)
    expect(MARTORI_RO_COMRO[3].includes(PREFIX_EN + '/') && !MARTORI_RO_COMRO[3].startsWith(PREFIX_EN), MARTORI_RO_COMRO[3]).toBe(true)
  })

  for (const cale of CAI_EN_COMRO) {
    test(cale + ': 404, lang en, pagina de negasit englezeasca, legaturile din corp sub /en', async () => {
      const m = await masoara(cale, comro.baza)
      console.log('[140] com.ro ' + cale + ' ' + JSON.stringify({ ...m, subsol: m.subsol.length }))
      expect(m.status).toBe(404)
      expect(m.interne).toEqual([])
      expect(m.lang).toBe(COMRO.en.lang)
      expect(m.continutLimba).toBe(COMRO.en.inLanguage)
      expect(m.h1).toBe(EN.h1)
      expect(m.titlu).toBe(EN.titlu)
      expect(m.robots.some((r) => r.includes('noindex')), m.robots.join(' | ')).toBe(true)
      const drumuri = m.corp.filter((l) => l.hreflang === null).map((l) => l.href)
      expect(drumuri.length, 'controlul: corpul are legaturi').toBeGreaterThan(0)
      expect(drumuri.filter((h) => !subEn(h))).toEqual([])
      // Spre romana o singura legatura, marcata cu limba servita a radacinii.
      expect(m.corp.filter((l) => l.hreflang !== null)).toEqual([{ href: '/', hreflang: COMRO['ro-MD'].inLanguage }])
      // Pe toata pagina (antet, corp, subsol), legaturile interne nemarcate raman sub /en; wa.me poarta ref-ul EN.
      expect(m.straine.length, 'controlul: pagina are legaturi interne').toBeGreaterThan(0)
      expect(m.straine.filter((h) => !subEn(h))).toEqual([])
      expect(m.wa.legaturi).toBeGreaterThan(0)
      expect(m.wa.refuri).toEqual([REF_EN])
    })
  }

  for (const cale of MARTORI_RO_COMRO) {
    test('martor ' + cale + ': ramane pagina de negasit romaneasca', async () => {
      const m = await masoara(cale, comro.baza)
      expect(m.status).toBe(404)
      expect(m.interne).toEqual([])
      expect(m.lang).toBe(COMRO['ro-MD'].lang)
      expect(m.continutLimba).toBe(COMRO['ro-MD'].inLanguage)
      expect(m.h1).toBe(RO.h1)
      expect(m.titlu).toBe(RO.titlu)
      // Regula legaturilor chiar deosebeste paginile: pe 404-ul romanesc corpul are drumuri in afara lui /en.
      expect(m.corp.filter((l) => l.hreflang === null && !subEn(l.href)).length).toBeGreaterThan(0)
    })
  }

  test('antetul falsificat de client nu alege editia pe 3s.com.ro: o cale de la radacina ramane romaneasca', async () => {
    expect(ANTET_CALE).not.toBe('')
    const m = await masoara('/' + UNIC, comro.baza, { [ANTET_CALE]: CAI_EN_COMRO[0] })
    expect(m.status).toBe(404)
    expect(m.lang).toBe(COMRO['ro-MD'].lang)
    expect(m.h1).toBe(RO.h1)
  })

  test('martor NEGATIV: pagina /en existenta raspunde 200 in engleza, fara pagina de negasit', async () => {
    const m = await masoara(PREFIX_EN, comro.baza)
    expect(m.status).toBe(200)
    expect(m.lang).toBe(COMRO.en.lang)
    expect(m.h1).not.toBe(EN.h1)
  })
})

// ---------------------------------------------------------------------------------- in browser

async function context(browser: Browser, latime: number): Promise<{ ctx: BrowserContext; pagina: Page }> {
  const ctx = await browser.newContext({ viewport: { width: latime, height: latime < 800 ? 844 : 900 } })
  const proprie = new URL(copie.baza).host
  await ctx.route('**/*', (r) => (new URL(r.request().url()).host === proprie ? r.continue() : r.abort('blockedbyclient')))
  return { ctx, pagina: await ctx.newPage() }
}

async function deschide(pagina: Page, cale: string): Promise<number> {
  const r = await pagina.goto(copie.baza + cale, { waitUntil: 'domcontentloaded' })
  await pagina.waitForLoadState('networkidle').catch(() => {})
  return r?.status() ?? 0
}

/** Aspectul paginii de negasit: corpul H1 fata de martorul titlurilor interioare, pozitia fata de antet, spatiul de sus. */
async function aspect(pagina: Page) {
  return pagina.evaluate(() => {
    const main = document.querySelector('main') as HTMLElement
    const h1 = main.querySelector('h1') as HTMLElement
    const antet = document.querySelector('header') as HTMLElement
    const martor = document.createElement('h1')
    martor.className = 't-h1-interior'
    martor.textContent = 'martor'
    document.body.append(martor)
    const marimeMartor = parseFloat(getComputedStyle(martor).fontSize)
    martor.remove()
    const r = h1.getBoundingClientRect()
    return {
      latime: window.innerWidth,
      lang: document.documentElement.lang,
      marime: parseFloat(getComputedStyle(h1).fontSize),
      marimeMartor,
      sus: r.top,
      antetJos: antet.getBoundingClientRect().bottom,
      spatiuSus: getComputedStyle(main).paddingTop,
      abatereCentru: Math.abs(r.left + r.width / 2 - document.documentElement.clientWidth / 2),
    }
  })
}

test.describe('M2 ramas, in browser: aspectul paginii englezesti si butonul de setari', () => {
  for (const latime of [390, 1440]) {
    test('la ' + latime + ': 404 romanesc cu aspectul celui englezesc; butonul de setari din subsol deschide panoul', async ({ browser }) => {
      const { ctx, pagina } = await context(browser, latime)
      const statusEn = await deschide(pagina, CALE_EN)
      const en = await aspect(pagina)
      const status = await deschide(pagina, CAI_RO[0])
      const ro = await aspect(pagina)
      const banner = pagina.locator('[data-consimtamant]')
      await expect(banner).toBeVisible()
      await banner.locator('[data-refuz]').click()
      await expect(banner).toBeHidden()
      const buton = pagina.locator('footer [data-cookie-settings]')
      await expect(buton).toHaveCount(1)
      await buton.click()
      await expect(pagina.locator('[data-consimtamant-setari]')).toBeVisible()
      await ctx.close()
      console.log('[140] ' + latime + ' ' + JSON.stringify({ statusEn, en, status, ro }))
      expect([statusEn, status]).toEqual([404, 404])
      expect([en.lang, ro.lang]).toEqual([EDITII.en.lang, EDITII['ro-MD'].lang])
      expect(ro.marime).toBeGreaterThan(16)
      expect(ro.marime).toBe(ro.marimeMartor)
      expect(ro.marime).toBe(en.marime)
      expect(ro.sus).toBeGreaterThanOrEqual(ro.antetJos)
      expect(ro.spatiuSus).toBe(en.spatiuSus)
      expect(ro.abatereCentru).toBeLessThan(2)
      expect(en.abatereCentru).toBeLessThan(2)
    })
  }
})
