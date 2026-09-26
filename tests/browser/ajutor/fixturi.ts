import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { CHEIE_ALEGERE } from '../../../src/components/consimtamant/stocare'

/**
 * Serverul de fixturi: paginile-martor ale portilor de browser.
 *
 * Doua decizii care nu sunt de comoditate:
 *
 * 1. Fixturile se ASAMBLEAZA LA RULARE, din bucati, si nu stau ca fisiere `.html` in
 *    arbore. Motivul e platit deja pe alt proiect: o proba care poarta literal ce
 *    vaneaza devine ea insasi o instanta a defectului si inroseste alte porti
 *    (tipografie, limba, secrete) pe cod corect.
 * 2. Serverul asculta pe 127.0.0.1 cu port 0, adica port liber ales de sistem. Nicio
 *    constanta de port, deci nicio bomba cu ceas cand ruleaza doua loturi deodata.
 */

// Gazdele straine se compun din bucati, din acelasi motiv ca mai sus. TLD-ul `.invalid`
// e rezervat prin RFC 2606: nu se rezolva niciodata, deci controlul pozitiv nu produce
// trafic real catre nimeni. Cererea se INREGISTREAZA oricum de browser inainte de DNS,
// si exact asta masuram.
export const GAZDA_STRAINA_SCRIPT = ['cdn', 'a-treia-parte', 'invalid'].join('.')
export const GAZDA_STRAINA_PIXEL = ['pixel', 'masurare-externa', 'invalid'].join('.')

// Serverele de fonturi ale Google, cele doua pe care le numeste verificarea gdprscan.md si pe care
// proba comutatorului le cere absente la rulare. Martorul lor pozitiv NU foloseste o gazda
// `.invalid`: intrebarea e chiar daca detectorul recunoaste gazda reala. De aceea proba blocheaza
// cererea la retea (tests/browser/comutator.spec.ts), deci nu pleaca nimic spre Google.
export const GAZDA_FONTURI_GOOGLE = ['fonts', 'googleapis', 'com'].join('.')
export const GAZDA_FISIERE_FONTURI_GOOGLE = ['fonts', 'gstatic', 'com'].join('.')

// PNG 1x1 transparent, ca fixturile de imagine sa nu ceara nimic din retea. O imagine
// adusa prin retea ar amesteca poarta de accesibilitate cu cea de terti.
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const PARAGRAF_UNU =
  'Ridicam arhiva cu proces-verbal de predare-primire, masuram metrii liniari si sigilam cutiile in fata dumneavoastra, ca sa stiti exact ce a plecat din institutie.'
const PARAGRAF_DOI =
  'Fiecare unitate arhivistica primeste cota si intra in opis, dupa nomenclatorul institutiei, iar originalul ramane in raft cat timp copia devine cautabila.'

function pagina(titlu: string, corp: string, capSuplimentar = ''): string {
  return (
    '<!doctype html><html lang="ro"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' +
    titlu +
    '</title>' +
    capSuplimentar +
    '</head><body>' +
    corp +
    '</body></html>'
  )
}

/** Corpul corect, folosit de TOATE martorii negativi: acelasi schelet, un singur defect injectat. */
function corpCorect(extra = ''): string {
  return (
    '<main><h1>Arhiva care raspunde</h1>' +
    '<p style="color:#1a1a1a;background:#ffffff">' +
    PARAGRAF_UNU +
    '</p>' +
    '<p style="color:#1a1a1a;background:#ffffff">' +
    PARAGRAF_DOI +
    '</p>' +
    '<img src="' +
    PIXEL +
    '" alt="Sigiliu de verificare" width="40" height="40">' +
    extra +
    '</main>'
  )
}

