// Tabelul de date (juridic A, articole): chenar ardezie-2, raza 12, capete 14/600 ardezie-5 pe
// ardezie-0, celule 14/22,4 ardezie-6, randuri de 47 px. Doua forme:
//   - `cheie-valoare`: fiecare rand = eticheta (`th`, gri) + valoare (`td`, alb), fara antet;
//   - `cu-antet`: un rand de capete, apoi randuri albe; o celula poate avea `strong` si `small`.
// Sub 768 px tabelul se deruleaza orizontal in invelisul lui, nu impinge pagina (la referinta
// coloana juridica se latea peste ecran; aici invelisul e o grila `minmax(0, 1fr)`).

import type { ReactNode } from "react";
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
  return (
    <div className={[s.tabelInvelis, className ?? ""].filter(Boolean).join(" ")}>
      <table className={s.tabel}>
        {titlu ? <caption className="doar-cititor">{titlu}</caption> : null}
        {forma === "cu-antet" && antet ? (
          <thead>
            <tr>
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
    </div>
  );
}
