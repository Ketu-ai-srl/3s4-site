// EROUL paginii de start (felia `erou`, valul S4-2; acasa-erou.md §1). Inlocuieste ciotul feliei
// `fundatie` la aceeasi cale; `src/app/page.tsx` nu se atinge.
//
// DOUA STRATURI, deliberat:
//   - partea de SERVER (fisierul de fata) randeaza tot ce se vede fara JavaScript: coloana de
//     text, butoanele, bucla desenata cu cometa oprita la 30% din drum, nodurile, centrul,
//     podeaua, umbra si legenda. Este starea statica a ciotului, cu aceleasi dimensiuni, si e si
//     starea de miscare redusa (§1.5);
//   - partea de CLIENT (`ScenaErou`, `PastilaPopover`) o insufleteste dupa montare: punctele si
//     cometa pe drum, pulsurile, respiratia centrului, popover-ul primei pastile, lansarea machetei
//     (descarcata separat, dupa prima pictura) si foile zburatoare. Iconitele si sigla se randeaza
//     AICI si ajung la client ca elemente gata facute, ca pachetul paginii sa nu duca harta de
//     iconite.
//
// ABATERI DE LA REFERINTA, deliberate (COMPONENTE.md §5; docs/design/DIRECTIA.md):
//   - pastilele si butoanele intra din CSS, in trepte, si raman vizibile fara JavaScript (la
//     referinta coloana ramane la opacitate 0); blocul titlului nu are intrare, fiindca e
//     elementul LCP (plan §8.4); la miscare redusa nu intra nimic;
//   - fara JavaScript prima pastila si centrul buclei sunt elemente simple, nu butoane: un buton care
//     nu face nimic ar fi o promisiune falsa. Dupa montare devin butoane. Panoul popover-ului e in
//     HTML oricum, ascuns, ca afirmatiile lui sa se citeasca si fara JavaScript;
//   - pastilele au minimum 11 px sub 768 (la referinta 9,6), etichetele lobilor sunt `gri-meta`
//     (4,83:1), nu #b6bdc9 (1,89:1), fiindca sunt text;
//   - pe scena ingusta nimic nu mai e acoperit de centru, de pastila lui sau de discuri (defect al
//     referintei la 390, §1.7): etichetele nodurilor trec langa disc, pastila coboara sub discurile
//     de jos, etichetele lobilor se muta in partea libera a lobului; forma buclei ramane aceeasi;
//   - popover-ul se inchide si cu Escape si nu iese din fereastra la 390 (§1.6.2, §1.7).

import { Fragment } from "react";
import { EROU } from "@/content/acasa";
import Buton from "@/components/primitive/Buton";
import Iconita from "@/components/primitive/Iconita";
import Sigla from "@/components/primitive/Sigla";
import Tinta from "@/components/primitive/Tinta";
import { CAP_COMETA_STATIC, DRUM_BUCLA, FRACTII_NODURI, INALTIME_SCENA, LATIME_SCENA, liniutaCometa, punctLaFractie } from "./geometrie";
import PastilaPopover from "./PastilaPopover";
import ScenaErou from "./ScenaErou";
import s from "./Erou.module.css";

/** Pozitia unui nod pe scena, in procente, din fractia lui pe drum (§1.4.5). */
function pozitieNod(fractie: number): { left: string; top: string } {
  const p = punctLaFractie(fractie);
  return {
    left: ((p.x / LATIME_SCENA) * 100).toFixed(2) + "%",
    top: ((p.y / INALTIME_SCENA) * 100).toFixed(2) + "%",
  };
}

/** Coloana din legenda: desen propriu (capitel, fus cu trei caneluri, baza in doua trepte). */
function Coloana({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 520" aria-hidden="true" focusable="false">
      <g fill="var(--color-podea)" stroke="var(--color-coloana-contur)" strokeWidth="4" strokeLinejoin="round">
        <rect x="6" y="8" width="108" height="26" rx="3" />
        <path d="M18 34 H102 L92 58 H28 Z" />
        <path d="M30 58 H90 L86 452 H34 Z" />
        <rect x="18" y="452" width="84" height="24" rx="2" />
        <rect x="8" y="476" width="104" height="34" rx="3" />
      </g>
      <g fill="none" stroke="var(--color-coloana-canelura)" strokeWidth="4" strokeLinecap="round">
        <path d="M46 72 L44 440" />
        <path d="M60 72 V440" />
        <path d="M74 72 L76 440" />
      </g>
      <path d="M80 60 L86 60 L83 450 L78 450 Z" fill="var(--color-coloana-canelura)" />
    </svg>
  );
}