const PAGINI: Record<string, () => string> = {
  // --- accesibilitate -------------------------------------------------------
  // Martor pozitiv: contrast prost (serious) plus imagine fara text alternativ (critical).
  '/a11y/rau': () =>
    pagina(
      'Fixtura accesibilitate, defecta',
      '<main><h1>Arhiva care raspunde</h1>' +
        '<p style="color:#a8a8a8;background:#ffffff">' +
        PARAGRAF_UNU +
        '</p>' +
        '<img src="' +
        PIXEL +
        '" width="40" height="40">' +
        '</main>',
    ),
  '/a11y/bun': () => pagina('Fixtura accesibilitate, corecta', corpCorect()),

  // --- HTML brut ------------------------------------------------------------
  // Martor pozitiv: titlul si paragrafele exista DOAR daca ruleaza JavaScript.
  // E fix defectul masurat la concurent (cifrele lui sunt contoare animate).
  '/brut/rau': () =>
    pagina(
      'Se incarca',
      '<main><h1>Se incarca</h1><div id="continut"></div></main>' +
        '<script>' +
        'document.title=' +
        JSON.stringify('Arhiva care raspunde') +
        ';' +
        'document.getElementById("continut").innerHTML=' +
        JSON.stringify(
          '<p>' + PARAGRAF_UNU + '</p><p>' + PARAGRAF_DOI + '</p>',
        ) +
        ';</script>',
    ),
  // Martor negativ: acelasi continut, livrat de server, cu JavaScript doar decorativ.
  '/brut/bun': () =>
    pagina(
      'Arhiva care raspunde',
      corpCorect() +
        '<script>document.body.setAttribute("data-hidratat","1")</script>',
    ),

  // --- derapaj orizontal ----------------------------------------------------
  '/derapaj/rau': () =>
    pagina(
      'Fixtura derapaj, defecta',
      '<main><h1>Arhiva care raspunde</h1>' +
        '<div style="width:1200px;background:#1a1a1a;color:#ffffff">' +
        PARAGRAF_UNU +
        '</div></main>',
    ),
  '/derapaj/bun': () =>
    pagina(
      'Fixtura derapaj, corecta',
      '<style>*{box-sizing:border-box}body{margin:0}</style>' + corpCorect(),
    ),

  // --- terti si consimtamant ------------------------------------------------
  // Martor pozitiv 1: doua familii de subresurse straine, script si imagine, fara banner.
  '/terti/rau': () =>
    pagina(
      'Fixtura terti, defecta',
      corpCorect(
        '<img src="https://' +
          GAZDA_STRAINA_PIXEL +
          '/p.gif" alt="" role="presentation" width="1" height="1">',
      ),
      '<script src="https://' + GAZDA_STRAINA_SCRIPT + '/tracker.js"></script>',
    ),
  // Martor pozitiv 2: exista banner, dar tertul pleaca INAINTE de orice interactiune.
  // Fara cazul asta, poarta ar trece un site care intreaba politicos si incarca oricum.
  '/terti/rau-banner': () =>
    pagina(
      'Fixtura banner, defecta',
      corpCorect() +
        bannerHtml() +
        '<script>' +
        'var s=document.createElement("script");' +
        's.src="https://' +
        GAZDA_STRAINA_SCRIPT +
        '/tracker.js";document.head.appendChild(s);' +
        '</script>',
    ),
  // Martor negativ: banner care incarca tertul DOAR la accept. Refuzul trebuie sa lase
  // reteaua curata, iar proba verifica si ca butonul de refuz chiar a fost apasat.
  '/terti/bun-banner': () =>
    pagina(
      'Fixtura banner, corecta',
      corpCorect() +
        bannerHtml() +
        '<script>' +
        'document.querySelector("[data-accept]").addEventListener("click",function(){' +
        'var s=document.createElement("script");' +
        's.src="https://' +
        GAZDA_STRAINA_SCRIPT +
        '/tracker.js";document.head.appendChild(s);' +
        'document.querySelector("[data-consimtamant]").remove();});' +
        'document.querySelector("[data-refuz]").addEventListener("click",function(){' +
        'document.querySelector("[data-consimtamant]").remove();});' +
        '</script>',
    ),
  '/terti/bun': () => pagina('Fixtura terti, corecta', corpCorect()),

  // --- alegerea pastrata dupa refuz (C-01, decizia owner-ului din 24.09) -----
  // Martor negativ: refuzul lasa NUMAI alegerea, sub cheia declarata in politica. Asa se poarta
  // bannerul real (src/components/consimtamant/stocare.ts).
  '/terti/bun-banner-alegere': () =>
    pagina(
      'Fixtura alegere, corecta',
      corpCorect() +
        bannerHtml() +
        '<script>' +
        laClic('data-refuz', scrieCheie(CHEIE_ALEGERE)) +
        laClic('data-accept', '') +
        '</script>',
    ),
  // Martor pozitiv: pe langa alegere, refuzul lasa si o a doua cheie, nedeclarata.
  '/terti/rau-banner-stocare': () =>
    pagina(
      'Fixtura alegere, cu stocare in plus',
      corpCorect() +
        bannerHtml() +
        '<script>' +
        laClic('data-refuz', scrieCheie(CHEIE_ALEGERE) + scrieCheie(['urmarire', 'vizite'].join('-'))) +
        '</script>',
    ),
  // Martor pozitiv: cheia alegerii scrisa la INCARCARE, inainte de orice clic. Dupa refuz arata
  // la fel ca pagina corecta; numai citirea de dinaintea clicului o deosebeste.
  '/terti/rau-alegere-la-incarcare': () =>
    pagina(
      'Fixtura alegere scrisa la incarcare',
      corpCorect() +
        bannerHtml() +
        '<script>' +
        scrieCheie(CHEIE_ALEGERE) +
        laClic('data-refuz', '') +
        '</script>',
    ),

  // --- simetria acceptului si a refuzului (G-CONS-02, gdprscan SITE-04) ------
  // Aceeasi cutie, acelasi font, acelasi nivel in DOM la toate patru; difera numai tratamentul.
  // Martor negativ: amandoua pline, in aceeasi culoare.
  '/simetrie/bun': () => pagina('Fixtura simetrie, corecta', corpCorect() + bannerSimetrie(BUTON_PLIN, BUTON_PLIN)),
  // Martor negativ: amandoua deschise, cu chenar de peste 3:1 fata de banner.
  '/simetrie/bun-chenar': () =>
    pagina('Fixtura simetrie, cu chenar', corpCorect() + bannerSimetrie(BUTON_CU_CHENAR, BUTON_CU_CHENAR)),
  // Martor pozitiv: acceptul plin, refuzul deschis si fara chenar - forma bannerului pana la 25.09.2026.
  '/simetrie/rau': () => pagina('Fixtura simetrie, defecta', corpCorect() + bannerSimetrie(BUTON_PLIN, BUTON_DESCHIS)),
  // Martor pozitiv: amandoua deschise si fara chenar - egale intre ele, dar niciunul nu se vede ca buton.
  '/simetrie/sterse': () =>
    pagina('Fixtura simetrie, butoane sterse', corpCorect() + bannerSimetrie(BUTON_DESCHIS, BUTON_DESCHIS)),
  // Martor pozitiv: albastrul butonului plin, dar la 10% opacitate - nu trece drept buton plin.
  '/simetrie/translucide': () =>
    pagina('Fixtura simetrie, butoane translucide', corpCorect() + bannerSimetrie(BUTON_TRANSLUCID, BUTON_TRANSLUCID)),

  // --- raspunsul in primele 400 de cuvinte (G-AI-02) --------------------------
  // Martor negativ: titlul, apoi un paragraf de 47 de cuvinte care numeste entitatile.
  '/raspuns/bun': () =>
    pagina(
      'Fixtura raspuns, corecta',
      '<main><h1>Arhiva care raspunde</h1><p>' +
        PARAGRAF_UNU +
        ' ' +
        PARAGRAF_DOI +
        '</p>' +
        umplutura(60) +
        '</main>',
    ),
  // Martor pozitiv: entitatea apare abia dupa 400 de cuvinte.
  '/raspuns/tarziu': () =>
    pagina(
      'Fixtura raspuns, tarziu',
      '<main><h1>Arhiva care raspunde</h1>' +
        '<p>' +
        PARAGRAF_UNU +
        ' ' +
        propozitiiNeutre(3) +
        '</p>' +
        umplutura(55) +
        '<p>' +
        PARAGRAF_DOI +
        '</p></main>',
    ),
  // Martor pozitiv: primul paragraf incepe cu un pronume de reluare, deci nu sta singur.
  '/raspuns/reluare': () =>
    pagina(
      'Fixtura raspuns, cu reluare',
      '<main><h1>Arhiva care raspunde</h1><p>' +
        ['Aceast', 'a'].join('') +
        ' este solutia. ' +
        PARAGRAF_UNU +
        ' ' +
        PARAGRAF_DOI +
        '</p></main>',
    ),
  // Martor pozitiv: primul paragraf are sub 30 de cuvinte.
  '/raspuns/scurt': () =>
    pagina(
      'Fixtura raspuns, scurt',
      '<main><h1>Arhiva care raspunde</h1><p>' + PARAGRAF_UNU + '</p><p>' + PARAGRAF_DOI + '</p></main>',
    ),

  // --- stocare in IndexedDB la incarcare (G-CONS-01 o numara si pe ea) ---------
  // Martor pozitiv: o baza IndexedDB deschisa fara nicio interactiune.
  '/stocare/indexeddb': () =>
    pagina(
      'Fixtura IndexedDB',
      corpCorect() + '<script>indexedDB.open(' + JSON.stringify(['urmarire', 'proba'].join('-')) + ')</script>',
    ),

  // --- fonturile, servite de pe origine sau de la Google ----------------------
  // Martor pozitiv: foaia de stiluri a fonturilor ceruta de la Google la rulare. Proba o blocheaza
  // la retea, deci cererea se vede, dar nu pleaca.
  '/fonturi/google': () =>
    pagina(
      'Fixtura fonturi de la Google',
      '<main><h1 style="font-family:Inter">Arhiva care raspunde</h1><p>' + PARAGRAF_UNU + '</p></main>',
      '<link rel="stylesheet" href="https://' + GAZDA_FONTURI_GOOGLE + '/css2?family=Inter">',
    ),
  // Martor negativ: fontul declarat cu adresa de pe aceeasi origine, ca `next/font`.
  '/fonturi/proprii': () =>
    pagina(
      'Fixtura fonturi proprii',
      '<main><h1 style="font-family:Proprie">Arhiva care raspunde</h1><p>' + PARAGRAF_UNU + '</p></main>',
      '<style>@font-face{font-family:Proprie;src:url(/fonturi/proprie.woff2) format("woff2")}</style>',
    ),

  // --- metadata sociala: og:url = canonical, og:title = titlu, imaginea servita ---
  // Martor negativ: cardul social arata pagina insasi, cu imaginea PNG servita de pe origine.
  '/seo/og-bun': () =>
    pagina('Termenele de pastrare', corpCorect(), metaSociala('/seo/og-bun', 'Termenele de pastrare')),
  // Martor pozitiv: pagina interioara care a mostenit cardul startului (imaginea e buna).
  '/seo/og-mostenit': () =>
    pagina('Termenele de pastrare', corpCorect(), metaSociala('/', 'Arhiva care raspunde', '/seo/og-mostenit')),
  // Martor pozitiv: cardul propriu, dar fara og:image si fara twitter:image - forma pe care o dadea
  // `metadataPagina` inainte de 25.09.2026 (openGraph-ul paginii inlocuia imaginea din layout).
  '/seo/og-fara-imagine': () =>
    pagina(
      'Termenele de pastrare',
      corpCorect(),
      metaSociala('/seo/og-fara-imagine', 'Termenele de pastrare', '/seo/og-fara-imagine', { og: null, card: null }),
    ),
  // Martor pozitiv: etichetele exista, dar imaginea nu se serveste - una da 404, cealalta o pagina HTML.
  '/seo/og-imagine-moarta': () =>
    pagina(
      'Termenele de pastrare',
      corpCorect(),
      metaSociala('/seo/og-imagine-moarta', 'Termenele de pastrare', '/seo/og-imagine-moarta', {
        og: '/seo/imagine-lipsa.png',
        card: '/seo/og-bun',
      }),
    ),
  // Martor pozitiv: og:image se declara image/png dar nu e PNG; twitter:image e un PNG bun, dar pe
  // alta gazda decat canonical-ul (o imagine de la un tert, nu de pe site).
  '/seo/og-imagine-falsa': () =>
    pagina(
      'Termenele de pastrare',
      corpCorect(),
      metaSociala('/seo/og-imagine-falsa', 'Termenele de pastrare', '/seo/og-imagine-falsa', {
        og: CALE_IMAGINE_FALSA,
        card: 'https://' + ['imagini', 'alta-gazda', 'test'].join('.') + CALE_IMAGINE_FIXTURA,
      }),
    ),

  // --- legaturi si imagini --------------------------------------------------
  // Martor pozitiv: legatura interna moarta, ancora inexistenta, imagine fara alt.
  '/legaturi/rau': () =>
    pagina(
      'Fixtura legaturi, defecta',
      '<main><h1>Arhiva care raspunde</h1>' +
        '<p>' +
        PARAGRAF_UNU +
        '</p>' +
        '<a href="/legaturi/ruta-care-nu-exista">Opisul complet</a>' +
        '<a href="#ancora-inexistenta">Sari la termene</a>' +
        '<img src="' +
        PIXEL +
        '" width="40" height="40">' +
        '</main>',
    ),
  '/legaturi/bun': () =>
    pagina(
      'Fixtura legaturi, corecta',
      corpCorect(
        '<a href="/legaturi/bun">Aceeasi pagina</a>' +
          '<a href="#termene">Sari la termene</a>' +
          '<a href="mailto:contact@exemplu-3s.invalid">Scrieti-ne</a>' +
          '<h2 id="termene">Termene</h2>' +
          '<p>' +
          PARAGRAF_DOI +
          '</p>',
      ),
    ),
}

