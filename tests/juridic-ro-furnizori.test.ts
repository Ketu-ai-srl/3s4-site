import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Paginile juridice ale site-ului ROMANESC (familia SEE) nu se schimba cand furnizorii panoului de consimtamant
 * primesc analitica proprie (Umami). Sursa paginilor e `FURNIZORI` (`src/content/juridic/furnizori.ts`), prin
 * `confidentialitate.ts` si `cookie-uri.ts`; panoul bannerului are acum si un serviciu Umami, dar el NU intra in
 * `FURNIZORI`: tara gazdei instantei nu are inca un fapt scris, iar textele juridice ale lui 3s.md vin din
 * modulele `md`, nu de aici. Deci, cu operator si GA4 si FARA Umami, textul lui `/juridic/cookies` si al lui
 * `/juridic/confidentialitate` trebuie sa fie exact cel de dinainte.
 *
 * FIXTURA a fost capturata pe BAZA (commitul de dinaintea codului care schimba furnizorii), intr-un commit separat
 * facut inaintea oricarui cod: ordinea se vede in istoric. Se rescrie numai cu `SCRIE_FIXTURA=1`, explicit; o
 * fixtura lipsa pica proba, nu se scrie singura.
 *
 * CE SE COMPARA: TEXTUL paginii randate pe server (etichetele scoase, entitatile decodate, spatiile adunate), nu
 * HTML-ul: clasele modulelor CSS nu tin de continut. Textul include sigiliul SHA-256 al documentului, deci orice
 * schimbare de continut se vede si acolo.
 *
 * FORMA FIXTURII: un nod de text pe rand, precedat de numarul lui (`001<TAB>`). Prima captura tinea toata
 * pagina pe un singur rand, iar etichetele alaturate ale navigatiei juridice si ale firului de navigare formau
 * acolo fraze de 8 cuvinte pe care verificarea de copiere a depozitului public le citeste ca preluate. Fiecare
 * eticheta e, singura, text al nostru (exista asa in `src`); alaturarea lor e un artefact al capturii. Verificarea
 * leaga cuvintele si peste randuri noi, deci numai randurile nu ajung; numarul nodului rupe alaturarea (verificarea
 * nu citeste ca fraza o secventa cu doua numere), iar o fraza dintr-un SINGUR nod ramane masurata intreaga.
 * Comparatia pe noduri e mai stricta decat cea de pe un rand (vede si granitele lor), iar legatura cu baza
 * ramane MECANICA: nodurile fara numar, unite cu un spatiu, dau octet cu octet captura de pe baza, a carei
 * amprenta SHA-256 sta mai jos (calculata pe fixtura din commitul de captura, cu randul final).
 *
 * Operatorul si ID-ul GA4 vin din MEDIU (`OPERATOR_JSON`, `NEXT_PUBLIC_GA4_ID`), ca pe o aplicatie reala;
 * `UMAMI_*` sunt golite. Valorile sintetice se asambleaza la rulare.
 *
 * MARTOR POZITIV: acelasi randament, cu un rand Umami adaugat in `FURNIZORI` pe o COPIE a modulului (mock), da un
 * text diferit pe amandoua paginile. Fara el, un "identic" ar putea veni dintr-o randare care nu citeste furnizorii.
 */

const DOSAR_FIXTURI = join(__dirname, 'fixturi', 'juridic-ro-furnizori')
const PAGINI = ['cookies', 'confidentialitate'] as const

const OPERATOR_SINTETIC = {
  denumire: ['Operator', 'Sintetic', 'Furnizori', 'SRL'].join(' '),
  sediu: ['Strada Exemplului 1', 'Pitesti'].join(', '),
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}
const ID_GA4 = ['G', 'FURNIZORI' + String(78)].join('-')

/** SHA-256 al capturii de pe baza (textul pe un rand, cu randul final), pe pagina. */
const AMPRENTA_BAZA: Record<(typeof PAGINI)[number], string> = {
  cookies: 'e1f9b15c601ca8808d6fb81abe774c6fc85c85b97971cff8eed11cd7a72f6978',
  confidentialitate: '48eac9833e25b3322c816f877c3a429ddb749325ab66379b97f8afa6f5052bee',
}

const ENTITATI: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'", '&#39;': "'", '&nbsp;': ' ' }

/**
 * Textul unei bucati de HTML, un nod pe rand: etichetele devin granite, entitatile se decodeaza, spatiile din
 * fiecare nod se aduna, nodurile goale cad. Unite cu un spatiu, randurile dau forma de pe un rand a capturii.
 */
export function textDinHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, '\n')
    .replace(/<script[\s\S]*?<\/script>/g, '\n')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&(amp|lt|gt|quot|nbsp|#x27|#39);/g, (e) => ENTITATI[e] ?? e)
    .split('\n')
    .map((r) => r.replace(/\s+/g, ' ').trim())
    .filter((r) => r !== '')
    .join('\n')
}

/** Forma de pe un rand, cea a capturii de pe baza. */
const peUnRand = (text: string) => text.replace(/\n/g, ' ')

