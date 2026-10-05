import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ButonCanal from '../src/app/(en)/guides/_referinta/ButonCanal'
import { grafReferinta } from '../src/app/(en)/guides/_referinta/date-structurate'
import PaginaG3 from '../src/app/(en)/compare/3s-vs-google-and-box/page.en'
import PaginaG1 from '../src/app/(en)/guides/e-invoice-archiving-eu/page.en'
import PaginaG2 from '../src/app/(en)/guides/records-retention-moldova/page.en'
import { EFACTURARE_RO, grafIntrebari, type ContinutEfacturare } from '../src/components/efacturare/SectiuniEfacturare'
import Antet from '../src/components/global/Antet'
import Subsol from '../src/components/global/Subsol'
import { abateriMetadata } from '../src/components/seo/metadata'
import { caleMd, CHEI_MD } from '../src/content/juridic/md/registru'
import { numarCuvinte } from '../src/content/model/tipuri'
import { multimeaCailor } from '../src/content/navigatie'
import { TEXTE_WHATSAPP_EN, navigatieEn } from '../src/content/navigatie-en'
import type { PaginaReferinta } from '../src/content/en/referinta-comun'
import { RUTE_EN_NUCLEU } from '../src/content/rute-en-nucleu'
import { RUTE_EN_PRODUS } from '../src/content/rute-en-produs'
import { RUTE_EN_REFERINTA } from '../src/content/rute-en-referinta'
import { configurareCanale, type Canale } from '../src/lib/canale-mediu'
import * as comparatie from '../src/content/en/compare-3s-vs-google-and-box'
import * as efacturi from '../src/content/en/guides-e-invoice-archiving-eu'
import * as moldova from '../src/content/en/guides-records-retention-moldova'

/**
 * Paginile EN de referinta dupa felia editie-referinta (decizia 53): G1 `/guides/e-invoice-archiving-eu`, G2
 * `/guides/records-retention-moldova`, G3 `/compare/3s-vs-google-and-box` compun componentele perechilor RO
 * (`/e-facturare`, `/instrumente/termene-pastrare`, `/comparatie-drive`), cu textul din modulele EN. Proba masoara pe
 * sursa si pe paginile randate pe server: forma modulelor si legatura lor cu manifestul de rute, cu tabelul textelor
 * WhatsApp al navigatiei si cu registrul de afirmatii; ce nu are voie sa ajunga pe aceste pagini (asistentul pe
 * WhatsApp, decizia 49, pe tot textul; clasele deciziei 43 si certificarile pe afirmatiile 3S; RON; resturile
 * fiselor); raspunsul paginii (G-AI-02) in primele 400 de cuvinte; datele structurate.
 *
 * AUTORIZAREA RESCRIERII (specificatia de congruenta, 5.0): proba feliei en-referinta fixa forma veche (scheletul
 * `PaginaReferinta` peste `CorpPagina`: capsula, sectiunile-intrebare, legatura de semnalare, randul de verificare,
 * tabelele comparatiei cu trei instrumente). Forma aceea a iesit odata cu decizia 53, deci cazurile ei s-au rescris pe
 * forma noua. Cazurile despre FAPTE au ramas: zero `<form`, zero RON, textul WhatsApp cu `ref`, decizia 49 pe tot
 * textul, decizia 43 si certificarile pe afirmatiile 3S, registrul, navigatia. Neschimbate, cu acelasi corp: resturile
 * fisei si moneda, paritatea si martorii asistentului, cazurile registrului (inclusiv prefixul, unicitatea fata de
 * celelalte registre si `confirmat_de`, plus martorul id-ului absent), navigatia. Rescrise pe forma noua, cu ACELEASI
 * tipare (`DECIZIA_43`, `CERTIFICARI`) dar cu alti martori de extragere, fiindca extragerea citea campurile formei
 * vechi (`sectiuni`, `capsula`, randul de certificari al tabelului): decizia 43 si certificarile. Randul de certificari
 * nu mai exista pe G3; certificarile Google stau in sursele cardului, cu cazul lor.
 * Paginile servite (200, `lang="en"`, noindex, harta de site, llms.txt, grupul Guides) le masoara
 * `tests/browser/en-referinta.spec.ts`, pe copia 3s.md; forma fata de perechea RO, `tests/browser/congruenta.spec.ts`.
 *
 * Fixturile cazurilor pozitive se asambleaza la rulare, din bucati.
 */

