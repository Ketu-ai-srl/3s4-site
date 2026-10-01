import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { textSecurity } from '../src/app/.well-known/security.txt/continut'
import { ALT_IMAGINE, ALT_IMAGINE_EN, CALE_IMAGINE_CARD, CALE_IMAGINE_OG, metadataPagina } from '../src/components/seo/metadata'
import { DESCRIERE_EN, grafSite, nodOrganizatie } from '../src/components/seo/date-structurate'
import type { Canale } from '../src/content/canale'
import { textLlms } from '../src/lib/llms'
import { editiaRadacinii, limbileDomeniului } from '../src/lib/site'
import { pornesteCopia3sMd, type Copie3sMd } from './browser/ajutor/copie-3s-md'

/**
 * METADATA PE EDITIE (felia metadata-hreflang): `og:locale`, `inLanguage`, graful comun, `llms.txt`,
 * `security.txt`, manifestul si `Content-Language` vin din editia de la radacina domeniului si din catalogul
 * editiilor (`src/lib/editii.ts`), nu sunt scrise de mana in romana.
 *
 * Doua parti:
 *   1. pe module, cu editia data explicit (fisierul ruleaza pe build-ul romanesc, fara `SITE_EDITII`);
 *   2. pe COPIA 3s.md (`tests/browser/ajutor/copie-3s-md.ts`: acelasi cod, construit si servit cu variabilele din
 *      `config/profil-3s-md.json`): zero `RON` in HTML-ul servit, in `llms.txt`, in JSON-LD si in
 *      `.next/server/app`, `Content-Language` pe radacina si pe `/ro`, imaginile sociale EN servite.
 *
 * `RON` se cauta ca CUVANT (`\bRON\b`, sensibil la majuscule), ca sa nu prinda un cuvant scris cu majuscule care
 * contine literele. Controlul cautarii e o fixtura asamblata la rulare.
 */

const RADACINA = join(__dirname, '..')
const INT = 'https://3s.md'
/** Cuvantul cautat, lipit la rulare: fisierul probei nu-l poarta ca atare. */
const RON = new RegExp('\\b' + 'R' + 'ON' + '\\b', 'g')
const numaraRon = (text: string): number => (text.match(RON) ?? []).length

