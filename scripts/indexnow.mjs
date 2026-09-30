#!/usr/bin/env node
// Trimite la IndexNow adresele din harta de site a unui domeniu (motoarele care folosesc protocolul,
// printre ele Bing si Yandex; lista lor e in https://www.indexnow.org/faq, citita pe 2026-09-30).
//
// NU RULEAZA SINGUR. Nimic din site, din build sau din CI nu il cheama: se porneste de mana, la comanda
// dispecerului, pentru un domeniu care a fost publicat. Motivul: o trimitere e o scriere spre motoare
// externe, iar FAQ-ul protocolului cere sa nu se trimita aceeasi adresa de mai multe ori pe zi fara o
// schimbare de continut ("Avoid submitting the same URL many times a day unless there are meaningful
// content changes", https://www.indexnow.org/faq).
//
// FOLOSIRE
//   INDEXNOW_KEY=<cheia domeniului> node scripts/indexnow.mjs https://gazda [--dry-run] [--ignora-robots]
//                                                                 [--endpoint <adresa>]
//   --dry-run         face verificarile si arata ce s-ar trimite, dar nu trimite nimic
//   --ignora-robots   trimite chiar daca `robots.txt` interzice indexarea (implicit se opreste)
//   --endpoint        adresa motorului; implicit `https://api.indexnow.org/indexnow` (pentru probe)
// Cheia vine numai din mediu, aceeasi valoare cu `INDEXNOW_KEY` din aplicatia domeniului: ea e cea pe
// care o serveste `/indexnow.txt` (`src/app/indexnow.txt/route.ts`).
//
// CE FACE, in ordine. Fiecare pas care pica opreste scriptul inainte de orice trimitere:
//   1. cheia are forma ceruta de protocol (8-128 de caractere: a-z, A-Z, 0-9, cratima);
//   2. `<domeniu>/indexnow.txt` raspunde 200 si contine exact cheia (motoarele fac aceeasi verificare si
//      raspund 403 cand nu se potriveste: "key not found, file found but key not in the file");
//   3. `<domeniu>/robots.txt` nu interzice tot: pe mediul de proba interzice, iar adresele lui nu au
//      ce cauta la motoare;
//   4. adresele se iau din `<domeniu>/sitemap.xml`, numai cele de pe acelasi domeniu (motorul raspunde
//      422 la adrese care "don't belong to the host");
//   5. se trimite JSON cu `host`, `key`, `keyLocation` (adresa fisierului-cheie) si `urlList`, cel mult
//      10.000 de adrese pe cerere; peste, in mai multe cereri.
// Protocolul, citit pe 2026-09-30: https://www.indexnow.org/documentation. Un raspuns 200 sau 202
// inseamna primit; 400, 403, 422 si 429 sunt refuzuri si se tiparesc cu sensul din documentatie.
//
// IESIRE: 0 trimis (sau `--dry-run` reusit) · 1 oprit de o verificare sau refuzat de motor · 2 folosire
// gresita · 3 NEMASURAT (reteaua nu a raspuns, deci nu se stie starea).
//
// CE NU VERIFICA. Ca motorul indexeaza adresele: 200 si 202 spun doar ca cererea a fost primita, iar
// verificarea cheii de catre motor poate ramane in asteptare (202). Nu masoara nici ce a intrat in
// index, nici cand.

import { pathToFileURL } from 'node:url'

export const ENDPOINT_IMPLICIT = 'https://api.indexnow.org/indexnow'
export const CALE_CHEIE = '/indexnow.txt'
export const CALE_HARTA = '/sitemap.xml'
export const CALE_ROBOTS = '/robots.txt'
/** Cel mult atatea adrese pe cerere (documentatia protocolului). */
export const MAXIM_PE_CERERE = 10_000
/** Forma cheii; aceeasi expresie ca in `src/app/indexnow.txt/cheie.ts` (proba le cere sa dea acelasi raspuns). */
export const FORMA_CHEIE = /^[A-Za-z0-9-]{8,128}$/

const GAZDE_LOCALE = new Set(['localhost', '127.0.0.1', '[::1]'])
const TERMEN_MS = 20_000

/** Sensul raspunsurilor motorului, cum il scrie documentatia. */
const SENS_RASPUNS = {
  200: 'trimis',
  202: 'primit, verificarea cheii e in asteptare',
  400: 'format invalid',
  403: 'cheie nevalida (nu s-a gasit fisierul, sau fisierul nu contine cheia)',
  422: 'adrese care nu apartin gazdei, sau cheie care nu respecta schema',
  429: 'prea multe cereri (posibil spam)',
}

/** Cheia, fara spatii, sau eroare daca nu are forma cerata. Mesajul nu repeta valoarea. */
export function cheieValida(valoare) {
  const v = (valoare ?? '').trim()
  if (!FORMA_CHEIE.test(v)) {
    throw new Error('cheia IndexNow trebuie sa aiba 8-128 de caractere: litere a-z A-Z, cifre si cratima (are ' + v.length + ')')
  }
  return v
}

