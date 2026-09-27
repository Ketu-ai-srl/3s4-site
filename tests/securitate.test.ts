import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import nextConfig, { CSP, HSTS, anteteSecuritate } from '../next.config'
import { CALE_SECURITY_TXT, ZILE_VALABILITATE, textSecurity } from '../src/app/.well-known/security.txt/continut'
import { GET as getSecurity } from '../src/app/.well-known/security.txt/route'
import {
  CERERI_PE_FEREASTRA,
  FEREASTRA_RATA_MS,
  LimitaRata,
  adresaClient,
  citesteCorpLimitat,
  originePermisa,
  tipJson,
} from '../src/app/api/formular/garda'
import {
  ANTET_SECRET,
  DURATA_MINIMA_MS,
  MARIME_MAXIMA,
  trateazaCerere,
  versiuneInformare,
} from '../src/app/api/formular/logica'
import { CALE_EVIDENTA, MARIME_MAXIMA as MARIME_EVIDENTA } from '../src/components/consimtamant/evidenta'
import {
  CAMP_CAPCANA,
  CHEIE_DURATA,
  DURATA_MINIMA_MS as PRAG_FORMULAR,
  asteptareInainteDeTrimitere,
  citesteCorp,
} from '../src/components/formular/validare'
import { BLOC_RAPORTARE, EMAIL_SECURITATE } from '../src/content/produs/securitate'
import { adresaSite } from '../src/lib/site'
import type { Operator } from '../src/lib/operator'

// Evidenta consimtamantului exista numai cu analitica pornita; aici o pornim pentru middleware, fara
// sa atingem configurarea reala (operatorul ramane null in `config/operator.json`).
vi.mock('../src/lib/analitica', async (original) => {
  const real = await original<typeof import('../src/lib/analitica')>()
  return { ...real, stareAnalitica: () => ({ activa: true, idGa4: ['G', 'PROBA' + String(66)].join('-') }) }
})

const { middleware } = await import('../src/middleware')

/**
 * Felia de securitate (auditul ISO 27001 al site-ului, 27.09): antetele (3S4-F-007), garda punctelor
 * publice de scriere (3S4-F-008), security.txt si canalul de raportare (3S4-F-026), versiunea notei
 * de informare si secretul destinatiei (3S4-F-045).
 *
 * Fiecare regula are martorul ei: o cerere care TREBUIE sa treaca langa una care TREBUIE oprita, ca
 * un zero sa nu poata veni dintr-o proba care nu atinge calea. Fixturile se asambleaza la rulare.
 */

const SITE = adresaSite()
const STRAIN = 'https://' + ['alt-site', 'invalid'].join('.')

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

const VALID = {
  formular: 'enterprise',
  nume: 'Ion Exemplu',
  email: ['ion', ['exemplu-proba', 'test'].join('.')].join('@'),
  telefon: '',
  companie: 'Alfa Exemplu SRL',
  mesaj: 'Un mesaj de proba.',
  marketing: false,
  [CHEIE_DURATA]: 12_000,
}

type Trimis = { url: string; antete: Record<string, string>; corp: Record<string, unknown> }

function destinatieDeProba(status = 200): { trimite: typeof fetch; trimise: Trimis[] } {
  const trimise: Trimis[] = []
  const trimite = (async (url: string | URL | Request, init?: RequestInit) => {
    trimise.push({
      url: String(url),
      antete: { ...(init?.headers as Record<string, string>) },
      corp: JSON.parse(String(init?.body)),
    })
    return new Response(null, { status })
  }) as typeof fetch
  return { trimite, trimise }
}

let ipUrmator = 1
/** O adresa noua pentru fiecare cerere care nu masoara rata: limita e a procesului, nu a probei. */
function ipNou(): string {
  ipUrmator += 1
  return '198.51.100.' + (ipUrmator % 250) + ', 10.0.0.1'
}

function cerere(corp: unknown, antete: Record<string, string> = {}): Request {
  return new Request('http://127.0.0.1/api/formular', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: SITE, 'X-Forwarded-For': ipNou(), ...antete },
    body: typeof corp === 'string' ? corp : JSON.stringify(corp),
  })
}

