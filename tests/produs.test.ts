import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { GET } from '../src/app/api/sanatate/route'
import PaginaIntegrari from '../src/components/produs/PaginaIntegrari'
import PaginaPlatforma from '../src/components/produs/PaginaPlatforma'
import PaginaSecuritate from '../src/components/produs/PaginaSecuritate'
import { mediana } from '../src/components/produs/mediana'
import { bucatiNerupte, nerupt } from '../src/components/produs/nerupt'
import {
  CANALE_SEIF,
  UNGHI_ROATA,
  easeOutCubic,
  pasNetezire,
  progres,
  progresSectiune,
  stareSeif,
} from '../src/components/produs/seif-canale'
import { abateriMetadata } from '../src/components/seo/metadata'
import * as integrari from '../src/content/produs/integrari'
import { grafIntrebariPagina } from '../src/content/produs/intrebari'
import * as platforma from '../src/content/produs/platforma'
import * as securitate from '../src/content/produs/securitate'
import { RUTE } from '../src/content/rute'

/**
 * Probele feliei `produs` (valul S4-3: `/platforma`, `/integrari`, `/securitate`) care nu cer
 * navigator: continutul, HTML-ul randat pe server, canalele seifului, mediana verificarii din
 * browser, punctul `/api/sanatate` si registrul de afirmatii al feliei.
 *
 * ASTEPTARILE VIN DIN AFARA CODULUI: valorile seifului (roata la 0,30 si 0,40, usa la 0,55 / 0,60 /
 * 0,70, eticheta intre 0,50 si 0,51) sunt cifrele masurate in fisa `securitate.md` §13, nu ale
 * functiilor de aici; specificatiile de securitate sunt cele din decizia D4c (Amazon, Germania, o
 * regiune; AES-256 si TLS 1.2+).
 *
 * Fiecare detector scris aici are martorii lui: un caz care TREBUIE prins si unul care nu.
 * Fixturile cu ce vanam se lipesc la rulare, ca fisierul probei sa nu fie el insusi o instanta.
 */

const RADACINA = join(__dirname, '..')
const citeste = (rel: string) => readFileSync(join(RADACINA, rel), 'utf8')

const html = {
  platforma: renderToStaticMarkup(createElement(PaginaPlatforma)),
  integrari: renderToStaticMarkup(createElement(PaginaIntegrari)),
  securitate: renderToStaticMarkup(createElement(PaginaSecuritate)),
}

/** HTML -> text, cu entitatile de baza intoarse. */
function text(h: string): string {
  return h
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Toate sirurile dintr-o valoare (obiecte, liste), pentru verificarile de text. */
function siruri(v: unknown, iesire: string[] = []): string[] {
  if (typeof v === 'string') iesire.push(v)
  else if (Array.isArray(v)) for (const x of v) siruri(x, iesire)
  else if (v && typeof v === 'object') for (const x of Object.values(v)) siruri(x, iesire)
  return iesire
}

const TEXTE = [...siruri(platforma), ...siruri(integrari), ...siruri(securitate)]

// --- detectori, cu martori -------------------------------------------------------------------------

const LINIUTE_LUNGI = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']')
const PRONUME_INFORMALE = /(^|[^\p{L}])(tu|ta|tău|tăi|tale|ție|ţie)(?=$|[^\p{L}])/iu
const NUME_INTERZISE = new RegExp('\\b(' + ['mac' + 'OS', 'i' + 'OS', 'App ' + 'Store'].join('|') + ')\\b')
const ORASE = /\b(Frankfurt|Berlin|München|Munchen|Hamburg|Dublin|Paris|Amsterdam|Stockholm|Milano)\b/
const CERTIFICARI = /\b(SOC ?[123]|ISO ?\d{4,5}|PCI DSS|99[.,]9)/
const IDENTIFICATORI = [
  /\b[A-Z]{2}\d{2}[A-Z]{4}[0-9A-Z]{12,}\b/, // IBAN
  /\bRO ?\d{6,10}\b/, // cod fiscal cu atribut
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // adresa de e-mail
  /(\+40|\b07\d{2})[ .]?\d{3}[ .]?\d{3}\b/, // telefon
]
// Ce declara referinta peste decizia D4c si 3S nu a confirmat (runda de reparatii 1): toata
// platforma pe Amazon, criptarea inainte de trimitere, criptarea pornita fara nicio setare, izolarea
// pe client, autorizarea la fiecare cerere, drepturile implicite ale unui cont nou.
const PESTE_D4C = [
  /nu doar stocarea/i,
  /deja criptat/i,
  /nimic de activat/i,
  /nicio setare/i,
  /f[aă]r[aă] s[aă] bifeze/i,
  /arhiva altei firme/i,
  /verific[aă] dac[aă] persoana/i,
  /arat[aă] un cont nou/i,
  /drepturile implicite/i,
]
const pesteD4c = (t: string) => PESTE_D4C.some((r) => r.test(t))
// Storecove e furnizor de acces la reteaua Peppol, nu o retea (storecove.com, peppol.org/about).
const STORECOVE_RETEA = /re[țt]elele[^.;]*Storecove|re[țt]eaua\s+Storecove|Storecove\s+(?:e|este)\s+o\s+re[țt]ea/i
// Decizia D10 (doar 3S): numele firmei-mama nu apare pe paginile feliei, nici in registrul ei.
// Tiparul se lipeste la rulare, ca fisierul probei sa nu contina el insusi numele.
const NUME_FIRMA_MAMA = new RegExp('\\b' + 'AD' + 'RIA' + '\\b', 'i')

