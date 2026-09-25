import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaComparatieDrive from '../src/app/comparatie-drive/page'
import PaginaComparatieStocare from '../src/app/comparatie-stocare/page'
import PaginaTermenePastrare from '../src/app/instrumente/termene-pastrare/page'
import PaginaTiparTermene from '../src/app/instrumente/termene-pastrare/tipar/page'
import { abateriMetadata } from '../src/components/seo/metadata'
import {
  abateriTabel,
  afirmatiileComparatiilor,
  CALE_COMPARATIE_DRIVE,
  CALE_COMPARATIE_STOCARE,
  COMPARATIE_DRIVE,
  COMPARATIE_STOCARE,
  DOMENII_OFICIALE,
  SURSE_OFICIALE,
  type TabelComparatie,
} from '../src/content/comparatii'
import registru from '../src/content/afirmatii/comparatii-termene.json'
import { RUTE } from '../src/content/rute'
import {
  CALE_TERMENE,
  CALE_TIPAR,
  DATA_CITIRII,
  DATA_CITIRII_TEXT,
  INSTRUMENT,
  META_TERMENE,
  META_TIPAR,
  TARI,
  TIPAR,
  TIPURI,
  numarConfirmate,
  type Tara,
} from '../src/content/termene/date'
import { abateriTermene, DOMENII_PRIMARE } from '../src/content/termene/validare'

/**
 * Probele feliei `comparatii-termene` care nu cer browser: datele celor doua comparatii si ale
 * verificatorului de termene, registrul de afirmatii, rutele, metadata si HTML-ul randat pe server.
 *
 * Ce apara, pe scurt:
 *   - publicitatea comparativa (Legea nr. 158/2008): fiecare marcaj al unui tert are nota si o
 *     sursa din documentatia OFICIALA a producatorului; fiecare marcaj 3S trimite la registru;
 *   - termenele: fiecare rand confirmat are termen, inceput, temei si o sursa PRIMARA pe https,
 *     fiecare rand neconfirmat spune de ce; Romania si Moldova au toate cele 7 tipuri;
 *   - HTML-ul servit contine panourile TUTUROR tarilor (cele nealese cu `hidden`) si data citirii.
 * Regulile sunt functii pure (`abateriTabel`, `abateriTermene`); martorii le hranesc cu defecte
 * fabricate aici si cer sa fie prinse, ca o proba verde sa nu poata insemna un detector orb.
 */

const RADACINA = join(__dirname, '..')
const LINIUTE = [String.fromCharCode(0x2013), String.fromCharCode(0x2014)]

type Intrare = { id: string; text: string; unde: string; stare: string; sursa?: string; confirmat_de?: string }
const INTRARI = registru as Intrare[]

