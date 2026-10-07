import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Antet from '../src/components/global/Antet'
import Subsol from '../src/components/global/Subsol'
import { textSimplu } from '../src/content/juridic/tipuri'
import { caleMd, CHEI_MD } from '../src/content/juridic/md/registru'
import { problemePagina, type BlocComun, type PaginaContinut, type SectiuneComuna } from '../src/content/model/tipuri'
import { multimeaCailor } from '../src/content/navigatie'
import { TEXTE_WHATSAPP_EN, navigatieEn } from '../src/content/navigatie-en'
import { RUTE_EN_NUCLEU } from '../src/content/rute-en-nucleu'
import { configurareCanale } from '../src/lib/canale-mediu'
import * as about from '../src/content/en/about'
import * as contact from '../src/content/en/contact'
import * as enterprise from '../src/content/en/enterprise'
import * as home from '../src/content/en/home'
import * as platform from '../src/content/en/platform'
import { PLATFORMA_EN } from '../src/content/en/platforma-componente'
import * as pricing from '../src/content/en/pricing'

/**
 * Paginile EN nucleu (felia en-nucleu): P01 `/`, P02 `/platform`, P08 `/pricing`, P09 `/enterprise`, P10 `/contact`,
 * P11 `/about`. Proba masoara ce se poate masura pe sursa: forma modulelor, legatura lor cu manifestul de rute, cu
 * tabelul textelor WhatsApp al navigatiei si cu registrul de afirmatii; ce nu are voie sa ajunga pe aceste pagini
 * (deciziile 3, 8, 38, 43, 49, poarta juridica a deciziei 40, P-14, P-40, RON); grila de preturi (deciziile 18 si 24);
 * scoaterea grupului "Solutions" si a functiilor scoase din navigatia EN. Paginile servite (200, `lang="en"`, H1,
 * zero `<form`) le masoara `tests/browser/en-nucleu.spec.ts`, pe copia 3s.md.
 *
 * Fixturile cazurilor pozitive (cuvintele interzise) se asambleaza la rulare, din bucati.
 */

/**
 * Asistentul pe WhatsApp (decizia 49), asamblat din bucati (aceeasi forma ca in `tests/en-produs.test.ts`): un
 * cuvant al asistentului (intrebare, raspuns, chat, asistent, cautare si regasire, primirea de documente, "in pilot")
 * in aceeasi propozitie cu numele canalului, de o parte sau de alta, sau eticheta de pilot lipita de nume. Contactul
 * cu un om nu foloseste aceste cuvinte ("find us" e exceptat), deci trece (martorul pozitiv din probele de mai jos).
 * Vocabularul e copiat in `tests/en-produs.test.ts` si `tests/browser/en-nucleu.spec.ts`; o proba de mai jos cere
 * ca cele trei copii sa fie identice.
 */
const WA = 'Whats' + 'App'
const ASISTENT = '(ask|asking|asked|questions?|answers?|answered|assistant|chat|chatting|bot|search(es|ed|ing)?|find(?!\\s+(us|3S|our team)\\b)|finds|finding|look(s|ing)? up|quer(y|ies|ying)|retriev(e|es|ed|ing))'
const PRIMIRE = '(receives?|arrives?|takes? in|(send|upload|forward)\\w* (your |the )?(documents|files|invoices|scans))'
const ACEEASI_PROPOZITIE = '[^.?!\\n]{0,50}'
const TIPAR_ASISTENT_WA = new RegExp(
  [
    '\\b(' + ASISTENT.slice(1, -1) + '|in pilot)\\b' + ACEEASI_PROPOZITIE + '\\b' + WA + '\\b',
    '\\b' + WA + '\\b' + ACEEASI_PROPOZITIE + '\\b(' + ASISTENT.slice(1, -1) + '|in pilot)\\b',
    '\\b' + WA + ':? ?\\(?pilot',
    '\\b' + PRIMIRE + ACEEASI_PROPOZITIE + '\\bon ' + WA + '\\b',
  ].join('|'),
  'i',
)

const RADACINA = join(__dirname, '..')
const MODULE: Record<string, { pagina: PaginaContinut }> = { home, platform, pricing, enterprise, contact, about }
const PAGINI = Object.entries(MODULE).map(([cheie, m]) => ({ cheie, pagina: m.pagina }))
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as { CANALE_JSON: unknown }
const CANALE_3S_MD = configurareCanale(JSON.stringify(PROFIL.CANALE_JSON), '')

type Intrare = { id: string; text: string; unde: string; stare: string; sursa?: string; confirmat_de?: string }
const REGISTRU = JSON.parse(readFileSync(join(RADACINA, 'src', 'content', 'afirmatii', 'en-nucleu.json'), 'utf8')) as Intrare[]

/** Tot textul unui bloc, cu marcaj cu tot (legaturile raman vizibile ca adrese). */
function textBloc(b: BlocComun): string[] {
  const celule = (b.tabel?.randuri ?? []).flat().map((c) => (typeof c === 'string' ? c : c.text + ' ' + c.detaliu))
  return [b.eticheta ?? '', ...b.paragrafe, ...(b.lista?.elemente ?? []), ...(b.tabel?.antet ?? []), ...celule, ...(b.dupa ?? [])]
}

