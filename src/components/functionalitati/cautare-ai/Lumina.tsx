"use client";

// S5 - lumina (functionalitati__cautare-ai.md, S5): bara de cautare creste odata cu derularea
// (opacitate min(1, 1,8p), scara 0,85 + 0,15p), iar intrebarea din erou se scrie din nou in ea, legata de
// derulare: caractere = floor((p - 0,18) / 0,32 x lungime), deci incepe la p 0,18 si e completa la 0,5.
// Cand s-a terminat, cursorul dispare si indicatia de sub bara apare.
//
// INALTIMEA BAREI urmeaza textul scris, ca la referinta: un rand cat intrebarea incape pe unul, apoi doua
// (trei la 390). Latimea e fixa (620, 350 la 390). Locul final se rezerva SUB bara, nu in ea: o copie
// invizibila a barei plina sta in aceeasi celula de grila, deci indicatia de dedesubt nu sare cand
// intrebarea trece pe randul urmator. Copia exista numai cu miscare permisa (dupa montare): in HTML-ul
// servit si la miscare redusa bara e deja plina (p = 1) si isi tine singura locul, iar textul nu apare
// de doua ori in pagina.
//
// Textul intreg sta in pagina de la inceput (stratul de baza al `TextScris`, ascuns vizual cat se scrie),
// deci robotii si cititorii il au intreg.

import type { CSSProperties } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import { caractereDupaProgres } from "@/components/cinema/progres";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import TextScris from "@/components/cinema/TextScris";
import { EROU_CAUTARE, LUMINA } from "@/content/functionalitati/cautare-ai";
import s from "./cautare.module.css";

/** Scrierea legata de derulare (fisa S5): incepe la p 0,18 si dureaza 0,32 din sectiune. */
export const SCRIERE_LUMINA = { start: 0.18, durata: 0.32 } as const;

function Tasta() {
  return (
    <span className={s.tasta} aria-hidden="true">
      <CornerDownLeft width={11} height={11} strokeWidth={2} />
    </span>
  );
}

function BaraCautare() {
  const text = EROU_CAUTARE.intrebare;
  const miscare = useMiscarePermisa();
  const scrise = useDinProgres((p) => caractereDupaProgres(p, text.length, SCRIERE_LUMINA.start, SCRIERE_LUMINA.durata));
  const gata = !miscare || scrise >= text.length;
  const stare = !miscare ? "static" : gata ? "gata" : "scrie";
  return (
    <>
      <div className={s.locBara}>
        {miscare ? (
          <div className={[s.bara, s.baraFantoma].join(" ")} aria-hidden="true" data-fantoma="">
            <Search className={s.lupaBara} width={20} height={20} strokeWidth={2} />
            <span className={s.textBara}>{text}</span>
            <Tasta />
          </div>
        ) : null}
        <figure className={s.bara} data-macheta="bara-cautare">
          <Search className={s.lupaBara} width={20} height={20} strokeWidth={2} aria-hidden="true" />
          <TextScris ca="span" text={text} stare={stare} scrise={scrise} rezervaLoc={false} className={s.textBara} />
          <Tasta />
          <figcaption className="doar-cititor">{LUMINA.declaratie}</figcaption>
        </figure>
      </div>
      <p className={s.indicatie} style={{ "--scris-gata": gata ? "1" : "0" } as CSSProperties}>
        {LUMINA.indicatie}
      </p>
    </>
  );
}

export default function Lumina() {
  return (
    <SectiuneScena inaltime={75} latime={720} nume="lumina" interiorClassName={s.lumina}>
      <BaraCautare />
    </SectiuneScena>
  );
}