/** Originea domeniului: `https://gazda`, fara cale, parametri sau credentiale; `http` doar pe masina locala. */
export function origineDomeniu(text) {
  let adresa
  try {
    adresa = new URL(text)
  } catch {
    throw new Error('domeniul nu e o adresa web: "' + text + '"')
  }
  const local = adresa.protocol === 'http:' && GAZDE_LOCALE.has(adresa.hostname)
  if (adresa.protocol !== 'https:' && !local) {
    throw new Error('domeniul trebuie sa inceapa cu https://, nu "' + text + '"')
  }
  const doarOrigine =
    (adresa.pathname === '/' || adresa.pathname === '') &&
    adresa.search === '' &&
    adresa.hash === '' &&
    adresa.username === '' &&
    adresa.password === ''
  if (!doarOrigine) {
    throw new Error('domeniul trebuie sa fie doar originea (https://gazda), fara cale sau parametri: "' + text + '"')
  }
  return adresa.origin
}

/** Decodifica entitatile XML din text (`&amp;` si celelalte patru, plus cele numerice). */
function decodeazaXml(text) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/**
 * Adresele din harta de site: cele de pe `origine`, fara dubluri, in ordinea din harta, si separat cele
 * straine (alta origine sau nu sunt adrese). O harta-index (`<sitemapindex>`) nu se accepta: locurile ei
 * sunt alte harti, nu pagini.
 * @param {string} xml
 * @param {string} origine
 * @returns {{ proprii: string[], straine: string[] }}
 */
export function adreseDinHarta(xml, origine) {
  if (/<sitemapindex[\s>]/i.test(xml)) {
    throw new Error('harta de site e un index de harti (sitemapindex); scriptul citeste numai o harta cu pagini')
  }
  const proprii = []
  const straine = []
  const vazute = new Set()
  for (const m of xml.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)) {
    const adresa = decodeazaXml(m[1])
    let origineaAdresei = ''
    try {
      origineaAdresei = new URL(adresa).origin
    } catch {
      origineaAdresei = ''
    }
    if (origineaAdresei !== origine) {
      straine.push(adresa)
    } else if (!vazute.has(adresa)) {
      vazute.add(adresa)
      proprii.push(adresa)
    }
  }
  return { proprii, straine }
}

/**
 * `robots.txt` interzice tot pentru `*`? Adevarat cand grupul `*` are `Disallow: /` si nu are `Allow: /`
 * (la lungime egala, Allow bate Disallow: RFC 9309, sectiunea 2.2.2). Pe productie grupul `*` are
 * `Allow: /`; pe mediul de proba are doar `Disallow: /`. Ce nu vede: reguli pe cai anume.
 * @param {string} text
 */
