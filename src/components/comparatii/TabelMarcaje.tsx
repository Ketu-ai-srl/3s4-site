// Tabelul cu marcaje al comparatiilor (comparatie-drive.md §5, comparatie-stocare.md §3): panou cu
// derulare orizontala, cap cu coloana 3S in albastru, marcaje da / partial / nu, legenda sub panou.
//
// In plus fata de referinta, sub legenda sta o caseta PLIATA cu temeiul fiecarui marcaj al unui
// tert: ce spune documentatia oficiala si legatura spre ea (publicitate comparativa, Legea nr.
// 158/2008: comparatia trebuie sa poata fi verificata). Pliata, nu schimba forma paginii.
//
// Stratul cu derulare primeste focus (tabIndex 0) si nume: la 390 tabelul e mai lat decat panoul,
// iar un strat care se deruleaza trebuie sa poata fi derulat si de la tastatura. Numele lui e altul
// decat al sectiunii (care poarta titlul de bloc), ca cele doua repere sa nu se confunde.

import { ChevronDown, ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";
import { LEGENDA_MARCAJE, type Marcaj, type SursaOficiala, type TabelComparatie } from "@/content/comparatii";
import SemnMarcaj from "./SemnMarcaj";
import s from "./comparatii.module.css";

export type SurseSuplimentare = {
  titlu: string;
  surse: SursaOficiala[];
};

export type TabelMarcajeProps = {
  tabel: TabelComparatie;
  /** Alte afirmatii despre terti de pe aceeasi pagina (cardurile), cu sursele lor. */
  surseSuplimentare?: SurseSuplimentare[];
};

const ORDINE_LEGENDA: Marcaj[] = ["da", "partial", "nu"];

function LegaturaSursa({ sursa }: { sursa: SursaOficiala }) {
  return (
    <a className={s.legaturaExterna} href={sursa.url} target="_blank" rel="noopener nofollow">
      <span>{sursa.eticheta}</span>
      <span className="doar-cititor"> (se deschide într-o fereastră nouă)</span>
      <ExternalLink size={13} strokeWidth={2} aria-hidden="true" focusable="false" />
    </a>
  );
}

export default function TabelMarcaje({ tabel, surseSuplimentare = [] }: TabelMarcajeProps) {
  // Latimile coloanelor de marcaj, ca variabile: sub 768 foaia de stil trece pe cea mica.
  const latimi = {
    minWidth: tabel.latimeMinima,
    "--latime-coloana": tabel.latimeColoana + "px",
    "--latime-coloana-mica": tabel.latimeColoanaMica + "px",
  } as CSSProperties;
  return (
    <>
      <div className={s.panou}>
        <div className={s.derulare} role="region" aria-label={"Tabel: " + tabel.titlu} tabIndex={0}>
          <table className={s.tabel} style={latimi}>
            <thead>
              <tr>
                <th scope="col">{tabel.capFunctie}</th>
                {tabel.coloaneTerti.map((c) => (
                  <th key={c} scope="col" className={s.colMarcaj}>
                    {c}
                  </th>
                ))}
                <th scope="col" className={s.colMarcaj + " " + s.capNoi}>
                  {tabel.coloanaNoi}
                </th>
              </tr>
            </thead>
            <tbody>
              {tabel.randuri.map((r) => (
                <tr key={r.functie}>
                  <th scope="row" className={s.functie}>
                    {r.functie}
                  </th>
                  {r.terti.map((c, i) => (
                    <td key={tabel.coloaneTerti[i]} className={s.celula}>
                      <SemnMarcaj marcaj={c.marcaj} className={s.marcaj + " " + s.marcajTert} />
                      <span className="doar-cititor">{LEGENDA_MARCAJE[c.marcaj]}</span>
                    </td>
                  ))}
                  <td className={s.celula}>
                    <SemnMarcaj marcaj={r.noi.marcaj} className={s.marcaj + " " + s.marcajNoi} />
                    <span className="doar-cititor">{LEGENDA_MARCAJE[r.noi.marcaj]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className={s.legenda} aria-label="Legenda marcajelor">
        {ORDINE_LEGENDA.map((m) => (
          <li key={m} className={s.legendaElement}>
            <SemnMarcaj marcaj={m} marime={14} className={s.marcajTert} />
            <span>{LEGENDA_MARCAJE[m]}</span>
          </li>
        ))}
      </ul>

      <details className={s.surse}>
        <summary className={s.surseRezumat}>
          <span>{tabel.titluSurse}</span>
          <ChevronDown size={16} strokeWidth={2} className={s.surseChevron} aria-hidden="true" focusable="false" />
        </summary>
        <p className={s.surseNota}>{tabel.notaSurse}</p>
        <ul className={s.surseLista}>
          {tabel.randuri.map((r) => (
            <li key={r.functie} className={s.surseRand}>
              <p className={s.surseFunctie}>{r.functie}</p>
              {r.terti.map((c, i) => (
                <div key={tabel.coloaneTerti[i]}>
                  <p>
                    {tabel.coloaneTerti[i]}: {LEGENDA_MARCAJE[c.marcaj].toLowerCase()}. {c.nota}
                  </p>
                  <p className={s.surseLegaturi}>
                    {c.surse.map((su) => (
                      <LegaturaSursa key={su.url} sursa={su} />
                    ))}
                  </p>
                </div>
              ))}
            </li>
          ))}
          {surseSuplimentare.map((g) => (
            <li key={g.titlu} className={s.surseRand}>
              <p className={s.surseFunctie}>{g.titlu}</p>
              <p className={s.surseLegaturi}>
                {g.surse.map((su) => (
                  <LegaturaSursa key={su.url} sursa={su} />
                ))}
              </p>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
