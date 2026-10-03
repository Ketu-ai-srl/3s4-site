import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RUTE } from '../src/content/rute'
import { PAGINI_MARTOR, normalizeaza } from './fixturi/invarianta-ro/normalizeaza'

/**
 * INVARIANTA BUILD-ULUI ROMANESC (fundatia editiilor). Editiile (`src/lib/editii.ts`) aduc in acelasi arbore
 * paginile site-ului international, cu extensiile `.en.tsx` si `.romd.tsx`, plus un manifest de rute pe
 * editie. Pe build-ul RO (fara `SITE_EDITII`) nimic din toate acestea nu are voie sa se vada: HTML-ul
 * paginilor-martor trebuie sa fie identic, dupa normalizare, cu cel construit pe BAZA, inainte de schimbare.
 *
 * FIXTURILE (tests/fixturi/invarianta-ro/) sunt fotografia build-ului RO al bazei, produsa de `genereaza.mjs`
 * cu aceeasi normalizare pe care o foloseste proba. Doua build-uri reci ale bazei au dat aceleasi fixturi
 * (masurat: a doua generare n-a schimbat niciun octet), deci ce ramane dupa normalizare nu e zgomot.
 *
 * PAGINILE-MARTOR: startul, preturile, contactul, blogul si pagina de negasit. `/juridic` nu are HTML pe
 * build-ul fara operator (segment dinamic fara parametri), deci in locul lui sta 404-ul romanesc - pagina
 * pe care `global-not-found` ar putea-o atinge - iar lista completa a fisierelor HTML ale build-ului e
 * comparata si ea (deci si absenta paginilor juridice).
 *
 * CAND SE INROSESTE PE DREPT FARA DEFECT. O felie care schimba DELIBERAT textul unei pagini-martor sau adauga o
 * pagina RO schimba si fotografia. Atunci fixturile se refac pe baza noua (comanda din `genereaza.mjs`), in
 * felia care a facut schimbarea, si diferenta se citeste inainte: proba nu stie sa deosebeasca o schimbare
 * voita de una scapata, de aceea o arata pe amandoua.
 *
 * DECIZIA 56 (03.10.2026, "fara apeluri pe gsm", peste tot, inclusiv editia ro-RO): legaturile de apel, butonul de
 * apel al barei de pe mobil, cardul de telefon si `telephone` din JSON-LD au iesit din componentele COMUNE (subsol,
 * bara, datele structurate, urmarirea clicurilor), deci si de pe build-ul romanesc. Fixturile au fost refacute cu
 * `genereaza.mjs` pe build-ul RO al feliei care a facut schimbarea si au iesit identice octet cu octet cu cele de
 * dinainte (39 de pagini-martor, harta si lista HTML neschimbate): build-ul RO al probelor nu are `CANALE_JSON`, deci
 * nici numar, nici WhatsApp, nici legatura de apel de scos. Garda deciziei pe build-ul RO e `tests/fara-apel-gsm.test.ts`.
 *
 * Proba citeste build-ul din `.next`: in CI ruleaza dupa `pnpm build` (`pnpm verifica`). Fara build, sau cu un
 * build care nu e cel romanesc, iese rosie cu motivul, nu verde.
 */

const RADACINA = join(__dirname, '..')
const FIXTURI = join(RADACINA, 'tests', 'fixturi', 'invarianta-ro')
const APP = join(RADACINA, '.next', 'server', 'app')

type Baza = { harta: string[]; termeneIcsSha256: string; paginiHtml: string[] }
const baza = JSON.parse(readFileSync(join(FIXTURI, 'baza.json'), 'utf8')) as Baza

/** Prima diferenta dintre doua texte, cu context, ca mesajul sa arate ce s-a schimbat. */
function primaDiferenta(a: string, b: string): string | null {
  if (a === b) return null
  const n = Math.min(a.length, b.length)
  let i = 0
  while (i < n && a[i] === b[i]) i++
  return 'lungimi ' + a.length + '/' + b.length + ', prima diferenta la ' + i + ':\n  baza:  ' + JSON.stringify(a.slice(Math.max(0, i - 80), i + 120)) + '\n  build: ' + JSON.stringify(b.slice(Math.max(0, i - 80), i + 120))
}

function idBuild(): string {
  const cale = join(RADACINA, '.next', 'BUILD_ID')
  if (!existsSync(cale)) throw new Error('NEMASURAT: lipseste .next/BUILD_ID - proba cere build-ul RO (pnpm build, fara SITE_EDITII)')
  return readFileSync(cale, 'utf8')
}

