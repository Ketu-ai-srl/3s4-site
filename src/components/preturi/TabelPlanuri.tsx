// Tabelul pachetelor din al doilea pliu (preturi.md §7): 4 categorii, 14 randuri, coloana
// pachetului recomandat cu antet si bife albastre. Pe ecran lat tabelul are minim 560 px; pe ecran ingust
// (<= 768) eticheta randului se rupe si sta lipita la stanga, iar tabelul se deruleaza in panoul lui, nu
// pagina (pliuri.module.css). Panoul primeste focus si nume, ca derularea sa mearga si din tastatura;
// numele lui (`derulare`) e si indicatia scrisa de deasupra tabelului cand panoul chiar se deruleaza.
// Componenta de server: tabelul e static si ajunge intreg in HTML-ul servit.
//
// PE EDITIE: textele tabelului si planurile vin prin proprietati, cu implicitul RO; pagina RO nu pasa
// nimic. Valorile celulelor (moneda, locul fisierelor) sunt continut, deci tot ale editiei.

import Iconita from "@/components/primitive/Iconita";
import { COMPARATIE, PLANURI, type CategorieTabel, type CelulaTabel, type Plan } from "@/content/preturi";
import s from "./pliuri.module.css";

/** Continutul tabelului, pe editie; tip structural, constanta RO (`COMPARATIE`) il satisface. */
export type ContinutTabelPlanuri = {
  /** Antetul primei coloane. */
  functie: string;
  /** Textul ascuns al bifei, pentru cititorul de ecran. */
  inclus: string;
  /** Numele accesibil al panoului derulabil. */
  derulare: string;
  categorii: CategorieTabel[];
};

export type TabelPlanuriProps = {
  continut?: ContinutTabelPlanuri;
  planuri?: readonly Plan[];
};

function Celula({ celula, plan, inclus }: { celula: CelulaTabel; plan: Plan; inclus: string }) {
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
        <span className="doar-cititor">{inclus}</span>
      </span>
    </td>
  );
}

export default function TabelPlanuri({ continut = COMPARATIE, planuri = PLANURI }: TabelPlanuriProps) {
  return (
    <div className={s.panouTabel}>
      <div className={s.derulare} role="region" aria-label={continut.derulare} tabIndex={0}>
        <table className={s.tabel}>
          <thead>
            <tr>
              <th scope="col">{continut.functie}</th>
              {planuri.map((p) => (
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
            {continut.categorii.flatMap((c) => [
              <tr key={c.titlu} className={s.randCategorie}>
                <th colSpan={planuri.length + 1} scope="colgroup">
                  {c.titlu}
                </th>
              </tr>,
              ...c.randuri.map((r) => (
                <tr key={c.titlu + "|" + r.functie}>
                  <th scope="row" className={s.celulaFunctie}>
                    {r.functie}
                  </th>
                  {planuri.map((p) => (
                    <Celula key={p.cheie} celula={r.celule[p.cheie]} plan={p} inclus={continut.inclus} />
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
