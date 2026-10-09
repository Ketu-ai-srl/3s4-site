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
//
// PALETA: la inchidere focusul revine pe elementul care a deschis-o. Deschisa din Ctrl K, focusul era pe
// BODY (masurat: dupa Escape focusul ramanea pe BODY, 9 din 9), deci atunci revine pe butonul de cautare
// vizibil la latimea curenta (cel din antet peste 1200 px, lupa sub 1200 px).
//
// SERTARUL traieste numai sub pragul antetului mobil (1200 px, aceeasi conditie ca in Antet.module.css). Daca
// fereastra trece peste prag cu sertarul deschis (tableta rotita, fereastra marita), sertarul se inchide: altfel
// ramaneau simultan meniul desktop si sertarul, iar derularea paginii ramanea blocata (masurat pe baza: la 1440
// sertarul deschis si `body` cu `overflow: hidden`, pana la clicul pe X).
//
// PE EDITIE (felia navigatie-pe-editie): contractul de navigatie si multimea cailor vin ca proprietati,
// cu IMPLICITUL de azi (`NAVIGATIE_RO`, `CAI_EXISTENTE`), deci layout-ul romanesc randeaza ca inainte.
// Editiile `en` si `ro-MD` dau contractul lor, construit pe server cu canalele domeniului: CTA-ul e
// WhatsApp cu textul paginii curente (`ctaPeCale`), iar fara panoul de descarcare (`descarca: null`)
// butonul Descarca lipseste. Selectorul de limba arata echivalentul paginii curente (`limbiPentruCale`).
//
// ASEZAREA (`src/lib/asezare.ts`): contractul poarta cai SURSA, deci pagina curenta se citeste ca sursa
// (`useCaleSursa`) si toate comparatiile (start, legatura activa, CTA-ul paginii, limbile) raman pe sursa; adresele
// scrise de antet in `href` (sigla, legaturile, Autentificare) sunt SERVITE (`hrefAntet`). Pe asezarea `md` ambele
// sunt identitatea.

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
import { ECHIVALENTE } from "@/content/echivalente";
import {
  NAVIGATIE_RO,
  ctaPeCale,
  limbiPentruCale,
  seVede,
  vizibile,
  type CaiExistente,
  type ContractNavigatie,
  type FoaieMeniu,
  type LegaturaAntet,
  type PlatformaDescarca,
} from "@/content/navigatie";
import { RUTE } from "@/content/rute";
import { caSursa, caleServita, useCaleSursa } from "@/lib/asezare";
import { editiiBuild } from "@/lib/editii";
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

/**
 * Conditia antetului mobil (sigla, lupa, hamburgerul), aceeasi ca `@media (max-width: 1200px)` din
 * Antet.module.css. Sertarul exista numai cat ea e adevarata.
 */
export const PRAG_ANTET_MOBIL = "(max-width: 1200px)";

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

