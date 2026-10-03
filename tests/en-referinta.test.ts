import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaReferinta, { grafReferinta, intrebariVizibile, raspunsVizibil, type InJurReferinta } from '../src/app/(en)/guides/_referinta/PaginaReferinta'
import Antet from '../src/components/global/Antet'
import Subsol from '../src/components/global/Subsol'
import { caleMd, CHEI_MD } from '../src/content/juridic/md/registru'
import { numarCuvinte, problemePagina, type BlocComun, type PaginaContinut, type SectiuneComuna } from '../src/content/model/tipuri'
import { multimeaCailor } from '../src/content/navigatie'
import { TEXTE_WHATSAPP_EN, navigatieEn } from '../src/content/navigatie-en'
import { RUTE_EN_NUCLEU } from '../src/content/rute-en-nucleu'
import { RUTE_EN_PRODUS } from '../src/content/rute-en-produs'
import { RUTE_EN_REFERINTA } from '../src/content/rute-en-referinta'
import { configurareCanale, type Canale } from '../src/lib/canale-mediu'
import * as comparatie from '../src/content/en/compare-3s-vs-google-and-box'
import * as efacturi from '../src/content/en/guides-e-invoice-archiving-eu'
import * as moldova from '../src/content/en/guides-records-retention-moldova'

/**
 * Paginile EN de referinta (felia en-referinta): G1 `/guides/e-invoice-archiving-eu`, G2
 * `/guides/records-retention-moldova`, G3 `/compare/3s-vs-google-and-box`. Proba masoara ce se poate masura pe sursa:
 * forma modulelor si legatura lor cu manifestul de rute, cu tabelul textelor WhatsApp al navigatiei si cu registrul de
 * afirmatii; ce nu are voie sa ajunga pe aceste pagini (asistentul pe WhatsApp, decizia 49, pe TOT textul; clasele
 * deciziei 43 pe afirmatiile 3S; RON; registrul arhivei; resturile fiselor); celula 3S din randul de certificari al
 * comparatiei, compensarea exceptiei din poarta de afirmatii; pagina randata si datele ei structurate. Paginile servite
 * (200, `lang="en"`, H1, zero `<form`, harta de site, llms.txt, grupul Guides) le masoara
 * `tests/browser/en-referinta.spec.ts`, pe copia 3s.md.
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

type Modul = { pagina: PaginaContinut; inJur: InJurReferinta }
const MODULE: Record<string, Modul> = {
  'guides-e-invoice-archiving-eu': efacturi,
  'guides-records-retention-moldova': moldova,
  'compare-3s-vs-google-and-box': comparatie,
}
const PAGINI = Object.entries(MODULE).map(([cheie, m]) => ({ cheie, pagina: m.pagina, inJur: m.inJur }))

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

/** Tot textul unui bloc, cu marcaj cu tot (legaturile raman vizibile ca adrese). */
function textBloc(b: BlocComun): string[] {
  const celule = (b.tabel?.randuri ?? []).flat().map((c) => (typeof c === 'string' ? c : c.text + ' ' + c.detaliu))
  return [b.eticheta ?? '', ...b.paragrafe, ...(b.lista?.elemente ?? []), ...(b.tabel?.antet ?? []), ...celule, ...(b.dupa ?? [])]
}

function textSectiune(s: SectiuneComuna): string {
  return [s.titlu, ...s.blocuri.flatMap(textBloc)].join('\n')
}

function sectiune(p: PaginaContinut, cheie: string): SectiuneComuna {
  const s = p.sectiuni.find((x) => x.cheie === cheie)
  if (s === undefined) throw new Error(p.cheie + ': lipseste sectiunea ' + cheie)
  return s
}

/** Celula 3S (coloana a doua) a fiecarui rand din tabelele de comparatie ale lui G3 (antetul are "3S" pe pozitia 1). */
function celule3S(p: PaginaContinut): string[] {
  const iesire: string[] = []
  for (const s of p.sectiuni) {
    for (const b of s.blocuri) {
      if (b.tabel?.antet?.[1] !== '3S') continue
      for (const rand of b.tabel.randuri) iesire.push(String(rand[1]))
    }
  }
  return iesire
}

