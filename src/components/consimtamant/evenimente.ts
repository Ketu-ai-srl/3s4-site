// Lista INCHISA de evenimente de analitica (planul valului S4, §8.5): CTA-urile, inceputul si
// trimiterea formularelor, industria aleasa in constructor, folosirea calculatorului de pe preturi.
// Din codul nostru nu pleaca spre GA4 niciun alt eveniment: unul din afara listei nu se trimite, se
// pierde.
//
// CE NU POATE IMPUNE CODUL. Pe langa lista, GA4 masoara singur vizitele si paginile citite (acestea
// sunt si in politica), iar masurarea imbunatatita a fluxului web ar trimite, daca ramane pornita,
// derulari, clicuri spre alte site-uri, cautari, descarcari, video si formulare. Acelea se opresc din
// proprietatea GA4, nu de aici: docs/ziua-operatorului.md, pasul 5, cu comanda de verificare. Fara
// pasul acela, lista nu mai e inchisa si politica nu mai descrie ce pleaca.
//
// DE CE INCHISA. O lista deschisa creste cu fiecare felie care "mai vrea o cifra", iar fiecare
// cifra noua e o prelucrare noua, de declarat in politica. Lista de aici e chiar cea din politica
// de cookie-uri; un eveniment nou intra in AMANDOUA, in acelasi commit.
//
// FARA DATE PERSONALE. Parametrii sunt coduri din multimi cunoscute (formularul, industria, calea
// CTA-ului), verificati la rulare: un text liber - un nume, o adresa de e-mail scapata dintr-un
// camp - nu are forma unui cod si e respins inainte sa plece.
//
// CINE LE TRIMITE: feliile paginilor, prin `trimiteEveniment`, doar dupa ce vizitatorul a acceptat
// statistica; CTA-urile catre cont si contact se prind singure, dintr-un ascultator pe document,
// ca butoanele sa nu poarte fiecare cod de analitica.

import { ga4Pornit } from "./stare-ga4";

/** Formularele site-ului, in ordinea feliilor care le construiesc. */
export const FORMULARE = ["contact", "inregistrare", "enterprise"] as const;
export type Formular = (typeof FORMULARE)[number];

/** Parametrii fiecarui eveniment. Un eveniment fara parametri are obiectul gol. */
export type ParametriEveniment = {
  clic_cta: { tinta: string };
  formular_inceput: { formular: Formular };
  formular_trimis: { formular: Formular };
  industrie_aleasa: { industrie: string };
  calculator_folosit: Record<string, never>;
};

export type NumeEveniment = keyof ParametriEveniment;

/** Numele evenimentelor si cheile de parametri permise: lista inchisa, la rulare. */
export const EVENIMENTE: Record<NumeEveniment, readonly string[]> = {
  clic_cta: ["tinta"],
  formular_inceput: ["formular"],
  formular_trimis: ["formular"],
  industrie_aleasa: ["industrie"],
  calculator_folosit: [],
};

/**
 * Caile CTA-urilor urmarite automat: contul gratuit (`CALE_INREGISTRARE` din navigatie) si contactul.
 * Scrise aici, nu importate, ca modulul navigatiei sa nu intre in codul de browser; proba verifica
 * ca prima cale e chiar `CALE_INREGISTRARE`.
 */
export const CAI_CTA_URMARITE = ["/inregistrare", "/contact"] as const;

/** Un cod: litere mici, cifre si cratima, pana la 40 de caractere. Un text liber nu trece. */
const COD = /^[a-z0-9][a-z0-9-]{0,39}$/;
/** O cale de pe site, fara parametri de cautare. */
const CALE = /^\/[a-z0-9\-/]{0,79}$/;

/** Evenimentul e in lista, cu exact parametrii lui, fiecare cu forma permisa. */
export function evenimentValid(nume: string, parametri: Record<string, unknown>): boolean {
  if (!Object.prototype.hasOwnProperty.call(EVENIMENTE, nume)) return false;
  const permise = EVENIMENTE[nume as NumeEveniment];
  const chei = Object.keys(parametri);
  if (chei.length !== permise.length || chei.some((k) => !permise.includes(k))) return false;
  for (const k of chei) {
    const v = parametri[k];
    if (typeof v !== "string") return false;
    if (k === "tinta" && !CALE.test(v)) return false;
    if (k === "formular" && !(FORMULARE as readonly string[]).includes(v)) return false;
    if (k === "industrie" && !COD.test(v)) return false;
  }
  return true;
}

/** Trimite un eveniment din lista. Intoarce `true` numai daca a plecat efectiv spre GA4. */
export function trimiteEveniment<N extends NumeEveniment>(nume: N, parametri: ParametriEveniment[N]): boolean {
  if (!evenimentValid(nume, parametri as Record<string, unknown>)) return false;
  if (typeof window === "undefined" || typeof window.gtag !== "function" || !ga4Pornit()) return false;
  window.gtag("event", nume, parametri);
  return true;
}

/** Porneste ascultatorul CTA-urilor. Intoarce functia care il opreste. */
export function urmaresteCta(): () => void {
  const laClic = (e: MouseEvent) => {
    const tinta = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!(tinta instanceof HTMLAnchorElement)) return;
    let adresa: URL;
    try {
      adresa = new URL(tinta.href, window.location.href);
    } catch {
      return;
    }
    if (adresa.origin !== window.location.origin) return;
    const cale = (CAI_CTA_URMARITE as readonly string[]).find((c) => adresa.pathname === c);
    if (cale) trimiteEveniment("clic_cta", { tinta: cale });
  };
  document.addEventListener("click", laClic, true);
  return () => document.removeEventListener("click", laClic, true);
}
