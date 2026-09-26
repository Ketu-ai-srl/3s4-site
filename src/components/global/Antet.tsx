"use client";

// Antetul global (componente-globale.md §2-§5): sigla, cele 5 legaturi cu meniurile mari, cautarea
// (Ctrl K), limba, Autentificare, Descarca si butonul plin; sub 1200 px sigla, lupa si hamburgerul.
//
// NAVIGATIA E FILTRATA pe caile care exista (plan §5.1 regula 5): o legatura spre o pagina care
// nu exista inca nu se randeaza deloc, un declansator a carui foaie nu are niciun element vizibil
// devine legatura simpla, iar Descarca dispare cat timp panoul lui ar fi gol. In valurile
// intermediare antetul arata deci mai putin decat referinta; la livrare (S4-5) nimic nu mai e
// filtrat, iar proba de completitudine o cere. Piesele filtrate se masoara pe o copie cu toate
// caile declarate existente: tests/browser/fundatie-antet-intreg.spec.ts.
//
// STARI: plat pe start pana la 20 px de derulare, apoi pastila; pastila de la incarcare pe
// celelalte pagini; plecat cat timp o piesa o cere (antet-stare.ts). Suprapunerile (paleta,
// sertarul) se randeaza IN AFARA elementului `header`: acela are transformare cand pleaca, iar o
// transformare ar face ca un element fix dinauntrul lui sa se raporteze la antet, nu la fereastra.
//
// MENIURILE (§2.4, §3.1): hover sau focus deschid; se inchid la iesirea mouse-ului, la iesirea
// focusului din zona lor, la clicul in afara si la Escape. Escape intoarce focusul pe declansator
// numai daca focusul era in zona, si o face fara sa redeschida (vezi `faraRedeschidere`).

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
} from "react";
import { CAI_EXISTENTE } from "@/content/cai";
import {
  ANTET,
  seVede,
  vizibile,
  type FoaieMeniu,
  type LegaturaAntet,
  type PlatformaDescarca,
} from "@/content/navigatie";
import Buton from "@/components/primitive/Buton";
import Iconita from "@/components/primitive/Iconita";
import { antetulEstePlecat, ascultaAntetul } from "./antet-stare";
import { detecteazaPlatforma, grupuriVizibile } from "./descarcare";
import MeniuMare, { type FoaieVizibila } from "./MeniuMare";
import PaletaCautare from "./PaletaCautare";
import PanouDescarca from "./PanouDescarca";
import SelectorLimba from "./SelectorLimba";
import SertarMobil from "./SertarMobil";
import SiglaMarca from "./SiglaMarca";
import s from "./Antet.module.css";

/** Pragul starii de pastila pe start: 20 = sus, 21 = pastila (masurat, fara histerezis). */
export const PRAG_PASTILA = 20;

/** Cat asteapta panoul mare dupa iesirea mouse-ului (masurat: dispare intre 109 si 169 ms). */
const INTARZIERE_INCHIDERE = 120;

/**
 * Panoul Descarca: `trecator` = deschis de hover sau de focus, `fixat` = deschis de clic (sau de
 * Enter / Space, care produc tot un clic). Clicul peste un panou trecator il FIXEAZA, nu il
 * inchide: mouse-ul ajunge pe buton trecand prin hover, iar Tab-ul il deschide inainte de Enter,
 * deci un clic care doar comuta ar inchide exact ce omul a cerut (masurat pe copia cu toate
 * caile: hover + clic -> inchis, Tab + Enter -> inchis). Al doilea clic il inchide. La referinta,
 * hover + clic lasa panoul deschis (componente-globale.md §3.1).
 */
type StareDescarca = "inchis" | "trecator" | "fixat";

/** Foaia filtrata: numai elementele cu tinta existenta. `null` daca nu ramane niciunul. */
export function foaieFiltrata(foaie: FoaieMeniu, cai: ReadonlySet<string>): FoaieMeniu | null {
  const lider = foaie.lider && seVede(foaie.lider, cai) ? foaie.lider : null;
  const elemente = vizibile(foaie.elemente, cai);
  const subsol = seVede(foaie.subsol, cai) ? foaie.subsol : { ...foaie.subsol, href: null };
  if (!lider && elemente.length === 0) {
    return null;
  }
  return { ...foaie, lider, elemente, subsol };
}

function faraPlecare() {
  return false;
}

