"use client";

// Bara fixa de jos pe mobil (arhitectura EN §4.7): WhatsApp si apelul, cu zona de siguranta a
// marginii ecranului. Se randeaza numai cu cel putin un canal nevid. Ca sa nu acopere continutul, inaintea ei
// sta un distantier cu `padding-bottom` egal cu inaltimea barei (aceeasi variabila CSS), deci ultima bucata
// a paginii ramane deasupra barei. Pe desktop nici bara, nici distantierul nu ocupa loc (CSS).
//
// Tinta WhatsApp e a paginii curente (codul `ref`), aleasa dupa cale; `tel:` e acelasi pe toate paginile.

import { usePathname } from "next/navigation";
import { alegePeCale, type ContractBara } from "@/content/navigatie";
import s from "./BaraMobil.module.css";

export default function BaraMobil({ bara }: { bara: ContractBara | null }) {
  const cale = usePathname() ?? "/";
  if (bara === null) {
    return null;
  }
  const whatsapp = bara.whatsapp === null ? null : alegePeCale(bara.whatsapp.legatura, cale);
  const telefon = bara.telefon;
  if (whatsapp === null && telefon === null) {
    return null;
  }
  return (
    <>
      <div className={s.distantier} aria-hidden="true" data-bara-distantier="" />
      <nav className={s.bara} aria-label={bara.eticheta} data-bara-mobil="">
        {whatsapp !== null && bara.whatsapp !== null ? (
          <a href={whatsapp} className={s.whatsapp} data-canal="whatsapp">
            {bara.whatsapp.text}
          </a>
        ) : null}
        {telefon !== null ? (
          <a href={telefon.href} className={s.apel} data-canal="telefon">
            {telefon.text}
          </a>
        ) : null}
      </nav>
    </>
  );
}
