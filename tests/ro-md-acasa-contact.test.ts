import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { abateriMetadata, alternatePagina, type ContextAlternate } from '../src/components/seo/metadata'
import { legaturaWhatsApp } from '../src/content/canale'
import { ECHIVALENTE } from '../src/content/echivalente'
import { numarCuvinte, type BlocComun, type PaginaContinut } from '../src/content/model/tipuri'
import { ETICHETA_WHATSAPP_RO_MD, TEXTE_WHATSAPP_RO_MD } from '../src/content/navigatie-ro-md'
import { RUTE_EN_NUCLEU } from '../src/content/rute-en-nucleu'
import { RUTE_RO_MD } from '../src/content/rute-ro-md'
import * as acasa from '../src/content/ro-md/acasa'
import * as contact from '../src/content/ro-md/contact'
import { configurareCanale } from '../src/lib/canale-mediu'
import { alternateSite } from '../src/lib/site'

/**
 * Paginile RO-MD de prezentare (felia ro-md-acasa-contact): `/ro` si `/ro/contact` pe 3s.md. Proba masoara pe sursa:
 * forma paginilor in toate variantele conditionate (e-mail, ghiduri, operator, paginile juridice RO), alegerea
 * variantelor, legatura cu manifestul, cu echivalentele si cu registrul de afirmatii, legaturile WhatsApp si e-mail
 * fata de forma lor de referinta, si ce nu are voie sa ajunga pe aceste pagini: formele de politete (decizia 35),
 * asistentul pe WhatsApp (decizia 49), functiile negasite in codul platformei (decizia 43), hartia inainte de poarta
 * juridica a deciziei 40, RON, Germania ca loc al gazduirii. Paginile servite (200, `lang="ro"`, hreflang, selector,
 * subsol) le masoara `tests/browser/ro-md-acasa-contact.spec.ts`, pe copia 3s.md.
 *
 * Fixturile cazurilor pozitive (cuvintele interzise) se asambleaza la rulare, din bucati.
 */

const RADACINA = join(__dirname, '..')
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as {
  SITE_URL: string
  SITE_ALTERNATE: string
  CANALE_JSON: unknown
  OPERATOR_JSON: Record<string, unknown>
}
const CANALE_3S_MD = configurareCanale(JSON.stringify(PROFIL.CANALE_JSON), '')
const ADRESA_EMAIL = 'contact' + '@3s.md'

type Intrare = { id: string; text: string; unde: string; stare: string }
const REGISTRU = JSON.parse(readFileSync(join(RADACINA, 'src', 'content', 'afirmatii', 'ro-md-acasa-contact.json'), 'utf8')) as Intrare[]

/** Toate combinatiile de variante ale celor doua pagini. */
const VARIANTE: contact.OptiuniContact[] = ['', ADRESA_EMAIL].flatMap((email) =>
  [false, true].flatMap((ghiduri) =>
    [false, true].flatMap((operator) => [false, true].map((juridicRo) => ({ email, ghiduri, operator, juridicRo }))),
  ),
)

const PAGINI: { modul: string; fisier: string; construieste: (o: contact.OptiuniContact) => PaginaContinut }[] = [
  { modul: 'src/content/ro-md/acasa.ts', fisier: 'src/app/(romd)/ro/page.romd.tsx', construieste: (o) => acasa.paginaAcasa(o) },
  { modul: 'src/content/ro-md/contact.ts', fisier: 'src/app/(romd)/ro/contact/page.romd.tsx', construieste: (o) => contact.paginaContact(o) },
]

function textBloc(b: BlocComun): string[] {
  const celule = (b.tabel?.randuri ?? []).flat().map((c) => (typeof c === 'string' ? c : c.text + ' ' + c.detaliu))
  return [b.eticheta ?? '', ...b.paragrafe, ...(b.lista?.elemente ?? []), b.tabel?.titlu ?? '', ...(b.tabel?.antet ?? []), ...celule, ...(b.dupa ?? [])]
}

/** Tot textul unei pagini construite, cu marcaj cu tot. */
function textPagina(p: PaginaContinut): string {
  return [p.meta.titlu, p.meta.descriere, p.h1, p.capsula, ...p.sectiuni.flatMap((s) => [s.titlu, ...s.blocuri.flatMap(textBloc)]), JSON.stringify(p.cta), JSON.stringify(p.jsonLd)].join('\n')
}

