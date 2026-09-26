"use client";

// "Inapoi la variante" (preturi.md §5): buton-text 14/500 `ardezie-5`, sageata spre stanga, hover
// `ardezie-9`. E o legatura spre poarta, ca sa mearga si fara JavaScript; cu JavaScript, poarta
// revine pe loc, fara animatie, iar adresa ramane cum era (ca la referinta).

import Iconita from "@/components/primitive/Iconita";
import { ANCORE_PRETURI, LINIA_DE_BAZA } from "@/content/preturi";
import { useInapoi } from "./LumeaPreturi";
import s from "./lume.module.css";

export default function ButonInapoi() {
  const inapoi = useInapoi();
  return (
    <a href={"#" + ANCORE_PRETURI.poarta} className={s.inapoi} onClick={inapoi}>
      <Iconita nume="arrow-left" marime={14} contur={2} />
      <span>{LINIA_DE_BAZA.inapoi}</span>
    </a>
  );
}
