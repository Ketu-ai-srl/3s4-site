import { spawn } from 'node:child_process'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FORMA_CHEIE as FORMA_CHEIE_RUTA, cheieIndexNow } from '../src/app/indexnow.txt/cheie'
import { GET } from '../src/app/indexnow.txt/route'
import { CALE_CHEIE, ENDPOINT_IMPLICIT, FORMA_CHEIE, MAXIM_PE_CERERE, adreseDinHarta, cereri, cheieValida, origineDomeniu, robotsInterzice, ruleaza } from '../scripts/indexnow.mjs'

// Cazurile care pornesc procese (scriptul ca proces) asteapta dupa masina: plafonul e al fisierului, nu al unui caz.
vi.setConfig({ testTimeout: 60_000 })

/**
 * Felia multi-domeniu, punctul 4: INDEXNOW (protocolul prin care un site anunta motoarele de cautare care il
 * folosesc, printre ele Bing si Yandex, ca i s-au schimbat adresele). Ruta
 * `/indexnow.txt` intoarce cheia din `INDEXNOW_KEY` (404 fara ea); `scripts/indexnow.mjs` trimite adresele
 * din harta de site a unui domeniu la motor, cu `keyLocation` corect, si NU ruleaza singur. Proba de browser
 * (`tests/browser/multi-domeniu.spec.ts`) masoara ruta pe un build cu cheie si pe cel real, fara.
 *
 * Protocolul, citit pe 2026-09-30: https://www.indexnow.org/documentation (forma cheii, `keyLocation`, cel
 * mult 10.000 de adrese pe cerere, sensul raspunsurilor) si https://www.indexnow.org/faq (fisierul-cheie
 * poate sta in alt loc public al aceleiasi gazde, daca `keyLocation` il numeste).
 *
 * FIXTURILE se asambleaza la RULARE: gazdele sunt sub `.test`, iar cheia are forma ceruta dar nu e a nimanui.
 */

const CHEIE = ['exemplu', 'cheie', 'indexnow', '3s'].join('-')
const DOMENIU = 'https://' + ['domeniu', 'proba', 'test'].join('.')

const HARTA = (adrese: string[]) =>
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  adrese.map((a) => '<url><loc>' + a + '</loc></url>').join('') +
  '</urlset>'

const ROBOTS_DESCHIS = 'User-Agent: *\nContent-Signal: search=yes\nAllow: /\n\nUser-Agent: Bytespider\nDisallow: /\n\nSitemap: ' + DOMENIU + '/sitemap.xml\n'
const ROBOTS_INCHIS = 'User-Agent: *\nDisallow: /\n'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('/indexnow.txt: cheia din INDEXNOW_KEY', () => {
  it('martor NEGATIV: fara cheie (nesetata, goala, cu spatii) ruta raspunde 404, ca orice adresa fara pagina', async () => {
    for (const valoare of ['', '   ']) {
      vi.stubEnv('INDEXNOW_KEY', valoare)
      const r = GET()
      expect(r.status, JSON.stringify(valoare)).toBe(404)
      expect(await r.text()).not.toContain(CHEIE)
    }
    expect(cheieIndexNow(undefined)).toBeNull()
  })

  it('martor POZITIV: cu cheie, 200, text simplu, corpul e exact cheia, fara nimic altceva', async () => {
    vi.stubEnv('INDEXNOW_KEY', '  ' + CHEIE + '\n')
    const r = GET()
    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(await r.text()).toBe(CHEIE)
  })

  it('martor POZITIV: o cheie care nu are forma din protocol opreste construirea, fara sa repete valoarea', () => {
    const rele = ['scurta', 'a'.repeat(129), 'cheie cu spatiu ok', 'cheie_cu_subliniere', 'cheie-cu-diacritice-ă-1', 'cheie/cu/bara', 'cheie.txt']
    for (const cheie of rele) {
      let mesaj = ''
      try {
        cheieIndexNow(cheie)
      } catch (e) {
        mesaj = e instanceof Error ? e.message : String(e)
      }
      expect(mesaj, cheie).toMatch(/^INDEXNOW_KEY trebuie sa aiba intre 8 si 128 de caractere/)
      expect(mesaj, cheie).not.toContain(cheie)
    }
    // Martor NEGATIV: limitele de sus si de jos, cifrele, majusculele si cratima trec
    for (const cheie of ['abcdefgh', 'ABCDEFGH', '12345678', 'a-b-c-d-e', 'a'.repeat(128), 'Cheie-Cu-MAJUSCULE-si-cifre-1234']) {
      expect(cheieIndexNow(cheie), cheie).toBe(cheie)
    }
  })

  it('scriptul si ruta au aceeasi regula pentru cheie, pe acelasi set de valori', () => {
    const valori = ['', ' ', 'abcdefg', 'abcdefgh', 'a'.repeat(128), 'a'.repeat(129), 'a-b_c-d-e-f', 'Ab1-Ab1-Ab1', 'ăbcdefghi', 'abcd efgh', 'abc\tdefgh']
    for (const v of valori) {
      const ruta = FORMA_CHEIE_RUTA.test(v.trim())
      const script = FORMA_CHEIE.test(v.trim())
      expect(script, JSON.stringify(v)).toBe(ruta)
    }
    expect(() => cheieValida('scurta')).toThrow(/8-128/)
    expect(cheieValida('  ' + CHEIE + ' ')).toBe(CHEIE)
  })
})

