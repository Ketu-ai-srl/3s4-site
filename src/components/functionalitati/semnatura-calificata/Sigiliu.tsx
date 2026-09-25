"use client";

// S4 - ce poarta o semnatura calificata (functionalitati__semnatura-calificata.md, S4): titlul, paragraful,
// cardul-sigiliu 620 x ~332 si nota legala.
//
// CARDUL arata campurile unei semnaturi electronice calificate pe un document-EXEMPLU: semnatarul, numarul
// de serie, amprenta SHA-256, emitentul, marca temporala si randul "In 3S", care spune ca semnarea
// calificata e o integrare in curs (decizia D4c). Bara ferestrei poarta eticheta vizibila "exemplu". La
// referinta randul de jos promite valabilitate juridica si o durata de pastrare, cu un emitent real numit;
// aici nimic din ele (fisa S4, "Atentie D4").
//
// AMPRENTA SE SCRIE CU DERULAREA, nu in timp (fisa S4): caractere = floor(64 (p - 0,15) / 0,45), intre 0 si
// 64, plina la p ~0,6; cursorul "_" clipeste cat se scrie. In HTML-ul servit si la miscare redusa, intreaga.
// Locul ei (doua randuri) e rezervat de la inceput, deci blocul nu creste cu 17 px la final ca la referinta.
//
// MISCAREA CARDULUI: formula de solutie (sablon §4.5), intreaga la p ~0,44 (poarta text).

import { BadgeCheck, TriangleAlert } from "lucide-react";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import Fereastra from "@/components/cinema/Fereastra";
import TextScris from "@/components/cinema/TextScris";
import { AMPRENTA, caractereAmprenta, NOTA_LEGALA, SIGILIU } from "@/content/functionalitati/semnatura-calificata";
import s from "./semnatura.module.css";

function Amprenta() {
  const miscare = useMiscarePermisa();
  const scrise = useDinProgres(caractereAmprenta);
  const stare = !miscare ? "static" : scrise >= AMPRENTA.length ? "gata" : "scrie";
  return <TextScris ca="span" text={AMPRENTA} stare={stare} scrise={scrise} className={s.amprenta} />;
}

export default function Sigiliu() {
  const g = SIGILIU;
  const r = g.randuri;
  return (
    <SectiuneScena inaltime={100} spatiere="scena" latime={720} nume="sigiliu">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{g.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{g.paragraf}</p>
      <div className={s.intraCard}>
        <Fereastra
          titlu={g.fisier}
          dreapta={<span className={s.exemplu}>{g.stareBara}</span>}
          declaratie={g.declaratie}
          className={s.cardSigiliu}
          nume="sigiliu"
        >
          <div className={s.corpSigiliu}>
            <div className={s.semnatar}>
              <span className={s.avatar} aria-hidden="true">
                {g.initiala}
              </span>
              <span className={s.numeSemnatar}>
                <span className={s.nume}>{g.semnatar}</span>
                <span className={s.functie}>{g.functie}</span>
              </span>
              <span className={s.emblema} aria-hidden="true">
                <BadgeCheck width={30} height={30} strokeWidth={1.5} />
              </span>
            </div>
            <dl className={s.metaSigiliu}>
              <div className={s.randSigiliu}>
                <dt className={s.cheieSigiliu}>{r.serie.cheie}</dt>
                <dd className={s.valoareMono}>{r.serie.valoare}</dd>
              </div>
              <div className={s.randSigiliu}>
                <dt className={s.cheieSigiliu}>{r.amprenta.cheie}</dt>
                <dd className={s.cutieAmprenta}>
                  <Amprenta />
                </dd>
              </div>
              <div className={s.randSigiliu}>
                <dt className={s.cheieSigiliu}>{r.emitent.cheie}</dt>
                <dd className={s.valoareText}>{r.emitent.valoare}</dd>
              </div>
              <div className={s.randSigiliu}>
                <dt className={s.cheieSigiliu}>{r.marca.cheie}</dt>
                <dd className={s.valoareMono}>{r.marca.valoare}</dd>
              </div>
              <div className={[s.randSigiliu, s.randStare].join(" ")}>
                <dt className={s.cheieSigiliu}>{r.stare.cheie}</dt>
                <dd className={s.valoareInCurs}>
                  <TriangleAlert width={13} height={13} strokeWidth={2.2} aria-hidden="true" focusable="false" />
                  {r.stare.valoare}
                </dd>
              </div>
            </dl>
          </div>
        </Fereastra>
      </div>
      <p className={s.notaLegala}>{NOTA_LEGALA.text}</p>
    </SectiuneScena>
  );
}
