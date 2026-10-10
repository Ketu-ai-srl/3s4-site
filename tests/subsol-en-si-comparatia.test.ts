import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Subsol from '../src/components/global/Subsol'
import FirPagina, { dateFirServite } from '../src/components/primitive/FirPagina'
import { adreseServite, origineaEnglezei } from '../src/components/seo/JsonLd'
import type { GrafJsonLd } from '../src/components/seo/date-structurate'
import { pagina as comparatie } from '../src/content/en/compare-3s-vs-google-drive'
import { pagina as startEn } from '../src/content/en/home'
import { caleMd } from '../src/content/juridic/md/registru'
import { NAVIGATIE_RO, multimeaCailor } from '../src/content/navigatie'
import { GLOSA_INFORMATII_LEGALE_EN, TEXTE_WHATSAPP_EN, navigatieEn } from '../src/content/navigatie-en'
import { OPTIUNI_BUILD, paginaAcasa } from '../src/content/ro-md/acasa'
import { RUTE_EN_REFERINTA } from '../src/content/rute-en-referinta'
import { configurareCanale } from '../src/lib/canale-mediu'

// Felia 141 `subsol-en-si-comparatia`. Patru lucruri, fiecare cu martorul lui:
//   M7 ramas  - tot ce duce la /compare/3s-vs-google-drive spune ce compara pagina: Google Drive, fara Box AI;
//   m18       - "Informații legale" ramane in romana in subsolul EN (lang ro, hrefLang), cu glosa engleza langa ea;
//   JSON-LD   - pe asezarea `ro`, adresele paginilor engleze (WebPage.url, firul) urmeaza canonical-ul (3s.md);
//   firul     - JSON-LD-ul firului trece prin `serializeaza` (evadarea `<`), ca JsonLd.tsx.
// Fixturile cu textul vechi se asambleaza la rulare, ca proba sa nu poarte pe litere ce vaneaza.

const RADACINA = join(__dirname, '..')
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as Record<string, unknown>
const CANALE = configurareCanale(JSON.stringify(PROFIL.CANALE_JSON), '')
const CALE_COMPARATIE = '/compare/3s-vs-google-drive'
const BOX = 'Bo' + 'x'

/** Textul unui element de lista markdown `[eticheta](cale)` care duce la `cale`. */
function etichetaLegaturii(texte: readonly string[], cale: string): string[] {
  const iesire: string[] = []
  for (const t of texte) {
    for (const m of t.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) if (m[2] === cale) iesire.push(m[1])
  }
  return iesire
}

/** Toate sirurile dintr-un obiect de continut (paragrafe, elemente de lista, titluri). */
function siruri(o: unknown): string[] {
  if (typeof o === 'string') return [o]
  if (Array.isArray(o)) return o.flatMap(siruri)
  if (o !== null && typeof o === 'object') return Object.values(o).flatMap(siruri)
  return []
}

