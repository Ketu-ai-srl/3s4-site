// Foaia de tiparit (instrumente__termene-pastrare.md, subpagina): bara (inapoi + tiparire), titlul
// si paragraful, rezumatul ambelor tari intr-un tabel, apoi fiecare tara cu cele 7 tipuri, temeiul
// si sursele scrise ca adrese (pe hartie o legatura trebuie sa se poata citi). La final, data
// citirii si adresa variantei interactive.

import { ArrowLeft } from "lucide-react";
import Tinta from "@/components/primitive/Tinta";
import { ADRESA_BAZA } from "@/content/rute";
import {
  CALE_TERMENE,
  INSTRUMENT,
  TARI,
  TIPAR,
  TIPURI,
  numeTip,
  type SursaPrimara,
} from "@/content/termene/date";
import ButonTiparire from "./ButonTiparire";
import Steag from "./Steag";
import s from "./tipar.module.css";

/** Adresa fara protocol, cum se scrie pe hartie. */
function faraProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function LinieSurse({ surse }: { surse: SursaPrimara[] }) {
  if (surse.length === 0) return null;
  return (
    <p className={s.sursaLinie}>
      {surse.map((su, i) => (
        <span key={su.url}>
          {i > 0 ? " · " : null}
          <a href={su.url} target="_blank" rel="noopener nofollow" title={su.eticheta}>
            {faraProtocol(su.url)}
          </a>
        </span>
      ))}
    </p>
  );
}

export default function FoaieTipar() {
  const e = INSTRUMENT.etichete;
  return (
    <div className={s.foaie}>
      <div className={s.bara}>
        <Tinta legatura={TIPAR.inapoi} className={s.inapoi}>
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" focusable="false" />
          <span>{TIPAR.inapoi.text}</span>
        </Tinta>
        <ButonTiparire text={TIPAR.buton} />
      </div>

      <h1 className={s.titlu}>{TIPAR.titlu}</h1>
      <p className={s.paragraf}>{TIPAR.paragraf}</p>

      <section className={s.rezumat} aria-labelledby="rezumat-titlu">
        <h2 id="rezumat-titlu" className={s.capSectiune}>
          {TIPAR.rezumat}
        </h2>
        <div className={s.tabelInvelis} role="region" aria-label={TIPAR.etichetaTabel} tabIndex={0}>
          <table className={s.tabel}>
            <thead>
              <tr>
                <th scope="col">{TIPAR.capTara}</th>
                {TIPURI.map((t) => (
                  <th key={t.cod} scope="col">
                    {t.nume}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TARI.map((t) => (
                <tr key={t.cod}>
                  <th scope="row">
                    <span className={s.taraCelula}>
                      <Steag cod={t.cod} className={s.steag} />
                      <span>{t.nume}</span>
                    </span>
                  </th>
                  {t.randuri.map((r) => (
                    <td key={r.tip}>
                      {r.valoare !== null ? (
                        r.valoare
                      ) : (
                        <>
                          <span className={s.semnLipsa} aria-hidden="true">
                            {TIPAR.semnNeconfirmat}
                          </span>
                          <span className="doar-cititor">{INSTRUMENT.neconfirmat}</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.legenda}>{TIPAR.legenda}</p>
      </section>

      {TARI.map((t) => (
        <section key={t.cod} className={s.tara} aria-labelledby={"tipar-" + t.cod}>
          <h2 id={"tipar-" + t.cod} className={s.capSectiune}>
            <Steag cod={t.cod} className={s.steag} />
            <span>{t.nume}</span>
          </h2>
          {t.randuri.map((r) => (
            <div key={r.tip} className={s.tipBloc}>
              <h3 className={s.tipCap}>
                <span>{numeTip(r.tip)}</span>
                <span className={r.valoare !== null ? s.valoare : s.valoareLipsa}>
                  {r.valoare ?? INSTRUMENT.neconfirmat}
                </span>
              </h3>
              {r.valoare !== null ? (
                <dl>
                  <dt className={s.eticheta}>{e.inceput}</dt>
                  <dd className={s.text}>{r.inceput}</dd>
                  <dt className={s.eticheta}>{e.temei}</dt>
                  <dd className={s.text}>{r.temei}</dd>
                </dl>
              ) : (
                <dl>
                  <dt className={s.eticheta}>{e.motiv}</dt>
                  <dd className={s.text}>{r.motiv}</dd>
                </dl>
              )}
              <LinieSurse surse={r.surse} />
            </div>
          ))}
        </section>
      ))}

      <footer className={s.nota}>
        <p>{TIPAR.nota}</p>
        <p className={s.adresa}>{faraProtocol(ADRESA_BAZA) + CALE_TERMENE}</p>
      </footer>
    </div>
  );
}