export default function Erou() {
  const e = EROU;
  const cometa = liniutaCometa(CAP_COMETA_STATIC);

  const desen = (
    <svg key="desen" className={s.desen} viewBox={"0 0 " + LATIME_SCENA + " " + INALTIME_SCENA} focusable="false" aria-hidden="true">
      <path d={DRUM_BUCLA} className={s.fantoma} transform="translate(320 226) scale(0.99) translate(-320 -210)" />
      <path d={DRUM_BUCLA} className={s.halou} />
      <path d={DRUM_BUCLA} className={s.baza} />
      <path
        d={DRUM_BUCLA}
        className={s.cometa}
        data-cometa=""
        strokeDasharray={cometa.dasharray}
        strokeDashoffset={cometa.dashoffset.toFixed(2)}
      />
    </svg>
  );

  // Elementele trimise componentei client ajung acolo, in modul de dezvoltare, ca referinte lenese;
  // React le verifica cheia abia cand le rezolva, intr-o lista de copii, deci fiecare are cheie
  // (fara ele: avertismentul "Each child in a list should have a unique key", masurat).
  const suprapuneri = (
    <Fragment key="suprapuneri">
      <span key="lob-stanga" className={s.lob + " " + s.lobStanga} aria-hidden="true">
        <span className={s.lobText} data-eticheta-lob="">
          {e.bucla.lobStanga}
        </span>
      </span>
      <span key="lob-dreapta" className={s.lob + " " + s.lobDreapta} aria-hidden="true">
        <span className={s.lobText} data-eticheta-lob="">
          {e.bucla.lobDreapta}
        </span>
      </span>
      {e.bucla.noduri.map((n) => (
        <span
          key={n.pozitie}
          className={s.nod}
          data-pozitie={n.pozitie}
          style={pozitieNod(FRACTII_NODURI[n.pozitie])}
          aria-hidden="true"
        >
          <span className={s.disc} data-nod={n.pozitie}>
            <Iconita nume={n.iconita} marime={16} contur={1.8} />
          </span>
          <span className={s.eticheta} data-eticheta-nod="">
            {n.eticheta}
          </span>
        </span>
      ))}
    </Fragment>
  );

  const legenda = (
    <p key="legenda" className={s.legenda}>
      <Coloana className={s.coloana} />
      <span className={s.legendaText}>{e.bucla.legenda}</span>
      <Coloana className={s.coloana} />
    </p>
  );

  const popoverRanduri = e.popover.randuri.map((r) => ({
    text: r.text,
    iconita: <Iconita key="iconita" nume={r.iconita} marime={15} contur={1.8} className={s.popoverIconita} />,
  }));

  return (
    <section className={s.erou} aria-labelledby="erou-titlu" data-ciot="erou">
      <div className={s.fundal} aria-hidden="true" />
      <div className={"container-erou " + s.container}>
        <div className={s.grila}>
          <div className={s.stanga}>
            <div className={s.pastile}>
              <PastilaPopover
                text={e.pastile.intrebare.text}
                iconita={
                  <Iconita key="iconita" nume={e.pastile.intrebare.iconita} marime={14} contur={2.5} className={s.pastilaIconita} />
                }
                randuri={popoverRanduri}
                legatura={
                  <Tinta key="legatura" legatura={e.popover.legatura} className={s.popoverLegatura}>
                    <span>{e.popover.legatura.text}</span>
                    <Iconita nume="arrow-right" marime={13} contur={2} />
                  </Tinta>
                }
              />
              <Tinta legatura={e.pastile.legatura} className={s.pastila}>
                <Iconita nume={e.pastile.legatura.iconita} marime={14} contur={1.8} className={s.pastilaIconita} />
                <span>{e.pastile.legatura.text}</span>
                <Iconita nume="arrow-right" marime={12} contur={2.2} className={s.pastilaSageata} />
              </Tinta>
            </div>

            <div className={s.titluBloc}>
              <h1 id="erou-titlu" className={"t-h1-erou " + s.titlu}>
                {e.titlu.primaPropozitie}
                <br />
                {e.titlu.aDouaInainteDeAccent} <span className={s.accent}>{e.titlu.accent}</span>
              </h1>
              <p className={s.subtitlu}>{e.subtitlu}</p>
            </div>

            <div className={s.actiuni}>
              <div className={s.butoane}>
                <Buton varianta="plin" marime="mare" sageata stralucire legatura={e.butonPrincipal}>
                  {e.butonPrincipal.text}
                </Buton>
                <Buton varianta="contur" marime="mare" iconitaInainte="circle-play" legatura={e.butonSecundar}>
                  {e.butonSecundar.text}
                </Buton>
              </div>
              <p className={s.nota}>{e.nota}</p>
            </div>
          </div>

          <div className={s.scenaGazda}>
            <ScenaErou
              desen={desen}
              suprapuneri={suprapuneri}
              legenda={legenda}
              sigla={<Sigla key="sigla" forma="marca" inaltime={40} alt="" />}
              sageata={<Iconita key="sageata" nume="arrow-right" marime={12} contur={2.4} />}
              etichetaCentru={e.bucla.centru.eticheta}
              pastilaCentru={e.bucla.centru.pastila}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
