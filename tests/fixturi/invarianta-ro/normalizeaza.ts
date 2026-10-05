// Forma canonica a HTML-ului construit, pentru proba de invarianta a build-ului RO (tests/invarianta-ro.test.ts).
//
// DE CE EXISTA. Build-ul Next 15.5 NU e determinist, nici la octet, nici ca structura, si asta e MASURAT pe arborele
// bazei, nu presupus:
//   - id-ul build-ului e altul la fiecare build si apare in doua forme (in comentariul HTML Next scrie cratima ca
//     linie de subliniere);
//   - numele fisierelor statice cu amprenta (`static/css/...`, `static/chunks/...`) se schimba cand se schimba
//     continutul lor, iar fluxul RSC al paginii e taiat in mai multe `<script>` la pozitii fixe, deci un nume poate
//     fi rupt in doua (masurat: `.../page-...` cu coada in scriptul urmator);
//   - IMPARTIREA CSS-ULUI: din 7 build-uri ale bazei, unul a incarcat pe start 5 foi de stil in loc de 4 (o foaie de
//     54 KB impartita in doua), iar din 10 build-uri reci ale feliei, doua; odata cu foaia in plus, fluxul RSC are un
//     rand in plus si TOATE id-urile randurilor de dupa el se renumeroteaza, iar ordinea randurilor se schimba;
//   - SERIALIZAREA RSC: acelasi element sta intr-un build in randul parintelui, in altul intr-un rand propriu,
//     referit (masurat pe doua build-uri reci ale feliei, ambele cu 4 foi de stil pe start).
//   - ID-URILE DE MODUL SI DE CHUNK din randurile de referinta client (`I[<modul>,["<chunk>","static/chunks/...",...],
//     "<export>"]`) depind de calea la care se rezolva node_modules: acelasi arbore, construit cu node_modules prin
//     jonctiune, a dat alte id-uri pe toate cele 5 pagini-martor (74 de siruri diferite pe contact, 138 pe start, toate
//     id-uri, zero text). Dedus si nemasurat: si o actualizare de dependinta le renumeroteaza;
//   - ANUL DIN SUBSOL e calculat la build (`new Date().getFullYear()`), deci primul build din anul urmator ar schimba
//     toate paginile fara nicio schimbare de cod.
// Forma canonica scoate exact aceste surse de zgomot si nimic din continut:
//   1. id-ul build-ului, in ambele forme, si anul din subsol (`(c) <an>` devine `(c) AN`, in DOM si in fluxul RSC;
//      restul textului de langa an ramane comparat);
//   2. bucatile fluxului RSC se lipesc la loc, apoi numele statice cu amprenta devin `static/<tip>/X`;
//   3. prefixul de producator din numele pictogramei pentru ecranul de start al telefoanelor devine un substituent
//      fix (numele e pe lista de cuvinte pe care fabrica nu le lasa in fisierele urmarite, iar fixturile sunt
//      urmarite; prefixul e o constanta a platformei, deci inlocuirea nu ascunde nicio schimbare);
//   4. DOM-ul (HTML-ul fara scripturile RSC): fiecare sir de legaturi de stil consecutive devine o singura marca;
//   5. fluxul RSC: fara legaturile de stil si fara indiciile de preincarcare CSS, se pastreaza MULTIMEA sirurilor de
//      text din el (texte, clase, adrese, proprietati), sortata, plus randurile text intregi; referintele dintre
//      randuri (`$<id>`, `$L<id>`, `$@<id>`, `$W<id>`...) nu intra. Dintr-un rand de referinta client intra numai numele
//      exportului (`default`, `Image`...), fara id-ul modulului si fara lista de chunk-uri. Un text, o clasa sau o
//      adresa schimbata se vede.
// CE NU MAI MASOARA proba, prin constructie: cate foi de stil incarca o pagina si in ce ordine, structura fluxului
// RSC (ce element sta in ce rand), CONTINUTUL CSS-ului, ce chunk-uri incarca o componenta client si anul din
// subsol. Rest declarat, nu scapare: toate variaza intre build-uri ale aceluiasi arbore (anul, intre ani). DOM-ul, adica ce primeste un om sau un robot fara JavaScript, ramane comparat
// caracter cu caracter.
//
// Fisierul e importat si de proba, si de comanda care produce fixturile pe BAZA (`genereaza.mjs`): aceeasi functie
// de ambele parti, altfel proba ar compara doua normalizari diferite.

