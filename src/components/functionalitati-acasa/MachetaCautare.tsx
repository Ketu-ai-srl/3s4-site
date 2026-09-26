"use client";

// Macheta pasului 1: cautarea in arhiva, cu 3 acte si rezumatul celui deschis (fisa §5).
//
// CICLUL: la 400 ms dupa pornirea ceasului se deschide randul 1, apoi la fiecare 3000 ms urmatorul
// (1 -> 2 -> 3 -> 1). Ceasul are un contor propriu, pe care nici hover-ul, nici clicul nu-l muta:
// cat timp mouse-ul sta pe un rand, bataile se sar; la iesire, urmatoarea bataie deschide randul de
// dupa cel deschis de ceas INAINTE de hover (fisa §5, "Contorul ciclului").
//
// INTERACTIUNILE, cu abaterile de la referinta (fisa §14.2, §14.9):
//   - mouse: hover-ul deschide randul si opreste bataile; clicul comuta intre randul atins si
//     "niciunul" - cum hover-ul l-a deschis deja, clicul il inchide (ca la referinta);
//   - atingere: la referinta atingerea emula hover + clic si inchidea tot, iar ciclul inghata.
//     Aici hover-ul se ia doar de la mouse, deci atingerea DESCHIDE randul atins; ca omul sa-l
//     poata citi, ceasul tace 10 s dupa atingere (cat tace si portalul dupa un clic pe tab);
//   - tastatura: randul e un `button` adevarat (la referinta, `role=button` fara Enter), cu
//     conturul de focus al site-ului; cat focusul de tastatura e in macheta, ceasul tace.
//
// RANDUL FOCALIZAT SE VEDE INTREG (WCAG 2.4.11). Macheta e mai inalta decat rama si e taiata jos
// (`overflow: clip`, deci focusul nu o mai poate derula, cum facea la `hidden`). Focusul de tastatura
// pe un rand il deschide pe el si le inchide pe celelalte, ca hover-ul; daca randul tot nu incape
// deasupra estomparii (pe pista de mobil randurile 2 si 3 nu incap niciodata in rama de 278 px),
// continutul urca exact cat trebuie. Cand focusul pleaca din macheta, revine la loc.
//
// STAREA STATICA (HTML fara JavaScript, miscare redusa): randul 1 deschis, ca rezumatul sa se
// vada. Cu miscare, dupa hidratare macheta porneste din starea de dinaintea primei deschideri.

import { useEffect, useId, useRef, useState } from "react";
import { CircleCheck, FileText, Search, Zap } from "lucide-react";
import { BIFA_TEXT, MACHETA_CAUTARE, ETICHETA_EXEMPLU } from "@/content/acasa-functionalitati";
import { areMiscareRedusa, useBataie, useMontat, useVizibil } from "./ceas";
import { useEstompare } from "./estompare";
import s from "./Machete.module.css";

/** Intarzierea de la pornirea ceasului pana la prima deschidere (fisa §5). */
export const INTARZIERE_CAUTARE = 400;
/** Perioada ciclului de randuri (fisa §5). */
export const PERIOADA_RANDURI = 3000;
/** Cat tace ceasul dupa o atingere sau o apasare de tasta. */
export const PAUZA_DUPA_ALEGERE = 10_000;
/** Loc pentru conturul de focus (decalaj 2 + grosime 2), sus si jos. */
export const MARGINE_FOCUS = 4;

/**
 * Cat urca continutul machetei ca randul focalizat sa se vada intreg, cu conturul lui, deasupra
 * estomparii de jos. `sus` si `inaltime`: randul in macheta nemutata; `rama`: inaltimea vizibila;
 * `jos`: inaltimea estomparii (0 fara ea). Daca randul e mai inalt decat locul, i se arata varful.
 */
export function deplasareRand(sus: number, inaltime: number, rama: number, jos: number, margine = MARGINE_FOCUS): number {
  const nevoie = Math.ceil(sus + inaltime + margine - (rama - jos));
  if (nevoie <= 0) return 0;
  return Math.max(0, Math.min(nevoie, Math.floor(sus - margine)));
}

/**
 * Unde va sta butonul randului `i` dupa ce se asaza randurile (`deschis` e randul deschis): sus
 * fata de rama, fara deplasare, si inaltimea lui. Se calculeaza din inaltimile finale, nu se citeste
 * din pagina: rezumatele se deschid si se inchid in 200 ms, iar la mijlocul tranzitiei pozitia e alta.
 */