describe('comparatiile: marcajele tertilor au sursa oficiala', () => {
  it('tabelul cu drive-ul si tabelul stocarii trec regulile, pe datele reale', () => {
    expect(abateriTabel(COMPARATIE_DRIVE.tabel)).toEqual([])
    expect(abateriTabel(COMPARATIE_STOCARE.tabel)).toEqual([])
  })

  it('forma masurata: 13 randuri cu o coloana de tert, 4 randuri cu doua', () => {
    expect(COMPARATIE_DRIVE.tabel.randuri).toHaveLength(13)
    expect(COMPARATIE_DRIVE.tabel.coloaneTerti).toHaveLength(1)
    expect(COMPARATIE_STOCARE.tabel.randuri).toHaveLength(4)
    expect(COMPARATIE_STOCARE.tabel.coloaneTerti).toHaveLength(2)
  })

  it('fiecare sursa folosita e in lista surselor oficiale, pe un domeniu al producatorului', () => {
    const folosite = [
      ...COMPARATIE_DRIVE.tabel.randuri.flatMap((r) => r.terti.flatMap((c) => c.surse)),
      ...COMPARATIE_STOCARE.tabel.randuri.flatMap((r) => r.terti.flatMap((c) => c.surse)),
      ...COMPARATIE_STOCARE.carduri.flatMap((c) => c.surse),
    ]
    const cunoscute = new Set(SURSE_OFICIALE.map((s) => s.url))
    for (const s of folosite) expect(cunoscute.has(s.url), s.url).toBe(true)
    for (const s of SURSE_OFICIALE) {
      expect(s.url.startsWith('https://'), s.url).toBe(true)
      expect(DOMENII_OFICIALE, s.url).toContain(new URL(s.url).hostname)
    }
  })

  it('cardurile tertilor au sursele rezervelor, cardul 3S nu are nevoie de ele', () => {
    for (const c of COMPARATIE_STOCARE.carduri) {
      if (c.noi) expect(c.surse).toEqual([])
      else expect(c.surse.length, c.titlu).toBeGreaterThan(0)
    }
  })

  it('semnatura calificata nu apare ca functie 3S (integrare in curs, decizia D4c)', () => {
    const functii = [...COMPARATIE_DRIVE.tabel.randuri, ...COMPARATIE_STOCARE.tabel.randuri].map((r) => r.functie.toLowerCase())
    expect(functii.filter((f) => f.includes('semnătur'))).toEqual([])
  })

  it('martor POZITIV: un marcaj fara sursa, unul pe http, unul pe alt domeniu si un rand scurt SUNT prinse', () => {
    const fabricat: TabelComparatie = {
      ...COMPARATIE_STOCARE.tabel,
      randuri: [
        {
          functie: 'Fara sursa',
          terti: [
            { marcaj: 'nu', nota: 'ceva', surse: [] },
            { marcaj: 'da', nota: 'ceva', surse: [{ eticheta: 'x', url: 'http://docs.aws.amazon.com/x' }] },
          ],
          noi: { marcaj: 'da', afirmatie: 'comparatii-criptare' },
        },
        {
          functie: 'Blog',
          terti: [
            { marcaj: 'partial', nota: 'ceva', surse: [{ eticheta: 'x', url: 'https://un-blog.example/articol' }] },
            { marcaj: 'da', nota: '', surse: [{ eticheta: 'x', url: 'https://support.google.com/x' }] },
          ],
          noi: { marcaj: 'da', afirmatie: '' },
        },
        {
          functie: 'Rand scurt',
          terti: [{ marcaj: 'da', nota: 'ceva', surse: [{ eticheta: 'x', url: 'https://support.google.com/x' }] }],
          noi: { marcaj: 'da', afirmatie: 'comparatii-criptare' },
        },
      ],
    }
    const a = abateriTabel(fabricat)
    console.log('[comparatii martor pozitiv] ' + a.join(' | '))
    expect(a.some((x) => x.includes('Fara sursa') && x.includes('fara sursa oficiala'))).toBe(true)
    expect(a.some((x) => x.includes('nu e pe https'))).toBe(true)
    expect(a.some((x) => x.includes('un-blog.example'))).toBe(true)
    expect(a.some((x) => x.includes('marcaj fara nota'))).toBe(true)
    expect(a.some((x) => x.includes('nu trimite la registru'))).toBe(true)
    expect(a.some((x) => x.includes('Rand scurt') && x.includes('1 celule de tert pentru 2 coloane'))).toBe(true)
  })

  it('martor NEGATIV: un tabel corect NU e prins', () => {
    const corect: TabelComparatie = {
      ...COMPARATIE_DRIVE.tabel,
      randuri: [COMPARATIE_DRIVE.tabel.randuri[0]],
    }
    expect(abateriTabel(corect)).toEqual([])
  })
})

describe('registrul de afirmatii al feliei', () => {
  const ids = new Set(INTRARI.map((i) => i.id))

  it('fiecare marcaj 3S din tabele trimite la o intrare existenta', () => {
    for (const id of afirmatiileComparatiilor()) expect(ids.has(id), id).toBe(true)
  })

  it('id-urile sunt unice si poarta prefixul feliei', () => {
    expect(ids.size).toBe(INTRARI.length)
    for (const i of INTRARI) expect(/^(comparatii|termene)-/.test(i.id), i.id).toBe(true)
  })

  it('campul `unde` numeste fisiere care exista', () => {
    for (const i of INTRARI) {
      for (const f of i.unde.split(',').map((x) => x.trim())) {
        expect(existsSync(join(RADACINA, f)), i.id + ' -> ' + f).toBe(true)
      }
    }
  })

  it('criptarea declarata ramane neconfirmata, ca pe pagina de start (confirmarea e a dezvoltatorului)', () => {
    expect(INTRARI.find((i) => i.id === 'comparatii-criptare')?.stare).toBe('neconfirmat')
  })

  it('fiecare termen legal are intrarea lui, confirmata, cu sursa', () => {
    const termene = INTRARI.filter((i) => i.id.startsWith('termene-') && i.id !== 'termene-data-citirii')
    expect(termene).toHaveLength(14)
    for (const t of termene) {
      expect(t.stare, t.id).toBe('confirmat')
      expect((t.sursa ?? '').length, t.id).toBeGreaterThan(20)
    }
  })
})

