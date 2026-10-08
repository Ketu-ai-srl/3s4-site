// EROUL paginii de start (felia `erou`, valul S4-2; acasa-erou.md §1). Inlocuieste ciotul feliei
// `fundatie` la aceeasi cale; `src/app/page.tsx` nu se atinge.
//
// DOUA STRATURI, deliberat:
//   - partea de SERVER (fisierul de fata) randeaza tot ce se vede fara JavaScript: coloana de
//     text, butoanele, figura (cele doua inele cu cometele lor, decizia 61), nodurile, centrul,
//     podeaua, umbra si legenda. Cometele si inelele de puls alearga din CSS, deci si fara
//     JavaScript; la miscare redusa raman desenate pe loc;
//   - partea de CLIENT (`ScenaErou`, `PastilaPopover`) o insufleteste dupa montare: oprirea
//     miscarii cand figura iese din fereastra, respiratia centrului, popover-ul primei pastile, lansarea machetei
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
//   - pe scena ingusta nimic nu e acoperit de centru, de pastila lui sau de discuri: centrul se
//     micsoreaza, iar pastila coboara sub etichetele nodurilor de jos (Erou.module.css); forma
//     figurii ramane aceeasi;
//   - popover-ul se inchide si cu Escape si nu iese din fereastra la 390 (§1.6.2, §1.7).

import { Fragment, type ReactNode } from "react";
import { EROU } from "@/content/acasa";
import type { Legatura, NumeIconita } from "@/content/navigatie";
import Buton from "@/components/primitive/Buton";
import Iconita from "@/components/primitive/Iconita";
import Sigla from "@/components/primitive/Sigla";
import Tinta from "@/components/primitive/Tinta";
import {
  INALTIME_SCENA,
  INELE,
  INEL_INTERIOR,
  LATIME_SCENA,
  ORDINE_INELE,
  PARTE_CAP,
  PARTE_URMA,
  RAZA_INEL,
  Y_INELE,
  intarziereNod,
  intarziereUrma,
  procente,
  punctNod,
  secunde,
  type PozitieNod,
} from "./geometrie";
import PastilaPopover from "./PastilaPopover";
import ScenaErou from "./ScenaErou";
import s from "./Erou.module.css";


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

/**
 * Continutul eroului, pe editie. Tipul e structural, declarat aici: constanta RO (`EROU`) il satisface
 * fara nicio editare, iar campurile pe care alta editie nu le are sunt optionale si se randeaza numai
 * cand exista (pe RO exista mereu, deci ramura da acelasi DOM).
 */
export type ContinutErou = {
  pastile: {
    intrebare: { text: string; iconita: NumeIconita };
    /** Pastila-legatura; fara ea, ramane numai pastila cu popover-ul. */
    legatura?: Legatura & { iconita: NumeIconita };
  };
  popover: { randuri: { iconita: NumeIconita; text: string }[]; legatura: Legatura };
  titlu: { primaPropozitie: string; aDouaInainteDeAccent: string; accent: string };
  subtitlu: string;
  /** Butoanele implicite; ignorate cand pagina da `butoane`. */
  butonPrincipal?: Legatura;
  butonSecundar?: Legatura;
  nota?: string;
  bucla: {
    lobStanga: string;
    lobDreapta: string;
    noduri: { pozitie: PozitieNod; eticheta: string; iconita: NumeIconita }[];
    /** Eticheta accesibila a figurii (decizia 61: cea a platformei, pe limba editiei). */
    etichetaFigura?: string;
    /** Eticheta si pastila centrului; fara ele, centrul arata numai sigla. */
    centru?: { eticheta: string; pastila: string };
    legenda?: string;
  };
};

export type ErouProps = {
  continut?: ContinutErou;
  /** Locul butoanelor, cand editia are alt canal decat butoanele implicite. */
  butoane?: ReactNode;
  /** `false`: centrul buclei nu e buton si macheta nu se incarca (`ScenaErou`). Absenta pe RO. */
  lansare?: boolean;
};

