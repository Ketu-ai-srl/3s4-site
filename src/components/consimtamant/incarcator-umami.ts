// Incarcatorul analiticii proprii (Umami) in masurarea S-B (decizia 13 din 30.09.2026): scriptul NU sta in
// layout; il pune acest modul in pagina, abia dupa acceptul categoriei "statistica" (sau la o alegere pastrata
// valabila, cu statistica acceptata). Inainte de accept nu exista nici scriptul, nici cererea lui, nici codul
// acestui modul: `Consimtamant.tsx` il cere cu `import()` numai atunci, deci sta intr-o bucata separata de
// JavaScript.
//
// SCRIPTUL SE INSEREAZA CA ELEMENT <script> CLASIC (`document.createElement`), nu ca modul si nu prin `import()`.
// Trackerul servit de instanta isi citeste configurarea din `document.currentScript` si iese pe loc daca acesta
// lipseste; un modul sau un cod rulat prin `import()` nu are `document.currentScript`, deci n-ar porni deloc.
// Masurat pe scriptul servit de instanta noastra (2.688 de octeti, citit 01.10.2026): citeste `data-website-id`,
// `data-do-not-track` si `data-before-send`, iar inainte de FIECARE trimitere apeleaza functia
// `window[<valoarea lui data-before-send>](tip, date)`; o valoare falsa intoarsa de ea anuleaza trimiterea.
//
// RETRAGEREA FARA REINCARCARE trece prin functia aceea: o instalam pe `window` sub `NUME_INAINTE_DE_TRIMITERE`,
// iar ea intreaba bannerul daca statistica e acceptata ACUM (`permis`, citit la fiecare trimitere). Dupa un
// refuz sau o retragere intoarce `false`, deci nicio vizita si niciun eveniment nu mai pleaca, chiar daca
// scriptul ramane in pagina. NU scriem `umami.disabled` in stocarea locala: ar fi stocare scrisa de pagina,
// pe care C-01 o numara; cheia ramane a vizitatorului, iar trackerul numai o citeste.
//
// Atributele, ca inainte (`src/components/analitica/config.ts`): scriptul de pe originea site-ului
// (`/a/script.js`, rescris de server spre instanta), `data-website-id`, `data-do-not-track="true"`, fara
// `data-host-url` (trimiterea merge la `/a/api/send`, directorul scriptului) si fara `data-domains`.

import { CALE_SCRIPT } from "@/components/analitica/config";

/** Numele functiei de pe `window` pe care trackerul o cheama inainte de fiecare trimitere. */
export const NUME_INAINTE_DE_TRIMITERE = "consimtamantUmami3s";

type InainteDeTrimitere = (tip: string, date: unknown) => unknown;

declare global {
  interface Window {
    umami?: { track: (...argumente: unknown[]) => unknown };
    consimtamantUmami3s?: InainteDeTrimitere;
  }
}

/** Scriptul a fost pus in pagina (o singura data pe incarcare de pagina). */
let scriptPus = false;

/**
 * Functia pe care trackerul o cheama inainte de fiecare trimitere: lasa datele sa plece numai cat timp
 * `permis()` e adevarat. Exportata pentru probe.
 */
export function inainteDeTrimitere(permis: () => boolean): InainteDeTrimitere {
  return (_tip, date) => (permis() ? date : false);
}

/**
 * Porneste masurarea dupa accept. Idempotent: scriptul se pune o singura data; la un accept dat din nou pe
 * aceeasi pagina (dupa o retragere) trackerul exista deja, deci se trimite vizita paginii curente.
 */
export function pornesteUmami(idSite: string, permis: () => boolean): void {
  if (typeof window === "undefined") return;
  window[NUME_INAINTE_DE_TRIMITERE] = inainteDeTrimitere(permis);
  if (scriptPus) {
    if (permis()) window.umami?.track();
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.src = CALE_SCRIPT;
  script.dataset.websiteId = idSite;
  script.dataset.doNotTrack = "true";
  script.dataset.beforeSend = NUME_INAINTE_DE_TRIMITERE;
  script.dataset.analitica = "umami";
  document.head.appendChild(script);
  scriptPus = true;
}