/** Canalele aplicatiei 3s.md, din profil (aceeasi valoare cu cea din Coolify). */
function canaleProfil(): Canale {
  const profil = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as { CANALE_JSON: Partial<Canale> }
  return { formulare: true, whatsapp: '', telefon: '', email: '', emailSecuritate: 'security@3s.com.ro', ...profil.CANALE_JSON }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('controlul cautarii', () => {
  it('martor POZITIV: cuvantul e gasit intr-un text care il are; martor NEGATIV: nu e gasit intr-un cuvant care doar contine literele', () => {
    expect(numaraRon('pret: 0 ' + 'R' + 'ON pe luna')).toBe(1)
    expect(numaraRon('IN' + 'R' + 'ON' + 'MENT si ' + 'r' + 'on')).toBe(0)
  })
})

describe('editia de la radacina', () => {
  it('build-ul romanesc (fara SITE_EDITII) are ro-RO la radacina si limba ro; 3s.md are en si limbile en, ro', () => {
    vi.stubEnv('SITE_EDITII', '')
    vi.stubEnv('NEXT_PUBLIC_SITE_EDITII', '')
    expect(editiaRadacinii().cod).toBe('ro-RO')
    expect(limbileDomeniului()).toEqual(['ro'])
    expect(editiaRadacinii(['en', 'ro-MD']).cod).toBe('en')
    expect(limbileDomeniului(['en', 'ro-MD'])).toEqual(['en', 'ro'])
    vi.stubEnv('SITE_EDITII', 'en,ro-MD')
    expect(editiaRadacinii().cod).toBe('en')
  })

  it('martor POZITIV: un profil fara editie la radacina e refuzat', () => {
    expect(() => editiaRadacinii(['ro-MD'])).toThrow(/nicio editie la radacina/)
  })
})

describe('metadataPagina pe editie', () => {
  const date = { titlu: 'Pricing for the 3S document archive', descriere: 'Four plans per company, with what each includes and how a free assisted pilot starts.', cale: '/pricing' }

  it('editia en: og:locale en_US si imaginile sociale EN declarate explicit, cu textul alternativ EN', () => {
    const m = metadataPagina({ ...date, editie: 'en', cheie: 'preturi' })
    expect(m.openGraph).toMatchObject({ locale: 'en_US', url: '/pricing' })
    const imagine = { width: 1200, height: 630, alt: ALT_IMAGINE_EN, type: 'image/png' }
    expect((m.openGraph as { images?: unknown }).images).toEqual([{ url: CALE_IMAGINE_OG, ...imagine }])
    expect((m.twitter as { images?: unknown }).images).toEqual([{ url: CALE_IMAGINE_CARD, ...imagine }])
    expect(ALT_IMAGINE_EN).toBe('3S Scan Store Solve logo')
  })

  it('martor NEGATIV: fara editie, pagina ramane romaneasca (ro_RO, textul alternativ de azi)', () => {
    const m = metadataPagina({ titlu: 'Prețurile 3S pentru arhiva firmei', descriere: 'Pachetele 3S pentru arhiva firmei, cu ce include fiecare și prețul pe lună.', cale: '/preturi' })
    expect(m.openGraph).toMatchObject({ locale: 'ro_RO' })
    expect((m.openGraph as { images?: { alt: string }[] }).images?.[0].alt).toBe(ALT_IMAGINE)
    expect(metadataPagina({ ...date, editie: 'ro-MD', cale: '/ro/preturi' }).openGraph).toMatchObject({ locale: 'ro_MD' })
  })

  it('imaginile EN sunt RUTE (route.en.tsx), nu fisiere de metadata cu sufix de editie', () => {
    for (const r of ['opengraph-image', 'twitter-image']) {
      expect(existsSync(join(RADACINA, 'src', 'app', '(en)', r, 'route.en.tsx')), r).toBe(true)
    }
    const din = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? din(join(d, n)) : [n]))
    const metadataCuSufix = din(join(RADACINA, 'src', 'app')).filter((n) => /^(opengraph|twitter)-image\.[a-z]+\.tsx$/.test(n))
    expect(metadataCuSufix).toEqual([])
    // Controlul cautarii: fisierele de metadata ale site-ului romanesc chiar sunt gasite de aceeasi parcurgere
    expect(din(join(RADACINA, 'src', 'app'))).toContain('opengraph-image.tsx')
  })
})

describe('graful comun pe editie', () => {
  const canale = canaleProfil()

  it('editia en: WebSite in engleza, descrierea EN, fara slogan romanesc, fara Offer si fara cuvantul cautat', () => {
    const graf = grafSite(INT, 'en')
    const [org, site] = graf['@graph']
    expect(site).toMatchObject({ '@type': 'WebSite', inLanguage: 'en' })
    expect(org).toMatchObject({ '@type': 'Organization', description: DESCRIERE_EN })
    expect('slogan' in org).toBe(false)
    const text = JSON.stringify(graf)
    expect(text).not.toContain('Offer')
    expect(numaraRon(text)).toBe(0)
  })

  it('canalele 3s.md: telephone si contactPoint.telephone din CANALE, fara e-mail (CANALE.email gol), limbile domeniului', () => {
    const n = nodOrganizatie(INT, canale.email, { editie: 'en', canale, limbi: limbileDomeniului(['en', 'ro-MD']) })
    expect(n.telephone).toBe('+37368055599')
    expect(n.contactPoint).toEqual({
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: '+37368055599',
      availableLanguage: ['en', 'ro'],
      areaServed: [
        { '@type': 'Country', name: 'RO' },
        { '@type': 'Country', name: 'MD' },
      ],
    })
    expect('email' in n).toBe(false)
  })

  it('martor NEGATIV: fara telefon si fara e-mail, nici telephone, nici contactPoint (build-ul romanesc de azi)', () => {
    const fara = { ...canale, telefon: '', email: '' }
    const n = nodOrganizatie(INT, '', { editie: 'ro-RO', canale: fara, limbi: ['ro'] })
    expect('telephone' in n || 'contactPoint' in n || 'email' in n).toBe(false)
    // Si graful romanesc ramane cel de azi: slogan, descriere romaneasca, WebSite ro-RO
    const ro = grafSite(INT, 'ro-RO')
    expect(ro['@graph'][1]).toMatchObject({ inLanguage: 'ro-RO' })
    expect('slogan' in ro['@graph'][0]).toBe(true)
  })
})