/**
 * Asistentul pe WhatsApp (decizia 49), asamblat din bucati: a patra copie a vocabularului din `tests/en-nucleu.test.ts`
 * (celelalte doua sunt in `tests/en-produs.test.ts` si `tests/browser/en-nucleu.spec.ts`). Proba de paritate de mai jos
 * citeste vocabularul din sursa lui `tests/en-nucleu.test.ts` si cere egalitate, deci copia nu poate diverge.
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

type Modul = { pagina: PaginaReferinta }
const MODULE: Record<string, Modul & Record<string, unknown>> = {
  'guides-e-invoice-archiving-eu': efacturi,
  'guides-records-retention-moldova': moldova,
  'compare-3s-vs-google-and-box': comparatie,
}

const RADACINA = join(__dirname, '..')
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as { CANALE_JSON: unknown }
const CANALE_3S_MD = configurareCanale(JSON.stringify(PROFIL.CANALE_JSON), '')

type Intrare = { id: string; text: string; unde: string; stare: string; sursa?: string; confirmat_de?: string }
const DOSAR_REGISTRU = join(RADACINA, 'src', 'content', 'afirmatii')
const REGISTRU = JSON.parse(readFileSync(join(DOSAR_REGISTRU, 'en-referinta.json'), 'utf8')) as Intrare[]
const TOATE_INTRARILE = new Map<string, Intrare>()
for (const f of readdirSync(DOSAR_REGISTRU).filter((x) => x.endsWith('.json'))) {
  for (const i of JSON.parse(readFileSync(join(DOSAR_REGISTRU, f), 'utf8')) as Intrare[]) TOATE_INTRARILE.set(i.id, i)
}

/** Paginile, cu componenta lor, titlul eroului si primul paragraf din <main> (subtitlul eroului). */
const PAGINI: { cheie: string; pagina: PaginaReferinta; Componenta: ComponentType; titluErou: string; primulParagraf: string }[] = [
  { cheie: 'guides-e-invoice-archiving-eu', pagina: efacturi.pagina, Componenta: PaginaG1, titluErou: efacturi.EFACTURARE_EN.erou.titlu, primulParagraf: efacturi.EFACTURARE_EN.erou.subtitlu },
  { cheie: 'guides-records-retention-moldova', pagina: moldova.pagina, Componenta: PaginaG2, titluErou: moldova.EROU_EN.titlu, primulParagraf: moldova.EROU_EN.subtitlu },
  { cheie: 'compare-3s-vs-google-and-box', pagina: comparatie.pagina, Componenta: PaginaG3, titluErou: comparatie.EROU_EN.titlu, primulParagraf: comparatie.EROU_EN.subtitlu },
]

const randeaza = (C: ComponentType): string => renderToStaticMarkup(createElement(C))

