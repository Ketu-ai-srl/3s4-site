import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ReactElement } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { valideazaEvidenta } from '../src/components/consimtamant/evidenta'
import {
  CAI_CONTACT,
  CAI_CONTACT_RO,
  CANALE_CONTACT,
  EVENIMENTE,
  caiContactServite,
  EVENIMENTE_UMAMI,
  evenimentDinLegatura,
  evenimentUmamiValid,
  limbaDin,
} from '../src/components/consimtamant/evenimente'
import { CAI_POLITICI, legaturiPolitici } from '../src/components/consimtamant/PunctConsimtamant'
import { caSursa, caleServitaEditiei } from '../src/lib/asezare'
import {
  MESAJ_EN_FARA_UMAMI,
  TEXTE_BANNER,
  TEXTE_PANOU,
  informareConsimtamant,
  texteConsimtamant,
  type LimbaBanner,
} from '../src/components/consimtamant/texte'
import { COOKIE_ALEGERE, FURNIZORI, SERVICII_STATISTICA_PANOU, furnizoriActivi, serviciiStatistica } from '../src/content/juridic/furnizori'
import { MESAJ_S_C, UMAMI_ASTEAPTA_ACORDUL, intrariMasurare, masurareDin, stareMasurare } from '../src/content/juridic/masurare'
import { REGISTRU_MD } from '../src/content/juridic/md/registru'
import { VERSIUNE_INFORMARE, amprenta, stareAnalitica, versiuneInformare } from '../src/lib/analitica'
import { citesteOperator, type Operator } from '../src/lib/operator'

/**
 * Masurarea S-B (felia 78; decizia 13 din 30.09.2026): analitica proprie (Umami) porneste numai dupa acordul din
 * banner si se opreste la retragere; bannerul exista cu GA4 SAU cu Umami, in romana sau in engleza dupa pagina.
 * Criteriul de gata al feliei, partea care se masoara fara browser:
 *   (2) fara operator: nici banner, nici unealta, oricare ar fi variabilele;
 *   (3) evidenta accepta o versiune `en-` (si numai limbile bannerului);
 *   (4) `stareMasurare()` = S-B cu Umami si operator; un MUTANT care nu asteapta acordul opreste construirea (S-C),
 *       chiar pe componenta montata in toate layout-urile radacina (`PunctConsimtamant`).
 * Plus: seturile de texte din politica de cookie-uri (documentul 03, sectiunea 6), refuzul combinatiei engleza +
 * GA4 fara Umami, panoul filtrat pe uneltele active, `FURNIZORI` neatins (forma (i)), versiunea S-GA4 romaneasca
 * neschimbata, incarcatorul (element <script> clasic, `data-before-send`, fara `umami.disabled` scris) si
 * evenimentele Umami (lista inchisa, fara `preventDefault`). Ce se intampla in browser (cereri `/a/` inainte de
 * accept, dupa accept, dupa retragere) masoara `tests/browser/umami-acord.spec.ts`.
 *
 * FIXTURILE se asambleaza la RULARE: operatorul 3s.md e cel din profilul aplicatiei (`config/profil-3s-md.json`),
 * instanta si identificatorul sunt sintetice; tiparele de tipografie se lipesc din coduri de caracter.
 */

vi.hoisted(() => {
  process.env.OPERATOR_JSON = ''
  process.env.UMAMI_URL = ''
  process.env.UMAMI_WEBSITE_ID = ''
  process.env.NEXT_PUBLIC_GA4_ID = ''
})

vi.setConfig({ testTimeout: 60_000 })

const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale), 'utf8')

const ID_SITE = ['5b1c2d3e', '4f5a', '4b6c', '8d7e', '9f0a1b2c3d4e'].join('-')
const INSTANTA = 'https://' + ['statistica', 'proba', 'test'].join('.')
const MEDIU_UMAMI = { UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID_SITE }
const ID_GA4 = ['G', 'SB' + String(7878)].join('-')
const LINII_LUNGI = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']')

const PROFIL = JSON.parse(citeste('config/profil-3s-md.json')) as Record<string, unknown>
const JSON_OPERATOR_3S_MD = JSON.stringify(PROFIL.OPERATOR_JSON)
const OPERATOR_3S_MD = citesteOperator(PROFIL.OPERATOR_JSON, 'OPERATOR_JSON') as Operator

const OPERATOR_RO: Operator = {
  denumire: ['Operator', 'Sintetic', 'Masurare', 'SRL'].join(' '),
  sediu: ['Strada Exemplului 1', 'Pitesti'].join(', '),
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}

const COMBINATII: { limba: LimbaBanner; ga4: boolean; umami: boolean }[] = [
  { limba: 'ro', ga4: true, umami: false },
  { limba: 'ro', ga4: false, umami: true },
  { limba: 'ro', ga4: true, umami: true },
  { limba: 'en', ga4: false, umami: true },
  { limba: 'en', ga4: true, umami: true },
]

