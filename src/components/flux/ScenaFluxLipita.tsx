"use client";

// Scena lipita "azi pe mana / cu 3S" de pe /flux-documente (flux-documente.md §2, COMPONENTE §4.10).
//
// Pinul are 300lvh (280lvh sub 600) DUPA pregatire; lipitorul e `sticky`, 100svh. Totul e legat de
// derulare, fara netezire: la fiecare cadru se citeste pozitia pinului si se aplica starea din
// `cronologie.ts` direct pe elemente (fara stare React pe cadru). Doar clasele pasilor si ale
// descrierilor au tranzitii scurte (0,2-0,35 s), ca la referinta.
//
// FARA JAVASCRIPT si la MISCARE REDUSA pinul nu se pregateste: scena ramane statica, cu panoul
// sistemului, toti pasii bifati si cele cinci descrieri una sub alta, vizibile. HTML-ul servit
// poarta deci tot textul scenei (paritatea G-AI-01), inclusiv etichetele fazei intai, pe care CSS
// le arata numai cand pinul e pregatit.

import { FileText, FolderTree, Inbox, ScanText, ShieldCheck, UserCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FERESTRE, SCENA } from "@/content/flux";
import { distantaPeScara, stareScena, type Punct } from "./cronologie";
import s from "./flux.module.css";

const ICONITE: Record<string, (marime: number) => ReactNode> = {
  inbox: (m) => <Inbox width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  "scan-text": (m) => <ScanText width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  "folder-tree": (m) => <FolderTree width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  "user-check": (m) => <UserCheck width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  "shield-check": (m) => <ShieldCheck width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
};

