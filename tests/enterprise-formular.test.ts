import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MARIME_MAXIMA, destinatieValida, trateazaCerere } from '../src/app/api/formular/logica'
import { asteptare, DURATA_BUCLA, MOMENTE_PASI, PAS_FINAL } from '../src/components/enterprise/BandaDrumDocument'
import { EVENIMENTE, FORMULARE } from '../src/components/consimtamant/evenimente'
import { distanta, propunereEmail } from '../src/components/formular/corector'
import { corpPrevizualizare, subiectPrevizualizare } from '../src/components/formular/FormularContact'
import SectiuneFormular from '../src/components/formular/SectiuneFormular'
import { stareFormular } from '../src/components/formular/stare'
import { TIPURI_FORMULAR, citesteCorp, valideaza, type DateFormular } from '../src/components/formular/validare'
import { abateriMetadata } from '../src/components/seo/metadata'
import { CALE_ENTERPRISE, DRUM_DOCUMENT, EROU_ENTERPRISE, LIVRABILE, META_ENTERPRISE } from '../src/content/enterprise'
import { RUTE } from '../src/content/rute'
import type { Operator } from '../src/lib/operator'

/**
 * Felia enterprise-formular: pagina /enterprise si formularul de contact comun.
 *
 * Comutatorul (planul valului S4, §10) se masoara aici pe LOGICA punctului de trimitere, cu operatorul
 * si destinatia date explicit: cu operator `null` raspunsul e "inactiv" si corpul cererii NU se
 * citeste (martor: un corp care arunca la citire); cu un operator SINTETIC si o destinatie de proba,
 * cererea pleaca o data, cu exact campurile formularului. Proba de browser
 * (tests/browser/enterprise-formular.spec.ts) masoara acelasi lucru pe build-ul real si pe o copie
 * construita cu operatorul sintetic.
 *
 * Fixturile (adrese, operator) se asambleaza la rulare: o proba care poarta literal o adresa
 * personala de posta ar fi ea insasi o instanta pentru poarta de scurgeri.
 */

const OPERATOR_SINTETIC: Operator = {
  denumire: ['Operator', 'Sintetic', 'Proba', 'SRL'].join(' '),
  sediu: 'Strada Exemplului 1, Pitesti',
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}

const DESTINATIE = 'https://' + ['destinatie', 'proba', 'test'].join('.') + '/formulare'

const VALID: DateFormular = {
  nume: 'Ioana Proba',
  email: ['ioana', ['firma-proba', 'test'].join('.')].join('@'),
  telefon: '',
  companie: 'Firma Proba',
  mesaj: 'Avem 40 de cutii de arhiva.',
  marketing: false,
}

function cerere(corp: unknown): Request {
  return new Request('http://127.0.0.1/api/formular', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corp),
  })
}

/** O cerere al carei corp arunca la citire: martorul ca punctul inactiv nu citeste nimic. */
function cerereNecitibila(): { cerere: Request; citit: () => boolean } {
  let citit = false
  const corp = new ReadableStream({
    pull() {
      citit = true
      throw new Error('corpul nu avea voie sa fie citit')
    },
  }, { highWaterMark: 0 })
  const c = new Request('http://127.0.0.1/api/formular', {
    method: 'POST',
    body: corp,
    headers: { 'Content-Type': 'application/json' },
    // @ts-expect-error: Node cere `duplex` pentru un corp de tip flux
    duplex: 'half',
  })
  return { cerere: c, citit: () => citit }
}

type Trimis = { url: string; corp: Record<string, unknown> }
function destinatieDeProba(status = 200): { trimite: typeof fetch; trimise: Trimis[] } {
  const trimise: Trimis[] = []
  const trimite = (async (url: string | URL | Request, init?: RequestInit) => {
    trimise.push({ url: String(url), corp: JSON.parse(String(init?.body)) })
    return new Response(null, { status })
  }) as typeof fetch
  return { trimite, trimise }
}

