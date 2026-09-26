// Sectiunea formularului de contact (`#contact-form`), componenta de SERVER: padding 64 / 64,
// invelis 640 cu aparitie la derulare, capul centrat (eticheta, h2 40, subtitlu), apoi cardul.
//
// Aici se decide starea (comutatorul operatorului) si se randeaza nota de informare: scopul, temeiul
// (demersuri precontractuale, nu consimtamant), pastrarea, operatorul cand exista si legatura spre
// politica prin `Tinta` - inerta cat timp politica nu e publicata (gdprscan FORM-05/06, G-MD-06).

import CapSectiune from "@/components/primitive/CapSectiune";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import type { Formular } from "@/components/consimtamant/evenimente";
import { FORMULAR, POLITICA } from "@/content/formular";
import FormularContact from "./FormularContact";
import { stareFormular, type StareFormular } from "./stare";
import s from "./Formular.module.css";

export type SectiuneFormularProps = {
  formular: Formular;
  /** Ancora sectiunii (la referinta `contact-form`). */
  id: string;
  eticheta: string;
  titlu: string;
  subtitlu: string;
  exempluMesaj: string;
  subiect: string;
  /** Numai pentru probe: starea data explicit, nu cea din configurare. */
  stare?: StareFormular;
};

export function NotaInformare({ stare }: { stare: StareFormular }) {
  const i = FORMULAR.informare;
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
        {i.pastrareInainte} {stare.pastrare}. {i.politicaInainte}{" "}
        <Tinta legatura={POLITICA} className={s.politica}>
          {POLITICA.text}
        </Tinta>
        .
      </p>
    </div>
  );
}

export default function SectiuneFormular({
  formular,
  id,
  eticheta,
  titlu,
  subtitlu,
  exempluMesaj,
  subiect,
  stare = stareFormular(),
}: SectiuneFormularProps) {
  return (
    <section id={id} className={s.sectiune} aria-labelledby={id + "-titlu"}>
      <div className="container-site">
        <Reveal className={s.invelis}>
          <CapSectiune eticheta={eticheta} titlu={titlu} subtitlu={subtitlu} margineJos={32} id={id + "-titlu"} />
          <FormularContact
            formular={formular}
            stare={stare}
            exempluMesaj={exempluMesaj}
            subiect={subiect}
            informare={<NotaInformare stare={stare} />}
          />
        </Reveal>
      </div>
    </section>
  );
}