/** Tot textul de pe pagini, in toate variantele, plus textele exportate in afara paginii (erou, final, carduri). */
function textulTuturorVariantelor(): string {
  const pagini = VARIANTE.flatMap((o) => PAGINI.map((p) => textPagina(p.construieste(o))))
  const finaluri = VARIANTE.map((o) => JSON.stringify(acasa.finalAcasa(o)))
  return [
    ...pagini,
    ...finaluri,
    acasa.MICROTEXT,
    acasa.INAINTE_DE_EMAIL,
    JSON.stringify(acasa.eroSecundar),
    JSON.stringify(contact.CANALE_PAGINA),
    ...contact.DUPA,
    ETICHETA_WHATSAPP_RO_MD,
  ].join('\n')
}

// ---------------------------------------------------------------------------------------------
// Forma
// ---------------------------------------------------------------------------------------------

describe('forma celor doua pagini, in toate variantele', () => {
  it('preconditia: 16 combinatii de variante, 2 pagini', () => {
    expect(VARIANTE).toHaveLength(16)
    expect(PAGINI).toHaveLength(2)
  })

  for (const p of PAGINI) {
    it(p.modul + ': titlul (max. 60, fisa) si descrierea in pragurile portii de SEO, capsula de 40-60 de cuvinte, H1 nevid, chei unice', () => {
      for (const o of VARIANTE) {
        const pg = p.construieste(o)
        const eticheta = p.modul + ' ' + JSON.stringify(o)
        expect(abateriMetadata(pg.meta), eticheta).toEqual([])
        expect(pg.meta.titlu.length, eticheta).toBeLessThanOrEqual(60)
        expect(pg.meta.descriere.length, eticheta).toBeGreaterThanOrEqual(140)
        const n = numarCuvinte(pg.capsula)
        expect(n >= 40 && n <= 60, eticheta + ': capsula are ' + n + ' cuvinte').toBe(true)
        expect(pg.h1.trim()).not.toBe('')
        expect(new Set(pg.sectiuni.map((s) => s.cheie)).size, eticheta).toBe(pg.sectiuni.length)
        expect(pg.cta.textWhatsapp.split('[ref:' + pg.cta.ref + ']').length - 1).toBe(1)
        expect(pg.cta.subiectEmail.split('[ref:' + pg.cta.ref + ']').length - 1).toBe(1)
        for (const n of pg.jsonLd) expect(typeof n['@type']).toBe('string')
        expect(JSON.stringify(pg.jsonLd)).toContain('"inLanguage":"ro-MD"')
      }
    })
  }

  it('/ro cu toate variantele deschise: 9 sectiuni H2 plus blocul final (10 H2, ca in fisa) si 4 intrebari H3', () => {
    const pg = acasa.paginaAcasa({ email: ADRESA_EMAIL, ghiduri: true, operator: true })
    expect(pg.sectiuni.filter((s) => s.nivel !== 3)).toHaveLength(9)
    expect(pg.sectiuni.filter((s) => s.nivel === 3).map((s) => s.titlu)).toEqual([
      'Pot formula întrebări în engleză despre documente redactate în română?',
      'Poate 3S să scaneze și documentele pe hârtie?',
      'Cine operează 3S?',
      'De ce site-ul nu include referințe de la clienți?',
    ])
    // Intrebarile stau dupa titlul lor de grup, care e ultimul H2 al corpului.
    const iGrup = pg.sectiuni.findIndex((s) => s.cheie === 'inainte-de-contact')
    expect(pg.sectiuni.slice(iGrup + 1).every((s) => s.nivel === 3)).toBe(true)
  })

  it('/ro: ancora "cum-pornesc" exista si e tinta legaturii secundare din erou', () => {
    const pg = acasa.paginaAcasa()
    expect(pg.sectiuni.map((s) => s.ancoraInainte).filter(Boolean)).toEqual(['cum-pornesc'])
    expect(acasa.eroSecundar.href).toBe('#cum-pornesc')
  })
})

// ---------------------------------------------------------------------------------------------
// Variantele
// ---------------------------------------------------------------------------------------------

