import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaProdus, { grafPagina, raspunsVizibil, type InJurProdus } from '../src/app/(en)/features/_produs/PaginaProdus'
import * as modulCautare from '../src/content/en/features-search'
import { textSimplu } from '../src/content/juridic/tipuri'
import { numarCuvinte, problemePagina, type PaginaContinut } from '../src/content/model/tipuri'
import { TEXTE_WHATSAPP_EN } from '../src/content/navigatie-en'
import { RUTE_EN_PRODUS } from '../src/content/rute-en-produs'
import type { Canale } from '../src/lib/canale-mediu'

/**
 * Probele feliei en-produs (pagina EN P03 `/features/search`; P04 `/features/whatsapp` a iesit de la lansare prin
 * decizia 49): forma modulelor, afirmatiile din registru, rutele grupului, declaratiile G-AI-02 si regulile de
 * continut ale fiselor ("Nu spune", deciziile 43 si 49). Probele de browser, pe copia 3s.md, sunt in
 * `tests/browser/en-produs.spec.ts`.
 *
 * Tiparele care vaneaza cuvinte interzise se asambleaza din bucati, la rulare, ca fisierul sa nu fie el insusi o
 * instanta a ce cauta; fiecare are un martor pozitiv (o fraza fabricata care TREBUIE prinsa) si unul negativ.
 */

type Modul = { pagina: PaginaContinut; inJur: InJurProdus }
const MODULE: Record<string, Modul> = {
  'features-search': modulCautare,
}
const RADACINA = process.cwd()
const REGISTRU = join(RADACINA, 'src', 'content', 'afirmatii')
const FISIER_REGISTRU = 'en-produs.json'

type Intrare = { id: string; unde: string; stare: string; text: string }

function registru(): { fisier: string; intrare: Intrare }[] {
  return readdirSync(REGISTRU)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => (JSON.parse(readFileSync(join(REGISTRU, f), 'utf8')) as Intrare[]).map((intrare) => ({ fisier: f, intrare })))
}

/** Tot textul publicat al unei pagini: meta, H1, capsula, sectiunile, textele din jur, fara marcaj. */
function textPublicat(m: Modul): string {
  const p = m.pagina
  const bucati: string[] = [p.meta.titlu, p.meta.descriere, p.h1, p.capsula, p.cta.titluBloc]
  for (const s of p.sectiuni) {
    bucati.push(s.titlu)
    for (const b of s.blocuri) {
      bucati.push(b.eticheta ?? '', ...b.paragrafe, ...(b.lista?.elemente ?? []), ...(b.dupa ?? []))
      if (b.tabel)
        bucati.push(
          b.tabel.titlu,
          ...(b.tabel.antet ?? []),
          ...b.tabel.randuri.flat().map((c) => (typeof c === 'string' ? c : c.text + ' ' + c.detaliu)),
        )
    }
  }
  const j = m.inJur
  bucati.push(...j.fir.map((n) => n.text), j.legaturaSecundara ?? '', j.microtext, j.inainteDeEmail, ...j.final.paragrafe, j.final.veziSi)
  return bucati.map(textSimplu).join('\n')
}

