// Panoul unei tari (instrumente__termene-pastrare.md §2): cap cu steag, nume si contor; cele 7
// randuri-acordeon (`details` independente, se pot deschide toate); nota de final cu data citirii.
//
// Randul CONFIRMAT: de cand curge termenul, temeiul legal in cutia cu linie albastra, apoi
// legaturile spre sursele primare (fereastra noua). Randul NECONFIRMAT: de ce nu dam o cifra, plus
// textele de lege pe care se sprijina motivul, cand exista.

import { ChevronDown, ExternalLink } from "lucide-react";
import { INSTRUMENT, numarConfirmate, numeTip, type RandTermen, type SursaPrimara, type Tara } from "@/content/termene/date";
import Steag from "./Steag";
import s from "./termene.module.css";

function Surse({ surse }: { surse: SursaPrimara[] }) {
  if (surse.length === 0) return null;
  return (
    <ul className={s.surse}>
      {surse.map((su) => (
        <li key={su.url}>
          <a className={s.sursa} href={su.url} target="_blank" rel="noopener nofollow">
            <span>{su.eticheta}</span>
            <span className="doar-cititor"> (se deschide într-o fereastră nouă)</span>
            <ExternalLink size={13} strokeWidth={2} aria-hidden="true" focusable="false" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Rand({ rand }: { rand: RandTermen }) {
  const e = INSTRUMENT.etichete;
  return (
    <details className={s.rand}>
      <summary className={s.rezumat}>
        <span className={s.tip}>{numeTip(rand.tip)}</span>
        {rand.valoare !== null ? (
          <span className={s.valoare}>{rand.valoare}</span>
        ) : (
          <span className={s.lipsa}>{INSTRUMENT.neconfirmat}</span>
        )}
        <ChevronDown size={16} strokeWidth={2} className={s.chevron} aria-hidden="true" focusable="false" />
      </summary>
      <div className={s.detaliu}>
        {rand.valoare !== null ? (
          <dl>
            <dt className={s.eticheta}>{e.inceput}</dt>
            <dd className={s.text}>{rand.inceput}</dd>
            <dt className={s.eticheta}>{e.temei}</dt>
            <dd className={s.text + " " + s.temei}>{rand.temei}</dd>
          </dl>
        ) : (
          <dl>
            <dt className={s.eticheta}>{e.motiv}</dt>
            <dd className={s.text}>{rand.motiv}</dd>
          </dl>
        )}
        <Surse surse={rand.surse} />
      </div>
    </details>
  );
}

export default function PanouTara({ tara }: { tara: Tara }) {
  const idTitlu = "tara-" + tara.cod;
  return (
    <section className={s.panou} aria-labelledby={idTitlu}>
      <header className={s.panouCap}>
        <h2 id={idTitlu} className={s.panouTitlu}>
          <Steag cod={tara.cod} className={s.steagTitlu} />
          {tara.nume}
        </h2>
        <p className={s.contor}>{INSTRUMENT.contor(numarConfirmate(tara), tara.randuri.length)}</p>
      </header>
      <div>
        {tara.randuri.map((r) => (
          <Rand key={r.tip} rand={r} />
        ))}
      </div>
      <p className={s.nota}>{INSTRUMENT.nota}</p>
    </section>
  );
}