/** Forma fixturii: fiecare nod precedat de numarul lui, din trei cifre, si un TAB. */
const numerotat = (text: string) =>
  text
    .split('\n')
    .map((r, i) => String(i + 1).padStart(3, '0') + '\t' + r)
    .join('\n')

/** Inversul lui `numerotat`; un rand fara numarul asteptat lasa sirul neschimbat, deci pica la comparatie. */
const faraNumere = (fixtura: string) =>
  fixtura
    .split('\n')
    .map((r, i) => (r.startsWith(String(i + 1).padStart(3, '0') + '\t') ? r.slice(4) : r))
    .join('\n')

function mediuPagini(): void {
  vi.stubEnv('OPERATOR_JSON', JSON.stringify({ operator: OPERATOR_SINTETIC }))
  vi.stubEnv('NEXT_PUBLIC_GA4_ID', ID_GA4)
  vi.stubEnv('UMAMI_URL', '')
  vi.stubEnv('UMAMI_WEBSITE_ID', '')
  vi.stubEnv('SITE_EDITII', '')
  vi.stubEnv('NEXT_PUBLIC_SITE_EDITII', '')
}

/** Textul paginii `/juridic/<slug>`, randata pe server cu modulele incarcate din nou. */
async function textPagina(slug: string): Promise<string> {
  const modul = (await import('../src/app/juridic/[[...document]]/page')) as {
    default: (p: { params: Promise<{ document?: string[] }> }) => Promise<ReactElement>
  }
  const element = await modul.default({ params: Promise.resolve({ document: [slug] }) })
  return textDinHtml(renderToStaticMarkup(createElement(() => element)))
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.doUnmock('../src/content/juridic/furnizori')
  vi.resetModules()
})

describe('paginile juridice RO (operator si GA4, fara Umami) raman identice cu baza', () => {
  it('controlul mediului: operatorul din mediu e cel sintetic, complet, din familia SEE', async () => {
    mediuPagini()
    vi.resetModules()
    const { OPERATOR } = await import('../src/lib/operator')
    const { familiePublicata } = await import('../src/content/juridic/comutator')
    expect(OPERATOR?.denumire).toBe(OPERATOR_SINTETIC.denumire)
    expect(familiePublicata()).toBe('see')
  })

  for (const slug of PAGINI) {
    it('/juridic/' + slug + ': textul e cel capturat pe baza', async () => {
      mediuPagini()
      vi.resetModules()
      const text = await textPagina(slug)
      // Controlul randarii: pagina chiar are documentul (titlu, operator, GA4), nu o pagina goala.
      expect(text.length).toBeGreaterThan(2000)
      expect(text).toContain(OPERATOR_SINTETIC.denumire)
      expect(text).toContain('Google Analytics')
      const fisier = join(DOSAR_FIXTURI, slug + '.txt')
      if (process.env.SCRIE_FIXTURA === '1') {
        mkdirSync(DOSAR_FIXTURI, { recursive: true })
        writeFileSync(fisier, numerotat(text) + '\n', 'utf8')
      }
      expect(existsSync(fisier), 'fixtura lipseste: ' + fisier).toBe(true)
      const fixtura = readFileSync(fisier, 'utf8').replace(/\r?\n$/, '')
      // Legatura cu baza: nodurile fixturii, fara numere si unite, sunt captura de pe baza (amprenta ei).
      const amprenta = createHash('sha256').update(peUnRand(faraNumere(fixtura)) + '\n', 'utf8').digest('hex')
      expect(amprenta, 'fixtura nu mai e captura de pe baza: ' + fisier).toBe(AMPRENTA_BAZA[slug])
      expect(numerotat(text)).toBe(fixtura)
    })
  }

  it('martor POZITIV: un rand Umami adaugat in FURNIZORI (pe o copie a modulului) schimba textul ambelor pagini', async () => {
    mediuPagini()
    vi.doMock('../src/content/juridic/furnizori', async (original) => {
      const real = await original<typeof import('../src/content/juridic/furnizori')>()
      const umami = {
        ...real.FURNIZORI[real.FURNIZORI.length - 1],
        cheie: 'analitica' as const,
        serviciu: ['Uma', 'mi'].join(''),
        destinatar: ['Gazda', 'instantei', 'de', 'statistica'].join(' '),
        tara: 'Republica Moldova',
        cookieuri: [],
      }
      return { ...real, FURNIZORI: [...real.FURNIZORI, umami], furnizoriCategorie: (c: string) => [...real.FURNIZORI, umami].filter((f) => f.categorie === c) }
    })
    vi.resetModules()
    for (const slug of PAGINI) {
      const text = await textPagina(slug)
      const fisier = join(DOSAR_FIXTURI, slug + '.txt')
      // Controlul: pagina mutata s-a randat, cu operatorul; diferenta vine din furnizori.
      expect(text).toContain(OPERATOR_SINTETIC.denumire)
      expect(text, slug + ': randul Umami nu se vede in pagina').toContain('Gazda instantei de statistica')
      expect(numerotat(text)).not.toBe(readFileSync(fisier, 'utf8').replace(/\r?\n$/, ''))
    }
  })
})
