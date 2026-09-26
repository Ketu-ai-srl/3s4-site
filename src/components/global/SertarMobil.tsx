"use client";

// Sertarul mobil (sub 1200 px). Se deschide din hamburger; se inchide din X, din clicul pe fundal si
// din Escape, iar focusul revine pe hamburger (il muta Antet.tsx). Aceleasi date ca antetul:
// legaturile, foile meniului mare ca grupuri pliabile, limba, si in picior Autentificare, Descarca
// (sub-vedere proprie) si butonul plin - toate filtrate pe caile existente.
//
// FOCUSUL NU PARASESTE DIALOGUL cat e deschis. Doua mecanisme, fiindca unul singur nu ajunge:
// - schimbarea vederii demonteaza butonul apasat (Descarca pleaca odata cu piciorul, Inapoi odata
//   cu sub-vederea), iar focusul ar cadea pe BODY; se muta deci explicit pe butonul pereche
//   (masurat inainte de reparatie, pe copia cu toate caile: dupa Enter pe Descarca focusul era
//   pe BODY, iar Tab-ul urmator iesea pe legaturile paginii de sub fundal);
// - capcana de Tab aduce inapoi orice focus ajuns in afara dialogului, pe orice cale.
// Probele: tests/browser/fundatie-antet-intreg.spec.ts (pe o copie cu toate caile existente).

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ANTET,
  LIMBI,
  PANOU_DESCARCA,
  SERTAR,
  seVede,
  vizibile,
  type CaiExistente,
  type GrupDescarca,
} from "@/content/navigatie";
import Buton from "@/components/primitive/Buton";
import Iconita from "@/components/primitive/Iconita";
import { ICONITA_PLATFORMA } from "./descarcare";
import type { FoaieVizibila } from "./MeniuMare";
import SiglaMarca from "./SiglaMarca";
import s from "./SertarMobil.module.css";

export type SertarMobilProps = {
  cai: CaiExistente;
  cale: string;
  foi: Record<string, FoaieVizibila | undefined>;
  grupuriDescarca: GrupDescarca[];
  onInchide: () => void;
};

