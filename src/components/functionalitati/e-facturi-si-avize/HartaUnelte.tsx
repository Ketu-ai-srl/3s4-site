"use client";

// S1 - harta celor cinci locuri prin care trece azi o factura (functionalitati__e-facturi-si-avize.md, S1):
// titlul, paragraful, harta 880 x 462 (`aspect-ratio 800 / 420`, 600 / 460 la 390) si pastila de rezumat.
//
// HARTA: un SVG pe `viewBox 0 0 800 420` cu legaturile, sub 5 noduri HTML centrate pe punctele lor
// (procente masurate, aceleasi la 390). Legaturile (fisa: 4 principale .15 cu liniuta 5 6, 2 laterale .08
// cu 3 6, o diagonala lunga .05 cu 2 7, toate 1,25) "curg" cu `stroke-dashoffset 0 -> -22` in 14 s; un
// pachet circula pe traseul nodurilor in 11 s, cu opriri de ~0,44 s la fiecare nod, si isi schimba culoarea
// din ardezie in rosu la primele opriri. Curbele sunt desenate de noi pe capetele si boltirea masurate.
//
// MISCAREA: curgerea e CSS (o opreste regula globala de miscare redusa); pachetul e SMIL, pe care regula CSS
// NU il opreste, deci animatia lui se pune in pagina numai cu miscare permisa. In HTML-ul servit si la
// miscare redusa pachetul sta pe loc, pe arcul de sus. Nicio schimbare legata de derulare (fisa S1).
//
// ABATEREA LA 390: la referinta etichetele de pe legaturi sunt text SVG si ies de ~4 px pe ecran; aici sunt
// text HTML asezat in procente peste desen (acelasi loc), cu marime proprie; la 390 se ascund, fiindca
// nodurile de 96 px le acopera locul. Desenul
// se intinde pe cutie (`preserveAspectRatio none`), ca legaturile sa ajunga in noduri si la 600 / 460.

import { Archive, FileText, HardDrive, Mail, Table } from "lucide-react";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { HARTA, type IconitaUnealta } from "@/content/functionalitati/e-facturi-si-avize";
import s from "./efacturi.module.css";

/** Centrele nodurilor, in unitati ale desenului (procentele masurate x 800 / 420). */
export const CENTRE_NODURI: ReadonlyArray<readonly [number, number]> = [
  [130, 90],
  [660, 100],
  [400, 225],
  [140, 336],
  [660, 336],
];

/** Pozitiile etichetelor de pe legaturi (fisa S1, unitati ale desenului). */
const POZITII_ETICHETE: ReadonlyArray<readonly [number, number]> = [
  [395, 42],
  [555, 180],
  [245, 290],
  [555, 305],
];

/** Traseul pachetului: stanga-sus -> dreapta-sus -> centru -> stanga-jos -> dreapta-jos -> inapoi. */
const TRASEU = "M130 90 L660 100 L400 225 L140 336 L660 336 L130 90";
/** Opririle: se misca 0,16 din ciclu, sta 0,04 (fisa S1). Punctele urmeaza lungimile segmentelor. */
const TIMPI = "0;0.16;0.2;0.36;0.4;0.56;0.6;0.76;0.8;0.96;1";
const PUNCTE = "0;0.2408;0.2408;0.3717;0.3717;0.5003;0.5003;0.7366;0.7366;1;1";

/** Pozitia unui punct al desenului in procente din cutia hartii (aceleasi la 1440 si la 390). */
function procente([x, y]: readonly [number, number]) {
  return { left: ((x / 800) * 100).toFixed(3) + "%", top: ((y / 420) * 100).toFixed(3) + "%" };
}

function Iconita({ fel }: { fel: IconitaUnealta }) {
  const p = { width: 20, height: 20, strokeWidth: 1.75, "aria-hidden": true, focusable: "false" } as const;
  if (fel === "tabel") return <Table {...p} />;
  if (fel === "fisier") return <FileText {...p} />;
  if (fel === "arhiva") return <Archive {...p} />;
  if (fel === "plic") return <Mail {...p} />;
  return <HardDrive {...p} />;
}

function Pachet({ miscare }: { miscare: boolean }) {
  return (
    <g className={s.pachet} transform={miscare ? undefined : "translate(387 40)"}>
      <g transform="translate(-8 -5.5)">
        <rect width="16" height="11" rx="2" fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
        <line x1="6" y1="4" x2="13" y2="4" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
        <line x1="6" y1="7" x2="11" y2="7" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
        <rect x="2" y="4" width="3" height="3" rx="1" fill="#94a3b8">
          {miscare ? <animate attributeName="fill" dur="11s" repeatCount="indefinite" values="#94a3b8;#f87171;#f87171;#f87171;#94a3b8;#94a3b8" keyTimes="0;0.16;0.36;0.56;0.6;1" /> : null}
        </rect>
      </g>
      {miscare ? <animateMotion dur="11s" repeatCount="indefinite" path={TRASEU} keyTimes={TIMPI} keyPoints={PUNCTE} calcMode="linear" /> : null}
    </g>
  );
}

function Desen() {
  const miscare = useMiscarePermisa();
  return (
    <svg className={s.desenHarta} viewBox="0 0 800 420" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g fill="none" strokeWidth="1.25" strokeLinecap="round">
        <path className={s.curge} d="M130 90 Q395 -8 660 100" stroke="rgba(255,255,255,0.15)" strokeDasharray="5 6" />
        <path className={s.curge} d="M660 100 Q560 150 400 225" stroke="rgba(255,255,255,0.15)" strokeDasharray="5 6" />
        <path className={s.curge} d="M140 336 Q250 300 400 225" stroke="rgba(255,255,255,0.15)" strokeDasharray="5 6" />
        <path className={s.curge} d="M400 225 Q540 260 660 336" stroke="rgba(255,255,255,0.15)" strokeDasharray="5 6" />
        <path className={s.curge} d="M120 110 Q138 220 128 325" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 6" />
        <path className={s.curge} d="M685 118 Q660 220 682 325" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 6" />
        <path className={s.curge} d="M130 90 Q380 190 660 336" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 7" />
      </g>
      <Pachet miscare={miscare} />
    </svg>
  );
}

export default function HartaUnelte() {
  return (
    <SectiuneScena inaltime={100} latime={920} nume="harta">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{HARTA.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{HARTA.paragraf}</p>
      <figure className={s.harta} data-macheta="harta-unelte">
        <Desen />
        {HARTA.legaturi.map((t, i) => (
          <span key={t} className={s.textLegatura} style={procente(POZITII_ETICHETE[i])} aria-hidden="true">
            {t}
          </span>
        ))}
        <ul className={s.noduri}>
          {HARTA.noduri.map((n, i) => (
            <li
              key={n.eticheta}
              className={s.nod}
              style={procente(CENTRE_NODURI[i])}
            >
              <span className={s.cutieNod}>
                <Iconita fel={n.iconita} />
              </span>
              <span className={s.etichetaNod}>{n.eticheta}</span>
              <span className={s.rolNod}>{n.rol}</span>
            </li>
          ))}
        </ul>
        <figcaption className="doar-cititor">{HARTA.declaratie}</figcaption>
      </figure>
      <p className={s.rezumat}>
        <span className={s.punctRezumat} aria-hidden="true" />
        {HARTA.rezumat}
      </p>
    </SectiuneScena>
  );
}