function textSectiuni(sectiuni: readonly SectiuneComuna[]): string {
  return sectiuni.flatMap((s) => [s.titlu, ...s.blocuri.flatMap(textBloc)]).join('\n')
}

/** Tot ce exporta un modul, serializat: pagina, blocul de final, textele cardurilor. */
function textModul(m: object): string {
  return JSON.stringify(m)
}

/** Legaturile din marcajul in linie al unui text. */
function legaturi(text: string): string[] {
  return [...text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => m[2])
}

/** Ancorele create pe pagina (separatorul dinaintea sectiunii). */
function ancore(p: PaginaContinut): string[] {
  return p.sectiuni.flatMap((s) => (s.ancoraInainte ? [s.ancoraInainte] : []))
}

describe('modulele paginilor EN nucleu', () => {
  it('preconditia: sase module, cu cheile manifestului', () => {
    expect(PAGINI.map((p) => p.cheie).sort()).toEqual(['about', 'contact', 'enterprise', 'home', 'platform', 'pricing'])
  })

  for (const { cheie, pagina } of PAGINI) {
    it(cheie + ': forma modelului (lungimi, un H1, CTA cu ref, JSON-LD cu @type), fara probleme', () => {
      expect(problemePagina(pagina, cheie)).toEqual([])
    })
  }

  it('manifestul: exact rutele modulelor, editia en, cheia = cheia modulului', () => {
    expect(RUTE_EN_NUCLEU).toHaveLength(6)
    const dupaCale = new Map(PAGINI.map((p) => [p.pagina.meta.cale, p.cheie]))
    for (const r of RUTE_EN_NUCLEU) {
      expect(r.editie, r.cale).toBe('en')
      expect(dupaCale.get(r.cale), r.cale).toBe(r.cheie)
      expect(r.inHarta, r.cale).toBe(true)
    }
    expect(new Set(RUTE_EN_NUCLEU.map((r) => r.cale)).size).toBe(6)
  })

  it('fiecare pagina are fisierul ei sub (en), iar segmentul [negasit] al fundatiei nu mai exista', () => {
    const fisier = (cale: string) => join(RADACINA, 'src', 'app', '(en)', ...(cale === '/' ? [] : [cale.slice(1)]), 'page.en.tsx')
    for (const r of RUTE_EN_NUCLEU) expect(existsSync(fisier(r.cale)), r.cale).toBe(true)
    expect(existsSync(join(RADACINA, 'src', 'app', '(en)', '[negasit]'))).toBe(false)
  })

  it('textul WhatsApp al fiecarei pagini e cel din tabelul navigatiei (aceeasi sursa pentru antet si pentru pagina)', () => {
    for (const { pagina } of PAGINI) {
      const rand = TEXTE_WHATSAPP_EN.find((t) => t.cale === pagina.meta.cale)
      expect(rand, pagina.meta.cale).toBeDefined()
      expect(pagina.cta.ref).toBe(rand!.ref)
      expect(pagina.cta.textWhatsapp).toBe(rand!.text)
      expect(pagina.cta.subiectEmail).toBe('3S inquiry [ref:' + rand!.ref + ']')
    }
  })

  it('ancorele cerute de legaturi exista: /about#security, /about#limits, /pricing#pilot, /#how-do-i-start', () => {
    const dupaCale = new Map(PAGINI.map((p) => [p.pagina.meta.cale, ancore(p.pagina)]))
    const cerute = new Set<string>()
    for (const { pagina } of PAGINI) {
      for (const h of legaturi(textModul(MODULE[pagina.cheie]))) {
        const [cale, ancora] = h.split('#')
        if (ancora !== undefined && dupaCale.has(cale === '' ? pagina.meta.cale : cale)) cerute.add((cale === '' ? pagina.meta.cale : cale) + '#' + ancora)
      }
    }
    cerute.add('/#' + home.eroSecundar.href.slice(1))
    // Controlul extragerii: legaturile cunoscute sunt gasite.
    expect([...cerute]).toEqual(expect.arrayContaining(['/about#security', '/about#limits', '/#how-do-i-start']))
    cerute.add('/pricing#pilot')
    for (const c of cerute) {
      const [cale, ancora] = c.split('#')
      expect(dupaCale.get(cale), c).toContain(ancora)
    }
  })
})