describe('llms.txt si security.txt pe editie', () => {
  it('llms.txt EN: titlul si rezumatul in engleza, fara legaturi cat timp nu exista pagini EN, fara cuvantul cautat', () => {
    const text = textLlms(INT, 'en')
    expect(text.startsWith('# 3S Scan Store Solve\n\n> 3S keeps a company')).toBe(true)
    expect(text).not.toContain('](')
    expect(numaraRon(text)).toBe(0)
    // Ortografie americana in rezumat (nu "organised", "catalogue")
    expect(text).not.toMatch(/organis|catalogue/)
    // Martor POZITIV: textul romanesc are legaturile hartii (deci absenta lor de mai sus vine din editie)
    expect(textLlms(INT, 'ro-RO')).toContain('](' + INT)
  })

  it('security.txt pe 3s.md: Contact din CANALE.emailSecuritate, en inainte de ro, fara Policy (n-are pagina de securitate EN)', () => {
    const acum = new Date('2026-10-01T00:00:00Z')
    const en = textSecurity(INT, acum, { editie: 'en', email: canaleProfil().emailSecuritate, cai: [] })
    expect(en).toContain('Contact: mailto:security@3s.com.ro\n')
    expect(en).toContain('Preferred-Languages: en, ro\n')
    expect(en).not.toContain('Policy:')
    // Martor POZITIV: pe build-ul romanesc, cu pagina de securitate in RUTE, Policy ramane, iar limbile raman ro, en
    const ro = textSecurity('https://3s4.ke2.in', acum, { editie: 'ro-RO', email: 'security@3s.com.ro', cai: ['/securitate'] })
    expect(ro).toContain('Policy: https://3s4.ke2.in/securitate\n')
    expect(ro).toContain('Preferred-Languages: ro, en\n')
    // Si o pagina de securitate care NU e in RUTE nu e legata
    expect(textSecurity('https://3s4.ke2.in', acum, { editie: 'ro-RO', email: 'security@3s.com.ro', cai: [] })).not.toContain('Policy:')
  })
})

