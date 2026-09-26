"use client";

// S4 - telefonul cu trei ecrane (functionalitati__aplicatie-mobila.md, S4): titlul, paragraful de un rand si
// macheta de telefon 360 x 760 (280 x 591 la 390), desenata in CSS: corp cu chenar de 12 px, decupaj, bara
// "home", bara de stare, indicatorul de pas si ecranul curent.
//
// CELE TREI ECRANE: fotografiaza (vizor cu colturi, foaia rotita -2 grade, bara de scanare `2,4 s`),
// eticheteaza (actul si 4 etichete care apar pe rand, `0,5 s` cu depasire, intarzieri 0,15 / 0,45 / 0,75 /
// 1,05 s), trimite (cercul verde cu bifa, `0,6 s`). Fiecare ecran intra cu `0,5 s` (opacitate si 6 px).
//
// CICLUL: un ecran la 3,5 s, in ordinea 1 -> 2 -> 3 -> 1. La referinta merge de la incarcare si in afara
// ferestrei (fisa S4, NEMASURAT de unde porneste); aici porneste de la primul ecran numai cand telefonul e in
// fereastra si numai cu miscare permisa (README-ul cadrului: ceasurile JS merg doar cat piesa se vede). In
// HTML-ul servit si la miscare redusa ramane pe primul ecran, ca la referinta; buclele CSS le opreste regula
// globala.
//
// MISCAREA LA DERULARE: telefonul intra cu formula de solutie (sablon §4.5), intreg la p ~0,44 (poarta text).

import { Check, MapPin, User } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { ECRAN_MS, TELEFON } from "@/content/functionalitati/aplicatie-mobila";
import s from "./mobila.module.css";

/** Ecranul care urmeaza in ciclu. */
export function ecranUrmator(i: number): number {
  return (i + 1) % TELEFON.ecrane.length;
}

function useCiclu(ref: RefObject<HTMLElement | null>): number {
  const miscare = useMiscarePermisa();
  const [ecran, setEcran] = useState(0);
  const [vizibil, setVizibil] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const o = new IntersectionObserver((intrari) => setVizibil(intrari.some((i) => i.isIntersecting)), { threshold: 0.3 });
    o.observe(el);
    return () => o.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!miscare || !vizibil) return;
    const ceas = window.setInterval(() => setEcran((e) => ecranUrmator(e)), ECRAN_MS);
    return () => window.clearInterval(ceas);
  }, [miscare, vizibil]);

  return miscare ? ecran : 0;
}

function EcranFotografiaza() {
  return (
    <div className={s.vizor}>
      {(["ss", "sd", "js", "jd"] as const).map((c) => (
        <span key={c} className={[s.colt, s["colt-" + c]].join(" ")} aria-hidden="true" />
      ))}
      <div className={s.foaie} aria-hidden="true">
        {[226, 147, 226, 226, 147].map((l, i) => (
          <span key={i} className={s.randFoaie} style={{ width: (l / 245) * 100 + "%" }} />
        ))}
        <span className={s.liniaSemnaturii}>________________</span>
      </div>
      <span className={s.baraScanare} aria-hidden="true" />
    </div>
  );
}

function EcranEticheteaza() {
  const e = TELEFON.etichete;
  const etichete = [
    { text: e.firma, clasa: s.etFirma, iconita: null },
    { text: e.stare, clasa: s.etStare, iconita: <Check width={9} height={9} strokeWidth={3} aria-hidden="true" focusable="false" /> },
    { text: e.loc, clasa: s.etNeutru, iconita: <MapPin width={9} height={9} strokeWidth={2.5} aria-hidden="true" focusable="false" /> },
    { text: e.persoana, clasa: s.etNeutru, iconita: <User width={9} height={9} strokeWidth={2.5} aria-hidden="true" focusable="false" /> },
  ];
  return (
    <div className={s.panouEtichete}>
      <span className={s.cipDoc}>
        <span className={s.etPdf}>PDF</span>
        <span className={s.numeDoc}>{TELEFON.document}</span>
      </span>
      <span className={s.etichete}>
        {etichete.map((et, i) => (
          <span key={et.text} className={[s.eticheta, et.clasa].join(" ")} style={{ "--i": String(i) } as CSSProperties}>
            {et.iconita}
            {et.text}
          </span>
        ))}
      </span>
    </div>
  );
}

function EcranTrimite() {
  return (
    <div className={s.zonaTrimis}>
      <span className={s.cercTrimis} aria-hidden="true">
        <Check width={28} height={28} strokeWidth={3} />
      </span>
      <span className={s.textTrimis}>
        <span className={s.numeTrimis}>{TELEFON.document}</span>
        <span className={s.destinatie}>{TELEFON.destinatie}</span>
        <span className={s.marca}>{TELEFON.marca}</span>
      </span>
    </div>
  );
}

const ECRANE = [EcranFotografiaza, EcranEticheteaza, EcranTrimite];

export default function Telefon() {
  const ref = useRef<HTMLDivElement>(null);
  const ecran = useCiclu(ref);
  const e = TELEFON.ecrane[ecran];
  const Ecran = ECRANE[ecran];
  return (
    <SectiuneScena inaltime={100} spatiere="scena" latime={720} nume="telefon">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{TELEFON.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{TELEFON.paragraf}</p>
      <div ref={ref} className={s.telefonLoc}>
        <figure className={s.telefon} data-macheta="telefon" data-ecran={ecran + 1}>
          <span className={s.decupaj} aria-hidden="true" />
          <div className={s.ecranTelefon}>
            <div className={s.stareTelefon}>
              <span className={s.punctAlbastru} aria-hidden="true" />
              <span className={s.numeAplicatie}>{TELEFON.aplicatie}</span>
              <span className={s.oraTelefon}>{TELEFON.ora}</span>
              <span className={s.exemplu}>{TELEFON.exemplu}</span>
            </div>
            <div className={s.indicator} aria-hidden="true">
              {TELEFON.ecrane.map((x, i) => (
                <span key={x.numar} className={[s.pas, i === ecran ? s.pasActiv : ""].filter(Boolean).join(" ")} />
              ))}
            </div>
            <div key={ecran} className={s.pasTelefon}>
              <div className={s.randTitlu}>
                <span className={s.numarPas}>{e.numar}</span>
                <span className={s.numePas}>{e.nume}</span>
              </div>
              <div className={s.continutPas}>
                <Ecran />
              </div>
              <p className={s.legenda}>{e.legenda}</p>
            </div>
          </div>
          <span className={s.home} aria-hidden="true" />
          <figcaption className="doar-cititor">{TELEFON.declaratie}</figcaption>
        </figure>
      </div>
    </SectiuneScena>
  );
}
