"use client";

// Calculatorul, VEDEREA (preturi.md §6a-§6b). Sus sta TEASER-ul: un buton cu presupunerile de pornire si
// rezultatul lor; la clic e INLOCUIT de calculator (nu exista buton de inchidere), cu o dezvaluire de
// 0,5 s. Trei cursoare: persoane, minute pe zi, tariful unei ore. Formula e in `calcul.ts`.
//
// La 3S cursorul tarifului porneste dintr-o grila care contine valoarea de pornire si capatul (la
// referinta valoarea afisata nu era pe grila; fisa, §6b). Focusul trece pe primul cursor dupa
// deschidere, ca tastatura sa nu ramana pe un buton disparut.
//
// PE EDITIE: vederea nu importa niciun continut. Textele (cu moneda lor), cursoarele, legatura spre
// linia enterprise si gramatica numeralului (valoarea spusa cititorului de ecran, fraza "peste
// conturi") vin de la invelitoarea editiei (`Calculator.tsx` pe RO), iar planurile si formatul cifrelor
// sunt proprietati. Tot invelitoarea da `laPrimaFolosire`, apelata o singura data, la prima miscare a
// unui cursor (analitica, ceruta lenes de invelitoare).

import { useEffect, useId, useRef, useState, type ChangeEvent, type Ref } from "react";
import Iconita from "@/components/primitive/Iconita";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import type { Legatura } from "@/content/navigatie";
import type { Cursor, Perioada, Plan } from "@/content/preturi";
import { calculeaza, FORMAT_ROMANESC, type FormatCifre, type Intrari } from "./calcul";
import s from "./pachete.module.css";

type CheieCursor = keyof Intrari;

const ORDINE: CheieCursor[] = ["persoane", "minute", "tarif"];

/** Continutul calculatorului, pe editie. */
export type ContinutCalculator = {
  /** Textul teaserului, compus de editie din valorile de pornire. */
  teaser: { presupuneri: string; rezultat: string; cta: string };
  /** Numele accesibil al calculatorului deschis. */
  eticheta: string;
  cursoare: Record<CheieCursor, Cursor>;
  zileLucratoare: number;
  timpAcum: { inainte: string; dupaBani: string; dupaOre: string };
  pretInOre: { inainte: string; dupaPlan: string; dupaPret: string; dupaOre: string };
  /** Fraza cand echipa trece de conturile celui mai mare pachet; numeralul il acorda editia. */
  pesteConturi: { inainte: (persoane: number) => string; dupa: string };
  nota: string;
  /** Valoarea unui cursor, spusa cititorului de ecran (`aria-valuetext`). */
  valoareSpusa: (cursor: Cursor, n: number) => string;
  /** Legatura spre linia enterprise; textul ei e numele intreg al liniei. */
  enterprise: Legatura;
};

export type CalculatorVedereProps = {
  perioada: Perioada;
  continut: ContinutCalculator;
  planuri: readonly Plan[];
  /** Formatul cifrelor; implicit cel romanesc (punct la mii, virgula zecimala). */
  format?: FormatCifre;
  /** Apelata o singura data, la prima folosire a unui cursor. */
  laPrimaFolosire?: () => void;
};

function Camp({
  id,
  cursor,
  valoare,
  lat,
  spusa,
  laSchimbare,
  refIntrare,
}: {
  id: string;
  cursor: Cursor;
  valoare: number;
  lat: boolean;
  spusa: string;
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
          aria-valuetext={spusa}
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

export default function CalculatorVedere({
  perioada,
  continut,
  planuri,
  format = FORMAT_ROMANESC,
  laPrimaFolosire,
}: CalculatorVedereProps) {
  const baza = useId();
  const [deschis, setDeschis] = useState(false);
  const [intrari, setIntrari] = useState<Intrari>(() => ({
    persoane: continut.cursoare.persoane.implicit,
    minute: continut.cursoare.minute.implicit,
    tarif: continut.cursoare.tarif.implicit,
  }));
  const primul = useRef<HTMLInputElement>(null);
  const trimis = useRef(false);
  const teaser = continut.teaser;

  useEffect(() => {
    if (deschis) primul.current?.focus({ preventScroll: true });
  }, [deschis]);

  const schimba = (cheie: CheieCursor) => (v: number) => {
    setIntrari((i) => ({ ...i, [cheie]: v }));
    if (!trimis.current) {
      trimis.current = true;
      laPrimaFolosire?.();
    }
  };

  const r = calculeaza(intrari, perioada, planuri, continut.zileLucratoare);
  const t = continut.timpAcum;
  const p = continut.pretInOre;
  const e = continut.pesteConturi;

  return (
    <Reveal className={s.calc}>
      {deschis ? (
        <div className={s.deschis + " " + s.dezvaluire} role="group" aria-label={continut.eticheta}>
          <div className={s.campuri}>
            {ORDINE.map((cheie, i) => (
              <Camp
                key={cheie}
                id={baza + "-" + cheie}
                cursor={continut.cursoare[cheie]}
                valoare={intrari[cheie]}
                lat={cheie === "tarif"}
                spusa={continut.valoareSpusa(continut.cursoare[cheie], intrari[cheie])}
                laSchimbare={schimba(cheie)}
                refIntrare={i === 0 ? primul : undefined}
              />
            ))}
          </div>
          <div className={s.linie} aria-hidden="true" />
          <div className={s.iesire} aria-live="polite">
            <p className={s.frazaIesire}>
              {t.inainte}
              <strong>{format.bani(r.bani)}</strong>
              {t.dupaBani}
              <strong>{format.ore(r.ore)}</strong>
              {t.dupaOre}
            </p>
            {r.plan !== null && r.pret !== null && r.oreEchivalent !== null ? (
              <p className={s.frazaIesire + " " + s.frazaPlan}>
                {p.inainte}
                <strong>{r.plan.nume}</strong>
                {p.dupaPlan}
                {format.bani(r.pret)}
                {p.dupaPret}
                <strong>{format.zecimal(r.oreEchivalent)}</strong>
                {p.dupaOre}
              </p>
            ) : (
              // Echipa nu incape in niciun pachet: nu se recomanda cel mai mare, se trimite la
              // linia Enterprise (prin Tinta: cat timp ruta lipseste, elementul e inert).
              <p className={s.frazaIesire + " " + s.frazaPlan}>
                {e.inainte(intrari.persoane)}
                {/* Numele intreg al liniei (textul legaturii): eticheta scurta a cardului din poarta poate fi
                    alta, dar in fraza calculatorului linia isi pastreaza marca. */}
                <Tinta legatura={continut.enterprise}>
                  <strong>{continut.enterprise.text}</strong>
                </Tinta>
                {e.dupa}
              </p>
            )}
          </div>
          <p className={s.nota}>{continut.nota}</p>
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
            {teaser.cta}
            <Iconita nume="arrow-right" marime={14} contur={2} />
          </span>
        </button>
      )}
    </Reveal>
  );
}