function citesteDinBuild(fisier: string): string {
  const cale = join(APP, ...fisier.split('/'))
  if (!existsSync(cale)) throw new Error('NEMASURAT: build-ul nu are ' + fisier)
  return readFileSync(cale, 'utf8')
}

describe('invarianta build-ului RO fata de baza', () => {
  it('build-ul din .next e cel romanesc (controlul preconditiei)', () => {
    idBuild()
    expect(citesteDinBuild('index.html')).toContain('<html lang="ro"')
  })

  for (const p of PAGINI_MARTOR) {
    it('pagina-martor ' + p.cale + ': HTML identic cu baza, dupa normalizare', () => {
      const asteptat = readFileSync(join(FIXTURI, 'pagini', p.fisier), 'utf8')
      const construit = normalizeaza(citesteDinBuild(p.fisier), idBuild())
      expect(primaDiferenta(asteptat, construit), p.fisier).toBeNull()
    })
  }

  it('aceleasi fisiere HTML ca pe baza (nicio pagina in plus sau in minus, juridicul absent fara operator)', () => {
    const acum = readdirSync(APP, { recursive: true })
      .map((f) => String(f).split('\\').join('/'))
      .filter((f) => f.endsWith('.html'))
      .sort()
    expect(acum).toEqual(baza.paginiHtml)
  })

  it('harta de site: aceleasi adrese, in aceeasi ordine, ca pe baza (inclusiv cele 15 articole de blog)', () => {
    const harta = [...citesteDinBuild('sitemap.xml.body').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(harta).toEqual(baza.harta)
    // Controlul fixturii: baza chiar are articolele, deci egalitatea de mai sus le cuprinde
    expect(baza.harta.filter((u) => new URL(u).pathname.startsWith('/blog/')).length).toBeGreaterThan(0)
  })

  it('calendarul /instrumente/termene.ics: acelasi continut ca pe baza', () => {
    const corp = readFileSync(join(APP, 'instrumente', 'termene.ics.body'))
    expect(createHash('sha256').update(corp).digest('hex')).toBe(baza.termeneIcsSha256)
  })

  it('martor POZITIV: un caracter schimbat intr-o pagina-martor (pe o copie in memorie) face comparatia rosie', () => {
    const asteptat = readFileSync(join(FIXTURI, 'pagini', 'contact.html'), 'utf8')
    const construit = normalizeaza(citesteDinBuild('contact.html'), idBuild())
    const i = construit.indexOf('<h1')
    expect(i, 'pagina-martor are un <h1>').toBeGreaterThan(0)
    const atins = construit.slice(0, i + 1) + 'H' + construit.slice(i + 2)
    expect(primaDiferenta(asteptat, atins)).not.toBeNull()
  })

  // Martorii rutelor-martor adaugate pentru congruenta editiilor: o pagina dintr-o pereche (platforma) si una din
  // afara perechilor (un articol de blog, care primeste firul de navigare prin componentele comune). Fiecare
  // martor verifica intai ca pagina nemutata e identica cu fixtura, ca rosul sa vina numai din mutatie.
  it('martor POZITIV pe o ruta-martor noua: un caracter schimbat in /platforma (pe o copie in memorie) face comparatia rosie', () => {
    const asteptat = readFileSync(join(FIXTURI, 'pagini', 'platforma.html'), 'utf8')
    const construit = normalizeaza(citesteDinBuild('platforma.html'), idBuild())
    expect(primaDiferenta(asteptat, construit), 'controlul martorului: pagina nemutata e identica cu fixtura').toBeNull()
    const i = construit.indexOf('<h1')
    expect(i, 'pagina-martor are un <h1>').toBeGreaterThan(0)
    const atins = construit.slice(0, i + 1) + 'H' + construit.slice(i + 2)
    expect(primaDiferenta(asteptat, atins)).not.toBeNull()
  })

  it('martor POZITIV in afara perechilor: eticheta accesibila a firului de navigare, schimbata pe o copie a unui articol de blog, face comparatia rosie', () => {
    const fisier = PAGINI_MARTOR.find((p) => p.cale.startsWith('/blog/') && !p.cale.startsWith('/blog/categorie/') && !p.cale.startsWith('/blog/pagina/'))
    expect(fisier, 'controlul martorului: lista are un articol de blog').toBeDefined()
    const asteptat = readFileSync(join(FIXTURI, 'pagini', fisier!.fisier), 'utf8')
    const construit = normalizeaza(citesteDinBuild(fisier!.fisier), idBuild())
    expect(primaDiferenta(asteptat, construit), 'controlul martorului: articolul nemutat e identic cu fixtura').toBeNull()
    // Firul e elementul <nav> urmat direct de lista <ol>; eticheta lui nu se scrie aici, se citeste din pagina.
    const fir = /<nav aria-label="([^"]+)"[^>]*><ol/.exec(construit)
    expect(fir, 'controlul martorului: articolul are firul de navigare cu eticheta accesibila').not.toBeNull()
    const inceput = fir!.index + '<nav aria-label="'.length
    const atins = construit.slice(0, inceput) + fir![1] + 'x' + construit.slice(inceput + fir![1].length)
    expect(atins, 'controlul martorului: eticheta chiar s-a schimbat').not.toBe(construit)
    expect(primaDiferenta(asteptat, atins)).not.toBeNull()
  })

  it('martor NEGATIV al normalizarii, in DOM: id-ul build-ului, numele statice si sirul de foi de stil se inlocuiesc, textul nu', () => {
    const id = 'Ab-c_D'
    const stil = (n: string) => '<link rel="stylesheet" href="/_next/static/css/' + n + '.css" data-precedence="next"/>'
    const html = '<!--Ab_c_D-->' + stil('a1') + stil('b2') + '<script src="/_next/static/chunks/app/page-12ab.js"></script>["static/css/9f.css",' + JSON.stringify(id) + ']<p>Prețuri</p>'
    expect(normalizeaza(html, id)).toBe(
      '<!--ID-BUILD--><link rel="stylesheet" CSS/><script src="/_next/static/chunks/X"></script>["static/css/X","ID-BUILD"]<p>Prețuri</p>' +
        '\n--- fluxul RSC, sirurile sortate ---\n\n',
    )
  })

  // Fluxul RSC asa cum sta in HTML: randuri `id:continut` separate de BS+n, ghilimelele escapate, taiat in scripturi.
  const BS = String.fromCharCode(92)
  const Q = BS + '"'
  const rsc = (randuri: string[], taietura = 0) => {
    const tot = randuri.join(BS + 'n') + BS + 'n'
    const parti = taietura > 0 ? [tot.slice(0, taietura), tot.slice(taietura)] : [tot]
    return parti.map((p) => '<script>self.__next_f.push([1,"' + p + '"])</script>').join('')
  }
  const paragraf = (id: string, text: string) => id + ':[' + Q + '$' + Q + ',' + Q + 'p' + Q + ',null,{' + Q + 'children' + Q + ':' + Q + text + Q + '}]'
  const legaturaStil = (id: string) => id + ':[' + Q + '$' + Q + ',' + Q + 'link' + Q + ',' + Q + '0' + Q + ',{' + Q + 'rel' + Q + ':' + Q + 'stylesheet' + Q + ',' + Q + 'href' + Q + ':' + Q + '/_next/static/css/a.css' + Q + '}]'
  const A = rsc(['0:{' + Q + 'b' + Q + ':' + Q + 'z' + Q + '}', paragraf('1', 'Prețuri'), '2:[' + Q + '$L1' + Q + ']'])

  it('martor NEGATIV al normalizarii, in fluxul RSC: randuri renumerotate, in alta ordine, cu o foaie de stil in plus si taiate altfel dau aceeasi forma', () => {
    const B = rsc(['0:{' + Q + 'b' + Q + ':' + Q + 'z' + Q + '}', '2:[' + Q + '$L3' + Q + ',' + Q + '$L4' + Q + ']', paragraf('3', 'Prețuri'), legaturaStil('4')], 17)
    expect(normalizeaza(B, 'x-y')).toBe(normalizeaza(A, 'x-y'))
  })

  it('martor POZITIV al normalizarii, in fluxul RSC: un text schimbat intr-un rand se vede', () => {
    const C = rsc(['0:{' + Q + 'b' + Q + ':' + Q + 'z' + Q + '}', paragraf('1', 'Preturi'), '2:[' + Q + '$L1' + Q + ']'])
    expect(normalizeaza(C, 'x-y')).not.toBe(normalizeaza(A, 'x-y'))
  })

  // Anul din subsol e calculat la build (`new Date().getFullYear()`): fara normalizare, primul build din anul urmator
  // ar inrosi toate paginile-martor fara nicio schimbare de cod.
  const anSubsol = (html: string) => /© (\d{4})/.exec(html)
  const altAn = (html: string) => {
    const m = anSubsol(html)
    if (!m) throw new Error('pagina nu are anul din subsol')
    return html.split('© ' + m[1]).join('© ' + String(Number(m[1]) + 1))
  }

  it('martor NEGATIV al normalizarii: anul din subsol schimbat (pe o copie in memorie a paginii construite) da aceeasi forma', () => {
    const html = citesteDinBuild('contact.html')
    expect(anSubsol(html), 'controlul martorului: pagina construita are anul in subsol').not.toBeNull()
    const mutat = altAn(html)
    expect(mutat, 'controlul martorului: anul chiar s-a schimbat').not.toBe(html)
    expect(normalizeaza(mutat, idBuild())).toBe(normalizeaza(html, idBuild()))
  })

  it('martor POZITIV langa an: textul de dupa an, schimbat, se vede', () => {
    const html = citesteDinBuild('contact.html')
    const m = anSubsol(html)
    expect(m).not.toBeNull()
    const mutat = html.split('© ' + m![1] + ' 3S').join('© ' + m![1] + ' 4S')
    expect(mutat).not.toBe(html)
    expect(normalizeaza(mutat, idBuild())).not.toBe(normalizeaza(html, idBuild()))
  })

  // Randurile de referinta client (`I[<modul>,[<chunk>,<cale>,...],<export>]`) poarta id-uri de modul si de chunk care
  // depind de calea la care se rezolva node_modules (masurat: acelasi arbore, construit cu node_modules prin jonctiune,
  // da alte id-uri pe toate paginile-martor). Fixtura se asambleaza la rulare.
  const randClient = (id: string, modul: string, chunkuri: string[], exp: string) =>
    id + ':I[' + modul + ',[' + chunkuri.flatMap((c) => [Q + c + Q, Q + 'static/chunks/' + c + '-ab12.js' + Q]).join(',') + '],' + Q + exp + Q + ']'
  const R1 = rsc([paragraf('1', 'Prețuri'), randClient('2', '44063', ['1679', '2415'], 'default')])

  it('martor NEGATIV al normalizarii: id-urile de modul si de chunk renumerotate (si alt numar de chunk-uri) dau aceeasi forma', () => {
    const R2 = rsc([paragraf('1', 'Prețuri'), randClient('2', '9001', ['16ra', '7z', '3340'], 'default')])
    expect(normalizeaza(R2, 'x-y')).toBe(normalizeaza(R1, 'x-y'))
  })

  it('martor POZITIV langa id-uri: alt export intr-un rand client se vede', () => {
    const R3 = rsc([paragraf('1', 'Prețuri'), randClient('2', '44063', ['1679', '2415'], 'Image')])
    expect(normalizeaza(R3, 'x-y')).not.toBe(normalizeaza(R1, 'x-y'))
  })

  it('martor NEGATIV pe pagina construita: toate id-urile de chunk din randurile client, renumerotate in memorie, dau aceeasi forma', () => {
    const html = citesteDinBuild('contact.html')
    let n = 0
    const mutat = html.replace(/:I\[(\d+),\[([^\]]*)\]/g, (_, modul: string, lista: string) => {
      n++
      return ':I[' + String(Number(modul) + 7) + ',[' + lista.replace(new RegExp(BS + BS + '"([0-9a-z]+)' + BS + BS + '"', 'g'), (_m, c: string) => Q + 'q' + c + Q) + ']'
    })
    expect(n, 'controlul martorului: pagina are randuri client').toBeGreaterThan(3)
    expect(mutat).not.toBe(html)
    expect(normalizeaza(mutat, idBuild())).toBe(normalizeaza(html, idBuild()))
  })
})

describe('RUTE pe editia ro-RO: identic element cu element cu baza', () => {
  it('aceleasi rute, aceleasi campuri, aceeasi ordine (fixtura scrisa din modulul bazei)', () => {
    const asteptat = JSON.parse(readFileSync(join(FIXTURI, 'rute-ro.json'), 'utf8')) as unknown[]
    expect(asteptat.length, 'controlul fixturii: baza avea rute').toBeGreaterThan(30)
    expect(JSON.parse(JSON.stringify(RUTE))).toEqual(asteptat)
  })
})
