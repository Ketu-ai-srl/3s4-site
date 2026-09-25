"use client";

// Scrierea litera cu litera (functionalitati__sablon.md §4.1): intrebarea din terminal si, pe
// automatizari-ai, subtitlul eroului. Porneste la 500 ms dupa montare, un caracter la 32-35 ms.
//
// TREI STARI, citite de CSS prin `data-scriere`:
//   - `static`  HTML-ul servit si miscarea redusa: textul intreg, fara cursor. Inainte de hidratare,
//               CSS-ul ascunde textul numai cand scripturile sunt pornite si miscarea e permisa
//               (`@media (scripting: enabled)`), deci nu clipeste textul intreg inainte de scriere;
//               fara scripturi, textul se vede de la inceput;
//   - `scrie`   dupa montare, cu miscare: textul intreg ramane in pagina (transparent, citit de
//               cititorul de ecran si de roboti), iar peste el se scrie o copie ascunsa lor;
//   - `gata`    scrierea s-a terminat: copia ramane (textul arata la fel), cursorul dispare.
//
// De ce copia ramane dupa scriere si nu se reda textul de baza: un element care devine vizibil tarziu
// e un candidat nou la LCP; copia a fost pictata o data, la primul caracter, deci nu mai conteaza.

import { useEffect, useState } from "react";
import { areMiscareRedusa } from "./miscare";
import { caractereScrise, durataScrierii, INTARZIERE_SCRIERE, PAS_SCRIERE } from "./progres";

export type StareScriere = "static" | "scrie" | "gata";

export type Scriere = {
  stare: StareScriere;
  /** Caracterele scrise pana acum (lungimea intreaga in starea statica si la final). */
  scrise: number;
};

export type OptiuniScriere = {
  /** Ms pe caracter (32 implicit; 35 pe cautare-ai si automatizari-ai). */
  pas?: number;
  /** Ms de la montare pana la primul caracter. */
  intarziere?: number;
  /** Chemata o singura data, cand ultimul caracter a fost scris. */
  laFinal?: () => void;
};

export function useScriere(text: string, { pas = PAS_SCRIERE, intarziere = INTARZIERE_SCRIERE, laFinal }: OptiuniScriere = {}): Scriere {
  const [scriere, setScriere] = useState<Scriere>({ stare: "static", scrise: text.length });

  useEffect(() => {
    if (areMiscareRedusa()) return;
    const lungime = text.length;
    const inceput = performance.now();
    setScriere({ stare: "scrie", scrise: 0 });
    let terminat = false;
    const ceas = window.setInterval(() => {
      const scrise = caractereScrise(performance.now() - inceput, lungime, pas, intarziere);
      if (scrise >= lungime) {
        window.clearInterval(ceas);
        if (!terminat) {
          terminat = true;
          setScriere({ stare: "gata", scrise: lungime });
          laFinal?.();
        }
        return;
      }
      setScriere((vechi) => (vechi.scrise === scrise ? vechi : { stare: "scrie", scrise }));
    }, Math.max(8, Math.floor(pas / 2)));
    return () => window.clearInterval(ceas);
    // Scrierea porneste o singura data, la montare; `laFinal` se citeste la final, nu reporneste nimic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, pas, intarziere]);

  return scriere;
}

export { durataScrierii };