/** Randul tabelului "Which tool fits which archive?" a carui coloana "Try first" e 3S. */
function randul3SDinSituatii(p: PaginaContinut): string[] {
  const t = sectiune(p, 'which-tool').blocuri[0].tabel!
  return t.randuri.filter((r) => r[1] === '3S').map((r) => r.map(String).join(' '))
}

/** Propozitiile unui text care vorbesc despre 3S (numele marcii sau "we"/"us"): afirmatiile 3S dintr-o capsula. */
function propozitii3S(text: string): string[] {
  return text.split(/(?<=[.?!])\s+/).filter((p) => /\b(3S|we|us)\b/.test(p))
}

/**
 * Afirmatiile 3S ale unei pagini (§12 pct. 17 a5 din planul valului): capsula (numai propozitiile despre 3S), sectiunile
 * "How can 3S help?" si "When does 3S fit?", coloana 3S a comparatiei si randul 3S din tabelul situatiilor. Celulele
 * furnizorilor si sectiunile despre lege nu intra: acolo "Google Drive" e numele produsului comparat.
 */
function afirmatii3S(p: PaginaContinut): string[] {
  const iesire = [...propozitii3S(p.capsula)]
  for (const cheie of ['how-3s-helps', 'when-fits']) {
    const s = p.sectiuni.find((x) => x.cheie === cheie)
    if (s) iesire.push(textSectiune(s))
  }
  if (p.cheie === 'compare-3s-vs-google-and-box') iesire.push(...celule3S(p), ...randul3SDinSituatii(p))
  return iesire
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

describe('modulele paginilor EN de referinta', () => {
  it('preconditia: trei module, cu cheile manifestului, in ordinea lui', () => {
    expect(Object.keys(MODULE)).toEqual(RUTE_EN_REFERINTA.map((r) => r.cheie))
    expect(RUTE_EN_REFERINTA.map((r) => r.cale)).toEqual(['/guides/e-invoice-archiving-eu', '/guides/records-retention-moldova', '/compare/3s-vs-google-and-box'])
  })

  for (const { cheie, pagina } of PAGINI) {
    it(cheie + ': forma modelului (lungimi, un H1, CTA cu ref, JSON-LD cu @type), fara probleme', () => {
      expect(problemePagina(pagina, cheie)).toEqual([])
    })
  }

  it('manifestul: editia en, in harta, cheia = cheia modulului, calea = calea modulului', () => {
    for (const r of RUTE_EN_REFERINTA) {
      const m = MODULE[r.cheie]
      expect(m, r.cale).toBeDefined()
      expect(r.editie).toBe('en')
      expect(r.inHarta).toBe(true)
      expect(m.pagina.meta.cale).toBe(r.cale)
    }
  })

  it('fiecare pagina are fisierul ei sub (en) si importa DIRECT modulul ei (conditia portii de registru)', () => {
    for (const r of RUTE_EN_REFERINTA) {
      const fisier = join(RADACINA, 'src', 'app', '(en)', ...r.cale.slice(1).split('/'), 'page.en.tsx')
      expect(existsSync(fisier), fisier).toBe(true)
      expect(readFileSync(fisier, 'utf8')).toContain('from "@/content/en/' + r.cheie + '"')
      expect(readFileSync(fisier, 'utf8')).not.toContain('<' + 'form')
    }
  })

  it('textul WhatsApp si ref-ul fiecarei pagini sunt cele din tabelul navigatiei; legatura de semnalare poarta acelasi ref', () => {
    for (const { pagina, inJur } of PAGINI) {
      const intrare = TEXTE_WHATSAPP_EN.find((t) => t.cale === pagina.meta.cale)
      expect(intrare, pagina.meta.cale).toBeDefined()
      expect(pagina.cta.textWhatsapp).toBe(intrare!.text)
      expect(pagina.cta.ref).toBe(intrare!.ref)
      expect(inJur.semnalare.textWhatsapp.split('[ref:' + pagina.cta.ref + ']')).toHaveLength(2)
    }
  })

  it('capsulele numara cuvintele fisei (59, 59, 50) si sunt primul paragraf al declaratiei G-AI-02', () => {
    expect(PAGINI.map((p) => numarCuvinte(p.pagina.capsula))).toEqual([59, 59, 50])
    const decl = JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'en-referinta.json'), 'utf8')) as {
      raspuns_autonom: Record<string, { intrebare: string; entitati: string[] }>
    }
    expect(Object.keys(decl.raspuns_autonom)).toEqual(RUTE_EN_REFERINTA.map((r) => r.cale))
    for (const { pagina } of PAGINI) {
      const d = decl.raspuns_autonom[pagina.meta.cale]
      // Entitatile stau in capsula sau in H1 sau in randul de verificare: toate in primele 400 de cuvinte.
      const inceput = [pagina.h1, pagina.capsula, MODULE[pagina.cheie].inJur.verificare].join(' ').toLowerCase()
      expect(d.entitati.filter((e) => !inceput.includes(e.toLowerCase())), pagina.meta.cale).toEqual([])
    }
  })
})

