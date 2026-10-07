// Pagina despre 3S, editia `en` (P11, `/about`): aceleasi componente si aceeasi compunere ca pagina RO `/securitate`
// (`src/app/securitate/page.tsx`, decizia 53), cu textul in engleza din `src/content/en/despre-componente.ts`.
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/p11.json`):
//   PaginaSecuritate (EroulInterior, Piloni, Infrastructura, Verificare, [StocareProprie: d43], [Criptare: d31],
//   [Acces: d43, d31], Ciclu, Reglementare, [Originale: poarta juridica 40-41], [Raportare: d31], Intrebari,
//   [Seif: poarta juridica 40-41, d31]).
// Ca pe RO, pagina n-are bloc de final: acolo seiful ii tine locul, iar seiful nu se monteaza pe 3s.md. Canalul
// WhatsApp al paginii (`[ref:en-about]`) ramane in antet si in bara de pe mobil.
//
// Verificarea din browser primeste invelitoarea EN (`VerificareBrowserEn`), cu textul care spune ca masoara acest
// site (intrebarea 9, decizia 59).
//
// ANCORELE `security` si `limits` (tinte ale legaturilor de pe start, din subsol, de pe alte pagini EN si de pe /ro):
// componenta nu are proprietate de ancora, iar id-urile blocurilor ei sunt cele RO (le compara semnatura de forma).
// Pagina randeaza deci componenta in trei bucati, cu cate un marcaj gol, fara clasa si fara inaltime, inaintea
// blocului de infrastructura si inaintea intrebarilor. Fragmentele nu adauga niciun element, deci radacinile de
// sectiune raman aceleasi, in aceeasi ordine; regula globala `[id]` da marcajului marginea de sub antetul fix.
//
// Numele paginii "Legal information" din piloni si din raspunsul "Who runs 3S?" devine legatura la randare
// (`legaturaInText`); textul ramane sir, deci FAQPage are acelasi raspuns.
//
// Metadata, nodul WebPage si registrul de afirmatii vin din `about.ts`; nodul FAQPage se construieste aici, din
// intrebarile VIZIBILE. Firul il emite `FirPagina` (BreadcrumbList), deci nodul BreadcrumbList al modulului nu se mai
// pune. Organizatia si site-ul le pune layout-ul.

import type { Metadata } from "next";
import { Fragment } from "react";
import PaginaSecuritate from "@/components/produs/PaginaSecuritate";
import VerificareBrowserEn from "@/components/produs/VerificareBrowserEn";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { pagina } from "@/content/en/about";
import { LEGATURA_INFORMATII_LEGALE_EN } from "@/content/en/contact-componente";
import {
  BUCATI_DESPRE_EN,
  DESPRE_EN,
  ETICHETA_FIR_DESPRE_EN,
  ETICHETA_VERIFICARE_EN,
} from "@/content/en/despre-componente";
import { adresaSite } from "@/lib/site";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

/** Nodul FAQPage: intrebarile si raspunsurile vizibile ale sectiunii de intrebari, exact. */
function nodFaq(): NodJsonLd {
  const pag = adresaSite() + pagina.meta.cale;
  return {
    "@type": "FAQPage",
    "@id": pag + "#intrebari",
    url: pag,
    name: DESPRE_EN.intrebari!.titlu,
    inLanguage: "en",
    mainEntity: DESPRE_EN.intrebari!.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  } as NodJsonLd;
}

/** Nodurile modulului, fara BreadcrumbList (il emite firul) si fara trimiterea la el. */
function noduriPagina(): NodJsonLd[] {
  return (pagina.jsonLd as NodJsonLd[])
    .filter((n) => n["@type"] !== "BreadcrumbList" && n["@type"] !== "FAQPage")
    .map((n) => {
      const copie: Record<string, unknown> = { ...n };
      delete copie.breadcrumb;
      return copie as NodJsonLd;
    });
}

export default function PaginaDespreEn() {
  return (
    <main>
      {BUCATI_DESPRE_EN.map((b, i) => (
        <Fragment key={i}>
          {b.ancora === null ? null : <div id={b.ancora} aria-hidden="true" />}
          <PaginaSecuritate
            continut={DESPRE_EN}
            sectiuni={b.sectiuni}
            etichetaFir={ETICHETA_FIR_DESPRE_EN}
            etichetaVerificare={ETICHETA_VERIFICARE_EN}
            verificare={<VerificareBrowserEn />}
            legaturaInText={LEGATURA_INFORMATII_LEGALE_EN}
          />
        </Fragment>
      ))}
      <JsonLd date={{ "@context": "https://schema.org", "@graph": [...noduriPagina(), nodFaq()] }} />
    </main>
  );
}
