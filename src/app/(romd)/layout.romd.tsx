import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import BaraMobil from "@/components/canale/BaraMobil";
import PunctConsimtamant from "@/components/consimtamant/PunctConsimtamant";
import Antet from "@/components/global/Antet";
import { CULOARE_MARCA } from "@/components/global/culoare-marca";
import Subsol from "@/components/global/Subsol";
import TranzitieVedere from "@/components/global/TranzitieVedere";
import DateStructurateSite from "@/components/seo/DateStructurateSite";
import { BRAND } from "@/content/entitate";
import { navigatieRoMd } from "@/content/navigatie-ro-md";
import { indexareaEstePermisa } from "@/content/rute";
import { EDITII } from "@/lib/editii";
import { CLASE_FONTURI } from "@/lib/fonturi";
import { adresaSite } from "@/lib/site";

// Layout-ul RADACINA al editiei `ro-MD` (fundatia editiilor, `src/lib/editii.ts`): romana pentru Republica
// Moldova, sub `/ro` pe domeniul international. Exista numai pe build-ul cu `SITE_EDITII` care contine `ro-MD`
// (extensia `.romd.tsx`); pe build-ul romanesc fisierul nu e compilat deloc.
//
// Ce monteaza (felia navigatie-pe-editie): fonturile si stilurile globale ale site-ului, antetul, subsolul,
// sertarul si paleta cu contractul RO-MD (`src/content/navigatie-ro-md.ts`), bara de canale de pe mobil si
// datele structurate ale site-ului. Canalele se rezolva AICI, pe server, din `CANALE_JSON`. Bannerul de
// consimtamant il monteaza felia masurarii, nu aceasta.
//
// Ca pe layout-ul RO si pe cel EN (decizia 53, aceeasi experienta): culoarea marcii in bara navigatorului
// (`viewport.themeColor`) si tranzitia de vedere la navigarea client (`TranzitieVedere`, oprita la miscare redusa).

const EDITIE = EDITII["ro-MD"];

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

export const viewport: Viewport = {
  themeColor: CULOARE_MARCA,
};

export default function RadacinaRoMd({ children }: Readonly<{ children: ReactNode }>) {
  const navigatie = navigatieRoMd();
  return (
    <html lang={EDITIE.lang} className={CLASE_FONTURI}>
      <body>
        <a className="sari-la-continut" href="#zona-continut">
          Sari la conținut
        </a>
        <Antet navigatie={navigatie} />
        <div id="zona-continut" tabIndex={-1}>
          {children}
        </div>
        <Subsol navigatie={navigatie} />
        <TranzitieVedere />
        <PunctConsimtamant limba="ro" />
        <BaraMobil bara={navigatie.bara} />
        <DateStructurateSite />
      </body>
    </html>
  );
}
