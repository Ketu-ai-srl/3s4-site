"use client";

// Lumea preturilor (preturi.md §3 si §5): poarta cu doua carduri si, pe aceeasi ruta, lumea
// pachetelor. Pachetele nu au ruta proprie: sunt o STARE a paginii, deschisa de cardul de baza sau
// de ancora `#pachete` (legatura "Pachete" din subsol).
//
// CUM MERGE
//   - Clic pe cardul de baza: plecarea in oglinda (cardurile .42 s), apoi lumea intra (.3 s).
//     Adresa nu se schimba si pagina nu deruleaza, ca la referinta; focusul trece pe titlul lumii.
//   - Clic pe cardul enterprise: aceeasi plecare, spre dreapta, apoi navigarea spre `/enterprise`
//     prin tranzitia de vedere a site-ului. Cardul trece prin `Tinta`: cat timp ruta nu exista e un
//     element inert, cu acelasi aspect, fara clic si fara focus.
//   - "Inapoi": poarta revine pe loc, fara animatie; focusul revine pe cardul de baza.
//   - Ancora `#pachete` (la incarcare, la `hashchange` sau dintr-o legatura a aceleiasi pagini):
//     lumea se deschide fara plecare si pagina sare la pachete.
//
// FARA JAVASCRIPT: HTML-ul servit are ambele stari, iar cardul de baza e o legatura spre
// `#pachete`; foaia de stil deschide lumea prin `:target` (vezi `poarta.module.css`), iar "inapoi"
// e o legatura spre poarta. Dupa hidratare decide numai starea de aici.
//
// DE CE LUMEA SE REMONTEAZA la deschidere: aparitiile la derulare (`Reveal`, piesa inghetata) se
// masoara la montare. Lumea montata ascunsa ar crede ca totul e deja in fereastra si n-ar mai anima
// nimic; o cheie noua o monteaza din nou, vizibila.
//
// MISCAREA REDUSA: nicio plecare, nicio intrare; comutarea e instantanee.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent as EvenimentReact,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import Iconita from "@/components/primitive/Iconita";
import Tinta, { tintaActiva } from "@/components/primitive/Tinta";
import type { CaiExistente } from "@/content/navigatie";
import { ANCORE_PRETURI, ETICHETE_PRETURI, POARTA_BAZA, POARTA_ENTERPRISE, type CardPoarta } from "@/content/preturi";
import { ID_TITLU_LUME } from "./constante";
import s from "./poarta.module.css";

/** Durata plecarii cardurilor (fisa §3: .42 s), dupa care lumea intra sau pagina pleaca. */
const PLECARE_MS = 420;

const DIEZ_PACHETE = "#" + ANCORE_PRETURI.pachete;

type Vedere = "poarta" | "pachete";
type Plecare = "baza" | "enterprise" | null;

type ContextLumii = { inapoi: (e: EvenimentReact<HTMLAnchorElement>) => void };

const ContextLume = createContext<ContextLumii | null>(null);

/** Actiunea "inapoi" a lumii, pentru legatura din linia de baza. */
export function useInapoi(): ContextLumii["inapoi"] {
  const c = useContext(ContextLume);
  return c ? c.inapoi : () => undefined;
}

