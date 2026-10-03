import { afterEach, describe, expect, it, vi } from 'vitest'
import { trateazaCerere } from '../src/app/api/formular/logica'
import { stareFormular } from '../src/components/formular/stare'
import { CHEIE_DURATA } from '../src/components/formular/validare'
import {
  CANALE,
  codifica,
  legaturaEmail,
  legaturaWhatsApp,
  marcajRef,
  numarAfisat,
  randNumarWhatsApp,
  type Canale,
} from '../src/content/canale'
import { adresaMarcii } from '../src/content/entitate'
import { EMAIL_SECURITATE } from '../src/content/produs/securitate'
import { CHEI_CANALE, EMAIL_SECURITATE_IMPLICIT, VARIABILA_CANALE, configurareCanale } from '../src/lib/canale-mediu'
import type { Operator } from '../src/lib/operator'
import { adresaSite } from '../src/lib/site'

/**
 * Canalele pe domeniu (`CANALE_JSON`): implicitul e comportamentul de dinainte, fiecare refuz al
 * validarii numeste variabila si campul, invariantul "formulare oprite cer un canal", codificarea
 * legaturilor contra formei de referinta a documentului de continut, si punctul /api/formular care
 * raspunde 404 cu formularele oprite, inaintea operatorului.
 *
 * Fiecare regula are martorul ei. Fixturile (numarul, adresele) se asambleaza la rulare.
 */

const NUMAR = ['373', '68', '055', '599'].join('')
const ADRESA_CONTACT = ['contact', ['3s', 'md'].join('.')].join('@')
const SITE = adresaSite()

const OPERATOR_SINTETIC: Operator = {
  denumire: ['Operator', 'Sintetic', 'Canale', 'SRL'].join(' '),
  sediu: 'Strada Exemplului 1, Pitesti',
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}

const DESTINATIE = 'https://' + ['destinatie', 'canale', 'test'].join('.') + '/formulare'

const VALID = {
  formular: 'contact',
  nume: 'Ion Exemplu',
  email: ['ion', ['exemplu-canale', 'test'].join('.')].join('@'),
  telefon: '',
  companie: 'Alfa Exemplu SRL',
  mesaj: 'Un mesaj de proba.',
  marketing: false,
  [CHEIE_DURATA]: 12_000,
}

let ip = 10
function cerere(): Request {
  ip += 1
  return new Request('http://127.0.0.1/api/formular', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: SITE, 'X-Forwarded-For': '198.51.100.' + ip },
    body: JSON.stringify(VALID),
  })
}

/** O cerere al carei corp numara citirile: martorul ca raspunsul vine INAINTE de citire. */
function cerereNumarata(): { cerere: Request; citiri: () => number } {
  let citiri = 0
  const corp = new ReadableStream<Uint8Array>(
    {
      pull(c) {
        citiri += 1
        c.enqueue(new TextEncoder().encode(JSON.stringify(VALID)))
        c.close()
      },
    },
    { highWaterMark: 0 },
  )
  const c = new Request('http://127.0.0.1/api/formular', {
    method: 'POST',
    body: corp,
    headers: { 'Content-Type': 'application/json', Origin: SITE },
    // @ts-expect-error: Node cere `duplex` pentru un corp de tip flux
    duplex: 'half',
  })
  return { cerere: c, citiri: () => citiri }
}

function destinatie(): { trimite: typeof fetch; trimise: () => number } {
  let n = 0
  const trimite = (async () => {
    n += 1
    return new Response(null, { status: 200 })
  }) as unknown as typeof fetch
  return { trimite, trimise: () => n }
}

