// Sina cu cei 4 pasi ai actului (comparatie-drive.md §4): fiecare pas are o scena desenata in HTML
// (fara imagini), numarul, titlul si textul. Scenele poarta date FICTIVE (numele fisierului,
// marimea, rolurile), declarate ca exemplu pentru cititoarele de ecran (plan D9) si, la vedere,
// printr-o eticheta mica in coltul primei scene (D11); desenul insusi e ascuns cititoarelor,
// fiindca repeta ce spun titlul si textul pasului.

import { BookOpen, Clock, Paperclip, ScanLine, User } from "lucide-react";
import s from "./comparatii.module.css";

export type PasSina = { numar: string; titlu: string; text: string };

export type MacheteSina = {
  fisier: string;
  marime: string;
  tip: string;
  termen: string;
  /** Umplerea barei de recunoastere, in procente. */
  progres: number;
  persoane: string[];
  registru: string;
};

export type SinaPasiProps = {
  pasi: PasSina[];
  machete: MacheteSina;
  declaratie: string;
  /** Eticheta vizibila de exemplu, in coltul primei scene. */
  exemplu: string;
};

function Scena({ index, m }: { index: number; m: MacheteSina }) {
  if (index === 0) {
    return (
      <>
        <span className={s.fisier}>
          <ScanLine size={14} strokeWidth={1.5} className={s.iconitaMacheta} />
          <span className={s.fisierNume}>{m.fisier}</span>
        </span>
        <span className={s.estompat}>
          <Paperclip size={14} strokeWidth={1.5} className={s.iconitaMacheta} />
          <span>{m.marime}</span>
        </span>
      </>
    );
  }
  if (index === 1) {
    return (
      <>
        <span className={s.jetoane}>
          <span className={s.jeton + " " + s.jetonTip}>{m.tip}</span>
          <span className={s.jeton}>{m.termen}</span>
        </span>
        <span className={s.progres}>
          <span className={s.progresUmplere} style={{ width: m.progres + "%" }} />
        </span>
      </>
    );
  }
  if (index === 2) {
    return (
      <>
        {m.persoane.map((p, i) => (
          <span key={p} className={i === 0 ? s.ruta + " " + s.rutaActiva : s.ruta}>
            <User size={13} strokeWidth={1.6} />
            <span>{p}</span>
          </span>
        ))}
      </>
    );
  }
  return (
    <>
      <span className={s.fisier}>
        <BookOpen size={14} strokeWidth={1.5} className={s.iconitaMacheta} />
        <span className={s.registruText}>{m.registru}</span>
      </span>
      <span className={s.estompat}>
        <Clock size={13} strokeWidth={1.6} className={s.iconitaMacheta} />
        <span>{m.termen}</span>
      </span>
    </>
  );
}

export default function SinaPasi({ pasi, machete, declaratie, exemplu }: SinaPasiProps) {
  return (
    <>
      <p className="doar-cititor">{declaratie}</p>
      <ol className={s.sina}>
        {pasi.map((p, i) => (
          <li key={p.numar} className={s.pas}>
            <div className={s.scena} aria-hidden="true">
              {i === 0 ? <span className={s.exempluMacheta}>{exemplu}</span> : null}
              <Scena index={i} m={machete} />
            </div>
            <span className={s.pasNumar}>{p.numar}</span>
            <h3 className={s.pasTitlu}>{p.titlu}</h3>
            <p className={s.pasText}>{p.text}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
