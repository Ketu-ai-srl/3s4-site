import type { Metadata } from "next";
import { JetBrains_Mono, Marck_Script, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PunctConsimtamant from "@/components/consimtamant/PunctConsimtamant";
import Antet from "@/components/global/Antet";
import Subsol from "@/components/global/Subsol";
import TranzitieVedere from "@/components/global/TranzitieVedere";
import DateStructurateSite from "@/components/seo/DateStructurateSite";
import { META_ACASA } from "@/content/acasa";
import { BRAND } from "@/content/entitate";
import { indexareaEstePermisa } from "@/content/rute";
import { adresaSite } from "@/lib/site";

// Layout-ul comun (directia REF-N, ADR-0007): fonturile, antetul, subsolul si tranzitia de vedere.
//
// FONTURILE sunt gazduite de site: `next/font` le descarca la construire si le serveste de pe
// acelasi domeniu, deci vizitatorul nu face nicio cerere catre un tert (poarta C-01).
//   - Plus Jakarta Sans, variabil (200-800), latin + latin-ext pentru diacritice: tot textul;
//   - varianta italica, fara preincarcare: doar subtitlurile cinema o folosesc;
//   - JetBrains Mono: tastele, rutele din paleta, orele si numele de fisiere din machete;
//   - Marck Script, fara preincarcare: randul scris de mana din duelul constructorului
//     (acasa-constructor.md §1.2). Fara preincarcare, se descarca numai pe pagina care il foloseste.

const jakarta = Plus_Jakarta_Sans({
  variable: "--fnt-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jakartaItalic = Plus_Jakarta_Sans({
  variable: "--fnt-jakarta-italic",
  subsets: ["latin", "latin-ext"],
  style: ["italic"],
  display: "swap",
  preload: false,
});

const mono = JetBrains_Mono({
  variable: "--fnt-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mana = Marck_Script({
  variable: "--fnt-mana",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  preload: false,
});

// METADATA (planul valului S4, §8.1). `metadataBase` vine din `SITE_URL` (`src/lib/site.ts`), deci
// canonical-urile relative ale paginilor devin absolute pe adresa site-ului, iar la lansare se muta
// toate impreuna. Open Graph si cardul social au aici valorile STARTULUI, fiindca pagina de start nu
// le declara singura; paginile interioare le dau prin `metadataPagina` (`src/components/seo/`), iar
// proba de browser cere ca pe fiecare pagina `og:url` sa fie canonical-ul, `og:title` titlul, iar
// og:image si twitter:image sa raspunda 200 image/png. Imaginea sociala o pune Next din
// `src/app/opengraph-image.tsx` numai pe paginile care nu-si declara `openGraph` (startul, pagina
// de negasit); `metadataPagina` o da explicit interioarelor. Verificarea Search Console se scrie numai
// cand `GOOGLE_SITE_VERIFICATION` exista in mediu (pasul owner-ului, `docs/ziua-operatorului.md`).
const VERIFICARE_GOOGLE = (process.env.GOOGLE_SITE_VERIFICATION ?? "").trim();

export const metadata: Metadata = {
  metadataBase: new URL(adresaSite()),
  title: {
    default: META_ACASA.titlu,
    template: "%s | 3S",
  },
  description: META_ACASA.descriere,
  robots: indexareaEstePermisa() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: BRAND.nume,
    title: META_ACASA.titlu,
    description: META_ACASA.descriere,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: META_ACASA.titlu,
    description: META_ACASA.descriere,
  },
  ...(VERIFICARE_GOOGLE === "" ? {} : { verification: { google: VERIFICARE_GOOGLE } }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fonturi = [jakarta.variable, jakartaItalic.variable, mono.variable, mana.variable].join(" ");
  return (
    <html lang="ro" className={fonturi}>
      <body>
        <a className="sari-la-continut" href="#zona-continut">
          Săriți la conținut
        </a>
        <Antet />
        <div id="zona-continut" tabIndex={-1}>
          {children}
        </div>
        <Subsol />
        <TranzitieVedere />
        <DateStructurateSite />
        <PunctConsimtamant />
      </body>
    </html>
  );
}
