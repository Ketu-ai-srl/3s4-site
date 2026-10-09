// Tabelul cu marcaje al comparatiilor (comparatie-drive.md §5, comparatie-stocare.md §3): panou cu
// derulare orizontala, cap cu coloana 3S in albastru, marcaje da / partial / nu, legenda sub panou.
//
// In plus fata de referinta, sub legenda sta o caseta PLIATA cu temeiul fiecarui marcaj al unui
// tert: ce spune documentatia oficiala si legatura spre ea (publicitate comparativa, Legea nr.
// 158/2008: comparatia trebuie sa poata fi verificata). Pliata, nu schimba forma paginii.
//
// Stratul cu derulare primeste focus (tabIndex 0) si nume: un tabel mai lat decat panoul (pe ecran
// ingust, la o latura mai mica de 390, sau cu mai multi terti) trebuie sa poata fi derulat si de la
// tastatura. La 390 tabelul incape, cu coloana 3S la vedere (comparatii.module.css). Numele lui e altul
// decat al sectiunii (care poarta titlul de bloc), ca cele doua repere sa nu se confunde.
//
// PE EDITIE: legenda marcajelor, eticheta ei accesibila si sufixul pentru cititorul de ecran al
// legaturilor spre surse vin prin proprietati, cu implicitul romanesc (pagina RO nu le paseaza).

import { ChevronDown, ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";
import { LEGENDA_MARCAJE, type Marcaj, type SursaOficiala, type TabelComparatie } from "@/content/comparatii";
import { FEREASTRA_NOUA as FEREASTRA_NOUA_EN } from "@/content/en/referinta-comun";
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
  /** Numele marcajelor (legenda si textul pentru cititorul de ecran din celule), in limba editiei. */
  legenda?: Record<Marcaj, string>;
  /** Eticheta accesibila a listei-legenda. */
  etichetaLegenda?: string;
  /** Textul pentru cititorul de ecran de dupa fiecare legatura spre o sursa, cu spatiul de inceput. */
  fereastraNoua?: string;
};

const FEREASTRA_NOUA_RO = " (se deschide într-o fereastră nouă)";

/**
 * Inceputul numelui accesibil al stratului cu derulare, in limba editiei. Editia se recunoaste dupa sufixul
 * legaturilor spre surse, pe care pagina il paseaza deja in limba ei: cel englez da "Table: ", orice altceva
 * (implicitul romanesc si /ro de pe 3s.md) ramane "Tabel: ", deci marcajul paginilor romanesti nu se schimba.
 */
export function prefixRegiune(fereastraNoua: string): string {
  return fereastraNoua === FEREASTRA_NOUA_EN ? "Table: " : "Tabel: ";
}

const ORDINE_LEGENDA: Marcaj[] = ["da", "partial", "nu"];

function LegaturaSursa({ sursa, fereastraNoua }: { sursa: SursaOficiala; fereastraNoua: string }) {
  return (
    <a className={s.legaturaExterna} href={sursa.url} target="_blank" rel="noopener nofollow">
      <span>{sursa.eticheta}</span>
      <span className="doar-cititor">{fereastraNoua}</span>
      <ExternalLink size={13} strokeWidth={2} aria-hidden="true" focusable="false" />
    </a>
  );
}

export default function TabelMarcaje({
  tabel,
  surseSuplimentare = [],
  legenda = LEGENDA_MARCAJE,
  etichetaLegenda = "Legenda marcajelor",
  fereastraNoua = FEREASTRA_NOUA_RO,
}: TabelMarcajeProps) {
  // Latimile coloanelor de marcaj, ca variabile: sub 768 foaia de stil trece pe cea mica.
  const latimi = {
    minWidth: tabel.latimeMinima,
    "--latime-coloana": tabel.latimeColoana + "px",
    "--latime-coloana-mica": tabel.latimeColoanaMica + "px",
  } as CSSProperties;
  return (
    <>
      <div className={s.panou}>
        <div className={s.derulare} role="region" aria-label={prefixRegiune(fereastraNoua) + tabel.titlu} tabIndex={0}>
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
                      <span className="doar-cititor">{legenda[c.marcaj]}</span>
                    </td>
                  ))}
                  <td className={s.celula}>
                    <SemnMarcaj marcaj={r.noi.marcaj} className={s.marcaj + " " + s.marcajNoi} />
                    <span className="doar-cititor">{legenda[r.noi.marcaj]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className={s.legenda} aria-label={etichetaLegenda}>
        {ORDINE_LEGENDA.map((m) => (
          <li key={m} className={s.legendaElement}>
            <SemnMarcaj marcaj={m} marime={14} className={s.marcajTert} />
            <span>{legenda[m]}</span>
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
                    {tabel.coloaneTerti[i]}: {legenda[c.marcaj].toLowerCase()}. {c.nota}
                  </p>
                  <p className={s.surseLegaturi}>
                    {c.surse.map((su) => (
                      <LegaturaSursa key={su.url} sursa={su} fereastraNoua={fereastraNoua} />
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
                  <LegaturaSursa key={su.url} sursa={su} fereastraNoua={fereastraNoua} />
                ))}
              </p>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