async function randeaza(element: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(element)
  const bucati: Buffer[] = []
  for await (const b of prelude) bucati.push(Buffer.from(b as Uint8Array))
  return Buffer.concat(bucati).toString('utf8')
}

/** PunctConsimtamant cu modulele incarcate din nou, pe mediul dat. */
async function punct(mediu: Record<string, string>, limba?: LimbaBanner): Promise<string> {
  for (const [k, v] of Object.entries(mediu)) vi.stubEnv(k, v)
  vi.resetModules()
  const Punct = (await import('../src/components/consimtamant/PunctConsimtamant')).default as (p: { limba?: LimbaBanner }) => ReactElement | null
  return randeaza(createElement(Punct, limba === undefined ? {} : { limba }))
}

function mesaj(f: () => unknown): string {
  try {
    f()
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
  return '(nu a aruncat)'
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.doUnmock('../src/content/juridic/masurare')
  vi.resetModules()
})

// ---------------------------------------------------------------------------------------------
// Starea: bannerul exista cu GA4 SAU cu Umami, numai cu operator
// ---------------------------------------------------------------------------------------------

describe('starea analiticii: GA4 sau Umami, numai cu operator numit si complet', () => {
  it('controlul fixturii: operatorul din profilul 3s.md e complet', () => {
    expect(OPERATOR_3S_MD.denumire).toContain('Demerzel')
    expect(stareAnalitica(OPERATOR_3S_MD, null, MEDIU_UMAMI).activa).toBe(true)
  })

  it('numai Umami: bannerul exista, fara GA4; numai GA4: fara Umami; amandoua: amandoua', () => {
    expect(stareAnalitica(OPERATOR_3S_MD, null, MEDIU_UMAMI)).toEqual({ activa: true, idGa4: null, umami: { idSite: ID_SITE } })
    expect(stareAnalitica(OPERATOR_RO, ID_GA4, {})).toEqual({ activa: true, idGa4: ID_GA4, umami: null })
    expect(stareAnalitica(OPERATOR_RO, ID_GA4, MEDIU_UMAMI)).toEqual({ activa: true, idGa4: ID_GA4, umami: { idSite: ID_SITE } })
  })

  it('(2) fara operator, sau cu operator incomplet, nimic: nici cu GA4, nici cu Umami, nici cu amandoua', () => {
    for (const [id, mediu] of [[ID_GA4, {}], [null, MEDIU_UMAMI], [ID_GA4, MEDIU_UMAMI]] as const) {
      expect(stareAnalitica(null, id, mediu)).toEqual({ activa: false, motiv: 'fara-operator' })
      expect(stareAnalitica({ ...OPERATOR_RO, email: '' }, id, mediu)).toEqual({ activa: false, motiv: 'operator-incomplet' })
    }
    // Controlul: operator complet si nicio unealta = tot oprit, cu motivul lui
    expect(stareAnalitica(OPERATOR_RO, null, {})).toEqual({ activa: false, motiv: 'fara-id' })
  })

  it('(2) pe configurarea reala a depozitului (operator null), PunctConsimtamant nu randeaza nimic, cu orice unealta', async () => {
    const real = JSON.parse(citeste('config/operator.json')) as { operator: unknown }
    // Controlul premisei: depozitul are azi operatorul null (proba isi muta asteptarea daca fisierul se schimba)
    expect(real.operator).toBeNull()
    expect(await punct({ ...MEDIU_UMAMI, NEXT_PUBLIC_GA4_ID: ID_GA4 })).toBe('')
    expect(await punct({ ...MEDIU_UMAMI }, 'en')).toBe('')
  })
})

// ---------------------------------------------------------------------------------------------
// (4) Starea masurarii: S-B, iar S-C opreste construirea
// ---------------------------------------------------------------------------------------------