describe('ce nu ajunge pe paginile EN nucleu', () => {
  // Tiparele se asambleaza din bucati: fisierul nu poarta pe litere ce vaneaza.
  const INTERZISE: { motiv: string; tipar: RegExp }[] = [
    { motiv: 'RON (decizia 20, 3s.md)', tipar: new RegExp('\\b' + 'R' + 'ON\\b') },
    { motiv: 'pagini de segment (decizia 38)', tipar: new RegExp('/' + 'solutions/') },
    { motiv: 'paginile de functie scoase (decizia 43)', tipar: new RegExp('/features/(' + ['mobile-app', 'client-portal', 'automations'].join('|') + ')') },
    { motiv: 'sectiunile scoase din /platform (decizia 43)', tipar: new RegExp('#(' + ['devices', 'portal', 'rules', 'integrations'].join('|') + ')\\b') },
    { motiv: 'functiile scoase (decizia 43)', tipar: new RegExp('\\b(' + ['single sign-on', 'SSO', 'SAML', 'OIDC', 'webhook', 'API', 'Azure', 'S3-compatible', 'client portal', 'Peppol'].join('|') + ')\\b', 'i') },
    { motiv: 'limba rusa (decizia 8)', tipar: new RegExp('Russ' + 'ian') },
    { motiv: 'adresa de e-mail inainte de P-40', tipar: new RegExp('contact' + '@') },
    { motiv: 'hartia, sub poarta juridica a deciziei 40', tipar: new RegExp('(prepare and scan|paper originals|physical storage|digitize)', 'i') },
    { motiv: 'sectiunea de protectie, pana la P-14', tipar: new RegExp('How is my data ' + 'protected') },
    { motiv: 'criptarea neconfirmata (P-14)', tipar: new RegExp('AES-' + '256') },
    { motiv: 'primirea pe e-mail ca intrare de documente', tipar: new RegExp('\\b(by|via) ' + 'e-?mail', 'i') },
    // Clasele deciziei 43 pe care tiparele de mai sus nu le numesc. Fiecare e o sintagma, nu un cuvant: textele reale
    // spun legitim "by phone", "retention rules", "rules on access", "prepared automatically".
    {
      motiv: 'aplicatiile instalabile (decizia 43)',
      tipar: new RegExp('(' + ['mobile ' + 'app', 'App ' + 'Store', 'Google ' + 'Play', '\\bi' + 'OS\\b', '\\bAndr' + 'oid\\b', 'install\\w* (the |our |an? )?(3S )?' + 'app'].join('|') + ')', 'i'),
    },
    {
      motiv: 'scanarea pe telefon (decizia 43)',
      tipar: new RegExp('(' + ['phone ?' + 'camera', 'with (your|a) ' + '(phone|smartphone|mobile)', 'phone ' + 'scan', 'scan\\w*( \\w+){0,3} (on|from|with|using) (your|a) ' + '(phone|smartphone|mobile)'].join('|') + ')', 'i'),
    },
    {
      motiv: 'regulile automate (decizia 43)',
      tipar: new RegExp('(' + ['\\bautomati' + 'ons?\\b', 'automatic ' + 'rules?', 'automated ' + '(rules?|workflows?|routing|filing)', '\\brules? ' + '(engine|builder)', 'rule-' + 'based'].join('|') + ')', 'i'),
    },
    {
      motiv: 'integrarile cu nume (decizia 43)',
      tipar: new RegExp('(' + ['Google ' + 'Drive', 'Share' + 'Point', 'Drop' + 'box', 'One' + 'Drive', 'Microsoft ' + '365', 'Zap' + 'ier', '\\bSla' + 'ck\\b'].join('|') + ')', 'i'),
    },
    {
      motiv: 'stocarea proprie (decizia 43)',
      tipar: new RegExp('(' + ['own ' + 'storage', 'bring your ' + 'own', 'your own ' + '(cloud|bucket|server|storage)', 'on-' + 'prem(ises)?', 'self-' + 'hosted'].join('|') + ')', 'i'),
    },
    // Decizia 49: asistentul pe WhatsApp si pagina lui (P04) au iesit; WhatsApp ramane canalul de contact cu un om.
    { motiv: 'asistentul pe WhatsApp (decizia 49)', tipar: TIPAR_ASISTENT_WA },
    { motiv: 'pagina P04 scoasa (decizia 49)', tipar: new RegExp('/features/' + 'whats' + 'app', 'i') },
  ]

  function incalcari(text: string): string[] {
    return INTERZISE.filter((i) => i.tipar.test(text)).map((i) => i.motiv)
  }

  it('martorii: fiecare tipar prinde o fraza fabricata, iar o fraza curata nu e acuzata', () => {
    const rau = [
      'from 0 ' + 'R' + 'ON',
      '[x](/' + 'solutions/ngos)',
      '/features/' + 'client-portal',
      '/platform#' + 'portal',
      'single ' + 'sign-on by SAML',
      'Documents in ' + 'Russ' + 'ian',
      'contact' + '@3s.md',
      'we prepare ' + 'and scan paper',
      'How is my data ' + 'protected?',
      'AES-' + '256 at rest',
      'documents arrive ' + 'by e-mail',
      'Install the 3S ' + 'mobile app today.',
      'Scan paper with your ' + 'phone camera.',
      'Automatic ' + 'rules file each document.',
      'Connect Google ' + 'Drive in one click.',
      'Keep files in your own ' + 'storage.',
      'Ask your archive on ' + WA + '. Available in pilot.',
      '[WhatsApp (pilot)](/features/' + 'whats' + 'app)',
    ]
    // Forma veche a tiparelor de mai sus nu se mai poate strecura: fiecare clasa are inca o fraza-martor.
    const rauAltfel: [string, string][] = [
      ['send them ' + 'via email', 'primirea pe e-mail ca intrare de documente'],
      ['Download it from the App ' + 'Store or Google Play.', 'aplicatiile instalabile (decizia 43)'],
      ['Works on i' + 'OS and Andr' + 'oid.', 'aplicatiile instalabile (decizia 43)'],
      ['Scan documents from your ' + 'smartphone.', 'scanarea pe telefon (decizia 43)'],
      ['Set up ' + 'automations for each folder.', 'regulile automate (decizia 43)'],
      ['Connect Share' + 'Point, Drop' + 'box or Microsoft ' + '365.', 'integrarile cu nume (decizia 43)'],
      ['Bring your ' + 'own bucket.', 'stocarea proprie (decizia 43)'],
      ['Can I ask my archive questions on ' + WA + '?', 'asistentul pe WhatsApp (decizia 49)'],
      ['It works in the browser; ' + WA + ' is available in pilot.', 'asistentul pe WhatsApp (decizia 49)'],
      ['The ' + WA + ' assistant for archives', 'asistentul pe WhatsApp (decizia 49)'],
      ['Documents arrive by upload from the browser and, in pilot, on ' + WA + '.', 'asistentul pe WhatsApp (decizia 49)'],
      ['Upload from the browser, ' + WA + ' (pilot).', 'asistentul pe WhatsApp (decizia 49)'],
      ['On ' + WA + ', if the offer includes that channel, in the assistant first message.', 'asistentul pe WhatsApp (decizia 49)'],
      // Formele cu cautare (mutantii criticului feliei 91, verzi pe vocabularul vechi).
      ['Search your archive straight from ' + WA + '.', 'asistentul pe WhatsApp (decizia 49)'],
      ['Find any contract by sending a ' + WA + ' message to 3S.', 'asistentul pe WhatsApp (decizia 49)'],
      ['Look up an invoice on ' + WA + ' in seconds.', 'asistentul pe WhatsApp (decizia 49)'],
      [WA + ' retrieves the document for you.', 'asistentul pe WhatsApp (decizia 49)'],
    ]
    expect(rau).toHaveLength(INTERZISE.length)
    for (const [i, fraza] of rau.entries()) expect(incalcari(fraza), fraza).toContain(INTERZISE[i].motiv)
    for (const [fraza, motiv] of rauAltfel) expect(incalcari(fraza), fraza).toContain(motiv)
    expect(incalcari('Romanian questions are supported; Enterprise from EUR 800, see /about#security.')).toEqual([])
    // Cuvintele-capcana ale textelor reale nu acuza: by phone, retention rules, rules on access, prepared automatically,
    // the e-mail line, your phone number, a hard drive.
    expect(
      incalcari(
        'Write to us on WhatsApp or by phone. Retention rules differ; you have strict rules on access. ' +
          'Each file is prepared automatically for search. Prefer the e-mail line? Your phone number; a hard drive.',
      ),
    ).toEqual([])
    // Martor POZITIV al deciziei 49: contactul cu un om pe WhatsApp, cum il scriu paginile, nu e acuzat.
    for (const fraza of [
      'Message us on ' + WA + ' and tell us about your archive. Please do not send documents or personal data in this first message.',
      'Message 3S on ' + WA + ' or call +373 60 055 599. Tell us which archive you have and where. We reply in English or Romanian.',
      'You can reach 3S on ' + WA + ' at +373 60 055 599 or by phone on the same number.',
      WA + ' is our main channel. On this number you talk to people from our team.',
      'Message us on ' + WA + '. A few lines are enough. Tell us:',
      'Contact 3S: ' + WA + ' and Phone',
      'You can find us on ' + WA + ' at +373 60 055 599.',
    ])
      expect(incalcari(fraza), fraza).toEqual([])
  })

  it('tiparul asistentului e acelasi in cele trei probe care il poarta (vocabularul nu mai poate diverge)', () => {
    const fisiere = ['tests/en-nucleu.test.ts', 'tests/en-produs.test.ts', 'tests/browser/en-nucleu.spec.ts']
    // Randurile care definesc vocabularul si cele doua ramuri care il folosesc; numele canalului e normalizat.
    const definitie = (text: string): string[] =>
      text
        .split('\n')
        .filter((r) => /^const (ASISTENT|PRIMIRE|ACEEASI_PROPOZITIE) = /.test(r) || /^ {4}'.*ASISTENT\.slice\(1, -1\)/.test(r))
        .map((r) => r.trim().replace(/\bNUME_WA\b/g, 'WA'))
    const texte = fisiere.map((f) => readFileSync(join(RADACINA, f), 'utf8'))
    const [prima, ...restul] = texte.map(definitie)
    // Controlul extragerii: trei constante si doua ramuri in fiecare fisier.
    expect(prima).toHaveLength(5)
    for (const [i, d] of restul.entries()) expect(d, fisiere[i + 1]).toEqual(prima)
    // Martor POZITIV: o copie din care lipseste un cuvant al vocabularului e prinsa.
    const mutant = texte[2].replace('|finds|', '|')
    expect(mutant).not.toBe(texte[2])
    expect(definitie(mutant)).not.toEqual(prima)
  })

  // Legatura spre pagina de comparatie de pe start (felia 141, M7): eticheta numeste ce compara pagina, "3S vs Google
  // Drive". E o comparatie, nu o integrare (decizia 43 scoate integrarile cu nume), iar butonul startului spre aceeasi
  // pagina are deja eticheta asta. Iese din text numai legatura intreaga, exacta; orice alta aparitie ramane acuzata.
  const LEGATURA_COMPARATIE = '[3S vs Google ' + 'Drive](/compare/3s-vs-google-and-box)'
  const faraComparatie = (t: string) => t.split(LEGATURA_COMPARATIE).join('')

  it('martorii exceptiei: legatura exacta iese, aceeasi denumire in alta fraza ramane acuzata', () => {
    expect(textModul(home)).toContain(LEGATURA_COMPARATIE)
    expect(incalcari(faraComparatie('See ' + LEGATURA_COMPARATIE + '.'))).toEqual([])
    expect(incalcari(faraComparatie(LEGATURA_COMPARATIE + ' Connect Google ' + 'Drive in one click.'))).toContain('integrarile cu nume (decizia 43)')
  })

  for (const [cheie, m] of Object.entries({ home, platform, pricing, enterprise, contact, about })) {
    it(cheie + ': zero incalcari in tot ce exporta modulul', () => {
      expect(incalcari(faraComparatie(textModul(m)))).toEqual([])
    })
  }

  it('fisierele paginilor (en) nu importa grila romaneasca de preturi', () => {
    for (const r of RUTE_EN_NUCLEU) {
      const fisier = join(RADACINA, 'src', 'app', '(en)', ...(r.cale === '/' ? [] : [r.cale.slice(1)]), 'page.en.tsx')
      expect(readFileSync(fisier, 'utf8'), r.cale).not.toMatch(/from\s+"@\/content\/preturi"/)
      expect(readFileSync(fisier, 'utf8'), r.cale).not.toContain('<form')
    }
    expect(readFileSync(join(RADACINA, 'src', 'content', 'en', 'pricing.ts'), 'utf8')).not.toMatch(/from\s+"@\/content\/preturi"/)
    // Martorul tiparului: un import fabricat al grilei romanesti e prins.
    expect('import { X } from "@/content/' + 'preturi";').toMatch(/from\s+"@\/content\/preturi"/)
  })
})

describe('preturile EN (deciziile 18 si 24)', () => {
  const p = pricing.pagina

  it('grila: Starter 90 / Pro 150 / Business 240 pe luna, anual 75 / 125 / 200 si 900 / 1,500 / 2,400, 5 / 10 / 20 conturi', () => {
    expect(pricing.GRILA).toEqual([
      { plan: 'Starter', conturi: '5', lunar: '90', anualPeLuna: '75', anualPeAn: '900' },
      { plan: 'Pro', conturi: '10', lunar: '150', anualPeLuna: '125', anualPeAn: '1,500' },
      { plan: 'Business', conturi: '20', lunar: '240', anualPeLuna: '200', anualPeAn: '2,400' },
    ])
    const tabel = p.sectiuni.find((s) => s.cheie === 'plans')!.blocuri[0].tabel!
    expect(tabel.randuri.map((r) => r[0])).toEqual(['Starter', 'Pro', 'Business', 'Enterprise'])
    expect(tabel.randuri[3]).toEqual(['Enterprise', 'More than 20', 'Annual contract only', 'From 800', 'From 9,600'])
    // Aritmetica grilei: anual pe an = 12 x anual pe luna = 10 x lunar (doua luni gratuite).
    for (const g of pricing.GRILA) {
      const n = (x: string) => Number(x.replace(',', ''))
      expect(n(g.anualPeAn)).toBe(12 * n(g.anualPeLuna))
      expect(n(g.anualPeAn)).toBe(10 * n(g.lunar))
    }
  })

  it('propozitia TVA a deciziei 24, cuvant cu cuvant, in sectiunea despre TVA', () => {
    expect(pricing.PROPOZITIE_TVA).toBe('Prices exclude VAT; where VAT applies, it is added to the invoice.')
    const tva = textSectiuni(p.sectiuni.filter((s) => s.cheie === 'vat'))
    // Propozitia intreaga, cu majuscula ei si delimitata de inceputul paragrafului sau de un punct: un subsir
    // ("... and exclude VAT; where ...") nu ajunge.
    const intreaga = (text: string) => new RegExp('(^|\\. )' + pricing.PROPOZITIE_TVA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|\\s)', 'm').test(text)
    expect(intreaga(tva)).toBe(true)
    // Martorul: forma contopita a fisei ("Prices are in euros and exclude VAT; ...") nu trece.
    expect(intreaga('No. Prices are in euros and ' + 'exclude VAT; where VAT applies, it is added to the invoice.')).toBe(false)
  })

  it('JSON-LD fara Offer si fara priceCurrency (pana la regimul TVA); martorul cautarii prinde un Offer fabricat', () => {
    const are = (o: unknown, cheie: string, valoare?: string): boolean =>
      Array.isArray(o)
        ? o.some((x) => are(x, cheie, valoare))
        : o !== null && typeof o === 'object'
          ? Object.entries(o).some(([k, v]) => (k === cheie && (valoare === undefined || v === valoare)) || are(v, cheie, valoare))
          : false
    for (const { pagina } of PAGINI) {
      expect(are(pagina.jsonLd, '@type', 'Offer'), pagina.cheie).toBe(false)
      expect(are(pagina.jsonLd, 'priceCurrency'), pagina.cheie).toBe(false)
    }
    expect(are([{ '@type': 'WebPage', offers: { '@type': 'Offer', priceCurrency: 'EUR' } }], '@type', 'Offer')).toBe(true)
  })
})

describe('JSON-LD-ul paginilor si poarta de SEO', () => {
  const textPoarta = readFileSync(join(RADACINA, '.claude', 'scripts', 'porti', 'poarta-seo.py'), 'utf8')
  const multime = (nume: string): Set<string> => {
    const m = new RegExp(nume + ' = \\{([\\s\\S]*?)\\n\\}').exec(textPoarta)
    return new Set([...(m?.[1] ?? '').matchAll(/'([A-Za-z]+)'/g)].map((x) => x[1]))
  }
  const TIPURI = multime('TIPURI_CUNOSCUTE')
  const FIRMA = multime('CAMPURI_FIRMA')

  const noduri = (o: unknown): Record<string, unknown>[] =>
    Array.isArray(o)
      ? o.flatMap(noduri)
      : o !== null && typeof o === 'object'
        ? [o as Record<string, unknown>, ...Object.values(o).flatMap(noduri)]
        : []

  it('controlul citirii portii: vocabularul are WebPage si FAQPage, nu are AboutPage; campurile de firma au telephone', () => {
    expect(TIPURI.has('WebPage')).toBe(true)
    expect(TIPURI.has('FAQPage')).toBe(true)
    expect(TIPURI.has('AboutPage')).toBe(false)
    expect(FIRMA.has('telephone')).toBe(true)
  })

  for (const { cheie, pagina } of PAGINI) {
    it(cheie + ': fiecare @type in vocabularul portii, niciun camp de firma, fara Organization sau WebSite redeclarate', () => {
      const toate = noduri(pagina.jsonLd)
      const tipuri = toate.map((n) => n['@type']).filter((t): t is string => typeof t === 'string')
      expect(tipuri.length).toBeGreaterThan(0)
      expect(tipuri.filter((t) => !TIPURI.has(t))).toEqual([])
      expect(tipuri.filter((t) => t === 'Organization' || t === 'WebSite')).toEqual([])
      expect(toate.flatMap((n) => Object.keys(n)).filter((k) => FIRMA.has(k))).toEqual([])
    })
  }

  it('FAQPage de pe start oglindeste exact intrebarile vizibile (titlu si raspuns fara marcaj)', () => {
    const faq = home.pagina.jsonLd.find((n) => n['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
    const vizibile = new Map(home.pagina.sectiuni.map((s) => [s.titlu, s.blocuri.flatMap((b) => b.paragrafe).map(textSimplu).join(' ')]))
    expect(faq.mainEntity.length).toBe(3)
    for (const q of faq.mainEntity) {
      expect(vizibile.get(q.name), q.name).toBe(q.acceptedAnswer.text)
    }
  })
})

describe('registrul de afirmatii en-nucleu', () => {
  const dupaId = new Map(REGISTRU.map((i) => [i.id, i]))
  // `unde` numeste modulul al carui text il randeaza pagina. /platform si /about compun componentele paginilor RO
  // (decizia 53) din `platforma-componente.ts` si `despre-componente.ts`; `platform.ts` si `about.ts` le dau numai
  // metadata, nodul WebPage si lista de afirmatii citate (`pagina.afirmatii`), care nu se randeaza.
  const MODUL_TEXT: Record<string, string> = { platform: 'platforma-componente', about: 'despre-componente' }
  const CHEIE_PAGINA = new Map(Object.entries(MODUL_TEXT).map(([cheie, modul]) => [modul, cheie]))

  it('fiecare afirmatie citata de o pagina exista in registru, iar `unde` numeste modulul care ii poarta textul', () => {
    let verificate = 0
    for (const { cheie, pagina } of PAGINI) {
      for (const id of pagina.afirmatii) {
        const intrare = dupaId.get(id)
        expect(intrare, cheie + ': ' + id).toBeDefined()
        const unde = intrare!.unde.split(',').map((x) => x.trim())
        expect(unde, cheie + ': ' + id).toContain('src/content/en/' + (MODUL_TEXT[cheie] ?? cheie) + '.ts')
        // Modulul de metadata al unei pagini compuse nu poarta text randat, deci nu e un `unde`.
        if (cheie in MODUL_TEXT) expect(unde, cheie + ': ' + id).not.toContain('src/content/en/' + cheie + '.ts')
        verificate += 1
      }
    }
    expect(verificate).toBeGreaterThan(30)
  })

  it('fiecare intrare e citata de cel putin o pagina pe care o numeste in `unde`, si fiecare `unde` exista pe disc', () => {
    for (const intrare of REGISTRU) {
      const fisiere = intrare.unde.split(',').map((x) => x.trim())
      for (const f of fisiere) expect(existsSync(join(RADACINA, f)), intrare.id + ': ' + f).toBe(true)
      for (const f of fisiere) {
        const modul = f.replace('src/content/en/', '').replace('.ts', '')
        const cheie = CHEIE_PAGINA.get(modul) ?? modul
        expect(MODULE[cheie]?.pagina.afirmatii ?? [], intrare.id + ' in ' + f).toContain(intrare.id)
      }
    }
  })

  it('id-urile sunt ale editiei EN si nu se repeta in restul registrului; confirmarile au sursa si autor', () => {
    const altele = new Set<string>()
    const dosar = join(RADACINA, 'src', 'content', 'afirmatii')
    for (const f of readdirSync(dosar)) {
      if (f === 'en-nucleu.json' || !f.endsWith('.json')) continue
      for (const i of JSON.parse(readFileSync(join(dosar, f), 'utf8')) as Intrare[]) altele.add(i.id)
    }
    expect(altele.size).toBeGreaterThan(50)
    for (const i of REGISTRU) {
      expect(i.id.startsWith('en-'), i.id).toBe(true)
      expect(altele.has(i.id), i.id).toBe(false)
      if (i.stare === 'confirmat') {
        expect(i.sursa ?? '', i.id).not.toBe('')
        expect(i.confirmat_de ?? '', i.id).not.toBe('')
      }
    }
  })

  it('martor POZITIV: o pagina care citeaza un id absent din registru e prinsa de aceeasi verificare', () => {
    const lipsa = ['en-' + 'nu-exista'].filter((id) => !dupaId.has(id))
    expect(lipsa).toHaveLength(1)
  })
})

describe('navigatia EN fara grupul Solutions si fara functiile scoase', () => {
  const en = navigatieEn(CANALE_3S_MD, new Set<string>())
  const cai = multimeaCailor([...RUTE_EN_NUCLEU, ...CHEI_MD.map((c) => ({ cale: caleMd(c, 'en') }))], [caleMd('informatii-legale', 'ro')])

  it('contractul: niciun meniu, nicio coloana si niciun text WhatsApp pentru segmente sau pentru functiile scoase (si P04, decizia 49)', () => {
    expect(en.antet.legaturi.map((l) => l.text)).not.toContain('Solutions')
    expect(en.subsol.coloane.map((c) => c.titlu)).not.toContain('Solutions')
    const produs = en.antet.legaturi.find((l) => l.text === 'Product')!.foaie!.elemente.map((e) => e.text)
    expect(produs).toEqual(['Platform', 'Search with sources', 'Enterprise'])
    const scoase = new RegExp('^/(solutions/|features/(mobile-app|client-portal|automations|whatsapp))')
    expect(TEXTE_WHATSAPP_EN.filter((t) => scoase.test(t.cale))).toEqual([])
    const toateHref = JSON.stringify(en)
    expect(toateHref).not.toMatch(new RegExp('#(portal|rules|devices)"'))
  })

  it('randat cu rutele de azi (nucleu + juridic): antetul si subsolul n-au Solutions, iar Guides fara nicio ruta nu lasa titlul', () => {
    const antet = renderToStaticMarkup(createElement(Antet, { navigatie: en, cai }))
    const subsol = renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai }))
    // Controlul: piesele au randat ce exista (Product, Pricing; coloana Product), deci absentele nu vin dintr-un HTML gol.
    expect(antet).toContain('>Pricing<')
    expect(subsol).toContain('>Product<')
    expect(antet).not.toContain('Solutions')
    expect(subsol).not.toContain('Solutions')
    expect(antet).not.toContain('>Guides<')
    expect(subsol).not.toContain('>Guides<')
  })

  it('martor POZITIV: cu o ruta de ghid in multime, titlul Guides apare (absenta de mai sus vine din filtru, nu din randare)', () => {
    const cuGhid = new Set([...cai, '/guides/records-retention-moldova'])
    const subsol = renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai: cuGhid }))
    expect(subsol).toContain('>Guides<')
  })
})

