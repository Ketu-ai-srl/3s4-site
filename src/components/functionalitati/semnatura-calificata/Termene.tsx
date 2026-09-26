// S6 - termenele certificatelor (functionalitati__semnatura-calificata.md, S6): eticheta chihlimbar, titlul,
// paragraful si fereastra 680 x ~413 (banda de metadate, 3 randuri pe gravitate, nota, butonul pe toata
// latimea).
//
// CE E ADEVARAT AZI: termenele actelor stau in registrul arhivei 3S. Data certificatului si re-semnarea vin
// cu integrarea in curs cu furnizorii acreditati (D4c); butonul spune asta, iar nota o repeta. Niciun emitent
// real nu e numit (la referinta, doua autoritati de certificare reale).
//
// Butonul e DECORATIV, ca la referinta (clicul nu face nimic): un `span` cu forma de buton si hover-ul
// masurat (#1d4ed8, 0,25 s), fara focus. Fara miscare legata de derulare (fisa S6).
//
// La 390 numele fisierului ia tot randul al doilea, iar zilele trec langa gravitate (la referinta numele
// cadea in coloana de 8 px si se vedea doar prima litera).

import { RefreshCw } from "lucide-react";
import Fereastra, { PatratTip } from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { TERMENE } from "@/content/functionalitati/semnatura-calificata";
import s from "./semnatura.module.css";

export default function Termene() {
  const t = TERMENE;
  return (
    <SectiuneScena inaltime={90} spatiere="scena" latime={760} nume="termene">
      <p className={s.etichetaChihlimbar}>
        <span className={s.punctChihlimbar} aria-hidden="true" />
        {t.eticheta}
      </p>
      <h2 className={["t-h2-cinema", s.titluSectiune, s.titluDeschis].join(" ")}>{t.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{t.paragraf}</p>
      <Fereastra
        titlu={t.modul}
        dreapta={
          <span className={s.dreaptaTermene}>
            <span className={[s.exemplu, s.exempluTermene].join(" ")}>{t.exemplu}</span>
            <span className={s.interval}>{t.interval}</span>
          </span>
        }
        declaratie={t.declaratie}
        className={s.fereastraTermene}
        baraClassName={s.baraTermene}
        nume="termene"
      >
        <div className={s.corpTermene}>
          <dl className={s.banda}>
            {t.banda.map((b) => (
              <div key={b.cheie} className={s.blocBanda}>
                <dt className={s.cheieBanda}>{b.cheie}</dt>
                <dd className={[s.valoareBanda, s["banda-" + b.fel]].join(" ")}>{b.valoare}</dd>
              </div>
            ))}
          </dl>
          <ul className={s.randuriTermene}>
            {t.randuri.map((r) => (
              <li key={r.fisier} className={[s.randTermen, s["grav-" + r.gravitate]].join(" ")}>
                <span className={s.punctTermen} aria-hidden="true" />
                <PatratTip tip="pdf" className={s.patratTermen} />
                <span className={s.fisierTermen}>{r.fisier}</span>
                <span className={s.zileTermen}>{r.zile}</span>
                <span className={s.gravitate}>{r.eticheta}</span>
              </li>
            ))}
          </ul>
          <p className={s.notaTermene}>{t.nota}</p>
          <span className={s.butonTermene}>
            <span className={s.cutieButon} aria-hidden="true">
              <RefreshCw width={14} height={14} strokeWidth={2} />
            </span>
            {t.buton}
          </span>
        </div>
      </Fereastra>
    </SectiuneScena>
  );
}