describe('verificatorul de termene: datele', () => {
  it('Romania si Republica Moldova trec regulile, pe datele reale', () => {
    expect(abateriTermene(TARI, TIPURI)).toEqual([])
  })

  it('doua tari, fiecare cu cele 7 tipuri; 5 termene confirmate in Romania, 6 in Moldova', () => {
    expect(TARI.map((t) => t.cod)).toEqual(['ro', 'md'])
    for (const t of TARI) expect(t.randuri).toHaveLength(7)
    expect(numarConfirmate(TARI[0])).toBe(5)
    expect(numarConfirmate(TARI[1])).toBe(6)
  })

  it('data citirii e scrisa pe pagina si corespunde datei ISO', () => {
    expect(DATA_CITIRII).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const [an, luna, zi] = DATA_CITIRII.split('-').map(Number)
    const luni = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
    expect(DATA_CITIRII_TEXT).toBe(zi + ' ' + luni[luna - 1] + ' ' + an)
    expect(INSTRUMENT.nota).toContain(DATA_CITIRII_TEXT)
    expect(TIPAR.nota).toContain(DATA_CITIRII_TEXT)
  })

  it('sursele sunt pe domeniile primare declarate, iar fiecare domeniu declarat e folosit sau e portalul oficial', () => {
    const folosite = new Set(TARI.flatMap((t) => t.randuri.flatMap((r) => r.surse.map((s) => new URL(s.url).hostname))))
    for (const d of folosite) expect(Object.keys(DOMENII_PRIMARE), d).toContain(d)
  })

  it('martor POZITIV: defectele fabricate SUNT prinse, fiecare cu numele lui', () => {
    const ro = TARI[0]
    const liniuta = LINIUTE[0]
    const stricata: Tara = {
      ...ro,
      randuri: [
        { ...ro.randuri[0], surse: [] },
        { ...ro.randuri[1], surse: [{ eticheta: 'blog', url: 'https://blog-consultanta.example/articol' }] },
        { ...ro.randuri[2], surse: [{ eticheta: 'fara https', url: 'http://static.anaf.ro/x.pdf' }] },
        { tip: 'personal', valoare: null, surse: [] },
        { ...ro.randuri[4], temei: 'temei cu liniuta ' + liniuta + ' lunga' },
        { ...ro.randuri[6] },
        { ...ro.randuri[5] },
      ],
    }
    const a = abateriTermene([stricata, stricata], TIPURI)
    console.log('[termene martor pozitiv] ' + a.join(' | '))
    expect(a.some((x) => x.includes('ro/facturi: rand confirmat fara sursa'))).toBe(true)
    expect(a.some((x) => x.includes('blog-consultanta.example'))).toBe(true)
    expect(a.some((x) => x.includes('nu e pe https'))).toBe(true)
    expect(a.some((x) => x.includes('ro/personal: rand neconfirmat fara motiv'))).toBe(true)
    expect(a.some((x) => x.includes('liniuta lunga sau medie'))).toBe(true)
    expect(a.some((x) => x.includes('tipurile sunt'))).toBe(true)
    expect(a.some((x) => x.includes('tara apare de doua ori'))).toBe(true)
  })

  it('martor NEGATIV: o tara corecta NU e prinsa', () => {
    expect(abateriTermene([TARI[1]], TIPURI)).toEqual([])
  })
})