describe('variantele se aleg din cod', () => {
  const baza = { email: '', ghiduri: false, operator: false, juridicRo: false }

  it('e-mailul (P-40): fara adresa nicio forma cu e-mail; cu adresa, pasul 1, fraza de final si contactul o numesc', () => {
    const fara = acasa.paginaAcasa(baza)
    const cu = acasa.paginaAcasa({ ...baza, email: ADRESA_EMAIL })
    expect(textPagina(fara)).not.toContain('sau prin e-mail')
    expect(textPagina(cu)).toContain('Scrie-ne pe WhatsApp sau prin e-mail și descrie pe scurt arhiva firmei.')
    expect(acasa.finalAcasa(baza).text).toContain('Dacă preferi o convorbire pe WhatsApp, găsești numărul pe [pagina de contact](/ro/contact).')
    expect(acasa.finalAcasa({ ...baza, email: ADRESA_EMAIL }).text).toContain('găsești adresa și numărul pe [pagina de contact](/ro/contact).')
    const c0 = contact.paginaContact(baza)
    const c1 = contact.paginaContact({ ...baza, email: ADRESA_EMAIL })
    expect(c0.meta.titlu).toBe('Contact 3S: WhatsApp, mesaje și apeluri')
    expect(c1.meta.titlu).toBe('Contact 3S: WhatsApp și e-mail')
    expect(textPagina(c0)).not.toContain(ADRESA_EMAIL)
    expect(c1.capsula).toContain(', ori prin e-mail, la ' + ADRESA_EMAIL + '.')
    expect(c1.meta.descriere).toContain('ori prin e-mail, la ' + ADRESA_EMAIL + '.')
    // Legatura de e-mail a paginii: nula fara adresa.
    expect(acasa.emailAcasa('')).toBeNull()
    expect(contact.emailContact('')).toBeNull()
  })

  it('ghidurile: sectiunea si fragmentul din ultima intrebare apar numai cu toate trei rutele G', () => {
    const fara = acasa.paginaAcasa(baza)
    const cu = acasa.paginaAcasa({ ...baza, ghiduri: true })
    expect(fara.sectiuni.map((s) => s.cheie)).not.toContain('unde-pot-verifica')
    expect(cu.sectiuni.map((s) => s.cheie)).toContain('unde-pot-verifica')
    expect(textPagina(fara)).toContain('pe baza unui pilot pe documentele firmei;')
    expect(textPagina(cu)).toContain('pe baza ghidurilor cu surse și a unui pilot pe documentele firmei;')
    expect(textPagina(fara)).not.toMatch(/\/guides\/|\/compare\//)
    // Decizia din manifest: trei rute = da, doua = nu, niciuna = nu.
    const rute = acasa.CAI_GHIDURI.map((cale) => ({ cale }))
    expect(acasa.ghiduriPublicate(rute)).toBe(true)
    expect(acasa.ghiduriPublicate(rute.slice(1))).toBe(false)
    expect(acasa.ghiduriPublicate([])).toBe(false)
  })

  it('operatorul: "Cine opereaza 3S?" si "Unde gasesc datele firmei?" numai dupa inregistrare (OPERATOR_JSON fara model)', () => {
    expect(acasa.paginaAcasa(baza).sectiuni.map((s) => s.cheie)).not.toContain('cine-opereaza')
    expect(acasa.paginaAcasa({ ...baza, operator: true }).sectiuni.map((s) => s.cheie)).toContain('cine-opereaza')
    expect(contact.paginaContact(baza).sectiuni.map((s) => s.cheie)).not.toContain('datele-firmei')
    expect(contact.paginaContact({ ...baza, operator: true }).sectiuni.map((s) => s.cheie)).toContain('datele-firmei')
    // Decizia din OPERATOR_JSON: profilul 3s.md de azi poarta modelul D2, deci nu.
    expect(PROFIL.OPERATOR_JSON.model).toBe('D2')
    expect(acasa.operatorInregistrat(JSON.stringify(PROFIL.OPERATOR_JSON))).toBe(false)
    const faraModel = Object.fromEntries(Object.entries(PROFIL.OPERATOR_JSON).filter(([k]) => k !== 'model'))
    expect(acasa.operatorInregistrat(JSON.stringify(faraModel))).toBe(true)
    expect(acasa.operatorInregistrat(JSON.stringify({ operator: null }))).toBe(false)
    expect(acasa.operatorInregistrat(undefined)).toBe(false)
    expect(acasa.operatorInregistrat('')).toBe(false)
  })

  it('paginile juridice RO: fraza despre limbi le numeste numai cand rutele lor exista', () => {
    const limba = (juridicRo: boolean) =>
      contact.paginaContact({ ...baza, juridicRo }).sectiuni.find((s) => s.cheie === 'limba')!.blocuri[0].paragrafe[0]
    expect(limba(true)).toContain('în română sunt disponibile pagina de start și paginile juridice;')
    expect(limba(false)).toContain('în română este disponibilă pagina de start;')
  })
})

// ---------------------------------------------------------------------------------------------
// Manifest, echivalente, canale, registru
// ---------------------------------------------------------------------------------------------

describe('legaturile paginilor cu restul site-ului', () => {
  const rute = RUTE_RO_MD.filter((r) => r.cheie === 'home' || r.cheie === 'contact')

  it('manifestul RO-MD: /ro (home) si /ro/contact (contact), editia ro-MD, in harta, fiecare cu pagina pe disc', () => {
    expect(rute.map((r) => [r.cale, r.cheie]).sort()).toEqual([
      ['/ro', 'home'],
      ['/ro/contact', 'contact'],
    ])
    for (const r of rute) {
      expect(r.editie).toBe('ro-MD')
      expect(r.inHarta).toBe(true)
    }
    for (const p of PAGINI) {
      const pg = p.construieste(VARIANTE[0])
      expect(rute.find((r) => r.cale === pg.meta.cale)?.cheie, p.modul).toBe(pg.cheie)
      expect(existsSync(join(RADACINA, p.fisier)), p.fisier).toBe(true)
      const sursa = readFileSync(join(RADACINA, p.fisier), 'utf8')
      expect(sursa).not.toContain('<form')
      expect(sursa).not.toMatch(/from\s+"@\/content\/preturi"/)
    }
    // Martorul tiparului de import: un import fabricat al grilei romanesti e prins.
    expect('import { X } from "@/content/' + 'preturi";').toMatch(/from\s+"@\/content\/preturi"/)
  })

  it('echivalentele: home si contact au pagina EN nucleu cu aceeasi cheie si pagina RO-MD din manifest', () => {
    for (const cheie of ['home', 'contact']) {
      const cai = ECHIVALENTE[cheie]
      expect(cai, cheie).toBeDefined()
      expect(RUTE_EN_NUCLEU.find((r) => r.cheie === cheie)?.cale, cheie).toBe(cai.en)
      expect(rute.find((r) => r.cheie === cheie)?.cale, cheie).toBe(cai['ro-MD'])
      expect(cai['ro-RO'], cheie).toBeUndefined()
    }
  })

  it('hreflang pe profilul 3s.md: perechea emite aceeasi multime pe ambele pagini, cu x-default pe pagina EN', () => {
    const context: ContextAlternate = {
      alternate: alternateSite(PROFIL.SITE_ALTERNATE, PROFIL.SITE_URL),
      baza: PROFIL.SITE_URL,
      editii: ['en', 'ro-MD'],
      echivalente: ECHIVALENTE,
    }
    const adresa = (cale: string) => PROFIL.SITE_URL + (cale === '/' ? '' : cale)
    for (const cheie of ['home', 'contact']) {
      const cai = ECHIVALENTE[cheie]
      const en = alternatePagina({ cale: cai.en!, editie: 'en', cheie }, context)
      const ro = alternatePagina({ cale: cai['ro-MD']!, editie: 'ro-MD', cheie }, context)
      const asteptate = { en: adresa(cai.en!), 'ro-MD': adresa(cai['ro-MD']!), 'x-default': adresa(cai.en!) }
      expect(en.languages, cheie).toEqual(asteptate)
      expect(ro.languages, cheie).toEqual(asteptate)
    }
    // Martor NEGATIV: fara pereche in tabel, pagina RO-MD se listeaza numai pe ea insasi.
    const singura = alternatePagina({ cale: '/ro', editie: 'ro-MD', cheie: 'home' }, { ...context, echivalente: {} })
    expect(Object.keys(singura.languages ?? {}).sort()).toEqual(['ro-MD', 'x-default'])
  })

  it('canalele: eticheta "Scrie-ne pe WhatsApp" (decizia 35) si textul precompletat al fiecarei pagini din tabelul navigatiei', () => {
    expect(ETICHETA_WHATSAPP_RO_MD).toBe('Scrie-ne pe WhatsApp')
    for (const p of PAGINI) {
      const pg = p.construieste(VARIANTE[0])
      const rand = TEXTE_WHATSAPP_RO_MD.find((t) => t.cale === pg.meta.cale && !t.prefix)
      expect(rand, pg.meta.cale).toBeDefined()
      expect(pg.cta.ref).toBe(rand!.ref)
      expect(pg.cta.textWhatsapp).toBe(rand!.text)
    }
  })

  it('legaturile wa.me si mailto sunt identice, caracter cu caracter, cu forma de referinta a fisei', () => {
    const wa = (pg: PaginaContinut) => legaturaWhatsApp(pg.cta.ref, pg.cta.textWhatsapp, CANALE_3S_MD)
    expect(wa(acasa.paginaAcasa())).toBe(
      'https://wa.me/37368055599?text=Bun%C4%83%20ziua%2C%203S.%20Am%20citit%20site-ul%203S%20%5Bref%3Aro-md-acasa%5D.%20A%C8%99%20dori%20s%C4%83%20%C3%AEntreb%20despre%20un%20pilot.',
    )
    expect(wa(contact.paginaContact())).toBe(
      'https://wa.me/37368055599?text=Bun%C4%83%20ziua%2C%203S.%20Am%20citit%20pagina%20de%20contact%20%5Bref%3Aro-md-contact%5D.%20A%C8%99%20dori%20s%C4%83%20%C3%AEntreb%20despre%20un%20pilot.',
    )
    expect(acasa.emailAcasa(ADRESA_EMAIL)).toBe(
      'mailto:' +
        ADRESA_EMAIL +
        '?subject=%C3%8Entrebare%203S%20%5Bref%3Aro-md-acasa%5D&body=Bun%C4%83%20ziua%2C%203S%2C%0D%0A%0D%0AAm%20citit%20site-ul%203S.%20A%C8%99%20dori%20s%C4%83%20%C3%AEntreb%20despre%20un%20pilot.%0D%0A%0D%0AArhiva%20mea%20%28h%C3%A2rtie%2C%20scan%C4%83ri%20sau%20fi%C8%99iere%29%20%C8%99i%20%C8%9Bara%3A%0D%0A',
    )
    expect(contact.emailContact(ADRESA_EMAIL)).toBe(
      'mailto:' +
        ADRESA_EMAIL +
        '?subject=%C3%8Entrebare%203S%20%5Bref%3Aro-md-contact%5D&body=Bun%C4%83%20ziua%2C%203S%2C%0D%0A%0D%0AAm%20citit%20pagina%20de%20contact.%20A%C8%99%20dori%20s%C4%83%20%C3%AEntreb%20despre%20un%20pilot.%0D%0A%0D%0AArhiva%20mea%20%28h%C3%A2rtie%2C%20scan%C4%83ri%20sau%20fi%C8%99iere%29%20%C8%99i%20%C8%9Bara%3A%0D%0A',
    )
  })

  it('numarul scris in text e numarul domeniului, afisat ca in subsol', async () => {
    const { numarAfisat } = await import('../src/content/canale')
    expect(numarAfisat(CANALE_3S_MD)).toBe('+373 68 055 599')
    expect(contact.paginaContact().capsula).toContain(numarAfisat(CANALE_3S_MD))
  })

  it('registrul: id-uri proprii ro-md-*, fara "germania"; fiecare afirmatie a fiecarei variante e in registru, cu `unde` = modulul ei; nicio intrare orfana', () => {
    const ids = new Set(REGISTRU.map((i) => i.id))
    expect(ids.size).toBe(REGISTRU.length)
    for (const i of REGISTRU) {
      expect(i.id).toMatch(/^ro-md-[a-z0-9-]+$/)
      expect(i.id).not.toMatch(/german/i)
    }
    const folosite = new Set<string>()
    for (const p of PAGINI) {
      for (const o of VARIANTE) {
        for (const id of p.construieste(o).afirmatii) {
          folosite.add(id)
          const intrare = REGISTRU.find((i) => i.id === id)
          expect(intrare, id).toBeDefined()
          expect(intrare!.unde.split(/,\s*/), id).toContain(p.modul)
        }
      }
    }
    expect(REGISTRU.filter((i) => !folosite.has(i.id)).map((i) => i.id)).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------
// Ce nu ajunge pe aceste pagini
// ---------------------------------------------------------------------------------------------

/** Formele de politete: pronumele si verbele la persoana a II-a plural (decizia 35: adresarea e "tu"). */
const POLITETE = new RegExp(
  '(?<!\\p{L})(' + ['dumnea' + 'voastră', 'dumnea' + 'voastra', 'dv' + 's', 'v' + 'ă', 'voas' + 'tră', 'vos' + 'tru', 'voș' + 'tri', 'voas' + 'tre', 'v' + 'oi'].join('|') + ')(?!\\p{L})|(?<!\\p{L})v-(?=\\p{L})|\\p{L}+(ați|eți|iți|âți)(?!\\p{L})',
  'giu',
)

function formePolitete(text: string): string[] {
  return [...text.matchAll(POLITETE)].map((m) => m[0])
}

/** Asistentul pe WhatsApp (decizia 49): un cuvant al asistentului in aceeasi propozitie cu numele canalului. */
const WA = 'Whats' + 'App'
const ASISTENT_RO = [
  'întreb\\p{L}*',
  'întreab\\p{L}*',
  'răspun\\p{L}*',
  'asistent\\p{L}*',
  'chat\\p{L}*',
  'conversați\\p{L}*',
  'caut\\p{L}*',
  'căut\\p{L}*',
  'regăs\\p{L}*',
  // Decizia 56 aduce WhatsApp langa "gasesti numarul/adresa pe pagina de contact" (omul gaseste datele de contact,
  // nu asistentul un document): forma aceea nu acuza; "gaseste documentul" ramane prinsa (martorii de mai jos).
  'găse\\p{L}*(?!\\p{L})(?! (adresa|numărul)(?!\\p{L}))',
  'primești',
  'primi[tr]\\p{L}*',
  'trimit\\p{L}*',
  'încarc\\p{L}*',
  'încărc\\p{L}*',
  'în testare',
  'în pilot',
].join('|')
const PROPOZITIE = '[^.?!\\n]{0,50}'
const TIPAR_ASISTENT_WA_RO = new RegExp(
  '(?<!\\p{L})(' + ASISTENT_RO + ')(?!\\p{L})' + PROPOZITIE + WA + '|' + WA + PROPOZITIE + '(?<!\\p{L})(' + ASISTENT_RO + ')(?!\\p{L})',
  'iu',
)

const INTERZISE: { motiv: string; tipar: RegExp }[] = [
  { motiv: 'asistentul pe WhatsApp (decizia 49)', tipar: TIPAR_ASISTENT_WA_RO },
  { motiv: 'pagina P04 scoasa (decizia 49)', tipar: new RegExp('/features/' + 'whats' + 'app', 'i') },
  { motiv: 'portalul pentru clienti (decizia 43)', tipar: new RegExp('port' + 'al', 'i') },
  { motiv: 'autentificarea unica (decizia 43)', tipar: new RegExp('(autentificar\\p{L}* ' + 'unic|single ' + 'sign-on|\\bSS' + 'O\\b|SA' + 'ML|OI' + 'DC)', 'iu') },
  { motiv: 'API si webhook (decizia 43)', tipar: new RegExp('(\\bA' + 'PI\\b|web' + 'hook)', 'i') },
  { motiv: 'stocarea proprie (decizia 43)', tipar: new RegExp('stocar\\p{L}* ' + 'propri', 'iu') },
  { motiv: 'regulile automate (decizia 43)', tipar: new RegExp('(reguli\\p{L}* ' + 'automat|automati' + 'z\\p{L}*|clasa\\p{L}* ' + 'automat)', 'iu') },
  {
    motiv: 'aplicatiile instalabile (decizia 43)',
    tipar: new RegExp('(aplicați\\p{L}* ' + '(instalabil|mobil|desktop)|App ' + 'Store|Google ' + 'Play|\\bi' + 'OS\\b|Andr' + 'oid|descărc\\p{L}* ' + '(liber\\p{L}* )?a aplicați)', 'iu'),
  },
  { motiv: 'scanarea pe telefon (decizia 43)', tipar: new RegExp('scan\\p{L}*[^.]{0,30}(cu|de pe|pe) ' + 'telefon', 'iu') },
  { motiv: 'integrarile cu nume (decizia 43)', tipar: new RegExp('(Google ' + 'Drive|Share' + 'Point|Drop' + 'box|One' + 'Drive|Microsoft ' + '365)', 'i') },
  { motiv: 'pagini de segment (decizia 38)', tipar: new RegExp('/' + 'solutions/') },
  { motiv: 'hartia, sub poarta juridica a deciziei 40', tipar: new RegExp('(pregăt\\p{L}* și ' + 'scan|scanea' + 'ză|păstrar\\p{L}* ' + 'fizic|arhivă pe ' + 'hârtie\\.)', 'iu') },
  { motiv: 'RON (3s.md: pretul in EUR, decizia 54)', tipar: new RegExp('\\b' + 'R' + 'ON\\b') },
  { motiv: 'Germania ca loc al gazduirii (decizia 42)', tipar: new RegExp('(German' + 'ia|o singură ' + 'regiune)', 'iu') },
  { motiv: 'limba rusa (decizia 8)', tipar: new RegExp('(?<!\\p{L})rus' + '(ă|a|e|ește)(?!\\p{L})', 'iu') },
  // Decizia 56 (03.10.2026): fara apeluri GSM; "suna-ne" e permis numai urmat de WhatsApp in aceeasi propozitie.
  {
    motiv: 'apel GSM (decizia 56)',
    tipar: new RegExp('(telefonic|(?<!\\p{L})telefon(ul)?(?!\\p{L})|(?<!\\p{L})sun[aă](-ne)?(?!\\p{L})(?![^.;]{0,30}' + WA + ')|(?<!\\p{L})te' + 'l:)', 'iu'),
  },
]

function incalcari(text: string): string[] {
  return INTERZISE.filter((i) => i.tipar.test(text)).map((i) => i.motiv)
}

describe('ce nu ajunge pe paginile RO-MD', () => {
  it('martorii formelor de politete: o fraza fabricata e prinsa de patru ori, textele de contact cu "tu" nu', () => {
    const rau = 'V' + 'ă rugăm să ne scrie' + 'ți; dumnea' + 'voastră alege' + 'ți.'
    expect(formePolitete(rau)).toHaveLength(4)
    expect(formePolitete('Nu ' + 'v-' + 'am scris.')).toHaveLength(1)
    // Martor NEGATIV: cuvintele reale ale paginilor care se termina asemanator nu sunt acuzate.
    expect(formePolitete('Scrie-ne pe WhatsApp. Îți răspunde o persoană; poți suna. Situații, informații, aplicații, toți colegii.')).toEqual([])
  })

  it('zero forme de politete in tot textul paginilor, in toate variantele (numarate)', () => {
    const text = textulTuturorVariantelor()
    // Controlul extragerii: textul strans are formele de "tu" ale paginilor.
    expect(text).toContain('Scrie-ne pe WhatsApp')
    expect(text).toContain('Îți răspunde o persoană din echipa 3S')
    expect(formePolitete(text)).toEqual([])
  })

  it('martorii tiparelor: fiecare prinde o fraza fabricata, iar contactul cu o persoana pe WhatsApp nu e acuzat', () => {
    const rau: string[] = [
      'Întreabă arhiva direct pe ' + WA + '.',
      'Detalii pe [pagina dedicată](/features/' + 'whats' + 'app).',
      'Port' + 'alul pentru clienți.',
      'Autentificarea ' + 'unică în pachetul Enterprise.',
      'Acces prin A' + 'PI.',
      'Spațiul de stocare ' + 'propriu al firmei.',
      'Reguli ' + 'automate pe fiecare dosar.',
      'Aplicații ' + 'instalabile pentru Windows.',
      'Scanezi actele cu ' + 'telefonul.',
      'Conectezi Google ' + 'Drive.',
      '[x](/' + 'solutions/avocati)',
      '3S pregătește și ' + 'scanează documentele.',
      'de la 0 ' + 'R' + 'ON',
      'Fișierele sunt păstrate în German' + 'ia.',
      'Răspundem și în limba ' + 'rus' + 'ă.',
      'Sun' + 'ă-ne la +373 68 055 599.',
    ]
    expect(rau).toHaveLength(INTERZISE.length)
    for (const [i, fraza] of rau.entries()) expect(incalcari(fraza), fraza).toContain(INTERZISE[i].motiv)
    // Formele asistentului pe care le-ar scrie un text gresit, fiecare prinsa.
    for (const fraza of [
      'Pe ' + WA + ' primești răspunsul cu sursa.',
      'Asistentul pe ' + WA + ' este încă în testare.',
      'Trimite documentele pe ' + WA + ' și le găsești în arhivă.',
      'Caută un contract pe ' + WA + '.',
      WA + ' îți găsește documentul.',
      'Pe ' + WA + ' găsești documentul cu pagina lui.',
      'Pe ' + WA + ' găsești adresele clienților din arhivă.',
    ])
      expect(incalcari(fraza), fraza).toContain('asistentul pe WhatsApp (decizia 49)')
    // Martor POZITIV al deciziei 49: contactul cu o persoana pe WhatsApp, cum il scriu paginile, nu e acuzat.
    for (const fraza of [
      'Scrie-ne pe ' + WA + ' sau prin e-mail și descrie pe scurt arhiva firmei. În primul mesaj nu trimite documente sau date cu caracter personal.',
      'Poți contacta echipa 3S pe ' + WA + ', prin mesaj sau apel, la +373 68 055 599. Descrie-ne pe scurt arhiva firmei.',
      'Dacă preferi o convorbire, sună-ne pe ' + WA + ', la +373 68 055 599; la acest număr primim apeluri numai prin ' + WA + '.',
      'Contact 3S: ' + WA + ', mesaje și apeluri',
      'Contactează 3S pe ' + WA + ' (mesaj sau apel), la +373 68 055 599. Îți răspunde un membru al echipei.',
      'Dacă preferi o convorbire pe ' + WA + ', găsești numărul pe [pagina de contact](/ro/contact).',
      'Dacă preferi e-mailul sau o convorbire pe ' + WA + ', găsești adresa și numărul pe [pagina de contact](/ro/contact).',
    ])
      expect(incalcari(fraza), fraza).toEqual([])
    // Cuvintele-capcana ale textelor reale nu acuza: aplicatiile clientului, "pe hartie" ca tip de arhiva. (Fraza despre
    // apelul de pe telefonul mobil a iesit odata cu cardul de telefon, decizia 56: azi e chiar ce acuza tiparul ei.)
    expect(
      incalcari(
        'Dacă documentele sunt păstrate în mai multe aplicații, menționează și acest lucru. Documente pe hârtie, scanări sau fișiere electronice.',
      ),
    ).toEqual([])
  })

  it('zero incalcari in tot textul paginilor, in toate variantele', () => {
    const text = textulTuturorVariantelor()
    // Controlul extragerii: textul strans are numele canalului si pretul in EUR.
    expect(text).toContain(WA)
    expect(text).toContain('800 EUR')
    expect(incalcari(text)).toEqual([])
  })

  it('adresa de e-mail nu apare in variantele de dinainte de P-40', () => {
    const fara = VARIANTE.filter((o) => o.email === '')
    expect(fara).toHaveLength(8)
    // `@type` si `@id` din JSON-LD nu sunt adrese: se cauta o adresa, adica `@` intre doua caractere de cuvant.
    const adresa = /\w@\w/
    for (const o of fara) {
      for (const p of PAGINI) expect(textPagina(p.construieste(o)), p.modul).not.toMatch(adresa)
      expect(JSON.stringify(acasa.finalAcasa(o))).not.toMatch(adresa)
    }
    // Martorul tiparului: aceeasi varianta, cu adresa, e prinsa pe pagina de contact (capsula si descrierea o numesc;
    // pe pagina de start adresa o pune numai linia de e-mail a paginii, din canale).
    expect(textPagina(contact.paginaContact({ ...fara[0], email: ADRESA_EMAIL }))).toMatch(adresa)
  })
})