/** Imaginea sociala a fixturilor: PNG-ul de un pixel, servit ca fisier (vezi `RESURSE`). */
const CALE_IMAGINE_FIXTURA = '/seo/imagine.png'
/** Un fisier servit ca image/png, dar care e text: tipul declarat nu ajunge, se cere semnatura. */
const CALE_IMAGINE_FALSA = '/seo/imagine-falsa.png'

/**
 * Canonical-ul si cardul social ale unei fixturi. `caleOg` si `titluOg` sunt ce arata cardul;
 * `caleCanonica` e pagina (implicit aceeasi cu a cardului); `imagini` sunt caile lui og:image si
 * twitter:image (`null` = eticheta lipseste; o adresa intreaga ramane asa). Gazda e rezervata
 * (RFC 2606): proba cere imaginea pe aceeasi cale de la serverul local, nu de la gazda din eticheta.
 */
function metaSociala(
  caleOg: string,
  titluOg: string,
  caleCanonica: string = caleOg,
  imagini: { og: string | null; card: string | null } = { og: CALE_IMAGINE_FIXTURA, card: CALE_IMAGINE_FIXTURA },
): string {
  const gazda = 'https://' + ['fixtura-seo', 'test'].join('.')
  const adresa = (cale: string) => (cale.startsWith('https://') ? cale : gazda + cale)
  return (
    '<link rel="canonical" href="' +
    gazda +
    caleCanonica +
    '">' +
    '<meta property="og:url" content="' +
    gazda +
    caleOg +
    '">' +
    '<meta property="og:title" content="' +
    titluOg +
    '">' +
    (imagini.og === null ? '' : '<meta property="og:image" content="' + adresa(imagini.og) + '">') +
    (imagini.card === null ? '' : '<meta name="twitter:image" content="' + adresa(imagini.card) + '">')
  )
}

