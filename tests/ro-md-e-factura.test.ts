import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  BlocPreturiEfactura,
  IntrebariArhivaEfactura,
  LoculDatelorEfactura,
  PasiEfactura,
  PreturiEfactura,
  PrimestiEfactura,
} from '../src/components/efacturare/SectiuniArhivaEfactura'
import { LIMITE_SEO } from '../src/components/seo/metadata'
import { ECHIVALENTE } from '../src/content/echivalente'
import { problemePagina } from '../src/content/model/tipuri'
import { TEXTE_WHATSAPP_RO_MD, navigatieRoMd } from '../src/content/navigatie-ro-md'
import { pagina } from '../src/content/ro-md/e-factura'
import * as comp from '../src/content/ro-md/e-factura-componente'
import { RUTE_RO_MD } from '../src/content/rute-ro-md'

/**
 * Pagina Arhiva e-Factura (felia ro-md-e-factura): `/ro/e-factura` pe 3s.md si geamana `/e-factura` pe 3s.com.ro.
 *
 * Proba masoara pe SURSA si pe HTML-ul randat al sectiunilor: ruta sub marcajul feliei, cele doua fisiere de pagina,
 * meniul Produs si textul precompletat, fidelitatea fata de textul paginii v1 (25.10.2026) pe frazele care poarta
 * afirmatii, varianta redusa a randului 2 din §5 si legatura cu registrul de afirmatii. Pagina servita o masoara
 * proba de browser a lotului, pe copia 3s.md.
 *
 * Fixturile vanate (liniutele lungi, adresarea formala) se asambleaza la rulare, din coduri de caractere.
 */

const RADACINA = join(__dirname, '..')
const citeste = (...cale: string[]) => readFileSync(join(RADACINA, ...cale), 'utf8')
const C = comp.EFACTURA_RO_MD
const CALE = '/ro/e-factura'

/** Toate sirurile dintr-o valoare (frunzele de tip sir, recursiv). */
function siruri(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') acc.push(valoare)
  else if (Array.isArray(valoare)) for (const v of valoare) siruri(v, acc)
  else if (valoare && typeof valoare === 'object') for (const v of Object.values(valoare)) siruri(v, acc)
  return acc
}

/** Textul vizibil al unui HTML randat: fara etichete, cu entitatile de baza decodate. */
function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
}