export default function ScenaFluxLipita() {
  const [gata, setGata] = useState(false);
  const pin = useRef<HTMLDivElement | null>(null);
  const ferestre = useRef<(HTMLDivElement | null)[]>([]);
  const doc = useRef<HTMLDivElement | null>(null);
  const stampila = useRef<HTMLSpanElement | null>(null);
  const pastila = useRef<HTMLSpanElement | null>(null);
  const panou = useRef<HTMLDivElement | null>(null);
  const pasi = useRef<(HTMLLIElement | null)[]>([]);
  const descrieri = useRef<(HTMLParagraphElement | null)[]>([]);
  const persoana = useRef<HTMLSpanElement | null>(null);
  const contor = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setGata(true);
  }, []);

  useEffect(() => {
    if (!gata) return;
    const p = pin.current;
    if (!p) return;
    let cadru = 0;
    let ultimLocuri = -1;

    const aplica = () => {
      cadru = 0;
      const ingust = window.innerWidth < 600;
      const centre: Punct[] = FERESTRE.map((f) => {
        const [x, y] = ingust ? f.ingust : f.lat;
        return { x, y };
      });
      const r = p.getBoundingClientRect();
      const u = distantaPeScara(r.top, r.height, window.innerHeight);
      const st = stareScena(u, centre, ingust);

      p.dataset.faza = String(st.faza);
      st.ferestre.forEach((f, i) => {
        const el = ferestre.current[i];
        if (!el) return;
        const [x, y, z, rot] = ingust ? FERESTRE[i].ingust : FERESTRE[i].lat;
        el.style.opacity = f.opacitate.toFixed(3);
        el.style.transform =
          "translate(-50%, -50%) translate3d(" + x + "px, " + (y + f.dy).toFixed(1) + "px, " + z + "px) rotate(" + rot + "deg)";
      });
      const d = doc.current;
      if (d) {
        // Sub 600 cipul nu iese din ecran: centrul lui se tine la jumatate de cip de margine.
        if (ingust) {
          const jum = Math.max(0, window.innerWidth / 2 - d.offsetWidth / 2 - 8);
          st.doc.x = Math.min(jum, Math.max(-jum, st.doc.x));
        }
        d.style.opacity = st.doc.opacitate.toFixed(3);
        d.style.transform =
          "translate(-50%, -50%) translate(" +
          st.doc.x.toFixed(1) +
          "px, " +
          st.doc.y.toFixed(1) +
          "px) rotate(" +
          st.doc.rotatie.toFixed(2) +
          "deg) scale(" +
          st.doc.scara.toFixed(3) +
          ")";
        d.dataset.stampilat = st.pas >= 0 ? "da" : "nu";
      }
      if (stampila.current) {
        stampila.current.textContent = st.pas >= 0 ? SCENA.pasi[st.pas].stampila : "";
      }
      const pl = pastila.current;
      if (pl) {
        if (st.pastila >= 0) {
          const c = centre[st.pastila];
          pl.textContent = FERESTRE[st.pastila].verb;
          pl.style.opacity = "1";
          pl.style.transform = "translate(-50%, -50%) translate(" + (c.x + (ingust ? 0 : 40)) + "px, " + (c.y - 58) + "px)";
        } else {
          pl.style.opacity = "0";
        }
      }
      if (panou.current) panou.current.style.opacity = st.panou.toFixed(3);
      pasi.current.forEach((el, i) => {
        if (!el) return;
        el.dataset.stare = st.pas < 0 ? "" : i < st.pas ? "on" : i === st.pas ? "now" : "";
      });
      descrieri.current.forEach((el, i) => {
        if (!el) return;
        el.dataset.curenta = i === st.pas ? "da" : "nu";
      });
      if (persoana.current) persoana.current.dataset.vizibila = st.persoana ? "da" : "nu";
      if (contor.current && st.locuri !== ultimLocuri) {
        ultimLocuri = st.locuri;
        contor.current.textContent = SCENA.contor1(st.locuri);
      }
    };

    const programeaza = () => {
      if (cadru === 0) cadru = requestAnimationFrame(aplica);
    };
    aplica();
    window.addEventListener("scroll", programeaza, { passive: true });
    window.addEventListener("resize", programeaza);
    return () => {
      window.removeEventListener("scroll", programeaza);
      window.removeEventListener("resize", programeaza);
      if (cadru) cancelAnimationFrame(cadru);
    };
  }, [gata]);

  return (
    <section className={s.scenaSectiune} aria-labelledby="flux-scena-titlu">
      <div className="container-site">
        <header className={s.scenaIntro}>
          <h2 id="flux-scena-titlu" className={"t-h2-bloc " + s.capTitlu}>
            {SCENA.titlu}
          </h2>
          <p className={s.capText}>{SCENA.text}</p>
        </header>
      </div>
      <div ref={pin} className={s.pin} data-scena-flux="" data-gata={gata ? "da" : undefined} data-faza={gata ? "1" : undefined}>
        <div className={s.lipitor}>
          <div className={s.bara}>
            <span className={s.faza}>
              <span className={s.faza1}>{SCENA.faza1}</span>
              <span className={s.faza2}>{SCENA.faza2}</span>
            </span>
            <span className={s.contor}>
              <span ref={contor} className={s.contor1}>
                {SCENA.contor1(1)}
              </span>
              <span className={s.contor2}>{SCENA.contor2}</span>
            </span>
          </div>
          <figure className={s.scena}>
            <figcaption className="doar-cititor">{SCENA.declaratie}</figcaption>
            <span className={s.eticheteExemplu} aria-hidden="true">Exemplu</span>
            <div className={s.scenaInterior}>
              {FERESTRE.map((f, i) => (
                <div
                  key={f.nume}
                  ref={(el) => {
                    ferestre.current[i] = el;
                  }}
                  className={[s.fereastra, i === 4 ? s.fereastraFierbinte : ""].join(" ")}
                  aria-hidden="true"
                >
                  <span className={s.fereastraBara}>{f.nume}</span>
                  <span className={s.fereastraCorp}>
                    <span className={s.fereastraLinie} style={{ width: "100%" }} />
                    <span className={s.fereastraLinie} style={{ width: "70%" }} />
                    <span className={s.fereastraLinie} style={{ width: "45%" }} />
                  </span>
                </div>
              ))}

              <div ref={panou} className={s.panou}>
                <div className={s.panouBara}>
                  {/* Numele marcii ca text, nu sigla: la 18 px randurile siglei nu se citesc (regula de
                      lizibilitate din DIRECTIA.md, "Sigla"). */}
                  <span className={s.panouMarca}>3S</span>
                  <span className={s.panouNume}>arhiva firmei</span>
                </div>
                <div className={s.panouCorp}>
                  <span className={s.panouLinie} aria-hidden="true" />
                  <ol className={s.pasi}>
                    {SCENA.pasi.map((p, i) => (
                      <li
                        key={p.titlu}
                        ref={(el) => {
                          pasi.current[i] = el;
                        }}
                        className={s.pas}
                        style={{ ["--sx" as string]: [-320, -160, 0, 160, 320][i] + "px", ["--i" as string]: i }}
                      >
                        <span className={s.pasCutie}>{ICONITE[p.iconita](24)}</span>
                        <span className={s.pasTitlu}>{p.titlu}</span>
                        <span className={s.pasNota}>{p.nota}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <span ref={pastila} className={s.pastilaActiune} aria-hidden="true" />

              <div ref={doc} className={s.doc} aria-hidden="true">
                <span className={s.docNume}>
                  <FileText width={14} height={14} strokeWidth={1.5} aria-hidden="true" />
                  {SCENA.fisier}
                </span>
                <span ref={stampila} className={s.docStampila} />
              </div>

              <span ref={persoana} className={s.persoana}>
                <span className={s.persoanaAvatar} aria-hidden="true">
                  {SCENA.persoana.initiala}
                </span>
                {SCENA.persoana.nume}
              </span>
            </div>
          </figure>
          <div className={s.descrieri}>
            {SCENA.pasi.map((p, i) => (
              <p
                key={p.titlu}
                ref={(el) => {
                  descrieri.current[i] = el;
                }}
                className={s.descriere}
              >
                {p.descriere}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
