// /e-facturare (e-facturare.md): sablonul "subiect lung". Erou pe doua coloane pe tot containerul,
// apoi blocuri de 880 cu cap, doua grile de 3 carduri pe 1100, rigla animata, FAQ si CTA-ul final.
//
// Datele despre piete, jurnal si calendar vin din `src/content/efacturare/`, fiecare valoare cu
// sursa ei oficiala alaturi; textele, din `pagina.ts`.

import { ArrowRight, Archive, Download, ExternalLink, FileCode, Timer } from "lucide-react";
import type { ReactNode } from "react";
import MachetaDrumFactura from "@/components/efacturare/MachetaDrumFactura";
import Rigla11Ani from "@/components/efacturare/Rigla11Ani";
import s from "@/components/efacturare/efacturare.module.css";
import Acordeon from "@/components/primitive/Acordeon";
import Buton from "@/components/primitive/Buton";
import CapBloc from "@/components/primitive/CapBloc";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import FirPagina from "@/components/primitive/FirPagina";
import LegaturaInText from "@/components/primitive/LegaturaInText";
import JsonLd from "@/components/seo/JsonLd";
import { iduri } from "@/components/seo/date-structurate";
import { metadataPagina } from "@/components/seo/metadata";
import {
  CALE_CALENDAR,
  CALE_EFACTURARE,
  CASA,
  EMITEREA,
  EROU_EFACTURARE,
  FIR_EFACTURARE,
  FRAZA_ANCORA,
  INTREBARI_EFACTURARE,
  JURNAL_CAP,
  MANDATE,
  META_EFACTURARE,
  RIGLA,
  STANDARDE,
  TABEL,
  TREI_REGULI,
} from "@/content/efacturare/pagina";
import { ANCORA_EVIDENTIATA, JURNAL, MODIFICARI_RECENTE, PIETE } from "@/content/efacturare/piete";
import { DATA_VERIFICARII, SURSE, type CheieSursa } from "@/content/efacturare/surse";
import { adresaSite } from "@/lib/site";

export const metadata = metadataPagina({
  titlu: META_EFACTURARE.titlu,
  descriere: META_EFACTURARE.descriere,
  cale: CALE_EFACTURARE,
});

const ICONITE: Record<string, ReactNode> = {
  timer: <Timer width={20} height={20} strokeWidth={2} aria-hidden="true" />,
  "file-code": <FileCode width={20} height={20} strokeWidth={2} aria-hidden="true" />,
  archive: <Archive width={20} height={20} strokeWidth={2} aria-hidden="true" />,
};

function dataInCuvinte(iso: string): string {
  const [an, luna, zi] = iso.split("-").map(Number);
  const luni = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
  return zi + " " + luni[luna - 1] + " " + an;
}

/** Legatura spre documentul oficial, cu sageata externa; se deschide in aceeasi fila. */
function LegaturaSursa({ cheie, text, className }: { cheie: CheieSursa; text: string; className?: string }) {
  const sursa = SURSE[cheie];
  return (
    <a
      href={sursa.url}
      className={className ?? s.sursaLegatura}
      rel="noopener noreferrer external"
      title={sursa.autoritate + ": " + sursa.titlu}
    >
      <span>{text}</span>
      <ExternalLink width={12} height={12} strokeWidth={2} aria-hidden="true" />
    </a>
  );
}

function grafIntrebari() {
  const baza = adresaSite();
  return {
    "@context": "https://schema.org" as const,
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": baza + CALE_EFACTURARE + "#intrebari",
        url: baza + CALE_EFACTURARE,
        name: INTREBARI_EFACTURARE.titlu,
        inLanguage: "ro-RO",
        isPartOf: { "@id": iduri(baza).site },
        mainEntity: INTREBARI_EFACTURARE.intrebari.map((i) => ({
          "@type": "Question",
          name: i.intrebare,
          acceptedAnswer: { "@type": "Answer", text: i.raspuns },
        })),
      },
    ],
  };
}