describe('(4) starea masurarii: S-B cu Umami; mutantul fara asteptarea acordului opreste construirea', () => {
  it('constanta declara ce face bannerul: Umami asteapta acordul', () => {
    expect(UMAMI_ASTEAPTA_ACORDUL).toBe(true)
  })

  it('pe copia cu Umami si operatorul 3s.md: stareMasurare() = S-B; cu GA4 in plus, tot S-B; fara Umami, S0', () => {
    expect(stareMasurare(OPERATOR_3S_MD, MEDIU_UMAMI)).toBe('S-B')
    expect(stareMasurare(OPERATOR_3S_MD, { ...MEDIU_UMAMI, NEXT_PUBLIC_GA4_ID: ID_GA4 })).toBe('S-B')
    expect(intrariMasurare(OPERATOR_3S_MD, { ...MEDIU_UMAMI, NEXT_PUBLIC_GA4_ID: ID_GA4 }).ga4).toBe(true)
    expect(stareMasurare(OPERATOR_3S_MD, {})).toBe('S0')
    // GA4 se citeste din starea bannerului, nu din `.activa`: numai Umami nu inseamna GA4
    expect(intrariMasurare(OPERATOR_3S_MD, MEDIU_UMAMI).ga4).toBe(false)
  })

  it('mutantul (asteptarea acordului scoasa) da S-C, iar S-C arunca', () => {
    expect(mesaj(() => masurareDin({ ...intrariMasurare(OPERATOR_3S_MD, MEDIU_UMAMI), umamiAsteaptaAcordul: false }))).toBe(MESAJ_S_C)
  })

  it('martor POZITIV: cu mutantul, componenta montata in layout-uri opreste randarea (deci construirea), pe ambele limbi', async () => {
    vi.doMock('../src/content/juridic/masurare', async (original) => {
      const real = await original<typeof import('../src/content/juridic/masurare')>()
      return {
        ...real,
        UMAMI_ASTEAPTA_ACORDUL: false,
        stareMasurare: (operator?: Operator | null, mediu?: Record<string, string | undefined>) =>
          real.masurareDin({ ...real.intrariMasurare(operator, mediu), umamiAsteaptaAcordul: false }).stare,
      }
    })
    const mediu = { OPERATOR_JSON: JSON_OPERATOR_3S_MD, ...MEDIU_UMAMI }
    await expect(punct(mediu, 'en')).rejects.toThrow(MESAJ_S_C)
    await expect(punct(mediu, 'ro')).rejects.toThrow(MESAJ_S_C)
  })

  it('martor NEGATIV: fara mutant, aceeasi componenta, pe acelasi mediu, randeaza bannerul', async () => {
    const html = await punct({ OPERATOR_JSON: JSON_OPERATOR_3S_MD, ...MEDIU_UMAMI }, 'en')
    expect(html).toContain('data-consimtamant')
  })
})

// ---------------------------------------------------------------------------------------------
// Textele, din documentul 03 §6, si refuzul combinatiei fara set
// ---------------------------------------------------------------------------------------------