describe('M7 ramas: etichetele si textele care duc la comparatie numesc numai Google Drive', () => {
  it('martor POZITIV: detectorul prinde formele vechi (asamblate aici)', () => {
    const vechi = ['3S vs Google and ' + BOX + ' AI', 'your comparison with Google and ' + BOX + ' AI', '3S comparat cu Google și ' + BOX + ' AI']
    for (const v of vechi) expect(v.includes(BOX), v).toBe(true)
  })

  it('subsolul si meniul (foaia Guides), numele scurt al rutei, startul EN si startul /ro: eticheta spune Google Drive', () => {
    const en = navigatieEn(CANALE, new Set<string>())
    const legaturi = en.subsol.coloane.flatMap((c) => c.legaturi).filter((l) => l.href === CALE_COMPARATIE)
    const foaie = en.antet.legaturi.flatMap((n) => (n.foaie ? n.foaie.elemente : [])).filter((e) => e.href === CALE_COMPARATIE)
    const scurt = RUTE_EN_REFERINTA.filter((r) => r.cale === CALE_COMPARATIE).map((r) => r.scurt)
    const peStartEn = etichetaLegaturii(siruri(startEn), CALE_COMPARATIE)
    // Sectiunea ghidurilor de pe startul /ro apare numai cu ghidurile publicate in build; aici se cere explicit.
    const peStartRo = etichetaLegaturii(siruri(paginaAcasa({ ...OPTIUNI_BUILD, ghiduri: true })), '/ro/comparatie-drive')
    // Controlul: fiecare loc chiar are eticheta (o absenta nu trece drept "fara Box").
    expect([legaturi.length, foaie.length, scurt.length, peStartEn.length, peStartRo.length]).toEqual([1, 1, 1, 1, 1])
    const etichete = [...legaturi.map((l) => l.text), ...foaie.map((e) => e.text), ...scurt, ...peStartEn]
    for (const e of etichete) expect(e).toBe('3S vs Google Drive')
    expect(peStartRo).toEqual(['3S comparat cu Google Drive'])
  })

  it('textul precompletat wa.me (navigatia EN si cutia paginii): "your comparison with Google Drive", cu [ref:en-vs] pastrat', () => {
    const peNavigatie = TEXTE_WHATSAPP_EN.filter((t) => t.cale === CALE_COMPARATIE)
    expect(peNavigatie).toHaveLength(1)
    const asteptat = 'Hello 3S, I read your comparison with Google Drive [ref:en-vs]. I would like to ask whether 3S fits our case.'
    expect(peNavigatie[0].text).toBe(asteptat)
    expect(peNavigatie[0].ref).toBe('en-vs')
    expect(comparatie.cta.textWhatsapp).toBe(asteptat)
    expect(comparatie.cta.ref).toBe('en-vs')
  })

  it('registrul: nicio intrare activa a paginii nu numeste Box AI; intrarea Box AI e retrasa, cu motiv si data', () => {
    type Intrare = { id: string; text: string; unde: string; stare: string; sursa: string; data: string }
    const citeste = (f: string) => JSON.parse(readFileSync(join(RADACINA, 'src', 'content', 'afirmatii', f), 'utf8')) as Intrare[]
    const aleComparatiei = [
      ...citeste('en-referinta.json').filter((i) => i.unde.includes('compare-3s-vs-google-drive.ts')),
      ...citeste('ro-md-oglinda.json').filter((i) => i.unde.includes('ro-md/comparatie-componente.ts')),
    ]
    const active = aleComparatiei.filter((i) => i.stare !== 'retras')
    expect(active.length).toBeGreaterThan(3)
    for (const i of active) expect(i.text, i.id).not.toContain(BOX)
    expect(active.find((i) => i.id === 'en-referinta-comparatii-publicitate-comparativa')?.text).toContain('Google Drive')
    const box = aleComparatiei.find((i) => i.id === 'en-referinta-comparatii-marcaje-' + BOX.toLowerCase() + '-ai')
    expect(box?.stare).toBe('retras')
    expect(box?.sursa).toMatch(/^retrasă de felia 141/)
    expect(box?.data).toBe('2026-10-07')
  })

  // Adresa paginii spune ce compara: Google Drive. Vechea adresa (cu Box in ea) nu mai e ruta; o duce la cea noua
  // redirectarea permanenta din `src/lib/asezare.ts`, fixata in `tests/asezare.test.ts`.
  it('adresa paginii e cea cu "google-drive": ruta, meniul si legatura de pe start; vechea adresa nu mai e ruta', () => {
    expect(RUTE_EN_REFERINTA.map((r) => r.cale)).toContain(CALE_COMPARATIE)
    expect(etichetaLegaturii(siruri(startEn), CALE_COMPARATIE)).toHaveLength(1)
    const veche = '/compare/3s-vs-google-and-' + BOX.toLowerCase()
    expect(RUTE_EN_REFERINTA.map((r) => r.cale)).not.toContain(veche)
    expect(etichetaLegaturii(siruri(startEn), veche)).toHaveLength(0)
  })
})

describe('m18: "Informații legale" in romana in subsolul EN, cu glosa engleza', () => {
  const en = navigatieEn(CANALE, new Set<string>())
  const tinta = caleMd('informatii-legale', 'ro')
  const cai = multimeaCailor([{ cale: '/' }], [tinta])

  it('subsolul EN: legatura cu lang ro si hrefLang ro-MD (asezarea md), apoi glosa, in AFARA legaturii', () => {
    const html = renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai }))
    const m = html.match(/<a [^>]*href="([^"]+)"[^>]*>Informații legale<\/a>(<span[^>]*>[^<]*<\/span>)?/)
    expect(m, 'controlul: legatura exista').not.toBeNull()
    const a = m![0].slice(0, m![0].indexOf('>') + 1)
    expect(a).toContain('lang="ro"')
    expect(a).toContain('hrefLang="ro-MD"')
    expect(m![1]).toBe(tinta)
    expect(GLOSA_INFORMATII_LEGALE_EN).toBe('in Romanian')
    expect(m![2]).toBe('<span data-glosa-locala="">' + ' (in Romanian)' + '</span>')
  })

  it('martor NEGATIV: subsolul romanesc (contractul implicit) nu scrie nicio glosa', () => {
    const html = renderToStaticMarkup(createElement(Subsol, { navigatie: NAVIGATIE_RO, cai }))
    expect(html).toContain('<footer')
    expect(html).not.toContain('data-glosa-locala')
  })
})

