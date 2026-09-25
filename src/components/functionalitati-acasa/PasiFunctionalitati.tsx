"use client";

// Partea vie a functionalitatilor: cei 3 pasi, cardul lipit cu machetele, panza 3D si pista de mobil
// (acasa-functionalitati.md §3-§12). Antetul si fraza de iesire raman pe server, in
// `FunctionalitatiAcasa.tsx`.
//
// UN SINGUR ARBORE PENTRU AMBELE ASEZARI. Lista `ol` a pasilor e coloana stanga a grilei peste 900
// px si banda pistei pana la 900; fiecare `li` tine macheta pasului (vazuta doar pana la 900) si
// blocul lui de text. Machetele cardului lipit sunt o a doua instanta, ascunsa pana la 900 px: asa
// textul exista o singura data in pagina (h3 si paragrafe numarate de proba `fundatie-start`), iar
// comutarea intre asezari e doar CSS, fara salt la hidratare peste 900 px.
//
// STAREA STATICA (fara JavaScript, sau cu miscare redusa) e cea a ciotului: toti pasii plini, cardul
// cu macheta 1, sub 900 px cardurile unul sub altul. JavaScript-ul adauga doua marcaje pe grila:
//   - `data-js`, cand pasul activ e calculat: pasii inactivi trec pe culorile lor (peste 900 px);
//   - `data-pista`, cand miscarea e permisa: sub 900 px, pe un ecran mai inalt de 600 px, cardurile
//     devin pista orizontala lipita (pe un telefon culcat raman unul sub altul, fisa §12).
// Fara JavaScript pista nu se construieste deloc: altfel cardurile 2 si 3 ar ramane in afara
// ecranului, fiindca banda nu s-ar mai misca.
//
// ABATERI DE LA REFERINTA (fisa §14): pasii inactivi pe culori pline, nu la opacitate 0,45 (contrast);
// sloturile inactive sunt `inert` (la referinta, Tab trecea prin machete invizibile); miscarea redusa
// schimba pasul pe loc (regula globala din `globals.css`); punctele pistei aliniaza exact cardul lor
// si au etichete in romana; ceasul machetelor porneste la activarea pasului.
//
// CINE E "ACTIV" (ceasul unei machete bate cat ea e activa SI vizibila 30%, `ceas.ts`):
//   - peste 900 px, macheta din cardul lipit a pasului activ;
//   - pe pista, macheta cardului activ;
//   - pana la 900 px FARA pista (ecranul culcat), toate trei: nu exista pas sau card activ,
//     cardurile stau unul sub altul, deci ceasul il porneste vizibilitatea, ca la referinta (fisa
//     §5-§7). Fara asta, cu miscare, machetele nu porneau niciodata, iar montarea le golise deja
//     starea statica (masurat la 844 x 390: randurile 000 si 0 verificari din 4 dupa 6 s in ecran).
//     Cu miscare redusa ceasul nu bate oricum: machetele isi pastreaza starea statica.

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import type { PasFunctionalitate } from "@/content/acasa";
import { PUNCTE_PISTA } from "@/content/acasa-functionalitati";
import Scena3D from "@/components/scena3d/Scena3D";
import { areMiscareRedusa, useMedia, useMiscareRedusa, useMontat } from "./ceas";
import { cardDinProgres, pasDupaPraguri, progresPista, tintaPunct, translatieBanda } from "./derulare";
import MachetaCautare, { type MachetaProps } from "./MachetaCautare";
import MachetaPortal from "./MachetaPortal";
import MachetaRegistru from "./MachetaRegistru";
import { construiestePanza, type StarePanza } from "./panza";
import s from "./FunctionalitatiAcasa.module.css";

const MACHETE: ComponentType<MachetaProps>[] = [MachetaCautare, MachetaPortal, MachetaRegistru];

/** Latimea de la care se vede grila de desktop. Pragul e 900,02, nu 901: o fereastra cu zoom poate
 *  avea 900,5 px CSS, unde `min-width: 901px` si `max-width: 900px` ar tacea amandoua. Sintaxa de
 *  interval (`width > 900px`) ar fi exacta, dar Safari o intelege abia de la 16.4. */
const DESKTOP = "(min-width: 900.02px)";
/** Pista: pana la 900 px, si numai pe un ecran mai inalt de 600 px. Pe un telefon culcat, cardurile
 *  stau unul sub altul, ca la miscare redusa (fisa §12, "ecran scund culcat"). */
const PISTA = "(max-width: 900px) and (min-height: 600.02px)";

/** Samanta panzei: aceeasi asezare a foilor la fiecare incarcare. */
export const SAMANTA_PANZA = 47;