describe('verificatorul de termene: exceptiile care tin un act mai mult decat cifra scurta', () => {
  // O cifra mai mica decat legea indeamna la distrugerea unui act necesar. Randurile de mai jos
  // au fost gasite incomplete la o masurare (runda 1 a feliei) si se apara aici, pe text.
  const rand = (cod: string, tip: string) => {
    const r = TARI.find((t) => t.cod === cod)?.randuri.find((x) => x.tip === tip)
    if (!r) throw new Error('lipseste randul ' + cod + '/' + tip)
    return r
  }

  it('Moldova, dosarele de personal: randul spune si exceptia pensionarilor (3 sau 15 ani), si cazurile permanente', () => {
    const r = rand('md', 'personal')
    expect(r.valoare).toBe('75 de ani minus vârsta')
    expect(r.temei).toContain('pensionarilor')
    expect(r.temei).toMatch(/3 ani dacă a lucrat cel mult 2 luni și 15 ani dacă a lucrat mai mult/)
    expect(r.temei).toMatch(/permanent în organizațiile care completează Fondul Arhivistic/)
  })

  it('Romania, statele si dosarele de personal: obligatia de eliberare tine cat firma are actele, iar eliminarea trece prin Arhive', () => {
    for (const tip of ['state', 'personal']) {
      const r = rand('ro', tip)
      const text = (r.temei ?? '') + (r.motiv ?? '')
      // Art. 29 alin. (1) din Legea nr. 16/1996 priveste documentele create ori DETINUTE.
      expect(text, tip).toMatch(/Cât timp firma (mai )?are/)
      expect(text, tip).not.toMatch(/oricând|după ce termenul a trecut/)
      expect(text, tip).toMatch(/comisia de selecționare/)
      expect(text, tip).toMatch(/păstrarea (lor |lui )?permanentă/)
      expect(r.surse.map((s) => new URL(s.url).hostname), tip).toContain('arhivelenationale.ro')
    }
  })

  it('Romania, facturile, justificativele si contractele: actele care atesta provenienta unui bun cu viata de peste 5 ani tin cat viata lui utila (pct. 40 din Norme)', () => {
    // Pct. 40 din Normele aprobate prin OMFP nr. 2.634/2015 (Monitorul Oficial nr. 910/2015, p. 8)
    // tine actele peste cei 5 ani ai art. 25: la o cladire cu viata utila de 50 de ani, 50 de ani,
    // nu 20 + 5 cat da regula TVA; la un utilaj de 15 ani, 15, nu 10. OMF nr. 1.447/2023 (art. I
    // pct. 4) abroga pct. 38 si 39, nu si pct. 40, deci randul le citeaza pe amandoua.
    for (const [tip, camp] of [
      ['facturi', 'temei'],
      ['declaratii', 'temei'],
      ['contracte', 'motiv'],
    ] as const) {
      const r = rand('ro', tip)
      const text = r[camp] ?? ''
      expect(text, tip).toMatch(/pct\. 40/)
      expect(text, tip).toMatch(/durata de viață utilă a bunului/)
      expect(text, tip).toMatch(/neatins de OMF nr\. 1\.447\/2023/)
      const adrese = r.surse.map((s) => s.url)
      expect(adrese.some((u) => u.endsWith('/OMFP2634_MO910.pdf')), tip).toBe(true)
      expect(adrese.some((u) => u.includes('/OMF1447_MO453_')), tip).toBe(true)
    }
    // Registrul de afirmatii poarta aceeasi exceptie, cu sursa ei.
    for (const id of ['termene-ro-facturi-5-ani', 'termene-ro-declaratii-5-ani', 'termene-ro-contracte-fara-termen']) {
      const sursa = INTRARI.find((i) => i.id === id)?.sursa ?? ''
      expect(sursa, id).toMatch(/pct\. 40/)
      expect(sursa, id).toMatch(/1\.447\/2023/)
    }
  })

  it('Romania, randurile cu acte care pot privi un bun de capital numesc art. 305 alin. (8) din Codul fiscal', () => {
    // Art. 305 alin. (8) tine situatia bunurilor de capital si "orice alte inregistrari, documente si
    // jurnale" privind ele pana la 5 ani dupa perioada de ajustare a TVA (5 sau 20 de ani). Randul
    // extraselor spune regula cu cuvintele legii, fara sa clasifice el un anume extras sau o plata.
    for (const [tip, camp] of [
      ['facturi', 'temei'],
      ['declaratii', 'temei'],
      ['contracte', 'motiv'],
      ['extrase', 'temei'],
    ] as const) {
      const r = rand('ro', tip)
      expect(r[camp] ?? '', tip).toMatch(/art\. 305 alin\. (\(2\) și )?\(8\)/)
      expect(r.surse.map((s) => s.url).some((u) => u.endsWith('/Cod_fiscal_norme_2023.htm')), tip).toBe(true)
      const sursaRegistru = INTRARI.find((i) => i.id.startsWith('termene-ro-' + tip))?.sursa ?? ''
      expect(sursaRegistru, tip).toMatch(/art\. 305 alin\. (\(2\) și )?\(8\)/)
    }
  })
})