describe('modulele juridice md EN fara asistentul pe WhatsApp (decizia 49)', () => {
  // Se citeste SURSA modulelor, nu documentul compus: sursa poarta toate ramurile (`daca`, `conditie`), pe cand
  // documentul compus arata numai ramurile unui singur context de masurare. Fiecare sir literal e un text al paginii
  // (paragraf, element, celula, titlu); se trece prin `textSimplu`, ca pe pagina, si se cauta separat, deci tiparul
  // nu poate lipi doua texte vecine. O regenerare dintr-un pachet nealiniat se inroseste aici.
  const DIRECTOR_MD = join(RADACINA, 'src', 'content', 'juridic', 'md')
  const SIR_LITERAL = /"(?:[^"\\\n]|\\.)*"/g

  function textePagina(sursa: string): string[] {
    return [...sursa.matchAll(SIR_LITERAL)].map((m) => textSimplu(JSON.parse(m[0]) as string))
  }

  function gasiriAsistent(sursa: string): string[] {
    return textePagina(sursa).filter((t) => TIPAR_ASISTENT_WA.test(t))
  }

  const fisiereEn = (director: string): string[] => readdirSync(director).filter((f) => f.endsWith('.en.ts')).sort()

  it('controlul: fraza asistentului asamblata la rulare e prinsa, contactul cu un om nu, ghilimelele evadate se citesc', () => {
    const rau = 'You can ask your documents ' + 'questions on ' + WA + ' and get answers.'
    const bun = 'Message us on ' + WA + ' (the "contact" line); people from our team reply.'
    const sursa = '{ paragrafe: [' + JSON.stringify(bun) + ', ' + JSON.stringify(rau) + '] }'
    expect(gasiriAsistent(sursa)).toEqual([rau])
    expect(textePagina(sursa)).toEqual([bun, rau])
  })

  it('preconditia: cele opt module EN din registru, fiecare cu textele lui citite', () => {
    expect(fisiereEn(DIRECTOR_MD)).toEqual(CHEI_MD.map((c) => c + '.en.ts').sort())
    for (const f of fisiereEn(DIRECTOR_MD)) expect(textePagina(readFileSync(join(DIRECTOR_MD, f), 'utf8')).length, f).toBeGreaterThan(20)
  })

  it('zero fraze despre asistentul pe WhatsApp in textele modulelor juridice md EN', () => {
    const gasiri = fisiereEn(DIRECTOR_MD).flatMap((f) => gasiriAsistent(readFileSync(join(DIRECTOR_MD, f), 'utf8')).map((t) => f + ': ' + t))
    expect(gasiri).toEqual([])
  })
})

