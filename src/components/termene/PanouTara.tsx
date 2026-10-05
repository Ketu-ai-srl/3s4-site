// Panoul unei tari (instrumente__termene-pastrare.md §2): cap cu steag, nume si contor; cele 7
// randuri-acordeon (`details` independente, se pot deschide toate); nota de final cu data citirii.
//
// Randul CONFIRMAT: de cand curge termenul, temeiul legal in cutia cu linie albastra, apoi
// legaturile spre sursele primare (fereastra noua). Randul NECONFIRMAT: de ce nu dam o cifra, plus
// textele de lege pe care se sprijina motivul, cand exista.
//
// PE EDITIE: etichetele, contorul, nota, numele tipurilor de acte si sufixul pentru cititorul de
// ecran vin prin `continut`, cu implicitul romanesc (componenta de server, deci functiile trec).
// Tara insasi (randurile, sursele) vine deja prin `tara`.

import { ChevronDown, ExternalLink } from "lucide-react";
import { INSTRUMENT, numarConfirmate, numeTip, type CodTip, type RandTermen, type SursaPrimara, type Tara } from "@/content/termene/date";
import Steag from "./Steag";
import s from "./termene.module.css";

export type ContinutPanouTara = {
  contor: (confirmate: number, total: number) => string;
  neconfirmat: string;
  etichete: { inceput: string; temei: string; motiv: string };
  nota: string;
  numeTip: (cod: CodTip) => string;
  /** Textul pentru cititorul de ecran de dupa fiecare sursa, cu spatiul de inceput. */
  fereastraNoua: string;
};

const IMPLICIT: ContinutPanouTara = {
  contor: INSTRUMENT.contor,
  neconfirmat: INSTRUMENT.neconfirmat,
  etichete: INSTRUMENT.etichete,
  nota: INSTRUMENT.nota,
  numeTip,
  fereastraNoua: " (se deschide într-o fereastră nouă)",
};

function Surse({ surse, fereastraNoua }: { surse: SursaPrimara[]; fereastraNoua: string }) {
  if (surse.length === 0) return null;
  return (
    <ul className={s.surse}>
      {surse.map((su) => (
        <li key={su.url}>
          <a className={s.sursa} href={su.url} target="_blank" rel="noopener nofollow">
            <span>{su.eticheta}</span>
            <span className="doar-cititor">{fereastraNoua}</span>
            <ExternalLink size={13} strokeWidth={2} aria-hidden="true" focusable="false" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Rand({ rand, c }: { rand: RandTermen; c: ContinutPanouTara }) {
  const e = c.etichete;
  return (
    <details className={s.rand}>
      <summary className={s.rezumat}>
        <span className={s.tip}>{c.numeTip(rand.tip)}</span>
        {rand.valoare !== null ? (
          <span className={s.valoare}>{rand.valoare}</span>
        ) : (
          <span className={s.lipsa}>{c.neconfirmat}</span>
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
        <Surse surse={rand.surse} fereastraNoua={c.fereastraNoua} />
      </div>
    </details>
  );
}

export default function PanouTara({ tara, continut = IMPLICIT }: { tara: Tara; continut?: ContinutPanouTara }) {
  const c = continut;
  const idTitlu = "tara-" + tara.cod;
  return (
    <section className={s.panou} aria-labelledby={idTitlu}>
      <header className={s.panouCap}>
        <h2 id={idTitlu} className={s.panouTitlu}>
          <Steag cod={tara.cod} className={s.steagTitlu} />
          {tara.nume}
        </h2>
        <p className={s.contor}>{c.contor(numarConfirmate(tara), tara.randuri.length)}</p>
      </header>
      <div>
        {tara.randuri.map((r) => (
          <Rand key={r.tip} rand={r} c={c} />
        ))}
      </div>
      <p className={s.nota}>{c.nota}</p>
    </section>
  );
}