describe('scripts/indexnow.mjs: piesele pure', () => {
  it('originea domeniului: https simplu; http numai pe masina locala; nimic altceva', () => {
    expect(origineDomeniu('https://3s.md')).toBe('https://3s.md')
    expect(origineDomeniu('https://3s.md/')).toBe('https://3s.md')
    expect(origineDomeniu('http://127.0.0.1:4692')).toBe('http://127.0.0.1:4692')
    for (const rau of ['http://3s.md', 'https://3s.md/ro', 'https://3s.md/?a=1', 'https://u:p@3s.md', '3s.md']) {
      expect(() => origineDomeniu(rau), rau).toThrow()
    }
  })

  it('adresele din harta: numai cele de pe domeniu, fara dubluri, cu entitatile XML decodificate', () => {
    const xml = HARTA([DOMENIU + '/', DOMENIU + '/preturi', DOMENIU + '/blog?a=1&amp;b=2', DOMENIU + '/preturi', 'https://alt-domeniu.test/x', 'nu-e-adresa'])
    const { proprii, straine } = adreseDinHarta(xml, DOMENIU)
    expect(proprii).toEqual([DOMENIU + '/', DOMENIU + '/preturi', DOMENIU + '/blog?a=1&b=2'])
    expect(straine).toEqual(['https://alt-domeniu.test/x', 'nu-e-adresa'])
    // O harta-index nu se accepta: locurile ei sunt alte harti, nu pagini
    expect(() => adreseDinHarta('<sitemapindex><sitemap><loc>' + DOMENIU + '/s.xml</loc></sitemap></sitemapindex>', DOMENIU)).toThrow(/sitemapindex/)
  })

  it('robots.txt: martor POZITIV pe mediul de proba (interzice tot), martor NEGATIV pe productie (Allow: / si grupuri proprii)', () => {
    expect(robotsInterzice(ROBOTS_INCHIS)).toBe(true)
    expect(robotsInterzice(ROBOTS_DESCHIS)).toBe(false)
    // Un robot blocat pe nume nu inseamna ca tot site-ul e interzis
    expect(robotsInterzice('User-agent: Bytespider\nDisallow: /\n')).toBe(false)
    // Mai multi agenti pe acelasi grup, comentarii, majuscule
    expect(robotsInterzice('# proba\nUSER-AGENT: googlebot\nuser-agent: *\nDISALLOW: /  # tot\n')).toBe(true)
    // Allow: / bate Disallow: / la lungime egala (RFC 9309)
    expect(robotsInterzice('User-agent: *\nDisallow: /\nAllow: /\n')).toBe(false)
    expect(robotsInterzice('')).toBe(false)
  })

  it('cererile: host, cheie, keyLocation spre /indexnow.txt de pe acelasi domeniu, cel mult 10.000 de adrese pe cerere', () => {
    expect(CALE_CHEIE).toBe('/indexnow.txt')
    expect(MAXIM_PE_CERERE).toBe(10_000)
    const adrese = Array.from({ length: 10_001 }, (_, i) => DOMENIU + '/p' + i)
    const grupe = cereri(DOMENIU, CHEIE, adrese)
    expect(grupe).toHaveLength(2)
    expect(grupe[0].urlList).toHaveLength(10_000)
    expect(grupe[1].urlList).toEqual([DOMENIU + '/p10000'])
    for (const g of grupe) {
      expect(Object.keys(g).sort()).toEqual(['host', 'key', 'keyLocation', 'urlList'])
      expect(g.host).toBe('domeniu.proba.test')
      expect(g.key).toBe(CHEIE)
      expect(g.keyLocation).toBe(DOMENIU + '/indexnow.txt')
    }
    // Gazda poarta portul cand nu e cel implicit (adresele si `host` trebuie sa coincida)
    expect(cereri('http://127.0.0.1:4692', CHEIE, ['http://127.0.0.1:4692/'])[0].host).toBe('127.0.0.1:4692')
    expect(ENDPOINT_IMPLICIT).toBe('https://api.indexnow.org/indexnow')
  })
})