describe('textele bannerului si ale panoului (documentul 03, sectiunea 6)', () => {
  it('romana cu GA4 singur e setul de pana acum, neschimbat', () => {
    expect(texteConsimtamant('ro', { ga4: true, umami: false })).toEqual({ banner: TEXTE_BANNER, panou: TEXTE_PANOU })
  })

  it('titlul, descrierea si categoria "Statistica" sunt cele din sectiunea 6, pe fiecare set', () => {
    const t = (limba: LimbaBanner, ga4: boolean) => texteConsimtamant(limba, { ga4, umami: true })
    expect(t('ro', false).banner.titlu).toBe('Măsurarea vizitelor')
    // A doua propozitie numeste acordul (corectura de limba din 09.10: pronumele singur trimitea la un complement din
    // propozitia dinainte); sensul si informarea despre retragere raman aceleasi.
    expect(t('ro', false).banner.descriere).toBe(
      'Cu acordul tău, măsurăm vizitele cu o aplicație proprie de statistică, fără cookie-uri. Acordul îl poți retrage oricând, din subsolul oricărei pagini.',
    )
    expect(t('ro', false).panou.statisticaText).toBe(
      'Aplicația noastră de statistică măsoară vizitele și paginile citite, fără cookie-uri. Se încarcă numai dacă permiți.',
    )
    // Fara GA4 nicio categorie nu pune cookie-uri, deci introducerea panoului nu cere sa alegi "cookie-uri"
    // (corectura de limba din 09.10). Setul romanesc cu GA4 pastreaza textul de baza: acolo GA4 pune cookie-uri.
    expect(t('ro', false).panou.optiuniText).toBe(
      'Alege ce permiți pe acest site. Alegerea se poate schimba oricând, din subsolul oricărei pagini.',
    )
    expect(t('ro', false).panou.optiuniText).not.toMatch(/cookie/i)
    expect(t('ro', true).panou.optiuniText).toBe(TEXTE_PANOU.optiuniText)
    expect(t('ro', true).panou.optiuniText).toContain('cookie-uri')
    expect(t('ro', true).banner.titlu).toBe('Statistică')
    expect(t('ro', true).banner.descriere).toContain('și cu Google Analytics, care pune cookie-uri')
    expect(t('ro', true).panou.statisticaText).toContain('Google Analytics 4 pune cookie-uri, iar datele pot ajunge în Statele Unite.')
    expect(t('en', false).banner.titlu).toBe('Measuring visits')
    expect(t('en', false).banner.descriere).toBe(
      'With your consent, we measure visits with our own analytics tool, which uses no cookies. You can withdraw consent at any time from the footer of any page.',
    )
    expect(t('en', false).panou.statisticaText).toBe('Our own analytics tool measures visits and the pages read, without cookies. It loads only if you allow it.')
    // Acelasi motiv pe engleza; legaturile poarta numele documentelor, ca in subsol si in titluri.
    expect(t('en', false).panou.optiuniText).toBe('Choose what you allow on this site. You can change your mind later, from the footer of any page.')
    expect(t('en', false).panou.optiuniText).not.toMatch(/cookie/i)
    expect([t('en', false).panou.informatiiLegatura, t('en', false).panou.informatiiLegatura2]).toEqual(['Cookie policy', 'Privacy policy'])
    expect(t('en', true).banner.titlu).toBe('Statistics')
    expect(t('en', true).panou.statisticaText).toContain('Google Analytics 4 sets cookies, and data may reach the United States.')
  })

  it('introducerea panoului cere sa alegi cookie-uri NUMAI cand GA4 ruleaza, pe ambele limbi; acordul numit pe fiecare set romanesc', () => {
    // GA4 pune cookie-uri, deci cu GA4 introducerea le numeste; fara GA4 nicio categorie nu pune cookie-uri, deci nu
    // le numeste. Ambele directii, pe toate combinatiile cu set (si engleza cu GA4, neservita azi: decizia 26).
    const cuSet = COMBINATII.filter(({ limba, ga4, umami }) => !(limba === 'en' && ga4 && !umami))
    // Controlul multimii: ambele directii au cazuri pe ambele limbi, altfel bucla de mai jos ar trece goala.
    for (const limba of ['ro', 'en'] as const) {
      expect(cuSet.filter((c) => c.limba === limba && c.ga4).length, limba + ' cu GA4').toBeGreaterThan(0)
      expect(cuSet.filter((c) => c.limba === limba && !c.ga4).length, limba + ' fara GA4').toBeGreaterThan(0)
    }
    for (const { limba, ga4, umami } of cuSet) {
      const optiuni = texteConsimtamant(limba, { ga4, umami }).panou.optiuniText
      const eticheta = limba + (ga4 ? ' cu GA4' : ' fara GA4') + (umami ? ' cu Umami' : '')
      if (ga4) expect(optiuni, eticheta).toMatch(/cookie/i)
      else expect(optiuni, eticheta).not.toMatch(/cookie/i)
    }
    expect(texteConsimtamant('en', { ga4: true, umami: true }).panou.optiuniText).toBe(
      'Choose which cookies you allow on this site. You can change your mind later, from the footer of any page.',
    )
    // A doua propozitie a descrierii numeste acordul pe fiecare set romanesc (forma aleasa pe 09.10), nu un pronume
    // care trimite la un complement din propozitia dinainte.
    for (const { limba, ga4, umami } of cuSet.filter((c) => c.limba === 'ro')) {
      const descriere = texteConsimtamant(limba, { ga4, umami }).banner.descriere
      expect(descriere, 'ro ga4=' + ga4 + ' umami=' + umami).toContain('. Acordul îl poți retrage oricând, din subsolul oricărei pagini.')
      expect(descriere).not.toMatch(/\. Îl poți retrage/)
    }
  })

  it('etichetele butoanelor raman: aceleasi in toate seturile unei limbi', () => {
    for (const { limba, ga4, umami } of COMBINATII) {
      const b = texteConsimtamant(limba, { ga4, umami }).banner
      const asteptat = limba === 'ro' ? ['Accept tot', 'Refuz tot', 'Setări cookie-uri'] : ['Accept all', 'Reject all', 'Cookie settings']
      expect([b.accept, b.refuz, b.setari], limba).toEqual(asteptat)
    }
  })

  it('martor POZITIV: engleza cu GA4 si fara Umami se refuza, cu un mesaj care o numeste; fara nicio unealta, la fel', () => {
    expect(mesaj(() => texteConsimtamant('en', { ga4: true, umami: false }))).toBe(MESAJ_EN_FARA_UMAMI)
    expect(MESAJ_EN_FARA_UMAMI).toContain('engleza + GA4 fara Umami')
    expect(mesaj(() => texteConsimtamant('ro', { ga4: false, umami: false }))).toContain('nicio unealta')
  })

  it('martor POZITIV: pe engleza cu GA4 si fara Umami, componenta montata in layout opreste construirea', async () => {
    await expect(punct({ OPERATOR_JSON: JSON_OPERATOR_3S_MD, NEXT_PUBLIC_GA4_ID: ID_GA4 }, 'en')).rejects.toThrow(MESAJ_EN_FARA_UMAMI)
  })

  it('tipografie: niciun text nu poarta linie lunga sau medie; engleza fara diacritice romanesti', () => {
    // Controlul tiparului: prinde o linie lunga lipita la rulare
    expect('a' + String.fromCharCode(0x2014) + 'b').toMatch(LINII_LUNGI)
    for (const { limba, ga4, umami } of COMBINATII) {
      const tot = JSON.stringify(informareConsimtamant(limba, { ga4, umami }))
      expect(tot).not.toMatch(LINII_LUNGI)
      if (limba === 'en') expect(tot).not.toMatch(/[ăâîșțĂÂÎȘȚ]/)
    }
  })
})

// ---------------------------------------------------------------------------------------------
// Panoul: serviciile active; FURNIZORI neatins (forma (i))
// ---------------------------------------------------------------------------------------------

