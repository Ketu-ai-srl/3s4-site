import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, describe, expect, it, vi } from 'vitest'

/**
 * Felia 143 (testul 3s.com.ro din 07.10, prima trecere): continutul si legaturile de pe 3s.md si 3s.com.ro, RO si EN.
 *
 * CE SE MASOARA, pe item, fiecare cu martorul lui:
 *  (1) foaia de tipar a preturilor scrie adresa SERVITA pe domeniul care tipareste (pe 3s.com.ro `/preturi` si
 *      `/en/pricing`, nu caile sursa `/ro/preturi` si `/pricing`, a doua cu 404 acolo); adresa e una servita de o ruta;
 *  (2)+(3) numele de pagina din raspunsurile intrebarilor de pe start sunt legaturi, cu adresa servita a fiecarui
 *      domeniu, spre o ruta care exista; fraza de sub intrebari are o propozitie intreaga, cu punct, ca legatura spre
 *      pagina de contact;
 *      Acordul de prelucrare a datelor (nepublic, poarta C) nu e legat;
 *  (4) textul VIZIBIL al startului /ro (randarea paginii, fara scripturi) spune ce compara pagina: Google Drive, fara Box;
 *  (5) subtitlul contrastului de pe cautare numeste cardurile dupa titlu, nu dupa asezare (stanga / dreapta);
 *  (6) pe editia ro-MD, sumele nu se despart de moneda (spatiu nedespartitor), "RO e-Factura" nu se rupe (spatiu
 *      nedespartitor si legatorul U+2060 dupa cratima simpla, fara cratima nedespartitoare); pe editia EN la fel din
 *      runda 2 (poarta de limba EN admite numai aceste doua caractere, ca secventa de evadare), vezi (13) si (15);
 *  (7) tipurile din macheta registrului sunt din vocabularul platformei ("Chitanta", ca in constructor);
 *  (8) "Romania" din tabelul ghidului e-facturilor poarta iconita externa; eroul nu mai promite temeiul si data pe
 *      fiecare termen;
 *  (9) cu o singura tara, pastila selectorului nu e buton;
 *  (10) langa orele rotunjite ale calculatorului fraza spune "circa" / "about".
 * RUNDA 2:
 *  (11) /platforma si /enterprise, RO si EN: "Pagina Despre 3S" / "About page" si ghidurile din raspunsuri sunt
 *       legaturi, cu adresa servita a fiecarui domeniu; FAQPage poarta raspunsul ca sir; implicitul RO fara legaturi;
 *  (12) numarul de pe /contact: NEFACUT in runda 2 (comparatia de identitate dintre build-uri cauta numarul cu
 *       spatii obisnuite); facut in felia 148, cu proba in `tests/numar-curatenie-limba.test.ts`;
 *  (13) /en/pricing: sumele lipite de EUR, "euros" lipit de cuvantul dinainte in H1, orele teaserului lipite de unitate;
 *  (15) "RO e-Factura" pe /en/compare, legat ca pe /ro;
 *  (16) punctul frazei de sub intrebarile startului sta dupa legatura, si pe forma cu adresa de posta (dupa P-40).
 * Martorul de editie, unde componenta e comuna cu site-ul RO: randarea RO ramane cea veche (invarianta pe build o tine
 * `tests/invarianta-ro.test.ts`; aici numai partea care se poate citi fara build).
 *
 * FIXTURILE se asambleaza la rulare: textele vechi cautate de martori se compun din bucati.
 */

const profil = (nume: string) => JSON.parse(readFileSync(join(__dirname, '..', 'config', 'profil-' + nume + '.json'), 'utf8')) as Record<string, unknown>
const text = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))

/** Mediul aplicatiei dat (rutele si asezarea se citesc la import si la randare), apoi modulele proaspete. */
async function cuProfil(nume: '3s-md' | '3s-com-ro') {
  const p = profil(nume)
  for (const k of ['SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ASEZARE', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'CANALE_JSON']) vi.stubEnv(k, p[k] === undefined ? '' : text(p[k]))
  for (const k of ['NEXT_PUBLIC_SITE_EDITII', 'NEXT_PUBLIC_SITE_ASEZARE', 'NEXT_PUBLIC_OPERATOR_NUMIT', 'NEXT_PUBLIC_FAMILIE_JURIDICA']) vi.stubEnv(k, '')
  vi.resetModules()
  const { RUTE } = await import('../src/content/rute')
  const { hrefTinta } = await import('../src/components/primitive/Tinta')
  return {
    RUTE,
    hrefTinta,
    /** Adresele servite de rutele build-ului: o legatura in afara lor e moarta. */
    servite: new Set(RUTE.map((r) => String(hrefTinta(r.cale)))),
    StartEn: (await import('../src/app/(en)/page.en')).default,
    StartRoMd: (await import('../src/app/(romd)/ro/page.romd')).default,
    GhidEfacturiRoMd: (await import('../src/app/(romd)/ro/ghiduri/arhivare-e-facturi-ue/page.romd')).default,
    GhidEfacturiEn: (await import('../src/app/(en)/guides/e-invoice-archiving-eu/page.en')).default,
    GhidMoldovaRoMd: (await import('../src/app/(romd)/ro/ghiduri/termene-pastrare-moldova/page.romd')).default,
    foaie: await import('../src/components/preturi/ListaPdfVedere'),
    pretEn: await import('../src/content/en/pricing-componente'),
    pretRoMd: await import('../src/content/ro-md/preturi-componente'),
  }
}

afterAll(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

const randeaza = (C: ComponentType) => renderToStaticMarkup(createElement(C))

function decodeaza(t: string): string {
  return t
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&')
}

/** Legaturile unui fragment HTML: adresa si textul (fara etichetele din interior). */
function legaturi(html: string): { href: string; text: string; html: string }[] {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: decodeaza(/\shref="([^"]*)"/.exec(m[1])?.[1] ?? ''),
    text: decodeaza(m[2].replace(/<[^>]+>/g, '')).trim(),
    html: m[0],
  }))
}