describe('validarea formularului', () => {
  it('numele, adresa si mesajul sunt obligatorii; telefonul si firma nu', () => {
    const gol: DateFormular = { nume: '', email: '', telefon: '', companie: '', mesaj: '', marketing: false }
    expect(valideaza(gol)).toEqual({ nume: 'lipsa', email: 'lipsa', mesaj: 'lipsa' })
    expect(valideaza(VALID)).toEqual({})
  })

  it('adresa fara @ si telefonul cu litere au eroare de forma', () => {
    expect(valideaza({ ...VALID, email: 'fara-arond' })).toEqual({ email: 'forma' })
    expect(valideaza({ ...VALID, telefon: '07ab' })).toEqual({ telefon: 'forma' })
    expect(valideaza({ ...VALID, telefon: '+40 7xx' })).toEqual({ telefon: 'forma' })
    expect(valideaza({ ...VALID, telefon: '+40 (721) 000-111' })).toEqual({})
  })

  it('bifa de noutati nu schimba niciodata rezultatul (G-MD-07)', () => {
    expect(valideaza({ ...VALID, marketing: true })).toEqual(valideaza({ ...VALID, marketing: false }))
  })

  it('corpul se citeste strict: chei straine sau tipuri gresite inseamna respingere', () => {
    expect(citesteCorp({ formular: 'enterprise', ...VALID })).not.toBeNull()
    expect(citesteCorp({ formular: 'enterprise', ...VALID, extra: 1 })).toBeNull()
    expect(citesteCorp({ formular: 'altul', ...VALID })).toBeNull()
    expect(citesteCorp({ formular: 'enterprise', ...VALID, marketing: 'da' })).toBeNull()
    expect(citesteCorp([])).toBeNull()
  })
})

describe('corectorul de e-mail', () => {
  const domeniu = (d: string) => 'ana@' + d
  it('propune domeniul mare cand cel scris e la cel mult doua editari (inclusiv litere inversate)', () => {
    expect(propunereEmail(domeniu(['gmial', 'com'].join('.')))).toBe(domeniu(['gmail', 'com'].join('.')))
    expect(propunereEmail(domeniu(['yahooo', 'com'].join('.')))).toBe(domeniu(['yahoo', 'com'].join('.')))
    expect(propunereEmail(domeniu(['outlok', 'com'].join('.')))).toBe(domeniu(['outlook', 'com'].join('.')))
  })

  it('martor negativ: domeniul corect sau un domeniu de firma nu primesc propunere', () => {
    expect(propunereEmail(domeniu(['gmail', 'com'].join('.')))).toBeNull()
    expect(propunereEmail(domeniu(['firma-proba', 'ro'].join('.')))).toBeNull()
    expect(propunereEmail('fara-arond')).toBeNull()
  })

  it('domeniile reale vecine cu unul mare (la 1-2 editari) nu sunt corectate spre acela', () => {
    expect(propunereEmail(domeniu(['ymail', 'com'].join('.')))).toBeNull()
    expect(propunereEmail(domeniu(['email', 'ro'].join('.')))).toBeNull()
    // martor: o greseala reala pe acelasi domeniu vecin tot primeste propunere
    expect(propunereEmail(domeniu(['ymial', 'com'].join('.')))).toBe(domeniu(['ymail', 'com'].join('.')))
  })

  it('distanta numara o transpozitie ca o singura editare', () => {
    expect(distanta('ab', 'ba')).toBe(1)
    expect(distanta('abc', 'abc')).toBe(0)
    expect(distanta('abc', 'xyz')).toBe(3)
  })
})

