// Corpul paginii /contact (contact.md; COMPONENTE §4.11, sablonul interior-880), componenta de SERVER.
//
// Ordinea masurata: eroul interior, caseta principala, grila de 7 carduri, panoul cu 4 randuri,
// cele 2 carduri cu fapte, formularul (piesa inghetata a feliei enterprise-formular), CTA-ul final.
//
// CE DIFERA DE REFERINTA, cu motivul:
//   - caseta principala nu arata o adresa de e-mail pana cand `config/brand.json` nu are una
//     confirmata; pana atunci butonul duce la formularul de pe pagina;
//   - cardurile nu sunt casute de posta pe departamente (3S nu are asemenea adrese): fiecare duce la
//     pagina site-ului care raspunde subiectului, iar randul albastru e calea paginii;
//   - panoul nu promite termene de raspuns (nicio tinta asumata in registrul de afirmatii): arata
//     canalele si starea lor, citita din comutatorul operatorului si din adresa marcii;
//   - cardurile de jos nu numesc o firma (decizia owner-ului din 24.09, doar brandul): arata marca si
//     platforma, cu faptele din registrul de afirmatii.

import { CalendarClock, Clock, Building2, Compass, Layers, Plug, ShieldCheck, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import Buton from "@/components/primitive/Buton";
import CapBloc from "@/components/primitive/CapBloc";
import EroulInterior from "@/components/primitive/EroulInterior";
import Tinta from "@/components/primitive/Tinta";
import { stareFormular, type StareFormular } from "@/components/formular/stare";
import { adresaMarcii } from "@/content/entitate";
import { ANCORA_FORMULAR_CONTACT, CALE_CONTACT, CONTACT, type CardSubiect } from "@/content/conversie";
import type { Legatura } from "@/content/navigatie";
import s from "./contact.module.css";

const ICONITE: Record<CardSubiect["iconita"], ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>> = {
  "building-2": Building2,
  wallet: Wallet,
  "shield-check": ShieldCheck,
  plug: Plug,
  layers: Layers,
  "calendar-clock": CalendarClock,
  compass: Compass,
};

export type RandPanou = { nume: string; legatura: Legatura | null; text?: string; stare: string };

/** Randurile panoului de canale, dupa starea formularului si adresa marcii. Functie pura, pentru probe. */
export function randuriCanale(stare: StareFormular, adresa: string | null): RandPanou[] {
  const c = CONTACT.canale;
  const deschis = stare.activ;
  return [
    {
      nume: c.formular.nume,
      legatura: c.formular.legatura,
      stare: deschis ? c.stareDeschis : c.stareFormularInchis,
    },
    {
      nume: c.cont.nume,
      legatura: c.cont.legatura,
      stare: deschis ? c.stareDeschis : c.stareFormularInchis,
    },
    adresa
      ? { nume: c.posta.nume, legatura: { text: adresa, href: "mailto:" + adresa, ruta: null }, stare: c.stareDeschis }
      : { nume: c.posta.nume, legatura: null, text: c.postaFaraAdresa, stare: c.starePostaInchisa },
    { nume: c.tur.nume, legatura: c.tur.legatura, stare: c.tur.stare },
  ];
}

/** Tinta butonului din caseta: adresa marcii, cand e confirmata; altfel formularul de pe pagina. */
export function tintaCaseta(adresa: string | null): Legatura {
  return adresa
    ? { text: adresa, href: "mailto:" + adresa, ruta: null }
    : { text: CONTACT.caseta.butonFormular, href: "#" + ANCORA_FORMULAR_CONTACT, ruta: CALE_CONTACT };
}

export default function PaginaContact({
  stare = stareFormular(),
  adresa = adresaMarcii(),
}: {
  stare?: StareFormular;
  adresa?: string | null;
}) {
  const c = CONTACT;
  const tinta = tintaCaseta(adresa);
  return (
    <>
      <EroulInterior
        fir={[
          { text: c.fir.acasa, cale: "/" },
          { text: c.fir.pagina, cale: CALE_CONTACT },
        ]}
        titlu={c.erou.titlu}
        subtitlu={c.erou.subtitlu}
      />

      <section className={s.sectiuneCaseta} aria-labelledby="contact-caseta">
        <div className="container-site">
          <div className={s.bloc}>
            <div className={s.caseta}>
              <h2 id="contact-caseta" className={"t-h2-bloc " + s.casetaTitlu}>
                {c.caseta.titlu}
              </h2>
              <p className={s.casetaText}>{c.caseta.text}</p>
              <div className={s.casetaRand}>
                <Buton varianta="plin" marime="plat" legatura={tinta}>
                  {tinta.text}
                </Buton>
                <p className={s.casetaNota}>{c.caseta.nota}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.sectiuneBloc} aria-labelledby="contact-subiecte">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="contact-subiecte" titlu={c.subiecte.titlu} text={c.subiecte.text} marimeText={16} margineJos={0} />
          </div>
          <ul className={s.grila} role="list">
            {c.subiecte.carduri.map((card) => {
              const Ic = ICONITE[card.iconita];
              return (
                <li key={card.titlu} className={s.celula}>
                  <Tinta legatura={card.legatura} className={s.card}>
                    <Ic size={20} strokeWidth={1.5} className={s.cardIconita} aria-hidden />
                    <span className={s.cardTitlu}>{card.titlu}</span>
                    <span className={s.cardText}>{card.descriere}</span>
                    <span className={s.cardAdresa}>{card.legatura.text}</span>
                  </Tinta>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className={s.sectiuneBloc} aria-labelledby="contact-canale">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="contact-canale" titlu={c.canale.titlu} text={c.canale.text} marimeText={16} margineJos={0} />
            <ul className={s.panou} role="list">
              {randuriCanale(stare, adresa).map((r) => (
                <li key={r.nume} className={s.rand}>
                  <span className={s.randStanga}>
                    <span className={s.randNume}>{r.nume}</span>
                    {r.legatura ? (
                      <Tinta legatura={r.legatura} className={s.randLegatura}>
                        {r.legatura.text}
                      </Tinta>
                    ) : (
                      <span className={s.randText}>{r.text}</span>
                    )}
                  </span>
                  <span className={s.randStare}>
                    <Clock size={14} strokeWidth={1.5} className={s.randCeas} aria-hidden />
                    {r.stare}
                  </span>
                </li>
              ))}
            </ul>
            <p className={s.notaPanou}>
              <strong>{c.canale.notaEticheta}</strong> {stare.activ ? c.canale.notaDeschis : c.canale.notaInchis}
            </p>
          </div>
        </div>
      </section>

      <section className={s.sectiuneBloc} aria-labelledby="contact-marca">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="contact-marca" titlu={c.marca.titlu} text={c.marca.text} marimeText={16} margineJos={0} />
            <div className={s.carduriMarca}>
              {c.marca.carduri.map((card) => (
                <article key={card.titlu} className={s.cardMarca}>
                  <h3 className={s.cardMarcaTitlu}>{card.titlu}</h3>
                  <p className={s.cardMarcaRol}>{card.rol}</p>
                  <dl className={s.fapte}>
                    {card.fapte.map((f) => (
                      <div key={f.eticheta} className={s.fapt}>
                        <dt className={s.faptEticheta}>{f.eticheta}</dt>
                        <dd className={[s.faptValoare, f.mono ? s.faptMono : ""].filter(Boolean).join(" ")}>{f.valoare}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