const BS = String.fromCharCode(92)
/** Ghilimeaua escapata, asa cum sta in textul fluxului RSC din HTML. */
const Q = BS + '"'
const LIPITURA_RSC = '"])</script><script>self.__next_f.push([1,"'
const STATIC_CU_AMPRENTA = /static\/(css|chunks)\/[^"'\s)\\]+/g
const PREFIX_PICTOGRAMA = /\b[a-z]+-(touch-icon|icon\.png)/g
const SCRIPT_RSC = /<script>self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g
const SIR_STIL_DOM = /(<link rel="stylesheet" href="\/_next\/static\/css\/X" data-precedence="next"\/>)+/g
/** Separatorul de randuri al fluxului: BS + n, nepreceduat de alt BS (acela ar fi un rand nou scris in text). */
const SEPARATOR = new RegExp('(?<!' + BS + BS + ')' + BS + BS + 'n')
/** Un id de rand lipit de textul unui rand `T` (randurile text au lungime si nu se termina cu separator). */
const ID_LIPIT = /([^0-9a-f])([0-9a-f]+):(?=\[|I\[|T[0-9a-f]+,|"|\{|null)/g
const RAND = /^([0-9a-f]+):([\s\S]*)$/
/** O referinta intre randuri (`$<id>`, `$L<id>`...) sau spre o parte dintr-un rand (`$<id>:props:children...`). */
const REFERINTA_INTREAGA = /^\$(L|@|W|Q|K|F)?[0-9a-f]+(:|$)/
/** Ghilimeaua care deschide sau inchide un sir (cea din interiorul unui sir e precedata de inca doua BS). */
const GHILIMEA_EXTERIOARA = new RegExp('(?<!' + BS + BS + BS + BS + ')' + BS + BS + '"')
const LEGATURA_STIL = '[' + Q + '$' + Q + ',' + Q + 'link' + Q + ','
const REL_STIL = Q + 'rel' + Q + ':' + Q + 'stylesheet' + Q
const STIL_INLINE = new RegExp(
  ',?' + BS + '[' + BS + BS + '"' + BS + '$' + BS + BS + '",' + BS + BS + '"link' + BS + BS + '",' + BS + BS + '"[0-9]+' + BS + BS + '",' +
    BS + '{' + BS + BS + '"rel' + BS + BS + '":' + BS + BS + '"stylesheet[^' + BS + ']]*' + BS + ']',
  'g',
)
const INDICIU_CSS = ':HL[' + Q + '/_next/static/css/'
/** Anul din subsol, `(c) <an>` (semnul de drepturi de autor, U+00A9). */
const AN_SUBSOL = /\u00a9 \d{4}/g
/** Clasa variabilei de font de la next/font/google, `__variable_<6 hex>`: amprenta depinde de fisierul de font descarcat
 *  de la Google la build, nu de arbore (05.10.2026: acelasi arbore a dat a76894... la 15:57Z si 16fca7... la 17:32Z,
 *  41 de pagini-martor rosii fara nicio schimbare de cod). Numele fontului ramane in CSS; aici se scoate numai amprenta. */
const FONT_VARIABILA = /__variable_[0-9a-f]{6}\b/g
/** Capul unui rand de referinta client: `I[<id modul>,[<chunk-uri si cai>],` (sirurile din lista n-au paranteze). */
const CAP_CLIENT = new RegExp('^I' + BS + '[[0-9a-z]+,' + BS + '[[^' + BS + ']]*' + BS + '],')

/** Forma canonica: DOM-ul, apoi sirurile fluxului RSC, sortate, cate unul pe linie. */
export function normalizeaza(html: string, idBuild: string): string {
  const id = idBuild.trim()
  if (id === '') throw new Error('normalizeaza: id-ul build-ului e gol, deci nu s-ar scoate nimic')
  const text = html
    .split(id)
    .join('ID-BUILD')
    .split(id.replace(/-/g, '_'))
    .join('ID-BUILD')
    .split(LIPITURA_RSC)
    .join('')
    .replace(STATIC_CU_AMPRENTA, 'static/$1/X')
    .replace(PREFIX_PICTOGRAMA, 'pictograma-telefon-$1')
    .replace(AN_SUBSOL, '\u00a9 AN')
    .replace(FONT_VARIABILA, '__variable_X')

  const bucati: string[] = []
  const dom = text.replace(SCRIPT_RSC, (_, c: string) => {
    bucati.push(c)
    return '<script>RSC</script>'
  })

  const perechi = bucati
    .join('')
    .replace(ID_LIPIT, (_, inainte: string, rand: string) => inainte + BS + 'n' + rand + ':')
    .split(SEPARATOR)
    .filter((r) => r !== '')
    .map((r): [string | null, string] => {
      const m = RAND.exec(r)
      return m ? [m[1], m[2]] : [null, r]
    })
  const iduriStil = new Set(perechi.filter(([idr, c]) => idr !== null && c.startsWith(LEGATURA_STIL) && c.includes(REL_STIL)).map(([idr]) => idr as string))
  const siruri: string[] = []
  for (const c of perechi
    .filter(([idr]) => idr === null || !iduriStil.has(idr))
    .map(([, c]) => c)
    .filter((c) => !c.startsWith(INDICIU_CSS))) {
    const fara = c.replace(STIL_INLINE, '').replace(CAP_CLIENT, 'I[X,[],')
    const randText = /^T[0-9a-f]+,/.exec(fara)
    if (randText) {
      siruri.push(fara)
      continue
    }
    fara.split(GHILIMEA_EXTERIOARA).forEach((bucata, i) => {
      if (i % 2 === 1 && !REFERINTA_INTREAGA.test(bucata)) siruri.push(bucata)
    })
  }
  siruri.sort()

  return dom.replace(SIR_STIL_DOM, '<link rel="stylesheet" CSS/>') + '\n--- fluxul RSC, sirurile sortate ---\n' + siruri.join('\n') + '\n'
}

/** Paginile-martor: calea publica si fisierul prerandat din `.next/server/app`. */
export const PAGINI_MARTOR: readonly { cale: string; fisier: string }[] = [
  { cale: '/', fisier: 'index.html' },
  { cale: '/preturi', fisier: 'preturi.html' },
  { cale: '/contact', fisier: 'contact.html' },
  { cale: '/blog', fisier: 'blog.html' },
  { cale: '/_not-found', fisier: '_not-found.html' },
  // Rutele-martor ale congruentei editiilor: fiecare pagina RO prerandata care importa, direct sau prin alte
  // componente, un fisier pe care il vor atinge feliile de mecanism pe editie (piesele startului, primitivele
  // firului si ale eroului interior, produs, enterprise, contact, preturi, cinema, comparatii, termene,
  // e-facturare). Lista e inchiderea tranzitiva a importurilor pana la `src/app/**/page.tsx`, fara paginile
  // `.en`/`.romd`; din rutele dinamice intra cate un reprezentant (un articol, a doua pagina a blogului).
  // `/juridic/*` nu are HTML pe build-ul fara operator, deci nu e aici.
  { cale: '/accesibilitate', fisier: 'accesibilitate.html' },
  { cale: '/blog/registrul-de-evidenta-a-arhivei', fisier: 'blog/registrul-de-evidenta-a-arhivei.html' },
  { cale: '/blog/categorie/contabilitate', fisier: 'blog/categorie/contabilitate.html' },
  { cale: '/blog/categorie/it', fisier: 'blog/categorie/it.html' },
  { cale: '/blog/categorie/juridic', fisier: 'blog/categorie/juridic.html' },
  { cale: '/blog/categorie/management', fisier: 'blog/categorie/management.html' },
  { cale: '/blog/pagina/2', fisier: 'blog/pagina/2.html' },
  { cale: '/comparatie-drive', fisier: 'comparatie-drive.html' },
  { cale: '/comparatie-stocare', fisier: 'comparatie-stocare.html' },
  { cale: '/descarca', fisier: 'descarca.html' },
  { cale: '/e-facturare', fisier: 'e-facturare.html' },
  { cale: '/enterprise', fisier: 'enterprise.html' },
  { cale: '/flux-documente', fisier: 'flux-documente.html' },
  { cale: '/functionalitati/aplicatie-mobila', fisier: 'functionalitati/aplicatie-mobila.html' },
  { cale: '/functionalitati/automatizari-ai', fisier: 'functionalitati/automatizari-ai.html' },
  { cale: '/functionalitati/cautare-ai', fisier: 'functionalitati/cautare-ai.html' },
  { cale: '/functionalitati/e-facturi-si-avize', fisier: 'functionalitati/e-facturi-si-avize.html' },
  { cale: '/functionalitati/portal-clienti', fisier: 'functionalitati/portal-clienti.html' },
  { cale: '/functionalitati/semnatura-calificata', fisier: 'functionalitati/semnatura-calificata.html' },
  { cale: '/harta-site', fisier: 'harta-site.html' },
  { cale: '/inregistrare', fisier: 'inregistrare.html' },
  { cale: '/instrumente/termene-pastrare', fisier: 'instrumente/termene-pastrare.html' },
  { cale: '/instrumente/termene-pastrare/tipar', fisier: 'instrumente/termene-pastrare/tipar.html' },
  { cale: '/integrari', fisier: 'integrari.html' },
  { cale: '/platforma', fisier: 'platforma.html' },
  { cale: '/securitate', fisier: 'securitate.html' },
  { cale: '/solutii', fisier: 'solutii.html' },
  { cale: '/solutii/asigurari', fisier: 'solutii/asigurari.html' },
  { cale: '/solutii/avocatura', fisier: 'solutii/avocatura.html' },
  { cale: '/solutii/constructii', fisier: 'solutii/constructii.html' },
  { cale: '/solutii/contabilitate', fisier: 'solutii/contabilitate.html' },
  { cale: '/solutii/imobiliare', fisier: 'solutii/imobiliare.html' },
  { cale: '/solutii/logistica', fisier: 'solutii/logistica.html' },
  { cale: '/solutii/notariate', fisier: 'solutii/notariate.html' },
]