/**
 * `onBlur` pentru o zona de meniu: inchide cand focusul pleaca din zona spre alt element.
 * Fara tinta (clic pe o suprafata fara focus, fereastra parasita) nu inchide nimic: acolo
 * raspund clicul in afara si iesirea mouse-ului, altfel un clic pe titlul unui grup din panou
 * l-ar inchide.
 */
function laIesireaFocusului(inchide: () => void) {
  return (e: FocusEvent<HTMLElement>) => {
    const urmator = e.relatedTarget as Node | null;
    if (urmator && !e.currentTarget.contains(urmator)) {
      inchide();
    }
  };
}

export default function Antet() {
  const cale = usePathname() ?? "/";
  const esteStart = cale === "/";
  const cai = CAI_EXISTENTE;

  const [derulat, setDerulat] = useState(false);
  const plecat = useSyncExternalStore(ascultaAntetul, antetulEstePlecat, faraPlecare);
  const [foaieActiva, setFoaieActiva] = useState<string | null>(null);
  const [descarca, setDescarca] = useState<StareDescarca>("inchis");
  const [paletaDeschisa, setPaletaDeschisa] = useState(false);
  const [sertarDeschis, setSertarDeschis] = useState(false);
  const [platforma, setPlatforma] = useState<PlatformaDescarca | null>(null);
  const descarcaDeschis = descarca !== "inchis";

  const temporizator = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deschizatorPaleta = useRef<HTMLElement | null>(null);
  const hamburger = useRef<HTMLButtonElement>(null);
  const zonaNav = useRef<HTMLDivElement>(null);
  const zonaDescarca = useRef<HTMLDivElement>(null);
  /**
   * Declansatorul pe care Escape tocmai intoarce focusul. Focusul pe declansator deschide meniul
   * (§2.4), deci fara asta Escape inchidea si, in acelasi eveniment, focusul intors redeschidea
   * (masurat: era nevoie de doua apasari). Tine exact cat apelul `focus()`: evenimentul de focus
   * e sincron, iar valoarea se goleste imediat dupa, deci nu poate inghiti un focus viitor.
   */
  const faraRedeschidere = useRef<HTMLElement | null>(null);
  const idMeniu = useId() + "-meniu";
  const idDescarca = useId() + "-descarca";

  // Pastila: pe start dupa 20 px de derulare; pe celelalte pagini mereu.
  useEffect(() => {
    if (!esteStart) return;
    const actualizeaza = () => setDerulat(window.scrollY > PRAG_PASTILA);
    actualizeaza();
    window.addEventListener("scroll", actualizeaza, { passive: true });
    return () => window.removeEventListener("scroll", actualizeaza);
  }, [esteStart]);

  useEffect(() => {
    setPlatforma(detecteazaPlatforma(navigator.userAgent));
  }, []);

  // La schimbarea paginii se inchide tot ce era deschis.
  useEffect(() => {
    setFoaieActiva(null);
    setDescarca("inchis");
    setSertarDeschis(false);
  }, [cale]);

  const deschidePaleta = useCallback(() => {
    deschizatorPaleta.current = document.activeElement as HTMLElement | null;
    setFoaieActiva(null);
    setDescarca("inchis");
    setPaletaDeschisa(true);
  }, []);

  const inchidePaleta = useCallback(() => {
    setPaletaDeschisa(false);
    const inapoi = deschizatorPaleta.current;
    requestAnimationFrame(() => inapoi?.focus());
  }, []);

  const inchideSertar = useCallback(() => {
    setSertarDeschis(false);
    requestAnimationFrame(() => hamburger.current?.focus());
  }, []);

  // Ctrl K / Cmd K deschide paleta de oriunde.
  useEffect(() => {
    const laTasta = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (paletaDeschisa) {
          inchidePaleta();
        } else {
          deschidePaleta();
        }
      }
    };
    document.addEventListener("keydown", laTasta);
    return () => document.removeEventListener("keydown", laTasta);
  }, [paletaDeschisa, deschidePaleta, inchidePaleta]);

  // Escape inchide meniul mare si panoul Descarca; clicul in afara, la fel.
  useEffect(() => {
    if (!foaieActiva && !descarcaDeschis) return;
    const laTasta = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const zona = foaieActiva ? zonaNav.current : zonaDescarca.current;
      const deIntors = foaieActiva
        ? zonaNav.current?.querySelector<HTMLElement>('[data-declansator="' + foaieActiva + '"]')
        : zonaDescarca.current?.querySelector<HTMLElement>("button");
      // Focusul se intoarce numai daca era in meniu: un meniu deschis cu mouse-ul nu are voie sa
      // mute focusul cuiva care scrie in alta parte a paginii.
      const focusInZona = Boolean(zona && zona.contains(document.activeElement));
      setFoaieActiva(null);
      setDescarca("inchis");
      if (deIntors && focusInZona && document.activeElement !== deIntors) {
        faraRedeschidere.current = deIntors;
        deIntors.focus();
        faraRedeschidere.current = null;
      }
    };
    const laClic = (e: MouseEvent) => {
      const tinta = e.target as Node;
      if (zonaNav.current?.contains(tinta) || zonaDescarca.current?.contains(tinta)) return;
      setFoaieActiva(null);
      setDescarca("inchis");
    };
    document.addEventListener("keydown", laTasta);
    document.addEventListener("mousedown", laClic);
    return () => {
      document.removeEventListener("keydown", laTasta);
      document.removeEventListener("mousedown", laClic);
    };
  }, [foaieActiva, descarcaDeschis]);

  const anuleazaInchiderea = () => {
    if (temporizator.current) {
      clearTimeout(temporizator.current);
      temporizator.current = null;
    }
  };

  const programeazaInchiderea = () => {
    anuleazaInchiderea();
    temporizator.current = setTimeout(() => setFoaieActiva(null), INTARZIERE_INCHIDERE);
  };

  /** Hover, focus si ArrowDown deschid Descarca trecator; nu desfac o fixare facuta de clic. */
  const deschideDescarca = () => {
    setFoaieActiva(null);
    setDescarca((d) => (d === "inchis" ? "trecator" : d));
  };

  // Foile vizibile, pe textul declansatorului.
  const foi: Record<string, FoaieVizibila | undefined> = {};
  const legaturi = vizibile(ANTET.legaturi, cai);
  for (const l of legaturi) {
    if (l.foaie) {
      const f = foaieFiltrata(l.foaie, cai);
      if (f) foi[l.text] = { cheie: l.text, foaie: f };
    }
  }
  const listaFoi = Object.values(foi).filter((f): f is FoaieVizibila => Boolean(f));
  const grupuriDescarca = grupuriVizibile(cai);
  const autentificare = seVede(ANTET.autentificare, cai) ? ANTET.autentificare : null;
  const cta = seVede(ANTET.cta, cai) ? ANTET.cta : null;
  const areDescarca = grupuriDescarca.length > 0;

  const esteActiva = (l: LegaturaAntet): boolean => {
    if (l.foaie) {
      const f = foi[l.text]?.foaie;
      if (!f) return false;
      return [f.lider, ...f.elemente].some((e) => e && e.href === cale);
    }
    return l.href === cale;
  };

  const pastila = !esteStart || derulat;
  const clase = [s.antet, pastila ? s.pastila : "", plecat ? s.plecat : ""].filter(Boolean).join(" ");

  return (
    <>
      <header className={clase} data-antet={plecat ? "plecat" : pastila ? "pastila" : "plat"} inert={plecat ? true : undefined}>
        <div className={s.container}>
          <Link href="/" className={s.sigla} aria-label={ANTET.sigla.text}>
            <span className={s.siglaCadru}>
              <SiglaMarca forma="compacta" inaltime={40} prioritar />
            </span>
          </Link>

          <div
            className={s.navZona}
            ref={zonaNav}
            onMouseLeave={programeazaInchiderea}
            onMouseEnter={anuleazaInchiderea}
            onBlur={laIesireaFocusului(() => setFoaieActiva(null))}
          >
            <nav aria-label="Meniul principal">
              <ul className={s.nav}>
                {legaturi.map((l) => {
                  const areFoaie = Boolean(foi[l.text]);
                  const deschisa = foaieActiva === l.text;
                  return (
                    <li key={l.text}>
                      <Link
                        href={l.href ?? "/"}
                        className={[s.legatura, deschisa ? s.legaturaDeschisa : ""].filter(Boolean).join(" ")}
                        aria-current={esteActiva(l) ? "page" : undefined}
                        aria-expanded={areFoaie ? deschisa : undefined}
                        aria-controls={areFoaie && deschisa ? idMeniu : undefined}
                        data-declansator={areFoaie ? l.text : undefined}
                        onMouseEnter={() => {
                          anuleazaInchiderea();
                          setDescarca("inchis");
                          setFoaieActiva(areFoaie ? l.text : null);
                        }}
                        onFocus={(e) => {
                          if (faraRedeschidere.current === e.currentTarget) return;
                          setDescarca("inchis");
                          setFoaieActiva(areFoaie ? l.text : null);
                        }}
                        onKeyDown={(e) => {
                          if (areFoaie && e.key === "ArrowDown") {
                            e.preventDefault();
                            setFoaieActiva(l.text);
                            requestAnimationFrame(() =>
                              document
                                .getElementById(idMeniu)
                                ?.querySelector<HTMLElement>('[role="group"]:not([aria-hidden]) [data-element-meniu]')
                                ?.focus(),
                            );
                          }
                        }}
                      >
                        <span>{l.text}</span>
                        {areFoaie ? <Iconita nume="chevron-down" marime={12} contur={2} className={s.chevron} /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {foaieActiva && foi[foaieActiva] ? (
              <MeniuMare id={idMeniu} foi={listaFoi} activa={foaieActiva} cale={cale} onMouseEnter={anuleazaInchiderea} />
            ) : null}
          </div>

          <div className={s.actiuni}>
            <button type="button" className={s.cautare} aria-label={ANTET.cautare.eticheta} onClick={deschidePaleta}>
              <Iconita nume="search" marime={14} contur={1.5} className={s.cautareLupa} />
              <span className={s.tasta} aria-hidden="true">
                {ANTET.cautare.tasta}
              </span>
            </button>
            <SelectorLimba cai={cai} />
            {autentificare ? (
              <>
                <span className={s.separator} aria-hidden="true" />
                <Link href={autentificare.href ?? "/"} className={s.legatura}>
                  {autentificare.text}
                </Link>
              </>
            ) : null}
            {areDescarca ? (
              <div
                className={s.zonaDescarca}
                ref={zonaDescarca}
                onMouseLeave={() => setDescarca("inchis")}
                onBlur={laIesireaFocusului(() => setDescarca("inchis"))}
              >
                <button
                  type="button"
                  className={[s.descarca, descarcaDeschis ? s.descarcaDeschis : ""].filter(Boolean).join(" ")}
                  aria-expanded={descarcaDeschis}
                  aria-controls={descarcaDeschis ? idDescarca : undefined}
                  onClick={() => setDescarca((d) => (d === "fixat" ? "inchis" : "fixat"))}
                  onMouseEnter={deschideDescarca}
                  onFocus={(e) => {
                    if (faraRedeschidere.current === e.currentTarget) return;
                    deschideDescarca();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      deschideDescarca();
                      requestAnimationFrame(() =>
                        document.getElementById(idDescarca)?.querySelector<HTMLElement>("[data-element-meniu]")?.focus(),
                      );
                    }
                  }}
                >
                  <span>{ANTET.descarca.text}</span>
                  <Iconita nume="chevron-down" marime={12} contur={2} className={s.chevron} />
                </button>
                {descarcaDeschis ? <PanouDescarca id={idDescarca} grupuri={grupuriDescarca} detectata={platforma} /> : null}
              </div>
            ) : null}
            {cta ? (
              <Buton legatura={cta} marime="antet" sageata className={s.cta}>
                {cta.text}
              </Buton>
            ) : null}
          </div>

          <div className={s.mobil}>
            <button type="button" className={s.lupaMobil} aria-label={ANTET.cautare.eticheta} onClick={deschidePaleta}>
              <Iconita nume="search" marime={17} contur={1.75} />
            </button>
            <button
              ref={hamburger}
              type="button"
              className={[s.hamburger, sertarDeschis ? s.hamburgerDeschis : ""].filter(Boolean).join(" ")}
              aria-label={sertarDeschis ? ANTET.hamburger.inchide : ANTET.hamburger.deschide}
              aria-expanded={sertarDeschis}
              aria-haspopup="dialog"
              onClick={() => setSertarDeschis((d) => !d)}
              data-hamburger=""
            >
              <span className={s.bara} />
              <span className={s.bara} />
              <span className={s.bara} />
            </button>
          </div>
        </div>
      </header>

      {paletaDeschisa ? <PaletaCautare cai={cai} onInchide={inchidePaleta} /> : null}
      {sertarDeschis ? (
        <SertarMobil cai={cai} cale={cale} foi={foi} grupuriDescarca={grupuriDescarca} onInchide={inchideSertar} />
      ) : null}
    </>
  );
}
