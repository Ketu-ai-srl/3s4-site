"use client";

// S5 - lumina (functionalitati__cautare-ai.md, S5), VEDEREA: nu importa niciun continut; intrebarea si textele vin
// de la invelitoarea editiei (`Lumina` pe RO, `LuminaEn` pe 3s.md). Bara de cautare creste odata cu derularea
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
//
// LIMBA INTREBARII (`limbaIntrebare`): cand intrebarea e in alta limba decat pagina (pe 3s.md, intrebarea e in
// romana, singura limba confirmata pentru intrebari), elementul care o poarta primeste `lang`, ca cititorul de ecran
// s-o pronunte corect. Fara proprietate (RO) elementul e cel de dinainte, fara atribut.

import { useMemo, type CSSProperties, type ComponentProps, type ElementType } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import { caractereDupaProgres } from "@/components/cinema/progres";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import TextScris from "@/components/cinema/TextScris";
import s from "./cautare.module.css";

/** Textele luminii, pe editie; tip structural (constantele RO il satisfac prin invelitoare). */
export type ContinutLumina = {
  /** Intrebarea scrisa in bara: aceeasi cu cea din terminalul eroului. */
  intrebare: string;
  /** Eticheta accesibila a barei (figcaption). */
  declaratie: string;
  /** Indicatia de sub bara. */
  indicatie: string;
};

/** Scrierea legata de derulare (fisa S5): incepe la p 0,18 si dureaza 0,32 din sectiune. */
export const SCRIERE_LUMINA = { start: 0.18, durata: 0.32 } as const;

function Tasta() {
  return (
    <span className={s.tasta} aria-hidden="true">
      <CornerDownLeft width={11} height={11} strokeWidth={2} />
    </span>
  );
}

/** Elementul textului din bara: `span`, sau `span` cu `lang` cand intrebarea are alta limba decat pagina. */
function useElementText(limba: string | undefined): ElementType {
  return useMemo(() => {
    if (limba === undefined) return "span";
    function SpanCuLimba(p: ComponentProps<"span">) {
      return <span {...p} lang={limba} />;
    }
    return SpanCuLimba;
  }, [limba]);
}

function BaraCautare({ continut, limbaIntrebare }: { continut: ContinutLumina; limbaIntrebare?: string }) {
  const text = continut.intrebare;
  const elementText = useElementText(limbaIntrebare);
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
            <span className={s.textBara} lang={limbaIntrebare}>
              {text}
            </span>
            <Tasta />
          </div>
        ) : null}
        <figure className={s.bara} data-macheta="bara-cautare">
          <Search className={s.lupaBara} width={20} height={20} strokeWidth={2} aria-hidden="true" />
          <TextScris ca={elementText} text={text} stare={stare} scrise={scrise} rezervaLoc={false} className={s.textBara} />
          <Tasta />
          <figcaption className="doar-cititor">{continut.declaratie}</figcaption>
        </figure>
      </div>
      <p className={s.indicatie} style={{ "--scris-gata": gata ? "1" : "0" } as CSSProperties}>
        {continut.indicatie}
      </p>
    </>
  );
}

export default function LuminaVedere({ continut, limbaIntrebare }: { continut: ContinutLumina; limbaIntrebare?: string }) {
  return (
    <SectiuneScena inaltime={75} latime={720} nume="lumina" interiorClassName={s.lumina}>
      <BaraCautare continut={continut} {...(limbaIntrebare === undefined ? {} : { limbaIntrebare })} />
    </SectiuneScena>
  );
}
