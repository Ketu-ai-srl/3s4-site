"use client";

// S1 - drumul hartiei in 7 pasi (functionalitati__semnatura-calificata.md, S1): titlul, paragraful, contorul
// de zile si lista de pasi pe o coloana vertebrala.
//
// CONTORUL creste cu derularea: ZILE_TOTAL x p, sub 1 un intreg rotunjit, de la 1 cu o zecimala. La referinta
// cu punct zecimal (alta scapare de localizare); aici cu virgula, ca in romana. In HTML-ul servit, valoarea
// finala.
//
// LISTA IN TREPTE (sablon §4.2), in CSS din `--p`: la referinta pasul i are opacitate max(.15, min(1,
// 4 (p - 0,12 i))), deci ultimul e intreg abia la p ~0,97; aici aceeasi scara, stransa (pas 0,045, panta 6),
// intreaga la p ~0,44 - pasii poarta text de citit (regula din README-ul cadrului). Deriva spre dreapta
// ramane a referintei: max(0, 64 (p - 0,25 - 0,12 i)) px.

import { Clock, Mail, PenLine, Printer, Reply, RotateCcw, ScanLine } from "lucide-react";
import type { CSSProperties } from "react";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import { DRUM, zileLa, type IconitaPas } from "@/content/functionalitati/semnatura-calificata";
import s from "./semnatura.module.css";

function Iconita({ fel }: { fel: IconitaPas }) {
  const p = { width: 18, height: 18, strokeWidth: 1.75, "aria-hidden": true, focusable: "false" } as const;
  if (fel === "imprimanta") return <Printer {...p} />;
  if (fel === "stilou") return <PenLine {...p} />;
  if (fel === "scaner") return <ScanLine {...p} />;
  if (fel === "plic") return <Mail {...p} />;
  if (fel === "ceas") return <Clock {...p} />;
  if (fel === "intoarcere") return <RotateCcw {...p} />;
  return <Reply {...p} />;
}

function Contor() {
  const zile = useDinProgres(zileLa);
  return (
    <p className={s.contorZile}>
      <span className={s.contorEticheta}>{DRUM.contorEticheta}</span>
      <span className={s.contorValoare}>{zile}</span>
      <span className={s.contorUnitate}>{DRUM.unitate}</span>
    </p>
  );
}

export default function Drum() {
  const ultim = DRUM.pasi.length - 1;
  return (
    <SectiuneScena inaltime={100} latime={720} nume="drum">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{DRUM.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{DRUM.paragraf}</p>
      <Contor />
      <figure className={s.drum} data-macheta="drumul-hartiei">
        <ol className={s.pasi}>
          {DRUM.pasi.map((pas, i) => (
            <li key={pas.eticheta} className={s.pasDrum} style={{ "--i": String(i) } as CSSProperties}>
              <span className={s.numarDrum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={[s.cutieDrum, i === ultim ? s.cutieRosie : ""].filter(Boolean).join(" ")}>
                <Iconita fel={pas.iconita} />
              </span>
              <span className={s.etichetaDrum}>{pas.eticheta}</span>
              <span className={[s.cost, i === ultim ? s.costRosu : ""].filter(Boolean).join(" ")}>{pas.cost}</span>
            </li>
          ))}
        </ol>
        <figcaption className="doar-cititor">{DRUM.declaratie}</figcaption>
      </figure>
    </SectiuneScena>
  );
}
