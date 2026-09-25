"use client";

// Constructorul pe industrii de pe start (felia `constructor`, valul S4-2; fisa de masurare
// `acasa-constructor.md`). Inlocuieste ciotul din `fundatie` la aceeasi cale; `page.tsx` nu se
// atinge. Ancora sectiunii (`ANCORE_ACASA.constructorul`) si marcajul `data-ciot` raman: navigatia
// trimite la ancora, iar probele fundatiei gasesc sectiunea dupa marcaj.
//
// CE E AICI si ce e in lume:
//   - aici: sectiunea, poarta cu grila de 9 industrii (starea statica, singura servita in HTML si
//     cea de fara JavaScript), tema inchisa cu stratul ei fix, antetul plecat (prin API-ul
//     antetului), alinierea automata si starea chestionarului, care supravietuieste schimbarii
//     industriei;
//   - in `Lume` (import dinamic, ca modulul pe industrie al referintei): panoul cu programul de
//     pasi, cele 9 scene, arborele 3D, chestionarul, duelul si estimarea. Lumea si continutul
//     scenelor sunt intr-o bucata JS separata, nu in pachetul paginii: de aici se importa numai
//     tipul lumii, iar starea (`stare.ts`) ia precompletarile din modulul lor mic, fara textele
//     scenelor. Bucata se cere cand sectiunea ajunge la 700 px de fereastra, ca un clic sa o
//     gaseasca deja sosita. Pe start sectiunea incepe la 1213 px (1440) si la 1398 px (390), deci
//     in marginea de 700 px chiar la incarcare: cererea pleaca odata cu hidratarea, dupa LCP
//     (masurat 25.09 la 390, Fast 4G si procesor x4: LCP la ~1,5 s, cererea la ~2,6 s). Odata cu
//     ea se cere si fontul monospatiat al scenelor.
//
// LUMEA APARE LA CLIC, NU DUPA O REZERVA. Componenta lumii se tine in stare dupa preluare si se
// randeaza direct: fara `lazy` + `Suspense`. Cu ele, prima alegere trecea prin rezerva goala a lui
// Suspense si lumea venea abia dupa ~330 ms (masurat de 4 din 4 ori, la 1440 si la 390), chiar cu
// modulul deja descarcat, iar a doua alegere venea la 11 ms. La referinta lumea e pe ecran la 8 ms
// dupa clic (§4.1). Rezerva de inaltime ramane numai pentru cazul in care modulul chiar nu a
// sosit inca in clipa clicului. Lumea insasi se aseaza in doua trepte (Lume.tsx): capul in clic,
// panoul si chestionarul dupa primul cadru.
//
// TEMA INCHISA (§3): cat timp orice parte a sectiunii taie banda de 2% din mijlocul ferestrei.
// ALINIEREA AUTOMATA: numai cand intrarea vine de sus DINTR-O DERULARE A OMULUI (rotita, atingere,
// tastatura). La referinta se declanseaza la orice intrare, deci si la derularea programatica spre
// ancora functionalitatilor, care atunci aterizeaza pe constructor (COMPONENTE.md §1 #16); la 3S
// ancora duce la sectiunea ei. Abatere deliberata, numita aici. La miscare redusa nu se aliniaza.

import { useCallback, useEffect, useRef, useState } from "react";
import { ANCORE_ACASA, CONSTRUCTOR, type CodIndustrie } from "@/content/acasa";
import { cereAntetulPlecat } from "@/components/global/antet-stare";
import Iconita from "@/components/primitive/Iconita";
import { RASPUNSURI_GOALE, raspunsuriLaAlegere, type Raspunsuri } from "./stare";
import type LumeConstructor from "./Lume";
import s from "./Constructor.module.css";

// Import numai de TIP: dispare la compilare, deci modulul lumii nu intra in pachetul paginii.
type ComponentaLume = typeof LumeConstructor;

/** Componenta lumii, odata sosita; aceeasi pentru toate montarile de pe pagina. */
let lumeSosita: ComponentaLume | null = null;
let cerere: Promise<ComponentaLume> | null = null;