/**
 * Asistentul pe WhatsApp (decizia 49), asamblat din bucati: un verb sau substantiv al asistentului (intrebare,
 * raspuns, chat, asistent, cautare si regasire, primirea de documente) in aceeasi propozitie cu numele canalului, de o parte sau de alta,
 * sau eticheta de pilot lipita de nume. Contactul cu un om ("Message us on ...", "reach 3S on ... at", "talk to
 * people") nu foloseste niciunul dintre aceste cuvinte, deci trece; martorul pozitiv de mai jos o arata.
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

/** Regulile de continut, ca tipare asamblate din bucati. */
const TIPARE: { nume: string; tipar: RegExp; pagini: string[] }[] = [
  {
    nume: 'moneda romaneasca',
    tipar: new RegExp('\\b' + 'R' + 'ON' + '\\b'),
    pagini: ['features-search'],
  },
  {
    nume: 'litera non-ASCII',
    tipar: new RegExp('[^\\x00-\\x7f]'),
    pagini: ['features-search'],
  },
  {
    nume: 'garantie',
    tipar: new RegExp('\\bguarant' + 'ee', 'i'),
    pagini: ['features-search'],
  },
  {
    nume: 'instant',
    tipar: new RegExp('\\binst' + 'ant(ly)?\\b', 'i'),
    pagini: ['features-search'],
  },
  {
    nume: 'non-stop',
    tipar: new RegExp('24' + '/' + '7'),
    pagini: ['features-search'],
  },
  {
    nume: 'procent de acuratete',
    tipar: new RegExp('\\d\\s*' + '%'),
    pagini: ['features-search'],
  },
  {
    nume: 'numar de pagina ca fapt',
    tipar: new RegExp('\\bp\\.\\s*\\d|\\bpage\\s+\\d', 'i'),
    pagini: ['features-search'],
  },
  // Decizia 43: functiile negasite in codul platformei nu apar pe paginile de lansare.
  {
    nume: 'functie scoasa prin decizia 43',
    tipar: new RegExp(
      [
        '\\bS' + 'SO\\b',
        '\\bSA' + 'ML\\b',
        '\\bA' + 'PI\\b',
        'webh' + 'ook',
        'client port' + 'al',
        'automat' + 'ion',
        'when/' + 'then',
        'mobile ' + 'app',
        'desktop ' + 'app',
        'install',
        'own stor' + 'age',
        'integrat' + 'ion',
        'on your ' + 'phone',
      ].join('|'),
      'i',
    ),
    pagini: ['features-search'],
  },
  // Decizia 43, aceleasi categorii in forme pe care tiparul de mai sus nu le vede: autentificarea unica scrisa
  // in cuvinte, scanarea cu telefonul si integrarile numite sau descrise ca legatura cu alt serviciu.
  {
    nume: 'autentificare unica in cuvinte',
    tipar: new RegExp('single[- ]?' + 'sign', 'i'),
    pagini: ['features-search'],
  },
  {
    nume: 'scanare pe telefon',
    tipar: new RegExp(['phone ?' + 'camera', 'with your ' + 'phone', 'phone ' + 'scan'].join('|'), 'i'),
    pagini: ['features-search'],
  },
  {
    nume: 'integrare cu nume',
    tipar: new RegExp(
      ['Google ' + 'Drive', 'Share' + 'Point', 'Drop' + 'box', 'One' + 'Drive', 'Microsoft ' + '365', 'Zap' + 'ier', '\\bSla' + 'ck\\b'].join('|'),
      'i',
    ),
    pagini: ['features-search'],
  },
  {
    nume: 'legatura cu alt serviciu',
    tipar: new RegExp('\\bconn' + 'ect(s|ed)? (to|with|your)\\b', 'i'),
    pagini: ['features-search'],
  },
  // Dispecerul, pe regula deciziei 43: primirea documentelor pe e-mail a iesit de pe paginile de lansare.
  {
    nume: 'primire pe e-mail',
    tipar: new RegExp('(by|on|via|through) e-?' + 'mail|forward', 'i'),
    pagini: ['features-search'],
  },
  // Decizia 49: asistentul pe WhatsApp (intrebari puse documentelor, raspunsuri, chat, documente primite pe
  // WhatsApp) nu exista in platforma. WhatsApp ramane numai canalul de contact cu un om, pe care tiparul il lasa.
  {
    nume: 'asistent pe WhatsApp (decizia 49)',
    tipar: TIPAR_ASISTENT_WA,
    pagini: ['features-search'],
  },
  {
    nume: 'pagina P04 scoasa (decizia 49)',
    tipar: new RegExp('/features/' + 'whats' + 'app', 'i'),
    pagini: ['features-search'],
  },
]

