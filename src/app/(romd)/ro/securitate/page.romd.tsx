// Pagina despre 3S a editiei `ro-MD` (P11, `/ro/securitate` pe 3s.md): aceleasi componente si aceeasi compunere ca
// pagina RO `/securitate` (`src/app/securitate/page.tsx`) si ca perechea EN (`src/app/(en)/about/page.en.tsx`,
// decizia 53), cu textul editiei din `src/content/ro-md/securitate-componente.ts`.
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/p11.json`):
//   PaginaSecuritate (EroulInterior, Piloni, Infrastructura, Verificare, [StocareProprie: d43], [Criptare: d31],
//   [Acces: d43, d31], Ciclu, Reglementare, [Originale: poarta juridica 40-41], [Raportare: d31], Intrebari,
//   [Seif: poarta juridica 40-41, d31]).
// Ca pe RO si pe EN, pagina n-are bloc de final; canalul WhatsApp al paginii (`[ref:ro-md-securitate]`) ramane in antet
// si in bara de pe mobil.
//
// ANCORELE `security` si `limits`, ca pe EN: componenta se randeaza in trei bucati, cu cate un marcaj gol, fara clasa si
// fara inaltime, inaintea blocului de infrastructura si inaintea intrebarilor; radacinile de sectiune raman aceleasi.
//
// Nodul FAQPage se construieste aici, din intrebarile VIZIBILE. Firul il emite `FirPagina` (BreadcrumbList), cu
// eticheta lui implicita, in romana.

import type { Metadata } from "next";
import { Fragment } from "react";
import PaginaSecuritate from "@/components/produs/PaginaSecuritate";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { OPERATOR_SECURITATE_BUILD, pagina } from "@/content/ro-md/securitate";
import { BUCATI_SECURITATE_RO_MD, ETICHETA_VERIFICARE_RO_MD, securitateRoMd } from "@/content/ro-md/securitate-componente";
import { adresaSite } from "@/lib/site";
import VerificareBrowserRoMd from "../_editie/VerificareBrowserRoMd";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

const CONTINUT = securitateRoMd(OPERATOR_SECURITATE_BUILD);

/** Nodul FAQPage: intrebarile si raspunsurile vizibile ale sectiunii de intrebari, exact. */
function nodFaq(): NodJsonLd {
  const pag = adresaSite() + pagina.meta.cale;
  return {
    "@type": "FAQPage",
    "@id": pag + "#intrebari",
    url: pag,
    name: CONTINUT.intrebari!.titlu,
    inLanguage: "ro-MD",
    mainEntity: CONTINUT.intrebari!.intrebari.map((i) => ({
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

export default function PaginaSecuritateRoMd() {
  return (
    <main>
      {BUCATI_SECURITATE_RO_MD.map((b, i) => (
        <Fragment key={i}>
          {b.ancora === null ? null : <div id={b.ancora} aria-hidden="true" />}
          <PaginaSecuritate
            continut={CONTINUT}
            sectiuni={b.sectiuni}
            etichetaVerificare={ETICHETA_VERIFICARE_RO_MD}
            verificare={<VerificareBrowserRoMd />}
          />
        </Fragment>
      ))}
      <JsonLd date={{ "@context": "https://schema.org", "@graph": [...noduriPagina(), nodFaq()] }} />
    </main>
  );
}
