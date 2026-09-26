"use client";

// S5 - lotul (functionalitati__semnatura-calificata.md, S5): titlul, paragraful, fereastra 820 x ~411 (bara
// laterala cu 3 file, capul cu pastila si butonul, 5 randuri de acte si randul "inca N", subsolul cu 3
// statistici) si nota.
//
// E O PREVIZUALIZARE (decizia D4c): bara ferestrei spune "integrare in curs cu furnizorii acreditati", iar
// starile NU spun "semnat". Secventa pastreaza forma referintei, dar ce se aduna e LOTUL: actele trec pe rand
// din "in asteptare" in "in lot", iar butonul se opreste pe "gata de semnat". Semnarea calificata nu apare
// ca facuta nicaieri pe pagina.
//
// SECVENTA (fisa S5, [derulare + timp]): la PRAGUL 0,25, O SINGURA DATA (`usePragOdata`), porneste in timp:
// un act la ~165 ms, intai cele 5 vizibile, apoi contorul randului final pana la capat (18 pasi, ~3 s);
// butonul arata o rotita si "k / N" cat lucreaza, apoi trece pe verde. La urcare starea finala ramane. In
// HTML-ul servit si la miscare redusa, direct starea finala.
//
// FILELE si butonul sunt DECORATIVE, ca la referinta (clicul nu schimba nimic): nu sunt butoane, deci nu
// primesc focus fara efect. La 390 filele se rup pe doua randuri in loc sa iasa din fereastra (la referinta
// a treia se vede doar derulata), iar randul "inca N" isi pastreaza grila lui de trei coloane (defectele
// masurate in fisa S5).

import { Check, FileText, ReceiptText, ClipboardCheck, Monitor } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Fereastra from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { usePragOdata } from "@/components/functionalitati/e-facturi-si-avize/pragOdata";
import { LOT, PAS_LOT_MS, PRAG_LOT, TOTAL_LOT, type FilaLot } from "@/content/functionalitati/semnatura-calificata";
import s from "./semnatura.module.css";

function IconitaFila({ fel }: { fel: FilaLot["iconita"] }) {
  const p = { width: 18, height: 18, strokeWidth: 1.75, "aria-hidden": true, focusable: "false" } as const;
  if (fel === "contract") return <FileText {...p} />;
  if (fel === "factura") return <ReceiptText {...p} />;
  return <ClipboardCheck {...p} />;
}

/** Cate acte sunt in lot la pasul k al secventei (0..TOTAL_LOT). */
function useSecventa(stare: "static" | "asteapta" | "gata"): number {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (stare !== "gata") return;
    setK(0);
    const ceas = window.setInterval(() => {
      setK((x) => {
        if (x + 1 >= TOTAL_LOT) window.clearInterval(ceas);
        return Math.min(TOTAL_LOT, x + 1);
      });
    }, PAS_LOT_MS);
    return () => window.clearInterval(ceas);
  }, [stare]);
  if (stare === "static") return TOTAL_LOT;
  if (stare === "asteapta") return 0;
  return k;
}

export default function Lot() {
  const ref = useRef<HTMLDivElement>(null);
  const stare = usePragOdata(ref, PRAG_LOT);
  const k = useSecventa(stare);
  const gata = k >= TOTAL_LOT;
  const lucreaza = k > 0 && !gata;
  const restulInLot = Math.max(0, k - LOT.acte.length);
  const eticheta = gata ? TOTAL_LOT + " / " + TOTAL_LOT + " · " + LOT.butonFinal : lucreaza ? LOT.butonLucru + " " + k + " / " + TOTAL_LOT : LOT.butonInitial + " · " + TOTAL_LOT;

  return (
    <SectiuneScena inaltime={110} spatiere="scena" latime={920} nume="lot">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{LOT.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{LOT.paragraf}</p>
      <div ref={ref} className={s.intraLot}>
        <Fereastra titlu={LOT.aplicatie} dreapta={LOT.dreapta} declaratie={LOT.declaratie} className={s.fereastraLot} baraClassName={s.baraLot} nume="lot">
          <div className={s.corpLot}>
            <ul className={s.file}>
              {LOT.file.map((f, i) => (
                <li key={f.eticheta} className={[s.fila, i === 1 ? s.filaActiva : ""].filter(Boolean).join(" ")}>
                  <span className={s.cutieFila}>
                    <IconitaFila fel={f.iconita} />
                  </span>
                  <span className={s.textFila}>
                    <span className={s.etichetaFila}>{f.eticheta}</span>
                    <span className={s.descriereFila}>{f.descriere}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className={s.zonaLot}>
              <div className={s.capLot}>
                <span className={s.grupBifate}>
                  <span className={s.pastilaBifate}>
                    <span className={s.bifaAlbastra} aria-hidden="true">
                      <Check width={11} height={11} strokeWidth={3} />
                    </span>
                    <span className={s.etichetaBifate}>{LOT.bifate}</span>
                    <span className={s.numarBifate}>{TOTAL_LOT}</span>
                  </span>
                  <span className={s.exemplu}>{LOT.exemplu}</span>
                </span>
                <span className={s.butonLot} data-stare={gata ? "gata" : lucreaza ? "lucreaza" : "initial"}>
                  {lucreaza ? <span className={s.rotita} aria-hidden="true" /> : null}
                  {gata ? <Check width={14} height={14} strokeWidth={3} aria-hidden="true" focusable="false" /> : null}
                  {eticheta}
                </span>
              </div>
              <ul className={s.acte}>
                {LOT.acte.map((a, i) => {
                  const inLot = k > i;
                  return (
                    <li key={a} className={s.act} data-in-lot={inLot ? "da" : "nu"}>
                      <span className={s.caseta} aria-hidden="true">
                        {inLot ? <Check width={11} height={11} strokeWidth={3} /> : null}
                      </span>
                      <span className={s.etPdfLot}>PDF</span>
                      <span className={s.numeAct}>{a}</span>
                      <span className={s.stareAct}>
                        <span className={s.punctAct} aria-hidden="true" />
                        {inLot ? LOT.stareFinala : LOT.stareInitiala}
                      </span>
                    </li>
                  );
                })}
                <li className={s.restul} data-in-lot={restulInLot >= LOT.restul ? "da" : "nu"} style={{ "--k": String(restulInLot) } as CSSProperties}>
                  <span className={s.caseta} aria-hidden="true">
                    {restulInLot >= LOT.restul ? <Check width={11} height={11} strokeWidth={3} /> : null}
                  </span>
                  <span className={s.textRestul}>încă {LOT.restul} acte</span>
                  <span className={s.contorRestul}>
                    {restulInLot} / {LOT.restul}
                  </span>
                </li>
              </ul>
              <dl className={s.subsolLot}>
                {LOT.statistici.map((st) => (
                  <div key={st.cheie} className={s.statLot}>
                    <dt className={s.cheieStat}>{st.cheie}</dt>
                    <dd className={s.valoareStat}>{st.valoare}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Fereastra>
      </div>
      <p className={s.notaLot}>
        <Monitor width={13} height={13} strokeWidth={2} aria-hidden="true" focusable="false" />
        {LOT.nota}
      </p>
    </SectiuneScena>
  );
}