/** Fisierele servite ca atare (nu pagini HTML): calea -> tipul si continutul. */
const RESURSE: Record<string, { tip: string; corp: Buffer }> = {
  [CALE_IMAGINE_FIXTURA]: { tip: 'image/png', corp: Buffer.from(PIXEL.slice(PIXEL.indexOf(',') + 1), 'base64') },
  [CALE_IMAGINE_FALSA]: { tip: 'image/png', corp: Buffer.from('<html><body>nu e o imagine</body></html>', 'utf8') },
}

/** Scrie o cheie in stocarea locala (cod JavaScript al fixturii). */
function scrieCheie(cheie: string): string {
  return 'localStorage.setItem(' + JSON.stringify(cheie) + ',"1");'
}

/** La clic pe butonul cu atributul dat: ruleaza `cod`, apoi scoate bannerul. */
function laClic(atribut: string, cod: string): string {
  return (
    'document.querySelector("[' +
    atribut +
    ']").addEventListener("click",function(){' +
    cod +
    'document.querySelector("[data-consimtamant]").remove();});'
  )
}

/** Propozitii fara nicio entitate a fixturilor de raspuns: 8 cuvinte fiecare. */
function propozitiiNeutre(cate: number): string {
  return Array.from({ length: cate }, () => 'Cutiile stau pe rafturi numerotate in depozitul uscat.').join(' ')
}