/** Configurarea domeniului international, cu adresa lasata goala pana la confirmarea ei. */
function json3sMd(extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    formulare: false,
    whatsapp: NUMAR,
    telefon: '+' + NUMAR,
    email: '',
    emailSecuritate: EMAIL_SECURITATE,
    ...extra,
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

// ---------------------------------------------------------------------------------------------
// Implicitul = comportamentul de dinainte
// ---------------------------------------------------------------------------------------------

describe('CANALE_JSON nesetata: comportamentul de dinainte', () => {
  it('mediul probei nu are variabila (altfel cazurile de mai jos n-ar masura implicitul)', () => {
    expect((process.env.CANALE_JSON ?? '').trim()).toBe('')
  })

  it('nesetata, goala sau numai spatii: formulare pornite, fara WhatsApp si telefon, adresa marcii', () => {
    const asteptat: Canale = {
      formulare: true,
      whatsapp: '',
      telefon: '',
      email: 'marca@exemplu.test',
      emailSecuritate: EMAIL_SECURITATE,
    }
    for (const v of [undefined, '', '   \n']) {
      expect(configurareCanale(v, 'marca@exemplu.test')).toEqual(asteptat)
    }
    expect(CANALE).toEqual({ ...asteptat, email: adresaMarcii() ?? '' })
  })

  it('adresa de securitate implicita e aceeasi cu cea a paginii de securitate', () => {
    expect(EMAIL_SECURITATE_IMPLICIT).toBe(EMAIL_SECURITATE)
  })

  it('stareFormular: implicitul decide ca inainte (numai operatorul)', () => {
    expect(stareFormular(OPERATOR_SINTETIC, null, false)).toEqual(stareFormular(OPERATOR_SINTETIC, null, false, true))
    expect(stareFormular(OPERATOR_SINTETIC, null, false).activ).toBe(true)
    expect(stareFormular(null, null, false).activ).toBe(false)
  })

  it('/api/formular: fara operator 503 ca inainte; cu operator si destinatie, 200 si o trimitere', async () => {
    expect((await trateazaCerere(cerere(), { operator: null, destinatie: DESTINATIE, site: SITE })).status).toBe(503)
    const d = destinatie()
    const r = await trateazaCerere(cerere(), {
      operator: OPERATOR_SINTETIC,
      destinatie: DESTINATIE,
      trimite: d.trimite,
      site: SITE,
    })
    expect(r.status).toBe(200)
    expect(d.trimise()).toBe(1)
  })
})

// ---------------------------------------------------------------------------------------------
// Validarea: fiecare refuz numeste variabila si campul
// ---------------------------------------------------------------------------------------------

describe('CANALE_JSON: validarea la construire', () => {
  it('martor pozitiv: configurarea domeniului international trece, cu toate cheile', () => {
    expect(configurareCanale(json3sMd(), 'marca@exemplu.test')).toEqual({
      formulare: false,
      whatsapp: NUMAR,
      telefon: '+' + NUMAR,
      email: '',
      emailSecuritate: EMAIL_SECURITATE,
    })
    expect(Object.keys(configurareCanale(json3sMd()))).toEqual([...CHEI_CANALE])
  })

  it('o cheie lipsa ia implicitul; "email" prezent si gol bate adresa marcii', () => {
    expect(configurareCanale('{"whatsapp": "' + NUMAR + '"}', 'marca@exemplu.test')).toEqual({
      formulare: true,
      whatsapp: NUMAR,
      telefon: '',
      email: 'marca@exemplu.test',
      emailSecuritate: EMAIL_SECURITATE,
    })
    expect(configurareCanale('{"email": ""}', 'marca@exemplu.test').email).toBe('')
  })

  const refuzuri: Array<[string, string, string | null]> = [
    ['JSON stricat', '{"formulare": false', null],
    ['lista in loc de obiect', '[]', null],
    ['null in loc de obiect', 'null', null],
    ['text in loc de obiect', '"da"', null],
    ['cheie necunoscuta', '{"cont": false}', 'cont'],
    ['formulare ca text', '{"formulare": "false"}', 'formulare'],
    ['whatsapp ca numar', '{"whatsapp": 37368000001}', 'whatsapp'],
    ['whatsapp cu plus', '{"whatsapp": "+37368000001"}', 'whatsapp'],
    ['whatsapp cu spatii', '{"whatsapp": "373 68 000 001"}', 'whatsapp'],
    ['whatsapp de 7 cifre', '{"whatsapp": "3736800"}', 'whatsapp'],
    ['whatsapp de 16 cifre', '{"whatsapp": "3736800000100000"}', 'whatsapp'],
    ['telefon fara plus', '{"telefon": "37368000001"}', 'telefon'],
    ['telefon cu spatii', '{"telefon": "+373 68 000 001"}', 'telefon'],
    ['telefon cu zero dupa plus', '{"telefon": "+037368000001"}', 'telefon'],
    ['telefon prea scurt', '{"telefon": "+3736800"}', 'telefon'],
    ['email care nu e adresa', '{"email": "contact"}', 'email'],
    ['email cu spatiu', '{"email": "contact @exemplu.test"}', 'email'],
    ['emailSecuritate gol', '{"emailSecuritate": ""}', 'emailSecuritate'],
    ['emailSecuritate fara domeniu', '{"emailSecuritate": "security@"}', 'emailSecuritate'],
  ]

  for (const [ce, valoare, camp] of refuzuri) {
    it('refuz: ' + ce, () => {
      let mesaj = ''
      try {
        configurareCanale(valoare)
      } catch (e) {
        mesaj = e instanceof Error ? e.message : String(e)
      }
      expect(mesaj, 'nu a aruncat').not.toBe('')
      expect(mesaj.startsWith(VARIABILA_CANALE)).toBe(true)
      if (camp !== null) expect(mesaj).toContain('"' + camp + '"')
    })
  }

  it('martor: valorile de la marginea formei trec (8 si 15 cifre, telefon de 8 si 15 cifre)', () => {
    expect(configurareCanale('{"whatsapp": "37368000"}').whatsapp).toBe('37368000')
    expect(configurareCanale('{"whatsapp": "373680000010000"}').whatsapp).toBe('373680000010000')
    expect(configurareCanale('{"telefon": "+37368000"}').telefon).toBe('+37368000')
    expect(configurareCanale('{"telefon": "+373680000010000"}').telefon).toBe('+373680000010000')
  })
})

describe('CANALE_JSON: invariantul formularelor oprite', () => {
  it('formulare=false fara niciun canal: refuz pe campul formulare', () => {
    expect(() => configurareCanale('{"formulare": false}')).toThrow(/CANALE_JSON: campul "formulare"/)
    expect(() => configurareCanale('{"formulare": false, "whatsapp": "", "telefon": "", "email": ""}', 'm@exemplu.test')).toThrow(
      /"formulare"/,
    )
  })

  it('adresa de securitate nu tine loc de canal de contact', () => {
    expect(() => configurareCanale('{"formulare": false, "emailSecuritate": "sec@exemplu.test"}')).toThrow(/"formulare"/)
  })

  it('martor: oricare canal nevid ajunge (whatsapp, telefon, email din cheie sau din marca)', () => {
    expect(configurareCanale('{"formulare": false, "whatsapp": "' + NUMAR + '"}').formulare).toBe(false)
    expect(configurareCanale('{"formulare": false, "telefon": "+' + NUMAR + '"}').formulare).toBe(false)
    expect(configurareCanale('{"formulare": false, "email": "c@exemplu.test"}').formulare).toBe(false)
    expect(configurareCanale('{"formulare": false}', 'marca@exemplu.test').formulare).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------
// Codificarea legaturilor, contra formei de referinta
// ---------------------------------------------------------------------------------------------

/**
 * Codificarea de referinta, scrisa independent de cea din `canale.ts`: octetii UTF-8, cu numai
 * `A-Z a-z 0-9 _ . - ~` lasate cum sunt (forma lui `quote` cu `safe` gol din biblioteca standard Python,
 * cu care s-au generat legaturile documentului de continut).
 */
function codificaReferinta(text: string): string {
  const liber = /[A-Za-z0-9_.~-]/
  let iesire = ''
  for (const octet of new TextEncoder().encode(text)) {
    const c = String.fromCharCode(octet)
    iesire += octet < 128 && liber.test(c) ? c : '%' + octet.toString(16).toUpperCase().padStart(2, '0')
  }
  return iesire
}

/** Cele 18 randuri ale tabelului de coduri ref: codul, ce a citit omul, ce vrea. */
const RANDURI: Array<[string, string, string]> = [
  ['en-home', 'your website', 'I would like to ask about a pilot.'],
  ['en-platform', 'your page on the platform', 'I would like to ask how it would work with our documents.'],
  ['en-search', 'your page on search with a cited source', 'I would like to see it on a sample of our documents.'],
  ['en-wa', 'your page on asking the archive on WhatsApp', 'I would like to ask about the pilot.'],
  ['en-mobile', 'your page on the apps', 'I would like to ask how we would get access.'],
  ['en-portal', 'your page on the client portal', 'I would like to ask about a pilot for our clients.'],
  ['en-auto', 'your page on automations', 'I would like to ask what rules we could set up.'],
  ['en-price', 'your pricing page', 'I would like to ask for a quote.'],
  ['en-ent', 'your page on 3S for large archives', 'I would like to talk about our requirements.'],
  ['en-contact', 'your contact page', 'I would like to ask about a pilot.'],
  ['en-about', 'your page about 3S and data location', 'I have a question about security.'],
  ['en-seg-md', 'your page for foreign-owned companies in Moldova', 'I would like to ask about a pilot.'],
  ['en-seg-ngo', 'your page for NGOs and funded projects', 'I would like to ask about a pilot.'],
  ['en-seg-acct', 'your page for accounting and law firms', 'I would like to ask about a pilot with one of our clients.'],
  ['en-seg-ro', 'your page for owners of Romanian companies', 'I would like to ask about a pilot.'],
  ['en-einv', 'your page on e-invoice archiving', 'I would like to ask about a pilot.'],
  ['en-ret-md', 'your page on record retention in Moldova', 'I would like to ask about a pilot.'],
  ['en-vs', 'your comparison with Google and Box AI', 'I would like to ask whether 3S fits our case.'],
]

const textWhatsApp = (ref: string, citit: string, vrea: string) => 'Hello 3S, I read ' + citit + ' ' + marcajRef(ref) + '. ' + vrea
const subiect = (ref: string) => '3S inquiry ' + marcajRef(ref)
const CRLF = '\r\n'
const corp = (citit: string, vrea: string) =>
  'Hello 3S,' + CRLF + CRLF + 'I read ' + citit + '. ' + vrea + CRLF + CRLF + 'My archive (paper, scans or files) and country:' + CRLF

describe('legaturile: codificarea contra formei de referinta', () => {
  const md: Canale = configurareCanale(json3sMd({ email: ADRESA_CONTACT }))

  // Cele trei exemple complete ale documentului de continut, cu numarul si adresa puse la rulare.
  const EXEMPLE: Array<[string, string, string, string]> = [
    [
      'en-home',
      'your website',
      'Hello%203S%2C%20I%20read%20your%20website%20%5Bref%3Aen-home%5D.%20I%20would%20like%20to%20ask%20about%20a%20pilot.',
      'subject=3S%20inquiry%20%5Bref%3Aen-home%5D&body=Hello%203S%2C%0D%0A%0D%0AI%20read%20your%20website.%20I%20would%20like%20to%20ask%20about%20a%20pilot.%0D%0A%0D%0AMy%20archive%20%28paper%2C%20scans%20or%20files%29%20and%20country%3A%0D%0A',
    ],
    [
      'en-einv',
      'your page on e-invoice archiving',
      'Hello%203S%2C%20I%20read%20your%20page%20on%20e-invoice%20archiving%20%5Bref%3Aen-einv%5D.%20I%20would%20like%20to%20ask%20about%20a%20pilot.',
      'subject=3S%20inquiry%20%5Bref%3Aen-einv%5D&body=Hello%203S%2C%0D%0A%0D%0AI%20read%20your%20page%20on%20e-invoice%20archiving.%20I%20would%20like%20to%20ask%20about%20a%20pilot.%0D%0A%0D%0AMy%20archive%20%28paper%2C%20scans%20or%20files%29%20and%20country%3A%0D%0A',
    ],
    [
      'en-contact',
      'your contact page',
      'Hello%203S%2C%20I%20read%20your%20contact%20page%20%5Bref%3Aen-contact%5D.%20I%20would%20like%20to%20ask%20about%20a%20pilot.',
      'subject=3S%20inquiry%20%5Bref%3Aen-contact%5D&body=Hello%203S%2C%0D%0A%0D%0AI%20read%20your%20contact%20page.%20I%20would%20like%20to%20ask%20about%20a%20pilot.%0D%0A%0D%0AMy%20archive%20%28paper%2C%20scans%20or%20files%29%20and%20country%3A%0D%0A',
    ],
  ]

  for (const [ref, citit, textCodificat, interogare] of EXEMPLE) {
    it('exemplul ' + ref + ': WhatsApp si e-mail identice cu legaturile de referinta', () => {
      const vrea = 'I would like to ask about a pilot.'
      expect(legaturaWhatsApp(ref, textWhatsApp(ref, citit, vrea), md)).toBe('https://wa.me/' + NUMAR + '?text=' + textCodificat)
      expect(legaturaEmail(ref, subiect(ref), corp(citit, vrea), md)).toBe('mailto:' + ADRESA_CONTACT + '?' + interogare)
    })
  }

  it('toate cele 18 coduri ref: legatura iese din codificarea de referinta si se decodeaza inapoi in text', () => {
    let verificate = 0
    for (const [ref, citit, vrea] of RANDURI) {
      const text = textWhatsApp(ref, citit, vrea)
      const wa = legaturaWhatsApp(ref, text, md)
      expect(wa).toBe('https://wa.me/' + NUMAR + '?text=' + codificaReferinta(text))
      expect(decodeURIComponent((wa ?? '').split('?text=')[1])).toBe(text)
      const mail = legaturaEmail(ref, subiect(ref), corp(citit, vrea), md)
      expect(mail).toBe(
        'mailto:' + ADRESA_CONTACT + '?subject=' + codificaReferinta(subiect(ref)) + '&body=' + codificaReferinta(corp(citit, vrea)),
      )
      verificate += 1
    }
    expect(verificate).toBe(18)
    expect(new Set(RANDURI.map((r) => r[0])).size).toBe(18)
  })

  it('control: encodeURIComponent NU da forma de referinta pe corpul cu paranteze', () => {
    const c = corp('your website', 'I would like to ask about a pilot.')
    expect(encodeURIComponent(c)).not.toBe(codificaReferinta(c))
    expect(codifica(c)).toBe(codificaReferinta(c))
    expect(codifica("!'()*")).toBe('%21%27%28%29%2A')
  })

  it('diacriticele se codifica pe octetii UTF-8', () => {
    expect(codifica('ăîșțâ ĂÎȘȚÂ')).toBe(codificaReferinta('ăîșțâ ĂÎȘȚÂ'))
  })

  it('marcajul ref: lipsa, dublat sau alt cod -> eroare; cod de forma gresita -> eroare', () => {
    const bun = textWhatsApp('en-home', 'your website', 'x')
    expect(() => legaturaWhatsApp('en-home', 'Hello 3S', md)).toThrow(/o singura data/)
    expect(() => legaturaWhatsApp('en-home', bun + ' ' + marcajRef('en-home'), md)).toThrow(/de 2 ori/)
    expect(() => legaturaWhatsApp('en-price', bun, md)).toThrow(/\[ref:en-price\]/)
    expect(() => legaturaEmail('en-home', '3S inquiry', 'corp', md)).toThrow(/Subiectul/)
    expect(() => marcajRef('EN home')).toThrow(/Cod ref invalid/)
    expect(legaturaWhatsApp('en-home', bun, md)).not.toBeNull()
  })

  it('canal lipsa -> null, fara legatura; numarul afisat ca numar de WhatsApp, fara legatura de apel (decizia 56)', () => {
    const gol = configurareCanale(undefined, '')
    const text = textWhatsApp('en-home', 'your website', 'x')
    expect(legaturaWhatsApp('en-home', text, gol)).toBeNull()
    expect(legaturaEmail('en-home', subiect('en-home'), 'c', gol)).toBeNull()
    expect(numarAfisat(gol)).toBe('')
    expect(randNumarWhatsApp(gol)).toBeNull()
    expect(randNumarWhatsApp(md)).toBe('WhatsApp: +' + ['373', '68', '055', '599'].join(' '))
    // Fara WhatsApp, numarul nu se afiseaza ca numar de WhatsApp (nu exista alt canal pe numar dupa decizia 56).
    expect(randNumarWhatsApp({ ...md, whatsapp: '' })).toBeNull()
    expect(numarAfisat(md)).toBe('+' + ['373', '68', '055', '599'].join(' '))
    // Alta tara sau alta lungime: forma E.164, neimpartita.
    expect(numarAfisat({ ...md, telefon: '+4912345678901' })).toBe('+4912345678901')
    expect(numarAfisat({ ...md, telefon: '+3736800000' })).toBe('+3736800000')
  })
})

// ---------------------------------------------------------------------------------------------
// Formularele oprite: stare si punctul /api/formular
// ---------------------------------------------------------------------------------------------

describe('formulare=false: formularul si /api/formular', () => {
  it('stareFormular: oprit oricare ar fi operatorul', () => {
    expect(stareFormular(OPERATOR_SINTETIC, null, false, false).activ).toBe(false)
    expect(stareFormular(null, null, false, false).activ).toBe(false)
  })

  it('404 fara citirea corpului, inaintea operatorului complet si a destinatiei', async () => {
    const d = destinatie()
    const { cerere: c, citiri } = cerereNumarata()
    const r = await trateazaCerere(c, {
      formulare: false,
      operator: OPERATOR_SINTETIC,
      destinatie: DESTINATIE,
      trimite: d.trimite,
      site: SITE,
    })
    expect(r.status).toBe(404)
    expect(citiri()).toBe(0)
    expect(d.trimise()).toBe(0)
    // Si fara operator: tot 404, nu 503 (primul test e al canalului).
    expect((await trateazaCerere(cerere(), { formulare: false, operator: null, destinatie: DESTINATIE, site: SITE })).status).toBe(404)
  })

  it('martor pozitiv: aceeasi cerere cu formulare=true trece (200, o trimitere)', async () => {
    const d = destinatie()
    const r = await trateazaCerere(cerere(), {
      formulare: true,
      operator: OPERATOR_SINTETIC,
      destinatie: DESTINATIE,
      trimite: d.trimite,
      site: SITE,
    })
    expect(r.status).toBe(200)
    expect(d.trimise()).toBe(1)
  })

  it('cap la cap prin variabila: CANALE_JSON cu formulare=false opreste stareFormular si API-ul', async () => {
    vi.stubEnv('CANALE_JSON', json3sMd())
    vi.resetModules()
    const logica = await import('../src/app/api/formular/logica')
    const stare = await import('../src/components/formular/stare')
    const canale = await import('../src/content/canale')
    expect(canale.CANALE.formulare).toBe(false)
    expect(canale.CANALE.whatsapp).toBe(NUMAR)
    expect(stare.stareFormular(OPERATOR_SINTETIC, null, false).activ).toBe(false)
    const d = destinatie()
    const r = await logica.trateazaCerere(cerere(), {
      operator: OPERATOR_SINTETIC,
      destinatie: DESTINATIE,
      trimite: d.trimite,
      site: SITE,
    })
    expect(r.status).toBe(404)
    expect(d.trimise()).toBe(0)
  })

  it('cap la cap, martor: CANALE_JSON cu formulare=true lasa formularul si API-ul pornite', async () => {
    vi.stubEnv('CANALE_JSON', json3sMd({ formulare: true }))
    vi.resetModules()
    const logica = await import('../src/app/api/formular/logica')
    const stare = await import('../src/components/formular/stare')
    expect(stare.stareFormular(OPERATOR_SINTETIC, null, false).activ).toBe(true)
    const d = destinatie()
    const r = await logica.trateazaCerere(cerere(), {
      operator: OPERATOR_SINTETIC,
      destinatie: DESTINATIE,
      trimite: d.trimite,
      site: SITE,
    })
    expect(r.status).toBe(200)
    expect(d.trimise()).toBe(1)
  })

  it('cap la cap: o variabila stricata opreste incarcarea modulului, cu numele variabilei', async () => {
    vi.stubEnv('CANALE_JSON', '{"formulare": false}')
    vi.resetModules()
    await expect(import('../src/content/canale')).rejects.toThrow(/CANALE_JSON: campul "formulare"/)
  })
})