describe('martorii tiparelor de continut', () => {
  const rele: Record<string, string> = {
    'moneda romaneasca': 'From 90 ' + 'R' + 'ON a month.',
    'litera non-ASCII': 'Caf' + String.fromCharCode(0xe9) + ' archive.',
    garantie: 'A ' + 'guarant' + 'eed answer.',
    instant: 'Answers ' + 'inst' + 'antly.',
    'non-stop': 'Support ' + '24' + '/' + '7.',
    'procent de acuratete': '98' + '% accurate.',
    'numar de pagina ca fapt': 'Source: contract.pdf, p.' + ' 4',
    'functie scoasa prin decizia 43': 'Use the ' + 'client port' + 'al.',
    'autentificare unica in cuvinte': 'Single ' + 'sign-on with your directory is supported.',
    'scanare pe telefon': 'Scan paper with your ' + 'phone camera.',
    'integrare cu nume': 'Your files sync from ' + 'Drop' + 'box.',
    'legatura cu alt serviciu': '3S ' + 'connects to your existing storage.',
    'primire pe e-mail': 'Send documents ' + 'by e-' + 'mail.',
    'asistent pe WhatsApp (decizia 49)': 'Asking on ' + WA + ' is available in pilot.',
    'pagina P04 scoasa (decizia 49)': 'See [the pilot](/features/' + 'whats' + 'app).',
  }
  it('fiecare tipar prinde fraza lui fabricata', () => {
    for (const t of TIPARE) expect(t.tipar.test(rele[t.nume]), t.nume).toBe(true)
  })
  it('nimic nu acuza o fraza curata, cu cuvintele-capcana ENVIRONMENT, PRONTO, e-mail, page, sign in, phone, drive', () => {
    const curata =
      'ENVIRONMENT PRONTO. Or write to us by WhatsApp; the e-mail line; citation down to the exact page is in pilot. ' +
      'Sign in to your account; your phone number; a hard drive; the connection is encrypted.'
    for (const t of TIPARE) expect(t.tipar.test(curata), t.nume).toBe(false)
  })

  // Decizia 49: fiecare forma a asistentului, inclusiv cele scrise pe paginile de dinainte de decizie, e prinsa;
  // fiecare fraza de contact cu un om, cum o scriu paginile EN, trece.
  const asistent = TIPARE.find((t) => t.nume === 'asistent pe WhatsApp (decizia 49)')!.tipar
  it('asistentul pe WhatsApp: formele lui sunt prinse', () => {
    for (const fraza of [
      'Ask your archive on ' + WA + '. Available in pilot.',
      'Can I ask my archive questions on ' + WA + '?',
      'It works in the browser; ' + WA + ' is available in pilot.',
      'The ' + WA + ' assistant for archives.',
      'In pilot, 3S answers questions on ' + WA + ' about the documents in your archive.',
      'Chat with your documents on ' + WA + '.',
      'Documents arrive by upload from the browser and, in pilot, on ' + WA + '.',
      'You can forward your invoices on ' + WA + '.',
      'Upload from the browser, ' + WA + ' (pilot).',
      'The assistant may also be offered on ' + WA + ', if the offer includes that channel.',
      'On ' + WA + ', if the offer includes that channel, in the assistant first message.',
      'Search your archive straight from ' + WA + '.',
      'Find any contract by sending a ' + WA + ' message to 3S.',
      'Look up an invoice on ' + WA + ' in seconds.',
      WA + ' retrieves the document for you.',
    ])
      expect(asistent.test(fraza), fraza).toBe(true)
  })
  it('martor POZITIV: contactul cu un om pe WhatsApp trece (frazele paginilor EN si variante)', () => {
    for (const fraza of [
      'Message us on ' + WA + ' and tell us about your archive. Please do not send documents or personal data in this first message.',
      'Message 3S on ' + WA + ' or call +373 68 055 599. Tell us which archive you have and where. We reply in English or Romanian.',
      'You can reach 3S on ' + WA + ' at +373 68 055 599 or by phone on the same number.',
      WA + ' is our main channel. On this number you talk to people from our team.',
      'Message us on ' + WA + '. A few lines are enough. Tell us:',
      'Send us a message on ' + WA + '; a person replies, in English or Romanian.',
      'Contact 3S: ' + WA + ' and Phone',
      'You can find us on ' + WA + ' at +373 68 055 599.',
    ])
      expect(asistent.test(fraza), fraza).toBe(false)
  })
})