describe('modulele EN de marketing fara registrul arhivei (decizia 43, termenul de pastrare pe dosar)', () => {
  // Codul platformei nu are un registru al arhivei, iar termenul de pastrare se pune pe DOSAR, prin regula de
  // eliminare, nu pe fiecare document. Fisa P02 a scos ambele formulari, ca fisa /ro. Se citeste SURSA tuturor
  // modulelor din `src/content/en/` (si ale paginilor adaugate dupa), nu numai cele sase nucleu. Spatiul dintre
  // cuvinte poate fi o rupere de rand. Formularile se asambleaza la rulare: fisierul nu le poarta pe litere.
  const DIRECTOR_EN = join(RADACINA, 'src', 'content', 'en')
  const SPATIU = '\\s+'
  const TIPAR_REGISTRU = new RegExp(
    '(' + ['archive', 'register'].join(SPATIU) + '|' + ['retention', 'period', 'for', 'each', 'document'].join(SPATIU) + ')',
    'i',
  )

  function gasiriRegistru(sursa: string): string[] {
    return sursa.split('\n').filter((r, i, rr) => TIPAR_REGISTRU.test(r) || TIPAR_REGISTRU.test(r + '\n' + (rr[i + 1] ?? '')))
  }

  const moduleEn = (): string[] => readdirSync(DIRECTOR_EN).filter((f) => f.endsWith('.ts')).sort()

  it('controlul: formularile asamblate la rulare sunt prinse (si rupte pe doua randuri), forma noua a fisei nu', () => {
    const rau1 = '"3S keeps the ' + 'archive ' + 'register."'
    const rau2 = '"with a retention ' + 'period for each\n    document."'
    const bun =
      '"It recognizes each one and logs who opens it. You can set a retention period for each folder, and it applies to the documents in it."'
    expect(gasiriRegistru(rau1)).toHaveLength(1)
    expect(gasiriRegistru(rau2)).toHaveLength(1)
    expect(gasiriRegistru(bun)).toEqual([])
    expect(gasiriRegistru('"A digital archive with sources; retention rules differ by country."')).toEqual([])
  })

  it('preconditia: directorul are cel putin modulele celor sase pagini nucleu', () => {
    expect(moduleEn()).toEqual(expect.arrayContaining(Object.keys(MODULE).map((c) => c + '.ts')))
  })

  it('zero aparitii ale celor doua formulari in sursa modulelor EN', () => {
    const gasiri = moduleEn().flatMap((f) => gasiriRegistru(readFileSync(join(DIRECTOR_EN, f), 'utf8')).map((r) => f + ': ' + r.trim()))
    expect(gasiri).toEqual([])
  })

  // AUTORIZARE (felia 103, regula comuna a specificatiei de congruenta: probele EN care fixeaza forma veche se rescriu
  // in felia paginii): cazul citea `platform.pagina.capsula` si `.sectiuni`, pe care `/platform` nu le mai randeaza
  // (pagina compune `PaginaPlatforma` din `PLATFORMA_EN`; din `platform.ts` ia numai metadata si nodul WebPage). Pe
  // text mort cazul ramanea verde la orice regresie a frazei servite. Acum citeste campurile servite: subtitlul
  // eroului si intrebarea despre pastrare. `capsula` si `sectiuni` raman in `platform.ts` fiindca tipul comun
  // `PaginaContinut` le cere si probele de forma ale modulelor EN le masoara; nu se randeaza nicaieri. La fel in
  // `about.ts` pentru `/about`, care compune `PaginaSecuritate` din `despre-componente.ts`.
  it('/platform poarta forma noua a fisei P02 in descriere, in eroul servit si in intrebarea servita despre pastrare', () => {
    const p = platform.pagina
    const frazaDosar = 'You can set a retention period for each folder, and it applies to the documents in it.'
    expect(p.meta.descriere).toContain('lets you set a retention period per folder')
    expect(PLATFORMA_EN.erou.subtitlu).toContain(frazaDosar)
    const intrebare = (PLATFORMA_EN.intrebari?.intrebari ?? []).find((q) => q.intrebare === 'Can I set how long documents are kept?')
    expect(intrebare?.raspuns.startsWith('Yes. ' + frazaDosar)).toBe(true)
    const pagina = p.jsonLd.find((n) => n['@type'] === 'WebPage') as { description?: string } | undefined
    expect(pagina?.description).toBe(p.meta.descriere)
  })
})