export default function EFacturare() {
  const e = EROU_EFACTURARE;
  return (
    <main>
      {/* §1 Erou pe doua coloane */}
      <section className={s.erou} aria-labelledby="efacturare-titlu">
        <div className="container-site">
          <div className={s.erouFir}>
            <FirPagina niveluri={FIR_EFACTURARE.map((n) => ({ text: n.text, cale: n.cale }))} />
          </div>
          <div className={s.erouGrila}>
            <div>
              <h1 id="efacturare-titlu" className={"t-h1-interior " + s.erouTitlu}>
                {e.titlu}
              </h1>
              <p className={s.erouSubtitlu}>{e.subtitlu}</p>
              <div className={s.erouButoane}>
                <Buton varianta="plin" marime="plat" sageata legatura={e.butonPlin}>
                  {e.butonPlin.text}
                </Buton>
                <Buton varianta="fantoma" marime="plat" legatura={e.butonContur}>
                  {e.butonContur.text}
                </Buton>
              </div>
            </div>
            <MachetaDrumFactura />
          </div>
        </div>
      </section>

      {/* §2 Fraza-ancora */}
      <section className={s.fraza}>
        <div className="container-site">
          <p className={"t-fraza-ancora " + s.frazaText}>{FRAZA_ANCORA}</p>
        </div>
      </section>

      {/* §3 Mandatele, in doua batai */}
      <section className={s.bloc} aria-labelledby="efacturare-mandate">
        <div className="container-site">
          <div className={[s.coloana, s.cutie].join(" ")}>
            <header className={s.cutieCap}>
              <h2 id="efacturare-mandate" className={"t-h2-bloc " + s.cutieTitlu}>
                {MANDATE.titlu}
              </h2>
              <p className={s.cutieText}>{MANDATE.text}</p>
            </header>
            <ul className={s.batai}>
              {MANDATE.batai.map((b) => (
                <li key={b.slice(0, 24)} className={s.bataie}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* §4 Tabelul pietelor */}
      <section className={s.bloc} aria-labelledby="efacturare-piete">
        <div className="container-site">
          <div className={s.coloana}>
            <CapBloc id="efacturare-piete" titlu={TABEL.titlu} text={TABEL.text} />
            <div className={s.tabel} role="table" aria-label={TABEL.titlu}>
              <div className={[s.tabelRand, s.tabelCap].join(" ")} role="row">
                {TABEL.capete.map((c, i) => (
                  <span key={c} role="columnheader" className={i === 3 ? s.tabelCapFormat : undefined}>
                    {c}
                  </span>
                ))}
              </div>
              {PIETE.map((p) => (
                <div key={p.ancora} id={p.ancora} className={s.tabelRand} role="row">
                  <div role="rowheader">
                    <p className={s.tabelTara}>
                      {p.ancora === ANCORA_EVIDENTIATA ? (
                        <a href={SURSE[p.surse[0]].url} className={s.tabelTaraLegatura} rel="noopener noreferrer external">
                          {p.tara}
                          <ArrowRight width={13} height={13} strokeWidth={2} aria-hidden="true" />
                        </a>
                      ) : (
                        p.tara
                      )}
                    </p>
                  </div>
                  <div role="cell" className={s.tabelCe}>
                    {p.ce}
                  </div>
                  <div role="cell" className={s.tabelCand}>
                    {p.cand}
                  </div>
                  <div role="cell" className={s.tabelFormat}>
                    <span className={s.tabelFormatText}>{p.format}</span>
                    <span className={s.tabelSurse}>
                      {p.surse.map((c) => (
                        <LegaturaSursa key={c} cheie={c} text={TABEL.eticheteSursa + ": " + SURSE[c].eticheta} />
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={s.modificari}>
              <p className={s.modificariTitlu}>{TABEL.titluModificari}</p>
              <ul className={s.modificariLista}>
                {MODIFICARI_RECENTE.map((m) => (
                  <li key={m.text}>{m.text}</li>
                ))}
              </ul>
            </div>

            <div className={s.calendar}>
              <div>
                <p className={s.calendarTitlu}>{TABEL.calendar.titlu}</p>
                <p className={s.calendarText}>{TABEL.calendar.text}</p>
              </div>
              <a href={CALE_CALENDAR} className={s.calendarButon} download>
                <Download width={16} height={16} strokeWidth={2} aria-hidden="true" />
                <span>{TABEL.calendar.buton}</span>
              </a>
            </div>

            <p className={s.verificare}>
              {TABEL.verificare} <time dateTime={DATA_VERIFICARII}>{dataInCuvinte(DATA_VERIFICARII)}</time>
            </p>
            <p className={s.nota}>
              {TABEL.nota} <LegaturaInText legatura={TABEL.notaLegatura} marime={14} />
            </p>
          </div>
        </div>
      </section>

      {/* §5 Jurnalul */}
      <section className={s.jurnal} aria-labelledby="efacturare-jurnal">
        <div className="container-site">
          <div className={s.coloana}>
            <p className={s.jurnalEticheta}>{JURNAL_CAP.eticheta}</p>
            <CapBloc id="efacturare-jurnal" titlu={JURNAL_CAP.titlu} text={JURNAL_CAP.text} margineJos={0} />
            <ol className={s.jurnalLista}>
              {JURNAL.map((j) => (
                <li key={j.data + j.cod} className={s.jurnalElement}>
                  <div className={s.jurnalMeta}>
                    <time className={s.jurnalData} dateTime={j.data}>
                      {j.dataText}
                    </time>
                    <a href={"#" + j.ancora} className={s.jurnalTara} aria-label={"Rândul țării în tabel: " + j.cod}>
                      {j.cod}
                    </a>
                  </div>
                  <div>
                    <p className={s.jurnalText}>{j.text}</p>
                    <LegaturaSursa cheie={j.sursa} text={JURNAL_CAP.legatura} className={s.jurnalLegatura} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* §6 Trei repere din regula romaneasca */}
      <section className={s.bloc} aria-labelledby="efacturare-reguli" style={{ paddingTop: 0 }}>
        <div className="container-site">
          <div className={s.coloana}>
            <CapBloc id="efacturare-reguli" titlu={TREI_REGULI.titlu} text={TREI_REGULI.text} />
          </div>
          <ul className={[s.lat, s.grila3].join(" ")} style={{ listStyle: "none", padding: 0, margin: "0 auto" }}>
            {TREI_REGULI.carduri.map((c) => (
              <li key={c.titlu} className={s.card}>
                <span className={s.cardIconita}>{ICONITE[c.iconita]}</span>
                <h3 className={s.cardTitlu}>{c.titlu}</h3>
                <p className={s.cardText}>{c.text}</p>
              </li>
            ))}
          </ul>
          <p className={s.legaturaCentru}>
            <LegaturaSursa cheie="roGhid" text={"Ghidul ANAF pentru RO e-Factura (2023)"} className={s.jurnalLegatura} />
          </p>
        </div>
      </section>

      {/* §7 Emiterea e jumatate din regula */}
      <section className={s.bloc} aria-labelledby="efacturare-emitere">
        <div className="container-site">
          <div className={s.coloana}>
            <CapBloc id="efacturare-emitere" titlu={EMITEREA.titlu} text={EMITEREA.text} />
            <div className={[s.cutie, s.emitere].join(" ")}>
              {EMITEREA.paragrafe.map((p) => (
                <p key={p.slice(0, 24)} className={s.emitereParagraf}>
                  {p}
                </p>
              ))}
              <p className={[s.emitereParagraf, s.emitereRezolvare].join(" ")}>{EMITEREA.rezolvare}</p>
              <LegaturaInText legatura={EMITEREA.legatura} />
            </div>
          </div>
        </div>
      </section>

      {/* §8 Rigla */}
      <section className={s.rigla} aria-labelledby="efacturare-rigla">
        <div className="container-site">
          <div className={s.riglaBloc}>
            <header className={s.riglaCap}>
              <h3 id="efacturare-rigla" className={s.riglaTitlu}>
                {RIGLA.titlu}
              </h3>
              <p className={s.riglaSubtitlu}>{RIGLA.subtitlu}</p>
            </header>
            <Rigla11Ani
              fisier={RIGLA.fisier}
              eticheta={RIGLA.eticheta}
              banda={RIGLA.banda}
              anStart={RIGLA.anStart}
              aniScala={RIGLA.aniScala}
              aniPastrare={RIGLA.aniPastrare}
            />
            <p className={s.riglaNota}>{RIGLA.nota}</p>
          </div>
        </div>
      </section>

      {/* §9 Ce face 3S cu facturile */}
      <section className={s.bloc} aria-labelledby="efacturare-casa">
        <div className="container-site">
          <div className={s.coloana}>
            <CapBloc id="efacturare-casa" titlu={CASA.titlu} text={CASA.text} />
          </div>
          <ol className={[s.lat, s.grila3].join(" ")} style={{ listStyle: "none", padding: 0, margin: "0 auto" }}>
            {CASA.pasi.map((p, i) => (
              <li key={p.titlu} className={s.card}>
                <span className={s.cardCerc} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={s.cardTitlu}>{p.titlu}</h3>
                <p className={s.cardText}>{p.text}</p>
              </li>
            ))}
          </ol>
          <p className={s.legaturaCentru}>
            <LegaturaInText legatura={CASA.legatura} />
          </p>
        </div>
      </section>

      {/* §10 Standardele */}
      <section className={s.bloc} aria-labelledby="efacturare-standarde">
        <div className="container-site">
          <div className={[s.coloana, s.cutie, s.standarde].join(" ")}>
            <div>
              <h2 id="efacturare-standarde" className={s.standardeTitlu}>
                {STANDARDE.titlu}
              </h2>
              <p className={s.standardeText}>{STANDARDE.text}</p>
            </div>
            <ul className={s.insigne}>
              {STANDARDE.insigne.map((i) => (
                <li key={i} className={s.insigna}>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* §11 FAQ */}
      <section className={s.bloc} aria-labelledby="efacturare-intrebari" id="intrebari">
        <div className="container-site">
          <div className={s.coloana}>
            <CapBloc id="efacturare-intrebari" titlu={INTREBARI_EFACTURARE.titlu} />
            <Acordeon
              varianta="e-facturare"
              elemente={INTREBARI_EFACTURARE.intrebari.map((i) => ({ intrebare: i.intrebare, raspuns: <p>{i.raspuns}</p> }))}
            />
          </div>
        </div>
        <JsonLd date={grafIntrebari()} />
      </section>

      {/* §12 CTA-ul final comun */}
      <CtaFinalInchis />
    </main>
  );
}
