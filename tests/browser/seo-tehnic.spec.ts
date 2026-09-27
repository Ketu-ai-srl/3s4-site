import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * Felia seo-tehnic (auditul SEO din 27.09): ce se masoara pe HTML-ul SERVIT de `next start`, fara
 * JavaScript si fara `<script>` (payload-ul RSC contine adrese pe care un motor nu le urmeaza ca
 * legaturi, deci ar umfla numaratoarea).
 *
 *   - M1: fiecare ruta din harta de site, in afara de `/` si `/promo*` (decizie owner), are cel putin
 *     2 legaturi intrate din ALTE pagini decat `/harta-site`;
 *   - m1: pornind de la `/blog` si mergand numai pe legaturile servite ale listarii, se ajunge la
 *     fiecare articol din harta;
 *   - m3: pagina de negasit raspunde 404, cu titlul ei si un singur `meta robots`;
 *   - m5: foaia de tipar are `noindex, follow`.
 */

const PRAG_INTRATE = 2
const SURSA_EXCLUSA = '/harta-site'

/** Tintele scutite de pragul M1: startul (nu are nevoie de legaturi intrate) si campania `/promo*`. */
function scutita(cale: string): boolean {
  return cale === '/' || cale === '/promo' || cale.startsWith('/promo/')
}

/** HTML-ul fara `<script>`: exact ce citeste un motor care nu executa JavaScript. */
function faraScripturi(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, '')
}