/** Textul din <main> al unui HTML randat: fara script si style, cu entitatile de baza decodate, spatii normalizate. */
function textMain(html: string): string {
  const main = html.slice(html.indexOf('<main'), html.lastIndexOf('</main>'))
  return main
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Propozitiile unui text care vorbesc despre 3S (numele marcii sau "we"/"us"/"you can"). */
function propozitii3S(text: string): string[] {
  return text.split(/(?<=[.?!])\s+/).filter((p) => /\b(3S|we|us|you can)\b/.test(p))
}

/**
 * Afirmatiile 3S ale fiecarei pagini, pe contractele componentelor: campurile care descriu ce face 3S (intregi) si
 * propozitiile despre 3S din restul textului vizibil. Celulele si notele despre Google, tabelul pietelor si jurnalul
 * nu intra: acolo numele produselor si ale retelelor sunt ale tertilor si ale legii.
 */
function afirmatii3S(cheie: string): string[] {
  if (cheie === 'guides-e-invoice-archiving-eu') {
    const c: ContinutEfacturare = efacturi.EFACTURARE_EN
    return [
      ...propozitii3S(c.erou.subtitlu),
      ...c.macheta.canale,
      ...c.macheta.insigne,
      ...propozitii3S(c.fraza),
      c.mandate.batai[1],
      c.emiterea.rezolvare,
      c.emiterea.legatura.text,
      c.rigla.nota,
      c.casa.titlu,
      c.casa.text,
      ...c.casa.pasi.flatMap((p) => [p.titlu, p.text]),
      c.standarde.titlu,
      c.standarde.text,
      ...c.intrebari.intrebari.flatMap((q) => propozitii3S(q.raspuns)),
      ...propozitii3S(efacturi.CTA_FINAL_EN.subtitlu),
    ]
  }
  if (cheie === 'guides-records-retention-moldova') {
    return [...propozitii3S(moldova.EROU_EN.subtitlu), ...moldova.IESIRI_EN.map((i) => i.text), ...propozitii3S(moldova.PANOU_EN.nota)]
  }
  return [
    ...propozitii3S(comparatie.EROU_EN.subtitlu),
    ...comparatie.DIVIZAT_EN.dreapta.elemente,
    comparatie.DIVIZAT_EN.dreapta.titlu,
    ...comparatie.TABEL_EN.randuri.map((r) => r.functie),
    comparatie.CUTIE_CTA_EN.titlu,
    comparatie.CUTIE_CTA_EN.text,
  ]
}

/** Clasele deciziei 43 (aceleasi tipare ca in `tests/en-nucleu.test.ts`), asamblate din bucati. */
const DECIZIA_43: { motiv: string; tipar: RegExp }[] = [
  { motiv: 'paginile de functie scoase', tipar: new RegExp('/features/(' + ['mobile-app', 'client-portal', 'automations'].join('|') + ')') },
  { motiv: 'sectiunile scoase din /platform', tipar: new RegExp('#(' + ['devices', 'portal', 'rules', 'integrations'].join('|') + ')\\b') },
  { motiv: 'functiile scoase', tipar: new RegExp('\\b(' + ['single sign-on', 'SSO', 'SAML', 'OIDC', 'webhook', 'API', 'Azure', 'S3-compatible', 'client portal', 'Peppol'].join('|') + ')\\b', 'i') },
  { motiv: 'primirea pe e-mail ca intrare de documente', tipar: new RegExp('\\b(by|via) ' + 'e-?mail', 'i') },
  {
    motiv: 'aplicatiile instalabile',
    tipar: new RegExp('(' + ['mobile ' + 'app', 'App ' + 'Store', 'Google ' + 'Play', '\\bi' + 'OS\\b', '\\bAndr' + 'oid\\b', 'install\\w* (the |our |an? )?(3S )?' + 'app'].join('|') + ')', 'i'),
  },
  {
    motiv: 'scanarea pe telefon',
    tipar: new RegExp('(' + ['phone ?' + 'camera', 'with (your|a) ' + '(phone|smartphone|mobile)', 'phone ' + 'scan', 'scan\\w*( \\w+){0,3} (on|from|with|using) (your|a) ' + '(phone|smartphone|mobile)'].join('|') + ')', 'i'),
  },
  {
    motiv: 'regulile automate',
    tipar: new RegExp('(' + ['\\bautomati' + 'ons?\\b', 'automatic ' + 'rules?', 'automated ' + '(rules?|workflows?|routing|filing)', '\\brules? ' + '(engine|builder)', 'rule-' + 'based'].join('|') + ')', 'i'),
  },
  {
    motiv: 'integrarile cu nume',
    tipar: new RegExp('(' + ['Google ' + 'Drive', 'Share' + 'Point', 'Drop' + 'box', 'One' + 'Drive', 'Microsoft ' + '365', 'Zap' + 'ier', '\\bSla' + 'ck\\b'].join('|') + ')', 'i'),
  },
  {
    motiv: 'stocarea proprie',
    tipar: new RegExp('(' + ['own ' + 'storage', 'bring your ' + 'own', 'your own ' + '(cloud|bucket|server|storage)', 'on-' + 'prem(ises)?', 'self-' + 'hosted'].join('|') + ')', 'i'),
  },
]

function incalcari43(text: string): string[] {
  return DECIZIA_43.filter((i) => i.tipar.test(text)).map((i) => i.motiv)
}

/** Certificarile, numite larg: orice standard sau atestare pe care o pagina le-ar putea atribui lui 3S. */
const CERTIFICARI = new RegExp(
  '\\b(' + ['IS' + 'O', 'IE' + 'C', 'SO' + 'C ?[123]', 'HIPA' + 'A', 'FedRAM' + 'P', 'PCI' + ' DSS', 'IT' + 'AR', 'ISM' + 'AP', 'GxP', 'GDPR ' + 'compliant', 'certified'].join('|') + ')\\b',
  'i',
)

describe('modulele si paginile EN de referinta', () => {
  it('preconditia: trei module, cu cheile manifestului, in ordinea lui', () => {
    expect(Object.keys(MODULE)).toEqual(RUTE_EN_REFERINTA.map((r) => r.cheie))
    expect(PAGINI.map((p) => p.cheie)).toEqual(RUTE_EN_REFERINTA.map((r) => r.cheie))
    expect(RUTE_EN_REFERINTA.map((r) => r.cale)).toEqual(['/guides/e-invoice-archiving-eu', '/guides/records-retention-moldova', '/compare/3s-vs-google-and-box'])
  })

  it('manifestul: editia en, in harta, cheia = cheia modulului, calea = calea modulului; metadata in pragurile portii de SEO', () => {
    for (const r of RUTE_EN_REFERINTA) {
      const m = MODULE[r.cheie]
      expect(m, r.cale).toBeDefined()
      expect(r.editie).toBe('en')
      expect(r.inHarta).toBe(true)
      expect(m.pagina.meta.cale).toBe(r.cale)
      expect(m.pagina.cheie).toBe(r.cheie)
      expect(abateriMetadata(m.pagina.meta), r.cale).toEqual([])
    }
  })

  it('fiecare pagina are fisierul ei sub (en) si importa DIRECT modulul ei (conditia portii de registru); fara formular', () => {
    for (const r of RUTE_EN_REFERINTA) {
      const fisier = join(RADACINA, 'src', 'app', '(en)', ...r.cale.slice(1).split('/'), 'page.en.tsx')
      expect(existsSync(fisier), fisier).toBe(true)
      expect(readFileSync(fisier, 'utf8')).toContain('from "@/content/en/' + r.cheie + '"')
      expect(readFileSync(fisier, 'utf8')).not.toContain('<' + 'form')
    }
  })

  it('textul WhatsApp si ref-ul fiecarei pagini sunt cele din tabelul navigatiei', () => {
    for (const { pagina } of PAGINI) {
      const intrare = TEXTE_WHATSAPP_EN.find((t) => t.cale === pagina.meta.cale)
      expect(intrare, pagina.meta.cale).toBeDefined()
      expect(pagina.cta.textWhatsapp).toBe(intrare!.text)
      expect(pagina.cta.ref).toBe(intrare!.ref)
      expect(pagina.cta.textWhatsapp.split('[ref:' + pagina.cta.ref + ']')).toHaveLength(2)
    }
  })

  it('H1-ul paginii e titlul eroului; primul paragraf are numarul de cuvinte masurat pe fisa (59, 52, 28)', () => {
    for (const p of PAGINI) expect(p.pagina.h1, p.cheie).toBe(p.titluErou)
    expect(PAGINI.map((p) => numarCuvinte(p.primulParagraf))).toEqual([59, 52, 28])
  })
})

describe('paginile randate pe server', () => {
  for (const p of PAGINI) {
    it(p.cheie + ': un H1, egal cu cel din modul; primul <p> din <main> e subtitlul eroului; zero formulare, zero mailto, zero RON', () => {
      const html = randeaza(p.Componenta)
      const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1])
      expect(h1).toEqual([p.pagina.h1])
      const main = html.slice(html.indexOf('<main'))
      const primul = /<p\b[^>]*>([\s\S]*?)<\/p>/.exec(main)?.[1] ?? ''
      expect(primul.replace(/&#x27;/g, "'")).toBe(p.primulParagraf)
      expect(html).not.toMatch(new RegExp('<' + 'form\\b'))
      expect(html).not.toContain('mailto:')
      expect(html).not.toMatch(new RegExp('\\b' + 'R' + 'ON\\b'))
    })
  }

  it('G-AI-02 pe pagina randata: H1-ul si entitatile declarate in config/seo/en-referinta.json stau in primele 400 de cuvinte din <main>', () => {
    const decl = JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'en-referinta.json'), 'utf8')) as {
      raspuns_autonom: Record<string, { intrebare: string; entitati: string[] }>
    }
    expect(Object.keys(decl.raspuns_autonom)).toEqual(RUTE_EN_REFERINTA.map((r) => r.cale))
    const lipsa: string[] = []
    for (const p of PAGINI) {
      const fereastra = textMain(randeaza(p.Componenta)).split(' ').slice(0, 400).join(' ')
      // Controlul extragerii: H1-ul e in fereastra (textul s-a citit).
      expect(fereastra, p.cheie).toContain(p.pagina.h1)
      for (const e of decl.raspuns_autonom[p.pagina.meta.cale].entitati) {
        if (!fereastra.toLowerCase().includes(e.toLowerCase())) lipsa.push(p.pagina.meta.cale + ': ' + e)
      }
    }
    expect(lipsa).toEqual([])
  })

  it('butonul de canal: cu WhatsApp pe domeniu duce la wa.me cu textul paginii si clasele butonului; fara WhatsApp nu se randeaza', () => {
    const cu: Canale = { formulare: false, whatsapp: '37300000001', telefon: '', email: '', emailSecuritate: 'security@example.test' }
    const html = renderToStaticMarkup(
      createElement(ButonCanal, { cta: efacturi.pagina.cta, text: 'Message us', varianta: 'plin', marime: 'plat', sageata: true, canale: cu }),
    )
    const href = /href="([^"]+)"/.exec(html)?.[1] ?? ''
    expect(href.startsWith('https://wa.me/37300000001?text=')).toBe(true)
    expect(new URL(href.split('&amp;').join('&')).searchParams.get('text')).toBe(efacturi.pagina.cta.textWhatsapp)
    expect(html).toContain('data-canal="whatsapp"')
    // Aceleasi clase ca butonul RO inlocuit (plin, plat, cu sageata); vitest numeste clasele de modul `_nume_hash`.
    expect(html).toMatch(/<a [^>]*class="_buton_\w+ _plin_\w+ _plat_\w+"/)
    expect(html).toMatch(/class="lucide lucide-arrow-right _sageata_\w+"/)
    const fara = renderToStaticMarkup(
      createElement(ButonCanal, { cta: efacturi.pagina.cta, text: 'Message us', varianta: 'plin', marime: 'plat', sageata: true, canale: { ...cu, whatsapp: '' } }),
    )
    expect(fara).toBe('')
    // Pe canalele profilului 3s.md butonul duce la numarul din profil.
    expect(CANALE_3S_MD.whatsapp).not.toBe('')
    const md = renderToStaticMarkup(
      createElement(ButonCanal, { cta: moldova.pagina.cta, text: 'Message us', varianta: 'alb-pe-inchis', marime: 'mare', sageata: true, canale: CANALE_3S_MD }),
    )
    expect(md).toContain('https://wa.me/' + CANALE_3S_MD.whatsapp + '?text=')
  })
})