describe('detectorii probei, pe martori', () => {
  it('prind ce trebuie si lasa ce nu trebuie', () => {
    expect(LINIUTE_LUNGI.test('a ' + String.fromCharCode(0x2014) + ' b')).toBe(true)
    expect(LINIUTE_LUNGI.test('proces-verbal')).toBe(false)
    expect(PRONUME_INFORMALE.test('Ce face pentru ' + 't' + 'u?')).toBe(true)
    expect(PRONUME_INFORMALE.test('aplicația ' + 't' + 'a')).toBe(true)
    expect(PRONUME_INFORMALE.test('dumneavoastră, tabel, taxa, totale')).toBe(false)
    expect(NUME_INTERZISE.test('aplicația pentru ' + 'i' + 'OS')).toBe(true)
    expect(NUME_INTERZISE.test('Windows, Linux, Android')).toBe(false)
    expect(ORASE.test('regiunea ' + 'Frank' + 'furt')).toBe(true)
    expect(ORASE.test('Germania')).toBe(false)
    expect(CERTIFICARI.test('certificat ' + 'ISO ' + '27001')).toBe(true)
    expect(CERTIFICARI.test('AES-256 și TLS 1.2')).toBe(false)
    const iban = 'RO' + '49' + 'AAAA' + '1B31007593840000'
    expect(IDENTIFICATORI.some((r) => r.test('cont ' + iban))).toBe(true)
    expect(IDENTIFICATORI.some((r) => r.test('scris ' + 'office' + '@' + 'exemplu.ro'))).toBe(true)
    expect(IDENTIFICATORI.some((r) => r.test('"act": "act_exemplu_42"'))).toBe(false)
    expect(pesteD4c('Actul ajunge pe servere ' + 'deja ' + 'criptat')).toBe(true)
    expect(pesteD4c('Nu aveți ' + 'nimic de ' + 'activat')).toBe(true)
    expect(pesteD4c('căutarea nu trece în ' + 'arhiva altei ' + 'firme')).toBe(true)
    expect(pesteD4c('Fișierele stocate pe serverele din Germania sunt criptate AES-256.')).toBe(false)
    expect(STORECOVE_RETEA.test('Rețelele ' + 'Peppol și ' + 'Storecove aduc facturile')).toBe(true)
    expect(STORECOVE_RETEA.test('Facturile vin din rețeaua Peppol, direct sau prin Storecove.')).toBe(false)
    expect(NUME_FIRMA_MAMA.test('stau în depozitul ' + 'Ad' + 'ria')).toBe(true)
    expect(NUME_FIRMA_MAMA.test('stau în depozitul 3S, pe rafturi')).toBe(false)
  })
})