export function robotsInterzice(text) {
  const grupuri = []
  let curent = { agenti: [], reguli: [] }
  for (const linie of text.split(/\r?\n/)) {
    const curata = linie.replace(/#.*$/, '').trim()
    if (curata === '') continue
    const semn = curata.indexOf(':')
    if (semn < 0) continue
    const nume = curata.slice(0, semn).trim().toLowerCase()
    const valoare = curata.slice(semn + 1).trim()
    if (nume === 'user-agent') {
      // Un `User-agent` dupa reguli deschide alt grup; mai multe la rand impart aceleasi reguli.
      if (curent.reguli.length > 0) {
        grupuri.push(curent)
        curent = { agenti: [], reguli: [] }
      }
      curent.agenti.push(valoare.toLowerCase())
    } else if (nume === 'allow' || nume === 'disallow') {
      curent.reguli.push([nume, valoare])
    }
  }
  grupuri.push(curent)
  let interzice = false
  let permite = false
  for (const g of grupuri) {
    if (!g.agenti.includes('*')) continue
    for (const [nume, valoare] of g.reguli) {
      if (nume === 'disallow' && valoare === '/') interzice = true
      if (nume === 'allow' && valoare === '/') permite = true
    }
  }
  return interzice && !permite
}

/**
 * Cererile de trimis: un JSON pe fiecare grupa de cel mult `MAXIM_PE_CERERE` adrese.
 * `host` e gazda domeniului (cu port cand nu e cel implicit), iar `keyLocation` adresa fisierului-cheie.
 * @param {string} origine
 * @param {string} cheie
 * @param {string[]} adrese
 * @param {number} [maxim]
 */
export function cereri(origine, cheie, adrese, maxim = MAXIM_PE_CERERE) {
  const gazda = new URL(origine).host
  const grupe = []
  for (let i = 0; i < adrese.length; i += maxim) {
    grupe.push({ host: gazda, key: cheie, keyLocation: origine + CALE_CHEIE, urlList: adrese.slice(i, i + maxim) })
  }
  return grupe
}

function argumente(argv) {
  const rezultat = { domeniu: null, dryRun: false, ignoraRobots: false, endpoint: ENDPOINT_IMPLICIT, ajutor: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') rezultat.dryRun = true
    else if (a === '--ignora-robots') rezultat.ignoraRobots = true
    else if (a === '--ajutor' || a === '-h' || a === '--help') rezultat.ajutor = true
    else if (a === '--endpoint') {
      const valoare = argv[++i]
      if (valoare === undefined) throw new Error('--endpoint cere o adresa')
      rezultat.endpoint = valoare
    } else if (a.startsWith('--')) throw new Error('optiune necunoscuta: ' + a)
    else if (rezultat.domeniu === null) rezultat.domeniu = a
    else throw new Error('prea multe argumente: ' + a)
  }
  return rezultat
}

/**
 * Rularea scriptului, cu dependentele date din afara (probele le inlocuiesc). Intoarce codul de iesire.
 * @param {{ argv: string[], env: Record<string, string | undefined>, fetch: typeof fetch, spune: (t: string) => void, avertizeaza: (t: string) => void }} intrari
 */
export async function ruleaza({ argv, env, fetch: cere, spune, avertizeaza }) {
  let arg
  let cheie
  let origine
  try {
    arg = argumente(argv)
    if (arg.ajutor) {
      spune('Folosire: INDEXNOW_KEY=<cheia> node scripts/indexnow.mjs https://gazda [--dry-run] [--ignora-robots] [--endpoint <adresa>]')
      return 0
    }
    if (arg.domeniu === null) throw new Error('lipseste domeniul (https://gazda)')
    origine = origineDomeniu(arg.domeniu)
    cheie = cheieValida(env.INDEXNOW_KEY)
  } catch (e) {
    avertizeaza('folosire gresita: ' + (e instanceof Error ? e.message : String(e)))
    return 2
  }

  const ia = async (cale) => {
    const raspuns = await cere(origine + cale, { redirect: 'manual', signal: AbortSignal.timeout(TERMEN_MS) })
    return { stare: raspuns.status, text: await raspuns.text() }
  }

  try {
    const fisier = await ia(CALE_CHEIE)
    if (fisier.stare !== 200 || fisier.text.trim() !== cheie) {
      avertizeaza(
        'oprit: ' + origine + CALE_CHEIE + ' ' + (fisier.stare === 200 ? 'nu contine cheia din INDEXNOW_KEY' : 'a raspuns ' + fisier.stare) +
          '. Motorul ar respinge trimiterea cu 403; se repara intai domeniul (variabila INDEXNOW_KEY si un build nou).',
      )
      return 1
    }
    spune('cheia e servita la ' + origine + CALE_CHEIE)

    const roboti = await ia(CALE_ROBOTS)
    if (roboti.stare === 200 && robotsInterzice(roboti.text)) {
      if (!arg.ignoraRobots) {
        avertizeaza('oprit: ' + origine + CALE_ROBOTS + ' interzice indexarea (Disallow: /), deci e un mediu de proba. --ignora-robots trimite oricum.')
        return 1
      }
      avertizeaza('atentie: robots.txt interzice indexarea, dar --ignora-robots e dat; se trimite oricum')
    }

    const harta = await ia(CALE_HARTA)
    if (harta.stare !== 200) {
      avertizeaza('oprit: ' + origine + CALE_HARTA + ' a raspuns ' + harta.stare)
      return 1
    }
    const { proprii, straine } = adreseDinHarta(harta.text, origine)
    if (proprii.length === 0) {
      avertizeaza('oprit: harta de site nu are nicio adresa de pe ' + origine)
      return 1
    }
    if (straine.length > 0) {
      avertizeaza('atentie: ' + straine.length + ' adrese din harta nu sunt de pe ' + origine + ' si nu se trimit')
    }
    spune(proprii.length + ' adrese de pe ' + origine + ' in harta de site')

    const grupe = cereri(origine, cheie, proprii)
    if (arg.dryRun) {
      spune('--dry-run: nu trimit nimic. Ar pleca ' + grupe.length + ' cerere/cereri catre ' + arg.endpoint + ':')
      for (const g of grupe) {
        spune('  host=' + g.host + ' keyLocation=' + g.keyLocation + ' adrese=' + g.urlList.length + ' (prima: ' + g.urlList[0] + ')')
      }
      return 0
    }

    let refuzat = false
    for (const g of grupe) {
      const raspuns = await cere(arg.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify(g),
        signal: AbortSignal.timeout(TERMEN_MS),
      })
      const sens = SENS_RASPUNS[raspuns.status] ?? 'raspuns neasteptat'
      if (raspuns.status === 200 || raspuns.status === 202) {
        spune(raspuns.status + ' ' + sens + ': ' + g.urlList.length + ' adrese')
      } else {
        refuzat = true
        avertizeaza('refuzat: ' + raspuns.status + ' ' + sens)
      }
    }
    return refuzat ? 1 : 0
  } catch (e) {
    avertizeaza('NEMASURAT: ' + (e instanceof Error ? e.message : String(e)) + ' - nu se stie ce a ajuns la motor')
    return 3
  }
}

// Pornirea din linia de comanda, numai cand fisierul e rulat direct (nu cand il importa o proba).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  ruleaza({
    argv: process.argv.slice(2),
    env: process.env,
    fetch,
    spune: (t) => console.log(t),
    avertizeaza: (t) => console.error(t),
  }).then((cod) => {
    process.exitCode = cod
  })
}