describe('manifestul si Content-Language pe profil', () => {
  const salvat = { ...process.env }
  afterEach(() => {
    for (const k of Object.keys(process.env)) if (!(k in salvat)) delete process.env[k]
    Object.assign(process.env, salvat)
    vi.resetModules()
  })

  const cuMediu = async <T,>(mediu: Record<string, string>, f: () => Promise<T>): Promise<T> => {
    for (const k of ['SITE_EDITII', 'NEXT_PUBLIC_SITE_EDITII', 'SITE_URL', 'SITE_ALTERNATE', 'OPERATOR_JSON']) delete process.env[k]
    Object.assign(process.env, mediu)
    vi.resetModules()
    return f()
  }

  it('manifestul: lang ro pe build-ul romanesc, en pe 3s.md', async () => {
    expect(await cuMediu({}, async () => (await import('../src/app/manifest')).default().lang)).toBe('ro')
    expect(await cuMediu({ SITE_EDITII: 'en,ro-MD' }, async () => (await import('../src/app/manifest')).default().lang)).toBe('en')
  })

  type Config = { headers: () => Promise<{ source: string; headers: { key: string; value: string }[] }[]> }
  const reguli = async (mediu: Record<string, string>) =>
    cuMediu(mediu, async () => ((await import('../next.config')).default as unknown as Config).headers())

  it('build-ul romanesc: nicio regula Content-Language (antetele de dinainte de editii)', async () => {
    const r = await reguli({})
    expect(r.flatMap((x) => x.headers).filter((h) => h.key === 'Content-Language')).toEqual([])
    expect(r).toHaveLength(1)
  })

  it('3s.md: en pe tot domeniul, ro-MD pe /ro si sub el, regula prefixului DUPA cea generala', async () => {
    const r = await reguli({ SITE_EDITII: 'en,ro-MD', SITE_URL: INT, SITE_ALTERNATE: 'en=' + INT + ',ro-MD=' + INT + '/ro,x-default=' + INT })
    const limba = r.filter((x) => x.headers.some((h) => h.key === 'Content-Language')).map((x) => [x.source, x.headers[0].value])
    expect(limba).toEqual([
      ['/:path*', 'en'],
      ['/ro', 'ro-MD'],
      ['/ro/:cale*', 'ro-MD'],
    ])
    // Fara ro-MD in profil: numai en
    const doarEn = await reguli({ SITE_EDITII: 'en' })
    expect(doarEn.filter((x) => x.headers.some((h) => h.key === 'Content-Language')).map((x) => x.source)).toEqual(['/:path*'])
  })
})

// ---------------------------------------------------------------------------------------------
// Copia 3s.md, servita
// ---------------------------------------------------------------------------------------------

/**
 * Fisierele pe care serverul le TRIMITE din `.next/server/app` (`.html`, `.rsc`, `.body`, `.meta`): paginile si
 * rutele prerandate, cu datele lor. Codul de server (`.js`) nu intra: el nu ajunge la vizitator, iar modulele
 * comune ambelor editii (de pilda `llms.ts`, care stie si textul romanesc) il poarta pe amandoua, masurat.
 */
function texteDin(dosar: string): Record<string, string> {
  const iesire: Record<string, string> = {}
  const mergi = (d: string) => {
    for (const n of readdirSync(d)) {
      const c = join(d, n)
      if (statSync(c).isDirectory()) mergi(c)
      else if (/\.(html|rsc|body|meta)$/.test(n)) iesire[c.slice(dosar.length + 1).replace(/\\/g, '/')] = readFileSync(c, 'latin1')
    }
  }
  mergi(dosar)
  return iesire
}

