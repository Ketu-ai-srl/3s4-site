"use client";

// Calculatorul (preturi.md §6a-§6b). Sus sta TEASER-ul: un buton cu presupunerile de pornire si
// rezultatul lor; la clic e INLOCUIT de calculator (nu exista buton de inchidere), cu o dezvaluire de
// 0,5 s. Trei cursoare: persoane, minute pe zi, tariful unei ore. Formula e in `calcul.ts`.
//
// La 3S cursorul tarifului porneste dintr-o grila care contine valoarea de pornire si capatul (la
// referinta valoarea afisata nu era pe grila; fisa, §6b). Focusul trece pe primul cursor dupa
// deschidere, ca tastatura sa nu ramana pe un buton disparut. Folosirea calculatorului pleaca spre
// analitica o singura data, din lista inchisa (`calculator_folosit`), si numai cu consimtamant.
//
// Codul evenimentelor se cere LENES, la prima folosire, si numai cand analitica e pornita la
// construire (`analitica`). Un import static l-ar fi pus in bucata paginii, iar Next o preincarca pe
// orice pagina cu legatura spre preturi: cu analitica oprita, fanionul de oprire GA4 ajungea astfel
// in JavaScript-ul fiecarei rute (tests/browser/comutator.spec.ts, masurat rosu pe /, /preturi si
// 404 inainte de schimbarea asta).

import { useEffect, useId, useRef, useState, type ChangeEvent, type Ref } from "react";
import Iconita from "@/components/primitive/Iconita";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import { CALCULATOR, PLANURI, POARTA_ENTERPRISE, cuDe, valoareSpusa, type Cursor, type Perioada } from "@/content/preturi";
import { calculeaza, formatBani, formatOre, formatZecimal, type Intrari } from "./calcul";
import s from "./pachete.module.css";

type CheieCursor = keyof typeof CALCULATOR.cursoare;

const ORDINE: CheieCursor[] = ["persoane", "minute", "tarif"];

const IMPLICITE: Intrari = {
  persoane: CALCULATOR.cursoare.persoane.implicit,
  minute: CALCULATOR.cursoare.minute.implicit,
  tarif: CALCULATOR.cursoare.tarif.implicit,
};

/** Textul teaserului, din valorile de pornire: "Cu 5 colegi care ... 30 de minute ...". */
export function textTeaser(): { presupuneri: string; rezultat: string } {
  const r = calculeaza(IMPLICITE, "anual", PLANURI, CALCULATOR.zileLucratoare);
  const p = IMPLICITE.persoane;
  const m = IMPLICITE.minute;
  return {
    presupuneri: CALCULATOR.teaser.presupuneri(p + cuDe(p) + (p === 1 ? " coleg" : " colegi"), m + cuDe(m) + " minute"),
    rezultat: CALCULATOR.teaser.rezultat(formatOre(r.ore) + cuDe(r.ore) + " ore"),
  };
}

function Camp({
  id,
  cursor,
  valoare,
  lat,
  laSchimbare,
  refIntrare,
}: {
  id: string;
  cursor: Cursor;
  valoare: number;
  lat: boolean;
  laSchimbare: (v: number) => void;
  refIntrare?: Ref<HTMLInputElement>;
}) {
  return (
    <div className={s.camp + (lat ? " " + s.campLat : "")}>
      <label htmlFor={id} className={s.etichetaCamp}>
        {cursor.eticheta}
      </label>
      <div className={s.control}>
        <input
          ref={refIntrare}
          id={id}
          type="range"
          className={s.cursor}
          min={cursor.min}
          max={cursor.max}
          step={cursor.pas}
          value={valoare}
          aria-valuetext={valoareSpusa(cursor, valoare)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => laSchimbare(Number(e.target.value))}
        />
        <output htmlFor={id} className={s.valoare} aria-hidden="true">
          {valoare}
          {cursor.unitate ? <small className={s.unitate}>{cursor.unitate}</small> : null}
        </output>
      </div>
    </div>
  );
}