/** Textul vizibil al unei randari: fara scripturi, stiluri si etichete, cu entitatile decodate. */
function vizibil(html: string): string {
  return decodeaza(
    html
      .replace(/<script\b[\s\S]*?<\/script>/g, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
}

/** Sectiunea de intrebari a startului (ancora `intrebari`). */
function sectiuneIntrebari(html: string): string {
  const i = html.indexOf('id="intrebari"')
  if (i < 0) throw new Error('NEMASURAT: startul nu are sectiunea #intrebari')
  return html.slice(i, html.indexOf('</section>', i))
}

const fara = (href: string) => href.split(/[?#]/)[0]

/** Textul vizibil al frazei de sub intrebari: ultimul paragraf al sectiunii, cu spatiile restranse. */
function subsolIntrebari(html: string): string {
  const p = [...sectiuneIntrebari(html).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].pop()
  if (p === undefined) throw new Error('NEMASURAT: sectiunea #intrebari nu are paragraf')
  return vizibil(p[1]).replace(/\s+/g, ' ').trim()
}

// ---------------------------------------------------------------------------------------------------------------------
// (1) foaia de tipar
// ---------------------------------------------------------------------------------------------------------------------

describe('(1) foaia de tipar a preturilor scrie adresa servita pe domeniul care tipareste', () => {
  it('3s.com.ro: /en/pricing si /preturi, ambele servite de o ruta; calea sursa /pricing nu e servita (martorul 404)', async () => {
    const p = await cuProfil('3s-com-ro')
    const { FoaieOfertaVedere, adresaFoii } = p.foaie
    const en = renderToStaticMarkup(
      createElement(FoaieOfertaVedere, { gazda: '3s.com.ro', data: 'd', continut: p.pretEn.LISTA_PDF_EN, planuri: p.pretEn.PLANURI_EN, cale: p.pretEn.CALE_PRETURI_EN }),
    )
    const ro = renderToStaticMarkup(
      createElement(FoaieOfertaVedere, { gazda: '3s.com.ro', data: 'd', continut: p.pretRoMd.LISTA_PDF_RO_MD, planuri: p.pretRoMd.PLANURI_RO_MD, cale: p.pretRoMd.CALE_PRETURI_RO_MD }),
    )
    expect(en).toContain('>3s.com.ro/en/pricing<')
    expect(ro).toContain('>3s.com.ro/preturi<')
    expect(p.servite.has('/en/pricing')).toBe(true)
    expect(p.servite.has('/preturi')).toBe(true)
    // Martorul: forma veche (gazda + calea sursa) numea o adresa pe care nicio ruta n-o serveste pe acest domeniu.
    const veche = p.pretEn.CALE_PRETURI_EN
    expect(p.servite.has(veche)).toBe(false)
    expect(en).not.toContain('>3s.com.ro' + veche + '<')
    expect(adresaFoii('3s.com.ro', '/r' + 'o/preturi')).toBe('3s.com.ro/preturi')
  })

  it('3s.md: identitatea (/pricing si /ro/preturi), ca inainte', async () => {
    const p = await cuProfil('3s-md')
    expect(p.foaie.adresaFoii('3s.md', p.pretEn.CALE_PRETURI_EN)).toBe('3s.md/pricing')
    expect(p.foaie.adresaFoii('3s.md', p.pretRoMd.CALE_PRETURI_RO_MD)).toBe('3s.md/ro/preturi')
    expect(p.servite.has('/pricing')).toBe(true)
    expect(p.servite.has('/ro/preturi')).toBe(true)
  })

  it('asezarea data ca parametru: pe ro traduce, pe md e identitatea (aceeasi functie ca href-ul legaturilor)', async () => {
    const { adresaFoii } = await import('../src/components/preturi/ListaPdfVedere')
    const rute = [
      { cale: '/ro/preturi', editie: 'ro-MD' as const },
      { cale: '/pricing', editie: 'en' as const },
    ]
    expect(adresaFoii('g', '/pricing', rute, 'ro')).toBe('g/en/pricing')
    expect(adresaFoii('g', '/ro/preturi', rute, 'ro')).toBe('g/preturi')
    expect(adresaFoii('g', '/pricing', rute, 'md')).toBe('g/pricing')
    expect(adresaFoii('g', '/ro/preturi', rute, 'md')).toBe('g/ro/preturi')
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (2) + (3) legaturile din raspunsurile startului
// ---------------------------------------------------------------------------------------------------------------------

describe('(2)(3) numele de pagina din raspunsurile startului sunt legaturi, cu adresa servita, spre rute care exista', () => {
  const asteptat = {
    '3s-com-ro': { legal: '/en/legal/legal-information', about: '/en/about#security', termeni: '/juridic/termeni', contact: '/contact' },
    '3s-md': { legal: '/legal/legal-information', about: '/about#security', termeni: '/ro/juridic/termeni', contact: '/ro/contact' },
  } as const

  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': EN "Legal information" si "About page", RO "Termenii și condițiile" si pagina de contact', async () => {
      const p = await cuProfil(nume)
      const a = asteptat[nume]
      const en = legaturi(sectiuneIntrebari(randeaza(p.StartEn)))
      expect(en.filter((l) => l.text === 'Legal information').map((l) => l.href)).toEqual([a.legal])
      expect(en.filter((l) => l.text === 'About page').map((l) => l.href)).toEqual([a.about])
      const ro = legaturi(sectiuneIntrebari(randeaza(p.StartRoMd)))
      expect(ro.filter((l) => l.text === 'Termenii și condițiile').map((l) => l.href)).toEqual([a.termeni])
      // Runda 2: textul legaturii e numai numele tintei, punctul final sta dupa ea (`dupaSubsol`).
      expect(ro.filter((l) => l.text === 'Vezi canalele prin care ne poți scrie').map((l) => l.href)).toEqual([a.contact])
      // Fraza de sub intrebari e o propozitie incheiata: textul ei vizibil se termina cu punct.
      expect(subsolIntrebari(randeaza(p.StartRoMd))).toMatch(/^Ai altă întrebare\? .+\.$/)
      // Nicio legatura spre Acordul de prelucrare a datelor (nepublic pana la poarta C).
      expect(ro.filter((l) => /dpa/.test(l.href) || l.text.includes('Acordul'))).toEqual([])
      // Titlul "Termenii și condițiile" are deja un "și": al doilea document vine dupa "precum și" (critica de limba).
      expect(sectiuneIntrebari(randeaza(p.StartRoMd))).toContain('</a>, precum și Acordul de prelucrare a datelor, pe care ți-l trimitem odată cu oferta.')
      // Fiecare tinta e servita de o ruta a build-ului (fara fragment).
      for (const h of [a.legal, a.about, a.termeni, a.contact]) expect(p.servite.has(fara(h)), h).toBe(true)
    })
  }

  it('caile scrise literal in continut sunt cele ale registrului juridic si ale rutelor (ancora, ca sa nu deriveze)', async () => {
    const { caleMd } = await import('../src/content/juridic/md/registru')
    const en = await import('../src/content/en/acasa-componente')
    const ro = await import('../src/content/ro-md/acasa-componente')
    const legEn = en.INTREBARI_EN.intrebari.map((i) => i.legaturaInText).filter((l) => l !== undefined)
    expect(legEn).toEqual([
      { text: 'About page', href: '/about#security' },
      { text: 'Legal information', href: caleMd('informatii-legale', 'en') },
    ])
    const legRo = ro.INTREBARI_RO_MD.intrebari.map((i) => i.legaturaInText).filter((l) => l !== undefined)
    expect(legRo).toEqual([{ text: 'Termenii și condițiile', href: caleMd('termeni', 'ro') }])
    // Numele legat apare in raspunsul lui (altfel `cuLegatura` lasa raspunsul fara legatura, tacut).
    for (const i of [...en.INTREBARI_EN.intrebari, ...ro.INTREBARI_RO_MD.intrebari]) {
      if (i.legaturaInText !== undefined) expect(i.raspuns, i.intrebare).toContain(i.legaturaInText.text)
    }
    expect(ro.INTREBARI_RO_MD.subsol.posta.href).toBe('/ro/contact')
  })

  it('martor: aceeasi componenta fara `legaturaInText` lasa raspunsurile fara legatura (forma RO, neschimbata)', async () => {
    const { default: FaqAcasa } = await import('../src/components/acasa/FaqAcasa')
    const { INTREBARI } = await import('../src/content/acasa')
    const en = await import('../src/content/en/acasa-componente')
    const fara = { ...en.INTREBARI_EN, intrebari: en.INTREBARI_EN.intrebari.map(({ intrebare, raspuns }) => ({ intrebare, raspuns })) }
    const raspunsuri = (html: string) => [...html.matchAll(/role="region"[\s\S]*?<\/div><\/div>/g)].map((m) => m[0]).join('')
    expect(legaturi(raspunsuri(renderToStaticMarkup(createElement(FaqAcasa, { continut: fara }))))).toEqual([])
    expect(legaturi(raspunsuri(renderToStaticMarkup(createElement(FaqAcasa, { continut: en.INTREBARI_EN })))).map((l) => l.text)).toEqual([
      'About page',
      'Legal information',
    ])
    // Pe RO (site-ul vechi) raspunsurile n-au legaturi, ca pe baza.
    expect(legaturi(raspunsuri(renderToStaticMarkup(createElement(FaqAcasa, { continut: INTREBARI }))))).toEqual([])
  })

  it('martor: fraza veche, care se oprea in legatura ("... sunt pe pagina Contact"), nu e o propozitie incheiata', async () => {
    const { default: FaqAcasa } = await import('../src/components/acasa/FaqAcasa')
    const ro = await import('../src/content/ro-md/acasa-componente')
    // Fara text dupa legatura (forma de dinainte de runda 2), ca martorul sa masoare numai fraza veche.
    const veche = { ...ro.INTREBARI_RO_MD, dupaSubsol: '', subsol: { inainte: 'Ai altă întrebare? Canalele prin care ne poți scrie sunt pe ' + 'pagina', posta: { ...ro.LEGATURA_CONTACT_FAQ_RO_MD, text: 'Contact' } } }
    const html = '<section id="intrebari">' + renderToStaticMarkup(createElement(FaqAcasa, { continut: veche, ancora: 'x' })) + '</section>'
    expect(subsolIntrebari(html)).toMatch(/Contact$/)
    expect(subsolIntrebari(html)).not.toMatch(/^Ai altă întrebare\? .+\.$/)
  })

  it('FAQPage din JSON-LD poarta raspunsul intreg, ca sir (legatura e numai pe pagina)', async () => {
    const p = await cuProfil('3s-md')
    const html = randeaza(p.StartEn)
    const en = await import('../src/content/en/acasa-componente')
    const intrebare = en.INTREBARI_EN.intrebari.find((i) => i.legaturaInText?.text === 'Legal information')
    expect(intrebare).toBeDefined()
    expect(html).toContain(JSON.stringify(intrebare!.raspuns).slice(1, -1))
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (4) M7 pe ecran
// ---------------------------------------------------------------------------------------------------------------------

describe('(4) textul vizibil al startului /ro numeste ce compara pagina: Google Drive, fara Box', () => {
  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': fraza "Lucrezi deja cu Google Drive?" si zero "Box" in textul vizibil', async () => {
      const p = await cuProfil(nume)
      const t = vizibil(randeaza(p.StartRoMd))
      expect(t).toContain('Lucrezi deja cu Google Drive?')
      expect(t.match(/\bBox\b/g)).toBeNull()
    })
  }

  it('martor: o fraza cu Box pusa in randare e prinsa de aceeasi citire', () => {
    const plantata = '<main><p>Lucrezi deja cu Google Drive sau cu ' + 'B' + 'ox?</p><script>var x="Box"</script></main>'
    expect(vizibil(plantata).match(/\bBox\b/g)).toEqual(['Box'])
    // Scripturile nu sunt text vizibil: "Box" din script nu se numara.
    expect(vizibil('<main><script>var x="Box"</script></main>').match(/\bBox\b/g)).toBeNull()
  })

  it('reziduul nerandat din about.ts numeste comparatia ca meniul: "3S vs Google Drive"', () => {
    const sursa = readFileSync(join(__dirname, '..', 'src', 'content', 'en', 'about.ts'), 'utf8')
    expect(sursa).toContain('[3S vs Google Drive](/compare/3s-vs-google-and-box)')
    expect(sursa).not.toContain('Google and ' + 'Box AI')
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (5) subtitlul contrastului
// ---------------------------------------------------------------------------------------------------------------------

describe('(5) subtitlul contrastului de pe cautare e adevarat la orice latime', () => {
  const ASEZARE = /stânga|dreapta|\bleft\b|\bright\b/i

  // Forma din runda 1 ("Inainte, deschideai... Acum primesti...") ii spunea unui vizitator care nu foloseste inca 3S
  // ca deja primeste raspunsul (critica de limba): fraza pune fata in fata lucrul fara 3S si lucrul cu 3S.
  const PREZENT_FALS = /\bAcum primești\b|\bNow you get\b/

  it('RO si EN: fara stanga / dreapta si fara prezentul fals, cu lucrul fara 3S fata de lucrul cu 3S', async () => {
    const { CONTRAST_CAUTARE_RO_MD } = await import('../src/content/ro-md/cautare-ai-componente')
    const { CONTRAST_POVESTE } = await import('../src/content/en/features-search')
    const perechi: Array<[string, string, string]> = [
      [CONTRAST_CAUTARE_RO_MD.paragraf, 'Fără 3S, ', '. Cu 3S, '],
      [CONTRAST_POVESTE.paragraf, 'Without 3S, ', '. With 3S, '],
    ]
    for (const [paragraf, fara, cu] of perechi) {
      expect(paragraf).not.toMatch(ASEZARE)
      expect(paragraf).not.toMatch(PREZENT_FALS)
      expect(paragraf.startsWith(fara)).toBe(true)
      expect(paragraf).toContain(cu)
    }
  })

  it('RO: pagina /functionalitati/cautare-ai poarta aceeasi fraza ca componenta', async () => {
    const { CONTRAST_CAUTARE_RO_MD } = await import('../src/content/ro-md/cautare-ai-componente')
    const sursa = readFileSync(join(__dirname, '..', 'src', 'content', 'ro-md', 'cautare-ai.ts'), 'utf8')
    expect(sursa).toContain(CONTRAST_CAUTARE_RO_MD.paragraf)
  })

  it('martor: formele vechi sunt prinse', () => {
    expect('În ' + 'stânga, dosarele deschise pe rând. În ' + 'dreapta, răspunsul').toMatch(ASEZARE)
    expect('On the ' + 'left, folders. On the ' + 'right, the answer').toMatch(ASEZARE)
    expect('Înainte, deschideai dosarele pe rând. Acum ' + 'primești răspunsul').toMatch(PREZENT_FALS)
    expect('Before, you opened folders. Now ' + 'you get the answer').toMatch(PREZENT_FALS)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (6) sumele, "RO e-Factura"
// ---------------------------------------------------------------------------------------------------------------------

/** Perechile cifra-moneda despartite printr-un spatiu OBISNUIT (unde navigatorul poate rupe randul). */
function sumeRupte(t: string): string[] {
  return [...t.matchAll(/\d EUR\b|\bEUR \d/g)].map((m) => m[0])
}

/** Orele calculatorului despartite de "h" sau "circa" despartit de cifra, printr-un spatiu OBISNUIT. */
function oreRupte(t: string): string[] {
  return [...t.matchAll(/\d h\b|\bcirca \d/g)].map((m) => m[0])
}

describe('(6) sumele nu se despart de moneda, iar "RO e-Factura" nu se rupe (editia ro-MD)', () => {
  // Editia EN: din runda 2 poarta de limba EN admite U+00A0 si U+2060 ca secventa de evadare (exceptia numita), deci
  // perechile EN se leaga la fel; le masoara (13) si (15).
  // Se citeste TEXTUL VIZIBIL al paginilor randate (tabelul planurilor, pliurile cu suplimentele, cardurile, teaserul
  // calculatorului), nu o lista de constante aleasa de mana: o suma construita in alt loc ar scapa unei liste. Pe
  // /ro/preturi randarea are 18 sume (masurat 07.10); minimul e controlul ca citirea chiar le vede.
  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': /ro/preturi, /ro/enterprise si startul /ro, zero sume si ore despartite de unitate', async () => {
      const p = await cuProfil(nume)
      // Paginile se importa aici, dupa profil (nu in `cuProfil`): fiecare import la rece costa, iar celelalte cazuri
      // nu le folosesc.
      const PreturiRoMd = (await import('../src/app/(romd)/ro/preturi/page.romd')).default
      const EnterpriseRoMd = (await import('../src/app/(romd)/ro/enterprise/page.romd')).default
      const pagini = [
        ['/ro/preturi', PreturiRoMd, 18],
        ['/ro/enterprise', EnterpriseRoMd, 1],
        ['/ro', p.StartRoMd, 1],
      ] as const
      for (const [cale, C, minim] of pagini) {
        const t = vizibil(randeaza(C))
        // Controlul: pagina chiar are sume legate (altfel zero perechi rupte n-ar spune nimic).
        expect((t.match(/\d\u00a0EUR\b/g) ?? []).length, cale).toBeGreaterThanOrEqual(minim)
        expect(sumeRupte(t), cale).toEqual([])
        expect(oreRupte(t), cale).toEqual([])
      }
    })
  }

  // Frazele de rezultat ale calculatorului apar numai dupa interactiune (nu sunt in randarea statica): se citesc
  // bucatile din care le compune vederea (suma + dupaBani/dupaPret + ore + dupaOre).
  it('calculatorul: moneda si "h" lipite de cifra prin spatiu nedespartitor, "circa" lipit de ore', async () => {
    const { CALCULATOR_RO_MD: c } = await import('../src/content/ro-md/preturi-componente')
    for (const t of [c.timpAcum.dupaBani, c.pretInOre.dupaPret, c.pretInOreAnual.dupaPret]) {
      expect(t.startsWith('\u00a0EUR ')).toBe(true)
      expect(t.endsWith(' circa\u00a0')).toBe(true)
    }
    for (const t of [c.timpAcum.dupaOre, c.pretInOre.dupaOre, c.pretInOreAnual.dupaOre]) expect(t.startsWith('\u00a0h ')).toBe(true)
    const fraza = '1.833' + c.timpAcum.dupaBani + '36,7' + c.timpAcum.dupaOre
    expect(sumeRupte(fraza)).toEqual([])
    expect(oreRupte(fraza)).toEqual([])
  })

  it('martor: o celula de tabel cu spatiu obisnuit e prinsa pe aceeasi citire (pagina randata)', async () => {
    const pretRoMd = await import('../src/content/ro-md/preturi-componente')
    const { default: TabelPlanuri } = await import('../src/components/preturi/TabelPlanuri')
    const tabel = (c: typeof pretRoMd.TABEL_RO_MD) => vizibil(renderToStaticMarkup(createElement(TabelPlanuri, { continut: c, planuri: pretRoMd.PLANURI_RO_MD })))
    expect(sumeRupte(tabel(pretRoMd.TABEL_RO_MD))).toEqual([])
    const veche = JSON.parse(JSON.stringify(pretRoMd.TABEL_RO_MD).split('\u00a0EUR').join(' EUR')) as typeof pretRoMd.TABEL_RO_MD
    expect(sumeRupte(tabel(veche))).toEqual(['6 EUR', '6 EUR', '6 EUR'])
  })

  it('martor: o suma sau o ora cu spatiu obisnuit e prinsa, pe ambele ordini', () => {
    expect(sumeRupte('Starter 9' + '0 EUR, Pro EUR 1' + '50')).toEqual(['0 EUR', 'EUR 1'])
    expect(oreRupte('cele circa' + ' 36,7 h \u00een care')).toEqual(['circa 3', '7 h'])
  })

  it('taxa de conectare: si "la" ramane langa numarul de pagini', async () => {
    const pretRoMd = await import('../src/content/ro-md/preturi-componente')
    // La 390 se rupea "6 EUR la" / "1.000 de pagini".
    expect(pretRoMd.CONECTARE_RO_MD.startsWith('6\u00a0EUR la\u00a01.000 de pagini')).toBe(true)
  })

  it('"RO e-Factura" pe cardul comparatiei /ro: spatiu nedespartitor si legatorul dupa cratima simpla', async () => {
    const { DIVIZAT_COMPARATIE_RO_MD } = await import('../src/content/ro-md/comparatie-componente')
    const toate = JSON.stringify(DIVIZAT_COMPARATIE_RO_MD)
    expect(toate.split('RO\u00a0e-\u2060Factura').length - 1).toBe(1)
    // Nicio cratima urmata direct de "Factura" (acolo navigatorul rupe) si nicio cratima nedespartitoare (U+2011).
    expect(toate).not.toMatch(/-Factura/)
    expect(toate).not.toContain(String.fromCharCode(0x2011))
  })

  it('martor: forma veche are punctul de rupere', () => {
    expect('din RO e' + '-Factura').toMatch(/-Factura/)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (7) tipurile din macheta registrului
// ---------------------------------------------------------------------------------------------------------------------

describe('(7) macheta registrului foloseste tipurile platformei', () => {
  it('"Chitanță" in locul lui "Bon", acelasi nume ca in constructorul paginii; paragraful pasului 1 la fel', async () => {
    const { MACHETA_REGISTRU_RO_MD, PASI_RO_MD } = await import('../src/content/ro-md/acasa-componente')
    const constructor = readFileSync(join(__dirname, '..', 'src', 'content', 'ro-md', 'acasa-constructor-componente.ts'), 'utf8')
    const tipuri = MACHETA_REGISTRU_RO_MD.randuri.map((r) => r.tip.text)
    expect(tipuri).toEqual(['Factură', 'Chitanță', 'Contract'])
    expect(constructor).toContain('"Chitanță"')
    expect(tipuri).not.toContain('B' + 'on')
    expect(PASI_RO_MD[0].paragraf).toContain('contract, factură sau chitanță')
    expect(PASI_RO_MD[0].paragraf).not.toMatch(/\bbon\b/)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (8) ghidul e-facturilor
// ---------------------------------------------------------------------------------------------------------------------

describe('(8) ghidul e-facturilor: legatura "România" e externa, iar eroul nu promite ce nu arata', () => {
  /** Legatura din numele tarii: cea din celula `rowheader`. */
  function legaturaTara(html: string, tara: string) {
    const l = legaturi(html).filter((x) => x.text === tara && /tabelTaraLegatura/.test(x.html))
    if (l.length !== 1) throw new Error('NEMASURAT: legatura tarii ' + tara + ' gasita de ' + l.length + ' ori')
    return l[0]
  }

  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': RO si EN, iconita externa pe legatura tarii, spre documentul ANAF', async () => {
      const p = await cuProfil(nume)
      for (const [C, tara] of [
        [p.GhidEfacturiRoMd, 'România'],
        [p.GhidEfacturiEn, 'Romania'],
      ] as const) {
        const l = legaturaTara(randeaza(C), tara)
        expect(l.href).toMatch(/^https:\/\/static\.anaf\.ro\//)
        expect(l.html).toContain('lucide-external-link')
        expect(l.html).not.toContain('lucide-arrow-right')
      }
    })
  }

  it('martor de editie: pagina RO (site-ul vechi) pastreaza sageata, ca pe baza', async () => {
    vi.unstubAllEnvs()
    vi.resetModules()
    const { default: EfacturareRo } = await import('../src/app/e-facturare/page')
    const l = legaturaTara(randeaza(EfacturareRo), 'România')
    expect(l.html).toContain('lucide-arrow-right')
    expect(l.html).not.toContain('lucide-external-link')
  })

  it('eroul si descrierea: fara promisiunea temeiului si a datei pe fiecare termen sau rand', async () => {
    const { EFACTURARE_RO_MD, PAGINA_EFACTURARE_RO_MD } = await import('../src/content/ro-md/ghid-e-facturare-componente')
    const promisiune = /temeiul legal|fiecărui rând|pentru fiecare termen/i
    expect(EFACTURARE_RO_MD.erou.subtitlu).not.toMatch(promisiune)
    expect(PAGINA_EFACTURARE_RO_MD.meta.descriere).not.toMatch(promisiune)
    expect(JSON.stringify(PAGINA_EFACTURARE_RO_MD.jsonLd)).not.toMatch(/fiecărui rând/)
    // Controlul: data verificarii ramane, una singura, sub tabel.
    expect(EFACTURARE_RO_MD.tabel.dataVerificariiText).not.toBe('')
    expect('Pentru fiecare termen, ghidul indică ' + 'temeiul legal și data verificării.').toMatch(promisiune)
  })

  it('EN, aliniat la RO: nicio sursa nu mai promite o data pe fiecare rand (ghidurile arata o singura data)', () => {
    const promisiune = /each row (was|is) checked|date (of|for) each row/i
    for (const f of ['guides-e-invoice-archiving-eu.ts', 'about.ts', 'home.ts']) {
      const sursa = readFileSync(join(__dirname, '..', 'src', 'content', 'en', f), 'utf8')
      expect(sursa, f).not.toMatch(promisiune)
      expect(sursa, f).toContain('the date they were checked')
    }
    // Martorul: forma veche e prinsa.
    expect('with primary sources and the date ' + 'each row was checked.').toMatch(promisiune)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (9) pastila "Republica Moldova"
// ---------------------------------------------------------------------------------------------------------------------

describe('(9) cu o singura tara, pastila selectorului nu e buton', () => {
  it('o tara: eticheta (span), fara buton, fara aria-pressed, panoul vizibil; doua tari: butoane (martorul)', async () => {
    const { default: SelectorTari } = await import('../src/components/termene/SelectorTari')
    const panou = (t: string) => createElement('p', null, t)
    // Panourile se dau ca argumente de copil ale lui createElement; tipul cere `children`, deci proprietatile se tipizeaza.
    type Props = Parameters<typeof SelectorTari>[0]
    const una = renderToStaticMarkup(createElement(SelectorTari, { tari: [{ cod: 'md', nume: 'Republica Moldova' }], eticheta: 'Țara' } as Props, panou('P-MD')))
    expect(una).not.toContain('<button')
    expect(una).not.toContain('aria-pressed')
    expect(una).toMatch(/<span class="[^"]*pastila[^"]*">/)
    expect(una).toContain('<div id="panou-md"><p>P-MD</p></div>')
    const doua = renderToStaticMarkup(
      createElement(
        SelectorTari,
        {
          tari: [
            { cod: 'ro', nume: 'România' },
            { cod: 'md', nume: 'Republica Moldova' },
          ],
          eticheta: 'Țara',
        } as Props,
        panou('P-RO'),
        panou('P-MD'),
      ),
    )
    expect(doua.match(/<button/g)?.length).toBe(2)
    expect(doua).toContain('aria-pressed="true"')
  })

  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': ghidul Moldovei /ro nu mai are niciun buton apasat', async () => {
      const p = await cuProfil(nume)
      const html = randeaza(p.GhidMoldovaRoMd)
      expect(html).toContain('Republica Moldova')
      expect(html).not.toContain('aria-pressed')
    })
  }
})

// ---------------------------------------------------------------------------------------------------------------------
// (10) orele rotunjite
// ---------------------------------------------------------------------------------------------------------------------

describe('(10) langa orele rotunjite ale calculatorului fraza spune "circa" / "about"', () => {
  it('RO-MD si EN: fraza timpului, fraza pachetului (lunar si anual) si teaserul', async () => {
    const { CALCULATOR_RO_MD } = await import('../src/content/ro-md/preturi-componente')
    const { CALCULATOR_EN } = await import('../src/content/en/pricing-componente')
    const { textTeaserRoMd } = await import('../src/app/(romd)/ro/_editie/PreturiRoMd')
    const { textTeaserEn } = await import('../src/components/preturi/PreturiEn')
    for (const t of [CALCULATOR_RO_MD.timpAcum.dupaBani, CALCULATOR_RO_MD.pretInOre.dupaPret, CALCULATOR_RO_MD.pretInOreAnual.dupaPret]) expect(t.endsWith(' circa\u00a0')).toBe(true)
    // Runda 2: "about" lipit de cifra pe EN, ca "circa" pe RO, iar cifra lipita de unitate in teaser.
    for (const t of [CALCULATOR_EN.timpAcum.dupaBani, CALCULATOR_EN.pretInOre.dupaPret, CALCULATOR_EN.pretInOreAnual.dupaPret]) expect(t.endsWith(' about\u00a0')).toBe(true)
    expect(textTeaserRoMd().rezultat).toBe('se adună circa\u00a036,7\u00a0ore lunar')
    expect(textTeaserEn().rezultat).toBe('totals about\u00a036.7\u00a0h a month')
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// RUNDA 2: (11) legaturile de pe /platforma si /enterprise
// ---------------------------------------------------------------------------------------------------------------------

/** Sectiunea cu `aria-labelledby` dat (intrebarile platformei, lista enterprise). */
function sectiune(html: string, eticheta: string): string {
  const i = html.indexOf('aria-labelledby="' + eticheta + '"')
  if (i < 0) throw new Error('NEMASURAT: sectiunea ' + eticheta + ' lipseste')
  return html.slice(i, html.indexOf('</section>', i))
}

describe('(11) /platforma si /enterprise: numele paginilor din raspunsuri sunt legaturi, cu adresa servita', () => {
  const asteptat = {
    '3s-com-ro': {
      despreRo: '/securitate#security',
      moldovaRo: '/ghiduri/termene-pastrare-moldova',
      efacturiRo: '/ghiduri/arhivare-e-facturi-ue',
      aboutEn: '/en/about#security',
      moldovaEn: '/en/guides/records-retention-moldova',
      efacturiEn: '/en/guides/e-invoice-archiving-eu',
    },
    '3s-md': {
      despreRo: '/ro/securitate#security',
      moldovaRo: '/ro/ghiduri/termene-pastrare-moldova',
      efacturiRo: '/ro/ghiduri/arhivare-e-facturi-ue',
      aboutEn: '/about#security',
      moldovaEn: '/guides/records-retention-moldova',
      efacturiEn: '/guides/e-invoice-archiving-eu',
    },
  } as const

  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': intrebarile /platforma (RO si EN) si cardul "Locul datelor" de pe /enterprise (RO si EN)', async () => {
      const p = await cuProfil(nume)
      const a = asteptat[nume]
      const PlatformaRo = (await import('../src/app/(romd)/ro/platforma/page.romd')).default
      const PlatformaEn = (await import('../src/app/(en)/platform/page.en')).default
      const EnterpriseRo = (await import('../src/app/(romd)/ro/enterprise/page.romd')).default
      const EnterpriseEn = (await import('../src/app/(en)/enterprise/page.en')).default
      const perechi = (html: string, id: string) => legaturi(sectiune(html, id)).map((l) => [l.text, l.href])
      expect(perechi(randeaza(PlatformaRo), 'platforma-intrebari')).toEqual([
        ['Pagina Despre 3S', a.despreRo],
        ['termenele de păstrare în Moldova', a.moldovaRo],
        ['arhivarea e-facturilor în UE', a.efacturiRo],
      ])
      expect(perechi(randeaza(PlatformaEn), 'platforma-intrebari')).toEqual([
        ['About page', a.aboutEn],
        ['records retention in Moldova', a.moldovaEn],
        ['e-invoice archiving in the EU', a.efacturiEn],
      ])
      expect(perechi(randeaza(EnterpriseRo), 'livrabile-titlu')).toEqual([['Pagina Despre 3S', a.despreRo]])
      expect(perechi(randeaza(EnterpriseEn), 'livrabile-titlu')).toEqual([['About page', a.aboutEn]])
      // Fiecare tinta e servita de o ruta a build-ului (fara fragment).
      for (const h of Object.values(a)) expect(p.servite.has(fara(h)), h).toBe(true)
    })
  }

  it('FAQPage de pe /platforma poarta raspunsul intreg, ca sir (legatura e numai pe pagina)', async () => {
    await cuProfil('3s-md')
    const PlatformaEn = (await import('../src/app/(en)/platform/page.en')).default
    const { PLATFORMA_EN } = await import('../src/content/en/platforma-componente')
    const html = randeaza(PlatformaEn)
    const legate = PLATFORMA_EN.intrebari!.intrebari.filter((i) => i.legaturiInText !== undefined)
    expect(legate).toHaveLength(2)
    for (const i of legate) expect(html).toContain(JSON.stringify(i.raspuns).slice(1, -1))
  })

  it('numele legate apar in textul lor (altfel `cuLegatura` lasa textul fara legatura, tacut)', async () => {
    const md = await import('../src/content/ro-md/platforma-componente')
    const en = await import('../src/content/en/platforma-componente')
    const lmd = await import('../src/content/ro-md/enterprise-componente')
    const len = await import('../src/content/en/enterprise-componente')
    for (const i of [...md.PLATFORMA_RO_MD.intrebari!.intrebari, ...en.PLATFORMA_EN.intrebari!.intrebari]) {
      for (const l of i.legaturiInText ?? []) expect(i.raspuns, i.intrebare).toContain(l.text)
    }
    for (const e of [...lmd.LIVRABILE_RO_MD.elemente, ...len.LIVRABILE_EN.elemente]) {
      if (e.legaturaInText !== undefined) expect(e.text, e.titlu).toContain(e.legaturaInText.text)
    }
  })

  it('martor de editie: implicitul RO (site-ul vechi) ramane fara legaturi in intrebari si in lista enterprise', async () => {
    const { default: PaginaPlatforma } = await import('../src/components/produs/PaginaPlatforma')
    const { default: ListaLivrabile } = await import('../src/components/enterprise/ListaLivrabile')
    expect(legaturi(sectiune(renderToStaticMarkup(createElement(PaginaPlatforma)), 'platforma-intrebari'))).toEqual([])
    expect(legaturi(sectiune(renderToStaticMarkup(createElement(ListaLivrabile)), 'livrabile-titlu'))).toEqual([])
  })

  it('martor: aceleasi intrebari fara `legaturiInText` (forma rundei 1) dau zero legaturi pe aceeasi citire', async () => {
    const { default: PaginaPlatforma } = await import('../src/components/produs/PaginaPlatforma')
    const { PLATFORMA_EN } = await import('../src/content/en/platforma-componente')
    const q = PLATFORMA_EN.intrebari!
    const vechi = { ...PLATFORMA_EN, intrebari: { ...q, intrebari: q.intrebari.map(({ intrebare, raspuns }) => ({ intrebare, raspuns })) } }
    const html = renderToStaticMarkup(createElement(PaginaPlatforma, { continut: vechi, sectiuni: ['intrebari'] }))
    expect(legaturi(sectiune(html, 'platforma-intrebari'))).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// RUNDA 2: (13) /en/pricing si (15) "RO e-Factura" pe /en/compare
// ---------------------------------------------------------------------------------------------------------------------

describe('(13)(15) editia EN: sumele lipite de EUR, "in euros" si orele nedespartite, "RO e-Factura" intreg', () => {
  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': /en/pricing, zero sume despartite de EUR; H1 cu "in euros" lipit; teaserul cu unitatea lipita', async () => {
      await cuProfil(nume)
      const PreturiEn = (await import('../src/app/(en)/pricing/page.en')).default
      const html = randeaza(PreturiEn)
      const t = vizibil(html)
      // Controlul: citirea chiar vede sumele legate (masurat 07.10: 17 pe pagina randata).
      expect((t.match(/\bEUR\u00a0\d/g) ?? []).length).toBeGreaterThanOrEqual(15)
      expect(sumeRupte(t)).toEqual([])
      const h1 = vizibil(/<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? '')
      expect(h1).toBe('3S pricing: four plans, in\u00a0euros')
      expect(t).toContain('about\u00a036.7\u00a0h')
      expect(oreRupte(t)).toEqual([])
    })

    it(nume + ': /en/compare, "RO e-Factura" cu spatiu nedespartitor si legatorul dupa cratima simpla', async () => {
      await cuProfil(nume)
      const Compara = (await import('../src/app/(en)/compare/3s-vs-google-and-box/page.en')).default
      const t = vizibil(randeaza(Compara))
      expect(t).toContain('RO\u00a0e-\u2060Factura')
      expect(t).not.toContain('RO e-Factura')
      expect(t).not.toContain('\u2011')
    })
  }

  it('martor: forma de dinainte a H1 si o suma EN cu spatiu obisnuit sunt prinse', () => {
    expect(sumeRupte('Starter EUR 90, Pro EUR\u00a0150')).toEqual(['EUR 9'])
    expect('3S pricing: four plans, in euros').not.toBe('3S pricing: four plans, in\u00a0euros')
    expect(oreRupte('about\u00a036.7 h')).toEqual(['7 h'])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// RUNDA 2: (16) punctul frazei de sub intrebari, in afara legaturii, pe ambele forme
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Textul frazei de sub intrebari cu etichetele scoase FARA spatiu in locul lor (`vizibil` pune un spatiu, ceea ce ar
 * desparti punctul de legatura si n-ar mai spune unde sta): asa se vede daca punctul e lipit de legatura.
 */
function paragrafLipit(html: string): string {
  const p = [...sectiuneIntrebari(html).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].pop()
  if (p === undefined) throw new Error('NEMASURAT: sectiunea #intrebari nu are paragraf')
  return decodeaza(p[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
}

describe('(16) fraza de sub intrebarile startului /ro: punctul final dupa legatura', () => {
  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': fara adresa (forma de azi) si cu adresa de posta (dupa P-40)', async () => {
      const p = await cuProfil(nume)
      const fara = sectiuneIntrebari(randeaza(p.StartRoMd))
      const legFara = legaturi(fara).filter((l) => l.href.endsWith('/contact'))
      expect(legFara.map((l) => l.text)).toEqual(['Vezi canalele prin care ne poți scrie'])
      expect(paragrafLipit(randeaza(p.StartRoMd))).toBe('Ai altă întrebare? Vezi canalele prin care ne poți scrie.')
      // Dupa P-40: domeniul are adresa de posta (CANALE_JSON cu e-mail), pagina inlocuieste `subsol`.
      const canale = JSON.parse(text(profil(nume).CANALE_JSON)) as Record<string, unknown>
      vi.stubEnv('CANALE_JSON', JSON.stringify({ ...canale, email: 'contact@3s.com.ro' }))
      vi.resetModules()
      const StartCuPosta = (await import('../src/app/(romd)/ro/page.romd')).default
      const html = randeaza(StartCuPosta)
      expect(paragrafLipit(html)).toBe('Ne poți scrie la contact@3s.com.ro.')
      // Punctul nu e in textul legaturii (adresa ramane exacta).
      expect(legaturi(sectiuneIntrebari(html)).filter((l) => l.href.startsWith('mailto:')).map((l) => l.text)).toEqual(['contact@3s.com.ro'])
    })
  }

  it('martor de editie: startul RO (site-ul vechi) nu pune nimic dupa legatura frazei', async () => {
    const { default: FaqAcasa } = await import('../src/components/acasa/FaqAcasa')
    const { INTREBARI } = await import('../src/content/acasa')
    const html = renderToStaticMarkup(createElement(FaqAcasa, { continut: INTREBARI }))
    // Ultimul paragraf se incheie cu legatura (sau cu textul ei), fara text dupa `</a>`.
    const p = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].pop()![1]
    expect(p.endsWith('</a>') || !p.includes('<a ')).toBe(true)
  })
})