function incarcaLumea(): Promise<ComponentaLume> {
  if (!cerere) cereFontulScenelor();
  cerere ??= import("./Lume").then(
    (m) => (lumeSosita = m.default),
    (eroare: unknown) => {
      // o preluare picata (retea) nu blocheaza urmatoarea incercare
      cerere = null;
      throw eroare;
    },
  );
  return cerere;
}

/**
 * Fontul monospatiat (numerele de dosar si de registru, numele de fisiere) nu e folosit pe start
 * deasupra constructorului, deci navigatorul il cerea abia cand il folosea lumea: fisierul sosea
 * dupa primul cadru al ei si tot textul lumii se reaseza inca o data (urma primului clic la 390,
 * procesor x4: o sarcina de ~200 ms, din care ~130 ms asezare si modelare de text, masurat 25.09).
 * Se cere odata cu modulul lumii, cu litere din ambele subseturi (latin si latin-ext).
 */
function cereFontulScenelor(): void {
  if (typeof document === "undefined" || !document.fonts) return;
  const familie = getComputedStyle(document.documentElement).getPropertyValue("--fnt-mono").trim();
  if (!familie) return;
  document.fonts.load("500 16px " + familie, "0123456789 ăâîșț").catch(() => {});
}

/** Banda centrala a temei: marginea observatorului, -49% sus si jos (§3). */
export const MARGINE_TEMA = "-49% 0px -49% 0px";

/** Sub cati pixeli de la marginea de sus nu se mai aliniaza (§3: "mai mult de 24 px"). */
export const PRAG_ALINIERE = 24;

/** Cat de recenta trebuie sa fie derularea omului ca intrarea sa fie a lui (ms). */
const FEREASTRA_DERULARE = 900;

/** Sub ce fractie vizibila se opreste programul panoului (§3: 15%). */
export const PRAG_OPRIRE = 0.15;

/** Distanta la care se cere modulul lumii. */
const MARGINE_PRELUARE = "700px 0px";

const TASTE_DERULARE = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"]);

