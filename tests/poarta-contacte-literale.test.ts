import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { numarAfisat } from '@/content/canale'
import { configurareCanale } from '@/lib/canale-mediu'

/**
 * POARTA CONTACTELOR LITERALE. Contactele operatorului (adresa contact@, numarul in forma afisata si in forma
 * E.164, legatura wa.me) nu se scriu literal in sursa site-ului: vin din mediu (`OPERATOR_JSON`, `CANALE_JSON`),
 * ca acelasi cod sa ruleze pe doua domenii cu contacte diferite. O valoare scrisa literal ar ramane pe pagina
 * celuilalt domeniu fara niciun semnal.
 *
 * TIPARUL NU E LARG. Se cauta NUMAI valorile operatorului, citite din profilurile de construire
 * (`config/profil-*.json`), nu orice prefix de tara: numerele autoritatilor din textele juridice (de pilda
 * linia de contact a autoritatii de protectie a datelor) raman literale si nu inroseste nimic. Martorul de
 * mai jos o masoara cu un numar de autoritate plantat langa cel al operatorului.
 *
 * CE SE CITESTE: fisierele urmarite de git din `src/` si `config/`, cu comentariile scoase din cod
 * (`.ts`, `.tsx`, `.js`, `.mjs`): un comentariu nu ajunge pe pagina. Probele (`tests/`) si documentatia nu sunt
 * sursa site-ului, deci nu se citesc.
 *
 * EXCEPTARILE sunt pe CALE EXACTA, fiecare cu motivul ei (lista `EXCEPTARI`); cele temporare spun ce fisier din
 * afara feliei cere mutarea. Tabelele de destinatari din textele juridice sunt exceptate numai in TABELUL care
 * numeste furnizorul DNS (ancora): obiectul `tabel: { ... }` de pe randul ancorei, cu acoladele echilibrate. Un
 * rand de sursa poate tine toata sectiunea (paragraful de dinainte si tabelul), deci exceptarea pe tot randul ar fi
 * acoperit si proza; restul randului si restul documentului raman masurate (martorul pe modulul real, mai jos).
 *
 * LIMITA DECLARATA: scoaterea comentariilor e lexicala (siruri, sabloane, comentarii si expresii regulate aflate
 * dupa un operator sau o paranteza), nu un analizor TypeScript. O impartire scrisa fara spatiu dupa un nume
 * (`a/b`) e citita corect; o expresie regulata dupa un cuvant cheie (`return /x/`) nu e recunoscuta, iar o
 * ghilimea din ea poate ascunde restul randului. Directia erorii e spre mai putine gasiri, deci martorul
 * pozitiv de mai jos se face pe un modul real, nu pe un text sintetic.
 *
 * Fixturile cazurilor pozitive se asambleaza la rulare, din bucati; proba nu poarta literal ce vaneaza.
 */

const RADACINA = join(__dirname, '..')

type Fisier = { cale: string; text: string }
type Exceptare = { cale: string; motiv: string; ancora?: string }
type Gasire = { cale: string; rand: number; valoare: string }

/** Profilurile de construire scrise in depozit: sursa valorilor, deci exceptate prin definitie. */
function profiluri(): string[] {
  return execFileSync('git', ['ls-files', 'config'], { cwd: RADACINA, encoding: 'utf8' })
    .split('\n')
    .filter((c) => /^config\/profil-[^/]+\.json$/.test(c))
}

/** Valorile operatorului dintr-un profil: adresele contact@, numarul afisat si E.164, wa.me/<cifre>. */
export function valoriProfil(profil: Record<string, unknown>): string[] {
  const valori = new Set<string>()
  const op = (profil.OPERATOR_JSON as { operator?: Record<string, string> | null } | undefined)?.operator
  if (op) {
    if (op.email?.startsWith('contact@')) valori.add(op.email)
    if (op.telefon) valori.add(op.telefon)
  }
  if (profil.CANALE_JSON !== undefined) {
    const canale = configurareCanale(JSON.stringify(profil.CANALE_JSON), '')
    if (canale.telefon) {
      valori.add(canale.telefon)
      valori.add(numarAfisat(canale))
    }
    if (canale.whatsapp) valori.add('wa.me/' + canale.whatsapp)
    if (canale.email.startsWith('contact@')) valori.add(canale.email)
  }
  return [...valori].filter((v) => v !== '')
}

