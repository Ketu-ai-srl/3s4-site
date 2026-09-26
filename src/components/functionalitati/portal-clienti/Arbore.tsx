"use client";

// S1 - arborele de dosare din inbox (functionalitati__portal-clienti.md, S1): contorul de necitite si
// fereastra cu 16 randuri, fara titlu si fara paragraf.
//
// MISCAREA (fisa S1, [derulare], in ambele sensuri): randul i porneste de la .12 si se aprinde cu panta
// 6 de la pragul s_i ~ 0,06 i (s_1 = 0,05, s_15 = 0,92), apoi aluneca spre dreapta cu
// max(0, 84 (p - s_i - 0,119)) px - scara de la stanga sus spre dreapta jos. Contorul creste cu
// derularea: pornire + floor(24 p), scris cu punct de mii.
//
// ETICHETA "exemplu" (decizia D11): arborele are nume de firme, deci poarta eticheta vizibila in coltul
// de sus-dreapta al ferestrei, pe langa declaratia pentru cititori.
//
// ABATEREA DE CONTRAST: la referinta ultimul rand ("si inca peste ...") porneste la 0,92, deci la p = 1
// sta la opacitate .48 si textul lui iese 2,0:1 (masurat pe pixeli, 25.09) chiar in starea finala. Aici
// porneste odata cu randul 14 (0,84): la p = 1 e la .96, iar scara ramane aceeasi.

import { Ellipsis, File, Folder, Inbox } from "lucide-react";
import type { CSSProperties } from "react";
import Fereastra from "@/components/cinema/Fereastra";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import b from "@/components/cinema/bucle.module.css";
import { ARBORE, ETICHETA_EXEMPLU, NECITITE_CRESTERE, NECITITE_START, type RandArbore } from "@/content/functionalitati/portal-clienti";
import s from "./portal.module.css";

/** Pragul de aprindere al randului i (fisa S1). */
export function pragArbore(i: number, total: number = ARBORE.randuri.length): number {
  if (i === 0) return 0;
  if (i === 1) return 0.05;
  if (i === total - 1) return Math.round(0.06 * (total - 2) * 1000) / 1000;
  return Math.round(0.06 * i * 1000) / 1000;
}

/** Un numar cu punct de mii, ca in macheta: 1318 -> "1.318". */
export function cuPunctDeMii(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Contorul la progresul p: pornire + floor(24 p). */
export function necititeLa(p: number): number {
  return NECITITE_START + Math.floor(NECITITE_CRESTERE * p);
}

function Iconita({ tip }: { tip: RandArbore["tip"] }) {
  if (tip === "radacina") return <Inbox width={14} height={14} strokeWidth={2} aria-hidden="true" focusable="false" />;
  if (tip === "fisier") return <File width={13} height={13} strokeWidth={2} aria-hidden="true" focusable="false" />;
  if (tip === "infinit") return <Ellipsis width={14} height={14} strokeWidth={2} aria-hidden="true" focusable="false" />;
  return <Folder width={14} height={14} strokeWidth={2} aria-hidden="true" focusable="false" />;
}

function Contor() {
  const valoare = useDinProgres(necititeLa);
  return (
    <p className={s.contor}>
      <span className={[s.contorPunct, b.clipire14].join(" ")} aria-hidden="true" />
      <span className={s.contorEticheta}>{ARBORE.eticheta}</span>
      <span className={s.contorValoare}>{cuPunctDeMii(valoare)}</span>
    </p>
  );
}

export default function Arbore() {
  const total = ARBORE.randuri.length;
  return (
    <SectiuneScena inaltime={100} spatiere="scena" latime={760} nume="arbore" interiorClassName={s.arboreBloc}>
      <Contor />
      <Fereastra
        titlu={<span className={s.caleArbore}>{ARBORE.cale}</span>}
        dreapta={
          <span className={s.exemplu} aria-hidden="true">
            {ETICHETA_EXEMPLU}
          </span>
        }
        punct="patrat-email"
        declaratie={ARBORE.declaratie}
        baraClassName={s.baraArbore}
        nume="arbore"
      >
        <ul className={s.corpArbore}>
          {ARBORE.randuri.map((rand, i) => {
            const radacina = rand.tip === "radacina";
            const stil = { "--s": String(pragArbore(i, total)), "--nivel": String(rand.nivel) } as CSSProperties;
            return (
              <li key={rand.nume} className={[s.randArbore, radacina ? s.randRadacina : ""].filter(Boolean).join(" ")} style={stil}>
                {radacina ? null : (
                  <span className={[s.ramura, rand.tip === "infinit" ? s.ramuraCapat : ""].filter(Boolean).join(" ")} aria-hidden="true" />
                )}
                <span className={[s.iconitaArbore, radacina ? s.iconitaRadacina : ""].filter(Boolean).join(" ")}>
                  <Iconita tip={rand.tip} />
                </span>
                <span
                  className={[
                    s.numeArbore,
                    radacina ? s.numeRadacina : "",
                    rand.tip === "fisier" ? s.numeFisier : "",
                    rand.tip === "infinit" ? s.numeInfinit : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {rand.nume}
                </span>
                <span
                  className={[s.numarArbore, radacina ? s.numarRadacina : "", rand.tip === "infinit" ? s.numarInfinit : ""].filter(Boolean).join(" ")}
                >
                  {rand.numar}
                </span>
              </li>
            );
          })}
        </ul>
      </Fereastra>
    </SectiuneScena>
  );
}
