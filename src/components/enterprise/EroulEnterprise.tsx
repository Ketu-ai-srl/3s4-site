// Eroul paginii `/enterprise`: EroulInterior, varianta "cu intoarcere" (enterprise.md §1). Actiunile
// sunt ale paginii: butonul dreptunghiular cu raza 8 (singurul de pe pagina care nu e pastila) spre
// formularul de mai jos si legatura secundara subliniata spre platforma (prin `Tinta`, inerta cat
// timp `/platforma` nu exista).
//
// PE EDITIE: tipul continutului e structural, declarat aici; constanta RO (`EROU_ENTERPRISE`) il
// satisface fara editare. Butonul spre formular si legatura secundara sunt optionale in tip (pe RO
// exista mereu, deci ramura da acelasi DOM); `butoane` inlocuieste actiunile implicite cand editia
// are alt canal decat formularul.

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import EroulInterior from "@/components/primitive/EroulInterior";
import type { NivelFir } from "@/components/primitive/FirPagina";
import Tinta from "@/components/primitive/Tinta";
import { ANCORA_FORMULAR, EROU_ENTERPRISE } from "@/content/enterprise";
import type { Legatura } from "@/content/navigatie";
import s from "./enterprise.module.css";

export type ContinutEroulEnterprise = {
  fir: NivelFir[];
  inapoi?: Legatura;
  titlu: string;
  subtitlu: string;
  incredere?: string[];
  /** Textul butonului spre formular; fara el (si fara `butoane`), butonul nu se randeaza. */
  buton?: string;
  secundara?: Legatura;
};

export type EroulEnterpriseProps = {
  continut?: ContinutEroulEnterprise;
  /** Actiunile eroului, cand editia are alt canal decat formularul de pe pagina. */
  butoane?: ReactNode;
  /** Ancora formularului, tinta butonului implicit (pe RO: `contact-form`). */
  ancora?: string;
  /** Eticheta accesibila a firului, in limba editiei; lipsa = implicitul RO. */
  etichetaFir?: string;
};

export default function EroulEnterprise({
  continut = EROU_ENTERPRISE,
  butoane,
  ancora = ANCORA_FORMULAR,
  etichetaFir,
}: EroulEnterpriseProps) {
  const e = continut;
  return (
    <EroulInterior
      varianta="cu-intoarcere"
      fir={e.fir}
      inapoi={e.inapoi}
      titlu={e.titlu}
      subtitlu={e.subtitlu}
      incredere={e.incredere}
      {...(etichetaFir !== undefined ? { etichetaFir } : {})}
      actiuni={
        butoane ?? (
          <>
            {e.buton !== undefined ? (
              <a href={"#" + ancora} className={s.butonErou}>
                <span>{e.buton}</span>
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : null}
            {e.secundara ? (
              <Tinta legatura={e.secundara} className={s.legaturaSecundara}>
                {e.secundara.text}
              </Tinta>
            ) : null}
          </>
        )
      }
    />
  );
}
