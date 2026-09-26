// Pagina de cont nou (inregistrare.md; COMPONENTE §3 "autentificare-centrata", §4.11), componenta de
// SERVER: eroul centrat pe invelisul de 600 (varianta `centrat` a primitivei), apoi cardul cu
// formularul. Aici se decide starea (comutatorul operatorului) si se randeaza, prin `Tinta`, cele trei
// legaturi din formular: termenii (inerti cat timp nu sunt publicati), politica din nota de informare
// (FORM-05/06) si ajutorul de sub buton.
//
// Etichetele codurilor venite din constructorul de pe start (`ind`, `src`, `vol`, `who`) se dau
// formularului ca date mici: modulul `acasa.ts` ramane pe server.

import EroulInterior from "@/components/primitive/EroulInterior";
import Tinta from "@/components/primitive/Tinta";
import { stareFormular, type StareFormular } from "@/components/formular/stare";
import {
  CONSTRUCTOR,
  ETICHETE_CANAL,
  ETICHETE_CINE,
  ETICHETE_VOLUM,
  PARAMETRI_INREGISTRARE,
} from "@/content/acasa";
import { CALE_INREGISTRARE, INREGISTRARE } from "@/content/conversie";
import FormularInregistrare from "./FormularInregistrare";
import type { EticheteConstructor } from "./inregistrare";
import s from "./inregistrare.module.css";

export const ETICHETE_CONSTRUCTOR: EticheteConstructor = {
  industrii: Object.fromEntries(CONSTRUCTOR.industrii.map((i) => [i.cod, i.nume])),
  canale: { ...ETICHETE_CANAL },
  volume: { ...ETICHETE_VOLUM },
  cine: { ...ETICHETE_CINE },
  parametri: { ...PARAMETRI_INREGISTRARE },
};

export function NotaInformareCont({ stare }: { stare: StareFormular }) {
  const i = INREGISTRARE.informare;
  return (
    <div className={s.informare} data-informare-formular="">
      <p>
        {stare.operator ? (
          <>
            {i.operatorInainte} {stare.operator}.{" "}
          </>
        ) : null}
        {i.scop} {i.temei}
      </p>
      <p>
        {i.politicaInainte}{" "}
        <Tinta legatura={i.politica} className={s.legaturaText}>
          {i.politica.text}
        </Tinta>
        .
      </p>
    </div>
  );
}

export default function PaginaInregistrare({ stare = stareFormular() }: { stare?: StareFormular }) {
  const t = INREGISTRARE;
  return (
    <>
      <EroulInterior
        varianta="centrat"
        fir={[
          { text: t.fir.acasa, cale: "/" },
          { text: t.fir.pagina, cale: CALE_INREGISTRARE },
        ]}
        titlu={t.titlu}
        subtitlu={t.subtitlu}
      />
      <section className={s.zona} aria-label={t.buton}>
        <div className="container-site">
          <div className={s.invelis}>
            <div className={s.card}>
              <FormularInregistrare
                stare={stare}
                etichete={ETICHETE_CONSTRUCTOR}
                termeni={
                  <>
                    {t.termeniInainte}{" "}
                    <Tinta legatura={t.termeni} className={s.legaturaText}>
                      {t.termeni.text}
                    </Tinta>
                    .
                  </>
                }
                informare={<NotaInformareCont stare={stare} />}
                ajutor={
                  <Tinta legatura={t.ajutor} className={s.ajutorLegatura}>
                    {t.ajutor.text}
                  </Tinta>
                }
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
