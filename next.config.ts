import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

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

const nextConfig: NextConfig = {
  output: standalone ? 'standalone' : undefined,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: anteteSecuritate() }]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
