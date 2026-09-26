// Banda de integrari (acasa.md §3, acasa-erou.md §2): fraza si trei grupe de sigle monocrome.
// Nu sunt legaturi si nu au aparitie la derulare. Grupele si numele vin din `INTEGRARI`
// (src/content/acasa.ts); siglele, din `SiglaTert` (provenienta in docs/design/ACTIVE.md).

import { INTEGRARI } from "@/content/acasa";
import SiglaTert from "@/components/primitive/SiglaTert";
import s from "./acasa.module.css";

/** Marimea siglei, pe cheie, cum e masurata pe referinta (20 / 18 / 24 / 19 px). */
const MARIME_SIGLA: Record<string, number> = {
  "google-workspace": 20,
  "microsoft-365": 18,
  gmail: 20,
  outlook: 20,
  whatsapp: 20,
  sap: 24,
  peppol: 20,
  storecove: 20,
  claude: 19,
  chatgpt: 19,
};

export default function BandaIntegrari() {
  const ultimul = INTEGRARI.grupuri.length - 1;
  return (
    <section className={s.integrari} aria-labelledby="integrari-fraza">
      <div className="container-site">
        <p id="integrari-fraza" className={s.integrariFraza}>
          {INTEGRARI.fraza}
        </p>
        <ul className={s.integrariGrupuri}>
          {INTEGRARI.grupuri.map((g, i) => (
            <li key={g.eticheta} className={s.integrariGrup}>
              <p className={s.integrariEticheta}>{g.eticheta}</p>
              <ul className={[s.integrariRand, i === ultimul ? s.integrariRandAi : ""].filter(Boolean).join(" ")}>
                {g.elemente.map((e) => (
                  <li key={e.nume} className={s.integrariElement}>
                    <SiglaTert cheie={e.sigla} marime={MARIME_SIGLA[e.sigla] ?? 20} contur={1.8} />
                    <span>{e.nume}</span>
                  </li>
                ))}
              </ul>
              {g.nota ? <p className={s.integrariNota}>{g.nota}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
