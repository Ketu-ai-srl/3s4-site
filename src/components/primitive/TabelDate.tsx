// Tabelul de date (juridic A, articole): chenar ardezie-2, raza 12, capete 14/600 ardezie-5 pe
// ardezie-0, celule 14/22,4 ardezie-6, randuri de 47 px. Doua forme:
//   - `cheie-valoare`: fiecare rand = eticheta (`th`, gri) + valoare (`td`, alb), fara antet;
//   - `cu-antet`: un rand de capete, apoi randuri albe; o celula poate avea `strong` si `small`.
// Sub 768 px tabelul se deruleaza orizontal in invelisul lui, nu impinge pagina (la referinta
// coloana juridica se latea peste ecran; aici invelisul e o grila `minmax(0, 1fr)`).
// Invelisul e zona derulabila (ZonaDerulabila): rol `region`, numele tabelului (legenda, altfel
// randul de capete) si `tabindex=0`, ca derularea sa se poata face si de la tastatura (livrarea S4-5,
// axe `scrollable-region-focusable`). Sub 768 px chenarul si raza trec de pe tabel pe invelis, ca
// rama sa ramana pe latimea coloanei, cum era cand tabelul insusi se derula.

import { useId, type ReactNode } from "react";
import ZonaDerulabila from "./ZonaDerulabila";
import s from "./bloc.module.css";

export type TabelDateProps = {
  forma: "cheie-valoare" | "cu-antet";
  /** Pentru `cu-antet`: capetele coloanelor. */
  antet?: ReactNode[];
  /** Randurile. La `cheie-valoare` fiecare rand are doua celule: eticheta si valoarea. */
  randuri: ReactNode[][];
  /** Titlul tabelului pentru cititoarele de ecran. */
  titlu?: string;
  className?: string;
};

export default function TabelDate({ forma, antet, randuri, titlu, className }: TabelDateProps) {
  const id = useId();
  const idLegenda = titlu ? id + "-legenda" : undefined;
  const idCapete = !titlu && forma === "cu-antet" && antet ? id + "-capete" : undefined;
  return (
    <ZonaDerulabila
      className={[s.tabelInvelis, className ?? ""].filter(Boolean).join(" ")}
      numitaDe={idLegenda ?? idCapete}
      eticheta="Tabel"
    >
      <table className={s.tabel}>
        {titlu ? (
          <caption id={idLegenda} className="doar-cititor">
            {titlu}
          </caption>
        ) : null}
        {forma === "cu-antet" && antet ? (
          <thead>
            <tr id={idCapete}>
              {antet.map((a, i) => (
                <th key={i} scope="col">
                  {a}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {randuri.map((rand, i) => (
            <tr key={i}>
              {forma === "cheie-valoare" ? (
                <>
                  <th scope="row">{rand[0]}</th>
                  <td>{rand[1]}</td>
                </>
              ) : (
                rand.map((celula, j) => <td key={j}>{celula}</td>)
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ZonaDerulabila>
  );
}