/** Caile interne spre care duc `<a href>`-urile paginii, fara ancora si parametri, fara bara finala. */
function legaturiInterne(html: string, gazda: string): string[] {
  const cai = new Set<string>()
  for (const m of faraScripturi(html).matchAll(/<a\b[^>]*?\shref="([^"]*)"/gi)) {
    let href = m[1].replace(/&amp;/g, '&')
    if (href.startsWith(gazda)) href = href.slice(gazda.length) || '/'
    if (!href.startsWith('/') || href.startsWith('//')) continue
    let cale = href.split(/[?#]/)[0] || '/'
    if (cale.length > 1 && cale.endsWith('/')) cale = cale.slice(0, -1)
    cai.add(cale)
  }
  return [...cai]
}

/** Tintele sub prag: pentru fiecare, cate pagini-sursa distincte o leaga (fara ea insasi si fara harta). */
function subPrag(tinte: readonly string[], pagini: ReadonlyMap<string, readonly string[]>, prag = PRAG_INTRATE): Record<string, number> {
  const intrate = new Map<string, Set<string>>()
  for (const [sursa, legaturi] of pagini) {
    if (sursa === SURSA_EXCLUSA) continue
    for (const t of legaturi) {
      if (t === sursa) continue
      if (!intrate.has(t)) intrate.set(t, new Set())
      intrate.get(t)!.add(sursa)
    }
  }
  const lipsa: Record<string, number> = {}
  for (const t of tinte) {
    if (scutita(t)) continue
    const n = intrate.get(t)?.size ?? 0
    if (n < prag) lipsa[t] = n
  }
  return lipsa
}

async function citeste(request: APIRequestContext, cale: string): Promise<{ status: number; html: string }> {
  const r = await request.get(cale, { maxRedirects: 0 })
  return { status: r.status(), html: await r.text() }
}

/** Caile din harta de site servita, citite de pe acelasi server. */
async function caiHarta(request: APIRequestContext): Promise<{ cai: string[]; gazda: string }> {
  const xml = (await citeste(request, '/sitemap.xml')).html
  const adrese = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  expect(adrese.length, 'harta de site goala').toBeGreaterThan(30)
  // Harta scrie adresele pe SITE_URL (domeniul public), nu pe serverul local: gazda se ia din ea.
  const gazda = new URL(adrese[0]).origin
  return { cai: adrese.map((a) => new URL(a).pathname.replace(/(.)\/$/, '$1')), gazda }
}

test.describe('M1: legaturile intrate pe HTML-ul servit', () => {
  test('fiecare ruta din harta, in afara de / si /promo*, are cel putin 2 legaturi intrate din alte pagini decat /harta-site', async ({ request }) => {
    test.setTimeout(180_000)
    const { cai, gazda } = await caiHarta(request)
    const pagini = new Map<string, string[]>()
    for (const cale of cai) {
      const { status, html } = await citeste(request, cale)
      expect(status, cale).toBe(200)
      pagini.set(cale, legaturiInterne(html, gazda))
    }
    const lipsa = subPrag(cai, pagini)
    const masurate = cai.filter((c) => !scutita(c)).length
    console.log('[M1] pagini citite ' + pagini.size + ' | tinte masurate ' + masurate + ' | sub prag: ' + JSON.stringify(lipsa))
    expect(masurate).toBeGreaterThan(30)
    expect(lipsa).toEqual({})
  })

  test('martor POZITIV: o ruta fabricata fara legaturi si una legata numai din harta sunt prinse', () => {
    const pagini = new Map<string, string[]>([
      ['/a', ['/b', '/c']],
      ['/b', ['/a', '/c']],
      ['/harta-site', ['/numai-din-harta', '/a', '/b']],
      ['/numai-din-harta', ['/numai-din-harta', '/a', '/b']],
    ])
    expect(subPrag(['/a', '/b', '/c', '/ruta-fabricata', '/numai-din-harta'], pagini)).toEqual({
      '/ruta-fabricata': 0,
      '/numai-din-harta': 0,
    })
  })

  test('martor NEGATIV: legaturile din script si cele spre sine nu se numara, startul si /promo* sunt scutite', () => {
    const html = '<a href="/x">x</a><a href="https://3s.exemplu/y?z=1#w">y</a><script>self.__next_f.push(["<a href=\\"/din-script\\">"])</script>'
    expect(legaturiInterne(html, 'https://3s.exemplu').sort()).toEqual(['/x', '/y'])
    const pagini = new Map<string, string[]>([
      ['/x', ['/y', '/x']],
      ['/z', ['/x', '/y']],
    ])
    expect(subPrag(['/', '/promo', '/promo/ceva', '/x', '/y'], pagini)).toEqual({ '/x': 1 })
  })
})

test.describe('m1: listarea blogului duce, pe HTML-ul servit, la fiecare articol', () => {
  test('pornind de la /blog, pe legaturile listarii si ale paginilor ei, se ating toate articolele din harta', async ({ request }) => {
    const { cai, gazda } = await caiHarta(request)
    const articole = cai.filter((c) => /^\/blog\/(?!categorie\/|pagina\/)[^/]+$/.test(c))
    expect(articole.length).toBeGreaterThan(9)
    const atinse = new Set<string>()
    const listari = ['/blog']
    const vazute = new Set<string>()
    while (listari.length > 0) {
      const cale = listari.shift()!
      if (vazute.has(cale)) continue
      vazute.add(cale)
      const { status, html } = await citeste(request, cale)
      expect(status, cale).toBe(200)
      for (const l of legaturiInterne(html, gazda)) {
        if (/^\/blog\/pagina\/[0-9]+$/.test(l)) listari.push(l)
        else if (articole.includes(l)) atinse.add(l)
      }
    }
    console.log('[m1] listari parcurse: ' + [...vazute].join(', ') + ' | articole atinse ' + atinse.size + ' din ' + articole.length)
    expect(vazute.size).toBeGreaterThan(1)
    expect(articole.filter((a) => !atinse.has(a))).toEqual([])
  })

  test('paginile listarii au canonical propriu, iar /blog/pagina/1 si pagina de dupa ultima dau 404', async ({ request }) => {
    const { html } = await citeste(request, '/blog/pagina/2')
    const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => new URL(m[1]).pathname)
    expect(canonical).toEqual(['/blog/pagina/2'])
    expect((await citeste(request, '/blog/pagina/1')).status).toBe(404)
    expect((await citeste(request, '/blog/pagina/99')).status).toBe(404)
  })
})

test.describe('m3 si m5: robots pe pagina de negasit si pe foaia de tipar', () => {
  const robots = (html: string) => [...html.matchAll(/<meta name="robots" content="([^"]*)"/g)].map((m) => m[1])
  const titlu = (html: string) => [...html.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => m[1])

  test('pagina de negasit: 404, titlul ei si un singur meta robots, noindex', async ({ request }) => {
    const { status, html } = await citeste(request, '/nu-exista-seo-tehnic')
    expect(status).toBe(404)
    expect(titlu(html)).toEqual(['Pagina nu există | 3S'])
    expect(robots(html)).toEqual(['noindex'])
  })

  test('foaia de tipar: noindex, follow, un singur meta robots', async ({ request }) => {
    const { status, html } = await citeste(request, '/instrumente/termene-pastrare/tipar')
    expect(status).toBe(200)
    expect(robots(html)).toEqual(['noindex, follow'])
  })
})
