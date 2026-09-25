import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  CALE_EVIDENTA,
  MARIME_MAXIMA,
  prefixRetea,
  randEvidenta,
  valideazaEvidenta,
} from '@/components/consimtamant/evidenta'
import { stareAnalitica } from '@/lib/analitica'

// EVIDENTA CONSIMTAMANTULUI (felia seo-geo-gdpr, planul valului S4, §9). Site-ul nu are baza de date,
// deci alegerea din banner ajunge ca UN rand JSON in jurnalul serverului, scris de aici. Calea exista
// numai cand analitica e pornita (operator numit + ID GA4, `src/lib/analitica.ts`); altfel cererea
// merge mai departe si primeste 404, ca orice adresa fara pagina. Validarea e stricta si inchisa
// (`src/components/consimtamant/evidenta.ts`): o cerere care nu are exact forma asteptata nu ajunge
// in jurnal. Se scrie prefixul de retea, niciodata adresa IP completa.
async function evidentaConsimtamant(request: NextRequest): Promise<NextResponse> {
  if (request.method !== 'POST') {
    return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } })
  }
  const lungime = Number(request.headers.get('content-length') ?? '0')
  if (lungime > MARIME_MAXIMA) {
    return new NextResponse(null, { status: 413 })
  }
  const text = await request.text()
  if (text.length > MARIME_MAXIMA) {
    return new NextResponse(null, { status: 413 })
  }
  let corp: unknown
  try {
    corp = JSON.parse(text)
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