describe('metadata, rute si declaratiile de raspuns', () => {
  it('titlurile si descrierile intra in pragurile portii de SEO', () => {
    expect(abateriMetadata({ ...platforma.META_PLATFORMA, cale: platforma.CALE_PLATFORMA })).toEqual([])
    expect(abateriMetadata({ ...integrari.META_INTEGRARI, cale: integrari.CALE_INTEGRARI })).toEqual([])
    expect(abateriMetadata({ ...securitate.META_SECURITATE, cale: securitate.CALE_SECURITATE })).toEqual([])
  })

  it('cele trei rute sunt in RUTE, in ordinea din subsol, si au pagina pe disc', () => {
    const cai = RUTE.map((r) => r.cale)
    const ale = ['/platforma', '/securitate', '/integrari']
    expect(cai.filter((c) => ale.includes(c))).toEqual(ale)
    for (const c of ale) expect(existsSync(join(RADACINA, 'src', 'app', c.slice(1), 'page.tsx')), c).toBe(true)
  })

  it('declaratia G-AI-02 are cele trei rute, iar entitatile stau in eroul fiecareia', () => {
    const d = JSON.parse(citeste('config/seo/produs.json')).raspuns_autonom as Record<string, { entitati: string[] }>
    expect(Object.keys(d).filter((k) => !k.startsWith('_')).sort()).toEqual(['/integrari', '/platforma', '/securitate'])
    const erou: Record<string, string> = {
      '/platforma': platforma.EROU_PLATFORMA.titlu + ' ' + platforma.EROU_PLATFORMA.subtitlu,
      '/integrari': integrari.EROU_INTEGRARI.titlu + ' ' + integrari.EROU_INTEGRARI.subtitlu,
      '/securitate':
        securitate.EROU_SECURITATE.titlu + ' ' + securitate.EROU_SECURITATE.subtitlu + ' ' + securitate.PILONI_SECURITATE[0].text,
    }
    for (const [cale, { entitati }] of Object.entries(d)) {
      for (const e of entitati) expect(erou[cale], cale + ': ' + e).toContain(e)
    }
  })

  it('subtitlul eroului e primul paragraf: 30-80 de cuvinte, fara deschidere interzisa', () => {
    for (const s of [platforma.EROU_PLATFORMA.subtitlu, integrari.EROU_INTEGRARI.subtitlu, securitate.EROU_SECURITATE.subtitlu]) {
      const n = s.split(/\s+/).filter((c) => /[\p{L}\p{N}]/u.test(c)).length
      expect(n, s.slice(0, 40)).toBeGreaterThanOrEqual(30)
      expect(n, s.slice(0, 40)).toBeLessThanOrEqual(80)
      expect(s).not.toMatch(/^(acesta|aceasta|acestea|acestia|el|ea|ei|ele)\b/i)
    }
    for (const [nume, h] of Object.entries(html)) {
      // `<p` urmat de spatiu sau `>`: altfel tiparul prinde si `<path` din iconitele SVG.
      const primul = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/.exec(h)
      expect(primul, nume).not.toBeNull()
      const asteptat =
        nume === 'platforma'
          ? platforma.EROU_PLATFORMA.subtitlu
          : nume === 'integrari'
            ? integrari.EROU_INTEGRARI.subtitlu
            : securitate.EROU_SECURITATE.subtitlu
      expect(text(primul![1]), nume).toBe(asteptat)
    }
  })
})

