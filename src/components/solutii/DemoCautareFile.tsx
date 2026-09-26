"use client";

// Cautarea cu 4 file de pe hub (solutii.md S3): fiecare fila tasteaza o interogare si arata
// rezultatul; la fiecare 6,5 s trece la fila urmatoare.
//
// COMPORTAMENTUL, pe fisa:
//   1. porneste cand 30% din card e vizibil, cu prima fila activa; 32 ms pe caracter;
//   2. rezultatul apare la 350 ms dupa ultima litera, in 0,45 s;
//   3. la fiecare 6,5 s trece la fila urmatoare, in ordine, si o ia de la capat: text gol, schelet,
//      tastare;
//   4. clicul pe o fila sare la ea, reia tastarea si reporneste ceasul de 6,5 s DE LA CLIC.
// Abaterile (COMPONENTE.md §4.5, §5.4, §5.5, §5.7):
//   - ciclul se OPRESTE cand cardul iese din fereastra si se reia de la inceputul filei la revenire
//     (la referinta continua nevazut si revii in mijlocul altei file);
//   - inaltimea e rezervata pentru cel mai inalt rezultat si cea mai lunga interogare (vezi
//     `CautareMacheta`), deci pagina nu mai sare la fiecare ciclu;
//   - la miscare redusa nu se tasteaza si nu se roteste nimic: fila aleasa se arata direct gata;
//   - cat timp focusul de TASTATURA e in card, ciclul sta (WCAG 2.2.2: continutul care se schimba
//     singur se poate opri); clicul cu mouse-ul nu opreste nimic, ca la referinta. Cat sta, fila
//     curenta si orice fila aleasa cu Enter se arata GATA (interogarea intreaga si rezultatul ei):
//     altfel oprirea ingheta textul tastat pana atunci si scheletul, iar o fila aleasa de la tastatura
//     ramanea asa, cu interogarea trunchiata si fara rezultat, cat timp focusul statea in card;
//   - cat timp mouse-ul sta pe card, filele nu se mai rotesc (WCAG 2.2.2 si pentru cine nu foloseste
//     tastatura): fila curenta isi termina tastarea si rezultatul, iar trecerea la urmatoarea se
//     amana pana iese mouse-ul. Clicul ramane ca la referinta (reia tastarea filei alese).
//
// HTML-UL SERVIT are prima fila in starea finala; celelalte trei stau in DOM, ascunse, ca rezerva de
// inaltime, deci si textul lor e in HTML-ul servit.

import { useEffect, useRef, useState, type FocusEvent } from "react";
import type { FilaCautare } from "@/content/solutii/hub";
import { textFragment } from "@/content/solutii/tipuri";
import CautareMacheta, { type FazaCautare } from "./CautareMacheta";
import { PAS_TASTARE, PAUZA_REZULTAT } from "./DemoCautare";
import s from "./demo.module.css";

export const PRAG_PORNIRE_HUB = 0.3;
export const PERIOADA_FILA = 6500;

export type DemoCautareFileProps = {
  eticheta: string;
  file: FilaCautare[];
};

export default function DemoCautareFile({ eticheta, file }: DemoCautareFileProps) {
  const card = useRef<HTMLDivElement>(null);
  const [activ, setActiv] = useState(0);
  const [faza, setFaza] = useState<FazaCautare>("final");
  const [tastat, setTastat] = useState(0);
  const [animat, setAnimat] = useState(false);
  const [vizibil, setVizibil] = useState(false);
  const [pauza, setPauza] = useState(false);
  const [runda, setRunda] = useState(0);
  // Hover: ref, nu stare, ca intrarea mouse-ului sa nu reporneasca ciclul filei curente.
  const subMouse = useRef(false);
  const amanata = useRef(false);

  // La montare: cu miscare normala, cardul trece in starea goala si urmareste fereastra.
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    setAnimat(true);
    setFaza("gol");
    setTastat(0);
    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) {
          setVizibil(intrare.isIntersecting && intrare.intersectionRatio >= PRAG_PORNIRE_HUB);
        }
      },
      { threshold: [0, PRAG_PORNIRE_HUB, 0.6, 1] },
    );
    observator.observe(el);
    return () => observator.disconnect();
  }, []);

  // Ciclul filei active: tastare, rezultat, iar dupa 6,5 s de la pornire, fila urmatoare. Orice
  // schimbare (fila, vizibilitate, pauza, clic) opreste ceasurile vechi si porneste altele.
  const lungime = file[activ].interogare.length;
  useEffect(() => {
    if (!animat || !vizibil || pauza) return;
    setFaza("tastare");
    setTastat(0);
    let n = 0;
    let rezultat = 0;
    const interval = window.setInterval(() => {
      n += 1;
      setTastat(n);
      if (n >= lungime) {
        window.clearInterval(interval);
        setFaza("gata");
        rezultat = window.setTimeout(() => setFaza("rezultat"), PAUZA_REZULTAT);
      }
    }, PAS_TASTARE);
    const urmatoarea = window.setTimeout(() => {
      if (subMouse.current) amanata.current = true;
      else setActiv((a) => (a + 1) % file.length);
    }, PERIOADA_FILA);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(rezultat);
      window.clearTimeout(urmatoarea);
    };
  }, [animat, vizibil, pauza, activ, runda, lungime, file.length]);

  // Fara ciclu (miscare redusa) sau cu ciclul oprit de focusul de tastatura, fila aleasa se arata gata;
  // altfel efectul de mai sus o ia de la capat (text gol, schelet, tastare).
  const alege = (i: number) => {
    amanata.current = false;
    setActiv(i);
    setRunda((r) => r + 1);
    if (!animat || pauza) setFaza("final");
  };

  const laFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) {
      setPauza(true);
      setFaza("final");
    }
  };
  const laIesireFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPauza(false);
  };

  const laIntrareMouse = () => {
    subMouse.current = true;
  };
  const laIesireMouse = () => {
    subMouse.current = false;
    if (amanata.current) {
      amanata.current = false;
      setActiv((a) => (a + 1) % file.length);
    }
  };

  const curent = file[activ];
  return (
    <div
      ref={card}
      className={[s.card, s.cardHub].join(" ")}
      data-demo-file=""
      data-fila-activa={activ}
      onFocus={laFocus}
      onBlur={laIesireFocus}
      onMouseEnter={laIntrareMouse}
      onMouseLeave={laIesireMouse}
    >
      <div className={s.file} role="group" aria-label={eticheta}>
        {file.map((f, i) => (
          <button
            key={f.eticheta}
            type="button"
            className={s.fila}
            aria-pressed={i === activ}
            onClick={() => alege(i)}
          >
            {f.eticheta}
          </button>
        ))}
      </div>
      <CautareMacheta exemple={file} activ={activ} faza={faza} tastat={tastat} />
      <p className="doar-cititor">
        {"Exemplu pentru " +
          curent.eticheta +
          ": întrebarea „" +
          curent.interogare +
          "” găsește documentul " +
          curent.rezultat.fisier +
          ", " +
          curent.rezultat.loc +
          ": " +
          textFragment(curent.rezultat.fragment)}
      </p>
    </div>
  );
}
