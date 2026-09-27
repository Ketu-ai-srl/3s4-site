"use client";

// EroulCinema: primul ecran al paginilor de functionalitate (functionalitati__sablon.md §4.1).
// Sectiune de 100vh, bloc de cel mult 720 px centrat peste forma din hartii; de sus in jos: eticheta,
// titlul, terminalul cu intrebarea scrisa, subtitlul (dupa scriere, cu `fadeUp`), indiciul de derulare.
//
// COMPUNEREA, din piese exportate separat, in ordinea in care se vad:
//
//     <EroulCinema forma="lupa" samanta={11}>
//       <EtichetaErou>Funcționalitate 01</EtichetaErou>
//       <TitluErou>...</TitluErou>                       // h1; lipseste cand eticheta
//       <TerminalErou text="..." pas={35} />             //   e titlul (`<EtichetaErou titlu>`)
//       <SubtitluErou varianta="italic" dupaScriere>...</SubtitluErou>
//       <IndiciuDerulare text="derulează" />
//     </EroulCinema>
//
// FAZA SCRIERII, comuna piesei: `static` (HTML-ul servit si miscarea redusa: totul in starea finala),
// `scrie` (dupa montare, cu miscare: terminalul scrie, ce vine "dupa scriere" asteapta), `scris`
// (ultimul caracter a fost scris: subtitlul intra). O piesa proprie a paginii (caderea documentului de
// pe automatizari-ai) citeste faza cu `useFazaErou()`.
//
// Variantele masurate: automatizari-ai nu are terminal, iar subtitlul insusi se scrie litera cu litera
// (`<SubtitluErou scris="..." />`); cautare-ai nu are h1 in erou la referinta - la 3S eticheta e h1,
// cu aceeasi forma vizuala (`<EtichetaErou titlu>`), iar titlul CTA-ului final devine h2.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronDown, Search } from "lucide-react";
import FormaHartii from "./FormaHartii";
import type { FormaIconita, NumeForma } from "./forme";
import { areMiscareRedusa } from "./miscare";
import { useScriere } from "./scriere";
import TextScris from "./TextScris";
import s from "./EroulCinema.module.css";

export type FazaErou = "static" | "scrie" | "scris";

type ContextErouValoare = { faza: FazaErou; laScris: () => void };

const ContextErou = createContext<ContextErouValoare>({ faza: "static", laScris: () => {} });

/** Faza scrierii din eroul din jur. In afara unui erou: `static`. */
export function useFazaErou(): FazaErou {
  return useContext(ContextErou).faza;
}

export type EroulCinemaProps = {
  children: ReactNode;
  /** Iconita formei din hartii: lupa, fulger, persoane, document, telefon, semnatura, sau o forma data. */
  forma: NumeForma | FormaIconita;
  /** Samanta asezarii foilor; aceeasi samanta, aceeasi forma la fiecare incarcare. */
  samanta?: number;
  /** Eroul are un text scris (terminal sau subtitlu scris)? Fara el, nimic nu asteapta scrierea. */
  cuScriere?: boolean;
  className?: string;
  blocClassName?: string;
};

export default function EroulCinema({ children, forma, samanta, cuScriere = true, className, blocClassName }: EroulCinemaProps) {
  const [faza, setFaza] = useState<FazaErou>("static");

  useEffect(() => {
    if (!cuScriere || areMiscareRedusa()) return;
    setFaza((f) => (f === "static" ? "scrie" : f));
  }, [cuScriere]);

  const laScris = useCallback(() => setFaza("scris"), []);

  return (
    <ContextErou.Provider value={{ faza, laScris }}>
      <section className={[s.erou, className].filter(Boolean).join(" ")} data-sectiune="erou" data-faza={faza}>
        <FormaHartii forma={forma} samanta={samanta} />
        <div className={[s.bloc, blocClassName].filter(Boolean).join(" ")}>{children}</div>
      </section>
    </ContextErou.Provider>
  );
}

export type EtichetaErouProps = {
  children: ReactNode;
  /** Eticheta e titlul paginii (h1), cu forma vizuala a etichetei (cautare-ai). */
  titlu?: boolean;
  className?: string;
};

/** Eticheta "Funcționalitate 0N" (13,6 / 600, `ardezie-4`, 24 px sub ea). */
export function EtichetaErou({ children, titlu = false, className }: EtichetaErouProps) {
  const clase = ["t-eticheta-cinema", s.eticheta, className].filter(Boolean).join(" ");
  return titlu ? <h1 className={clase}>{children}</h1> : <p className={clase}>{children}</p>;
}

export type TitluErouProps = {
  children: ReactNode;
  /** Spatierea literelor: -0,03 em (implicit) sau -0,02 em (automatizari-ai). */
  spatiere?: "normala" | "stransa";
  className?: string;
};

/** Titlul mare (72 / 600 / 79,2 la 1440; 38,4 la 390), `ardezie-1`. */
export function TitluErou({ children, spatiere = "normala", className }: TitluErouProps) {
  return (
    <h1 className={["t-h1-cinema", s.titlu, spatiere === "stransa" ? s.titluStrans : "", className].filter(Boolean).join(" ")}>
      {children}
    </h1>
  );
}

export type TerminalErouProps = {
  /** Intrebarea scrisa. */
  text: string;
  /** Ms pe caracter: 32 implicit, 35 pe cautare-ai. */
  pas?: number;
  /** Latimea cardului: 600 (implicit, margini 24 60 0) sau 660 (cautare-ai, margini 0 30). */
  latime?: 600 | 660;
  /** Marimea textului: 17,6 / 26,4 (implicit) sau 18,4 / 27,6 (cautare-ai). */
  marime?: "normala" | "mare";
  /** Numele din bara ferestrei (mono 11,52). La 3S: marca, scrisa ca text. */
  marca?: string;
  className?: string;
};