describe('modulele paginilor de produs', () => {
  it('un singur modul (P04 a iesit prin decizia 49), valid pe modelul comun, cu cheia egala cu numele fisierului', () => {
    expect(Object.keys(MODULE)).toEqual(['features-search'])
    for (const [cheie, m] of Object.entries(MODULE)) expect(problemePagina(m.pagina, cheie)).toEqual([])
  })

  it('titlul, meta, H1 si capsula sunt cele ale fiselor (lungimile masurate acolo)', () => {
    const c = modulCautare.pagina
    expect([c.meta.titlu.length, c.meta.descriere.length, numarCuvinte(c.capsula)]).toEqual([58, 154, 54])
  })

  it('CTA: ref-ul fisei si textul precompletat identic cu tabelul canalelor EN, pe calea paginii', () => {
    expect(modulCautare.pagina.cta.ref).toBe('en-search')
    for (const m of Object.values(MODULE)) {
      const rand = TEXTE_WHATSAPP_EN.find((t) => t.cale === m.pagina.meta.cale)
      expect(rand, m.pagina.meta.cale).toBeDefined()
      expect(rand?.ref).toBe(m.pagina.cta.ref)
      expect(rand?.text).toBe(m.pagina.cta.textWhatsapp)
    }
  })

  it('regulile de continut ale fiselor: niciun tipar nu prinde textul publicat', () => {
    const gasite: string[] = []
    for (const [cheie, m] of Object.entries(MODULE)) {
      const text = textPublicat(m)
      for (const t of TIPARE)
        if (t.pagini.includes(cheie) && t.tipar.test(text)) gasite.push(cheie + ': ' + t.nume + ' (' + text.match(t.tipar)?.[0] + ')')
    }
    expect(gasite).toEqual([])
  })

  it('pilotul: P03 tine citarea pana la pagina si engleza peste romana "in pilot"; intrebarile pe WhatsApp au iesit (decizia 49)', () => {
    const capsula = modulCautare.pagina.capsula
    expect(capsula).toMatch(/English questions over Romanian documents, and citation down to the page, are in pilot/)
    const status = modulCautare.pagina.sectiuni.find((s) => s.cheie === 'status')
    const randuri = status?.blocuri[0].tabel?.randuri ?? []
    expect(randuri.filter((r) => r[1] === 'In pilot').map((r) => r[0])).toEqual([
      'English questions over Romanian documents',
      'Citation down to the exact page',
    ])
  })

  it('ancora #status din erou exista pe pagina (separatorul sectiunii de stare)', () => {
    expect(modulCautare.inJur.legaturaSecundara).toContain('](#status)')
    expect(modulCautare.pagina.sectiuni.filter((s) => s.ancoraInainte === 'status')).toHaveLength(1)
  })
})

describe('registrul de afirmatii al grupului', () => {
  const toate = registru()
  const ale = toate.filter((r) => r.fisier === FISIER_REGISTRU).map((r) => r.intrare)

  it('martorul citirii: registrul are si alte fisiere, iar fisierul grupului are intrari', () => {
    expect(new Set(toate.map((r) => r.fisier)).size).toBeGreaterThan(1)
    expect(ale.length).toBeGreaterThan(0)
  })

  it('fiecare afirmatie citata de un modul exista in registrul grupului si ii numeste modulul in `unde`', () => {
    const lipsa: string[] = []
    for (const [cheie, m] of Object.entries(MODULE)) {
      for (const id of m.pagina.afirmatii) {
        const intrare = ale.find((i) => i.id === id)
        if (intrare === undefined) lipsa.push(cheie + ': ' + id + ' lipseste din ' + FISIER_REGISTRU)
        else if (!intrare.unde.includes('src/content/en/' + cheie + '.ts')) lipsa.push(cheie + ': ' + id + ' nu numeste modulul')
      }
    }
    expect(lipsa).toEqual([])
  })

  it('nicio intrare a grupului nu e orfana: fiecare e citata de modulele pe care le numeste', () => {
    const orfane = ale.filter((i) =>
      Object.entries(MODULE).some(([cheie, m]) => i.unde.includes('src/content/en/' + cheie + '.ts') && !m.pagina.afirmatii.includes(i.id)),
    )
    expect(orfane.map((i) => i.id)).toEqual([])
  })

  it('ID-urile grupului poarta prefixul en-produs- si nu se ciocnesc cu alt fisier de registru', () => {
    for (const i of ale) expect(i.id).toMatch(/^en-produs-[a-z0-9-]+$/)
    const altele = new Set(toate.filter((r) => r.fisier !== FISIER_REGISTRU).map((r) => r.intrare.id))
    expect(ale.filter((i) => altele.has(i.id)).map((i) => i.id)).toEqual([])
  })
})

