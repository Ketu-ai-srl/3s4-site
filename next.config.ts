import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import { AVERTISMENT_FARA_OPERATOR, rescrieriAnalitica, stareAnaliticaProprie } from './src/components/analitica/config'
import { alegeOperator, operatorComplet } from './src/lib/operator'
import { VARIABILA_OPERATOR_NUMIT, operatorNumitInMediu } from './src/lib/operator-mediu'
import { VARIABILA_FAMILIE_JURIDICA, familieJuridica } from './src/content/juridic/familie'

// De ce e `output` conditionat: pe Windows fara drept de legaturi simbolice,
// `standalone` cade cu EPERM la copierea fisierelor urmarite (masurat 2026-09-05,
// symlink react -> .next/standalone). Build-ul care conteaza pentru livrare ruleaza
// in Docker si in CI, ambele pe Linux, si acolo variabila e pornita.
const standalone = process.env.BUILD_STANDALONE === '1'

// ANTETELE DE SECURITATE, pe toate caile (constatarea de audit 3S4-F-007). Se scriu aici si nu in
// middleware fiindca middleware-ul nu vede `_next/static` (vezi `matcher`), iar un antet care
// lipseste pe o parte din raspunsuri e o regula cu gauri.
//
// CSP-ul e IMPUS, dar numai cu directivele care nu ating scripturile: `frame-ancestors`,
// `object-src`, `base-uri`, `form-action`. O politica `script-src` cu nonce ar cere nonce-ul pe
// fiecare cerere, deci toate paginile ar deveni dinamice; ramane pas separat, intai in Report-Only.
//
// HSTS numai pe productie: pe mediul de proba domeniul se poate muta, iar un navigator care a
// primit HSTS pe o gazda refuza apoi http pe ea un an. `SITE_ENV` se citeste la CONSTRUIRE (antetele
// intra in manifestul build-ului), la fel ca pentru indexare (`src/content/rute.ts`).
export const CSP = ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"].join('; ')
export const HSTS = 'max-age=31536000; includeSubDomains'

export function anteteSecuritate(mediu: string | undefined = process.env.SITE_ENV): { key: string; value: string }[] {
  const antete = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Content-Security-Policy', value: CSP },
  ]
  if (mediu === 'productie') antete.push({ key: 'Strict-Transport-Security', value: HSTS })
  return antete
}

// Avertismentul despre analitica fara operator iese o singura data pe proces: Next cheama `rewrites()` de doua
// ori intr-un build (o data pentru rutele personalizate, o data pentru manifestul tipurilor de rute; masurat pe
// 30.09.2026, avertismentul aparea de doua ori in jurnalul build-ului).
let avertizatFaraOperator = false

/** Valoarea lui `NEXT_PUBLIC_FAMILIE_JURIDICA`: familia operatorului rezolvat, sau "null" fara operator complet. */
function familieCalculata(): string {
  const operator = alegeOperator().operator
  return operatorComplet(operator) ? familieJuridica(operator) : 'null'
}

const nextConfig: NextConfig = {
  output: standalone ? 'standalone' : undefined,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: anteteSecuritate() }]
  },
  // OPERATORUL, PENTRU PACHETUL DE BROWSER (felia multi-domeniu, runda 1 de reparatii). Next inlocuieste in
  // pachetul de browser numai variabilele `NEXT_PUBLIC_*`, deci `OPERATOR_JSON` nu ajunge acolo, iar lista de
  // rute din browser (`RUTE`, folosita de cautarea Ctrl+K) decidea dupa `config/operator.json`: pe un domeniu
  // cu operatorul numai in mediu, serverul avea cele opt pagini juridice, dar cautarea nu le gasea. Valoarea de
  // mai jos ("true" / "false" cand `OPERATOR_JSON` e setata, "null" cand nu e) e inlocuita de Next in TOATE
  // pachetele, iar `src/content/juridic/publicare.ts` o citeste inaintea variabilei si a fisierului. Cheia e
  // definita mereu, chiar pe "null": o valoare pusa de altcineva in mediul build-ului n-are cum s-o inlocuiasca.
  // Se citeste la CONSTRUIRE, ca tot ce tine de operator (`src/lib/operator-mediu.ts`).
  // FAMILIA TEXTELOR JURIDICE (felia 73, `src/content/juridic/familie.ts`): "see", "md" sau "null" (niciun
  // operator complet), din operatorul REZOLVAT (`OPERATOR_JSON`, altfel fisierul), citita LITERAL in
  // `src/content/juridic/publicare.ts`. Definita mereu, ca si cheia de mai sus; un operator dintr-o tara fara
  // familie opreste construirea chiar aici, cu mesajul despre reprezentant.
  env: {
    [VARIABILA_OPERATOR_NUMIT]: String(operatorNumitInMediu()),
    [VARIABILA_FAMILIE_JURIDICA]: familieCalculata(),
  },
  // ANALITICA PROPRIE PE CALE PROPRIE (felia multi-domeniu): cu `UMAMI_URL` si `UMAMI_WEBSITE_ID` in
  // mediu SI cu un operator numit si complet (planul §9: analitica prelucreaza date personale, deci cere
  // operator, ca GA4), `/a/script.js` si `/a/api/send` sunt transmise de serverul site-ului spre instanta de
  // statistica, deci browserul nu vorbeste niciodata cu alta origine (poarta C-01). Fara variabile sau fara
  // operator, lista e goala si nu exista nicio rescriere; cu variabilele date si operatorul lipsa, jurnalul
  // build-ului spune de ce (o singura data). Se citesc la CONSTRUIRE (`src/components/analitica/config.ts`);
  // o valoare gresita opreste construirea inainte de compilare, cu sau fara operator.
  async rewrites() {
    const cuOperator = operatorComplet(alegeOperator().operator)
    const stare = stareAnaliticaProprie(process.env, cuOperator)
    if (!stare.activa && stare.motiv === 'fara-operator' && !avertizatFaraOperator) {
      avertizatFaraOperator = true
      console.warn('[analitica] ' + AVERTISMENT_FARA_OPERATOR)
    }
    return rescrieriAnalitica(process.env, cuOperator)
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