describe('ce nu ajunge pe paginile EN de referinta', () => {
  const RESTURI_FISA = [
    'Notes ' + '(not published)',
    'END OF ' + 'PAGE COPY',
    'JSON-LD ' + '(proposed)',
    'Page ' + 'assets',
    'archive ' + 'register',
    'retention period for ' + 'each document',
  ]
  const MONEDA = new RegExp('\\b' + 'R' + 'ON\\b')
  const textModul = (m: object) => JSON.stringify(m)

  it('martorii: resturile fisei, moneda si registrul arhivei sunt prinse pe un text fabricat; un text curat nu', () => {
    const rau = RESTURI_FISA.map((r) => 'x ' + r + ' y').join('\n') + ' 12 ' + 'R' + 'ON'
    expect(RESTURI_FISA.filter((r) => !rau.includes(r))).toEqual([])
    expect(MONEDA.test(rau)).toBe(true)
    expect(MONEDA.test('From EUR 90, ENVIRONMENT, PRONTO')).toBe(false)
  })

  for (const { cheie } of PAGINI) {
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
    expect(TIPAR_ASISTENT_WA.test('You can reach 3S on ' + WA + ' at +373 68 055 599.')).toBe(false)
    expect(TIPAR_ASISTENT_WA.test('Upload your invoices on ' + WA + '.')).toBe(true)
    expect(TIPAR_ASISTENT_WA.test('Message us on ' + WA + '. A person replies, in English or Romanian.')).toBe(false)
  })

  for (const { cheie } of PAGINI) {
    it(cheie + ': zero fraze despre asistentul pe WhatsApp in tot ce exporta modulul (decizia 49)', () => {
      expect(textModul(MODULE[cheie]).match(TIPAR_ASISTENT_WA)).toBeNull()
    })
  }

  it('martorii deciziei 43: fiecare clasa prinde o fraza 3S fabricata, iar celula Google cu "Google Drive" trece (nu e afirmatie 3S)', () => {
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
    // Martor POZITIV pe extragere: o celula 3S fabricata cu o functie scoasa ajunge in afirmatiile 3S si e prinsa.
    const p = comparatie.pagina
    const mutant: PaginaContinut = {
      ...p,
      sectiuni: p.sectiuni.map((s) =>
        s.cheie !== 'where-cost'
          ? s
          : {
              ...s,
              blocuri: s.blocuri.map((b) => ({
                ...b,
                tabel: b.tabel && { ...b.tabel, randuri: b.tabel.randuri.map((r, i) => (i === 1 ? [r[0], 'Bring your ' + 'own bucket.', ...r.slice(2)] : r)) },
              })),
            },
      ),
    }
    expect(afirmatii3S(mutant).flatMap(incalcari43)).toContain('stocarea proprie')
    // Martor NEGATIV: celulele Google si capsula G3 numesc "Google Drive", dar nu sunt afirmatii 3S.
    const google = sectiune(p, 'where-cost').blocuri[0].tabel!.randuri.map((r) => String(r[2])).join(' ')
    expect(incalcari43(google)).toContain('integrarile cu nume')
    expect(afirmatii3S(p).join(' ')).not.toContain(google.slice(0, 40))
  })

  for (const { cheie, pagina } of PAGINI) {
    it(cheie + ': zero clase ale deciziei 43 in afirmatiile 3S', () => {
      const texte = afirmatii3S(pagina)
      // Controlul extragerii: fiecare pagina are afirmatii 3S citite (capsula G3, sectiunea "How can 3S help?" la G1 si G2).
      expect(texte.length).toBeGreaterThan(0)
      expect(texte.flatMap(incalcari43)).toEqual([])
    })
  }

  it('controlul extragerii G3: 8 celule 3S in cele trei tabele, randul 3S al situatiilor si doua propozitii 3S in capsula', () => {
    expect(celule3S(comparatie.pagina)).toHaveLength(8)
    expect(randul3SDinSituatii(comparatie.pagina)).toHaveLength(1)
    expect(propozitii3S(comparatie.pagina.capsula)).toEqual(['Choose 3S for an assisted pilot on your own documents.', 'Ask us where we stand first.'])
  })
})

