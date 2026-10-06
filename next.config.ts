import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import { AVERTISMENT_FARA_OPERATOR, rescrieriAnalitica, stareAnaliticaProprie } from './src/components/analitica/config'
import { alegeOperator, operatorComplet } from './src/lib/operator'
import { VARIABILA_OPERATOR_NUMIT, operatorNumitInMediu } from './src/lib/operator-mediu'
import { VARIABILA_FAMILIE_JURIDICA, familieJuridica } from './src/content/juridic/familie'
import { EDITII, VARIABILA_EDITII_PUBLICA, cuNegasitGlobal, editiiDinText, extensiiPagini, origineSite, perechiAlternate, problemeCoerenta, type CodEditie } from './src/lib/editii'
import { ASEZARI, VARIABILA_ASEZARE_PUBLICA, asezareDinText, problemeAsezare, redirectariAsezare, type CodAsezare } from './src/lib/asezare'

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

// LIMBA CONTINUTULUI pe editie (felia metadata-hreflang): `Content-Language` spune limba raspunsului, pe
// fiecare cale. Pe build-ul international: limba editiei de la radacina (`en`) pe tot domeniul, iar sub prefixul
// editiei RO-MD (`/ro` si tot ce e sub el) codul ei, `ro-MD`. Regula prefixului vine DUPA cea generala: cand doua
// reguli pun aceeasi cheie pe aceeasi cale, Next o pastreaza pe ultima. Pe build-ul romanesc (`ro-RO`) nu se pune
// nimic: antetele lui raman cele de dinainte de editii.
// ASEZAREA (`src/lib/asezare.ts`) decide prefixul si codul: pe `md` (implicitul) sunt chiar cele din catalogul
// editiilor, deci regulile raman cele de azi; pe `ro` romana (continutul `ro-MD`) sta la radacina cu `ro-RO`, iar
// engleza sub `/en`, cu `en`.
export function anteteLimba(
  editii: readonly CodEditie[],
  asezare: CodAsezare = 'md',
): { source: string; headers: { key: string; value: string }[] }[] {
  if (editii.includes('ro-RO')) return []
  const reguli: { source: string; headers: { key: string; value: string }[] }[] = []
  for (const cod of editii) {
    const { prefix, inLanguage } = cod === 'ro-RO' ? EDITII[cod] : ASEZARI[asezare][cod]
    const antet = [{ key: 'Content-Language', value: inLanguage }]
    if (prefix === '') reguli.unshift({ source: '/:path*', headers: antet })
    else reguli.push({ source: prefix, headers: antet }, { source: prefix + '/:cale*', headers: antet })
  }
  return reguli
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

// EDITIILE (fundatia editiilor, `src/lib/editii.ts`): ce arbori de pagini exista in acest build, din
// `SITE_EDITII` citita la CONSTRUIRE. Pe profilul implicit (`ro-RO`) `pageExtensions` e lista de dinainte de
// editii si nu exista nicio cheie `experimental`, deci build-ul romanesc iese identic (proba
// `tests/invarianta-ro.test.ts`). Pe profilul international `tsx` simplu iese din lista: arborele romanesc nu
// se construieste, raman `page.en.tsx` / `page.romd.tsx` si rutele `.ts`, iar 404-ul vine din
// `global-not-found.en.tsx`. Un profil gresit, sau o lista de alternate care numeste domeniul pentru o limba
// pe care profilul implicit nu o are, opreste construirea aici, inainte de compilare.
const SITE_EDITII_SCRISA = (process.env.SITE_EDITII ?? '').trim() !== ''
const EDITII_BUILD = editiiDinText(process.env.SITE_EDITII)
const BAZA_SITE = origineSite(process.env.SITE_URL)
if (BAZA_SITE !== null) {
  const probleme = problemeCoerenta(EDITII_BUILD, perechiAlternate(process.env.SITE_ALTERNATE), BAZA_SITE, SITE_EDITII_SCRISA)
  if (probleme.length > 0) throw new Error(probleme.join(' | '))
}
// Profilul pentru pachetul de browser (vezi `env` mai jos). O valoare pusa din afara in mediu, diferita de profilul
// calculat, ar ajunge in pachete langa `pageExtensions` calculate din `SITE_EDITII`: serverul ar construi un site,
// iar lista de rute din browser ar descrie altul. Construirea se opreste.
const EDITII_PUBLICE = EDITII_BUILD.join(',')
const EDITII_PUSE_DIN_AFARA = (process.env[VARIABILA_EDITII_PUBLICA] ?? '').trim()
if (EDITII_PUSE_DIN_AFARA !== '' && EDITII_PUSE_DIN_AFARA !== EDITII_PUBLICE) {
  throw new Error(
    VARIABILA_EDITII_PUBLICA + '="' + EDITII_PUSE_DIN_AFARA + '" e pusa in mediu, dar profilul calculat din SITE_EDITII e "' + EDITII_PUBLICE +
      '". Variabila nu se seteaza de mana: o calculeaza next.config.ts. Se sterge din mediu.',
  )
}

// ASEZAREA (`src/lib/asezare.ts`): unde se servesc editiile internationale. Implicitul `md` e asezarea de azi si nu
// adauga nimic in obiectul de configurare: pe 3s.md si pe site-ul romanesc obiectul ramane cheie cu cheie cel de
// dinainte (proba `tests/multi-domeniu-operator.test.ts` cere exact cheile `env`). Numai pe `ro` (romana la
// radacina, engleza sub `/en`) apar cheia `NEXT_PUBLIC_SITE_ASEZARE` in `env`, ca browserul sa traduca la fel ca
// serverul, si redirectarile permanente ale vechilor adrese `/ro`. O valoare necunoscuta, o asezare `ro` pe alt profil
// decat `en,ro-MD`, sau o valoare publica pusa din afara si diferita de cea calculata opresc construirea aici.
// Tot asezarea alege arborele construit (`pageExtensions`: pe `ro` numai fisierele-geamana `*.comro.tsx` din grupurile
// `(comro)` si `(comroen)`, deci aceleasi module servite la alte adrese) si `Content-Language` pe prefix (`anteteLimba`).
const ASEZARE_BUILD = asezareDinText(process.env.SITE_ASEZARE)
const problemeAsezareBuild = problemeAsezare(ASEZARE_BUILD, EDITII_BUILD)
if (problemeAsezareBuild.length > 0) throw new Error(problemeAsezareBuild.join(' | '))
const ASEZARE_PUSA_DIN_AFARA = (process.env[VARIABILA_ASEZARE_PUBLICA] ?? '').trim()
if (ASEZARE_PUSA_DIN_AFARA !== '' && ASEZARE_PUSA_DIN_AFARA !== ASEZARE_BUILD) {
  throw new Error(
    VARIABILA_ASEZARE_PUBLICA + '="' + ASEZARE_PUSA_DIN_AFARA + '" e pusa in mediu, dar asezarea calculata din SITE_ASEZARE e "' + ASEZARE_BUILD +
      '". Variabila nu se seteaza de mana: o calculeaza next.config.ts. Se sterge din mediu.',
  )
}
const REDIRECTARI_ASEZARE = redirectariAsezare(ASEZARE_BUILD)

const nextConfig: NextConfig = {
  output: standalone ? 'standalone' : undefined,
  pageExtensions: extensiiPagini(EDITII_BUILD, ASEZARE_BUILD),
  ...(cuNegasitGlobal(EDITII_BUILD) ? { experimental: { globalNotFound: true } } : {}),
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: anteteSecuritate() }, ...anteteLimba(EDITII_BUILD, ASEZARE_BUILD)]
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
  // EDITIILE PENTRU PACHETUL DE BROWSER (`NEXT_PUBLIC_SITE_EDITII`): profilul validat, in ordinea canonica, citit
  // LITERAL de `editiiBuild()`. Definit numai pe un profil diferit de cel implicit: pe `ro-RO` browserul cade singur
  // pe implicit (nicio variabila), iar cheile de pe build-ul romanesc raman cele de dinainte de editii (proba
  // `tests/multi-domeniu-operator.test.ts` le cere exact). O valoare pusa din afara, diferita, opreste construirea (mai sus).
  env: {
    [VARIABILA_OPERATOR_NUMIT]: String(operatorNumitInMediu()),
    [VARIABILA_FAMILIE_JURIDICA]: familieCalculata(),
    ...(EDITII_PUBLICE === 'ro-RO' ? {} : { [VARIABILA_EDITII_PUBLICA]: EDITII_PUBLICE }),
    ...(ASEZARE_BUILD === 'md' ? {} : { [VARIABILA_ASEZARE_PUBLICA]: ASEZARE_BUILD }),
  },
  // Redirectarile asezarii (numai pe `ro`; pe `md` cheia nu exista deloc).
  ...(REDIRECTARI_ASEZARE.length === 0 ? {} : { redirects: async () => REDIRECTARI_ASEZARE }),
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
