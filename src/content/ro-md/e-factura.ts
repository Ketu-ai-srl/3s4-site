// Pagina "Arhiva e-Factura" a editiei `ro-MD` (`/ro/e-factura` pe 3s.md; geamana `/e-factura` pe 3s.com.ro): arhivarea
// automata a facturilor din RO e-Factura, serviciu in pregatire, cu inscriere la acces timpuriu pe WhatsApp.
//
// Textul vizibil sta in `e-factura-componente.ts`; modulul de fata e partea pe care o citesc metadata, nodul WebPage,
// textul precompletat al conversatiei si registrul de afirmatii. `sectiuni` urmeaza titlurile paginii, in ordinea de
// citire, cu primul paragraf al fiecareia. Pagina n-are pereche EN (cheia exista numai pe editia ro-MD).

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { atributeLimba } from "@/lib/asezare";
import { adresaSite } from "@/lib/site";
import { CALE_EFACTURA_RO_MD, EFACTURA_RO_MD, REF_EFACTURA_RO_MD } from "./e-factura-componente";

const BAZA = adresaSite();
const ID = iduri(BAZA);
const C = EFACTURA_RO_MD;
const REF = REF_EFACTURA_RO_MD;

const TITLU = "Arhiva e-Factura: facturile din SPV, păstrate ani la rând | 3S";
const DESCRIERE =
  "3S descarcă zilnic facturile tale din RO e-Factura, înainte să se închidă fereastra de 60 de zile, și le păstrează cu XML-ul original. Acces timpuriu.";

const fraza = (f: { accent: string; rest: string }) => f.accent + (f.rest.startsWith(",") || f.rest.startsWith(" ") ? "" : " ") + f.rest;

export const pagina: PaginaContinut = {
  cheie: "e-factura",
  meta: { titlu: TITLU, descriere: DESCRIERE, cale: CALE_EFACTURA_RO_MD },
  h1: C.erou.titlu,
  capsula: C.erou.subtitlu,
  sectiuni: [
    { cheie: "fereastra", titlu: C.fereastra.titlu, blocuri: [{ paragrafe: [C.fereastra.paragrafe[0]] }] },
    { cheie: "pasi", titlu: C.pasi.titlu, blocuri: [{ paragrafe: [], lista: { numerotata: true, elemente: C.pasi.pasi.map(fraza) } }] },
    { cheie: "primesti", titlu: C.primesti.titlu, blocuri: [{ paragrafe: [], lista: { elemente: C.primesti.elemente.map(fraza) } }] },
    { cheie: "contabili", titlu: C.contabili.titlu, blocuri: [{ paragrafe: [C.contabili.text] }] },
    { cheie: "locul-datelor", titlu: C.siguranta.titlu, blocuri: [{ paragrafe: [], lista: { elemente: C.siguranta.elemente } }] },
    { cheie: "preturi", titlu: C.preturi.titlu, blocuri: [{ paragrafe: [C.preturi.nota] }] },
    { cheie: "intrebari", titlu: C.intrebari.titlu, blocuri: [{ paragrafe: C.intrebari.intrebari.map((i) => i.intrebare) }] },
  ],
  cta: {
    ref: REF,
    titluBloc: "Intră printre primii",
    textWhatsapp:
      "Bună ziua, 3S. Vreau acces timpuriu la arhiva e-Factura [ref:" + REF + "]. Firma: ... Facturi pe lună: ... Sunt contabil: da / nu.",
    subiectEmail: "Întrebare 3S [ref:" + REF + "]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + CALE_EFACTURA_RO_MD + "#webpage",
      url: BAZA + CALE_EFACTURA_RO_MD,
      name: "Arhiva e-Factura: facturile din SPV, păstrate ani la rând",
      description: DESCRIERE,
      inLanguage: atributeLimba("ro-MD").inLanguage,
      isPartOf: { "@id": ID.site },
    },
  ],
  afirmatii: [
    "ro-md-ef-fereastra-60-zile",
    "ro-md-ef-pastrare-5-ani",
    "ro-md-ef-termene-mai-lungi",
    "ro-md-ef-original-xml-sigiliu",
    "ro-md-ef-stocare-fara-acreditare",
    "ro-md-ef-autorizare-anaf",
    "ro-md-ef-autorizare-reinnoita",
    "ro-md-ef-contabil-imputernicit",
    "ro-md-ef-functii-serviciu",
    "ro-md-ef-cheie-criptata",
    "ro-md-ef-retragere-si-export",
    "ro-md-ef-gazduire-ue-frankfurt",
    "ro-md-ef-preturi",
    "ro-md-ef-pret-lansare-24-luni",
    "ro-md-ef-acces-timpuriu",
    "ro-md-ef-raspunde-o-persoana",
  ],
};
