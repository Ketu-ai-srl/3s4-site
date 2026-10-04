"use client";

// Scena din dreapta eroului (acasa-erou.md §1.6; figura dupa decizia 61): figura drumului unui
// document si lansarea machetei.
//
// Ce vine de la server, gata randat (`Erou.tsx`): desenul SVG al celor doua inele, cu cometele lor,
// etichetele lobilor, nodurile cu iconitele si inelele lor de puls, legenda si sigla. Cometele si
// inelele de puls alearga din CSS, intr-un tur de 14 s, cu intarzierile calculate in `geometrie.ts`,
// deci figura se misca si fara JavaScript. Aici se adauga numai ce cere JavaScript:
//   - miscarea se opreste cat figura e in afara ferestrei (prag 0,15) sau fila e ascunsa
//     (`data-oprit`), ca desenul sa nu se repicteze degeaba; la intoarcere continua de unde a ramas;
//   - centrul are cate un inel de puls pentru fiecare cometa care trece pe langa el;
//   - centrul devine buton: respira (3000 ms) si lanseaza macheta la clic (§1.6.3);
//   - macheta se incarca lenes, in timpul liber al navigatorului de dupa prima pictura (sau mai
//     devreme, la mouse ori focus pe centru), ca pe drumul primei picturi sa nu intre nimic din ea.
//
// La `prefers-reduced-motion: reduce` figura ramane desenata, fara miscare si fara pulsuri, iar
// centrul nu respira; macheta se deschide direct pe prima scena (§1.6.4).
//
// FARA LANSARE (`lansare === false`, pe o editie care nu arata macheta): centrul ramane element
// simplu si dupa montare, deci nu e buton, nu respira, si macheta nu se descarca deloc (nici in
// timpul liber, nici la mouse ori focus). Figura si pulsurile raman. Pe RO proprietatea lipseste.
// Starea se scrie si pe server, ca `data-fara-lansare` pe spatiu: butonul centrului apare abia dupa
// montare, deci HTML-ul de pe server nu-l are pe nicio editie, iar atributul e martorul care se vede
// fara navigator. Absenta butonului dupa hidratare o pazeste proba de browser a startului EN.

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { INTARZIERI_CENTRU, secunde } from "./geometrie";
import { useMiscareRedusa, useMontat } from "./hooks";
import type { MachetaProps } from "./Macheta";
import s from "./Erou.module.css";

/**
 * Macheta, incarcata lenes (codul si stilurile ei vin intr-o bucata separata a pachetului). Nu prin
 * `next/dynamic`: acolo componenta lenesa suspenda la prima randare chiar daca bucata e deja
 * descarcata, iar React tine locul gol inca ~300 ms. Masurat pe build-ul de productie, cu bucata
 * descarcata dinainte: prin `next/dynamic` cadrul intra la +644 ms de la clic, asa la +336..+342;
 * referinta, +341. Aici componenta se randeaza numai dupa ce modulul e in memorie.
 *
 * Bucata poate sa nu vina: o livrare noua cu o fila veche deschisa, o retea mobila care cade. Atunci
 * promisiunea se sterge, ca apelul urmator (alt clic, mouse-ul pe centru) sa reincerce descarcarea,
 * iar fiecare apelant isi trateaza respingerea. Masurat pe forma fara tratare, cu bucata oprita:
 * 4 erori necapturate, iar dupa clic scena ramanea goala (doar podeaua si umbra), fara "inapoi".
 */
let modulMacheta: ComponentType<MachetaProps> | null = null;
let descarcareMacheta: Promise<ComponentType<MachetaProps>> | null = null;
const incarcaMacheta = (): Promise<ComponentType<MachetaProps>> => {
  if (modulMacheta) return Promise.resolve(modulMacheta);
  if (!descarcareMacheta) {
    descarcareMacheta = import("./Macheta").then(
      (m) => {
        modulMacheta = m.default;
        return m.default;
      },
      (eroare: unknown) => {
        descarcareMacheta = null;
        throw eroare;
      },
    );
  }
  return descarcareMacheta;
};