describe('punctul de trimitere: comutatorul operatorului', () => {
  it('martor pozitiv: citirea corpului necitibil chiar se vede', async () => {
    const { cerere: c, citit } = cerereNecitibila()
    expect(citit()).toBe(false)
    await c.text().catch(() => undefined)
    expect(citit()).toBe(true)
  })

  it('operator null: "inactiv", fara sa citeasca corpul si fara sa trimita, chiar cu destinatie setata', async () => {
    const { cerere: c, citit } = cerereNecitibila()
    const d = destinatieDeProba()
    const r = await trateazaCerere(c, { operator: null, destinatie: DESTINATIE, trimite: d.trimite })
    expect(r.status).toBe(503)
    expect(await r.json()).toEqual({ stare: 'inactiv', motiv: 'fara-operator' })
    expect(citit()).toBe(false)
    expect(d.trimise).toEqual([])
  })

  it('configurarea reala de azi (config/operator.json) tine formularul inactiv', () => {
    const s = stareFormular()
    expect(s.activ).toBe(false)
    expect(s.operator).toBeNull()
  })

  it('operator sintetic fara destinatie: tot "inactiv", fara citire', async () => {
    const { cerere: c, citit } = cerereNecitibila()
    const r = await trateazaCerere(c, { operator: OPERATOR_SINTETIC, destinatie: undefined })
    expect(await r.json()).toEqual({ stare: 'inactiv', motiv: 'fara-destinatie' })
    expect(citit()).toBe(false)
  })

  it('operator sintetic + destinatie de proba: pleaca exact o cerere, cu campurile formularului', async () => {
    const d = destinatieDeProba()
    const r = await trateazaCerere(cerere({ formular: 'enterprise', ...VALID, marketing: true }), {
      operator: OPERATOR_SINTETIC,
      destinatie: DESTINATIE,
      trimite: d.trimite,
    })
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ stare: 'trimis' })
    expect(d.trimise).toHaveLength(1)
    expect(d.trimise[0].url).toBe(DESTINATIE)
    const { primit, ...rest } = d.trimise[0].corp
    expect(typeof primit).toBe('string')
    expect(rest).toEqual({ formular: 'enterprise', ...VALID, marketing: true })
  })

  it('destinatia care raspunde 500 da 502 (formularul trece in starea de rezerva)', async () => {
    const d = destinatieDeProba(500)
    const r = await trateazaCerere(cerere({ formular: 'enterprise', ...VALID }), {
      operator: OPERATOR_SINTETIC,
      destinatie: DESTINATIE,
      trimite: d.trimite,
    })
    expect(r.status).toBe(502)
  })

  it('respinge fara sa trimita: campuri lipsa, chei straine, corp prea mare', async () => {
    const d = destinatieDeProba()
    const mediu = { operator: OPERATOR_SINTETIC, destinatie: DESTINATIE, trimite: d.trimite }
    expect((await trateazaCerere(cerere({ formular: 'enterprise', ...VALID, nume: '' }), mediu)).status).toBe(400)
    expect((await trateazaCerere(cerere({ formular: 'enterprise', ...VALID, x: 1 }), mediu)).status).toBe(400)
    const mare = cerere({ formular: 'enterprise', ...VALID, mesaj: 'a'.repeat(MARIME_MAXIMA) })
    expect((await trateazaCerere(mare, mediu)).status).toBe(413)
    expect(d.trimise).toEqual([])
  })

  it('destinatia e HTTPS, sau HTTP numai pe masina locala', () => {
    expect(destinatieValida(DESTINATIE)).not.toBeNull()
    expect(destinatieValida('http://127.0.0.1:9/x')).not.toBeNull()
    expect(destinatieValida('http://' + ['destinatie', 'proba', 'test'].join('.'))).toBeNull()
    expect(destinatieValida('')).toBeNull()
    expect(destinatieValida('nu e adresa')).toBeNull()
  })
})

describe('formularul randat pe server (FORM-01..07, G-MD-06/07)', () => {
  const randeaza = (stare = stareFormular()) =>
    renderToStaticMarkup(
      createElement(SectiuneFormular, {
        formular: 'enterprise',
        id: 'contact-form',
        eticheta: 'E',
        titlu: 'Titlu',
        subtitlu: 'Sub',
        exempluMesaj: 'Exemplu',
        subiect: 'Subiect',
        stare,
      }),
    )

  it('fiecare camp are name si autocomplete; niciun camp nu are required in HTML', () => {
    const html = randeaza()
    for (const [nume, auto] of [
      ['nume', 'name'],
      ['email', 'email'],
      ['telefon', 'tel'],
      ['companie', 'organization'],
      ['mesaj', 'off'],
    ]) {
      expect(html).toMatch(new RegExp('name="' + nume + '"[^>]*autoComplete="' + auto + '"|autoComplete="' + auto + '"[^>]*name="' + nume + '"', 'i'))
    }
    expect(html).not.toMatch(/\srequired(=|\s|>)/)
  })

  it('bifa de noutati e separata, nebifata si neobligatorie', () => {
    const html = randeaza()
    const bifa = html.match(/<input[^>]*type="checkbox"[^>]*>/g) ?? []
    expect(bifa).toHaveLength(1)
    expect(bifa[0]).toContain('name="marketing"')
    expect(bifa[0]).not.toMatch(/checked|required/)
  })

  it('nota de informare e IN formular: scopul, temeiul precontractual, pastrarea, legatura spre politica', () => {
    const html = randeaza()
    const form = html.slice(html.indexOf('<form'), html.indexOf('</form>'))
    expect(form).toContain('data-informare-formular')
    expect(form).toContain('demersuri precontractuale')
    expect(form).toContain('cel mult 12 luni')
    expect(form).toContain('politica de confidențialitate')
    // Politica nu e publicata: legatura e inerta, cu tinta ei asteptata.
    expect(form).toContain('data-tinta-lipsa="/juridic/confidentialitate"')
    expect(html).not.toMatch(/vă dați consimțământul/i)
  })

  it('cu operator sintetic, nota il numeste', () => {
    const html = randeaza(stareFormular(OPERATOR_SINTETIC, null, false))
    expect(html).toContain(OPERATOR_SINTETIC.denumire)
  })
})

