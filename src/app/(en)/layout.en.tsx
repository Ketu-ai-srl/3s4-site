import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BRAND } from "@/content/entitate";
import { indexareaEstePermisa } from "@/content/rute";
import { EDITII } from "@/lib/editii";
import { adresaSite } from "@/lib/site";

// Layout-ul RADACINA al editiei `en` (fundatia editiilor, `src/lib/editii.ts`): site-ul international, la
// radacina domeniului. Exista numai pe build-ul cu `SITE_EDITII` care contine `en` (extensia `.en.tsx` e in
// `pageExtensions` doar acolo); pe build-ul romanesc fisierul nu e compilat deloc.
//
// La fundatie are numai scheletul: `<html lang="en">`, corpul si metadata de baza (adresa din `SITE_URL`,
// `og:locale` din catalogul editiilor, neindexarea in afara productiei). Antetul, subsolul, bannerul de
// consimtamant si datele structurate le monteaza feliile urmatoare.

const EDITIE = EDITII.en;

export const metadata: Metadata = {
  metadataBase: new URL(adresaSite()),
  title: {
    default: BRAND.nume,
    template: "%s | " + BRAND.nume,
  },
  robots: indexareaEstePermisa() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: EDITIE.ogLocale,
    siteName: BRAND.nume,
  },
};

export default function RadacinaEn({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={EDITIE.lang}>
      <body>{children}</body>
    </html>
  );
}