/** Paragrafe de umplutura, `cate` x 8 cuvinte, fara entitatile fixturilor. */
function umplutura(cate: number): string {
  return '<p>' + propozitiiNeutre(cate) + '</p>'
}

// Butoanele fixturilor de simetrie: aceeasi cutie si acelasi font, trei tratamente. Culorile sunt
// cele ale bannerului real (albastrul site-ului, ceata albastra, textul si chenarul panoului).
const BUTON = 'width:250px;height:42px;font:600 13px/1.15 Arial,sans-serif;border-radius:6px;'
const BUTON_PLIN = BUTON + 'background:#2563eb;color:#ffffff;border:1px solid transparent'
const BUTON_DESCHIS = BUTON + 'background:#f0f4ff;color:#2c2f31;border:1px solid transparent'
const BUTON_CU_CHENAR = BUTON + 'background:#f0f4ff;color:#2c2f31;border:1px solid #667481'
const BUTON_TRANSLUCID = BUTON + 'background:rgba(37,99,235,0.1);color:#2c2f31;border:1px solid transparent'

/** Un banner alb, lipit jos, cu acceptul si refuzul pe acelasi nivel din DOM. */
function bannerSimetrie(stilAccept: string, stilRefuz: string): string {
  return (
    '<section data-consimtamant style="position:fixed;left:0;right:0;bottom:0;padding:16px;background:#ffffff;color:#1a1a1a">' +
    '<p style="margin:0 0 8px;color:#1a1a1a;background:#ffffff">Folosim masurare de trafic.</p>' +
    '<div><button data-accept type="button" style="' +
    stilAccept +
    '">Accept tot</button> <button data-refuz type="button" style="' +
    stilRefuz +
    '">Refuz tot</button></div></section>'
  )
}