describe('panoul: serviciile categoriei "statistica" urmeaza uneltele active', () => {
  it('numai Umami: Umami, cu umami.disabled declarat numai citit; numai GA4: GA4; amandoua: Umami, apoi GA4', () => {
    const nume = (ga4: boolean, umami: boolean) => serviciiStatistica({ ga4, umami }, 'ro').map((s) => s.unealta)
    expect(nume(false, true)).toEqual(['umami'])
    expect(nume(true, false)).toEqual(['ga4'])
    expect(nume(true, true)).toEqual(['umami', 'ga4'])
    expect(nume(false, false)).toEqual([])
    for (const limba of ['ro', 'en'] as const) {
      expect(SERVICII_STATISTICA_PANOU.umami[limba].randuri).toEqual([expect.objectContaining({ nume: 'umami.disabled', numaiCitit: true })])
    }
  })

  it('GA4 in romana vine din FURNIZORI (panoul si politica nu pot diverge)', () => {
    const ga4 = FURNIZORI.find((f) => f.cheie === 'analitica')!
    expect(SERVICII_STATISTICA_PANOU.ga4.ro.serviciu).toBe(ga4.serviciu)
    expect(SERVICII_STATISTICA_PANOU.ga4.ro.randuri.map((r) => r.nume)).toEqual(ga4.cookieuri.map((c) => c.nume))
    expect(SERVICII_STATISTICA_PANOU.ga4.en.randuri.map((r) => r.nume)[0]).toBe('_ga')
  })

  it('forma (i): FURNIZORI nu are niciun rand Umami; furnizorii activi scot GA4 cand nu ruleaza', () => {
    expect(JSON.stringify(FURNIZORI).toLowerCase()).not.toContain('umami')
    expect(furnizoriActivi({ ga4: true, umami: false })).toEqual(FURNIZORI)
    expect(furnizoriActivi({ ga4: false, umami: true }).some((f) => f.categorie === 'statistica')).toBe(false)
  })

  it('insigna: numarul serviciilor active, in limba bannerului', () => {
    expect(informareConsimtamant('ro', { ga4: true, umami: true }).insigna).toBe('2 servicii')
    expect(informareConsimtamant('ro', { ga4: false, umami: true }).insigna).toBe('1 serviciu')
    expect(informareConsimtamant('en', { ga4: false, umami: true }).insigna).toBe('1 service')
    expect(informareConsimtamant('en', { ga4: true, umami: true }).insigna).toBe('2 services')
  })
})

// ---------------------------------------------------------------------------------------------
// (3) Versiunea informarii si evidenta
// ---------------------------------------------------------------------------------------------

describe('(3) versiunea informarii: pe unelte si pe limba; evidenta accepta en-', () => {
  it('romana cu GA4 singur pastreaza EXACT versiunea de dinaintea masurarii S-B (formula veche, recalculata aici)', () => {
    const veche = 'ro-' + amprenta(JSON.stringify({ TEXTE_BANNER, TEXTE_PANOU, FURNIZORI, COOKIE_ALEGERE }))
    expect(VERSIUNE_INFORMARE).toBe(veche)
    expect(versiuneInformare('ro', { ga4: true, umami: false })).toBe(veche)
  })

  it('cele cinci combinatii dau cinci versiuni diferite, fiecare cu prefixul limbii', () => {
    const versiuni = COMBINATII.map(({ limba, ga4, umami }) => versiuneInformare(limba, { ga4, umami }))
    expect(new Set(versiuni).size).toBe(COMBINATII.length)
    versiuni.forEach((v, i) => expect(v).toMatch(new RegExp('^' + COMBINATII[i].limba + '-[0-9a-f]{8}$')))
  })

  it('evidenta accepta o versiune en- si una ro-; respinge o limba pe care bannerul nu o are', () => {
    const cerere = (versiune: string) => ({ id: 'a1b2c3d4-0000-4000-8000-000000000078', versiune, statistica: true, metoda: 'accept-tot', cale: '/' })
    const en = versiuneInformare('en', { ga4: false, umami: true })
    expect(valideazaEvidenta(cerere(en))).toEqual(cerere(en))
    expect(valideazaEvidenta(cerere(VERSIUNE_INFORMARE))).toEqual(cerere(VERSIUNE_INFORMARE))
    expect(valideazaEvidenta(cerere('fr-' + en.slice(3)))).toBeNull()
    expect(valideazaEvidenta(cerere('en-' + 'z'.repeat(8)))).toBeNull()
  })
})

// ---------------------------------------------------------------------------------------------
// Bannerul randat: limba, trei butoane egale, legaturile pe limba
// ---------------------------------------------------------------------------------------------