describe('ruta, paginile si navigatia', () => {
  it('ruta sta sub marcajul feliei, inaintea marcajului ro-md-acasa-contact, cu cheia din echivalente', () => {
    const sursa = citeste('src', 'content', 'rute-ro-md.ts')
    const start = sursa.indexOf('<<felie:' + 'ro-md-e-factura>>')
    const urmator = sursa.indexOf('<<felie:', start + 1)
    expect(start).toBeGreaterThan(0)
    expect(urmator).toBe(sursa.indexOf('<<felie:' + 'ro-md-acasa-contact>>'))
    const bloc = sursa.slice(start, urmator)
    expect([...bloc.matchAll(/cale:\s*"([^"]+)"/g)].map((m) => m[1])).toEqual([CALE])
    const ruta = RUTE_RO_MD.find((r) => r.cale === CALE)
    expect(ruta?.cheie).toBe('e-factura')
    expect(ruta?.inHarta).toBe(true)
    expect(ECHIVALENTE['e-factura']).toEqual({ 'ro-MD': CALE })
    expect(pagina.cheie).toBe('e-factura')
    expect(pagina.meta.cale).toBe(CALE)
  })

  it('pagina /ro si geamana ei pe 3s.com.ro, care numai reexporta', () => {
    expect(existsSync(join(RADACINA, 'src', 'app', '(romd)', 'ro', 'e-factura', 'page.romd.tsx'))).toBe(true)
    const geamana = citeste('src', 'app', '(comro)', 'e-factura', 'page.comro.tsx')
    expect(geamana).toContain('export { default, metadata } from "@/app/(romd)/ro/e-factura/page.romd";')
  })

  it('meniul Produs si subsolul au pagina, iar textul precompletat al antetului e cel al paginii', () => {
    const nav = navigatieRoMd(undefined, null, new Set(RUTE_RO_MD.map((r) => r.cale)))
    const produs = nav.antet.legaturi.find((l) => l.text === 'Produs')
    expect(produs?.foaie?.elemente.map((e) => [e.text, e.href])).toContainEqual(['Arhiva e-Factura', CALE])
    const coloana = nav.subsol.coloane.find((c) => c.titlu === 'Produs')
    expect(coloana?.legaturi.map((l) => l.href)).toContain(CALE)
    const intrare = TEXTE_WHATSAPP_RO_MD.filter((t) => t.cale === CALE)
    expect(intrare).toHaveLength(1)
    expect(intrare[0].ref).toBe(comp.REF_EFACTURA_RO_MD)
    expect(intrare[0].text).toBe(pagina.cta.textWhatsapp)
  })
})

describe('textul paginii v1 (25.10.2026)', () => {
  it('modulul paginii respecta modelul comun (meta in praguri, capsula 40-60 de cuvinte, ref o singura data)', () => {
    expect(problemePagina(pagina, 'e-factura')).toEqual([])
    expect(pagina.meta.titlu.length).toBeLessThanOrEqual(LIMITE_SEO.titluMax)
    expect(pagina.meta.descriere.length).toBeLessThanOrEqual(LIMITE_SEO.descriereMax)
    // Martorul: titlul din textul v1, intreg, ar fi trecut de prag (motivul abaterii scrise in modul).
    expect('Arhiva e-Factura: facturile din SPV, păstrate automat ani la rând | 3S'.length).toBeGreaterThan(LIMITE_SEO.titluMax)
  })

  it('eroul, butonul si textul precompletat, cuvant cu cuvant', () => {
    expect(C.erou.eticheta).toBe('Acces timpuriu')
    expect(C.erou.titlu).toBe('Facturile din SPV, păstrate automat cât cere legea')
    expect(C.erou.buton).toBe('Scrie-ne pe WhatsApp - te înscriem la acces timpuriu')
    expect(C.erou.subtitlu.startsWith('Din SPV poți descărca o e-factură doar 60 de zile de la publicare.')).toBe(true)
    expect(pagina.cta.textWhatsapp).toBe(
      'Bună ziua, 3S. Vreau acces timpuriu la arhiva e-Factura [ref:ro-md-e-factura]. Firma: ... Facturi pe lună: ... Sunt contabil: da / nu.',
    )
    expect(comp.CTA_FINAL_EFACTURA_RO_MD.titlu).toBe('Intră printre primii')
  })

  it('§2 si §3 randate: fiecare pas si fiecare element e fraza intreaga a textului', () => {
    const pasi = text(renderToStaticMarkup(createElement(PasiEfactura, { continut: C })))
    expect(pasi).toContain('Autorizezi 3S pe site-ul ANAF.')
    expect(pasi).toContain('Autorizarea ANAF se reînnoiește periodic; 3S îți spune din timp când e cazul.')
    const primesti = text(renderToStaticMarkup(createElement(PrimestiEfactura, { continut: C })))
    for (const fraza of [
      'XML-ul original și sigiliul electronic al Ministerului Finanțelor, exact cum le-a livrat ANAF. Acesta e documentul; PDF-ul e doar copia pentru citit.',
      'Facturile emise, cele primite și erorile ANAF, din fiecare zi.',
      'Căutare în cuvintele tale: scrii „facturile de energie din martie” și primești lista, fiecare cu documentul-sursă.',
      'Export CSV și pachetul lunar ZIP pentru contabil.',
      'Facturile lângă restul documentelor firmei: contracte, procese-verbale, actele scanate de pe hârtie, toate în aceeași arhivă.',
    ]) {
      expect(primesti, fraza).toContain(fraza)
    }
  })

  it('§5: randul 2 e varianta redusa, fara "numai pentru descarcare" si fara jurnal; gazduirea in forma deciziei 42', () => {
    const loc = text(renderToStaticMarkup(createElement(LoculDatelorEfactura, { continut: C })))
    expect(loc).toContain('Cheia de acces primită de la ANAF se păstrează criptat.')
    expect(loc).not.toMatch(/numai pentru descărcarea/)
    expect(loc).not.toMatch(/jurnal/)
    expect(loc).toContain('Arhiva e găzduită în Uniunea Europeană, cu regiunea principală la Frankfurt.')
    expect(C.siguranta.elemente).toHaveLength(4)
  })

  it('§6: tabelul cu cele sase pachete si sumele textului, in euro, si nota de sub el', () => {
    expect(C.preturi.randuri.map((r) => [r.pachet, r.pret])).toEqual([
      ['Gratuit', '0 EUR'],
      ['Firmă', '8,49 EUR / an'],
      ['Firmă plus', '17,76 EUR / an'],
      ['Firmă max', '34,75 EUR / an'],
      ['Cabinet', '61,69 EUR / an'],
      ['Cabinet max', '181,33 EUR / an'],
    ])
    const html = renderToStaticMarkup(createElement(PreturiEfactura, { continut: C }))
    expect((html.match(/<tr>/g) ?? []).length).toBe(7)
    expect(text(html)).toContain('Clienții înscriși la acces timpuriu păstrează prețul de lansare 24 de luni.')
    expect(text(html)).not.toMatch(/RON|lei/)
  })

  it('§7: cele cinci intrebari, vizibile in HTML si identice in FAQPage', () => {
    const html = renderToStaticMarkup(createElement(IntrebariArhivaEfactura, { continut: C, cale: CALE, limba: 'ro' }))
    expect(C.intrebari.intrebari).toHaveLength(5)
    const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
    const intrebari = json['@graph'][0].mainEntity.map((q: { name: string }) => q.name)
    expect(intrebari).toEqual(C.intrebari.intrebari.map((i) => i.intrebare))
    for (const i of C.intrebari.intrebari) expect(text(html)).toContain(i.raspuns)
  })

  it('tipografie si adresare: nicio liniuta lunga, niciun caracter de chenar, nicio forma de politete', () => {
    const tot = siruri(comp).join('\n') + '\n' + siruri(pagina).join('\n')
    const vanate = [0x2013, 0x2014, 0x2500, 0x00d7].map((c) => String.fromCharCode(c))
    for (const v of vanate) expect(tot.includes(v), 'U+' + v.charCodeAt(0).toString(16)).toBe(false)
    const formal = new RegExp('dumneavoastr' + '|\\bdvs\\.', 'i')
    expect(formal.test(tot)).toBe(false)
    // Martorii: o liniuta lunga si forma de politete, lipite de un text al paginii, sunt prinse.
    expect((C.erou.titlu + vanate[1]).includes(vanate[1])).toBe(true)
    expect(formal.test(C.erou.titlu + ' dumneavoastr' + 'ă')).toBe(true)
  })
})

describe('blocul Arhiva e-Factura de pe pagina de preturi /ro (cererea owner-ului din 25.10.2026)', () => {
  it('pagina /ro/preturi monteaza blocul dupa grila pachetelor; /pricing (EN) nu il are', () => {
    const sursa = citeste('src', 'app', '(romd)', 'ro', 'preturi', 'page.romd.tsx')
    const grila = sursa.indexOf('<PacheteRoMd ')
    const bloc = sursa.indexOf('<BlocPreturiEfactura continut={BLOC_PRETURI_EFACTURA_RO_MD} />')
    expect(grila).toBeGreaterThan(0)
    expect(bloc).toBeGreaterThan(grila)
    expect(bloc).toBeLessThan(sursa.indexOf('<PliuriRoMd '))
    expect(citeste('src', 'app', '(en)', 'pricing', 'page.en.tsx')).not.toMatch(/BlocPreturiEfactura|e-factura-componente/)
  })

  it('aceleasi sase pachete si sume ca pagina serviciului, nota pe firma, eticheta si legatura spre /ro/e-factura', () => {
    const html = renderToStaticMarkup(createElement(BlocPreturiEfactura, { continut: comp.BLOC_PRETURI_EFACTURA_RO_MD }))
    const t = text(html).replace(/\u00a0/g, ' ')
    expect(comp.BLOC_PRETURI_EFACTURA_RO_MD.randuri).toBe(C.preturi.randuri)
    for (const suma of ['0 EUR', '8,49 EUR / an', '17,76 EUR / an', '34,75 EUR / an', '61,69 EUR / an', '181,33 EUR / an']) expect(t, suma).toContain(suma)
    expect((html.match(/<tr>/g) ?? []).length).toBe(7)
    expect(t).toContain('Prețul pachetului se aplică fiecărei firme (CUI); pachetele Cabinet acoperă oricâte firme.')
    expect(t).toContain('Acces timpuriu')
    expect(t).toContain('Arhiva e-Factura')
    // Tinta legaturii e /ro/e-factura: pe build-ul romanesc al probelor ruta nu exista (editia ro-MD nu e in build), deci
    // `Tinta` o randeaza inerta, cu tinta in `data-tinta-lipsa`; pe build-urile 3s.md si 3s.com.ro e `href`.
    expect(html.includes('href="' + CALE + '"') || html.includes('data-tinta-lipsa="' + CALE + '"')).toBe(true)
    expect(html).toContain('data-preturi-efactura')
    // Suma si moneda nu se despart la randare (spatiu nedespartitor intre ele).
    expect(text(html)).toContain('8,49\u00a0EUR / an')
    expect(t).not.toMatch(/RON|lei/)
  })

  it('lista de congruenta: /ro/preturi are lista ei (P08-RO) cu campul blocului; /pricing ramane in P08 fara el', () => {
    const p08 = JSON.parse(citeste('config', 'congruenta', 'p08.json'))
    const p08ro = JSON.parse(citeste('config', 'congruenta', 'p08-ro.json'))
    expect(p08.pagini_3s_md).toEqual(['/pricing'])
    expect(p08ro.pagini_3s_md).toEqual(['/ro/preturi'])
    const camp = p08ro.randuri.find((r: { selector?: string }) => r.selector === '[data-preturi-efactura]')
    expect(camp).toMatchObject({ tip: 'camp', ro: 0, en: 1, cod: 'efactura-ro' })
    // Restul randurilor sunt exact cele din P08 (desprinderea nu a pierdut si nu a adaugat nimic altceva).
    expect(p08ro.randuri.filter((r: unknown) => r !== camp)).toEqual(p08.randuri)
    expect(p08.randuri.some((r: { selector?: string }) => r.selector === '[data-preturi-efactura]')).toBe(false)
  })
})

describe('registrul de afirmatii al feliei', () => {
  const registru = JSON.parse(citeste('src', 'content', 'afirmatii', 'ro-md-e-factura.json')) as {
    id: string
    unde: string
    stare: string
    sursa: string
    confirmat_de: string
  }[]

  it('fiecare afirmatie numita de pagina are intrare, si fiecare intrare e numita de pagina', () => {
    expect(registru.map((a) => a.id).sort()).toEqual([...pagina.afirmatii].sort())
  })

  it('fiecare intrare are sursa, iar `unde` numeste fisiere care exista', () => {
    for (const a of registru) {
      expect(a.sursa.length, a.id).toBeGreaterThan(20)
      for (const f of a.unde.split(',').map((x) => x.trim())) expect(existsSync(join(RADACINA, f)), a.id + ': ' + f).toBe(true)
      if (a.stare === 'confirmat') expect(a.confirmat_de, a.id).not.toBe('')
    }
    // Preturile si promisiunea de 24 de luni raman neconfirmate pana le confirma owner-ul.
    expect(registru.find((a) => a.id === 'ro-md-ef-preturi')?.stare).toBe('neconfirmat')
    expect(registru.find((a) => a.id === 'ro-md-ef-pret-lansare-24-luni')?.stare).toBe('neconfirmat')
  })
})