export default function PasiFunctionalitati({ pasi }: { pasi: PasFunctionalitate[] }) {
  const montat = useMontat();
  const redus = useMiscareRedusa();
  const desktop = useMedia(DESKTOP);
  const latimePista = useMedia(PISTA);
  const cuPista = montat && !redus;
  const modPista = cuPista && latimePista;

  // Pasul activ la desktop; `null` pana la primul calcul (HTML-ul servit nu are pas activ).
  const [pas, setPas] = useState<number | null>(null);
  // Cardul activ pe pista.
  const [card, setCard] = useState(0);

  const pasRef = useRef(0);
  const cardRef = useRef(0);
  const blocuri = useRef<(HTMLLIElement | null)[]>([]);
  const pista = useRef<HTMLDivElement>(null);
  const fereastra = useRef<HTMLDivElement>(null);
  const banda = useRef<HTMLOListElement>(null);

  // Starea citita de panza la fiecare cadru; obiectul e acelasi pe toata viata componentei.
  const [stareScena] = useState<StarePanza>(() => ({ pas: 0 }));
  const construieste = useMemo(() => construiestePanza(stareScena), [stareScena]);

  useEffect(() => {
    if (!montat) return;
    const mqDesktop = window.matchMedia(DESKTOP);
    let cerut = 0;

    const actualizeaza = () => {
      cerut = 0;
      const vh = window.innerHeight;
      if (mqDesktop.matches) {
        const topuri = blocuri.current.map((b) => (b ? b.getBoundingClientRect().top : 0));
        const nou = pasDupaPraguri(pasRef.current, topuri, vh);
        pasRef.current = nou;
        stareScena.pas = nou;
        setPas(nou);
      }
      const b = banda.current;
      const p = pista.current;
      const f = fereastra.current;
      if (!b || !p || !f) return;
      if (modPista) {
        const progres = progresPista(p.getBoundingClientRect().top, p.offsetHeight, f.offsetHeight);
        b.style.transform = translatieBanda(progres);
        const c = cardDinProgres(progres);
        if (c !== cardRef.current) {
          cardRef.current = c;
          setCard(c);
        }
      } else if (b.style.transform) {
        b.style.transform = "";
      }
    };

    const programeaza = () => {
      if (!cerut) cerut = requestAnimationFrame(actualizeaza);
    };
    window.addEventListener("scroll", programeaza, { passive: true });
    window.addEventListener("resize", programeaza);
    mqDesktop.addEventListener("change", programeaza);
    programeaza();
    return () => {
      window.removeEventListener("scroll", programeaza);
      window.removeEventListener("resize", programeaza);
      mqDesktop.removeEventListener("change", programeaza);
      if (cerut) cancelAnimationFrame(cerut);
    };
  }, [montat, modPista, stareScena]);

  /** Clicul pe un punct: derulare pana cand cardul lui sta exact in fereastra (fisa §14.12). */
  const mergiLaCard = (index: number) => {
    const p = pista.current;
    const f = fereastra.current;
    if (!p || !f) return;
    const top = p.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: tintaPunct(index, top, p.offsetHeight - f.offsetHeight),
      behavior: areMiscareRedusa() ? "auto" : "smooth",
    });
  };

  const pasSlot = pas ?? 0;

  return (
    <div
      className={s.grila}
      data-js={pas !== null ? "" : undefined}
      data-pista={cuPista ? "" : undefined}
      data-pas={pas ?? undefined}
      data-card={modPista ? card : undefined}
    >
      <div ref={pista} className={s.pista}>
        <div ref={fereastra} className={s.fereastra}>
          <ol ref={banda} className={s.pasi}>
            {pasi.map((p, i) => {
              const Macheta = MACHETE[i];
              // Pe pista, macheta unui card din afara ferestrei nu primeste focus: altfel Tab ar
              // ajunge pe un element taiat de fereastra pistei.
              return (
                <li
                  key={p.numar}
                  ref={(el) => {
                    blocuri.current[i] = el;
                  }}
                  className={s.pas}
                  data-step={i}
                  data-activ={pas === i ? "" : undefined}
                >
                  <Macheta
                    activ={modPista ? card === i : montat && !desktop}
                    estompat
                    inert={modPista && card !== i}
                    className={s.vizualMobil}
                  />
                  <div className={s.text}>
                    <span className={s.numar}>{p.numar}</span>
                    <span className={s.eticheta}>{p.eticheta}</span>
                    <h3 className={"t-h3-pas " + s.titluPas}>{p.titlu}</h3>
                    <p className={s.paragraf}>{p.paragraf}</p>
                    <span className={s.sina} aria-hidden="true">
                      {pasi.map((q, j) => {
                        // Fara pas calculat (HTML-ul servit), fiecare bloc isi arata propriul pas;
                        // cu el, toate cele 3 sine arata aceeasi stare (fisa §3).
                        const referinta = pas ?? i;
                        return (
                          <span
                            key={q.numar}
                            className={[
                              s.liniuta,
                              j <= referinta ? s.liniutaParcursa : "",
                              j === referinta ? s.liniutaCurenta : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          />
                        );
                      })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className={s.puncte} role="group" aria-label={PUNCTE_PISTA.grup}>
            {pasi.map((p, i) => (
              <button
                key={p.numar}
                type="button"
                className={s.punct}
                data-curent={card === i ? "" : undefined}
                aria-label={PUNCTE_PISTA.punct(i + 1, pasi.length, p.eticheta)}
                aria-current={card === i ? "step" : undefined}
                onClick={() => mergiLaCard(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={s.coloanaVizuala}>
        <div className={s.lipit}>
          <Scena3D className={s.gazda3d} construieste={construieste} samanta={SAMANTA_PANZA} />
          <div className={s.card}>
            {pasi.map((p, i) => {
              const Macheta = MACHETE[i];
              return (
                <div key={p.numar} className={s.slot} data-activ={pasSlot === i ? "" : undefined} inert={pasSlot !== i}>
                  <Macheta activ={montat && desktop && pas === i} estompat={i < 2} className={s.umple} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