/** O cerere al carei corp numara citirile: martorul ca garda raspunde INAINTE de citire. */
function cerereNumarata(antete: Record<string, string>): { cerere: Request; citiri: () => number } {
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
    headers: antete,
    // @ts-expect-error: Node cere `duplex` pentru un corp de tip flux
    duplex: 'half',
  })
  return { cerere: c, citiri: () => citiri }
}

// ---------------------------------------------------------------------------------------------
// 3S4-F-007: antetele
// ---------------------------------------------------------------------------------------------

describe('antetele de securitate (3S4-F-007)', () => {
  const asteptate = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Content-Security-Policy': CSP,
  }

  it('cele sase antete, fara HSTS in afara productiei (martor negativ: local, staging, nesetat)', () => {
    for (const mediu of ['local', 'staging', undefined]) {
      const antete = Object.fromEntries(anteteSecuritate(mediu).map((a) => [a.key, a.value]))
      expect(antete).toEqual(asteptate)
    }
  })

  it('martor pozitiv: HSTS apare numai cu SITE_ENV=productie', () => {
    const antete = Object.fromEntries(anteteSecuritate('productie').map((a) => [a.key, a.value]))
    expect(antete).toEqual({ ...asteptate, 'Strict-Transport-Security': HSTS })
    expect(HSTS).toBe('max-age=31536000; includeSubDomains')
  })

  it('CSP-ul impus nu atinge scripturile (fara script-src, fara default-src)', () => {
    expect(CSP.split('; ').sort()).toEqual(["base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "object-src 'none'"])
    expect(CSP).not.toMatch(/script-src|default-src/)
  })

  it('configurarea Next le pune pe toate caile, din mediul construirii', async () => {
    const vechi = process.env.SITE_ENV
    try {
      process.env.SITE_ENV = 'productie'
      const cuHsts = await nextConfig.headers!()
      process.env.SITE_ENV = 'local'
      const faraHsts = await nextConfig.headers!()
      expect(cuHsts).toHaveLength(1)
      expect(cuHsts[0].source).toBe('/:path*')
      expect(cuHsts[0].headers.map((h) => h.key)).toContain('Strict-Transport-Security')
      expect(faraHsts[0].headers.map((h) => h.key)).not.toContain('Strict-Transport-Security')
    } finally {
      if (vechi === undefined) delete process.env.SITE_ENV
      else process.env.SITE_ENV = vechi
    }
  })
})

// ---------------------------------------------------------------------------------------------
// 3S4-F-026: security.txt si blocul de raportare
// ---------------------------------------------------------------------------------------------

describe('security.txt (RFC 9116) si canalul de raportare (3S4-F-026)', () => {
  const ZI = 24 * 60 * 60 * 1000

  it('campurile cerute, cu Expires = momentul construirii + 180 de zile, sub un an', () => {
    const acum = new Date('2026-09-27T10:00:00.000Z')
    const text = textSecurity(SITE, acum)
    const campuri = Object.fromEntries(
      text
        .trim()
        .split('\n')
        .map((r) => [r.slice(0, r.indexOf(':')), r.slice(r.indexOf(':') + 2)]),
    )
    expect(campuri).toEqual({
      Contact: 'mailto:' + EMAIL_SECURITATE,
      Expires: new Date(acum.getTime() + ZILE_VALABILITATE * ZI).toISOString(),
      'Preferred-Languages': 'ro, en',
      Policy: SITE + '/securitate',
      Canonical: SITE + CALE_SECURITY_TXT,
    })
    expect(ZILE_VALABILITATE).toBe(180)
    expect(text.endsWith('\n')).toBe(true)
  })

  it('ruta calculeaza Expires la rulare (nu o data scrisa de mana) si foloseste adresa site-ului', async () => {
    const inainte = Date.now()
    const r = getSecurity()
    const text = await r.text()
    const expira = Date.parse(/^Expires: (.+)$/m.exec(text)?.[1] ?? '')
    expect(r.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(expira - inainte).toBeGreaterThanOrEqual(ZILE_VALABILITATE * ZI - 1000)
    expect(expira - Date.now()).toBeLessThanOrEqual(ZILE_VALABILITATE * ZI + 1000)
    expect(text).toContain('Canonical: ' + SITE + CALE_SECURITY_TXT)
  })

  it('Policy si Canonical se muta cu domeniul (martor: alta origine da alte valori)', () => {
    const alt = 'https://' + ['domeniu-nou', 'test'].join('.')
    const text = textSecurity(alt, new Date())
    expect(text).toContain('Policy: ' + alt + '/securitate')
    expect(text).not.toContain(SITE)
  })

  it('blocul de raportare trimite la adresa de securitate, nu la formularul inactiv', () => {
    expect(EMAIL_SECURITATE).toBe(['security', ['3s', 'com', 'ro'].join('.')].join('@'))
    expect(BLOC_RAPORTARE.buton.href).toBe('mailto:' + EMAIL_SECURITATE)
    expect(BLOC_RAPORTARE.buton.ruta).toBeNull()
    expect(JSON.stringify(BLOC_RAPORTARE)).not.toContain('/contact')
  })
})

// ---------------------------------------------------------------------------------------------
// 3S4-F-008: garda, pe piese
// ---------------------------------------------------------------------------------------------

describe('garda: originea si tipul (3S4-F-008)', () => {
  const cu = (antete: Record<string, string>) => new Request('http://127.0.0.1:4660/x', { method: 'POST', headers: antete })

  it('originea site-ului trece; alta origine, "null" sau o forma stricata nu', () => {
    expect(originePermisa(cu({ origin: SITE }), SITE)).toBe(true)
    expect(originePermisa(cu({ origin: STRAIN }), SITE)).toBe(false)
    expect(originePermisa(cu({ origin: 'null' }), SITE)).toBe(false)
    expect(originePermisa(cu({ origin: SITE + '/cale' }), SITE)).toBe(false)
  })

  it('lipsa antetului: respinsa implicit, acceptata numai cand se cere explicit', () => {
    expect(originePermisa(cu({}), SITE)).toBe(false)
    expect(originePermisa(cu({}), SITE, 'accepta')).toBe(true)
  })

  it('bucla locala trece numai cand coincide cu gazda cererii (probele pe 127.0.0.1)', () => {
    expect(originePermisa(cu({ origin: 'http://127.0.0.1:4660', host: '127.0.0.1:4660' }), SITE)).toBe(true)
    expect(originePermisa(cu({ origin: 'http://127.0.0.1:4660', host: '127.0.0.1:9999' }), SITE)).toBe(false)
    expect(originePermisa(cu({ origin: 'http://127.0.0.1:4660', host: new URL(SITE).host }), SITE)).toBe(false)
  })

  it('numai application/json, cu parametri permisi', () => {
    expect(tipJson(cu({ 'content-type': 'application/json' }))).toBe(true)
    expect(tipJson(cu({ 'content-type': 'Application/JSON; charset=utf-8' }))).toBe(true)
    expect(tipJson(cu({ 'content-type': 'text/plain' }))).toBe(false)
    expect(tipJson(cu({ 'content-type': 'application/x-www-form-urlencoded' }))).toBe(false)
    expect(tipJson(cu({}))).toBe(false)
  })

  it('adresa clientului e PRIMA din X-Forwarded-For; fara antet sau de bucla (masina insasi), null', () => {
    expect(adresaClient(cu({ 'x-forwarded-for': '203.0.113.7, 10.0.0.2' }))).toBe('203.0.113.7')
    expect(adresaClient(cu({ 'x-forwarded-for': '172.18.0.5' }))).toBe('172.18.0.5')
    expect(adresaClient(cu({}))).toBeNull()
    for (const bucla of ['127.0.0.1', '::1', '::ffff:127.0.0.1', '127.8.9.10, 203.0.113.7']) {
      expect(adresaClient(cu({ 'x-forwarded-for': bucla })), bucla).toBeNull()
    }
    // Martor: o adresa care doar INCEPE ca bucla, dar nu e, se numara.
    expect(adresaClient(cu({ 'x-forwarded-for': '127.0.0.1.203' }))).toBe('127.0.0.1.203')
  })
})

describe('garda: limita de rata (3S4-F-008)', () => {
  it(CERERI_PE_FEREASTRA + ' cereri pe minut pe adresa trec, a urmatoarea nu; alta adresa nu e atinsa', () => {
    const l = new LimitaRata()
    const t = 1_000_000
    for (let i = 0; i < CERERI_PE_FEREASTRA; i++) expect(l.permite('203.0.113.1', t + i)).toBe(true)
    expect(l.permite('203.0.113.1', t + 100)).toBe(false)
    expect(l.permite('203.0.113.2', t + 100)).toBe(true)
    expect(l.secundeRamase('203.0.113.1', t + 100)).toBe(Math.ceil((FEREASTRA_RATA_MS - 100) / 1000))
  })

  it('fereastra se reia dupa 60 s', () => {
    const l = new LimitaRata()
    for (let i = 0; i < CERERI_PE_FEREASTRA; i++) l.permite('203.0.113.3', 0)
    expect(l.permite('203.0.113.3', FEREASTRA_RATA_MS - 1)).toBe(false)
    expect(l.permite('203.0.113.3', FEREASTRA_RATA_MS)).toBe(true)
  })

  it('o cerere fara proxy (fara X-Forwarded-For) nu se numara', () => {
    const l = new LimitaRata()
    for (let i = 0; i < CERERI_PE_FEREASTRA * 5; i++) expect(l.permite(null, 0)).toBe(true)
  })
})

describe('garda: corpul citit in flux, cu limita in OCTETI (3S4-F-008)', () => {
  const flux = (bucati: string[], antete: Record<string, string> = {}) => {
    let trase = 0
    const coada = [...bucati]
    const corp = new ReadableStream<Uint8Array>({
      pull(c) {
        trase += 1
        const b = coada.shift()
        if (b === undefined) c.close()
        else c.enqueue(new TextEncoder().encode(b))
      },
    }, { highWaterMark: 0 })
    // @ts-expect-error: Node cere `duplex` pentru un corp de tip flux
    const r = new Request('http://127.0.0.1/x', { method: 'POST', body: corp, headers: antete, duplex: 'half' })
    return { r, trase: () => trase }
  }

  it('martor: 600 de litere cu diacritice au 600 de caractere, dar 1200 de octeti - se opresc la 1024', async () => {
    const text = 'ă'.repeat(600)
    expect(text.length).toBeLessThan(MARIME_EVIDENTA)
    expect(new TextEncoder().encode(text).byteLength).toBeGreaterThan(MARIME_EVIDENTA)
    const { r } = flux([text])
    expect((await citesteCorpLimitat(r, MARIME_EVIDENTA)).stare).toBe('prea-mare')
  })

  it('fara Content-Length (fragmentat), citirea se opreste la prima bucata care trece de limita', async () => {
    const bucata = 'a'.repeat(400)
    const { r, trase } = flux(Array.from({ length: 50 }, () => bucata))
    expect((await citesteCorpLimitat(r, MARIME_EVIDENTA)).stare).toBe('prea-mare')
    expect(trase()).toBeLessThan(10)
  })

  it('Content-Length declarat peste limita: refuz fara citire', async () => {
    const { r, trase } = flux(['{}'], { 'content-length': String(MARIME_EVIDENTA + 1) })
    expect((await citesteCorpLimitat(r, MARIME_EVIDENTA)).stare).toBe('prea-mare')
    expect(trase()).toBe(0)
  })

  it('martor pozitiv: un corp sub limita se citeste intreg, cu diacritice', async () => {
    const { r } = flux(['{"a":"ș', 'ț"}'])
    expect(await citesteCorpLimitat(r, MARIME_EVIDENTA)).toEqual({ stare: 'citit', text: '{"a":"șț"}' })
  })
})

// ---------------------------------------------------------------------------------------------
// 3S4-F-008 si 3S4-F-045: punctul /api/formular
// ---------------------------------------------------------------------------------------------

describe('punctul /api/formular: garda, capcana, versiunea, secretul', () => {
  const mediu = (d = destinatieDeProba(), extra: Record<string, unknown> = {}) => ({
    operator: OPERATOR_SINTETIC,
    destinatie: DESTINATIE,
    trimite: d.trimite,
    site: SITE,
    ...extra,
  })

  it('comutatorul ramane primul: fara operator, 503 fara citire chiar si cu alta origine', async () => {
    const { cerere: c, citiri } = cerereNumarata({ Origin: STRAIN, 'Content-Type': 'text/plain' })
    const r = await trateazaCerere(c, { operator: null, destinatie: DESTINATIE, site: SITE })
    expect(r.status).toBe(503)
    expect(citiri()).toBe(0)
  })

  it('martor pozitiv: cererea buna, de pe site, pleaca o data, cu versiunea notei', async () => {
    const d = destinatieDeProba()
    const r = await trateazaCerere(cerere(VALID), mediu(d))
    expect(r.status).toBe(200)
    expect(d.trimise).toHaveLength(1)
    expect(d.trimise[0].corp.versiune_informare).toBe(versiuneInformare('enterprise', OPERATOR_SINTETIC))
    expect(String(d.trimise[0].corp.versiune_informare)).toMatch(/^ro-[0-9a-f]{8}$/)
    expect(Object.keys(d.trimise[0].corp)).not.toContain(CAMP_CAPCANA)
    expect(Object.keys(d.trimise[0].corp)).not.toContain(CHEIE_DURATA)
  })

  it('alta origine, lipsa originii sau alt tip de corp: 403 INAINTE de citire, nimic trimis', async () => {
    const d = destinatieDeProba()
    const variante: Record<string, string>[] = [
      { Origin: STRAIN, 'Content-Type': 'application/json', 'X-Forwarded-For': ipNou() },
      { 'Content-Type': 'application/json', 'X-Forwarded-For': ipNou() },
      { Origin: SITE, 'Content-Type': 'text/plain', 'X-Forwarded-For': ipNou() },
      { Origin: SITE, 'X-Forwarded-For': ipNou() },
    ]
    for (const antete of variante) {
      const { cerere: c, citiri } = cerereNumarata(antete)
      const r = await trateazaCerere(c, mediu(d))
      expect(r.status, JSON.stringify(antete)).toBe(403)
      expect(citiri(), JSON.stringify(antete)).toBe(0)
    }
    expect(d.trimise).toEqual([])
  })

  it('a ' + (CERERI_PE_FEREASTRA + 1) + '-a cerere pe minut de la aceeasi adresa: 429 cu Retry-After, fara citire', async () => {
    const d = destinatieDeProba()
    const m = mediu(d, { limita: new LimitaRata() })
    const ip = '203.0.113.50'
    for (let i = 0; i < CERERI_PE_FEREASTRA; i++) {
      expect((await trateazaCerere(cerere(VALID, { 'X-Forwarded-For': ip }), m)).status).toBe(200)
    }
    const { cerere: c, citiri } = cerereNumarata({ Origin: SITE, 'Content-Type': 'application/json', 'X-Forwarded-For': ip })
    const r = await trateazaCerere(c, m)
    expect(r.status).toBe(429)
    expect(Number(r.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect(citiri()).toBe(0)
    expect(d.trimise).toHaveLength(CERERI_PE_FEREASTRA)
    // Martor: alta adresa trece in aceeasi fereastra.
    expect((await trateazaCerere(cerere(VALID, { 'X-Forwarded-For': '203.0.113.51' }), m)).status).toBe(200)
  })

  it('marimea in OCTETI: un mesaj sub limita in caractere dar peste ea in octeti e 413', async () => {
    const d = destinatieDeProba()
    const mesaj = 'ș'.repeat(Math.ceil(MARIME_MAXIMA / 2) + 10)
    expect(JSON.stringify({ ...VALID, mesaj }).length).toBeLessThan(MARIME_MAXIMA)
    const c = cerere({ ...VALID, mesaj })
    expect((await trateazaCerere(c, mediu(d))).status).toBe(413)
    expect(d.trimise).toEqual([])
  })

  it('capcana completata: raspuns de succes, nimic trimis (martor: aceeasi cerere cu capcana goala pleaca)', async () => {
    const d = destinatieDeProba()
    const prinsa = await trateazaCerere(cerere({ ...VALID, [CAMP_CAPCANA]: 'https://robot.invalid' }), mediu(d))
    expect(prinsa.status).toBe(200)
    expect(await prinsa.json()).toEqual({ stare: 'trimis' })
    expect(d.trimise).toEqual([])
    expect((await trateazaCerere(cerere({ ...VALID, [CAMP_CAPCANA]: '' }), mediu(d))).status).toBe(200)
    expect(d.trimise).toHaveLength(1)
  })

  it('completare sub ' + DURATA_MINIMA_MS + ' ms: raspuns de succes, nimic trimis; la prag pleaca', async () => {
    const d = destinatieDeProba()
    const rapida = await trateazaCerere(cerere({ ...VALID, [CHEIE_DURATA]: DURATA_MINIMA_MS - 1 }), mediu(d))
    expect(rapida.status).toBe(200)
    expect(await rapida.json()).toEqual({ stare: 'trimis' })
    expect(d.trimise).toEqual([])
    expect((await trateazaCerere(cerere({ ...VALID, [CHEIE_DURATA]: DURATA_MINIMA_MS }), mediu(d))).status).toBe(200)
    expect(d.trimise).toHaveLength(1)
  })

  it('formularul din pagina asteapta pragul: durata trimisa nu e niciodata sub el', () => {
    // Un singur prag, citit de server si de formular: altfel omul rapid ar fi respins tacut.
    expect(PRAG_FORMULAR).toBe(DURATA_MINIMA_MS)
    expect(asteptareInainteDeTrimitere(0)).toBe(DURATA_MINIMA_MS)
    expect(asteptareInainteDeTrimitere(1200)).toBe(DURATA_MINIMA_MS - 1200)
    // Martor: la prag si peste el nu se mai asteapta nimic.
    expect(asteptareInainteDeTrimitere(DURATA_MINIMA_MS)).toBe(0)
    expect(asteptareInainteDeTrimitere(60_000)).toBe(0)
    for (const durata of [0, 1, 999, 2999.5, 3000, 45_000]) {
      expect(durata + asteptareInainteDeTrimitere(durata)).toBeGreaterThanOrEqual(DURATA_MINIMA_MS)
    }
  })

  it('capcana si durata au forma stricta: alt tip inseamna respingere', () => {
    expect(citesteCorp({ ...VALID, [CAMP_CAPCANA]: 1 })).toBeNull()
    expect(citesteCorp({ ...VALID, [CHEIE_DURATA]: '5000' })).toBeNull()
    expect(citesteCorp({ ...VALID, [CHEIE_DURATA]: -1 })).toBeNull()
    const faraDurata: Record<string, unknown> = { ...VALID }
    delete faraDurata[CHEIE_DURATA]
    expect(citesteCorp(faraDurata)?.durata).toBeNull()
  })

  it('secretul destinatiei: cu FORMULARE_SECRET, antetul pleaca; fara, lipseste', async () => {
    const secret = ['secret', 'de', 'proba', String(66)].join('-')
    const cu = destinatieDeProba()
    await trateazaCerere(cerere(VALID), mediu(cu, { secret }))
    expect(cu.trimise[0].antete[ANTET_SECRET]).toBe(secret)
    const fara = destinatieDeProba()
    await trateazaCerere(cerere(VALID), mediu(fara, { secret: '' }))
    expect(Object.keys(fara.trimise[0].antete)).not.toContain(ANTET_SECRET)
  })

  it('versiunea urmeaza textul: alt formular sau alt operator dau alta versiune', () => {
    const baza = versiuneInformare('enterprise', OPERATOR_SINTETIC)
    expect(versiuneInformare('contact', OPERATOR_SINTETIC)).not.toBe(baza)
    expect(versiuneInformare('inregistrare', OPERATOR_SINTETIC)).not.toBe(baza)
    expect(versiuneInformare('enterprise', { ...OPERATOR_SINTETIC, denumire: 'Beta Exemplu SRL' })).not.toBe(baza)
    expect(versiuneInformare('enterprise', OPERATOR_SINTETIC)).toBe(baza)
  })
})

// ---------------------------------------------------------------------------------------------
// 3S4-F-008: evidenta consimtamantului, in middleware
// ---------------------------------------------------------------------------------------------

describe('evidenta consimtamantului: garda din middleware (3S4-F-008)', () => {
  const URL_EVIDENTA = 'http://127.0.0.1:4660' + CALE_EVIDENTA
  const buna = { id: 'a1b2c3d4-0000-4000-8000-0000000000aa', versiune: 'ro-0000abcd', statistica: false, metoda: 'refuz-tot', cale: '/' }
  let jurnal: ReturnType<typeof vi.spyOn>
  let mediuVechi: string | undefined

  beforeEach(() => {
    mediuVechi = process.env.SITE_ENV
    process.env.SITE_ENV = 'productie'
    jurnal = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })
  afterEach(() => {
    jurnal.mockRestore()
    if (mediuVechi === undefined) delete process.env.SITE_ENV
    else process.env.SITE_ENV = mediuVechi
  })

  const post = (antete: Record<string, string>, corp: string = JSON.stringify(buna)) =>
    middleware(new NextRequest(URL_EVIDENTA, { method: 'POST', headers: antete, body: corp }))

  it('martor pozitiv: de pe site, JSON, forma exacta -> 204 si un rand in jurnal', async () => {
    const r = await post({ origin: SITE, 'content-type': 'application/json', 'x-forwarded-for': ipNou() })
    expect(r.status).toBe(204)
    expect(jurnal).toHaveBeenCalledTimes(1)
  })

  it('alta origine sau tip text: 403, nimic in jurnal', async () => {
    expect((await post({ origin: STRAIN, 'content-type': 'application/json', 'x-forwarded-for': ipNou() })).status).toBe(403)
    expect((await post({ origin: SITE, 'content-type': 'text/plain', 'x-forwarded-for': ipNou() })).status).toBe(403)
    expect(jurnal).not.toHaveBeenCalled()
  })

  it('fara Origin (nu e navigator): validarea stricta ramane singura poarta', async () => {
    expect((await post({ 'content-type': 'application/json', 'x-forwarded-for': ipNou() })).status).toBe(204)
    expect((await post({ 'x-forwarded-for': ipNou() }, 'nu e json')).status).toBe(400)
    expect(jurnal).toHaveBeenCalledTimes(1)
  })

  it('a ' + (CERERI_PE_FEREASTRA + 1) + '-a cerere pe minut de la aceeasi adresa: 429', async () => {
    const ip = '203.0.113.90'
    for (let i = 0; i < CERERI_PE_FEREASTRA; i++) {
      expect((await post({ origin: SITE, 'content-type': 'application/json', 'x-forwarded-for': ip })).status).toBe(204)
    }
    const r = await post({ origin: SITE, 'content-type': 'application/json', 'x-forwarded-for': ip })
    expect(r.status).toBe(429)
    expect(r.headers.get('retry-after')).not.toBeNull()
    expect(jurnal).toHaveBeenCalledTimes(CERERI_PE_FEREASTRA)
  })

  it('marimea in octeti: o cale lunga cu diacritice peste 1024 de octeti e 413', async () => {
    const corp = JSON.stringify({ ...buna, cale: '/' + 'ă'.repeat(480) })
    expect(corp.length).toBeLessThan(MARIME_EVIDENTA + 200)
    expect(new TextEncoder().encode(corp).byteLength).toBeGreaterThan(MARIME_EVIDENTA)
    const r = await post({ origin: SITE, 'content-type': 'application/json', 'x-forwarded-for': ipNou() }, corp)
    expect(r.status).toBe(413)
    expect(jurnal).not.toHaveBeenCalled()
  })
})