// TITLUL FARA CUVANT SINGUR PE UN RAND. Fiecare propozitie sta in blocul ei (`.propozitie`, cu `balance`), iar
// ultimele doua cuvinte ale fiecarei propozitii stau intr-un `<span data-lipit>` care nu se rupe: textul ramane
// cel aprobat, caracter cu caracter (si `textContent`), se schimba numai locul in care randul are voie sa se rupa.
// Masurat pe startul EN la 390 (358 px): `balance` singur lasa "documents." pe randul al doilea; cu legatura iese
// "Ask your" / "company's documents.".
// O propozitie de cel mult trei cuvinte ("Intreaba documentele firmei.") nu se poate rupe fara un rand de un
// cuvant; pe asezarea pe doua coloane (de la 1181 px) ea poate folosi si golul dintre coloane (`data-scurta`,
// Erou.module.css), deci incape pe un rand la 1440. Cu marimea din `.t-h1-erou` ea nu
// incapea sub 390 px si peste ~1520 px, iar `balance` lasa singur primul cuvant; de aceea marimea titlului
// startului are plafon peste 1180 px si urmeaza fereastra sub 390 px (Erou.module.css).

/** Numarul de cuvinte al unui sir (despartite de spatii). */
function cuvinte(t: string): number {
  return t.trim().split(/\s+/).length;
}

/** Sirul, cu ultimele doua cuvinte legate (nu se despart la rupere); sub doua cuvinte, sirul ca atare. */
function Lipit({ text }: { text: string }) {
  const t = text.trimEnd();
  const ultim = t.lastIndexOf(" ");
  const penultim = ultim < 0 ? -1 : t.lastIndexOf(" ", ultim - 1);
  if (ultim < 0) return <>{text}</>;
  return (
    <>
      {t.slice(0, penultim + 1)}
      <span data-lipit="">{t.slice(penultim + 1)}</span>
    </>
  );
}