export default function SertarMobil({ cai, cale, foi, grupuriDescarca, onInchide }: SertarMobilProps) {
  const [grupDeschis, setGrupDeschis] = useState<string | null>(null);
  const [limbaDeschisa, setLimbaDeschisa] = useState(false);
  const [vedereDescarca, setVedereDescarca] = useState(false);
  const sertar = useRef<HTMLDivElement>(null);
  const inchide = useRef<HTMLButtonElement>(null);
  const butonDescarca = useRef<HTMLButtonElement>(null);
  const butonInapoi = useRef<HTMLButtonElement>(null);
  /** Butonul care primeste focusul dupa schimbarea vederii; `null` la deschiderea sertarului. */
  const focusDupaVedere = useRef<"inapoi" | "descarca" | null>(null);

  useEffect(() => {
    inchide.current?.focus();
    const inainte = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const laTasta = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onInchide();
        return;
      }
      if (e.key === "Tab" && sertar.current) {
        const focalizabile = Array.from(
          sertar.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        ).filter((el) => el.offsetParent !== null);
        if (focalizabile.length === 0) return;
        const primul = focalizabile[0];
        const ultimul = focalizabile[focalizabile.length - 1];
        const activ = document.activeElement;
        if (!activ || !sertar.current.contains(activ)) {
          e.preventDefault();
          (e.shiftKey ? ultimul : primul).focus();
        } else if (e.shiftKey && activ === primul) {
          e.preventDefault();
          ultimul.focus();
        } else if (!e.shiftKey && activ === ultimul) {
          e.preventDefault();
          primul.focus();
        }
      }
    };
    document.addEventListener("keydown", laTasta);
    return () => {
      document.body.style.overflow = inainte;
      document.removeEventListener("keydown", laTasta);
    };
  }, [onInchide]);

  // Dupa schimbarea vederii, focusul trece pe butonul pereche (cel apasat tocmai s-a demontat).
  useEffect(() => {
    const tinta = focusDupaVedere.current;
    focusDupaVedere.current = null;
    if (tinta === "inapoi") butonInapoi.current?.focus();
    if (tinta === "descarca") butonDescarca.current?.focus();
  }, [vedereDescarca]);

  const intraInDescarca = () => {
    focusDupaVedere.current = "inapoi";
    setVedereDescarca(true);
  };

  const iesiDinDescarca = () => {
    focusDupaVedere.current = "descarca";
    setVedereDescarca(false);
  };

  const legaturi = vizibile(ANTET.legaturi, cai);
  const limbi = vizibile(LIMBI, cai);
  const activa = LIMBI.find((l) => l.activa);
  const autentificare = seVede(ANTET.autentificare, cai) ? ANTET.autentificare : null;
  const cta = seVede(ANTET.cta, cai) ? ANTET.cta : null;
  const areDescarca = grupuriDescarca.length > 0;

  return (
    <>
      <div className={s.fundal} onClick={onInchide} aria-hidden="true" data-sertar-fundal="" />
      <div ref={sertar} className={s.sertar} role="dialog" aria-modal="true" aria-label={SERTAR.eticheta} data-sertar="">
        <div className={s.cap}>
          <Link href="/" aria-label={ANTET.sigla.text} onClick={onInchide}>
            {/* Forma compacta, ca in antet: sigla completa de 36 px avea DOC MANAGEMENT la 3,2 px in desen (DIRECTIA.md). */}
            <SiglaMarca forma="compacta" inaltime={40} />
          </Link>
          <button ref={inchide} type="button" className={s.inchide} aria-label={SERTAR.inchide} onClick={onInchide}>
            <Iconita nume="x" marime={20} contur={1.75} />
          </button>
        </div>

        <nav className={s.corp} aria-label={SERTAR.eticheta}>
          {vedereDescarca ? (
            <div className={s.subVedere}>
              <button ref={butonInapoi} type="button" className={s.inapoi} onClick={iesiDinDescarca}>
                <Iconita nume="arrow-left" marime={18} contur={2} />
                <span>{PANOU_DESCARCA.inapoi}</span>
              </button>
              {grupuriDescarca.map((g) => (
                <div key={g.titlu} className={s.grupDescarca}>
                  <p className={s.grupDescarcaTitlu}>{g.titlu}</p>
                  {g.elemente.map((e) => (
                    <Link key={e.text} href={e.href ?? "/"} className={s.randDescarca} onClick={onInchide}>
                      <span className={s.randCutie} aria-hidden="true">
                        <Iconita nume={ICONITA_PLATFORMA[e.platforma]} marime={20} contur={1.6} />
                      </span>
                      <span>
                        <span className={s.randTitlu}>{e.text}</span>
                        <span className={s.randAjutor}>{e.descriere}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <>
              {legaturi.map((l) => {
                const foaie = l.foaie ? foi[l.text] : undefined;
                if (!foaie) {
                  return (
                    <Link
                      key={l.text}
                      href={l.href ?? "/"}
                      className={s.legatura}
                      aria-current={l.href === cale ? "page" : undefined}
                      onClick={onInchide}
                    >
                      {l.text}
                    </Link>
                  );
                }
                const deschis = grupDeschis === l.text;
                const idGrup = "sertar-grup-" + l.text.replace(/[^a-z]/gi, "").toLowerCase();
                return (
                  <div key={l.text} className={deschis ? s.grupDeschis : undefined}>
                    <button
                      type="button"
                      className={s.legatura}
                      aria-expanded={deschis}
                      aria-controls={deschis ? idGrup : undefined}
                      onClick={() => setGrupDeschis(deschis ? null : l.text)}
                    >
                      <span>{l.text}</span>
                      <Iconita nume="chevron-down" marime={14} contur={2} className={s.chevron} />
                    </button>
                    {deschis ? (
                      <ul id={idGrup} className={s.subLista}>
                        {foaie.foaie.lider ? (
                          <li>
                            <Link href={foaie.foaie.lider.href ?? "/"} className={s.subLegatura + " " + s.subLider} onClick={onInchide}>
                              {foaie.foaie.lider.text}
                            </Link>
                          </li>
                        ) : null}
                        {foaie.foaie.elemente.map((e) => (
                          <li key={e.text}>
                            <Link href={e.href ?? "/"} className={s.subLegatura} onClick={onInchide}>
                              {e.text}
                            </Link>
                          </li>
                        ))}
                        {foaie.foaie.subsol.href ? (
                          <li>
                            <Link href={foaie.foaie.subsol.href} className={s.subLegatura + " " + s.subTot} onClick={onInchide}>
                              {foaie.foaie.subsol.text}
                            </Link>
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
              {activa ? (
                <div className={[s.limba, limbaDeschisa ? s.grupDeschis : ""].filter(Boolean).join(" ")}>
                  <button
                    type="button"
                    className={s.legatura}
                    aria-expanded={limbaDeschisa}
                    aria-controls={limbaDeschisa ? "sertar-limba" : undefined}
                    onClick={() => setLimbaDeschisa((d) => !d)}
                  >
                    <span>{activa.text}</span>
                    <Iconita nume="chevron-down" marime={14} contur={2} className={s.chevron} />
                  </button>
                  {limbaDeschisa ? (
                    <ul id="sertar-limba" className={s.limbaPanou}>
                      {limbi.map((l) => (
                        <li key={l.cod}>
                          <Link
                            href={l.href ?? "/"}
                            className={[s.limbaOptiune, l.activa ? s.limbaActiva : ""].filter(Boolean).join(" ")}
                            lang={l.cod.toLowerCase()}
                            onClick={onInchide}
                          >
                            <span>{l.text}</span>
                            {l.activa ? <Iconita nume="check" marime={14} contur={2} /> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </nav>

        {!vedereDescarca && (autentificare || areDescarca || cta) ? (
          <div className={s.picior}>
            {autentificare ? (
              <Link href={autentificare.href ?? "/"} className={s.autentificare} onClick={onInchide}>
                {autentificare.text}
              </Link>
            ) : null}
            {areDescarca ? (
              <button ref={butonDescarca} type="button" className={s.descarca} onClick={intraInDescarca}>
                <span>{ANTET.descarca.text}</span>
                <Iconita nume="chevron-right" marime={12} contur={2} />
              </button>
            ) : null}
            {cta ? (
              <Buton legatura={cta} latimePlina sageata>
                {cta.text}
              </Buton>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
