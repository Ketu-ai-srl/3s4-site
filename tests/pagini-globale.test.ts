import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * PIESELE GLOBALE pe domeniul cu doua limbi (3s.md: engleza la radacina, romana sub `/ro`), felia 134.
 *
 *   (1) CONSIMTAMANTUL: o alegere priveste scopurile si furnizorii, nu limba. Pe domeniul cu mai multe limbi
 *       valabilitatea se masoara pe versiunea de CATALOG (`src/components/consimtamant/versiune.ts`): aceeasi pe `/` si
 *       pe `/ro`, alta cand se schimba un furnizor, un scop sau cheia alegerii (martori pe COPII ale fiecarei parti a
 *       catalogului). Pe site-ul romanesc (o singura limba) componenta primeste exact proprietatile de dinainte.
 *   (2) DIALOGUL in romana pe 3s.md: celulele "Scop" la "tu", ca restul dialogului (decizia 35); in engleza neschimbat.
 *       O formulare la "tu" se aplica numai pe textul din catalog pentru care a fost scrisa (sursa fixata aici); un scop
 *       schimbat in catalog ajunge in dialog asa cum e declarat, nu sub parafraza celui vechi. Traducerile engleze ale
 *       celulelor sunt legate la fel de textul romanesc pentru care au fost scrise.
 *   (3) PALETA: rezultatele sunt ale editiei din care s-a deschis; martorul arata ca filtrul e cel care le separa.
 *
 * Mediul: profilul aplicatiei 3s.md (`config/profil-3s-md.json`) si o analitica proprie sintetica, incarcate pe module
 * proaspete. Fixturile se asambleaza la rulare.
 */

const RADACINA = join(__dirname, '..')
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as Record<string, unknown>
const textProfil = (k: string) => (typeof PROFIL[k] === 'string' ? (PROFIL[k] as string) : JSON.stringify(PROFIL[k]))
const ID_SITE = ['6a1b2c3d', '4e5f', '4a6b', '8c7d', '9e0f1a2b3c4d'].join('-')
const INSTANTA = 'https://' + ['statistica', 'proba-134', 'test'].join('.')

/** Formele registrului formal, asamblate la rulare: auxiliarul, pronumele si pronumele de politete. */
const AT = 'a' + 'ți'
const VA = 'v' + 'ă'
const POLITETE = 'dumnea' + 'voastră'

/**
 * Registrul formal, cu granite pe LITERE Unicode (ca tests/limba.test.ts), nu `\b`. In JS `\b` e ASCII: dupa un
 * pronume terminat in litera romaneasca nu exista granita, deci forma urmata de spatiu scapa, iar inauntrul unui
 * cuvant obisnuit care incepe la fel granita apare (masurat pe regexul vechi: 2 ratari si o potrivire falsa).
 */
const FORMAL = new RegExp('(^|[^\\p{L}])(' + ['dumnea' + 'voastr\\p{L}*', AT, VA, 'v' + 'i'].join('|') + ')(?=$|[^\\p{L}])', 'iu')

/**
 * Textele din catalog pentru care s-au scris formularile la "tu" (`SCOP_LA_TU` din texte.ts), fixate aici. Proba le
 * compara cu catalogul de azi: un scop schimbat face proba rosie pana se rescrie formularea, cu amprenta ei.
 */
const SURSE_LA_TU: Readonly<Record<string, string>> = {
  '3s-consimtamant': 'Ține minte ce ' + AT + ' ales în bannerul de cookie-uri, ca să nu ' + VA + ' întrebăm la fiecare pagină.',
  'umami.disabled': 'Dacă l-' + AT + ' pus ' + POLITETE + ' în browser, măsurarea ' + VA + ' exclude.',
}

/** Un scop nou al cheii alegerii, scris la registrul catalogului, pentru martorii pe copii. */
const SCOP_NOU = 'Ține minte ce ' + AT + ' ales și ' + VA + ' identifică la revenire, pentru 6 luni.'

