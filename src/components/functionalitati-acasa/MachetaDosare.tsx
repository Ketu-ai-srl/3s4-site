"use client";

// Vizualul pasului 2 (Store) pe editiile 3s.md: un arbore de dosare cu documentele ca bare schematice,
// FARA CUVINTE. Pe 3s.md macheta portalului clientilor nu se monteaza (decizia 43); in locul ei, pasul
// arata forma pe care o spune textul lui: documentele stau in ordine, in dosarele firmei, iar arhiva zip
// a originalelor le pastreaza structura. Site-ul RO isi pastreaza macheta portalului
// (`PasiFunctionalitati.tsx`).
//
// FARA TEXT SI FARA CIFRE. Numele dosarelor si ale documentelor sunt bare; placuta formatului, eticheta de
// tip si bifa au formele si culorile din machetele vecine (placuta PDF / foaie de calcul a cautarii,
// etichetele factura / albastru / raport si bifa verde a registrului), fara cuvantul lor. Figura e
// decorativa (`aria-hidden`): continutul pasului il poarta titlul si paragraful lui. Nu are nimic
// focalizabil.
//
// INSIGNA ZIP din cap spune ca originalele se pot exporta intr-o arhiva zip care pastreaza structura
// dosarelor (paragraful pasului pe editia EN); exportul exista in platforma (descarcarea unui dosar sau a
// unei selectii ca o singura arhiva zip).
//
// INTRAREA, ca la registru (`MachetaRegistruVedere.tsx`): documentele apar pe rand, primul la 900 ms dupa
// pornirea ceasului si apoi cate unul la 500 ms, fiecare urcand 6 px din transparent in 250 ms - constantele
// registrului, importate, nu copiate. Ceasul bate numai cat macheta e activa si vizibila (`ceas.ts`); o data
// completa, lista ramane completa.
//
// ABATERE DE LA REGISTRU: randurile NU se insereaza. Stau in pagina de la inceput si doar se arata, deci
// arborele nu isi schimba inaltimea in timpul secventei, iar vizualul incape intreg in rama la orice pas al
// ei. Randurile impart inaltimea ramei in parti egale (`MachetaDosare.module.css`): la 1440 (cardul lipit)
// si pe mobil (cardul pistei, cel mult 56vh) nimic nu e taiat, deci estomparea de jos nu are ce inmuia.
//
// STAREA STATICA (HTML fara JavaScript, miscare redusa): toate documentele, starea finala.
//
// `data-macheta-dosare` numeste figura pentru lista de congruenta a startului (`config/congruenta/p01.json`),
// iar `data-documente` spune cate documente se vad.

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  FolderTree,
} from "lucide-react";
import type { CodTip } from "@/content/acasa-functionalitati";
import { areMiscareRedusa, useBataie, useVizibil } from "./ceas";
import type { MachetaProps } from "./MachetaCautareVedere";
import { INTARZIERE_VERIFICARI, PERIOADA_VERIFICARI } from "./MachetaRegistruVedere";
import s from "./MachetaDosare.module.css";

/** Formatul unui document: placuta lui, in culorile placutelor din macheta cautarii. */
type Format = "pdf" | "xls";

/** Un dosar al arborelui, deschis (cu documentele lui) sau inchis; latimile barelor, in procente din rand. */
type Dosar = {
  deschis: boolean;
  nume: number;
  documente: { format: Format; nume: number; tip: CodTip }[];
};

/** Doua dosare deschise, cu cate doua documente, si unul inchis: arborele intreg are 7 randuri. */
const ARBORE: Dosar[] = [
  {
    deschis: true,
    nume: 44,
    documente: [
      { format: "pdf", nume: 64, tip: "factura" },
      { format: "pdf", nume: 48, tip: "albastru" },
    ],
  },
  {
    deschis: true,
    nume: 36,
    documente: [
      { format: "xls", nume: 54, tip: "raport" },
      { format: "pdf", nume: 70, tip: "factura" },
    ],
  },
  { deschis: false, nume: 48, documente: [] },
];

/** Cate documente are arborele; secventa de intrare le arata pe toate, unul cate unul. */
const TOTAL_DOCUMENTE = ARBORE.reduce((n, d) => n + d.documente.length, 0);

/** Locul primului document al fiecarui dosar in ordinea intrarii (de sus in jos, prin toate dosarele). */
const PRIMUL_DOCUMENT = ARBORE.map((_, i) => ARBORE.slice(0, i).reduce((n, d) => n + d.documente.length, 0));

const ICONITA_FORMAT = { pdf: FileText, xls: FileSpreadsheet } as const;

export default function MachetaDosare({ activ, inert = false, className }: MachetaProps) {
  const radacina = useRef<HTMLElement>(null);
  const vizibil = useVizibil(radacina);

  const [aparute, setAparute] = useState<number>(TOTAL_DOCUMENTE);
  const [cuMiscare, setCuMiscare] = useState(false);

  useEffect(() => {
    if (areMiscareRedusa()) return;
    setCuMiscare(true);
    setAparute(0);
  }, []);

  useBataie(activ && vizibil && cuMiscare && aparute < TOTAL_DOCUMENTE, INTARZIERE_VERIFICARI, PERIOADA_VERIFICARI, () => {
    setAparute((n) => Math.min(TOTAL_DOCUMENTE, n + 1));
  });

  return (
    <figure
      ref={radacina}
      className={[s.dosare, className ?? ""].filter(Boolean).join(" ")}
      aria-hidden="true"
      inert={inert}
      data-macheta-dosare=""
      data-documente={aparute}
    >
      <div className={s.cap}>
        <FolderTree width={14} height={14} strokeWidth={2} />
        <span className={s.bara} data-ton="titlu" />
        <span className={s.zip}>
          <FileArchive width={13} height={13} strokeWidth={1.8} />
        </span>
      </div>
      <div className={s.arbore}>
        <div className={s.capArbore}>
          <span className={s.bara} data-ton="coloana" />
          <span className={s.bara} data-ton="coloana" />
          <span className={s.bara} data-ton="coloana" />
        </div>
        <ul className={s.randuri}>
          {ARBORE.flatMap((d, i) => [
            <li key={"d" + i} className={s.dosar} data-deschis={d.deschis ? "" : undefined}>
              {d.deschis ? <ChevronDown width={12} height={12} strokeWidth={2} /> : <ChevronRight width={12} height={12} strokeWidth={2} />}
              {d.deschis ? (
                <FolderOpen className={s.iconitaDosar} width={18} height={18} strokeWidth={1.6} />
              ) : (
                <Folder className={s.iconitaDosar} width={18} height={18} strokeWidth={1.6} />
              )}
              <span className={s.bara} data-ton="dosar" style={{ width: d.nume + "%" }} />
            </li>,
            ...d.documente.map((doc, j) => {
              const Iconita = ICONITA_FORMAT[doc.format];
              return (
                <li
                  key={"d" + i + "-" + j}
                  className={s.document}
                  data-primul={j === 0 ? "" : undefined}
                  data-ultim={j === d.documente.length - 1 ? "" : undefined}
                  data-ascuns={PRIMUL_DOCUMENT[i] + j >= aparute ? "" : undefined}
                >
                  <span className={s.placuta} data-format={doc.format}>
                    <Iconita width={13} height={13} strokeWidth={2} />
                  </span>
                  <span className={s.bara} data-ton="document" style={{ width: doc.nume + "%" }} />
                  <span className={s.eticheta} data-tip={doc.tip} />
                  <Check className={s.bifa} width={13} height={13} strokeWidth={2.4} />
                </li>
              );
            }),
          ])}
        </ul>
      </div>
    </figure>
  );
}