/** Codul fara comentarii, cu randurile pastrate (un comentariu bloc devine randuri goale). */
export function faraComentarii(text: string): string {
  let iesire = ''
  let i = 0
  const n = text.length
  while (i < n) {
    const c = text[i]
    const d = text[i + 1]
    if (c === '/' && d === '/') {
      while (i < n && text[i] !== '\n') i++
      continue
    }
    if (c === '/' && d === '*') {
      i += 2
      while (i < n && !(text[i] === '*' && text[i + 1] === '/')) {
        if (text[i] === '\n') iesire += '\n'
        i++
      }
      i += 2
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1
      while (j < n && text[j] !== c) j += text[j] === '\\' ? 2 : 1
      iesire += text.slice(i, j + 1)
      i = j + 1
      continue
    }
    // Literal de expresie regulata (dupa un operator sau o paranteza deschisa): copiat intreg, ca ghilimelele
    // din el (`/[!'()*]/g`) sa nu deschida un sir fals.
    if (c === '/' && /[(,=:[!&|?{};+\n]$|^$/.test(iesire.trimEnd().slice(-1))) {
      let j = i + 1
      let clasa = false
      while (j < n && text[j] !== '\n' && (clasa || text[j] !== '/')) {
        if (text[j] === '\\') j++
        else if (text[j] === '[') clasa = true
        else if (text[j] === ']') clasa = false
        j++
      }
      iesire += text.slice(i, j + 1)
      i = j + 1
      continue
    }
    iesire += c
    i++
  }
  return iesire
}

const COD = /\.(ts|tsx|js|mjs)$/

/**
 * Intervalele [inceput, sfarsit) ale obiectelor `tabel: { ... }` de pe un rand care contin ancora: acoladele se
 * numara in afara sirurilor. Un obiect neinchis pe rand nu da interval (directia erorii: mai multe gasiri).
 */
export function tabeleCuAncora(rand: string, ancora: string): [number, number][] {
  const intervale: [number, number][] = []
  let de = rand.indexOf('tabel:')
  while (de >= 0) {
    const a = rand.indexOf('{', de)
    if (a < 0) break
    let i = a
    let adancime = 0
    for (; i < rand.length; i++) {
      const c = rand[i]
      if (c === '"' || c === "'" || c === '`') {
        let j = i + 1
        while (j < rand.length && rand[j] !== c) j += rand[j] === '\\' ? 2 : 1
        i = j
        continue
      }
      if (c === '{') adancime++
      else if (c === '}' && --adancime === 0) break
    }
    if (adancime !== 0) break
    if (rand.slice(a, i + 1).includes(ancora)) intervale.push([a, i + 1])
    de = rand.indexOf('tabel:', i + 1)
  }
  return intervale
}

/** Randul cu tabelele ancorelor acoperite cu spatii (lungimea si pozitiile raman). */
function faraTabeleExceptate(rand: string, ancore: readonly string[]): string {
  let iesire = rand
  for (const ancora of ancore) {
    for (const [a, b] of tabeleCuAncora(rand, ancora)) iesire = iesire.slice(0, a) + ' '.repeat(b - a) + iesire.slice(b)
  }
  return iesire
}

/** Gasirile: fiecare aparitie a unei valori, pe cale si rand, in afara exceptarilor. */
export function cautaContacte(fisiere: readonly Fisier[], valori: readonly string[], exceptari: readonly Exceptare[]): Gasire[] {
  const gasiri: Gasire[] = []
  for (const f of fisiere) {
    const pe = exceptari.filter((e) => e.cale === f.cale)
    if (pe.some((e) => e.ancora === undefined)) continue
    const text = COD.test(f.cale) ? faraComentarii(f.text) : f.text
    const ancore = pe.map((e) => e.ancora).filter((x): x is string => x !== undefined)
    text.split('\n').forEach((brut, k) => {
      const rand = faraTabeleExceptate(brut, ancore)
      for (const v of valori) {
        let de = rand.indexOf(v)
        while (de >= 0) {
          gasiri.push({ cale: f.cale, rand: k + 1, valoare: v })
          de = rand.indexOf(v, de + v.length)
        }
      }
    })
  }
  return gasiri
}

/** Registrele de afirmatii exceptate trebuie sa ramana nerandate: niciun import din cod. */
export function importaRegistru(fisiere: readonly Fisier[], registru: string): string[] {
  const nume = registru.split('/').pop() as string
  return fisiere
    .filter((f) => COD.test(f.cale) && f.cale !== registru)
    .filter((f) => faraComentarii(f.text).split('\n').some((r) => r.includes(nume) && /\b(import|require)\b|from\s/.test(r)))
    .map((f) => f.cale)
}

const ANCORA_DNS = '"Cloudflare, Inc."'

export const REGISTRE = ['src/content/afirmatii/en-nucleu.json', 'src/content/afirmatii/ro-md-acasa-contact.json']

export const EXCEPTARI: readonly Exceptare[] = [
  ...REGISTRE.map((cale) => ({
    cale,
    motiv: 'registru de afirmatii: nerandat (niciun import din cod, masurat mai jos), il citesc numai probele',
  })),
  ...['src/content/juridic/md/confidentialitate.ro.ts', 'src/content/juridic/md/confidentialitate.en.ts'].map((cale) => ({
    cale,
    ancora: ANCORA_DNS,
    motiv: 'tabelul destinatarilor (sectiunea 5), numai obiectul tabelului: DNS-ul si posta unui domeniu anume sunt diferenta de fond, asteapta juristul',
  })),
  ...['src/content/juridic/md/subimputerniciti.ro.ts', 'src/content/juridic/md/subimputerniciti.en.ts'].map((cale) => ({
    cale,
    ancora: ANCORA_DNS,
    motiv: 'tabelul B al furnizorilor: aceiasi destinatari legati de domeniu ca in politica de confidentialitate, asteapta juristul',
  })),
  ...['config/seo/en-nucleu.json', 'config/seo/ro-md-acasa-contact.json'].map((cale) => ({
    cale,
    motiv:
      'TEMPORAR: declaratiile G-AI-02 ale paginilor de contact; le citesc ca JSON brut, pe langa tests/browser/ajutor/raspunsuri.ts, si tests/browser/congruenta.spec.ts (declaratiiEn) si tests/browser/ro-md-acasa-contact.spec.ts (DECLARATII), deci un numar luat din profil cere si acele doua fisiere, in afara feliei',
  })),
]

function fisiereUrmarite(): Fisier[] {
  return execFileSync('git', ['ls-files', 'src', 'config'], { cwd: RADACINA, encoding: 'utf8' })
    .split('\n')
    .filter((c) => c !== '' && /\.(ts|tsx|js|mjs|json|md|mdx|css|txt|svg|html)$/.test(c))
    .map((cale) => ({ cale, text: readFileSync(join(RADACINA, cale), 'utf8') }))
}

function valoriReale(): string[] {
  return [...new Set(profiluri().flatMap((p) => valoriProfil(JSON.parse(readFileSync(join(RADACINA, p), 'utf8')) as Record<string, unknown>)))]
}

// Bucatile fixturilor, lipite la rulare.
const NUMAR_OPERATOR = ['+373', '60', '055', '599'].join(' ')
const NUMAR_AUTORITATE = ['+373', '22', '820', '801'].join(' ')
const ADRESA = ['contact', ['3s', 'md'].join('.')].join('@')

describe('poarta contactelor literale', () => {
  const valori = valoriReale()
  const fisiere = fisiereUrmarite()

  it('controlul citirii: profilul 3s.md da cele patru forme, iar lista fisierelor contine modulele de contact', () => {
    expect(profiluri()).toContain('config/profil-3s-md.json')
    expect(valori).toEqual(expect.arrayContaining([ADRESA, NUMAR_OPERATOR, NUMAR_OPERATOR.replace(/ /g, ''), 'wa.me/' + NUMAR_OPERATOR.replace(/\D/g, '')]))
    const cai = fisiere.map((f) => f.cale)
    expect(cai).toEqual(expect.arrayContaining(['src/content/en/pricing.ts', 'src/content/juridic/md/termeni.ro.ts', 'config/profil-3s-md.json']))
    expect(fisiere.length).toBeGreaterThan(300)
  })

  it('arborele curat: zero contacte literale in sursa site-ului, in afara exceptarilor', () => {
    const exceptari = [...EXCEPTARI, ...profiluri().map((cale) => ({ cale, motiv: 'sursa valorilor' }))]
    expect(cautaContacte(fisiere, valori, exceptari)).toEqual([])
  })

  it('exceptarile sunt pe cai care exista, fiecare cu motiv; registrele raman nerandate; ancora are inca ce acoperi', () => {
    const cai = new Set(fisiere.map((f) => f.cale))
    for (const e of EXCEPTARI) {
      expect(cai.has(e.cale), e.cale).toBe(true)
      expect(e.motiv.length, e.cale).toBeGreaterThan(20)
    }
    for (const r of REGISTRE) expect(importaRegistru(fisiere, r), r).toEqual([])
    // O ancora care nu mai acopera nimic e o exceptare moarta: se scoate.
    for (const e of EXCEPTARI.filter((x) => x.ancora !== undefined)) {
      const f = fisiere.find((x) => x.cale === e.cale) as Fisier
      expect(cautaContacte([f], valori, []).length, e.cale).toBeGreaterThan(0)
    }
  })

  it('martor POZITIV: numarul operatorului plantat intr-o copie a unui modul de continut e prins, cu calea si randul', () => {
    const cale = 'src/content/en/pricing.ts'
    const original = readFileSync(join(RADACINA, cale), 'utf8')
    const randuri = original.split('\n')
    const k = randuri.findIndex((r) => r.includes('h1: "'))
    expect(k).toBeGreaterThan(0)
    randuri[k] = randuri[k].replace('h1: "', 'h1: "' + NUMAR_OPERATOR + ' ')
    const g = cautaContacte([{ cale, text: randuri.join('\n') }], valori, EXCEPTARI)
    expect(g).toEqual([{ cale, rand: k + 1, valoare: NUMAR_OPERATOR }])
    expect(cautaContacte([{ cale, text: original }], valori, EXCEPTARI)).toEqual([])
  })

  it('martor NEGATIV al tiparului larg: un numar de autoritate cu acelasi prefix nu e prins', () => {
    const text = 'export const x = "' + NUMAR_AUTORITATE + '";\n'
    expect(cautaContacte([{ cale: 'src/content/x.ts', text }], valori, [])).toEqual([])
    expect(cautaContacte([{ cale: 'src/content/x.ts', text: text + 'export const y = "' + NUMAR_OPERATOR + '";\n' }], valori, [])).toHaveLength(1)
  })

  it('fiecare forma e prinsa: adresa, E.164, wa.me; intr-un JSON si intr-un .tsx', () => {
    const e164 = NUMAR_OPERATOR.replace(/ /g, '')
    const wa = 'https://wa.me/' + e164.slice(1)
    const tsx = '<a href="' + wa + '">' + ADRESA + '</a>; const t = "' + e164 + '";'
    expect(cautaContacte([{ cale: 'src/components/x.tsx', text: tsx }], valori, []).map((g) => g.valoare).sort()).toEqual(
      [ADRESA, e164, 'wa.me/' + e164.slice(1)].sort(),
    )
    expect(cautaContacte([{ cale: 'config/x.json', text: '{"a": "' + ADRESA + '"}' }], valori, [])).toHaveLength(1)
  })

  it('comentariile nu sunt sursa: in comentariu nu e prins, in sirul de pe acelasi rand da', () => {
    const text = '// ' + NUMAR_OPERATOR + '\n/* ' + ADRESA + ' */\nconst a = "x"; // ' + ADRESA + '\nconst b = "// nu e comentariu ' + ADRESA + '";\n'
    expect(cautaContacte([{ cale: 'src/x.ts', text }], valori, [])).toEqual([{ cale: 'src/x.ts', rand: 4, valoare: ADRESA }])
    // Intr-un fisier care nu e cod, nimic nu e comentariu.
    expect(cautaContacte([{ cale: 'src/x.md', text }], valori, [])).toHaveLength(4)
    // O expresie regulata cu ghilimea in ea nu deschide un sir fals care ar inghiti comentariul de dupa
    // (cazul real: `codifica` din src/content/canale.ts).
    const cuRegex = 'const r = s.replace(/[!' + "'" + '()*]/g, f);\n/** (`' + NUMAR_OPERATOR + '`) */\nconst z = "' + ADRESA + '";\n'
    expect(cautaContacte([{ cale: 'src/x.ts', text: cuRegex }], valori, [])).toEqual([{ cale: 'src/x.ts', rand: 3, valoare: ADRESA }])
  })

  it('exceptarea e pe CALE EXACTA si, cu ancora, numai in tabelul ancorei', () => {
    const text = '{"text": "' + NUMAR_OPERATOR + '"}'
    expect(cautaContacte([{ cale: REGISTRE[0], text }], valori, EXCEPTARI)).toEqual([])
    expect(cautaContacte([{ cale: 'src/content/afirmatii/alt-registru.json', text }], valori, EXCEPTARI)).toHaveLength(1)
    const cale = 'src/content/juridic/md/confidentialitate.ro.ts'
    // Pe ACELASI rand de sursa: paragraful (prins), tabelul cu ancora (exceptat, si pe alt rand al tabelului decat
    // cel al ancorei), un al doilea tabel fara ancora (prins); apoi alt rand de sursa (prins).
    const tabel = (randuri: string) => 'tabel: { titlu: "x {", randuri: alese([' + randuri + ']) }'
    const primul =
      'const t = { paragrafe: ["' + NUMAR_OPERATOR + '"], a: ' +
      tabel('["' + ANCORA_DNS.slice(1, -1) + '", "' + ADRESA + '"], ["Alt furnizor", "' + NUMAR_OPERATOR + '"]') +
      ', b: ' + tabel('["Alt furnizor", "' + ADRESA + '"]') + ' };'
    const doc = primul + '\nconst u = "' + ADRESA + '";\n'
    const gasite = cautaContacte([{ cale, text: doc }], valori, EXCEPTARI).map((g) => g.rand + ' ' + g.valoare)
    expect(gasite.sort()).toEqual(['1 ' + NUMAR_OPERATOR, '1 ' + ADRESA, '2 ' + ADRESA].sort())
    // Controlul intervalului: un singur tabel acoperit, cel cu ancora (acolada din sirul titlului nu conteaza).
    expect(tabeleCuAncora(primul, ANCORA_DNS)).toHaveLength(1)
  })

  it('martor pe modulul REAL: pe randul care tine sectiunea 5, un numar plantat in paragraf e prins, unul in tabel nu', () => {
    for (const cale of ['src/content/juridic/md/confidentialitate.ro.ts', 'src/content/juridic/md/confidentialitate.en.ts']) {
      const randuri = readFileSync(join(RADACINA, cale), 'utf8').split('\n')
      const k = randuri.findIndex((r) => r.includes(ANCORA_DNS))
      expect(k, cale).toBeGreaterThan(0)
      // Paragraful sta pe acelasi rand de sursa, inaintea tabelului.
      const p = randuri[k].indexOf('paragrafe: ["')
      expect(p, cale).toBeGreaterThan(-1)
      expect(randuri[k].indexOf('tabel: {'), cale).toBeGreaterThan(p)
      const inParagraf = [...randuri]
      inParagraf[k] = inParagraf[k].replace('paragrafe: ["', 'paragrafe: ["' + NUMAR_OPERATOR + ' ')
      expect(cautaContacte([{ cale, text: inParagraf.join('\n') }], valori, EXCEPTARI), cale).toEqual([{ cale, rand: k + 1, valoare: NUMAR_OPERATOR }])
      const inTabel = [...randuri]
      inTabel[k] = inTabel[k].replace(ANCORA_DNS, ANCORA_DNS + ', "' + NUMAR_OPERATOR + '"')
      expect(inTabel[k], cale).not.toBe(randuri[k])
      expect(cautaContacte([{ cale, text: inTabel.join('\n') }], valori, EXCEPTARI), cale).toEqual([])
    }
  })

  it('martorul registrelor: un import al registrului din cod invalideaza exceptarea', () => {
    const cod = 'import r from "@/content/afirmatii/en-nucleu.json";\n'
    expect(importaRegistru([{ cale: 'src/content/x.ts', text: cod }], REGISTRE[0])).toEqual(['src/content/x.ts'])
    expect(importaRegistru([{ cale: 'src/content/x.ts', text: '// vezi en-nucleu.json\n' }], REGISTRE[0])).toEqual([])
  })
})