/** Terminalul cu intrebarea scrisa (fisa §4.1): card `ardezie-9`, bara de 35 px, lupa, text scris. */
export function TerminalErou({ text, pas, latime = 600, marime = "normala", marca = "3S", className }: TerminalErouProps) {
  const { laScris } = useContext(ContextErou);
  const scriere = useScriere(text, { pas, laFinal: laScris });
  return (
    <div
      className={[s.terminal, latime === 660 ? s.terminalLat : "", className].filter(Boolean).join(" ")}
      data-terminal=""
    >
      <div className={s.bara}>
        <span className={s.punct} aria-hidden="true" />
        <span className={s.marca}>{marca}</span>
      </div>
      <div className={s.corpTerminal}>
        <TextScris
          text={text}
          stare={scriere.stare}
          scrise={scriere.scrise}
          className={[s.intrebare, marime === "mare" ? s.intrebareMare : ""].filter(Boolean).join(" ")}
          inainte={<Search className={s.lupa} width={20} height={20} strokeWidth={2} aria-hidden="true" focusable="false" />}
        />
      </div>
    </div>
  );
}

/** Variantele de subtitlu masurate pe cele trei pagini (fisa §4.1 si fisele paginilor). */
export type VariantaSubtitlu =
  /** portal-clienti: italic 20 / 32, 24 px deasupra. */
  | "italic"
  /** cautare-ai, primul rand: 20 / 30, alb .55, 32 px deasupra. */
  | "rand-1"
  /** cautare-ai, al doilea rand: italic 20 / 30, 12,8 px deasupra. */
  | "rand-2"
  /** automatizari-ai: linia de liniste, italic 20 / 32, spatiere 0,8 px, 32 px deasupra. */
  | "liniste";

export type SubtitluErouProps = {
  children: ReactNode;
  varianta?: VariantaSubtitlu;
  /** Intra (`fadeUp`) abia dupa ce s-a terminat scrierea. */
  dupaScriere?: boolean;
  /** Intarzierea intrarii, in secunde (cautare-ai rand 2: 0,4; automatizari-ai: 1,5). */
  intarziere?: number;
  /** Durata intrarii, in secunde (0,6 implicit; 0,8 pe linia de liniste). */
  durata?: number;
  className?: string;
};

/**
 * Subtitlul eroului. La referinta randul stins avea alb .35 (3,05:1) si linia de liniste .3 (2,53:1):
 * la 3S textul de citit nu coboara sub .5 (5,30:1 pe `negru-cinema`), iar ierarhia ramane din italic.
 */
export function SubtitluErou({ children, varianta = "italic", dupaScriere = false, intarziere = 0, durata = 0.6, className }: SubtitluErouProps) {
  const { faza } = useContext(ContextErou);
  const intrare = !dupaScriere || faza === "static" ? "static" : faza === "scrie" ? "asteapta" : "intra";
  const stil = { "--intarziere": intarziere + "s", "--durata": durata + "s" } as CSSProperties;
  return (
    <p
      className={[s.subtitlu, s[VARIANTE_SUBTITLU[varianta]], className].filter(Boolean).join(" ")}
      data-intrare={dupaScriere ? intrare : undefined}
      style={stil}
    >
      {children}
    </p>
  );
}

const VARIANTE_SUBTITLU: Record<VariantaSubtitlu, string> = {
  italic: "subtitluItalic",
  "rand-1": "subtitluRand1",
  "rand-2": "subtitluRand2",
  liniste: "subtitluLiniste",
};

export type SubtitluScrisProps = {
  /** Subtitlul, scris litera cu litera (automatizari-ai: fara terminal). */
  text: string;
  pas?: number;
  className?: string;
};

/** Subtitlul scris (automatizari-ai): 18,4 / 500 / 29,44, alb .5, max 600, un rand rezervat. */
export function SubtitluScris({ text, pas, className }: SubtitluScrisProps) {
  const { laScris } = useContext(ContextErou);
  const scriere = useScriere(text, { pas, laFinal: laScris });
  return (
    <TextScris
      text={text}
      stare={scriere.stare}
      scrise={scriere.scrise}
      className={[s.subtitluScris, className].filter(Boolean).join(" ")}
    />
  );
}

export type IndiciuDerulareProps = {
  /** Cuvantul de langa chevron; fara el, numai chevronul (automatizari-ai). */
  text?: string;
  /** Spatierea literelor: 0,02 em (implicit) sau 0,01 em (portal-clienti, semnatura-calificata). */
  spatiere?: "normala" | "stransa";
  className?: string;
};

/** Indiciul de derulare (fisa §4.1): cuvant 12,8 + chevron 18, `bob` 2,5 s; fara legatura. */
export function IndiciuDerulare({ text, spatiere = "normala", className }: IndiciuDerulareProps) {
  if (!text) {
    return (
      <div className={[s.indiciu, s.indiciuChevron, className].filter(Boolean).join(" ")} data-indiciu="" aria-hidden="true">
        <ChevronDown width={18} height={18} strokeWidth={1.5} focusable="false" />
      </div>
    );
  }
  return (
    <div className={[s.indiciu, className].filter(Boolean).join(" ")} data-indiciu="">
      <span className={spatiere === "stransa" ? s.indiciuStrans : undefined}>{text}</span>
      <ChevronDown width={18} height={18} strokeWidth={1.5} aria-hidden="true" focusable="false" />
    </div>
  );
}