describe('JSON-LD pe asezarea ro: adresele paginilor engleze urmeaza canonical-ul (domeniul englezei)', () => {
  const BAZA_RO = 'https://' + ['3s', 'com', 'ro'].join('.')
  const ENGLEZEI = 'https://' + ['3s', 'md'].join('.')
  const RUTE = [
    { cale: '/', editie: 'en' as const },
    { cale: '/pricing', editie: 'en' as const },
    { cale: '/ro', editie: 'ro-MD' as const },
    { cale: '/ro/preturi', editie: 'ro-MD' as const },
  ]
  const graf = (): GrafJsonLd =>
    ({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': BAZA_RO + '/pricing#webpage', url: BAZA_RO + '/pricing' },
        { '@type': 'FAQPage', url: BAZA_RO + '/pricing#faq' },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, item: BAZA_RO + '/' },
            { '@type': 'ListItem', position: 2, item: BAZA_RO + '/pricing' },
          ],
        },
        { '@type': 'WebPage', url: BAZA_RO + '/ro/preturi' },
        { '@type': 'Organization', '@id': BAZA_RO + '/#organizatie', url: BAZA_RO + '/' },
        { '@type': 'WebSite', url: BAZA_RO + '/' },
      ],
    }) as unknown as GrafJsonLd

  it('pagini engleze -> domeniul englezei cu calea sursa; romanesti -> adresa servita; @id si nodurile de site neatinse', () => {
    const iesire = adreseServite(graf(), { asezare: 'ro', baza: BAZA_RO, rute: RUTE, englezei: () => ENGLEZEI })['@graph'] as Record<string, unknown>[]
    expect(iesire[0].url).toBe(ENGLEZEI + '/pricing')
    expect(iesire[0]['@id']).toBe(BAZA_RO + '/pricing#webpage')
    expect(iesire[1].url).toBe(ENGLEZEI + '/pricing#faq')
    expect((iesire[2].itemListElement as { item: string }[]).map((i) => i.item)).toEqual([ENGLEZEI + '/', ENGLEZEI + '/pricing'])
    expect(iesire[3].url).toBe(BAZA_RO + '/preturi')
    expect(iesire[4].url).toBe(BAZA_RO + '/')
    expect(iesire[5].url).toBe(BAZA_RO + '/')
  })

  it('martor NEGATIV: pe asezarea md graful iese neatins (acelasi obiect)', () => {
    const g = graf()
    expect(adreseServite(g, { asezare: 'md', baza: BAZA_RO, rute: RUTE })).toBe(g)
  })

  it('martor POZITIV: fara domeniul englezei (SITE_ALTERNATE fara baza en, sau cu prefix), construirea se opreste', () => {
    expect(origineaEnglezei([{ hreflang: 'en', adresa: ENGLEZEI }])).toBe(ENGLEZEI)
    expect(() => origineaEnglezei([{ hreflang: 'ro-RO', adresa: BAZA_RO }])).toThrow(/n-are baza en/)
    expect(() => origineaEnglezei([{ hreflang: 'en', adresa: ENGLEZEI + '/en' }])).toThrow(/prefix de cale/)
  })
})

describe('firul de pagina: JSON-LD-ul trece prin `serializeaza` (evadarea `<`)', () => {
  const blocul = (html: string) => html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]

  it('martor POZITIV: un nume de nivel cu `</script>` nu inchide eticheta; JSON-ul citit inapoi e acelasi', () => {
    const inchidere = '<' + '/script>'
    const niveluri = [
      { text: 'Acasa', cale: '/' },
      { text: 'Titlu ' + inchidere + '<b>x</b>', cale: '/despre' },
    ]
    const html = renderToStaticMarkup(createElement(FirPagina, { niveluri }))
    // Controlul: forma de dinainte (JSON.stringify) ar fi lasat eticheta de inchidere in bloc.
    expect(JSON.stringify(dateFirServite(niveluri))).toContain(inchidere)
    expect(html.split(inchidere)).toHaveLength(2)
    const bloc = blocul(html)
    expect(bloc).not.toContain('<')
    expect(JSON.parse(bloc)).toEqual(dateFirServite(niveluri))
  })

  it('martor NEGATIV: pe datele de azi (fara `<`) textul scris e identic cu cel al lui JSON.stringify', () => {
    const niveluri = [
      { text: 'Acasă', cale: '/' },
      { text: 'Prețuri', cale: '/preturi' },
    ]
    const html = renderToStaticMarkup(createElement(FirPagina, { niveluri }))
    expect(blocul(html)).toBe(JSON.stringify(dateFirServite(niveluri)))
  })
})