describe('textul paginilor', () => {
  it('fara liniute lungi, fara pronume informale, fara numele interzise', () => {
    expect(TEXTE.length).toBeGreaterThan(200)
    expect(TEXTE.filter((t) => LINIUTE_LUNGI.test(t))).toEqual([])
    expect(TEXTE.filter((t) => PRONUME_INFORMALE.test(t))).toEqual([])
    for (const [nume, h] of Object.entries(html)) {
      expect(LINIUTE_LUNGI.test(h), nume).toBe(false)
      expect(NUME_INTERZISE.test(text(h)), nume).toBe(false)
    }
  })

  it('specificatiile de securitate sunt numai cele din D4c: fara certificari, fara cifre de durabilitate', () => {
    for (const [nume, h] of Object.entries(html)) expect(CERTIFICARI.test(text(h)), nume).toBe(false)
    const valori = securitate.BLOC_INFRASTRUCTURA.specificatii.map((r) => (r.mono ?? '') + r.valoare).join(' | ')
    expect(securitate.BLOC_INFRASTRUCTURA.specificatii).toHaveLength(4)
    for (const fapt of ['Amazon', 'Germania, o singură regiune', 'AES-256', 'TLS 1.2']) expect(valori).toContain(fapt)
  })

  it('nimic peste D4c: nici in continut, nici in HTML-ul randat al celor trei pagini', () => {
    expect(TEXTE.filter(pesteD4c)).toEqual([])
    for (const [nume, h] of Object.entries(html)) expect(pesteD4c(text(h)), nume).toBe(false)
  })

  it('D10: numele firmei-mama lipseste din continut, din HTML-ul randat si din registrul feliei', () => {
    expect(TEXTE.filter((t) => NUME_FIRMA_MAMA.test(t))).toEqual([])
    for (const [nume, h] of Object.entries(html)) expect(NUME_FIRMA_MAMA.test(text(h)), nume).toBe(false)
    expect(NUME_FIRMA_MAMA.test(citeste('src/content/afirmatii/produs.json'))).toBe(false)
  })

  it('D11: blocurile de cod si seiful poarta eticheta vizibila "exemplu", de 11-12 px', () => {
    // Eticheta machetei din erou are alt text ("Exemplu, date fictive"), deci aici se numara doar
    // etichetele blocurilor de cod, fiecare dupa `</pre>`-ul blocului ei.
    const eticheteCod = [...html.platforma.matchAll(/<\/pre><span class="([^"]*)" aria-hidden="true">exemplu<\/span>/g)]
    expect(eticheteCod).toHaveLength(platforma.APELURI_PLATFORMA.blocuri.length)
    for (const e of eticheteCod) expect(e[1]).not.toContain('doar-cititor')
    expect(html.securitate).toMatch(/<span class="[^"]*eticheta[^"]*" aria-hidden="true">exemplu<\/span>/)
    const marime = /\.codEticheta \{[^}]*font-size: (\d+(?:\.\d+)?)px/.exec(citeste('src/components/produs/platforma.module.css'))
    const marimeSeif = /\.eticheta \{[^}]*font-size: (\d+(?:\.\d+)?)px/.exec(citeste('src/components/produs/Seif.module.css'))
    const marimeMacheta = /\.eticheta \{[^}]*font-size: (\d+(?:\.\d+)?)px/.exec(citeste('src/components/produs/MachetaStrat.module.css'))
    for (const m of [marime, marimeSeif, marimeMacheta]) {
      expect(m).not.toBeNull()
      expect(Number(m![1])).toBeGreaterThanOrEqual(11)
      expect(Number(m![1])).toBeLessThanOrEqual(12)
    }
  })

  it('Storecove nu e numit retea, nici pe pagina, nici in registru', () => {
    expect(TEXTE.filter((t) => STORECOVE_RETEA.test(t))).toEqual([])
    const registru = JSON.parse(citeste('src/content/afirmatii/produs.json')) as { id: string; text: string }[]
    expect(registru.filter((a) => STORECOVE_RETEA.test(a.text)).map((a) => a.id)).toEqual([])
    expect(integrari.CATEGORII_INTEGRARI.flatMap((c) => c.integrari.map((i) => i.nume))).toContain('Storecove')
  })

  it('matricea rolurilor e declarata vizibil ca exemplu (D9), sub tabel', () => {
    const nota = securitate.BLOC_ACCES.matrice.nota
    expect(nota).toMatch(/^Exemplu/)
    const h = html.securitate
    const dupaTabel = h.slice(h.indexOf('</table>'))
    const p = /<p class="([^"]*)">([^<]*)<\/p>/.exec(dupaTabel)
    expect(p, 'nota de sub tabel').not.toBeNull()
    expect(p![2]).toBe(nota)
    expect(p![1]).not.toContain('doar-cititor')
  })

  it('harta are o singura regiune, in Germania, fara oras', () => {
    const h = html.securitate
    expect(ORASE.test(text(h))).toBe(false)
    expect(securitate.BLOC_INFRASTRUCTURA.harta.eticheta).toBe('Germania')
    const { x, y } = securitate.BLOC_INFRASTRUCTURA.harta.reper
    for (const v of [x, y]) {
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThan(100)
    }
    expect((h.match(/src="\/produs\/harta-europa\.svg"/g) ?? []).length).toBe(1)
    expect(h).toMatch(/<img[^>]*alt=""[^>]*role="presentation"|<img[^>]*role="presentation"[^>]*alt=""/)
    const svg = citeste('public/produs/harta-europa.svg')
    expect(svg).toContain('viewBox="0 0 800 480"')
    expect(svg).not.toMatch(/<text/)
    expect(svg).toContain('Natural Earth')
  })
})