async function incarca(cuUmami = true) {
  for (const k of ['SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'CANALE_JSON']) vi.stubEnv(k, textProfil(k))
  vi.stubEnv('SITE_ASEZARE', '')
  for (const k of ['NEXT_PUBLIC_SITE_EDITII', 'NEXT_PUBLIC_SITE_ASEZARE', 'NEXT_PUBLIC_OPERATOR_NUMIT', 'NEXT_PUBLIC_FAMILIE_JURIDICA', 'NEXT_PUBLIC_GA4_ID'])
    vi.stubEnv(k, '')
  vi.stubEnv('UMAMI_URL', cuUmami ? INSTANTA : '')
  vi.stubEnv('UMAMI_WEBSITE_ID', cuUmami ? ID_SITE : '')
  vi.resetModules()
  return {
    versiune: await import('../src/components/consimtamant/versiune'),
    stocare: await import('../src/components/consimtamant/stocare'),
    texte: await import('../src/components/consimtamant/texte'),
    furnizori: await import('../src/content/juridic/furnizori'),
    analitica: await import('../src/lib/analitica'),
    Punct: (await import('../src/components/consimtamant/PunctConsimtamant')).default as (p: {
      limba?: 'ro' | 'en'
      editii?: readonly string[]
    }) => ReactElement<Record<string, unknown>> | null,
    rute: await import('../src/content/rute'),
    cai: await import('../src/content/cai'),
    PaletaCautare: await import('../src/components/global/PaletaCautare'),
    navigatieEn: (await import('../src/content/navigatie-en')).navigatieEn,
    navigatieRoMd: (await import('../src/content/navigatie-ro-md')).navigatieRoMd,
  }
}

/** Modulul catalogului, cum il cer componentele; o proba il poate inlocui cu o COPIE schimbata (vi.doMock). */
const CALE_CATALOG = '../src/content/juridic/furnizori'

afterEach(() => {
  vi.doUnmock(CALE_CATALOG)
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

/** O stocare locala falsa, in memorie, pe `window`. */
function stocareFalsa(): Map<string, string> {
  const m = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
      setItem: (k: string, v: string) => void m.set(k, v),
    },
  })
  return m
}

describe('(1) consimtamantul: alegerea tine in ambele limbi cat timp catalogul e acelasi', () => {
  it('PunctConsimtamant pe 3s.md: acelasi catalog pe / si pe /ro, versiuni de text diferite, fiecare cu limba ei', async () => {
    const M = await incarca()
    const en = M.Punct({ limba: 'en', editii: ['en', 'ro-MD'] })
    const ro = M.Punct({ limba: 'ro', editii: ['en', 'ro-MD'] })
    expect(en, 'controlul: analitica pornita in mediul probei').not.toBeNull()
    const pe = (e: typeof en) => e?.props as { versiune: string; catalog?: string }
    expect(pe(en).catalog).toMatch(/^c-[0-9a-f]{8}$/)
    expect(pe(en).catalog).toBe(pe(ro).catalog)
    expect(pe(en).versiune).toMatch(/^en-[0-9a-f]{8}$/)
    expect(pe(ro).versiune).toMatch(/^ro-[0-9a-f]{8}$/)
  })

  it('pe site-ul romanesc (o singura limba): fara catalog, versiunea informarii de dinainte, informarea neschimbata', async () => {
    const M = await incarca()
    const ro = M.Punct({ limba: 'ro', editii: ['ro-RO'] })
    const p = ro?.props as { versiune: string; catalog?: string; informare: unknown }
    expect('catalog' in (p as object)).toBe(false)
    const unelte = { ga4: false, umami: true }
    expect(p.versiune).toBe(M.analitica.versiuneInformare('ro', unelte))
    expect(p.informare).toEqual(M.texte.informareConsimtamant('ro', unelte))
  })

  it('martor POZITIV pe o COPIE a catalogului: un furnizor schimbat (tara) da alta versiune; un text de rol schimbat, nu', async () => {
    const M = await incarca()
    const unelte = { ga4: true, umami: true }
    const baza = M.versiune.versiuneCatalog(unelte)
    const copie = structuredClone(M.furnizori.FURNIZORI)
    const gazduire = copie.find((f) => f.cheie === 'gazduire-platforma')
    if (gazduire === undefined) throw new Error('controlul fixturii: lipseste furnizorul de gazduire')
    gazduire.tara = gazduire.tara + ' (alta regiune)'
    expect(M.versiune.versiuneCatalog(unelte, copie)).not.toBe(baza)
    // Proza (rolul, temeiul) nu e furnizor si nici scop: aceeasi versiune.
    const proza = structuredClone(M.furnizori.FURNIZORI)
    proza[0].rol = proza[0].rol + ' Reformulat.'
    expect(M.versiune.versiuneCatalog(unelte, proza)).toBe(baza)
    // Copia neatinsa da exact versiunea reala (controlul ca parametrul chiar e folosit).
    expect(M.versiune.versiuneCatalog(unelte, structuredClone(M.furnizori.FURNIZORI))).toBe(baza)
  })

  it('martor POZITIV pe o COPIE a catalogului: SCOPUL unui cookie schimbat da alta versiune (consimtamantul e legat de scop)', async () => {
    const M = await incarca()
    const unelte = { ga4: true, umami: true }
    const baza = M.versiune.versiuneCatalog(unelte)
    const copie = structuredClone(M.furnizori.FURNIZORI)
    const cookie = copie.flatMap((f) => f.cookieuri).find((c) => c.scop.length > 0)
    if (cookie === undefined) throw new Error('controlul fixturii: niciun cookie cu scop in catalog')
    const scopVechi = cookie.scop
    // Scopul nou se asambleaza la rulare: acelasi cookie, alt scop declarat.
    cookie.scop = ['Trimite', 'profilul', 'vizitatorului', 'catre', 'retele', 'de', 'publicitate.'].join(' ')
    expect(cookie.scop).not.toBe(scopVechi)
    expect(M.versiune.versiuneCatalog(unelte, copie)).not.toBe(baza)
    // Scopul cheii de statistica (panoul romanesc, sursa catalogului pentru chei) intra si el.
    const servicii = structuredClone(M.furnizori.SERVICII_STATISTICA_PANOU)
    const rand = servicii.umami.ro.randuri[0]
    if (rand === undefined) throw new Error('controlul fixturii: Umami fara chei')
    rand.scop = rand.scop + ' Si altceva.'
    expect(M.versiune.versiuneCatalog(unelte, M.furnizori.FURNIZORI, servicii)).not.toBe(baza)
    // Traducerea engleza a cheii nu e catalog: aceeasi versiune (alegerea tine EN <-> RO).
    const traducere = structuredClone(M.furnizori.SERVICII_STATISTICA_PANOU)
    const randEn = traducere.umami.en.randuri[0]
    if (randEn === undefined) throw new Error('controlul fixturii: Umami fara chei in engleza')
    randEn.scop = randEn.scop + ' Reworded.'
    expect(M.versiune.versiuneCatalog(unelte, M.furnizori.FURNIZORI, traducere)).toBe(baza)
  })

  it('martor POZITIV pe COPII ale cheii alegerii: numele, felul, durata si SCOPUL ei intra in versiune; copia neatinsa, nu', async () => {
    const M = await incarca()
    const unelte = { ga4: false, umami: true }
    const { FURNIZORI, SERVICII_STATISTICA_PANOU, COOKIE_ALEGERE } = M.furnizori
    const baza = M.versiune.versiuneCatalog(unelte)
    const cu = (alegere: typeof COOKIE_ALEGERE) => M.versiune.versiuneCatalog(unelte, FURNIZORI, SERVICII_STATISTICA_PANOU, alegere)
    // Controlul: copia neatinsa trece prin parametru si da exact versiunea reala.
    expect(cu(structuredClone(COOKIE_ALEGERE))).toBe(baza)
    // Fiecare copie e derivata din valoarea de azi, deci difera de ea oricare ar fi catalogul.
    const copii: Record<string, typeof COOKIE_ALEGERE> = {
      nume: { ...COOKIE_ALEGERE, nume: COOKIE_ALEGERE.nume + '-2' },
      fel: { ...COOKIE_ALEGERE, fel: COOKIE_ALEGERE.fel === 'cookie' ? 'stocare locală' : 'cookie' },
      durata: { ...COOKIE_ALEGERE, durata: COOKIE_ALEGERE.durata + ' și încă o lună' },
      scop: { ...COOKIE_ALEGERE, scop: COOKIE_ALEGERE.scop + ' ' + SCOP_NOU },
    }
    for (const [camp, copie] of Object.entries(copii)) {
      expect(copie, camp).not.toEqual(COOKIE_ALEGERE)
      expect(cu(copie), 'cheia alegerii cu alt camp ' + camp).not.toBe(baza)
    }
  })

  it('martor POZITIV: alt serviciu de statistica activ (GA4 langa Umami) da alt catalog', async () => {
    const M = await incarca()
    expect(M.versiune.versiuneCatalog({ ga4: false, umami: true })).not.toBe(M.versiune.versiuneCatalog({ ga4: true, umami: true }))
  })

  it('citesteAlegere: alegerea facuta in engleza tine in romana (acelasi catalog) si cade pe alt catalog', async () => {
    const M = await incarca()
    const m = stocareFalsa()
    const { CHEIE_ALEGERE, citesteAlegere } = M.stocare
    const catalog = M.versiune.versiuneCatalog({ ga4: false, umami: true })
    const facuta = { versiune: 'en-1a2b3c4d', id: 'a1b2c3d4-0000-4000-8000-000000000134', moment: new Date().toISOString(), statistica: false, metoda: 'refuz-tot', catalog }
    m.set(CHEIE_ALEGERE, JSON.stringify(facuta))
    expect(citesteAlegere('ro-5e6f7a8b', Date.now(), catalog)).toEqual(facuta)
    expect(citesteAlegere('ro-5e6f7a8b', Date.now(), 'c-00000000')).toBeNull()
    // Fara catalog (site-ul romanesc), regula veche: versiunea textului decide.
    expect(citesteAlegere('ro-5e6f7a8b')).toBeNull()
    expect(citesteAlegere('en-1a2b3c4d')).toEqual(facuta)
    // O alegere veche, fara catalog, nu tine pe domeniul cu catalog: se intreaba o data.
    const { catalog: _c, ...veche } = facuta
    void _c
    m.set(CHEIE_ALEGERE, JSON.stringify(veche))
    expect(citesteAlegere('en-1a2b3c4d', Date.now(), catalog)).toBeNull()
  })
})

describe('(2) dialogul in romana pe 3s.md: celulele la "tu"', () => {
  it('pe 3s.md, in romana, nicio celula a panoului la registrul formal; martorul: informarea de baza il are', async () => {
    const M = await incarca()
    const baza = M.texte.informareConsimtamant('ro', { ga4: false, umami: true })
    const celule = (i: typeof baza) => [i.alegere, ...i.statistica.flatMap((f) => f.randuri)].map((r) => r.scop)
    expect(celule(baza).some((c) => FORMAL.test(c)), 'martor: catalogul chiar are celule la registrul formal').toBe(true)
    const ro = (M.Punct({ limba: 'ro', editii: ['en', 'ro-MD'] })?.props as { informare: typeof baza }).informare
    expect(celule(ro).filter((c) => FORMAL.test(c))).toEqual([])
    expect(celule(ro)).toHaveLength(celule(baza).length)
  })

  it('in engleza informarea e neschimbata; cheile fara adresare raman cele din catalog', async () => {
    const M = await incarca()
    const en = M.texte.informareConsimtamant('en', { ga4: true, umami: true })
    expect(M.texte.informareLaTu(en)).toBe(en)
    const ro = M.texte.informareLaTu(M.texte.informareConsimtamant('ro', { ga4: true, umami: true }))
    const ga4 = ro.statistica.find((f) => f.unealta === 'ga4')
    expect(ga4?.randuri.map((r) => r.scop)).toEqual(M.furnizori.SERVICII_STATISTICA_PANOU.ga4.ro.randuri.map((r) => r.scop))
  })

  it('martori pentru regexul registrului: prinde forma urmata de spatiu, la inceput, dupa cratima; lasa cuvintele obisnuite', () => {
    expect(FORMAL.test('Măsurarea ' + VA + ' exclude.')).toBe(true)
    expect(FORMAL.test(VA[0].toUpperCase() + VA.slice(1) + ' identifică la revenire.')).toBe(true)
    expect(FORMAL.test('Dacă l-' + AT + ' pus.')).toBe(true)
    expect(FORMAL.test('Arhiva ' + POLITETE + '.')).toBe(true)
    expect(FORMAL.test('Am ' + VA + 'zut pagina; furnizori acredit' + AT + '; dacă l-ai pus tu, măsurarea te exclude.')).toBe(false)
  })

  it('fiecare formulare la "tu" e legata de textul EXACT din catalogul de azi (sursa fixata in proba) si chiar se aplica', async () => {
    const M = await incarca()
    const { ALEGERE_PANOU, SERVICII_STATISTICA_PANOU } = M.furnizori
    const catalog = [ALEGERE_PANOU.ro, ...SERVICII_STATISTICA_PANOU.umami.ro.randuri, ...SERVICII_STATISTICA_PANOU.ga4.ro.randuri]
    // Nicio pereche fara sursa fixata aici, nicio sursa fixata fara pereche.
    expect(M.texte.SCOP_LA_TU.map((p) => p.nume).sort()).toEqual(Object.keys(SURSE_LA_TU).sort())
    for (const p of M.texte.SCOP_LA_TU) {
      const randuri = catalog.filter((r) => r.nume === p.nume)
      expect(randuri, 'cheia ' + p.nume + ' in catalogul romanesc').toHaveLength(1)
      const r = randuri[0]
      expect(r.scop, 'scopul cheii ' + p.nume + ' s-a schimbat in catalog: rescrie formularea la "tu", amprenta ei si sursa de aici').toBe(
        SURSE_LA_TU[p.nume],
      )
      expect(p.amprentaSursa, 'amprenta perechii ' + p.nume).toBe(M.texte.amprentaScop(SURSE_LA_TU[p.nume]))
      expect(M.texte.formulareLaTu(r), 'perechea ' + p.nume + ' se aplica pe celula ei').toBe(p)
      expect(FORMAL.test(p.laTu), 'formularea ' + p.nume + ' e la "tu"').toBe(false)
    }
    // In dialogul randat pe /ro, fiecare formulare apare exact o data.
    const ro = (M.Punct({ limba: 'ro', editii: ['en', 'ro-MD'] })?.props as { informare: ReturnType<typeof M.texte.informareConsimtamant> })
      .informare
    const randate = [ro.alegere, ...ro.statistica.flatMap((f) => f.randuri)].map((r) => r.scop)
    for (const p of M.texte.SCOP_LA_TU) expect(randate.filter((s) => s === p.laTu), p.nume).toHaveLength(1)
  })

  it('un scop schimbat (pe o COPIE a informarii) nu primeste formularea veche: dialogul arata scopul declarat, iar registrul il prinde', async () => {
    const M = await incarca()
    // Informarea de pornire poarta exact sursele fixate aici, deci mecanismul se masoara oricare ar fi catalogul de azi.
    const sursa = M.texte.informareConsimtamant('ro', { ga4: false, umami: true })
    const pAlegere = M.texte.SCOP_LA_TU.find((p) => p.nume === sursa.alegere.nume)
    const pUmami = M.texte.SCOP_LA_TU.find((p) => p.nume === 'umami.disabled')
    if (pAlegere === undefined || pUmami === undefined) throw new Error('controlul fixturii: lipseste o formulare la "tu"')
    const baza = structuredClone(sursa)
    const randUmami = baza.statistica[0]?.randuri[0]
    if (randUmami === undefined || baza.statistica[0]?.unealta !== 'umami') throw new Error('controlul fixturii: Umami fara chei')
    baza.alegere.scop = SURSE_LA_TU[pAlegere.nume]
    randUmami.scop = SURSE_LA_TU[pUmami.nume]
    // Controlul: pe sursele exacte se aplica ambele formulari.
    const neatinsa = M.texte.informareLaTu(structuredClone(baza))
    expect([neatinsa.alegere.scop, neatinsa.statistica[0]?.randuri[0]?.scop]).toEqual([pAlegere.laTu, pUmami.laTu])
    // Scopuri noi, la registrul catalogului: raman cum sunt declarate.
    const umamiNou = SURSE_LA_TU[pUmami.nume].replace(/\.$/, ' și ' + VA + ' numără separat.')
    expect([SCOP_NOU, umamiNou]).not.toContain(SURSE_LA_TU[pAlegere.nume])
    expect(umamiNou).not.toBe(SURSE_LA_TU[pUmami.nume])
    const copie = structuredClone(baza)
    copie.alegere.scop = SCOP_NOU
    const rand = copie.statistica[0]?.randuri[0]
    if (rand === undefined) throw new Error('controlul fixturii: Umami fara chei')
    rand.scop = umamiNou
    const dupa = M.texte.informareLaTu(copie)
    expect(dupa.alegere.scop).toBe(SCOP_NOU)
    expect(dupa.statistica[0]?.randuri[0]?.scop).toBe(umamiNou)
    expect(FORMAL.test(dupa.alegere.scop) && FORMAL.test(umamiNou), 'proba de registru (primul caz din (2)) ar fi rosie').toBe(true)
    // Acelasi text-sursa pe alta cheie nu primeste formularea: perechea cere si numele.
    const altaCheie = structuredClone(baza)
    altaCheie.alegere.nume = 'alta-cheie'
    expect(M.texte.informareLaTu(altaCheie).alegere.scop).toBe(SURSE_LA_TU[pAlegere.nume])
  })

  it('pe o COPIE a modulului catalogului, scopul alegerii schimbat: alta versiune de catalog in ambele limbi si, pe /ro, scopul declarat', async () => {
    const editii = ['en', 'ro-MD'] as const
    type Props = { catalog: string; versiune: string; informare: { alegere: { scop: string } } }
    const inainte = await incarca()
    const ro0 = inainte.Punct({ limba: 'ro', editii })?.props as Props
    // Scopul nou e derivat din cel de azi, deci difera de el oricare ar fi catalogul.
    const nou = inainte.furnizori.COOKIE_ALEGERE.scop + ' ' + SCOP_NOU
    vi.doMock(CALE_CATALOG, async (importOriginal) => {
      const o = await importOriginal<typeof import('../src/content/juridic/furnizori')>()
      const COOKIE_ALEGERE = { ...o.COOKIE_ALEGERE, scop: nou }
      return { ...o, COOKIE_ALEGERE, ALEGERE_PANOU: { ...o.ALEGERE_PANOU, ro: { ...o.ALEGERE_PANOU.ro, scop: nou } } }
    })
    const M = await incarca()
    expect(M.furnizori.COOKIE_ALEGERE.scop, 'controlul: copia modulului e cea incarcata').toBe(nou)
    const ro1 = M.Punct({ limba: 'ro', editii })?.props as Props
    const en1 = M.Punct({ limba: 'en', editii })?.props as Props
    expect(ro1.catalog, 'bannerul intreaba din nou').not.toBe(ro0.catalog)
    expect(en1.catalog, 'aceeasi versiune de catalog in engleza').toBe(ro1.catalog)
    expect(ro1.informare.alegere.scop, 'dialogul /ro arata scopul declarat').toBe(nou)
    expect(M.texte.SCOP_LA_TU.map((p) => p.laTu)).not.toContain(ro1.informare.alegere.scop)
  })

  it('traducerile engleze ale celulelor sunt legate de textul romanesc (durata si scop) pentru care au fost scrise', async () => {
    const M = await incarca()
    const { ALEGERE_PANOU, SERVICII_STATISTICA_PANOU } = M.furnizori
    // Amprenta [durata, scop] a textului romanesc pe care l-a tradus fiecare celula engleza, citita si comparata cu
    // traducerea la scrierea probei. Un text romanesc schimbat cere traducerea refacuta (furnizori.ts), apoi amprenta.
    const TRADUSE_PENTRU: Readonly<Record<string, string>> = {
      '3s-consimtamant': 'aa318e94',
      'umami.disabled': 'f650d770',
      _ga: '938199ef',
      '_ga_ urmat de codul măsurătorii': '7ea80f9e',
    }
    const perechi = [
      [ALEGERE_PANOU.ro, ALEGERE_PANOU.en],
      ...(['umami', 'ga4'] as const).flatMap((u) => {
        const ro = SERVICII_STATISTICA_PANOU[u].ro.randuri
        const en = SERVICII_STATISTICA_PANOU[u].en.randuri
        expect(en, u + ': aceleasi chei in ambele limbi').toHaveLength(ro.length)
        return ro.map((r, i) => [r, en[i]] as const)
      }),
    ]
    expect(perechi.map(([ro]) => ro.nume).sort()).toEqual(Object.keys(TRADUSE_PENTRU).sort())
    for (const [ro, en] of perechi) {
      expect(en, ro.nume + ': traducerea exista').toBeDefined()
      const amprenta = M.texte.amprentaScop(JSON.stringify([ro.durata, ro.scop]))
      expect(amprenta, ro.nume + ': textul romanesc s-a schimbat; refa traducerea engleza, apoi amprenta').toBe(TRADUSE_PENTRU[ro.nume])
    }
  })
})

describe('(3) paleta: rezultatele editiei din care s-a deschis', () => {
  const cauta = (M: Awaited<ReturnType<typeof incarca>>, paleta: Parameters<typeof M.PaletaCautare.continutPaletaContract>[0], q: string) =>
    M.PaletaCautare.continutPaletaContract(paleta, q, M.cai.CAI_EXISTENTE, M.rute.RUTE, [])
      .flatMap((g) => g.elemente)
      .map((e) => e.cale)

  it('pe EN, "contact" si "enterprise" nu dau nicio pagina /ro; pe /ro, "contact" da numai pagini /ro', async () => {
    const M = await incarca()
    const en = M.navigatieEn().paleta
    const ro = M.navigatieRoMd().paleta
    for (const q of ['contact', 'enterprise', 'legal']) {
      const cai = cauta(M, en, q)
      expect(cai.length, q).toBeGreaterThan(0)
      expect(cai.filter((c) => c === '/ro' || c.startsWith('/ro/')), q).toEqual([])
    }
    const peRo = cauta(M, ro, 'contact')
    expect(peRo.length).toBeGreaterThan(0)
    expect(peRo.every((c) => c === '/ro' || c.startsWith('/ro/')), peRo.join(' ')).toBe(true)
  })

  it('martor: fara editia contractului (contract care nu numeste nicio ruta), aceeasi cautare amesteca editiile', async () => {
    const M = await incarca()
    const en = M.navigatieEn().paleta
    const orb = { ...en, grupuri: en.grupuri.map((g) => ({ ...g, elemente: [] })) }
    expect(M.PaletaCautare.editiileContractului(orb, M.rute.RUTE)).toBeNull()
    const cai = cauta(M, orb, 'contact')
    expect(cai).toContain('/contact')
    expect(cai).toContain('/ro/contact')
    expect([...(M.PaletaCautare.editiileContractului(en, M.rute.RUTE) ?? [])]).toEqual(['en'])
  })
})