export default function Erou({ continut = EROU, butoane, lansare }: ErouProps) {
  const e = continut;
  // Figura (decizia 61): doua inele, fiecare cu inelul interior al pistei, urma lunga si capul. Urmele
  // alearga din CSS, cu intarzierea fiecareia scrisa aici; fara animatie (miscare redusa) raman
  // desenate la pornirea turului. Pentru cititoarele de ecran figura e o singura imagine, cu eticheta
  // editiei; lobii si nodurile sunt ascunse lor (aria-hidden), ca sa nu fie citite cuvant cu cuvant.
  const desen = (
    <svg
      key="desen"
      className={s.desen}
      viewBox={"0 0 " + LATIME_SCENA + " " + INALTIME_SCENA}
      focusable="false"
      {...(e.bucla.etichetaFigura ? { role: "img", "aria-label": e.bucla.etichetaFigura } : { "aria-hidden": true })}
    >
      {ORDINE_INELE.map((nume) => {
        const inel = INELE[nume];
        return (
          <g key={nume} data-inel-figura={nume}>
            <circle cx={inel.cx} cy={Y_INELE} r={RAZA_INEL} className={s.pista} />
            <circle cx={inel.cx + INEL_INTERIOR.dx} cy={Y_INELE + INEL_INTERIOR.dy} r={INEL_INTERIOR.raza} className={s.pistaInterioara} />
            <circle
              cx={inel.cx}
              cy={Y_INELE}
              r={RAZA_INEL}
              pathLength={1}
              strokeDasharray={PARTE_URMA + " " + (1 - PARTE_URMA)}
              className={s.urma}
              data-urma=""
              style={{ animationDelay: secunde(intarziereUrma(nume, false)), animationDirection: inel.sens }}
            />
            <circle
              cx={inel.cx}
              cy={Y_INELE}
              r={RAZA_INEL}
              pathLength={1}
              strokeDasharray={PARTE_CAP + " " + (1 - PARTE_CAP)}
              className={s.capUrma}
              data-cometa=""
              style={{ animationDelay: secunde(intarziereUrma(nume, true)), animationDirection: inel.sens }}
            />
          </g>
        );
      })}
    </svg>
  );

  // Elementele trimise componentei client ajung acolo, in modul de dezvoltare, ca referinte lenese;
  // React le verifica cheia abia cand le rezolva, intr-o lista de copii, deci fiecare are cheie
  // (fara ele: avertismentul "Each child in a list should have a unique key", masurat).
  const suprapuneri = (
    <Fragment key="suprapuneri">
      <span key="lob-stanga" className={s.lob} style={procente({ x: INELE.preluare.cx, y: Y_INELE })} aria-hidden="true">
        <span data-eticheta-lob="">
          {e.bucla.lobStanga}
        </span>
      </span>
      <span key="lob-dreapta" className={s.lob} style={procente({ x: INELE.arhiva.cx, y: Y_INELE })} aria-hidden="true">
        <span data-eticheta-lob="">
          {e.bucla.lobDreapta}
        </span>
      </span>
      {e.bucla.noduri.map((n) => (
        <span
          key={n.pozitie}
          className={s.nod}
          data-pozitie={n.pozitie}
          style={procente(punctNod(n.pozitie))}
          aria-hidden="true"
        >
          <span className={s.disc} data-nod={n.pozitie}>
            <Iconita nume={n.iconita} marime={20} contur={1.5} />
            <span className={s.inelNod} data-inel-puls="" style={{ animationDelay: secunde(intarziereNod(n.pozitie)) }} />
          </span>
          <span className={s.eticheta} data-eticheta-nod="">
            {n.eticheta}
          </span>
        </span>
      ))}
    </Fragment>
  );

  const legenda = e.bucla.legenda ? (
    <p key="legenda" className={s.legenda}>
      <Coloana className={s.coloana} />
      <span className={s.legendaText}>{e.bucla.legenda}</span>
      <Coloana className={s.coloana} />
    </p>
  ) : null;

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
              {e.pastile.legatura ? (
                <Tinta legatura={e.pastile.legatura} className={s.pastila}>
                  <Iconita nume={e.pastile.legatura.iconita} marime={14} contur={1.8} className={s.pastilaIconita} />
                  <span>{e.pastile.legatura.text}</span>
                  <Iconita nume="arrow-right" marime={12} contur={2.2} className={s.pastilaSageata} />
                </Tinta>
              ) : null}
            </div>

            <div className={s.titluBloc}>
              <h1 id="erou-titlu" className={"t-h1-erou " + s.titlu}>
                <span className={s.propozitie} {...(cuvinte(e.titlu.primaPropozitie) <= 3 ? { "data-scurta": "" } : {})}>
                  <Lipit text={e.titlu.primaPropozitie} />
                </span>
                <span className={s.propozitie}>
                  {/* Un singur sir: cu `{x}{" "}` React emite un comentariu intre ele, iar numele accesibil al H1-ului
                      lipea ultimul cuvant de accent. */}
                  {e.titlu.aDouaInainteDeAccent + " "}
                  <span className={s.accent}>
                    <Lipit text={e.titlu.accent} />
                  </span>
                </span>
              </h1>
              <p className={s.subtitlu}>{e.subtitlu}</p>
            </div>

            <div className={s.actiuni}>
              <div className={s.butoane}>
                {butoane ?? (
                  <>
                    {e.butonPrincipal ? (
                      <Buton varianta="plin" marime="mare" sageata stralucire legatura={e.butonPrincipal}>
                        {e.butonPrincipal.text}
                      </Buton>
                    ) : null}
                    {e.butonSecundar ? (
                      <Buton varianta="contur" marime="mare" iconitaInainte="circle-play" legatura={e.butonSecundar}>
                        {e.butonSecundar.text}
                      </Buton>
                    ) : null}
                  </>
                )}
              </div>
              {e.nota ? <p className={s.nota}>{e.nota}</p> : null}
            </div>
          </div>

          <div className={s.scenaGazda}>
            <ScenaErou
              desen={desen}
              suprapuneri={suprapuneri}
              legenda={legenda}
              sigla={<Sigla key="sigla" forma="marca" inaltime={44} alt="" />}
              sageata={<Iconita key="sageata" nume="arrow-right" marime={12} contur={2.4} />}
              {...(e.bucla.centru ? { etichetaCentru: e.bucla.centru.eticheta, pastilaCentru: e.bucla.centru.pastila } : {})}
              {...(lansare === false ? { lansare } : {})}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