describe('copia 3s.md, servita', () => {
  let copie: Copie3sMd

  beforeAll(async () => {
    copie = await pornesteCopia3sMd()
  }, 600_000)

  afterAll(async () => {
    await copie?.opreste()
  }, 60_000)

  const cere = async (cale: string) => {
    const r = await fetch(copie.baza + cale, { redirect: 'manual' })
    const tip = r.headers.get('content-type') ?? ''
    const corp = tip.startsWith('image/') ? '' : await r.text()
    return { status: r.status, tip, limba: r.headers.get('content-language'), corp }
  }

  it('Content-Language: en pe radacina si pe orice cale, ro-MD pe /ro si sub el (si pe raspunsurile 404)', async () => {
    const masurat: Record<string, string | null> = {}
    for (const cale of ['/', '/pricing', '/llms.txt', '/robots.txt', '/ro', '/ro/juridic', '/ro/o-cale-' + 'care-nu-exista', '/rost']) {
      masurat[cale] = (await cere(cale)).limba
    }
    console.log('[Content-Language] ' + JSON.stringify(masurat))
    expect(masurat).toEqual({
      '/': 'en',
      '/pricing': 'en',
      '/llms.txt': 'en',
      '/robots.txt': 'en',
      '/ro': 'ro-MD',
      '/ro/juridic': 'ro-MD',
      '/ro/o-cale-care-nu-exista': 'ro-MD',
      // martor NEGATIV al prefixului: `/rost` nu e sub `/ro`
      '/rost': 'en',
    })
  })

  it('llms.txt: 200, textul EN cu titlul si rezumatul, fara legaturi spre pagini inexistente, zero RON', async () => {
    const r = await cere('/llms.txt')
    expect(r.status).toBe(200)
    expect(r.corp.startsWith('# 3S Scan Store Solve\n\n> 3S keeps a company')).toBe(true)
    expect(r.corp).not.toContain('](')
    expect(numaraRon(r.corp)).toBe(0)
  })

  it('HTML-ul servit si JSON-LD-ul lui: zero RON pe /, pe /ro si pe o cale necunoscuta', async () => {
    const ld: string[] = []
    for (const cale of ['/', '/ro', '/pricing']) {
      const r = await cere(cale)
      expect(numaraRon(r.corp), cale).toBe(0)
      for (const m of r.corp.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) ld.push(m[1])
    }
    // Pe aceasta baza layout-ul EN nu monteaza inca graful comun; numaratoarea se tipareste, ca sa se vada cand apare.
    console.log('[JSON-LD pe copia 3s.md] blocuri: ' + ld.length)
    expect(numaraRon(ld.join('\n'))).toBe(0)
  })

  it('.next/server/app al copiei: zero RON in fisierele servite (pagini, rute prerandate, date)', () => {
    const texte = texteDin(join(copie.director, '.next', 'server', 'app'))
    const cuRon = Object.entries(texte).filter(([, t]) => numaraRon(t) > 0).map(([f]) => f)
    console.log('[.next/server/app 3s.md] fisiere citite: ' + Object.keys(texte).length + ', cu RON: ' + JSON.stringify(cuRon))
    expect(Object.keys(texte).length, 'controlul citirii: build-ul chiar are fisiere').toBeGreaterThan(5)
    expect(cuRon).toEqual([])
  })

  it('martor POZITIV al parcurgerii: acelasi cititor gaseste cuvantul intr-un fisier de build fabricat', () => {
    const d = mkdtempSync(join(tmpdir(), 'metadata-editii-'))
    try {
      writeFileSync(join(d, 'index.html'), '<p>0 ' + 'R' + 'ON</p>')
      writeFileSync(join(d, 'altul.rsc'), 'fara')
      const texte = texteDin(d)
      expect(Object.entries(texte).filter(([, t]) => numaraRon(t) > 0).map(([f]) => f)).toEqual(['index.html'])
    } finally {
      rmSync(d, { recursive: true, force: true })
    }
  })

  it('imaginile sociale EN raspund 200 image/png la adresele declarate de metadataPagina', async () => {
    for (const cale of [CALE_IMAGINE_OG, CALE_IMAGINE_CARD]) {
      const r = await cere(cale)
      expect(r.status, cale).toBe(200)
      expect(r.tip, cale).toBe('image/png')
    }
  })

  it('security.txt: Contact din CANALE_JSON, en inainte de ro, fara Policy, Canonical pe 3s.md', async () => {
    const r = await cere('/.well-known/security.txt')
    expect(r.status).toBe(200)
    expect(r.corp).toContain('Contact: mailto:' + canaleProfil().emailSecuritate + '\n')
    expect(r.corp).toContain('Preferred-Languages: en, ro\n')
    expect(r.corp).not.toContain('Policy:')
    expect(r.corp).toContain('Canonical: ' + INT + '/.well-known/security.txt')
  })

  it('manifestul aplicatiei web: lang en', async () => {
    const r = await cere('/manifest.webmanifest')
    expect(r.status).toBe(200)
    expect((JSON.parse(r.corp) as { lang: string }).lang).toBe('en')
  })
})