describe('platforma', () => {
  const h = html.platforma

  it('un singur h1; macheta declara datele fictive si are cele doua valuri de intarzieri', () => {
    expect((h.match(/<h1\b/g) ?? []).length).toBe(1)
    expect(text(h)).toContain(platforma.MACHETA_STRAT.declaratie)
    for (const d of ['0s', '0.9s', '1.8s', '2.7s', '0.4s', '1.3s', '2.2s']) expect(h).toContain('animation-delay:' + d)
  })

  it('blocurile de cod: numai gazda rezervata, date fictive declarate, fara identificatori reali', () => {
    const cod = platforma.APELURI_PLATFORMA.blocuri.map((b) => b.cod).join('\n')
    const gazde = [...cod.matchAll(/https?:\/\/([^/\s]+)/g)].map((m) => m[1])
    expect(gazde.length).toBeGreaterThanOrEqual(2)
    expect(new Set(gazde)).toEqual(new Set([platforma.GAZDA_EXEMPLU]))
    expect(platforma.GAZDA_EXEMPLU.endsWith('.example')).toBe(true)
    expect(IDENTIFICATORI.filter((r) => r.test(cod))).toEqual([])
    expect(platforma.APELURI_PLATFORMA.legenda).toContain('date fictive')
    expect((h.match(/<pre role="region" tabindex="0" aria-label="[^"]+"/g) ?? []).length).toBe(2)
  })

  it('intrebarile frecvente: 7, toate inchise; comparatia e un tabel cu 6 randuri', () => {
    expect((h.match(/<details/g) ?? []).length).toBe(7)
    expect(h).not.toMatch(/<details open/)
    const tabel = h.slice(h.indexOf('role="table"'))
    expect((tabel.match(/role="row"/g) ?? []).length).toBe(6)
    expect((tabel.match(/role="columnheader"/g) ?? []).length).toBe(3)
  })

  it('legaturile: rutele existente sunt legaturi, cele lipsa raman inerte', () => {
    const existente = new Set(RUTE.map((r) => r.cale))
    for (const l of platforma.toateLegaturilePlatforma()) {
      const ruta = l.ruta ?? ''
      if (existente.has(ruta)) expect(h, ruta).toContain('href="' + l.href + '"')
      else expect(h, ruta).toContain('data-tinta-lipsa="' + l.href + '"')
    }
    expect(h).toContain('href="/securitate"')
    // /solutii o aduce alta felie: ramura se alege dupa RUTE (26.09), ca pe lotul cu felia solutii sa nu pice
    expect(h).toContain(existente.has('/solutii') ? 'href="/solutii"' : 'data-tinta-lipsa="/solutii"')
  })

  it('numerele pilonilor sunt decor: in atribut, ascunse, nu in text', () => {
    for (const n of ['01', '02', '03']) expect(h).toContain('data-numar="' + n + '" aria-hidden="true"')
  })
})

describe('integrari', () => {
  const h = html.integrari
  const toate = integrari.CATEGORII_INTEGRARI.flatMap((c) => c.integrari)

  it('sase categorii, toate integrarile disponibile azi (D4b), WhatsApp printre ele (D4c)', () => {
    expect(integrari.CATEGORII_INTEGRARI).toHaveLength(6)
    expect(toate.every((i) => i.stare === 'disponibil')).toBe(true)
    expect(toate.map((i) => i.nume)).toContain('WhatsApp')
    expect(integrari.LEGENDA_INTEGRARI.map((l) => l.stare)).toEqual(['disponibil', 'lucru', 'plan'])
    expect((h.match(/\(funcționează azi\)/g) ?? []).length).toBe(toate.length)
  })

  it('fara sigle de terti: pagina nu are nicio imagine', () => {
    expect(h).not.toMatch(/<img\b/)
  })

  it('importul de director are trei pasi, iar cererea de integrare ramane inerta cat /contact lipseste', () => {
    expect(integrari.DIRECTOR_INTEGRARI.pasi).toHaveLength(3)
    const contact = RUTE.some((r) => r.cale === '/contact')
    expect(h).toContain(contact ? 'href="/contact"' : 'data-tinta-lipsa="/contact"')
  })
})

describe('securitate', () => {
  const h = html.securitate

  it('noua capete numerotate, 01-09, ca decor', () => {
    for (let i = 1; i <= 9; i++) {
      const n = String(i).padStart(2, '0')
      expect(h, n).toContain('data-numar="' + n + '"')
    }
  })

  it('verificarea din browser: HTML-ul servit are doar starea de asteptare, fara cifre', () => {
    const v = securitate.VERIFICARE_BROWSER
    for (const s of Object.values(v.asteptare)) expect(text(h)).toContain(s)
    expect(text(h)).not.toMatch(/\b\d+ ms\b/)
    expect(h).toContain('data-stare="asteptare"')
  })

  it('matricea: 4 roluri x 5 drepturi, cu textul fiecarei celule pentru cititoare', () => {
    const m = securitate.BLOC_ACCES.matrice
    expect(m.roluri).toHaveLength(4)
    for (const r of m.roluri) expect(r.valori).toHaveLength(5)
    const corp = h.slice(h.indexOf('<tbody'), h.indexOf('</tbody>'))
    expect((corp.match(/<td/g) ?? []).length).toBe(20)
    const asteptate = m.roluri.flatMap((r) => r.valori.map((v) => m.texte[v]))
    const gasite = [...corp.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => text(x[1]))
    expect(gasite).toEqual(asteptate)
    expect(citeste('src/components/produs/securitate.module.css')).toMatch(/\.matrice \{[^}]*min-width: 640px/)
  })

  it('intrebarile frecvente: 6, primul deschis', () => {
    expect((h.match(/<details/g) ?? []).length).toBe(6)
    expect((h.match(/<details open/g) ?? []).length).toBe(1)
    expect(h.indexOf('<details open')).toBe(h.indexOf('<details'))
  })

  it('seiful: randuri fictive declarate, eticheta incuiata la incarcare, forma statica in foaie', () => {
    expect(securitate.SEIF.randuri).toHaveLength(3)
    for (const r of securitate.SEIF.randuri) expect(r.fisier).toMatch(/exemplu/)
    expect(text(h)).toContain(securitate.SEIF.declaratie)
    expect(text(h)).toContain(securitate.SEIF.stare.inchis)
    const foaie = citeste('src/components/produs/Seif.module.css')
    const statica = foaie.slice(foaie.indexOf('@media (prefers-reduced-motion: reduce), (scripting: none)'))
    expect(statica.length).toBeGreaterThan(60)
    // Dispare eticheta de stare, nu randul ei: marginea de 14 px ramane, ca la referinta (699 / 530).
    expect(statica).toMatch(/\.usa,\s*\.stare \{\s*display: none;/)
    expect(statica).toMatch(/opacity: 1 !important/)
  })

  it('pagina de securitate nu are CTA-ul final: seiful ii tine locul', () => {
    expect(citeste('src/app/securitate/page.tsx')).not.toContain('CtaFinalInchis')
    expect(citeste('src/app/platforma/page.tsx')).toContain('CtaFinalInchis')
  })
})

describe('seiful: canalele contra masuratorii (securitate.md §13)', () => {
  it('capetele cursei', () => {
    const inceput = stareSeif(0)
    expect(inceput.zavoare.map((z) => Math.abs(z))).toEqual([0, 0, 0])
    expect(Math.abs(inceput.roata)).toBe(0)
    expect(Math.abs(inceput.usa)).toBe(0)
    expect(inceput.deschis).toBe(false)
    expect(inceput.randuri.map((r) => [r.opacitate, r.y])).toEqual([[0, 14], [0, 14], [0, 14]])
    expect([inceput.final.opacitate, inceput.final.y]).toEqual([0, 10])
    const sfarsit = stareSeif(1)
    expect(sfarsit.zavoare).toEqual([-20, -20, -20])
    expect(sfarsit.roata).toBe(200)
    expect(sfarsit.usa).toBe(-88)
    expect(sfarsit.deschis).toBe(true)
    expect(sfarsit.randuri.map((r) => [r.opacitate, r.y])).toEqual([[1, 0], [1, 0], [1, 0]])
  })

  it('punctele masurate pe referinta: roata, usa, eticheta', () => {
    expect(Math.abs(stareSeif(0.3).roata - 102.7)).toBeLessThan(1)
    expect(Math.abs(stareSeif(0.4).roata - 184.2)).toBeLessThan(1)
    expect(Math.abs(stareSeif(0.55).usa - -25.2)).toBeLessThan(0.5)
    expect(Math.abs(stareSeif(0.6).usa - -55.8)).toBeLessThan(0.5)
    expect(Math.abs(stareSeif(0.7).usa - -84)).toBeLessThan(0.5)
    expect(stareSeif(0.5).deschis).toBe(false)
    expect(stareSeif(0.51).deschis).toBe(true)
  })

  it('martor negativ: o curba liniara pe roata ar pica toleranta de mai sus', () => {
    const liniar = UNGHI_ROATA * progres(0.3, CANALE_SEIF.roata)
    expect(Math.abs(liniar - 102.7)).toBeGreaterThan(1)
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 6)
  })

  it('reversibil: starea depinde numai de p, nu de drumul pana acolo', () => {
    const inainte = [0.1, 0.35, 0.62, 0.7].map(stareSeif)
    const inapoi = [0.9, 0.7, 0.62, 0.35, 0.1].map(stareSeif).slice(1).reverse()
    expect(inapoi).toEqual(inainte)
  })

  it('p din pozitia sectiunii: cursa = inaltimea minus fereastra', () => {
    expect(progresSectiune(0, 2340, 900)).toBe(0)
    expect(progresSectiune(-720, 2340, 900)).toBe(0.5)
    expect(progresSectiune(-1440, 2340, 900)).toBe(1)
    expect(progresSectiune(300, 2340, 900)).toBe(0)
    expect(progresSectiune(-5000, 2340, 900)).toBe(1)
  })

  it('netezirea usii: sub 2% din distanta dupa 150 ms, in cadre de 16 ms', () => {
    let unghi = 0
    for (let t = 0; t < 150; t += 16) unghi = pasNetezire(unghi, -88, 16)
    expect(Math.abs(unghi - -88)).toBeLessThan(88 * 0.02)
    expect(pasNetezire(-10, -10, 16)).toBe(-10)
  })
})

describe('verificarea din browser: mediana si punctul /api/sanatate', () => {
  it('mediana', () => {
    expect(mediana([30, 10, 20])).toBe(20)
    expect(mediana([4, 1, 3, 2])).toBe(2.5)
    expect(mediana([])).toBeNull()
    expect(mediana([1, Number.NaN])).toBeNull()
  })

  it('raspunde 200 cu un JSON mic, fara cache si fara cookie-uri', async () => {
    const r = GET()
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toMatch(/no-store/)
    expect(r.headers.get('set-cookie')).toBeNull()
    expect(await r.json()).toEqual({ stare: 'ok' })
  })

  it('nu citeste nimic despre cel care intreaba', () => {
    const sursa = citeste('src/app/api/sanatate/route.ts')
    expect(sursa).toMatch(/export function GET\(\)/)
    expect(sursa).not.toMatch(/headers\(\)|cookies\(\)|request\.|console\./)
  })
})

describe('datele structurate ale intrebarilor', () => {
  it('FAQPage are exact intrebarile de pe pagina, cu un @id pe pagina', () => {
    const baza = 'https://3s4.ke2.in'
    const p = grafIntrebariPagina(platforma.CALE_PLATFORMA, platforma.INTREBARI_PLATFORMA, baza)['@graph'][0]
    const s = grafIntrebariPagina(securitate.CALE_SECURITATE, securitate.INTREBARI_SECURITATE, baza)['@graph'][0]
    expect(p['@id']).toBe(baza + '/platforma#intrebari')
    expect(s['@id']).toBe(baza + '/securitate#intrebari')
    for (const [graf, bloc, pagina] of [
      [p, platforma.INTREBARI_PLATFORMA, html.platforma],
      [s, securitate.INTREBARI_SECURITATE, html.securitate],
    ] as const) {
      const intrebari = graf.mainEntity as { name: string; acceptedAnswer: { text: string } }[]
      expect(intrebari.map((q) => q.name)).toEqual(bloc.intrebari.map((q) => q.intrebare))
      expect(intrebari.map((q) => q.acceptedAnswer.text)).toEqual(bloc.intrebari.map((q) => q.raspuns))
      for (const q of bloc.intrebari) {
        expect(text(pagina)).toContain(q.intrebare)
        expect(text(pagina)).toContain(q.raspuns)
      }
    }
  })
})

describe('registrul de afirmatii al feliei', () => {
  const registru = JSON.parse(citeste('src/content/afirmatii/produs.json')) as {
    id: string
    unde: string
    stare: string
    sursa?: string
    confirmat_de?: string
  }[]

  it('id-uri unice cu prefixul feliei, locuri care exista, confirmarile cu sursa', () => {
    const iduri = registru.map((a) => a.id)
    expect(new Set(iduri).size).toBe(iduri.length)
    for (const a of registru) {
      expect(a.id).toMatch(/^produs-/)
      for (const cale of a.unde.split(',').map((x) => x.trim())) expect(existsSync(join(RADACINA, cale)), a.id + ': ' + cale).toBe(true)
      if (a.stare === 'confirmat') {
        expect(a.sursa, a.id).toBeTruthy()
        expect(a.confirmat_de, a.id).toBeTruthy()
      }
    }
  })

  it('fiecare modul de continut al celor trei pagini e numit in registru', () => {
    const locuri = registru.flatMap((a) => a.unde.split(',').map((x) => x.trim()))
    for (const m of ['src/content/produs/platforma.ts', 'src/content/produs/integrari.ts', 'src/content/produs/securitate.ts']) {
      expect(locuri, m).toContain(m)
    }
  })

  it('criptarea ramane neconfirmata pana o confirma dezvoltatorul platformei', () => {
    expect(registru.find((a) => a.id === 'produs-criptare-aes-256-tls')?.stare).toBe('neconfirmat')
  })

  it('sediul Amazon si legea SUA: confirmate din surse primare, cu legaturile in registru', () => {
    const a = registru.find((x) => x.id === 'produs-amazon-sediu-sua')
    expect(a?.stare).toBe('confirmat')
    expect(a?.sursa).toContain('https://www.govinfo.gov/')
    expect(a?.sursa).toContain('https://data.sec.gov/submissions/CIK0001018724.json')
  })

  it('izolarea pe firma, autorizarea pe cerere si rolurile implicite sunt retrase, cu motivul scris', () => {
    for (const id of ['produs-arhive-separate-pe-firma', 'produs-autorizare-pe-cerere', 'produs-roluri-implicite']) {
      const a = registru.find((x) => x.id === id)
      expect(a?.stare, id).toBe('retras')
      expect(a?.sursa, id).toMatch(/^retrasă/)
    }
  })
})

describe('grupurile care nu se rup la capat de rand (nerupt)', () => {
  const grupuri = (t: string) => bucatiNerupte(t).filter((_, i) => i % 2 === 1)

  it('prinde termenii tehnici si cratimele cu o parte scurta, masurate rupte la 1440 si 390', () => {
    expect(grupuri('criptate AES-256, și de acolo')).toEqual(['AES-256'])
    expect(grupuri('cine l-a deschis e partea')).toEqual(['l-a'])
    expect(grupuri('prin API-ul REST, iar webhook-urile')).toEqual(['API-ul', 'webhook-urile'])
    expect(grupuri('fișierele încărcate, e-mailurile, pozele')).toEqual(['e-mailurile'])
    expect(grupuri('de mână dintr-un PDF, într-o regiune')).toEqual(['dintr-un', 'într-o'])
    expect(grupuri('TLS 1.2 sau mai nou, SSO / SAML 2.0, Microsoft 365 și Entra ID')).toEqual([
      'TLS 1.2',
      'SAML 2.0',
      'Microsoft 365',
      'Entra ID',
    ])
  })

  it('martor NEGATIV: compusele lungi raman de rupt la cratima, ca in tiparul obisnuit', () => {
    expect(grupuri('pe bază de proces-verbal; fișierele')).toEqual([])
    expect(grupuri('predate firmei-mamă, pe rafturi')).toEqual([])
    expect(grupuri('fără nicio cratimă')).toEqual([])
  })

  it('textul ramane acelasi caracter cu caracter; grupul sta intr-un span nerupt', () => {
    const t = 'Acolo stau fișierele, criptate AES-256, iar cine l-a deschis rămâne în jurnal.'
    const h = renderToStaticMarkup(createElement('p', null, nerupt(t)))
    expect(h.replace(/<[^>]+>/g, '')).toBe(t)
    expect((h.match(/<span class="[^"]*nerupt[^"]*">/g) ?? []).length).toBe(2)
    expect(nerupt(42)).toBe(42)
    expect(nerupt('fără grupuri')).toBe('fără grupuri')
  })
})
