import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { nodOrganizatie } from '@/components/seo/date-structurate'
import { configurareCanale } from '@/lib/canale-mediu'

/**
 * FARA APELURI GSM, PESTE TOT (decizia 56 a owner-ului, 03.10.2026: "peste tot trebuie sa apara only whatsapp",
 * "fara apeluri pe gsm", "apeluri putem primi, dar numai pe whatsapp"; "peste tot" = si site-ul romanesc). Numarul
 * ramane afisat ca numar de WhatsApp, e-mailurile raman; nicio legatura de apel si niciun `telephone` in datele
 * structurate (care poate aduce un buton de apel in rezultatele cautarii).
 *
 * Ce masoara, fiecare cu control si martor:
 *   1. SURSA: zero aparitii ale schemei de apel in `src/` (cod, continut, comentarii), deci nicio componenta nu o
 *      mai poate construi, pe nicio editie si cu niciun `CANALE_JSON`.
 *   2. BUILD-UL ROMANESC din `.next` (in CI, dupa `pnpm build`): zero aparitii in TOT ce serveste (HTML, fluxul RSC,
 *      corpurile rutelor), zero `telephone` in JSON-LD. Pe 3s.md, aceeasi masuratoare o face proba de acceptanta pe
 *      copia construita cu profilul domeniului (`tests/browser/acceptanta-3s-md.spec.ts`), pe toate caile hartii.
 *      LIMITA: build-ul RO al probelor nu are `CANALE_JSON`, deci nici baza nu emitea acolo `telephone` sau legaturi
 *      de apel; pe build, cazurile 2 apara numai impotriva unei regresii care le-ar aduce fara canale.
 *   3. NODUL ORGANIZATIEI pe editia `ro-RO`, cu canalele REALE ale domeniului (`CANALE_JSON` din profilul 3s.md, care
 *      au si telefon si WhatsApp): fara `telephone` oriunde in nod, iar punctul de contact are `url` wa.me. Asta e
 *      singurul efect al deciziei pe ro-RO care depinde de canale, deci se masoara direct, nu prin build.
 *
 * LIMITA DECLARATA (nemasurata aici, ramasa deschisa): textele juridice ale familiei SEE
 * (`src/content/juridic/confidentialitate.ts`, `mentiuni-legale.ts`, `termeni.ts`) invita inca la apel cand operatorul
 * are telefon: dupa e-mail urmeaza numarul operatorului ca al doilea canal, cu verbul "a suna" sau cu "sau la". Azi
 * sunt adormite: `config/operator.json` are operatorul null, iar operatorul domeniului 3s.md e din Republica Moldova,
 * deci publica familia `md` (curatata dupa decizia 56); nicio pagina servita nu randeaza textele SEE. Devin vizibile
 * in ziua in care un site primeste un operator din SEE cu numar de telefon. Textele juridice sunt la revizuire
 * juridica, iar perimetrul acestei schimbari le-a lasat neatinse; reformularea lor ("ori pe WhatsApp (mesaje si
 * apeluri) la" + numar) se face odata cu operatorul SEE, inainte ca acela sa fie pus in configurare.
 *
 * Schema se asambleaza la rulare (proba nu poarta literal ce vaneaza), iar martorii pozitivi o injecteaza intr-o
 * COPIE in memorie a unui fisier real; fisierele de pe disc nu se ating.
 */

const RADACINA = join(__dirname, '..')
const SCHEMA_APEL = 'te' + 'l:'
/** Schema, oriunde, fara diferenta de majuscule; "Hotel:" sau "motel:" nu sunt apeluri. */
const TIPAR_APEL = new RegExp('(?<![a-z])' + SCHEMA_APEL, 'gi')
const APP = join(RADACINA, '.next', 'server', 'app')

function aparitii(text: string): number {
  return (text.match(TIPAR_APEL) ?? []).length
}

/** Fisierele unui director, recursiv, cu extensiile date. */
function fisiere(dir: string, extensii: RegExp): string[] {
  const rezultat: string[] = []
  for (const intrare of readdirSync(dir)) {
    const cale = join(dir, intrare)
    if (statSync(cale).isDirectory()) rezultat.push(...fisiere(cale, extensii))
    else if (extensii.test(intrare)) rezultat.push(cale)
  }
  return rezultat
}

/** Valorile `telephone` din blocurile JSON-LD ale unui HTML (oriunde in graf). */
function telefoaneLd(html: string): string[] {
  const gasite: string[] = []
  const strabate = (nod: unknown): void => {
    if (Array.isArray(nod)) nod.forEach(strabate)
    else if (nod && typeof nod === 'object') {
      for (const [cheie, valoare] of Object.entries(nod)) {
        if (cheie === 'telephone') gasite.push(String(valoare))
        else strabate(valoare)
      }
    }
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) strabate(JSON.parse(m[1]))
  return gasite
}

describe('decizia 56: sursa fara legaturi de apel', () => {
  const sursa = fisiere(join(RADACINA, 'src'), /\.(tsx?|mjs|json|mdx?|css)$/)

  it('zero aparitii ale schemei de apel in src/ (numarate pe toate fisierele, cu controlul listei)', () => {
    // Controlul listei: sursa e citita intreaga (sute de fisiere, cu cele care afiseaza numarul).
    expect(sursa.length).toBeGreaterThan(300)
    expect(sursa.some((f) => f.endsWith(join('content', 'canale.ts')))).toBe(true)
    const cu = sursa.map((f) => [f.slice(RADACINA.length + 1), aparitii(readFileSync(f, 'utf8'))] as const).filter(([, n]) => n > 0)
    expect(cu).toEqual([])
  })

  it('martor POZITIV: o legatura de apel injectata intr-o copie a unui fisier real e prinsa, si cu majuscule', () => {
    const real = readFileSync(join(RADACINA, 'src', 'components', 'global', 'Subsol.tsx'), 'utf8')
    expect(aparitii(real)).toBe(0)
    expect(aparitii(real + '\n<a href="' + SCHEMA_APEL + '+37300000000">x</a>')).toBe(1)
    expect(aparitii(real.replace('mailto:', SCHEMA_APEL.toUpperCase()))).toBeGreaterThan(0)
  })

  it('martor NEGATIV: cuvintele care se termina in literele schemei nu sunt apeluri', () => {
    expect(aparitii('Ho' + SCHEMA_APEL + ' 3 stele; mo' + SCHEMA_APEL + ' x; type="' + SCHEMA_APEL.slice(0, 3) + '"')).toBe(0)
  })
})

