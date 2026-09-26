// Tabelul pachetelor din al doilea pliu (preturi.md §7): 4 categorii, 14 randuri, coloana
// pachetului recomandat cu antet si bife albastre. Tabelul are minim 560 px, deci pe ecran ingust se
// deruleaza in panoul lui, nu pagina; panoul primeste focus si nume, ca derularea sa mearga si din
// tastatura. Componenta de server: tabelul e static si ajunge intreg in HTML-ul servit.

import Iconita from "@/components/primitive/Iconita";
import { COMPARATIE, PLANURI, type CelulaTabel, type Plan } from "@/content/preturi";
import s from "./pliuri.module.css";

function Celula({ celula, plan }: { celula: CelulaTabel; plan: Plan }) {
  if (celula.fel === "valoare") {
    return (
      <td className={s.celulaValoare}>
        <span className={s.valoareTabel}>{celula.text}</span>
      </td>
    );
  }
  return (
    <td className={s.celulaValoare}>
      <span className={s.marcaj + (plan.recomandat ? " " + s.marcajAccent : "")}>
        <Iconita nume="check" marime={16} contur={2} />
        <span className="doar-cititor">{COMPARATIE.inclus}</span>
      </span>
    </td>
  );
}

export default function TabelPlanuri() {
  return (
    <div className={s.panouTabel}>
      <div className={s.derulare} role="region" aria-label={COMPARATIE.derulare} tabIndex={0}>
        <table className={s.tabel}>
          <thead>
            <tr>
              <th scope="col">{COMPARATIE.functie}</th>
              {PLANURI.map((p) => (
                <th
                  key={p.cheie}
                  scope="col"
                  className={s.coloanaPlan + (p.recomandat ? " " + s.coloanaRecomandata : "")}
                >
                  {p.nume}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARATIE.categorii.flatMap((c) => [
              <tr key={c.titlu} className={s.randCategorie}>
                <th colSpan={PLANURI.length + 1} scope="colgroup">
                  {c.titlu}
                </th>
              </tr>,
              ...c.randuri.map((r) => (
                <tr key={c.titlu + "|" + r.functie}>
                  <th scope="row" className={s.celulaFunctie}>
                    {r.functie}
                  </th>
                  {PLANURI.map((p) => (
                    <Celula key={p.cheie} celula={r.celule[p.cheie]} plan={p} />
                  ))}
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}