describe('bannerul randat pe server', () => {
  /** Clasele butoanelor dintr-o bucata de HTML, pe atributul lor. */
  const clase = (html: string, atribute: string[]) =>
    atribute.map((a) => new RegExp('<button type="button" class="([^"]+)" data-' + a + '=""').exec(html)?.[1] ?? '(lipsa ' + a + ')')

  it('EN pe 3s.md (numai Umami): textele EN, trei butoane cu aceeasi clasa, in banner si in panou', async () => {
    const html = await punct({ OPERATOR_JSON: JSON_OPERATOR_3S_MD, ...MEDIU_UMAMI }, 'en')
    expect(html).toContain('Measuring visits')
    expect(html).toContain('umami.disabled (read only)')
    expect(html).not.toContain('Google Analytics')
    expect(html).toContain('Reject all')
    const primul = html.slice(0, html.indexOf('</section>'))
    const [accept, refuz, setari] = clase(primul, ['accept', 'refuz', 'setari'])
    expect(accept).not.toMatch(/lipsa/)
    expect([refuz, setari]).toEqual([accept, accept])
    const panou = html.slice(html.indexOf('<dialog'))
    const [pAccept, pRefuz, pSalveaza] = clase(panou, ['accept', 'refuz', 'salveaza'])
    expect(pAccept).not.toMatch(/lipsa/)
    expect([pRefuz, pSalveaza]).toEqual([pAccept, pAccept])
  })

  it('RO-MD pe 3s.md (numai Umami): textele romanesti S-B, fara GA4; romana implicita pe radacina RO', async () => {
    const html = await punct({ OPERATOR_JSON: JSON_OPERATOR_3S_MD, ...MEDIU_UMAMI }, 'ro')
    expect(html).toContain('Măsurarea vizitelor')
    expect(html).toContain('umami.disabled (numai citit)')
    expect(html).not.toContain('Google Analytics')
    expect(html).toContain('Refuz tot')
    vi.unstubAllEnvs()
    const implicit = await punct({ OPERATOR_JSON: JSON.stringify({ operator: OPERATOR_RO }), NEXT_PUBLIC_GA4_ID: ID_GA4 })
    // Controlul: fara Umami, setul romanesc cu GA4 singur, cel de pana acum
    expect(implicit).toContain(TEXTE_BANNER.titlu)
    expect(implicit).toContain('Google Analytics')
  })

  it('legaturile spre politici, pe limba: site-ul RO, editia RO-MD, editia EN; numai catre pagini care exista', () => {
    const roMd = { cookie: REGISTRU_MD['cookie-uri'].ro, confidentialitate: REGISTRU_MD.confidentialitate.ro }
    const en = { cookie: REGISTRU_MD['cookie-uri'].en, confidentialitate: REGISTRU_MD.confidentialitate.en }
    expect(legaturiPolitici(new Set([CAI_POLITICI.cookie, CAI_POLITICI.confidentialitate]))).toEqual(CAI_POLITICI)
    expect(legaturiPolitici(new Set([roMd.cookie, roMd.confidentialitate]), 'ro')).toEqual(roMd)
    expect(legaturiPolitici(new Set([en.cookie, en.confidentialitate]), 'en')).toEqual(en)
    // martor NEGATIV: o cale a altei limbi nu se ia; nimic existent = text fara legatura
    expect(legaturiPolitici(new Set([roMd.cookie]), 'en')).toEqual({ cookie: null, confidentialitate: null })
    expect(legaturiPolitici(new Set(['/']), 'ro')).toEqual({ cookie: null, confidentialitate: null })
  })
})

// ---------------------------------------------------------------------------------------------
// Incarcatorul: element <script> clasic, data-before-send, fara umami.disabled scris
// ---------------------------------------------------------------------------------------------