export default function Calculator({ perioada, analitica }: { perioada: Perioada; analitica: boolean }) {
  const baza = useId();
  const [deschis, setDeschis] = useState(false);
  const [intrari, setIntrari] = useState<Intrari>(IMPLICITE);
  const primul = useRef<HTMLInputElement>(null);
  const trimis = useRef(false);
  const teaser = textTeaser();

  useEffect(() => {
    if (deschis) primul.current?.focus({ preventScroll: true });
  }, [deschis]);

  const schimba = (cheie: CheieCursor) => (v: number) => {
    setIntrari((i) => ({ ...i, [cheie]: v }));
    if (!trimis.current) {
      trimis.current = true;
      if (analitica) {
        void import("@/components/consimtamant/evenimente").then((m) => m.trimiteEveniment("calculator_folosit", {}));
      }
    }
  };

  const r = calculeaza(intrari, perioada, PLANURI, CALCULATOR.zileLucratoare);
  const t = CALCULATOR.timpAcum;
  const p = CALCULATOR.pretInOre;
  const e = CALCULATOR.pesteConturi;

  return (
    <Reveal className={s.calc}>
      {deschis ? (
        <div className={s.deschis + " " + s.dezvaluire} role="group" aria-label={CALCULATOR.eticheta}>
          <div className={s.campuri}>
            {ORDINE.map((cheie, i) => (
              <Camp
                key={cheie}
                id={baza + "-" + cheie}
                cursor={CALCULATOR.cursoare[cheie]}
                valoare={intrari[cheie]}
                lat={cheie === "tarif"}
                laSchimbare={schimba(cheie)}
                refIntrare={i === 0 ? primul : undefined}
              />
            ))}
          </div>
          <div className={s.linie} aria-hidden="true" />
          <div className={s.iesire} aria-live="polite">
            <p className={s.frazaIesire}>
              {t.inainte}
              <strong>{formatBani(r.bani)}</strong>
              {t.dupaBani}
              <strong>{formatOre(r.ore)}</strong>
              {t.dupaOre}
            </p>
            {r.plan !== null && r.pret !== null && r.oreEchivalent !== null ? (
              <p className={s.frazaIesire + " " + s.frazaPlan}>
                {p.inainte}
                <strong>{r.plan.nume}</strong>
                {p.dupaPlan}
                {formatBani(r.pret)}
                {p.dupaPret}
                <strong>{formatZecimal(r.oreEchivalent)}</strong>
                {p.dupaOre}
              </p>
            ) : (
              // Echipa nu incape in niciun pachet: nu se recomanda cel mai mare, se trimite la
              // linia Enterprise (prin Tinta: ruta vine in S4-3b, pana atunci elementul e inert).
              <p className={s.frazaIesire + " " + s.frazaPlan}>
                {e.inainte(intrari.persoane + cuDe(intrari.persoane))}
                <Tinta legatura={POARTA_ENTERPRISE.tinta}>
                  <strong>{POARTA_ENTERPRISE.nume}</strong>
                </Tinta>
                {e.dupa}
              </p>
            )}
          </div>
          <p className={s.nota}>{CALCULATOR.nota}</p>
        </div>
      ) : (
        <button type="button" className={s.teaser} onClick={() => setDeschis(true)}>
          <span className={s.teaserCalcul}>
            <span className={s.teaserPresupuneri}>{teaser.presupuneri}</span>
            <span className={s.teaserEgal} aria-hidden="true">
              <Iconita nume="arrow-right" marime={14} contur={2} />
            </span>
            <span className={s.teaserRezultat}>{teaser.rezultat}</span>
          </span>
          <span className={s.teaserCta}>
            {CALCULATOR.teaser.cta}
            <Iconita nume="arrow-right" marime={14} contur={2} />
          </span>
        </button>
      )}
    </Reveal>
  );
}
