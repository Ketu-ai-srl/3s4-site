"use client";

// S3 - frustrarea (functionalitati__cautare-ai.md, S3): cardul unei cautari facute de mana, cu contoare
// care urmeaza derularea, si cinci replici de birou care plutesc in jur.
//
// CONTOARELE (fisa S3, [derulare]): fisiere = round(N x p), minute = round(M x p) (afisate "Xh Ym", la
// fel in cronometrul din cap), colegi = round(C x p). La referinta N, M, C sunt 47, 92, 3; la 3S
// scenariul are valorile lui (`FRUSTRARE.maxime`), date ca exemplu. In HTML-ul servit si la miscare
// redusa contoarele stau la valoarea finala (p = 1).
//
// CITATELE: 5 la 1440, 4 la 390 (al cincilea ascuns); opacitatea cardului k: la referinta min(1, 2(p -
// 0,075(k-1))), la 3S aceeasi scara intreaga la p 0,45 (abaterea de contrast, in `CardCitat.module.css`),
// inclinari -3 / +2 / +4 / -2 / +1 grade, plutire 7 / 9 / 8 / 10 / 8 s cu intarzieri 0 / -2 / -4 / -1 /
// -3 s.

import { Clock, File, Users, ZoomOut } from "lucide-react";
import CardCitat from "@/components/cinema/CardCitat";
import { CutieIconitaCinema, PastilaStare } from "@/components/cinema/Fereastra";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import { FRUSTRARE } from "@/content/functionalitati/cautare-ai";
import b from "@/components/cinema/bucle.module.css";
import s from "./cautare.module.css";

/** Minutele scrise ca in macheta: "1h 38m". */
export function formatTimp(minute: number): string {
  const m = Math.max(0, Math.round(minute));
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
}

const ASEZARE_CITATE = [
  { clasa: s.citat1, inclinare: -3, plutire: 7, intarziere: 0 },
  { clasa: s.citat2, inclinare: 2, plutire: 9, intarziere: -2 },
  { clasa: s.citat3, inclinare: 4, plutire: 8, intarziere: -4 },
  { clasa: s.citat4, inclinare: -2, plutire: 10, intarziere: -1 },
  { clasa: s.citat5, inclinare: 1, plutire: 8, intarziere: -3 },
] as const;

function CardSesiune() {
  const { maxime } = FRUSTRARE;
  const fisiere = useDinProgres((p) => Math.round(maxime.fisiere * p));
  const timp = useDinProgres((p) => formatTimp(maxime.minute * p));
  const colegi = useDinProgres((p) => Math.round(maxime.colegi * p));
  const randuri = [
    { ...FRUSTRARE.fisiere, iconita: <File width={18} height={18} strokeWidth={1.75} aria-hidden="true" />, valoare: <span className={s.numar}>{fisiere}</span> },
    { ...FRUSTRARE.timp, iconita: <Clock width={18} height={18} strokeWidth={1.75} aria-hidden="true" />, valoare: <span className={[s.numar, s.numarTimp].join(" ")}>{timp}</span> },
    { ...FRUSTRARE.colegi, iconita: <Users width={18} height={18} strokeWidth={1.75} aria-hidden="true" />, valoare: <span className={s.numar}>{colegi}</span> },
  ];
  return (
    <figure className={s.cardSesiune} data-macheta="sesiune">
      <div className={s.capSesiune}>
        <span className={s.inCurs}>
          <span className={[s.punctRosu, b.clipire14].join(" ")} aria-hidden="true" />
          {FRUSTRARE.inCurs}
        </span>
        <span className={s.sesiune}>{FRUSTRARE.sesiune}</span>
        <span className={s.cronometru} aria-hidden="true">
          {timp}
        </span>
      </div>
      <ul className={s.randuriSesiune}>
        {randuri.map((r) => (
          <li key={r.eticheta} className={s.randSesiune}>
            <CutieIconitaCinema className={s.cutieSesiune}>{r.iconita}</CutieIconitaCinema>
            <span className={s.textSesiune}>
              <span className={s.etichetaSesiune}>{r.eticheta}</span>
              <span className={s.subSesiune}>{r.sub}</span>
            </span>
            {r.valoare}
          </li>
        ))}
        <li className={s.randSesiune}>
          <CutieIconitaCinema rosie className={s.cutieSesiune}>
            <ZoomOut width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
          </CutieIconitaCinema>
          <span className={s.textSesiune}>
            <span className={s.etichetaSesiune}>{FRUSTRARE.rezultat.eticheta}</span>
            <span className={s.subSesiune}>{FRUSTRARE.rezultat.sub}</span>
          </span>
          <PastilaStare ton="rosu" className={s.pastilaSesiune}>
            {FRUSTRARE.negasit}
          </PastilaStare>
        </li>
      </ul>
      <div className={s.subsolSesiune}>
        <span className={[s.punctGalben, b.clipire14].join(" ")} aria-hidden="true" />
        <span>
          {FRUSTRARE.continua}
          <span className={b.treiPuncte}>...</span>
        </span>
      </div>
      <figcaption className="doar-cititor">{FRUSTRARE.declaratie}</figcaption>
    </figure>
  );
}

export default function Frustrare() {
  return (
    <SectiuneScena inaltime={80} spatiere="scena-sus" latime={820} nume="frustrare" interiorClassName={s.frustrare}>
      <CardSesiune />
      <div className={s.citate}>
        {FRUSTRARE.citate.map((text, i) => {
          const a = ASEZARE_CITATE[i];
          return (
            <CardCitat
              key={text}
              text={text}
              inclinare={a.inclinare}
              plutire={a.plutire}
              intarziere={a.intarziere}
              ordine={i + 1}
              className={[s.citat, a.clasa].join(" ")}
            />
          );
        })}
      </div>
    </SectiuneScena>
  );
}