describe('incarcatorul Umami', () => {
  type ElementFals = { tag: string; async: boolean; src: string; dataset: Record<string, string> }

  /** O pagina falsa, minima: ce pune incarcatorul in <head> si ce face pe `window`. */
  function paginaFalsa() {
    const puse: ElementFals[] = []
    const urmarite: unknown[][] = []
    const fereastra: Record<string, unknown> = { umami: { track: (...a: unknown[]) => urmarite.push(a) } }
    vi.stubGlobal('window', fereastra)
    vi.stubGlobal('document', {
      createElement: (tag: string): ElementFals => ({ tag, async: false, src: '', dataset: {} }),
      head: { appendChild: (e: ElementFals) => puse.push(e) },
    })
    return { puse, urmarite, fereastra }
  }

  it('pune UN element <script> clasic, de pe cale proprie, cu identificatorul, do-not-track si data-before-send', async () => {
    const { puse, fereastra } = paginaFalsa()
    vi.resetModules()
    const m = await import('../src/components/consimtamant/incarcator-umami')
    let permis = true
    m.pornesteUmami(ID_SITE, () => permis)
    m.pornesteUmami(ID_SITE, () => permis)
    expect(puse).toHaveLength(1)
    expect(puse[0]).toEqual({
      tag: 'script',
      async: true,
      src: '/a/script.js',
      dataset: { websiteId: ID_SITE, doNotTrack: 'true', beforeSend: m.NUME_INAINTE_DE_TRIMITERE, analitica: 'umami' },
    })
    // Functia de pe window lasa datele sa plece numai cat timp statistica e acceptata ACUM
    const inainte = fereastra[m.NUME_INAINTE_DE_TRIMITERE] as (t: string, d: unknown) => unknown
    const date = { url: '/' }
    expect(inainte('event', date)).toBe(date)
    permis = false
    expect(inainte('event', date)).toBe(false)
  })

  it('un accept dat din nou pe aceeasi pagina nu pune al doilea script, dar trimite vizita; dupa retragere, nu', async () => {
    const { puse, urmarite } = paginaFalsa()
    vi.resetModules()
    const m = await import('../src/components/consimtamant/incarcator-umami')
    m.pornesteUmami(ID_SITE, () => true)
    expect(urmarite).toHaveLength(0)
    m.pornesteUmami(ID_SITE, () => true)
    expect(puse).toHaveLength(1)
    expect(urmarite).toHaveLength(1)
    m.pornesteUmami(ID_SITE, () => false)
    expect(urmarite).toHaveLength(1)
  })

  it('sursa: nu scrie in stocare (nici umami.disabled), nu foloseste import() pentru tracker, nu e modul', () => {
    const sursa = citeste('src/components/consimtamant/incarcator-umami.ts')
    const cod = sursa.replace(/^\s*\/\/.*$/gm, '')
    const TIPAR_STOCARE = /localStorage|sessionStorage|setItem/
    expect(cod).not.toMatch(TIPAR_STOCARE)
    expect(cod).not.toMatch(/import\(/)
    expect(cod).not.toMatch(/type\s*=\s*["']module["']|\.type\s*=/)
    // Controlul cautarii: acelasi tipar prinde un rand care il are
    expect(['window', 'localStorage', 'setItem("x", "1")'].join('.')).toMatch(TIPAR_STOCARE)
  })

  it('bannerul il cere cu import() numai la accept; scriptul nu mai sta in layout', () => {
    const banner = citeste('src/components/consimtamant/Consimtamant.tsx')
    expect(banner).toContain('import("./incarcator-umami")')
    expect(citeste('src/components/analitica/Analitica.tsx')).not.toMatch(/next\/script|<Script/)
  })
})

// ---------------------------------------------------------------------------------------------
// Evenimentele Umami: lista inchisa, separata de GA4, fara preventDefault
// ---------------------------------------------------------------------------------------------

describe('evenimentele Umami', () => {
  const PAGINA_EN = 'https://3s.md/pricing'
  const PAGINA_RO = 'https://3s.md/ro'

  it('lista inchisa, separata de cea GA4', () => {
    expect(Object.keys(EVENIMENTE_UMAMI).sort()).toEqual(['contact', 'cta_contact', 'lang_switch'])
    expect(Object.keys(EVENIMENTE_UMAMI).filter((n) => n in EVENIMENTE)).toEqual([])
    expect(CAI_CONTACT).toEqual(['/contact', '/ro/contact'])
  })

  it('canalele de contact, legatura spre contact si schimbarea limbii, cu limba paginii', () => {
    const ev = (href: string, pagina = PAGINA_EN, lang: string | null = null, limbaPagina = 'en') => evenimentDinLegatura({ href, lang }, pagina, limbaPagina)
    expect(ev('mailto:contact@exemplu.test')).toEqual(['contact', { canal: 'email', lang: 'en' }])
    expect(ev('https://wa.me/37360055599?text=x')).toEqual(['contact', { canal: 'whatsapp', lang: 'en' }])
    expect(ev('/contact')).toEqual(['cta_contact', { lang: 'en' }])
    expect(ev('/ro/contact', PAGINA_RO, null, 'ro')).toEqual(['cta_contact', { lang: 'ro' }])
    expect(ev('/ro', PAGINA_EN, 'ro')).toEqual(['lang_switch', { lang: 'ro' }])
    expect(ev('/', PAGINA_RO, 'en', 'ro')).toEqual(['lang_switch', { lang: 'en' }])
  })

  it('cta_contact pe asezarea ro (3s.com.ro): tinta se recunoaste pe calea SERVITA, cu martorul 3s.md neschimbat', () => {
    // Tinta se citeste din bara de adrese (calea servita), iar pe 3s.com.ro engleza sta sub /en: o comparatie pe caile
    // sursa (/contact, /ro/contact) n-ar recunoaste /en/contact si cele 20 de legaturi spre el n-ar numara nimic.
    const origineRo = ['https://3s', 'com', 'ro'].join('.')
    const evRo = (href: string, pagina: string, limbaPagina: string) => evenimentDinLegatura({ href, lang: null }, pagina, limbaPagina, 'ro')
    expect(caiContactServite('ro')).toEqual(['/en/contact', '/contact'])
    // Lista scrisa in modul (fara importul asezarii, care ar muta bucatile JS) e chiar traducerea din src/lib/asezare.ts.
    expect([...CAI_CONTACT_RO]).toEqual([caleServitaEditiei(caSursa('/contact'), 'en', 'ro'), caleServitaEditiei(caSursa('/ro/contact'), 'ro-MD', 'ro')])
    expect(evRo('/en/contact', origineRo + '/en/pricing', 'en')).toEqual(['cta_contact', { lang: 'en' }])
    expect(evRo('/contact', origineRo + '/preturi', 'ro')).toEqual(['cta_contact', { lang: 'ro' }])
    // Martor negativ pe ro: /ro/contact nu e servita acolo, iar /en/pricing nu e contact.
    expect(evRo('/ro/contact', origineRo + '/preturi', 'ro')).toBeNull()
    expect(evRo('/en/pricing', origineRo + '/en/contact', 'en')).toBeNull()
    // Martorul 3s.md: asezarea md pastreaza caile de dinainte, iar /en/contact nu e acolo o pagina de contact.
    expect(caiContactServite('md')).toEqual([...CAI_CONTACT])
    expect(evenimentDinLegatura({ href: '/contact', lang: null }, PAGINA_EN, 'en', 'md')).toEqual(['cta_contact', { lang: 'en' }])
    expect(evenimentDinLegatura({ href: '/en/contact', lang: null }, PAGINA_EN, 'en', 'md')).toBeNull()
  })

  it('martor NEGATIV: legaturi obisnuite, alta origine, aceeasi limba, pagina fara limba cunoscuta = nimic', () => {
    const ev = (href: string, lang: string | null = null, limbaPagina = 'en') => evenimentDinLegatura({ href, lang }, PAGINA_EN, limbaPagina)
    expect(ev('/pricing')).toBeNull()
    expect(ev('https://altcineva.test/contact')).toBeNull()
    expect(ev('/', 'en')).toBeNull()
    expect(ev('mailto:contact@exemplu.test', null, 'fr')).toBeNull()
    // Decizia 56: legaturile de apel au iesit, deci nici urmarirea lor; una scapata nu devine eveniment `contact`.
    expect(ev(['tel', '+37360055599'].join(':'))).toBeNull()
    expect(CANALE_CONTACT).toEqual(['whatsapp', 'email'])
    expect(limbaDin('ro-MD')).toBe('ro')
    expect(limbaDin('de')).toBeNull()
  })

  it('martor POZITIV: parametru in plus, canal sau limba necunoscute, nume din afara listei sunt respinse', () => {
    expect(evenimentUmamiValid('contact', { canal: 'whatsapp', lang: 'en' })).toBe(true)
    expect(evenimentUmamiValid('contact', { canal: 'whatsapp', lang: 'en', email: 'x' })).toBe(false)
    expect(evenimentUmamiValid('contact', { canal: 'fax', lang: 'en' })).toBe(false)
    expect(evenimentUmamiValid('lang_switch', { lang: 'Ion Popescu' })).toBe(false)
    expect(evenimentUmamiValid('clic_cta', { tinta: '/contact' })).toBe(false)
  })

  it('ascultatorul delegat trimite prin window.umami.track si NU opreste navigarea (fara preventDefault)', async () => {
    class ElementFals {
      closest() {
        return this
      }
    }
    class AncoraFalsa extends ElementFals {
      href: string
      atributLang: string | null
      constructor(href: string, atributLang: string | null) {
        super()
        this.href = href
        this.atributLang = atributLang
      }
      getAttribute(n: string) {
        return n === 'lang' ? this.atributLang : null
      }
    }
    const trimise: unknown[][] = []
    let ascultator: ((e: unknown) => void) | null = null
    let captura: boolean | null = null
    vi.stubGlobal('Element', ElementFals)
    vi.stubGlobal('HTMLAnchorElement', AncoraFalsa)
    vi.stubGlobal('window', { location: { href: PAGINA_EN }, umami: { track: (...a: unknown[]) => trimise.push(a) } })
    vi.stubGlobal('document', {
      documentElement: { getAttribute: () => 'en' },
      addEventListener: (_t: string, f: (e: unknown) => void, c: boolean) => {
        ascultator = f
        captura = c
      },
      removeEventListener: () => {
        ascultator = null
      },
    })
    vi.resetModules()
    const { urmaresteUmami } = await import('../src/components/consimtamant/evenimente')
    const opreste = urmaresteUmami()
    expect(captura).toBe(true)
    const preventDefault = vi.fn()
    const apasa = (a: AncoraFalsa) => (ascultator as unknown as (e: unknown) => void)({ target: a, preventDefault })
    apasa(new AncoraFalsa('https://wa.me/37360055599', null))
    apasa(new AncoraFalsa('https://3s.md/pricing', null))
    expect(trimise).toEqual([['contact', { canal: 'whatsapp', lang: 'en' }]])
    expect(preventDefault).not.toHaveBeenCalled()
    opreste()
    expect(ascultator).toBeNull()
  })
})