/** Descarcarea dinainte (timp liber, mouse, focus): un esec nu are ce anunta, clicul reincearca. */
const faraEroare = () => undefined;

/** Iesirea buclei la lansare: 320 ms de tranzitie, apoi macheta intra (in cod, 330 ms). */
const IESIRE_MS = 330;

type Faza = "bucla" | "iesire" | "macheta";

export type ScenaErouProps = {
  desen: ReactNode;
  suprapuneri: ReactNode;
  legenda: ReactNode;
  sigla: ReactNode;
  sageata: ReactNode;
  /** Eticheta accesibila si pastila centrului; fara ele, centrul arata numai sigla. */
  etichetaCentru?: string;
  pastilaCentru?: string;
  /** `false`: fara buton in centru si fara macheta. Absenta = comportamentul de pe RO. */
  lansare?: boolean;
};

export default function ScenaErou({
  desen,
  suprapuneri,
  legenda,
  sigla,
  sageata,
  etichetaCentru,
  pastilaCentru,
  lansare,
}: ScenaErouProps) {
  const cuLansare = lansare !== false;
  const montat = useMontat();
  const redus = useMiscareRedusa();
  const [faza, setFaza] = useState<Faza>("bucla");
  const spatiuRef = useRef<HTMLDivElement>(null);
  const scenaRef = useRef<HTMLDivElement>(null);
  const centruRef = useRef<HTMLButtonElement>(null);
  /** `true` cat figura e in afara ferestrei sau fila e ascunsa: miscarea CSS sta pe loc. */
  const [oprit, setOprit] = useState(false);
  /** Dupa intoarcerea din macheta focusul revine pe centru; `null` = nu e nimic de intors. */
  const revinePeCentru = useRef<{ tastatura: boolean } | null>(null);
  /** Componenta machetei, cand modulul ei e deja in memorie. */
  const [Macheta, setMacheta] = useState<ComponentType<MachetaProps> | null>(() => modulMacheta);

  const animat = montat && !redus && faza !== "macheta";

  // Miscarea figurii e CSS si porneste singura; aici numai se opreste cat figura nu se vede (in afara
  // ferestrei, prag 0,15, sau fila ascunsa) si cat se vede macheta, ca desenul sa nu se repicteze
  // degeaba. Animatiile oprite isi pastreaza pozitia: la intoarcere continua de unde au ramas.
  useEffect(() => {
    if (!animat) return;
    const scena = scenaRef.current;
    if (!scena) return;
    let vizibil = true;
    const actualizeaza = () => setOprit(!(vizibil && document.visibilityState === "visible"));
    const observator = new IntersectionObserver(
      (intrari) => {
        vizibil = intrari[intrari.length - 1].isIntersecting;
        actualizeaza();
      },
      { threshold: 0.15 },
    );
    observator.observe(scena);
    document.addEventListener("visibilitychange", actualizeaza);
    actualizeaza();
    return () => {
      observator.disconnect();
      document.removeEventListener("visibilitychange", actualizeaza);
      setOprit(false);
    };
  }, [animat]);

  // Macheta se descarca in timpul liber al navigatorului, dupa ce pagina s-a pictat, ca la clic sa
  // intre fara asteptare: la referinta codul ei vine odata cu al eroului (fisa, §4), deci cadrul
  // porneste la 341 ms de la clic. Pe drumul primei picturi nu intra nimic din ea.
  useEffect(() => {
    if (!montat || !cuLansare) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, optiuni?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let anulat = false;
    const incarca = () =>
      void incarcaMacheta().then((c) => {
        if (!anulat) setMacheta(() => c);
      }, faraEroare);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(incarca, { timeout: 3000 });
      return () => {
        anulat = true;
        w.cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(incarca, 2000);
    return () => {
      anulat = true;
      window.clearTimeout(t);
    };
  }, [montat, cuLansare]);

  // Dupa intoarcerea din macheta, focusul revine pe centru, de unde a plecat. Pagina se deruleaza
  // pana la el numai cand omul lucreaza de la tastatura; dupa un clic nu sare nimic.
  useEffect(() => {
    const cerere = revinePeCentru.current;
    if (faza === "bucla" && cerere) {
      revinePeCentru.current = null;
      centruRef.current?.focus({ preventScroll: !cerere.tastatura });
    }
  }, [faza]);

  useEffect(() => {
    if (faza !== "iesire") return;
    const temporizator = window.setTimeout(() => setFaza("macheta"), redus ? 0 : IESIRE_MS);
    return () => window.clearTimeout(temporizator);
  }, [faza, redus]);

  // Bucla pleaca numai cand modulul machetei e in memorie, ca in locul ei sa nu ramana doar podeaua.
  // De obicei e deja acolo (descarcat in timpul liber sau la mouse ori focus pe centru), iar
  // promisiunea rezolvata porneste iesirea imediat, in aceeasi sarcina. Daca bucata nu vine, bucla
  // ramane pe loc si butonul activ, iar un clic nou reincearca descarcarea; daca cererea atarna,
  // bucla ramane vizibila cat atarna, nu dispare.
  const lanseaza = useCallback(() => {
    void incarcaMacheta().then((c) => {
      setMacheta(() => c);
      setFaza((f) => (f === "bucla" ? "iesire" : f));
    }, faraEroare);
  }, []);

  const inapoi = useCallback((tastatura: boolean) => {
    revinePeCentru.current = { tastatura };
    setFaza("bucla");
  }, []);

  const preincarca = useCallback(() => {
    void incarcaMacheta().then((c) => setMacheta(() => c), faraEroare);
  }, []);

  // Pulsurile siglei, cate unul per cometa, pornite la secundele din INTARZIERI_CENTRU (geometrie.ts).
  // Sunt decor, ascunse cititoarelor de ecran; la miscare redusa CSS-ul le opreste, deci nu se vad.
  const continutCentru = (
    <>
      <span className={s.centruSigla}>{sigla}</span>
      {INTARZIERI_CENTRU.map((intarziere, i) => (
        <span key={i} className={s.inelCentru} data-inel-puls="" aria-hidden="true" style={{ animationDelay: secunde(intarziere) }} />
      ))}
      {pastilaCentru ? (
        <span className={s.centruPastila} data-pastila-centru="">
          <span>{pastilaCentru}</span>
          {sageata}
        </span>
      ) : null}
      {etichetaCentru ? <span className="doar-cititor">{etichetaCentru}</span> : null}
    </>
  );

  return (
    <div
      ref={spatiuRef}
      className={s.spatiu}
      data-faza={faza}
      data-fara-lansare={cuLansare ? undefined : ""}
      data-viu={animat ? "" : undefined}
      data-oprit={(animat && oprit) || faza === "macheta" ? "" : undefined}
    >
      <div className={s.podea} aria-hidden="true" />
      <div className={s.umbra} aria-hidden="true" />

      {/* Bucla ramane in pagina si cat se vede macheta, asezata dar ascunsa (Erou.module.css): la
          "inapoi" reapare fara sa-si construiasca din nou desenul, etichetele si legenda si fara sa le
          aseze de la zero. Masurat la 390, CPU x4, in clicul pe "inapoi": asezarea 4-22 ms cand bucla
          se construia din nou (2 rulari), 0,3-2,5 ms asa (3 rulari). */}
      <div
        className={
          s.bucla +
          (faza === "iesire" ? " " + s.buclaIesire : "") +
          (faza === "macheta" && Macheta ? " " + s.buclaAscunsa : "")
        }
      >
        <div ref={scenaRef} className={s.scena}>
          {desen}
          {suprapuneri}
          {montat && cuLansare ? (
            <button
              ref={centruRef}
              type="button"
              className={s.centru}
              onClick={lanseaza}
              onPointerEnter={preincarca}
              onFocus={preincarca}
              disabled={faza !== "bucla"}
            >
              {continutCentru}
            </button>
          ) : (
            <span className={s.centru}>
              {continutCentru}
            </span>
          )}
        </div>
        {legenda}
      </div>
      {cuLansare && faza === "macheta" && Macheta ? <Macheta redus={redus} spatiu={spatiuRef} laInapoi={inapoi} /> : null}
    </div>
  );
}