describe('rutele si declaratiile G-AI-02 ale grupului', () => {
  const decl = (
    JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'en-produs.json'), 'utf8')) as {
      raspuns_autonom: Record<string, { intrebare: string; entitati: string[] }>
    }
  ).raspuns_autonom

  it('rutele grupului sunt exact paginile modulelor, cu editia en si cheia modulului', () => {
    expect(RUTE_EN_PRODUS.map((r) => [r.cale, r.cheie, r.editie, r.inHarta])).toEqual(
      Object.values(MODULE).map((m) => [m.pagina.meta.cale, m.pagina.cheie, 'en', true]),
    )
  })

  it('fiecare ruta are declaratia ei; intrebarea e un H2 al paginii', () => {
    expect(Object.keys(decl).sort()).toEqual(RUTE_EN_PRODUS.map((r) => r.cale).sort())
    for (const m of Object.values(MODULE)) {
      const d = decl[m.pagina.meta.cale]
      expect(
        m.pagina.sectiuni.map((s) => s.titlu),
        m.pagina.meta.cale,
      ).toContain(d.intrebare)
    }
  })

  it('entitatile si H1-ul stau in primele 400 de cuvinte ale textului paginii (H1, capsula, sectiuni)', () => {
    for (const m of Object.values(MODULE)) {
      const p = m.pagina
      const text = [
        p.h1,
        p.capsula,
        ...p.sectiuni.flatMap((s) => [s.titlu, ...s.blocuri.flatMap((b) => [...b.paragrafe, ...(b.lista?.elemente ?? [])])]),
      ]
        .map(textSimplu)
        .join(' ')
      const fereastra = text.split(/\s+/).slice(0, 400).join(' ').toLowerCase()
      const lipsa = decl[p.meta.cale].entitati.filter((e) => !fereastra.includes(e.toLowerCase()))
      expect(lipsa, p.meta.cale).toEqual([])
    }
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

  it('un H1, CTA-ul WhatsApp in erou si in final cu ref-ul paginii, fara formular si fara linie de e-mail fara adresa', () => {
    for (const m of Object.values(MODULE)) {
      const html = renderToStaticMarkup(
        createElement(PaginaProdus, {
          pagina: m.pagina,
          inJur: m.inJur,
          canale: CANALE_PROBA,
        }),
      )
      expect(html.match(/<h1[ >]/g)).toHaveLength(1)
      const wa = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)].map((x) =>
        new URL(x[1].split('&amp;').join('&')).searchParams.get('text'),
      )
      expect(wa).toEqual([m.pagina.cta.textWhatsapp, m.pagina.cta.textWhatsapp])
      expect(html).not.toMatch(new RegExp('<' + 'form\\b'))
      expect(html).not.toContain('mailto:')
    }
  })

  it('martorul canalelor: cu adresa pe domeniu apare linia de e-mail, cu subiectul paginii; fara WhatsApp, niciun buton', () => {
    const m = MODULE['features-search']
    const cu = renderToStaticMarkup(
      createElement(PaginaProdus, {
        pagina: m.pagina,
        inJur: m.inJur,
        canale: { ...CANALE_PROBA, email: 'contact@example.test' },
      }),
    )
    expect(cu).toContain('mailto:contact@example.test?subject=' + encodeURIComponent('3S inquiry [ref:en-search]'))
    const fara = renderToStaticMarkup(
      createElement(PaginaProdus, {
        pagina: m.pagina,
        inJur: m.inJur,
        canale: { ...CANALE_PROBA, whatsapp: '' },
      }),
    )
    expect(fara).not.toContain('wa.me')
  })

  it('FAQPage oglindeste intrebarile vizibile: una pe sectiune-intrebare, cu raspunsul din paragrafe', () => {
    for (const m of Object.values(MODULE)) {
      const graf = grafPagina(m.pagina, m.inJur, 'https://exemplu.test')
      const faq = graf['@graph'].find((n) => n['@type'] === 'FAQPage') as unknown as {
        mainEntity: { name: string; acceptedAnswer: { text: string } }[]
      }
      const intrebari = m.pagina.sectiuni.filter((s) => s.titlu.endsWith('?'))
      expect(faq.mainEntity.map((q) => q.name)).toEqual(intrebari.map((s) => s.titlu))
      expect(faq.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(intrebari.map(raspunsVizibil))
      const tipuri = graf['@graph'].map((n) => n['@type'])
      expect(tipuri).toEqual(['WebPage', 'BreadcrumbList', 'FAQPage'])
      const json = JSON.stringify(graf)
      expect(json).not.toContain('**')
      expect(json).not.toContain('](')
    }
    const numar = (m: Modul) => (grafPagina(m.pagina, m.inJur, 'https://exemplu.test')['@graph'][2].mainEntity as unknown[]).length
    expect(numar(modulCautare)).toBe(9)
  })

  it('raspunsul vizibil sare exemplul etichetat si tabelele (martor pe o sectiune fabricata)', () => {
    const r = raspunsVizibil({
      cheie: 'x',
      titlu: 'X?',
      blocuri: [
        {
          paragrafe: ['A [b](/c).'],
          tabel: {
            forma: 'cu-antet',
            titlu: 't',
            antet: ['h'],
            randuri: [['TABEL']],
          },
        },
        { eticheta: 'Example', paragrafe: [], dupa: ['EXEMPLU'] },
        { paragrafe: ['D.'], lista: { elemente: ['E.'] }, dupa: ['F.'] },
      ],
    })
    expect(r).toBe('A b. D. E. F.')
  })
})