function bannerHtml(): string {
  return (
    '<div data-consimtamant style="position:fixed;bottom:0;left:0;right:0;background:#ffffff;color:#1a1a1a">' +
    '<p style="color:#1a1a1a;background:#ffffff">Folosim masurare de trafic.</p>' +
    '<button data-refuz type="button">Refuz tot</button>' +
    '<button data-accept type="button">Accept tot</button>' +
    '</div>'
  )
}

export type ServerFixturi = { baza: string; oprire: () => Promise<void> }

export async function pornesteFixturile(): Promise<ServerFixturi> {
  const server: Server = createServer((cerere, raspuns) => {
    const cale = (cerere.url ?? '/').split('?')[0]
    const resursa = RESURSE[cale]
    if (resursa) {
      raspuns.writeHead(200, { 'content-type': resursa.tip })
      raspuns.end(resursa.corp)
      return
    }
    const constructor = PAGINI[cale]
    if (!constructor) {
      raspuns.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      raspuns.end('Nu exista')
      return
    }
    raspuns.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    raspuns.end(constructor())
  })

  await new Promise<void>((gata) => server.listen(0, '127.0.0.1', gata))
  const adresa = server.address() as AddressInfo
  return {
    baza: 'http://127.0.0.1:' + adresa.port,
    oprire: () => new Promise<void>((gata) => server.close(() => gata())),
  }
}