function pozitieRand(lista: HTMLElement, i: number, deschis: number | null, rezumat: string): { sus: number; inaltime: number } | null {
  const randuri = Array.from(lista.children) as HTMLElement[];
  const cap = (r: HTMLElement | undefined) => r?.querySelector<HTMLElement>("button") ?? null;
  let sus = lista.offsetTop;
  for (let k = 0; k < i; k++) {
    const b = cap(randuri[k]);
    if (!b) return null;
    const deschisK = deschis === k ? (randuri[k].querySelector<HTMLElement>(rezumat)?.offsetHeight ?? 0) : 0;
    sus += b.offsetHeight + deschisK + (parseFloat(getComputedStyle(randuri[k]).borderBottomWidth) || 0);
  }
  const b = cap(randuri[i]);
  return b ? { sus, inaltime: b.offsetHeight } : null;
}

export type MachetaProps = {
  /** Macheta e a pasului activ (desktop) sau a cardului activ (pista). */
  activ: boolean;
  /** Estomparea de jos, cand macheta e mai inalta decat rama ei. */
  estompat?: boolean;
  /** Macheta nu primeste focus si nu e citita (un card al pistei aflat in afara ferestrei). */
  inert?: boolean;
  className?: string;
};

export default function MachetaCautare({ activ, estompat = false, inert = false, className }: MachetaProps) {
  const m = MACHETA_CAUTARE;
  const radacina = useRef<HTMLElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const vizibil = useVizibil(radacina);
  const montat = useMontat();
  const id = useId();

  const [deschis, setDeschis] = useState<number | null>(0);
  const [cuMiscare, setCuMiscare] = useState(false);
  const [peste, setPeste] = useState(false);
  const [focusTastatura, setFocusTastatura] = useState(false);
  // Randul pe care sta focusul de tastatura si cat urca continutul ca el sa se vada.
  const [randFocus, setRandFocus] = useState<number | null>(null);
  const [deplasare, setDeplasare] = useState(0);
  const ciclu = useRef(-1);
  const pauzaPana = useRef(0);
  const ultimulIndicator = useRef("");

  useEffect(() => {
    if (areMiscareRedusa()) return;
    setCuMiscare(true);
    setDeschis(null);
  }, []);

  useBataie(activ && vizibil && cuMiscare, INTARZIERE_CAUTARE, PERIOADA_RANDURI, () => {
    if (peste || focusTastatura || Date.now() < pauzaPana.current) return;
    ciclu.current = (ciclu.current + 1) % m.randuri.length;
    setDeschis(ciclu.current);
  });

  // La fiecare asezare noua a randurilor (focus, Enter, hover), randul focalizat ramane in rama.
  useEffect(() => {
    const fig = radacina.current;
    const l = lista.current;
    if (randFocus === null || !fig || !l) return;
    const poz = pozitieRand(l, randFocus, deschis, "." + CSS.escape(s.rezumatInterior));
    if (!poz) return;
    // Inaltimea estomparii se citeste din stilul calculat (`.estompat::after`, tinut la zi de
    // `estompare.ts`), nu se copiaza aici.
    const jos = parseFloat(getComputedStyle(fig, "::after").height) || 0;
    setDeplasare(deplasareRand(poz.sus, poz.inaltime, fig.clientHeight, jos));
  }, [randFocus, deschis]);

  // Cand slotul machetei devine inert (alt pas activ), focusul iese din ea. In Chromium iese prin
  // `blur` (masurat); in Firefox si Safari nemasurat. Starea de tastatura se reface deci si din DOM,
  // ca ceasul sa nu ramana oprit si continutul mutat daca un browser nu trimite `blur`.
  useEffect(() => {
    const fig = radacina.current;
    if (!fig || fig.contains(document.activeElement)) return;
    setFocusTastatura(false);
    setRandFocus(null);
    setDeplasare(0);
  }, [activ, inert]);

  // Estomparea de jos urmeaza randul deschis si deplasarea de tastatura (`estompare.ts`).
  useEstompare(radacina, estompat, deschis + "|" + deplasare);

  const mutat = deplasare > 0 ? { transform: "translateY(-" + deplasare + "px)" } : undefined;

  return (
    <figure
      ref={radacina}
      className={[s.macheta, s.cautare, estompat ? s.estompat : "", className ?? ""].filter(Boolean).join(" ")}
      inert={inert}
      onFocus={(e) => {
        if (!(e.target instanceof HTMLElement) || !e.target.matches(":focus-visible")) return;
        setFocusTastatura(true);
        const rand = e.target.closest<HTMLElement>("[data-rand]");
        if (!rand) return;
        const i = Number(rand.dataset.rand);
        setRandFocus(i);
        setDeschis(i);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setFocusTastatura(false);
        setRandFocus(null);
        setDeplasare(0);
      }}
    >
      <figcaption className="doar-cititor">{m.declaratie}</figcaption>
      <div className={s.cautareSus} style={mutat}>
        <div className={s.etichetaMacheta}>
          <Search width={13} height={13} strokeWidth={2} aria-hidden="true" />
          <span>{m.eticheta}</span>
          <span className={s.exemplu} aria-hidden="true">
            {ETICHETA_EXEMPLU}
          </span>
        </div>
        <div className={s.bara}>
          <Search width={13} height={13} strokeWidth={2} aria-hidden="true" />
          <span>{m.intrebare}</span>
        </div>
        <div className={s.gasite}>
          <CircleCheck width={12} height={12} strokeWidth={2.5} color="#22c55e" aria-hidden="true" />
          <span>{m.gasite}</span>
        </div>
      </div>
      <div ref={lista} className={s.lista} style={mutat}>
        {m.randuri.map((r, i) => {
          const eDeschis = deschis === i;
          const idRezumat = id + "-rezumat-" + i;
          return (
            <div
              key={r.fisier}
              className={s.rand}
              data-deschis={eDeschis ? "" : undefined}
              onPointerDown={(e) => {
                ultimulIndicator.current = e.pointerType;
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                setPeste(true);
                setDeschis(i);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") setPeste(false);
              }}
              onClick={() => {
                setDeschis((d) => (d === i ? null : i));
                if (ultimulIndicator.current !== "mouse") pauzaPana.current = Date.now() + PAUZA_DUPA_ALEGERE;
                ultimulIndicator.current = "";
              }}
            >
              <button
                type="button"
                className={s.randCap}
                data-rand={i}
                aria-expanded={montat ? eDeschis : undefined}
                aria-controls={montat ? idRezumat : undefined}
              >
                <span className={s.placuta} data-format={r.placuta.toLowerCase()}>
                  {r.placuta}
                </span>
                <span className={s.info}>
                  <span className={s.fisier}>{r.fisier}</span>
                  <span className={s.meta}>
                    <span className={s.tip} data-tip={r.tip.cod}>
                      {r.tip.text}
                    </span>
                    <span className={s.data}>{r.data}</span>
                  </span>
                </span>
                <span className={s.insigne}>
                  {r.scanat ? (
                    <span title={m.insigne.scanat}>
                      <CircleCheck width={14} height={14} strokeWidth={2.5} color="#22c55e" aria-hidden="true" />
                      <span className="doar-cititor">{m.insigne.scanat}</span>
                    </span>
                  ) : null}
                  <span title={m.insigne.etichetat} className={s.fulger}>
                    <Zap width={11} height={11} strokeWidth={2} strokeLinejoin="round" aria-hidden="true" />
                    <span className="doar-cititor">{m.insigne.etichetat}</span>
                  </span>
                </span>
              </button>
              <div className={s.rezumatRand} id={idRezumat} aria-hidden={eDeschis ? undefined : true}>
                <div className={s.rezumatTaiat}>
                  <div className={s.rezumatInterior}>
                    <div className={s.rezumatCutie}>
                      <span className={s.rezumatTitlu}>
                        <FileText width={10} height={10} strokeWidth={2} aria-hidden="true" />
                        {r.rezumat.titlu}
                      </span>
                      <span className={s.rezumatText}>{r.rezumat.text}</span>
                      <span className={s.rezumatInsigne}>
                        {r.scanat ? (
                          <span className={s.insignaVerde}>
                            <span aria-hidden="true">{BIFA_TEXT}</span>
                            {m.insigne.scanat}
                          </span>
                        ) : null}
                        <span className={s.insignaAlbastra}>{m.insigne.etichetat}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