describe('rutele, metadata si textul', () => {
  it('cele patru rute sunt in RUTE; subpagina de tiparit nu intra in harta', () => {
    const dupaCale = new Map(RUTE.map((r) => [r.cale, r]))
    for (const c of [CALE_COMPARATIE_DRIVE, CALE_COMPARATIE_STOCARE, CALE_TERMENE]) expect(dupaCale.get(c)?.inHarta, c).toBe(true)
    expect(dupaCale.get(CALE_TIPAR)?.inHarta).toBe(false)
  })

  it('titlurile si descrierile sunt in pragurile portii de SEO', () => {
    expect(abateriMetadata({ ...COMPARATIE_DRIVE.meta, cale: CALE_COMPARATIE_DRIVE })).toEqual([])
    expect(abateriMetadata({ ...COMPARATIE_STOCARE.meta, cale: CALE_COMPARATIE_STOCARE })).toEqual([])
    expect(abateriMetadata({ ...META_TERMENE, cale: CALE_TERMENE })).toEqual([])
    expect(abateriMetadata({ ...META_TIPAR, cale: CALE_TIPAR })).toEqual([])
  })

  it('niciun fisier de continut al feliei nu poarta liniuta lunga sau medie', () => {
    const fisiere = [
      'src/content/comparatii.ts',
      'src/content/termene/date.ts',
      'src/content/termene/romania.ts',
      'src/content/termene/moldova.ts',
      'src/content/termene/tipuri.ts',
      'src/content/afirmatii/comparatii-termene.json',
    ]
    for (const f of fisiere) {
      const text = readFileSync(join(RADACINA, f), 'utf8')
      for (const l of LINIUTE) expect(text.includes(l), f).toBe(false)
    }
  })
})

describe('HTML-ul randat pe server', () => {
  const termene = renderToStaticMarkup(createElement(PaginaTermenePastrare))
  const tipar = renderToStaticMarkup(createElement(PaginaTiparTermene))
  const drive = renderToStaticMarkup(createElement(PaginaComparatieDrive))
  const stocare = renderToStaticMarkup(createElement(PaginaComparatieStocare))

  it('verificatorul are panourile ambelor tari in HTML; Moldova e ascunsa pana la alegere', () => {
    expect(termene).toContain('id="panou-ro"')
    expect(termene).toMatch(/id="panou-md" hidden=""/)
    expect(termene).not.toMatch(/id="panou-ro" hidden=""/)
    expect((termene.match(/<details/g) ?? []).length).toBe(14)
    expect(termene).toContain('aria-pressed="true"')
    expect(termene).toContain(DATA_CITIRII_TEXT)
  })

  it('fiecare sursa primara e o legatura in fereastra noua, cu rel noopener', () => {
    const surse = TARI.flatMap((t) => t.randuri.flatMap((r) => r.surse))
    const legaturi = [...termene.matchAll(/<a [^>]*href="(https:[^"]+)"[^>]*>/g)]
    expect(legaturi.length).toBe(surse.length)
    for (const l of legaturi) {
      expect(l[0]).toContain('target="_blank"')
      expect(l[0]).toContain('rel="noopener nofollow"')
    }
  })

  it('subpagina de tiparit are rezumatul 2 x 7 si celulele neconfirmate spuse in cuvinte', () => {
    const rezumat = tipar.slice(tipar.indexOf('<table'), tipar.indexOf('</table>'))
    expect((rezumat.match(/<tr>/g) ?? []).length).toBe(3)
    const neconfirmate = TARI.flatMap((t) => t.randuri).filter((r) => r.valoare === null).length
    expect((rezumat.match(/class="doar-cititor">Neconfirmat</g) ?? []).length).toBe(neconfirmate)
    expect(tipar).toContain('<h1')
  })

  it('comparatiile au un singur h1 si coloana 3S in fiecare rand', () => {
    for (const [html, tabel] of [
      [drive, COMPARATIE_DRIVE.tabel],
      [stocare, COMPARATIE_STOCARE.tabel],
    ] as const) {
      expect((html.match(/<h1/g) ?? []).length).toBe(1)
      const corp = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'))
      expect((corp.match(/<tr>/g) ?? []).length).toBe(tabel.randuri.length)
    }
  })

  it('comutatorul porneste pe stocarea 3S, cu un singur buton in ordinea Tab', () => {
    // Etichetele vin din date: se rescriu la lungimea rolului, iar proba urmareste contractul
    // (primul buton ales si in ordinea Tab), nu un text anume.
    const [nor, s3] = COMPARATIE_STOCARE.comutator.optiuni
    expect(nor.cod).toBe('nor')
    expect(stocare).toContain('role="radio" aria-checked="true" tabindex="0"')
    expect(stocare).toContain('role="radio" aria-checked="false" tabindex="-1"')
    const butoane = [...stocare.matchAll(/role="radio" aria-checked="(true|false)" tabindex="(0|-1)"[^>]*>([^<]*)</g)].map((m) => [m[1], m[2], m[3]])
    expect(butoane).toEqual([
      ['true', '0', nor.buton],
      ['false', '-1', s3.buton],
    ])
  })
})