function miscareRedusa(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Constructor() {
  const c = CONSTRUCTOR;
  const sectiune = useRef<HTMLElement>(null);
  const grila = useRef<HTMLDivElement>(null);
  const [industrie, setIndustrie] = useState<CodIndustrie | null>(null);
  const [inchisa, setInchisa] = useState(false);
  const [vizibil, setVizibil] = useState(true);
  const [raspunsuri, setRaspunsuri] = useState<Raspunsuri>(RASPUNSURI_GOALE);
  /** `performance.now()` la clicul de alegere: reperul programului panoului (program.ts). */
  const [momentAlegere, setMomentAlegere] = useState(0);
  const [Lume, setLume] = useState<ComponentaLume | null>(() => lumeSosita);
  /** Dupa "inapoi la domenii": focusul trece pe primul buton al grilei, fara derulare. */
  const focusPeGrila = useRef(false);

  /** Cere modulul lumii si il pune in stare cand soseste (o singura descarcare pe pagina). */
  const cereLumea = useCallback(() => {
    if (lumeSosita) {
      setLume(() => lumeSosita);
      return;
    }
    incarcaLumea().then(
      (L) => setLume(() => L),
      () => {},
    );
  }, []);

  // Tema inchisa, antetul plecat si alinierea automata.
  useEffect(() => {
    const el = sectiune.current;
    if (!el || !("IntersectionObserver" in window)) return;
    let ultimaDerulare = -Infinity;
    const marcheaza = () => {
      ultimaDerulare = performance.now();
    };
    const laTasta = (e: KeyboardEvent) => {
      if (TASTE_DERULARE.has(e.key)) marcheaza();
    };
    window.addEventListener("wheel", marcheaza, { passive: true });
    window.addEventListener("touchmove", marcheaza, { passive: true });
    window.addEventListener("keydown", laTasta);

    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) {
          const activa = intrare.isIntersecting;
          setInchisa(activa);
          cereAntetulPlecat("constructor", activa);
          if (!activa || miscareRedusa()) continue;
          if (performance.now() - ultimaDerulare > FEREASTRA_DERULARE) continue;
          const sus = el.getBoundingClientRect().top;
          if (sus > PRAG_ALINIERE) {
            window.scrollTo({ top: window.scrollY + sus, behavior: "smooth" });
          }
        }
      },
      { rootMargin: MARGINE_TEMA },
    );
    observator.observe(el);
    return () => {
      observator.disconnect();
      window.removeEventListener("wheel", marcheaza);
      window.removeEventListener("touchmove", marcheaza);
      window.removeEventListener("keydown", laTasta);
      cereAntetulPlecat("constructor", false);
    };
  }, []);

  // Vizibilitatea sub 15% opreste programul panoului; modulul lumii se cere de la distanta.
  useEffect(() => {
    const el = sectiune.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const oprire = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) setVizibil(intrare.intersectionRatio >= PRAG_OPRIRE);
      },
      { threshold: [0, PRAG_OPRIRE, 0.3] },
    );
    oprire.observe(el);
    const preluare = new IntersectionObserver(
      (intrari) => {
        if (intrari.some((i) => i.isIntersecting)) {
          cereLumea();
          preluare.disconnect();
        }
      },
      { rootMargin: MARGINE_PRELUARE },
    );
    preluare.observe(el);
    return () => {
      oprire.disconnect();
      preluare.disconnect();
    };
  }, [cereLumea]);

  // Dupa intoarcerea la grila: focus pe primul buton (fara derulare).
  useEffect(() => {
    if (industrie !== null || !focusPeGrila.current) return;
    focusPeGrila.current = false;
    grila.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, [industrie]);

  const laVarf = useCallback(() => {
    const el = sectiune.current;
    if (!el) return;
    const tinta = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: tinta, behavior: miscareRedusa() ? "auto" : "smooth" });
  }, []);

  const alege = useCallback(
    (cod: CodIndustrie) => {
      setMomentAlegere(performance.now());
      cereLumea();
      setRaspunsuri((r) => raspunsuriLaAlegere(cod, r));
      setIndustrie(cod);
      laVarf();
    },
    [laVarf, cereLumea],
  );

  const schimbaIndustria = useCallback(() => {
    focusPeGrila.current = true;
    setIndustrie(null);
    laVarf();
  }, [laVarf]);

  const esteLume = industrie !== null;

  return (
    <section
      ref={sectiune}
      id={ANCORE_ACASA.constructorul}
      className={s.sectiune}
      aria-labelledby="constructor-titlu"
      data-ciot="constructor"
      data-tema={inchisa ? "inchisa" : "deschisa"}
      data-stare={esteLume ? "lume" : "poarta"}
    >
      <div className={s.strat} aria-hidden="true" />
      <div className={"container-site " + s.plan}>
        <div className={s.interior}>
          <div className={esteLume ? s.lume : s.poarta}>
            <div className={s.cap}>
              <h2 id="constructor-titlu" className={"t-h2-sectiune " + s.titlu}>
                {c.titlu}
              </h2>
              <p className={s.subtitlu}>{c.subtitlu}</p>
            </div>
            {industrie === null ? (
              <div className={s.intrebareBloc} onPointerEnter={cereLumea}>
                <p id="constructor-intrebare" className={s.intrebare}>
                  {c.intrebare}
                </p>
                <div ref={grila} className={s.grila} role="group" aria-labelledby="constructor-intrebare">
                  {c.industrii.map((i, indice) => (
                    <button
                      key={i.cod}
                      type="button"
                      className={s.industrie}
                      data-industrie={i.cod}
                      style={{ animationDelay: indice * 45 + "ms" }}
                      onClick={() => alege(i.cod)}
                      onFocus={cereLumea}
                    >
                      <Iconita nume={i.iconita} marime={15} contur={1.3} className={s.iconita} />
                      <span>{i.nume}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : Lume ? (
              <Lume
                industrie={industrie}
                raspunsuri={raspunsuri}
                setRaspunsuri={setRaspunsuri}
                vizibil={vizibil}
                laSchimbare={schimbaIndustria}
                momentAlegere={momentAlegere}
              />
            ) : (
              <div className={s.rezervare} data-rezerva-lume="" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
