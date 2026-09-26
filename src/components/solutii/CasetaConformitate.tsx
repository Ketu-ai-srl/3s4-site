// Caseta de pe hub (solutii.md S6): 880 x 145,2, `ardezie-0`, chenar, raza 16, fara umbra; eticheta
// 14/600 si 8 insigne cu bifa 16 (14/500 ardezie-6, fara rupere), gap 12 x 24. Forma e a referintei;
// continutul e NUMAI din faptele confirmate in registrul de afirmatii (decizia D4), fara nicio
// certificare pe care 3S nu o are. Static, fara legaturi.

import IconitaSolutii from "./IconitaSolutii";
import s from "./hub.module.css";

export default function CasetaConformitate({ eticheta, insigne }: { eticheta: string; insigne: string[] }) {
  return (
    <section className={s.banda}>
      <div className="container-site">
        <div className={s.coloana}>
          <div className={s.caseta}>
            <p className={s.casetaEticheta}>{eticheta}</p>
            <ul className={s.insigne}>
              {insigne.map((i) => (
                <li key={i} className={s.insigna}>
                  <IconitaSolutii nume="check" marime={16} contur={2} className={s.insignaBifa} />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
