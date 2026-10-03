"use client";

// Bara fixa de jos pe mobil (arhitectura EN §4.7): un singur buton, WhatsApp, cu zona de siguranta a marginii
// ecranului. Butonul de apel a iesit (decizia 56: fara apeluri GSM; apelurile se primesc numai pe WhatsApp). Se
// randeaza numai cand domeniul are WhatsApp. Ca sa nu acopere continutul, inaintea ei sta un distantier cu
// `padding-bottom` egal cu inaltimea barei (aceeasi variabila CSS), deci ultima bucata a paginii ramane deasupra
// barei. Pe desktop nici bara, nici distantierul nu ocupa loc (CSS).
//
// Tinta WhatsApp e a paginii curente (codul `ref`), aleasa dupa cale.

import { usePathname } from "next/navigation";
import { alegePeCale, type ContractBara } from "@/content/navigatie";
import s from "./BaraMobil.module.css";

export default function BaraMobil({ bara }: { bara: ContractBara | null }) {
  const cale = usePathname() ?? "/";
  if (bara === null || bara.whatsapp === null) {
    return null;
  }
  const whatsapp = alegePeCale(bara.whatsapp.legatura, cale);
  if (whatsapp === null) {
    return null;
  }
  return (
    <>
      <div className={s.distantier} aria-hidden="true" data-bara-distantier="" />
      <nav className={s.bara} aria-label={bara.eticheta} data-bara-mobil="">
        <a href={whatsapp} className={s.whatsapp} data-canal="whatsapp">
          {bara.whatsapp.text}
        </a>
      </nav>
    </>
  );
}
