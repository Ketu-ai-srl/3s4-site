"use client";

// Lista de preturi ca PDF, INVELITOAREA RO: aceeasi cale, aceleasi exporturi si aceleasi proprietati ca
// inainte. Da lui `ListaPdfVedere` textele RO, planurile, calea paginii si data scrisa in romana;
// vederea nu importa continut, iar alta editie isi are invelitoarea ei. Butonul, foaia de oferta si
// regulile de tiparire sunt descrise in vedere.

import { CALE_PRETURI, LISTA_PDF, PLANURI } from "@/content/preturi";
import ListaPdfVedere, { FoaieOfertaVedere } from "./ListaPdfVedere";

export { REGULI_TIPAR } from "./ListaPdfVedere";

const LUNI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

/** Data zilei, in romana: "25 septembrie 2026". */
export function dataRomaneasca(d: Date): string {
  return d.getDate() + " " + LUNI[d.getMonth()] + " " + d.getFullYear();
}

export function FoaieOferta({ gazda, data }: { gazda: string; data: string }) {
  return <FoaieOfertaVedere gazda={gazda} data={data} continut={LISTA_PDF} planuri={PLANURI} cale={CALE_PRETURI} />;
}

export default function ListaPdf({ gazda }: { gazda: string }) {
  return (
    <ListaPdfVedere gazda={gazda} continut={LISTA_PDF} planuri={PLANURI} cale={CALE_PRETURI} formatData={dataRomaneasca} />
  );
}