describe('decizia 56: build-ul romanesc fara legaturi de apel si fara telephone', () => {
  function serviteRo(): string[] {
    if (!existsSync(join(RADACINA, '.next', 'BUILD_ID'))) throw new Error('NEMASURAT: lipseste .next/BUILD_ID - proba cere build-ul RO (pnpm build, fara SITE_EDITII)')
    const start = readFileSync(join(APP, 'index.html'), 'utf8')
    if (!start.includes('<html lang="ro"')) throw new Error('NEMASURAT: build-ul din .next nu e cel romanesc (startul nu are lang="ro")')
    return fisiere(APP, /\.(html|rsc|body|meta)$/)
  }

  it('zero aparitii ale schemei de apel in tot ce serveste build-ul (HTML, RSC, corpuri), cu controlul listei', () => {
    const servite = serviteRo()
    const html = servite.filter((f) => f.endsWith('.html'))
    // Controlul: build-ul are paginile site-ului romanesc, inclusiv contactul si startul.
    expect(html.length).toBeGreaterThan(40)
    expect(html.some((f) => f.endsWith(join('app', 'contact.html')))).toBe(true)
    const cu = servite.map((f) => [f.slice(APP.length + 1), aparitii(readFileSync(f, 'utf8'))] as const).filter(([, n]) => n > 0)
    console.log('[fara-apel-gsm] build RO: ' + servite.length + ' fisiere servite citite (' + html.length + ' HTML), cu schema de apel: ' + cu.length)
    expect(cu).toEqual([])
  })

  it('zero `telephone` in JSON-LD, pe toate paginile HTML (cu controlul ca JSON-LD exista)', () => {
    const html = serviteRo().filter((f) => f.endsWith('.html'))
    let blocuri = 0
    const cu: string[] = []
    for (const f of html) {
      const text = readFileSync(f, 'utf8')
      blocuri += (text.match(/<script type="application\/ld\+json">/g) ?? []).length
      if (telefoaneLd(text).length > 0) cu.push(f.slice(APP.length + 1))
    }
    expect(blocuri).toBeGreaterThan(40)
    expect(cu).toEqual([])
  })

  it('martor POZITIV: startul real, cu o legatura de apel si un telephone injectate in copie, e prins de ambii detectori', () => {
    serviteRo()
    const start = readFileSync(join(APP, 'index.html'), 'utf8')
    const ld = '<script type="application/ld+json">' + JSON.stringify({ '@type': 'Organization', telephone: '+37300000000' }) + '</script>'
    const stricat = start.replace('</footer>', '<a href="' + SCHEMA_APEL + '+37300000000">x</a></footer>').replace('</head>', ld + '</head>')
    expect(stricat).not.toBe(start)
    expect(aparitii(stricat)).toBe(1)
    expect(telefoaneLd(stricat)).toEqual(['+37300000000'])
  })
})

describe('decizia 56: nodul organizatiei pe ro-RO, cu un domeniu care are telefon', () => {
  const profil = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as { CANALE_JSON: unknown }
  const canale = configurareCanale(JSON.stringify(profil.CANALE_JSON), '')

  /** Valorile `telephone` dintr-un obiect, oriunde in el. */
  function telefoane(nod: unknown): string[] {
    const gasite: string[] = []
    const strabate = (x: unknown): void => {
      if (Array.isArray(x)) x.forEach(strabate)
      else if (x && typeof x === 'object') {
        for (const [cheie, valoare] of Object.entries(x)) {
          if (cheie === 'telephone') gasite.push(String(valoare))
          else strabate(valoare)
        }
      }
    }
    strabate(nod)
    return gasite
  }

  it('controlul intrarii: canalele domeniului au telefon si WhatsApp (altfel cazul ar fi vacuu)', () => {
    expect(canale.telefon).toMatch(/^\+\d{8,15}$/)
    expect(canale.whatsapp).toMatch(/^\d{8,15}$/)
  })

  it('ro-RO: zero `telephone` in nod, iar punctul de contact poarta legatura wa.me a numarului', () => {
    const nod = nodOrganizatie('https://exemplu-3s.test', 'contact@exemplu-3s.test', { editie: 'ro-RO', canale })
    expect(telefoane(nod)).toEqual([])
    expect(aparitii(JSON.stringify(nod))).toBe(0)
    const punct = nod.contactPoint as Record<string, unknown>
    expect(punct.url).toBe('https://wa.me/' + canale.whatsapp)
  })

  it('martor POZITIV: acelasi nod, cu numarul pus inapoi ca telephone (pe nod si pe punctul de contact), e prins', () => {
    const nod = nodOrganizatie('https://exemplu-3s.test', 'contact@exemplu-3s.test', { editie: 'ro-RO', canale })
    const stricat = { ...nod, telephone: canale.telefon, contactPoint: { ...(nod.contactPoint as object), telephone: canale.telefon } }
    expect(telefoane(stricat)).toEqual([canale.telefon, canale.telefon])
  })
})