/** Un clic pe care il lasam navigatorului: alt buton decat cel principal sau cu modificatori. */
export function clicModificat(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

function miscareRedusa(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Continutul unui card. Intr-o legatura (`bloc`), textul e un paragraf, cum e si pe ecran: HTML-ul
 * servit il citeste ca atare, iar paragrafele de dupa el, din lumea ascunsa, nu mai trec inaintea lui.
 * In elementul inert al lui `Tinta` (un `span`) nu are voie sa stea un bloc, deci acolo totul ramane
 * `span`; aspectul e acelasi, fiindca il dau clasele.
 */
function ContinutCard({ card, bloc }: { card: CardPoarta; bloc: boolean }) {
  const Invelis = bloc ? "div" : "span";
  const Text = bloc ? "p" : "span";
  return (
    <Invelis className={s.interior}>
      <span className={s.nume}>{card.nume}</span>
      <span className={s.titlu}>{card.titlu}</span>
      <Text className={s.text}>{card.text}</Text>
      <span className={s.mergi}>
        {card.mergi}
        <Iconita nume="arrow-right" marime={14} contur={2} />
      </span>
    </Invelis>
  );
}

type Deschidere = { animat: boolean; derulare: boolean; focus: boolean };

export default function LumeaPreturi({
  lume,
  cai,
}: {
  lume: ReactNode;
  /** Caile existente, transmise lui `Tinta`; implicit cele ale site-ului. Parametru numai pentru probe. */
  cai?: CaiExistente;
}) {
  const [vedere, setVedere] = useState<Vedere>("poarta");
  const [plecare, setPlecare] = useState<Plecare>(null);
  const [intrare, setIntrare] = useState(false);
  const [cheie, setCheie] = useState(0);
  const [hidratat, setHidratat] = useState(false);

  const refBaza = useRef<HTMLAnchorElement>(null);
  const refLume = useRef<HTMLDivElement>(null);
  const cronometre = useRef<number[]>([]);
  const inPlecare = useRef(false);
  const trecere = useRef(false);
  const deDerulat = useRef(false);
  const deFocalizat = useRef<"lume" | "poarta" | null>(null);

  const programeaza = (f: () => void, ms: number) => {
    cronometre.current.push(window.setTimeout(f, ms));
  };

  const deschide = useCallback((d: Deschidere) => {
    const ascunsa = !refLume.current || refLume.current.getClientRects().length === 0;
    inPlecare.current = false;
    setPlecare(null);
    setIntrare(d.animat);
    setVedere("pachete");
    if (ascunsa) setCheie((c) => c + 1);
    deDerulat.current = d.derulare;
    deFocalizat.current = d.focus ? "lume" : null;
  }, []);

  // Derularea si focusul se fac dupa ce lumea e pe ecran.
  useEffect(() => {
    if (vedere === "pachete") {
      if (deDerulat.current) {
        deDerulat.current = false;
        document.getElementById(ANCORE_PRETURI.pachete)?.scrollIntoView({ block: "start", behavior: "instant" });
      }
      if (deFocalizat.current === "lume") {
        deFocalizat.current = null;
        document.getElementById(ID_TITLU_LUME)?.focus({ preventScroll: true });
      }
    } else if (deFocalizat.current === "poarta") {
      deFocalizat.current = null;
      refBaza.current?.focus({ preventScroll: true });
    }
  }, [vedere, cheie]);

  // La montare: dupa hidratare, `:target` nu mai decide. Ancora din adresa deschide lumea.
  useEffect(() => {
    setHidratat(true);
    if (window.location.hash === DIEZ_PACHETE) {
      const vizibila = !!refLume.current && refLume.current.getClientRects().length > 0;
      deschide({ animat: false, derulare: !vizibila, focus: false });
    }
  }, [deschide]);

  // Ancora schimbata in adresa (inapoi / inainte in navigator, adresa scrisa de mana).
  useEffect(() => {
    const laSchimbare = () => {
      if (window.location.hash === DIEZ_PACHETE) deschide({ animat: false, derulare: true, focus: false });
    };
    window.addEventListener("hashchange", laSchimbare);
    return () => window.removeEventListener("hashchange", laSchimbare);
  }, [deschide]);

  // O legatura a paginii spre propria ancora (subsolul: "Pachete"): lumea se deschide inainte ca
  // navigarea sa caute sectiunea, deci derularea o gaseste pe ecran.
  useEffect(() => {
    const laClic = (e: MouseEvent) => {
      if (e.defaultPrevented || clicModificat(e)) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(a instanceof HTMLAnchorElement) || a === refBaza.current) return;
      let adresa: URL;
      try {
        adresa = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (adresa.origin !== window.location.origin || adresa.pathname !== window.location.pathname) return;
      if (adresa.hash !== DIEZ_PACHETE) return;
      flushSync(() => deschide({ animat: false, derulare: false, focus: false }));
      document.getElementById(ANCORE_PRETURI.pachete)?.scrollIntoView({ block: "start", behavior: "instant" });
    };
    document.addEventListener("click", laClic, true);
    return () => document.removeEventListener("click", laClic, true);
  }, [deschide]);

  useEffect(() => {
    const lista = cronometre.current;
    return () => {
      for (const c of lista) window.clearTimeout(c);
    };
  }, []);

  const laClicBaza = (e: EvenimentReact<HTMLAnchorElement>) => {
    if (clicModificat(e)) return;
    e.preventDefault();
    if (inPlecare.current) return;
    if (miscareRedusa()) {
      deschide({ animat: false, derulare: false, focus: true });
      return;
    }
    inPlecare.current = true;
    setPlecare("baza");
    programeaza(() => deschide({ animat: true, derulare: false, focus: true }), PLECARE_MS);
  };

  // Cardul enterprise, cand ruta lui exista: clicul se opreste in faza de captura (inaintea
  // tranzitiei de vedere globale si a navigarii din `Link`), cardurile pleaca, apoi acelasi clic se
  // reda pe legatura, iar navigarea o fac piesele site-ului, neschimbate.
  const laClicEnterprise = (e: EvenimentReact<HTMLAnchorElement>) => {
    if (trecere.current) {
      trecere.current = false;
      return;
    }
    if (clicModificat(e)) return;
    e.preventDefault();
    if (inPlecare.current) return;
    const legatura = e.currentTarget;
    const pleaca = () => {
      trecere.current = true;
      legatura.click();
      // Plasa: daca navigarea nu a pornit, poarta nu ramane goala.
      programeaza(() => {
        inPlecare.current = false;
        setPlecare(null);
      }, 1200);
    };
    if (miscareRedusa()) {
      pleaca();
      return;
    }
    inPlecare.current = true;
    setPlecare("enterprise");
    programeaza(pleaca, PLECARE_MS);
  };

  const inapoi = useCallback((e: EvenimentReact<HTMLAnchorElement>) => {
    if (clicModificat(e)) return;
    e.preventDefault();
    inPlecare.current = false;
    setPlecare(null);
    setIntrare(false);
    setVedere("poarta");
    deFocalizat.current = "poarta";
  }, []);

  return (
    <div className={s.stare} data-vedere={vedere} data-hidratat={hidratat ? "" : undefined}>
      <section
        id={ANCORE_PRETURI.poarta}
        className={s.poarta}
        data-plecare={plecare ?? undefined}
        aria-label={ETICHETE_PRETURI.poarta}
      >
        <div className="container-site">
          <div className={s.grila}>
            <a ref={refBaza} href={DIEZ_PACHETE} className={s.panou + " " + s.panouBaza} onClick={laClicBaza}>
              <ContinutCard card={POARTA_BAZA} bloc />
            </a>
            <Tinta
              legatura={POARTA_ENTERPRISE.tinta}
              cai={cai}
              className={s.panou + " " + s.panouEnterprise}
              onClickCapture={laClicEnterprise}
            >
              <ContinutCard card={POARTA_ENTERPRISE} bloc={tintaActiva(POARTA_ENTERPRISE.tinta, cai)} />
            </Tinta>
          </div>
        </div>
      </section>
      <ContextLume.Provider value={{ inapoi }}>
        <div key={cheie} ref={refLume} className={s.lume + (intrare ? " " + s.lumeIntrare : "")}>
          {lume}
        </div>
      </ContextLume.Provider>
    </div>
  );
}