describe('randul de certificari al comparatiei (compensarea exceptiei din poarta de afirmatii)', () => {
  const randCertificari = () => {
    const t = sectiune(comparatie.pagina, 'where-cost').blocuri[0].tabel!
    const r = t.randuri.find((x) => x[0] === 'Certifications the vendor names')
    if (r === undefined) throw new Error('lipseste randul de certificari')
    return { antet: t.antet!, rand: r.map(String) }
  }

  it('controlul: randul exista, coloana a doua e 3S, iar celulele furnizorilor numesc certificari (tiparul citeste)', () => {
    const { antet, rand } = randCertificari()
    expect(antet[1]).toBe('3S')
    expect(rand.slice(2).filter((c) => CERTIFICARI.test(c))).toHaveLength(2)
  })

  it('martor POZITIV: o celula 3S fabricata care numeste o certificare e prinsa', () => {
    expect(CERTIFICARI.test('3S holds ' + 'SO' + 'C 2 Type II.')).toBe(true)
    expect(CERTIFICARI.test('3S is ' + 'IS' + 'O/IEC 27001 certified.')).toBe(true)
  })

  it('celula 3S din randul de certificari nu numeste nicio certificare', () => {
    const { rand } = randCertificari()
    expect(rand[1]).not.toMatch(CERTIFICARI)
    expect(rand[1]).toBe('None stated on this site. Tell us what your auditor or bank requires, and we will say plainly whether we meet it.')
  })
  // Exceptia din poarta scoate TOT fisierul comparatiei de sub tiparul certificarilor, nu doar randul de mai sus. Deci
  // compensarea citeste toate afirmatiile 3S ale paginii (capsula, "How can 3S help?", "When does 3S fit?", coloana 3S,
  // randul 3S al situatiilor), cu acelasi extractor ca decizia 43, plus "When should you not choose 3S?", unde pagina
  // vorbeste despre certificarile lui 3S. Aplicata si pe G1 si G2, unde nu costa nimic.
  const afirmatiiCertificari = (p: PaginaContinut): string[] => {
    const nu = p.sectiuni.find((x) => x.cheie === 'when-not')
    return [...afirmatii3S(p), ...(nu ? [textSectiune(nu)] : [])]
  }
  const cuFraza = (p: PaginaContinut, cheie: string, fraza: string): PaginaContinut => ({
    ...p,
    sectiuni: p.sectiuni.map((s) => (s.cheie !== cheie ? s : { ...s, blocuri: s.blocuri.map((b, i) => (i === 0 ? { ...b, paragrafe: [...b.paragrafe, fraza] } : b)) })),
  })

  for (const { cheie, pagina } of PAGINI) {
    it(cheie + ': nicio certificare numita in afirmatiile 3S ale paginii', () => {
      const texte = afirmatiiCertificari(pagina)
      expect(texte.length).toBeGreaterThan(0)
      expect(texte.filter((t) => CERTIFICARI.test(t))).toEqual([])
    })
  }

  it('martor POZITIV: o fraza 3S fabricata in "When does 3S fit?" sau in "When should you not choose 3S?" care numeste o certificare e prinsa; paragraful despre certificarile cerute trece', () => {
    const p = comparatie.pagina
    // Controlul: paragraful "You need named certifications today" e chiar in textul citit si nu numeste nicio certificare.
    const certificariCerute = sectiune(p, 'when-not').blocuri.flatMap(textBloc).filter((t) => t.includes('named certifications today'))
    expect(certificariCerute).toHaveLength(1)
    expect(afirmatiiCertificari(p).join(' ')).toContain(certificariCerute[0])
    expect(afirmatiiCertificari(p).filter((t) => CERTIFICARI.test(t))).toEqual([])
    const fraza = '3S is ' + 'SO' + 'C 2 Type II and ' + 'IS' + 'O 27001 certified.'
    for (const cheie of ['when-fits', 'when-not']) {
      sectiune(p, cheie)
      expect(afirmatiiCertificari(cuFraza(p, cheie, fraza)).filter((t) => CERTIFICARI.test(t)), cheie).toHaveLength(1)
    }
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

  it('faptele de lege si ale furnizorilor raman neconfirmate pana la reverificarea dinaintea portii B', () => {
    const deVerificat = REGISTRU.filter((i) => /^en-referinta-(termene-|efacturare-arhivare-|comparatii-marcaje-)/.test(i.id))
    // Controlul selectiei: 7 retineri de e-facturi si termene RO, 14 termene si reguli MD, 3 furnizori.
    expect(deVerificat.length).toBeGreaterThanOrEqual(20)
    expect(deVerificat.filter((i) => i.stare !== 'neconfirmat').map((i) => i.id)).toEqual([])
  })

  it('martor POZITIV: o pagina care citeaza un id absent din registru e prinsa de aceeasi verificare', () => {
    expect(['en-referinta-' + 'nu-exista'].filter((id) => !TOATE_INTRARILE.has(id))).toHaveLength(1)
  })
})

describe('pagina randata si datele ei structurate', () => {
  const CANALE_PROBA: Canale = {
    formulare: false,
    whatsapp: '37300000001',
    telefon: '',
    email: '',
    emailSecuritate: 'security@example.test',
  }

  const randeaza = (m: Modul, canale: Canale) => renderToStaticMarkup(createElement(PaginaReferinta, { pagina: m.pagina, inJur: m.inJur, canale }))

  it('un H1, CTA-ul WhatsApp in erou si in final, legatura de semnalare, toate cu ref-ul paginii; fara formular si fara e-mail fara adresa', () => {
    for (const m of Object.values(MODULE)) {
      const html = randeaza(m, CANALE_PROBA)
      expect(html.match(/<h1[ >]/g)).toHaveLength(1)
      const wa = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)].map((x) => new URL(x[1].split('&amp;').join('&')).searchParams.get('text'))
      expect(wa).toEqual([m.pagina.cta.textWhatsapp, m.inJur.semnalare.textWhatsapp, m.pagina.cta.textWhatsapp])
      expect(html).not.toMatch(new RegExp('<' + 'form\\b'))
      expect(html).not.toContain('mailto:')
      expect(html).toContain('data-verificare')
    }
  })

  it('martorul canalelor: cu adresa pe domeniu apare linia de e-mail; fara WhatsApp, niciun buton si nicio legatura de semnalare', () => {
    const cu = randeaza(efacturi, { ...CANALE_PROBA, email: 'contact@example.test' })
    expect(cu).toContain('mailto:contact@example.test?subject=' + encodeURIComponent('3S inquiry [ref:en-einv]'))
    const fara = randeaza(efacturi, { ...CANALE_PROBA, whatsapp: '' })
    expect(fara).not.toContain('wa.me')
    expect(fara).not.toContain('data-semnalare')
  })

  it('pe canalele profilului 3s.md, butoanele duc la numarul din profil', () => {
    expect(CANALE_3S_MD.whatsapp).not.toBe('')
    const html = randeaza(moldova, CANALE_3S_MD)
    expect(html).toContain('https://wa.me/' + CANALE_3S_MD.whatsapp + '?text=')
  })

  it('FAQPage oglindeste intrebarile vizibile H2; Article poarta titlul, descrierea, datele si citarile din tabelul surselor', () => {
    const asteptate: Record<string, number> = {
      'guides-e-invoice-archiving-eu': 10,
      'guides-records-retention-moldova': 10,
      'compare-3s-vs-google-and-box': 7,
    }
    for (const { cheie, pagina, inJur } of PAGINI) {
      const graf = grafReferinta(pagina, inJur, 'https://exemplu.test')
      expect(graf['@graph'].map((n) => n['@type'])).toEqual(['Article', 'WebPage', 'BreadcrumbList', 'FAQPage'])
      const faq = graf['@graph'][3] as unknown as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
      const intrebari = intrebariVizibile(pagina)
      expect(faq.mainEntity.map((q) => q.name)).toEqual(intrebari.map((s) => s.titlu))
      expect(faq.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(intrebari.map(raspunsVizibil))
      expect(faq.mainEntity, cheie).toHaveLength(asteptate[cheie])
      const articol = graf['@graph'][0] as Record<string, unknown>
      expect(articol.headline).toBe(pagina.h1)
      expect(articol.description).toBe(pagina.meta.descriere)
      expect([articol.datePublished, articol.dateModified]).toEqual(['2026-09-30', '2026-09-30'])
      expect(articol.author).toEqual({ '@id': 'https://exemplu.test/#organizatie' })
      // Fiecare legatura externa din tabelul surselor e citata in Article.
      const surse = textSectiune(sectiune(pagina, 'sources'))
      const legaturi = [...surse.matchAll(/\]\((https:[^)\s]+)\)/g)].map((m) => m[1])
      expect(legaturi.length).toBeGreaterThan(5)
      const citari = (articol.citation as string[]).join('\n')
      expect(legaturi.filter((l) => !citari.includes(l))).toEqual([])
      const json = JSON.stringify(graf)
      expect(json).not.toContain('**')
      expect(json).not.toContain('](')
    }
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
    for (const { cheie, pagina, inJur } of PAGINI) {
      const toate = noduri(grafReferinta(pagina, inJur, 'https://exemplu.test'))
      const tipuri = toate.map((n) => n['@type']).filter((t): t is string => typeof t === 'string')
      expect(tipuri.filter((t) => !TIPURI.has(t)), cheie).toEqual([])
      expect(tipuri.filter((t) => ['Organization', 'WebSite', 'SoftwareApplication'].includes(t)), cheie).toEqual([])
      expect(toate.flatMap((n) => Object.keys(n)).filter((k) => FIRMA.has(k)), cheie).toEqual([])
    }
  })

  it('gazduirea 3S e formula deciziei 42, cuvant cu cuvant, pe G1 si in celula 3S a comparatiei', () => {
    expect(textSectiune(sectiune(efacturi.pagina, 'how-3s-helps'))).toContain('Files are stored in the EU, with Frankfurt as the primary region.')
    expect(celule3S(comparatie.pagina)).toContain(
      'In the EU, with Frankfurt as the primary region. See the [About page](/about#security). Where the AI features process documents is not stated on this site: ask us.',
    )
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