describe('previzualizarea de rezerva', () => {
  it('un camp completat pe rand, cele goale lipsesc, apoi mesajul', () => {
    const corp = corpPrevizualizare({ ...VALID, telefon: '' })
    expect(corp.split('\n')).toEqual([
      'Nume complet: ' + VALID.nume,
      'Adresă de e-mail: ' + VALID.email,
      'Firmă: ' + VALID.companie,
      '',
      VALID.mesaj,
    ])
    expect(subiectPrevizualizare('Cerere', VALID)).toBe('Cerere - Firma Proba')
    expect(subiectPrevizualizare('Cerere', { ...VALID, companie: ' ' })).toBe('Cerere')
  })
})

describe('bucla benzii: 11 s in 10 pasi (enterprise.md §2)', () => {
  it('momentele masurate si durata buclei', () => {
    expect(MOMENTE_PASI).toEqual([2000, 2800, 3400, 4000, 4700, 5300, 5900, 6800, 7800])
    expect(DURATA_BUCLA).toBe(11_000)
    let total = 0
    for (let p = 0; p <= PAS_FINAL; p++) total += asteptare(p)
    expect(total).toBe(DURATA_BUCLA)
  })
})

describe('pagina /enterprise: ruta, metadata, continut', () => {
  it('ruta e in RUTE si metadata e in pragurile portii', () => {
    expect(RUTE.map((r) => r.cale)).toContain(CALE_ENTERPRISE)
    expect(abateriMetadata({ titlu: META_ENTERPRISE.titlu, descriere: META_ENTERPRISE.descriere, cale: CALE_ENTERPRISE })).toEqual([])
  })

  it('forma masurata: 5 + 5 + 3 + 5 elemente in diagrama, 5 fapte (2 mono), 6 livrabile, 4 elemente de incredere', () => {
    expect(DRUM_DOCUMENT.intrare.elemente).toHaveLength(5)
    expect(DRUM_DOCUMENT.intelegere.elemente).toHaveLength(5)
    expect(DRUM_DOCUMENT.stocare.pastile).toHaveLength(3)
    expect(DRUM_DOCUMENT.iesire.elemente).toHaveLength(5)
    expect(DRUM_DOCUMENT.fapte).toHaveLength(5)
    expect(DRUM_DOCUMENT.fapte.filter((f) => f.mono)).toHaveLength(2)
    expect(LIVRABILE.elemente).toHaveLength(6)
    expect(EROU_ENTERPRISE.incredere).toHaveLength(4)
  })

  it('documentul din banda e declarat ca exemplu pe pagina (D9)', () => {
    expect(DRUM_DOCUMENT.nota.startsWith('Exemplu fictiv')).toBe(true)
  })

  it('fara regiuni multiple si fara oras de gazduire (D4c)', () => {
    const tot = JSON.stringify({ EROU_ENTERPRISE, DRUM_DOCUMENT, LIVRABILE, META_ENTERPRISE })
    expect(tot).not.toMatch(/două regiuni|doua regiuni|Frankfurt/i)
  })

  it('formularul foloseste evenimentele din lista inchisa si un tip de formular cunoscut', () => {
    expect(FORMULARE).toContain('enterprise')
    expect([...TIPURI_FORMULAR]).toEqual([...FORMULARE])
    expect(stareFormular().analitica).toBe(false)
    expect(Object.keys(EVENIMENTE)).toEqual(expect.arrayContaining(['formular_inceput', 'formular_trimis']))
  })
})
