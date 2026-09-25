// Eroul paginii `/enterprise`: EroulInterior, varianta "cu intoarcere" (enterprise.md §1). Actiunile
// sunt ale paginii: butonul dreptunghiular cu raza 8 (singurul de pe pagina care nu e pastila) spre
// formularul de mai jos si legatura secundara subliniata spre platforma (prin `Tinta`, inerta cat
// timp `/platforma` nu exista).

import { ArrowRight } from "lucide-react";
import EroulInterior from "@/components/primitive/EroulInterior";
import Tinta from "@/components/primitive/Tinta";
import { ANCORA_FORMULAR, EROU_ENTERPRISE } from "@/content/enterprise";
import s from "./enterprise.module.css";

export default function EroulEnterprise() {
  const e = EROU_ENTERPRISE;
  return (
    <EroulInterior
      varianta="cu-intoarcere"
      fir={e.fir}
      inapoi={e.inapoi}
      titlu={e.titlu}
      subtitlu={e.subtitlu}
      incredere={e.incredere}
      actiuni={
        <>
          <a href={"#" + ANCORA_FORMULAR} className={s.butonErou}>
            <span>{e.buton}</span>
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
          <Tinta legatura={e.secundara} className={s.legaturaSecundara}>
            {e.secundara.text}
          </Tinta>
        </>
      }
    />
  );
}