describe('ce nu ajunge pe paginile EN de referinta', () => {
  const RESTURI_FISA = ['Notes ' + '(not published)', 'END OF ' + 'PAGE COPY', 'JSON-LD ' + '(proposed)', 'Page ' + 'assets', 'archive ' + 'register', 'retention period for ' + 'each document']
  const MONEDA = new RegExp('\\b' + 'R' + 'ON\\b')
  const textModul = (m: object) => JSON.stringify(m)

  it('martorii: resturile fisei, moneda si registrul arhivei sunt prinse pe un text fabricat; un text curat nu', () => {
    const rau = RESTURI_FISA.map((r) => 'x ' + r + ' y').join('\n') + ' 12 ' + 'R' + 'ON'
    expect(RESTURI_FISA.filter((r) => !rau.includes(r))).toEqual([])
    expect(MONEDA.test(rau)).toBe(true)
    expect(MONEDA.test('From EUR 90, ENVIRONMENT, PRONTO')).toBe(false)
  })

  for (const cheie of Object.keys(MODULE)) {
    it(cheie + ': zero resturi ale fisei, zero RON, zero registrul arhivei (modulul si fisierul paginii)', () => {
      const sursa = readFileSync(join(RADACINA, 'src', 'content', 'en', cheie + '.ts'), 'utf8')
      const r = RUTE_EN_REFERINTA.find((x) => x.cheie === cheie)!
      const paginaTsx = readFileSync(join(RADACINA, 'src', 'app', '(en)', ...r.cale.slice(1).split('/'), 'page.en.tsx'), 'utf8')
      for (const text of [sursa, paginaTsx, textModul(MODULE[cheie])]) {
        expect(RESTURI_FISA.filter((x) => text.includes(x))).toEqual([])
        expect(MONEDA.test(text)).toBe(false)
      }
    })
  }

  it('controlul paritatii: vocabularul asistentului e acelasi cu cel din tests/en-nucleu.test.ts', () => {
    const definitie = (text: string): string[] =>
      text
        .split('\n')
        .filter((r) => /^const (ASISTENT|PRIMIRE|ACEEASI_PROPOZITIE) = /.test(r) || /^ {4}'.*ASISTENT\.slice\(1, -1\)/.test(r))
        .map((r) => r.trim().replace(/\bNUME_WA\b/g, 'WA'))
    const sursa = readFileSync(join(RADACINA, 'tests', 'en-nucleu.test.ts'), 'utf8')
    const aici = readFileSync(join(RADACINA, 'tests', 'en-referinta.test.ts'), 'utf8')
    const referinta = definitie(sursa)
    // Controlul extragerii: trei constante si doua ramuri.
    expect(referinta).toHaveLength(5)
    expect(definitie(aici)).toEqual(referinta)
    // Martor POZITIV: o copie divergenta (un cuvant scos din vocabular) e prinsa.
    const divergenta = aici.replace('|finds|', '|')
    expect(divergenta).not.toBe(aici)
    expect(definitie(divergenta)).not.toEqual(referinta)
  })

  it('martorii asistentului: fraza asamblata la rulare e prinsa, contactul cu un om nu', () => {
    expect(TIPAR_ASISTENT_WA.test('Ask your archive on ' + WA + '. Available in pilot.')).toBe(true)
    expect(TIPAR_ASISTENT_WA.test('You can reach 3S on ' + WA + ' at +373 60 055 599.')).toBe(false)
    expect(TIPAR_ASISTENT_WA.test('Upload your invoices on ' + WA + '.')).toBe(true)
    expect(TIPAR_ASISTENT_WA.test('Message us on ' + WA + '. A person replies, in English or Romanian.')).toBe(false)
  })

  for (const cheie of Object.keys(MODULE)) {
    it(cheie + ': zero fraze despre asistentul pe WhatsApp in tot ce exporta modulul (decizia 49)', () => {
      expect(textModul(MODULE[cheie]).match(TIPAR_ASISTENT_WA)).toBeNull()
    })
  }

  it('martorii deciziei 43: fiecare clasa prinde o fraza 3S fabricata; un camp 3S fabricat cu o functie scoasa e prins de extragere', () => {
    const rau = [
      '/features/' + 'client-portal',
      '/platform#' + 'portal',
      '3S supports single ' + 'sign-on by SAML.',
      '3S receives invoices ' + 'by e-mail.',
      'Install the 3S ' + 'mobile app.',
      'Scan paper with your ' + 'phone camera.',
      'Automatic ' + 'rules file each document.',
      '3S connects to Google ' + 'Drive.',
      'Keep files in your own ' + 'storage.',
    ]
    expect(rau).toHaveLength(DECIZIA_43.length)
    for (const [i, fraza] of rau.entries()) expect(incalcari43(fraza), fraza).toContain(DECIZIA_43[i].motiv)
    // Martor POZITIV pe extragere: o propozitie 3S cu o functie scoasa, intr-un text, ajunge in afirmatii si e prinsa.
    expect(propozitii3S('Belgium uses a network. 3S receives your invoices over ' + 'Peppol.').flatMap(incalcari43)).toContain('functiile scoase')
    // Martor NEGATIV: Peppol ca retea a Belgiei (mandatele, tabelul) nu e afirmatie 3S, deci nu e citit.
    expect(efacturi.EFACTURARE_EN.mandate.batai[0]).toContain('Peppol')
    expect(afirmatii3S('guides-e-invoice-archiving-eu').join(' ')).not.toContain(efacturi.EFACTURARE_EN.mandate.batai[0].slice(0, 40))
  })

  for (const cheie of Object.keys(MODULE)) {
    it(cheie + ': zero clase ale deciziei 43 si zero certificari in afirmatiile 3S', () => {
      const texte = afirmatii3S(cheie)
      // Controlul extragerii: fiecare pagina are afirmatii 3S citite.
      expect(texte.length).toBeGreaterThan(0)
      expect(texte.flatMap(incalcari43)).toEqual([])
      expect(texte.filter((t) => CERTIFICARI.test(t))).toEqual([])
    })
  }

  it('certificarile de pe G3 sunt numai ale lui Google, in grupul de surse al cardului (exceptia portii de afirmatii); martorul tiparului', () => {
    // Controlul: tiparul citeste certificarile numite in etichetele surselor Google (doua).
    const etichete = comparatie.SURSE_CARD_EN.flatMap((g) => g.surse.map((s) => s.eticheta))
    expect(etichete.filter((e) => CERTIFICARI.test(e))).toHaveLength(2)
    expect(etichete.filter((e) => CERTIFICARI.test(e)).every((e) => e.includes('Google Cloud'))).toBe(true)
    // Martor POZITIV: o afirmatie 3S fabricata care numeste o certificare e prinsa.
    expect(CERTIFICARI.test('3S is ' + 'SO' + 'C 2 Type II and ' + 'IS' + 'O 27001 certified.')).toBe(true)
    // Cardul: partea stanga numeste nevoia de certificari, fara sa numeasca vreuna.
    expect(comparatie.DIVIZAT_EN.stanga.elemente.filter((e) => CERTIFICARI.test(e))).toEqual([])
  })

  it('gazduirea 3S e formula deciziei 42, cuvant cu cuvant, pe G1; macheta numeste Frankfurt', () => {
    expect(efacturi.EFACTURARE_EN.emiterea.rezolvare).toContain('Files are stored in the EU, with Frankfurt as the primary region.')
    expect(efacturi.EFACTURARE_EN.macheta.insigne).toContain('Frankfurt')
  })
})

describe('registrul de afirmatii en-referinta', () => {
  it('fiecare afirmatie citata de o pagina exista in registru; cele din en-referinta.json numesc modulul paginii in `unde`', () => {
    let verificate = 0
    for (const { cheie, pagina } of PAGINI) {
      for (const id of pagina.afirmatii) {
        const intrare = TOATE_INTRARILE.get(id)
        expect(intrare, cheie + ': ' + id).toBeDefined()
        if (id.startsWith('en-referinta-')) {
          expect(intrare!.unde.split(',').map((x) => x.trim()), cheie + ': ' + id).toContain('src/content/en/' + cheie + '.ts')
        }
        verificate += 1
      }
    }
    expect(verificate).toBeGreaterThan(40)
  })

  it('fiecare intrare e citata de fiecare pagina pe care o numeste in `unde`, iar fiecare `unde` exista pe disc', () => {
    for (const intrare of REGISTRU) {
      for (const f of intrare.unde.split(',').map((x) => x.trim())) {
        expect(existsSync(join(RADACINA, f)), intrare.id + ': ' + f).toBe(true)
        const cheie = f.replace('src/content/en/', '').replace('.ts', '')
        expect(MODULE[cheie]?.pagina.afirmatii ?? [], intrare.id + ' in ' + f).toContain(intrare.id)
      }
    }
  })

  it('id-urile poarta prefixul en-referinta- si nu se repeta in restul registrului; confirmarile au sursa si autor', () => {
    const altele = new Set<string>()
    for (const f of readdirSync(DOSAR_REGISTRU)) {
      if (f === 'en-referinta.json' || !f.endsWith('.json')) continue
      for (const i of JSON.parse(readFileSync(join(DOSAR_REGISTRU, f), 'utf8')) as Intrare[]) altele.add(i.id)
    }
    expect(altele.size).toBeGreaterThan(50)
    for (const i of REGISTRU) {
      expect(i.id.startsWith('en-referinta-'), i.id).toBe(true)
      expect(altele.has(i.id), i.id).toBe(false)
      if (i.stare === 'confirmat') {
        expect(i.sursa ?? '', i.id).not.toBe('')
        expect(i.confirmat_de ?? '', i.id).not.toBe('')
      }
    }
  })

  it('celulele 3S ale comparatiei trimit la intrari existente in registru', () => {
    for (const r of comparatie.TABEL_EN.randuri) expect(TOATE_INTRARILE.has(r.noi.afirmatie), r.functie).toBe(true)
    // Martor POZITIV: un id absent e prins de aceeasi verificare.
    expect(TOATE_INTRARILE.has('en-referinta-' + 'nu-exista')).toBe(false)
  })

  it('faptele de lege si ale furnizorilor raman neconfirmate pana la reverificarea dinaintea portii B', () => {
    const deVerificat = REGISTRU.filter((i) => /^en-referinta-(termene-|efacturare-arhivare-|comparatii-marcaje-)/.test(i.id))
    expect(deVerificat.length).toBeGreaterThanOrEqual(20)
    expect(deVerificat.filter((i) => i.stare !== 'neconfirmat').map((i) => i.id)).toEqual([])
  })

  it('martor POZITIV: o pagina care citeaza un id absent din registru e prinsa de aceeasi verificare', () => {
    expect(['en-referinta-' + 'nu-exista'].filter((id) => !TOATE_INTRARILE.has(id))).toHaveLength(1)
  })
})

describe('datele structurate', () => {
  it('Article si WebPage pe fiecare pagina, legate prin @id, cu autorul organizatiei; Article poarta H1-ul, descrierea si datele', () => {
    for (const { cheie, pagina } of PAGINI) {
      const graf = grafReferinta(pagina, 'https://exemplu.test')
      expect(graf['@graph'].map((n) => n['@type']), cheie).toEqual(['Article', 'WebPage'])
      const [articol, webPage] = graf['@graph'] as Record<string, unknown>[]
      expect(articol.headline).toBe(pagina.h1)
      expect(articol.description).toBe(pagina.meta.descriere)
      expect([articol.datePublished, articol.dateModified]).toEqual(['2026-09-30', '2026-09-30'])
      expect(articol.author).toEqual({ '@id': 'https://exemplu.test/#organizatie' })
      expect(articol.mainEntityOfPage).toEqual({ '@id': webPage['@id'] })
      expect((articol.citation as string[]).length, cheie).toBeGreaterThan(2)
    }
  })

  it('FAQPage pe G1 oglindeste exact intrebarile vizibile (aceleasi ca in acordeon), in engleza, pe calea paginii; G2 si G3 n-au intrebari', () => {
    const graf = grafIntrebari(efacturi.EFACTURARE_EN, 'https://exemplu.test')
    const faq = graf['@graph'][0]
    expect(faq.inLanguage).toBe('en')
    expect(faq['@id']).toBe('https://exemplu.test/guides/e-invoice-archiving-eu#intrebari')
    expect(faq.mainEntity.map((q) => q.name)).toEqual(efacturi.EFACTURARE_EN.intrebari.intrebari.map((q) => q.intrebare))
    const html = randeaza(PaginaG1)
    for (const q of efacturi.EFACTURARE_EN.intrebari.intrebari) expect(html.replace(/&#x27;/g, "'"), q.intrebare).toContain(q.intrebare)
    for (const C of [PaginaG2, PaginaG3]) expect(randeaza(C)).not.toContain('FAQPage')
    // Martorul implicitului: pe RO, aceeasi functie da intrebarile romanesti pe /e-facturare.
    expect(grafIntrebari(EFACTURARE_RO, 'https://exemplu.test')['@graph'][0]['@id']).toBe('https://exemplu.test/e-facturare#intrebari')
  })

  it('JSON-LD numai cu tipurile din vocabularul portii de SEO, fara campuri de firma (controlul: vocabularul se citeste)', () => {
    const textPoarta = readFileSync(join(RADACINA, '.claude', 'scripts', 'porti', 'poarta-seo.py'), 'utf8')
    const multime = (nume: string): Set<string> => {
      const m = new RegExp(nume + ' = \\{([\\s\\S]*?)\\n\\}').exec(textPoarta)
      return new Set([...(m?.[1] ?? '').matchAll(/'([A-Za-z]+)'/g)].map((x) => x[1]))
    }
    const TIPURI = multime('TIPURI_CUNOSCUTE')
    const FIRMA = multime('CAMPURI_FIRMA')
    expect(TIPURI.has('Article')).toBe(true)
    expect(TIPURI.has('Country')).toBe(true)
    expect(TIPURI.has('CreativeWork')).toBe(false)
    const noduri = (o: unknown): Record<string, unknown>[] =>
      Array.isArray(o) ? o.flatMap(noduri) : o !== null && typeof o === 'object' ? [o as Record<string, unknown>, ...Object.values(o).flatMap(noduri)] : []
    for (const { cheie, pagina } of PAGINI) {
      const toate = [...noduri(grafReferinta(pagina, 'https://exemplu.test')), ...(cheie === 'guides-e-invoice-archiving-eu' ? noduri(grafIntrebari(efacturi.EFACTURARE_EN, 'https://exemplu.test')) : [])]
      const tipuri = toate.map((n) => n['@type']).filter((t): t is string => typeof t === 'string')
      expect(tipuri.filter((t) => !TIPURI.has(t)), cheie).toEqual([])
      expect(tipuri.filter((t) => ['Organization', 'WebSite', 'SoftwareApplication'].includes(t)), cheie).toEqual([])
      expect(toate.flatMap((n) => Object.keys(n)).filter((k) => FIRMA.has(k)), cheie).toEqual([])
    }
  })
})

describe('navigatia EN cu paginile de referinta', () => {
  const en = navigatieEn(CANALE_3S_MD, new Set<string>())
  const cai = multimeaCailor([...RUTE_EN_NUCLEU, ...RUTE_EN_PRODUS, ...RUTE_EN_REFERINTA, ...CHEI_MD.map((c) => ({ cale: caleMd(c, 'en') }))], [caleMd('informatii-legale', 'ro')])

  it('antetul are declansatorul Guides spre primul ghid; subsolul are coloana Guides cu cele trei pagini, ca legaturi reale (nu inerte)', () => {
    const antet = renderToStaticMarkup(createElement(Antet, { navigatie: en, cai }))
    const subsol = renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai }))
    // Antetul randeaza pe server numai declansatorul; foaia cu elementele se deschide in browser (proba de browser).
    expect(antet).toMatch(/data-declansator="Guides" href="\/guides\/e-invoice-archiving-eu"/)
    expect(subsol).toContain('>Guides<')
    for (const html of [antet, subsol]) {
      for (const r of RUTE_EN_REFERINTA) expect(html, r.cale).not.toContain('data-tinta-lipsa="' + r.cale + '"')
    }
    for (const r of RUTE_EN_REFERINTA) expect(subsol, r.cale).toContain('href="' + r.cale + '"')
  })

  it('martor NEGATIV: fara rutele de referinta in multime, titlul Guides nu apare (prezenta de mai sus vine din rute)', () => {
    const fara = multimeaCailor([...RUTE_EN_NUCLEU, ...RUTE_EN_PRODUS], [])
    expect(renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai: fara }))).not.toContain('>Guides<')
  })
})