describe('scripts/indexnow.mjs: rularea, cu un domeniu si un motor false', () => {
  type Cerere = { url: string; metoda: string; corp: string }

  /** Domeniul fals si motorul fals, intr-un singur `fetch`: raspunde dupa cale, iar trimiterile le tine. */
  function lumeFalsa(optiuni: { cheie?: string; stareCheie?: number; robots?: string; harta?: string; stareHarta?: number; motor?: number } = {}) {
    const cereriPrimite: Cerere[] = []
    const fals = (async (url: string | URL | Request, init?: RequestInit) => {
      const adresa = String(url)
      cereriPrimite.push({ url: adresa, metoda: init?.method ?? 'GET', corp: init?.body === undefined ? '' : String(init.body) })
      if (adresa === DOMENIU + '/indexnow.txt') return new Response(optiuni.cheie ?? CHEIE + '\n', { status: optiuni.stareCheie ?? 200 })
      if (adresa === DOMENIU + '/robots.txt') return new Response(optiuni.robots ?? ROBOTS_DESCHIS, { status: 200 })
      if (adresa === DOMENIU + '/sitemap.xml') return new Response(optiuni.harta ?? HARTA([DOMENIU + '/', DOMENIU + '/preturi']), { status: optiuni.stareHarta ?? 200 })
      if (adresa === ENDPOINT_IMPLICIT) return new Response('', { status: optiuni.motor ?? 200 })
      return new Response('nu exista', { status: 404 })
    }) as typeof fetch
    return { fals, cereriPrimite, trimise: () => cereriPrimite.filter((c) => c.metoda === 'POST') }
  }

  async function porneste(argv: string[], lume: { fals: typeof fetch }, env: Record<string, string | undefined> = { INDEXNOW_KEY: CHEIE }) {
    const iesire: string[] = []
    const erori: string[] = []
    const cod = await ruleaza({ argv, env, fetch: lume.fals, spune: (t: string) => iesire.push(t), avertizeaza: (t: string) => erori.push(t) })
    return { cod, iesire, erori }
  }

  it('martor POZITIV: cu cheia servita, robots deschis si harta cu pagini, trimite o cerere cu keyLocation corect si iese 0', async () => {
    const lume = lumeFalsa()
    const r = await porneste([DOMENIU], lume)
    expect(r.erori).toEqual([])
    expect(r.cod).toBe(0)
    expect(lume.trimise()).toHaveLength(1)
    const trimis = JSON.parse(lume.trimise()[0].corp)
    expect(trimis).toEqual({ host: 'domeniu.proba.test', key: CHEIE, keyLocation: DOMENIU + '/indexnow.txt', urlList: [DOMENIU + '/', DOMENIU + '/preturi'] })
    expect(lume.trimise()[0].url).toBe(ENDPOINT_IMPLICIT)
    // Verificarile s-au facut INAINTEA trimiterii, in ordinea din antet
    expect(lume.cereriPrimite.map((c) => c.url.replace(DOMENIU, ''))).toEqual(['/indexnow.txt', '/robots.txt', '/sitemap.xml', ENDPOINT_IMPLICIT])
  })

  it('--dry-run face verificarile si arata ce ar pleca, dar nu trimite nimic', async () => {
    const lume = lumeFalsa()
    const r = await porneste([DOMENIU, '--dry-run'], lume)
    expect(r.cod).toBe(0)
    expect(lume.trimise()).toEqual([])
    expect(r.iesire.join('\n')).toContain('--dry-run: nu trimit nimic')
    expect(r.iesire.join('\n')).toContain('keyLocation=' + DOMENIU + '/indexnow.txt')
  })

  it('martor POZITIV: oprit inainte de orice trimitere cand cheia servita nu e a noastra, lipseste, sau robots interzice', async () => {
    const alta = lumeFalsa({ cheie: 'alta-cheie-indexnow-9' })
    const r1 = await porneste([DOMENIU], alta)
    expect(r1.cod).toBe(1)
    expect(r1.erori.join('\n')).toContain('nu contine cheia din INDEXNOW_KEY')
    expect(r1.erori.join('\n')).not.toContain(CHEIE)
    expect(alta.trimise()).toEqual([])

    const lipsa = lumeFalsa({ stareCheie: 404 })
    const r2 = await porneste([DOMENIU], lipsa)
    expect(r2.cod).toBe(1)
    expect(r2.erori.join('\n')).toContain('a raspuns 404')
    expect(lipsa.trimise()).toEqual([])

    const inchis = lumeFalsa({ robots: ROBOTS_INCHIS })
    const r3 = await porneste([DOMENIU], inchis)
    expect(r3.cod).toBe(1)
    expect(r3.erori.join('\n')).toContain('interzice indexarea')
    expect(inchis.trimise()).toEqual([])

    // Martor NEGATIV: --ignora-robots trimite oricum, cu avertisment
    const fortat = lumeFalsa({ robots: ROBOTS_INCHIS })
    const r4 = await porneste([DOMENIU, '--ignora-robots'], fortat)
    expect(r4.cod).toBe(0)
    expect(fortat.trimise()).toHaveLength(1)
    expect(r4.erori.join('\n')).toContain('robots.txt interzice indexarea')
  })

  it('harta goala sau fara adrese de pe domeniu, ori indisponibila: oprit, nu trimite o lista goala', async () => {
    for (const optiuni of [{ harta: HARTA([]) }, { harta: HARTA(['https://alt-domeniu.test/x']) }, { stareHarta: 500 }]) {
      const lume = lumeFalsa(optiuni)
      const r = await porneste([DOMENIU], lume)
      expect(r.cod, JSON.stringify(optiuni)).toBe(1)
      expect(lume.trimise()).toEqual([])
    }
  })

  it('raspunsurile motorului: 200 si 202 sunt primit, 400/403/422/429 sunt refuzuri cu sensul din protocol', async () => {
    for (const [stare, cod] of [[200, 0], [202, 0], [400, 1], [403, 1], [422, 1], [429, 1]] as const) {
      const r = await porneste([DOMENIU], lumeFalsa({ motor: stare }))
      expect(r.cod, String(stare)).toBe(cod)
    }
    const r = await porneste([DOMENIU], lumeFalsa({ motor: 403 }))
    expect(r.erori.join('\n')).toContain('cheie nevalida')
    const r2 = await porneste([DOMENIU], lumeFalsa({ motor: 422 }))
    expect(r2.erori.join('\n')).toContain('nu apartin gazdei')
  })

  it('folosire gresita (cod 2): fara cheie, cu cheie stricata, fara domeniu, cu optiune necunoscuta; reteaua cazuta e NEMASURAT (cod 3)', async () => {
    const lume = lumeFalsa()
    expect((await porneste([DOMENIU], lume, {})).cod).toBe(2)
    expect((await porneste([DOMENIU], lume, { INDEXNOW_KEY: 'scurta' })).cod).toBe(2)
    expect((await porneste([], lume)).cod).toBe(2)
    expect((await porneste([DOMENIU, '--fortat'], lume)).cod).toBe(2)
    expect((await porneste(['http://domeniu-proba.test'], lume)).cod).toBe(2)
    expect(lume.cereriPrimite).toEqual([])
    const cazuta = {
      fals: (async () => {
        throw new Error('conexiune refuzata')
      }) as unknown as typeof fetch,
    }
    const r = await porneste([DOMENIU], cazuta)
    expect(r.cod).toBe(3)
    expect(r.erori.join('\n')).toContain('NEMASURAT')
  })
})