/** Adresa scrisa in `href` de antet: calea servita a caii sursa din contract ("/" cand lipseste, ca inainte). */
function hrefAntet(href: string | null): string {
  return caleServita(caSursa(href ?? "/"), RUTE);
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

export type AntetProps = {
  /** Contractul de navigatie al editiei; implicit cel romanesc. */
  navigatie?: ContractNavigatie;
  /** Caile care exista; implicit cele ale build-ului. */
  cai?: CaiExistente;
};

export default function Antet({ navigatie = NAVIGATIE_RO, cai = CAI_EXISTENTE }: AntetProps) {
  const ANTET = navigatie.antet;
  const cale = useCaleSursa(RUTE, usePathname) ?? "/";
  const esteStart = cale === ANTET.sigla.href;

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
  const butonCautare = useRef<HTMLButtonElement>(null);
  const lupaMobil = useRef<HTMLButtonElement>(null);
  const zonaNav = useRef<HTMLDivElement>(null);
  const zonaDescarca = useRef<HTMLDivElement>(null);
  /**
   * Declansatorul pe care Escape tocmai intoarce focusul. Focusul pe declansator deschide meniul
   * (§2.4), deci fara asta Escape inchidea si, in acelasi eveniment, focusul intors redeschidea
   * (masurat: era nevoie de doua apasari). Tine exact cat apelul `focus()`: evenimentul de focus
   * e sincron, iar valoarea se goleste imediat dupa, deci nu poate inghiti un focus viitor.
   */
  const faraRedeschidere = useRef<HTMLElement | null>(null);
  /**
   * ArrowDown pe un declansator muta focusul pe primul element al meniului. Elementul exista abia
   * dupa ce React aplica starea deschisa, iar aplicarea NU vine garantat inaintea cadrului
   * urmator: pe o masina incarcata (CPU incetinit de 4 ori), la 42-66 ms dupa focusul pe
   * declansator meniul inca nu era in pagina cand a rulat `requestAnimationFrame`, deci focusul
   * ramanea pe declansator si ArrowDown era pierdut (9 din 30 de rulari; CI Windows, 2 din ~1000).
   * Acum: daca elementul exista, focusul se muta pe loc; altfel cererea asteapta aici si o
   * implineste efectul de dupa aplicarea starii. Cererea traieste o singura aplicare.
   */
  const deFocusat = useRef<{ id: string; selector: string } | null>(null);
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
    const activ = document.activeElement as HTMLElement | null;
    deschizatorPaleta.current = activ && activ !== document.body ? activ : null;
    setFoaieActiva(null);
    setDescarca("inchis");
    setPaletaDeschisa(true);
  }, []);

  const inchidePaleta = useCallback(() => {
    setPaletaDeschisa(false);
    const deschizator = deschizatorPaleta.current;
    requestAnimationFrame(() => {
      // Fara deschizator (Ctrl K de pe BODY) sau cu unul care nu mai e in pagina: butonul de cautare vizibil.
      const inapoi =
        deschizator && deschizator.isConnected
          ? deschizator
          : [butonCautare.current, lupaMobil.current].find((b) => b !== null && b.offsetParent !== null);
      inapoi?.focus();
    });
  }, []);

  const inchideSertar = useCallback(() => {
    setSertarDeschis(false);
    requestAnimationFrame(() => hamburger.current?.focus());
  }, []);

  // Sertarul se inchide cand fereastra trece peste pragul antetului mobil. Focusul nu se muta pe hamburger
  // (peste prag hamburgerul nu se vede); demontarea sertarului reda `overflow`-ul de dinainte al paginii.
  useEffect(() => {
    if (!sertarDeschis || typeof window.matchMedia !== "function") return;
    const mobil = window.matchMedia(PRAG_ANTET_MOBIL);
    const laSchimbare = () => {
      if (!mobil.matches) setSertarDeschis(false);
    };
    laSchimbare();
    mobil.addEventListener("change", laSchimbare);
    return () => mobil.removeEventListener("change", laSchimbare);
  }, [sertarDeschis]);

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

  const focuseazaPrimul = (id: string, selector: string) => {
    const tinta = document.getElementById(id)?.querySelector<HTMLElement>(selector);
    if (tinta) {
      deFocusat.current = null;
      tinta.focus();
    } else {
      deFocusat.current = { id, selector };
    }
  };

  useEffect(() => {
    const cerere = deFocusat.current;
    if (!cerere) return;
    deFocusat.current = null;
    document.getElementById(cerere.id)?.querySelector<HTMLElement>(cerere.selector)?.focus();
  }, [foaieActiva, descarca]);

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
  const grupuriDescarca = ANTET.descarca === null ? [] : grupuriVizibile(cai);
  const autentificare = seVede(ANTET.autentificare, cai) ? ANTET.autentificare : null;
  const ctaPagina = ctaPeCale(ANTET.cta, cale);
  const cta = seVede(ctaPagina, cai) ? ctaPagina : null;
  const areDescarca = grupuriDescarca.length > 0;
  const limbi = limbiPentruCale(navigatie.limbi, cale, ECHIVALENTE, editiiBuild());
  // Sertarul primeste contractul cu CTA-ul deja ales pentru pagina curenta.
  const navigatiePagina: ContractNavigatie = { ...navigatie, antet: { ...ANTET, cta: ctaPagina } };

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
          <Link href={hrefAntet(ANTET.sigla.href)} className={s.sigla} aria-label={ANTET.sigla.text}>
            <SiglaMarca inaltime={40} prioritar />
          </Link>

          <div
            className={s.navZona}
            ref={zonaNav}
            onMouseLeave={programeazaInchiderea}
            onMouseEnter={anuleazaInchiderea}
            onBlur={laIesireaFocusului(() => setFoaieActiva(null))}
          >
            <nav aria-label={ANTET.meniu}>
              <ul className={s.nav}>
                {legaturi.map((l) => {
                  const areFoaie = Boolean(foi[l.text]);
                  const deschisa = foaieActiva === l.text;
                  return (
                    <li key={l.text}>
                      <Link
                        href={hrefAntet(l.href)}
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
                            // Foaia ACESTUI declansator, nu cea vizibila: cu starea inca neaplicata,
                            // vizibila poate fi foaia de dinainte.
                            focuseazaPrimul(
                              idMeniu,
                              '[role="group"][aria-label="' +
                                CSS.escape(foi[l.text]?.foaie.eticheta ?? "") +
                                '"]:not([aria-hidden]) [data-element-meniu]',
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
            <button ref={butonCautare} type="button" className={s.cautare} aria-label={ANTET.cautare.eticheta} onClick={deschidePaleta}>
              <Iconita nume="search" marime={14} contur={1.5} className={s.cautareLupa} />
              <span className={s.tasta} aria-hidden="true">
                {ANTET.cautare.tasta}
              </span>
            </button>
            <SelectorLimba cai={cai} limbi={navigatie.limbi} eticheta={navigatie.selector.eticheta} />
            {autentificare ? (
              <>
                <span className={s.separator} aria-hidden="true" />
                <Link href={hrefAntet(autentificare.href)} className={s.legatura}>
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
                      focuseazaPrimul(idDescarca, "[data-element-meniu]");
                    }
                  }}
                >
                  <span>{ANTET.descarca?.text}</span>
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
            <button ref={lupaMobil} type="button" className={s.lupaMobil} aria-label={ANTET.cautare.eticheta} onClick={deschidePaleta}>
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

      {paletaDeschisa ? <PaletaCautare cai={cai} paleta={navigatie.paleta} onInchide={inchidePaleta} /> : null}
      {sertarDeschis ? (
        <SertarMobil
          cai={cai}
          cale={cale}
          foi={foi}
          grupuriDescarca={grupuriDescarca}
          navigatie={navigatiePagina}
          limbi={limbi}
          onInchide={inchideSertar}
        />
      ) : null}
    </>
  );
}
