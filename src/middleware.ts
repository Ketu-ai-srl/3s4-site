import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  CALE_EVIDENTA,
  MARIME_MAXIMA,
  prefixRetea,
  randEvidenta,
  valideazaEvidenta,
} from '@/components/consimtamant/evidenta'
import { LimitaRata, adresaClient, citesteCorpLimitat, originePermisa, tipJson } from '@/app/api/formular/garda'
import { stareAnalitica } from '@/lib/analitica'
import { adresaSite } from '@/lib/site'

// Limita de rata a evidentei, una pe proces (garda comuna cu formularul: `src/app/api/formular/garda.ts`).
const LIMITA_EVIDENTA = new LimitaRata()

// EVIDENTA CONSIMTAMANTULUI (felia seo-geo-gdpr, planul valului S4, §9). Site-ul nu are baza de date,
// deci alegerea din banner ajunge ca UN rand JSON in jurnalul serverului, scris de aici. Calea exista
// numai cand analitica e pornita (operator numit + ID GA4, `src/lib/analitica.ts`); altfel cererea
// merge mai departe si primeste 404, ca orice adresa fara pagina. Validarea e stricta si inchisa
// (`src/components/consimtamant/evidenta.ts`): o cerere care nu are exact forma asteptata nu ajunge
// in jurnal. Se scrie prefixul de retea, niciodata adresa IP completa.
//
// GARDA (constatarea de audit 3S4-F-008), inainte de citirea corpului: o cerere de navigator (are
// `Origin`) trebuie sa vina de pe site si sa fie `application/json`, altfel 403; limita de rata pe
// adresa, altfel 429; corpul se citeste in flux, cu oprire la `MARIME_MAXIMA` octeti.
// O cerere FARA `Origin` nu vine dintr-un navigator (acesta il pune la orice POST, inclusiv prin
// `sendBeacon`): pe ea verificarea de origine si de tip nu opreste nimic - clientul si-ar scrie
// singur antetele - iar rata, marimea si validarea stricta raman. Formularul, unde fiecare cerere
// valida pleaca spre o destinatie, respinge si lipsa antetului (`src/app/api/formular/logica.ts`).
async function evidentaConsimtamant(request: NextRequest): Promise<NextResponse> {
  if (request.method !== 'POST') {
    return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } })
  }
  const dinNavigator = request.headers.has('origin')
  if (dinNavigator && (!originePermisa(request, adresaSite()) || !tipJson(request))) {
    return new NextResponse(null, { status: 403 })
  }
  const adresa = adresaClient(request)
  if (!LIMITA_EVIDENTA.permite(adresa)) {
    return new NextResponse(null, {
      status: 429,
      headers: { 'Retry-After': String(LIMITA_EVIDENTA.secundeRamase(adresa)) },
    })
  }
  const citit = await citesteCorpLimitat(request, MARIME_MAXIMA)
  if (citit.stare === 'prea-mare') {
    return new NextResponse(null, { status: 413 })
  }
  if (citit.stare === 'necitit') {
    return new NextResponse(null, { status: 400 })
  }
  let corp: unknown
  try {
    corp = JSON.parse(citit.text)
  } catch {
    return new NextResponse(null, { status: 400 })
  }
  const cerere = valideazaEvidenta(corp)
  if (cerere === null) {
    return new NextResponse(null, { status: 400 })
  }
  const retea = prefixRetea(request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'))
  console.log(randEvidenta(cerere, new Date().toISOString(), retea))
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
}

// Antetul de neindexare se pune peste tot IN AFARA de productie, nu doar cand mediul se
// numeste exact `staging`.
//
// Ce s-a masurat, pe 5 sep 2026, pe porturi distincte si cu control pozitiv (cu BASIC_AUTH
// setat, `staging` chiar da 401, deci mediul chiar ajunsese la proces):
//
//     SITE_ENV=staging    HTTP 401  X-Robots-Tag: noindex, nofollow
//     SITE_ENV=proba      HTTP 200  X-Robots-Tag: ABSENT
//     SITE_ENV=(nesetat)  HTTP 200  X-Robots-Tag: ABSENT
//
// Conditia veche era `!== 'staging'`, iar `src/content/rute.ts` foloseste `=== 'productie'`.
// Nu sunt complemente: orice alta valoare cadea intre ele. Sursa de la construire ramanea
// sigura implicit, deci gaura nu deschidea singura site-ul - dar asta ERA plasa de siguranta
// la rulare, iar cazul pentru care exista (mediul schimbat fara build nou) era chiar cazul
// pe care nu-l acoperea.
//
// Regula, scrisa in directia asta deliberat: implicitul e NEindexarea. O variabila uitata
// trebuie sa lase site-ul in afara indexului, nu in el.
export async function middleware(request: NextRequest) {
  const evidenta = request.nextUrl.pathname === CALE_EVIDENTA && stareAnalitica().activa

  if (process.env.SITE_ENV === 'productie') {
    return evidenta ? evidentaConsimtamant(request) : NextResponse.next()
  }

  // Autentificarea de baza ramane optionala si separata: e o poarta de ACCES, nu de
  // indexare, iar owner-ul a scos-o pentru mediul de proba, care e public.
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS

  if (user && pass) {
    const header = request.headers.get('authorization')
    const asteptat = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64')
    if (header !== asteptat) {
      return new NextResponse('Autentificare necesara', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="3S staging", charset="UTF-8"',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      })
    }
  }

  // Evidenta trece si ea prin autentificarea de mai sus: pe un mediu cu acces restrans, o cerere
  // neautentificata nu are voie sa scrie in jurnal.
  const raspuns = evidenta ? await evidentaConsimtamant(request) : NextResponse.next()
  raspuns.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return raspuns
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