describe('scripts/indexnow.mjs: pornit ca proces, cu un domeniu si un motor pe masina locala', () => {
  let servere: Server[] = []

  afterEach(async () => {
    await Promise.all(servere.map((s) => new Promise((gata) => s.close(gata))))
    servere = []
  })

  function asculta(manipulator: (c: IncomingMessage, r: ServerResponse) => void): Promise<number> {
    return new Promise((gata) => {
      const s = createServer(manipulator)
      servere.push(s)
      s.listen(0, '127.0.0.1', () => gata((s.address() as AddressInfo).port))
    })
  }

  it('martor POZITIV: exit 0, motorul primeste JSON-ul cu keyLocation spre fisierul-cheie al domeniului', async () => {
    const primite: { metoda: string; tip: string; corp: string }[] = []
    const motor = await asculta((c, r) => {
      let corp = ''
      c.on('data', (b) => (corp += b))
      c.on('end', () => {
        primite.push({ metoda: c.method ?? '', tip: String(c.headers['content-type']), corp })
        r.statusCode = 200
        r.end()
      })
    })
    // Domeniul fals: harta lui poarta portul cu care asculta, ca adresele sa fie ale aceleiasi origini
    let portDomeniu = 0
    const domeniu = await asculta((c, r) => {
      if (c.url === '/indexnow.txt') return void r.end(CHEIE)
      if (c.url === '/robots.txt') return void r.end(ROBOTS_DESCHIS)
      if (c.url === '/sitemap.xml') return void r.end(HARTA(['http://127.0.0.1:' + portDomeniu + '/', 'http://127.0.0.1:' + portDomeniu + '/preturi']))
      r.statusCode = 404
      r.end()
    })
    portDomeniu = domeniu
    const iesire = await new Promise<{ cod: number | null; text: string }>((gata) => {
      const copil = spawn(process.execPath, [join(__dirname, '..', 'scripts', 'indexnow.mjs'), 'http://127.0.0.1:' + domeniu, '--endpoint', 'http://127.0.0.1:' + motor + '/indexnow'], {
        env: { ...process.env, INDEXNOW_KEY: CHEIE },
      })
      let text = ''
      copil.stdout.on('data', (b) => (text += b))
      copil.stderr.on('data', (b) => (text += b))
      copil.on('close', (cod) => gata({ cod, text }))
    })
    expect(iesire.cod, iesire.text).toBe(0)
    expect(primite).toHaveLength(1)
    expect(primite[0].metoda).toBe('POST')
    expect(primite[0].tip).toBe('application/json; charset=utf-8')
    const corp = JSON.parse(primite[0].corp)
    expect(corp.host).toBe('127.0.0.1:' + domeniu)
    expect(corp.key).toBe(CHEIE)
    expect(corp.keyLocation).toBe('http://127.0.0.1:' + domeniu + '/indexnow.txt')
    expect(corp.urlList).toEqual(['http://127.0.0.1:' + domeniu + '/', 'http://127.0.0.1:' + domeniu + '/preturi'])
  })

  it('martor NEGATIV: fara INDEXNOW_KEY, procesul iese 2 si nu contacteaza nimic', async () => {
    let contactat = false
    const domeniu = await asculta((_c, r) => {
      contactat = true
      r.end()
    })
    const env = { ...process.env }
    delete env.INDEXNOW_KEY
    const iesire = await new Promise<{ cod: number | null; text: string }>((gata) => {
      const copil = spawn(process.execPath, [join(__dirname, '..', 'scripts', 'indexnow.mjs'), 'http://127.0.0.1:' + domeniu], { env })
      let text = ''
      copil.stdout.on('data', (b) => (text += b))
      copil.stderr.on('data', (b) => (text += b))
      copil.on('close', (cod) => gata({ cod, text }))
    })
    expect(iesire.cod).toBe(2)
    expect(iesire.text).toContain('folosire gresita')
    expect(contactat).toBe(false)
  })
})
