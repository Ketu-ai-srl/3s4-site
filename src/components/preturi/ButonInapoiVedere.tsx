"use client";

// "Inapoi la variante", VEDEREA (preturi.md §5): buton-text 14/500 `ardezie-5`, sageata spre stanga,
// hover `ardezie-9`. E o legatura spre poarta, ca sa mearga si fara JavaScript; cu JavaScript, poarta
// revine pe loc, fara animatie, iar adresa ramane cum era (ca la referinta). Textul si ancora vin de la
// invelitoarea editiei (`ButonInapoi.tsx` pe RO); actiunea, din contextul lumii (`contextLume.ts`).

import Iconita from "@/components/primitive/Iconita";
import { useInapoi } from "./contextLume";
import s from "./lume.module.css";

export type ContinutButonInapoi = {
  text: string;
  /** Ancora poartei, fara diez. */
  ancoraPoarta: string;
};

export default function ButonInapoiVedere({ continut }: { continut: ContinutButonInapoi }) {
  const inapoi = useInapoi();
  return (
    <a href={"#" + continut.ancoraPoarta} className={s.inapoi} onClick={inapoi}>
      <Iconita nume="arrow-left" marime={14} contur={2} />
      <span>{continut.text}</span>
    </a>
  );
}
