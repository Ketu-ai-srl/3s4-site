"use client";

// Cardul de scanare (promo__scanare-cu-telefonul.md §2): telefonul de 150 x 268 cu bonul fictiv rotit
// -2 grade, vizorul din 4 colturi, linia de scanare care trece O DATA (1,3 s ease-in-out, dupa 0,2 s) si
// cele 8 randuri de date care intra pe rand din 6 px (0,35 s, intarzierile din fisa: 0,69 - 1,8 s).
//
// Scena porneste o singura data, cand cardul intra in fereastra (`data-scena`: `static` -> `asteapta` ->
// `in`), numai cu miscare permisa. Starea statica (server, fara JavaScript, miscare redusa): linia de
// scanare ascunsa, randurile vizibile (fisa: "Miscare redusa: linia ascunsa, randurile vizibile direct").
//
// DEFECTELE MACHETEI DE REFERINTA, corectate (fisa §2): comerciantul e fictiv ("Exemplu"), codul fiscal are
// cifra de control gresita, iar totalul e suma articolelor (`totalBon`). Eticheta "exemplu" e vizibila (D11).

import { useRef, type CSSProperties } from "react";
import { BON, DATE_CITITE, FISIER_BON, formatBani, RAND_FISIER, RAND_QR, totalBon } from "@/content/promo";
import { INTARZIERI_RANDURI_S } from "./miscare-promo";
import { CardMacheta } from "./Piese";
import { usePornireLaVedere } from "./vizibil";
import s from "./scanare.module.css";

function intarziere(i: number): CSSProperties {
  return { "--intarziere": INTARZIERI_RANDURI_S[i] + "s" } as CSSProperties;
}

export default function CardScanare() {
  const ref = useRef<HTMLDivElement>(null);
  const faza = usePornireLaVedere(ref, 0.3);
  const scena = faza === "porneste" ? "in" : faza;

  return (
    <div ref={ref}>
      <CardMacheta
        nume="scanare"
        declaratie="Exemplu cu date fictive: un bon fotografiat cu telefonul și datele citite din el de 3S."
        scanare
      >
        <div className={s.scena} data-scena={scena}>
          <div className={s.telefon} aria-hidden="true">
            <div className={s.bon}>
              <div className={s.comerciant}>{BON.comerciant}</div>
              <div className={s.codFiscal}>CF {BON.codFiscal}</div>
              <div className={s.articole}>
                {BON.articole.map((a) => (
                  <span key={a.denumire}>
                    {a.cantitate} x {formatBani(a.pretBani)}
                    <i>{formatBani(a.cantitate * a.pretBani)}</i>
                  </span>
                ))}
              </div>
              <div className={s.total}>{formatBani(totalBon())} RON</div>
              <div className={s.subsolBon}>
                {BON.numar}
                <br />
                {BON.data} {BON.ora}
              </div>
              <div className={s.qr}>
                <span className={s.pata} />
              </div>
            </div>
            <span className={[s.colt, s.stangaSus].join(" ")} />
            <span className={[s.colt, s.dreaptaSus].join(" ")} />
            <span className={[s.colt, s.stangaJos].join(" ")} />
            <span className={[s.colt, s.dreaptaJos].join(" ")} />
            <span className={s.linie} data-linie-scanare="" />
          </div>
          <dl className={s.date}>
            {DATE_CITITE.map((r, i) => (
              <div key={r.cheie} className={s.rand} style={intarziere(i)}>
                <dt className={s.cheie}>{r.cheie}</dt>
                <dd className={s.valoare}>{r.valoare}</dd>
              </div>
            ))}
            <div className={[s.rand, s.randSeparat].join(" ")} style={intarziere(6)}>
              <dt className={s.cheie}>{RAND_QR.cheie}</dt>
              <dd className={s.valoareQr}>
                <span className={s.stareQr}>{RAND_QR.stare}</span>
                <span className={s.cip}>{RAND_QR.cip}</span>
              </dd>
            </div>
            <div className={[s.rand, s.randSeparat, s.randFisier].join(" ")} style={intarziere(7)}>
              <dt className={s.numeFisier}>{FISIER_BON}</dt>
              <dd className={s.valoareFisier}>
                <span className={s.cip}>{RAND_FISIER.cip}</span>
              </dd>
            </div>
          </dl>
        </div>
      </CardMacheta>
    </div>
  );
}
