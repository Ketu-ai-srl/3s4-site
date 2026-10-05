// Sectiunile paginii /e-facturare (e-facturare.md, sablonul "subiect lung"), scoase din `src/app/e-facturare/page.tsx`
// ca aceeasi compunere sa poata fi montata si pe ghidul EN al lui 3s.md (decizia 53: aceleasi componente, aceeasi
// ordine, textul in limba editiei). MUTARE DE COD, FARA SCHIMBARE DE HTML: marcajul, clasele, cheile React si
// ordinea sunt cele din pagina; dovada e fixtura `/e-facturare` a invariantei RO (`tests/invarianta-ro.test.ts`).
//
// PE EDITIE: fiecare sectiune primeste `continut` (tot continutul paginii, un singur contract), cu implicitul
// romanesc construit aici din modulele de azi (`src/content/efacturare/`), deci pagina RO nu paseaza nimic. Eroul
// primeste si locul butoanelor (`butoane`), unde editia are alt canal decat butoanele RO. Calendarul `.ics` e
// optional in contract: lipseste pe o editie fara ruta lui.
//
// Datele despre piete, jurnal si calendar vin din `src/content/efacturare/`, fiecare valoare cu sursa ei oficiala
// alaturi; textele, din `pagina.ts`.

import {
  ArrowRight,
  Archive,
  Download,
  ExternalLink,
  FileCode,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";
import Acordeon from "@/components/primitive/Acordeon";
import Buton from "@/components/primitive/Buton";
import CapBloc from "@/components/primitive/CapBloc";
import FirPagina, { type NivelFir } from "@/components/primitive/FirPagina";
import LegaturaInText from "@/components/primitive/LegaturaInText";
import JsonLd from "@/components/seo/JsonLd";
import { iduri } from "@/components/seo/date-structurate";
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
  MACHETA_DRUM,
  MANDATE,
  RIGLA,
  STANDARDE,
  TABEL,
  TREI_REGULI,
} from "@/content/efacturare/pagina";
import {
  ANCORA_EVIDENTIATA,
  JURNAL,
  MODIFICARI_RECENTE,
  PIETE,
} from "@/content/efacturare/piete";
import {
  DATA_VERIFICARII,
  SURSE,
  type Sursa,
} from "@/content/efacturare/surse";
import type { Legatura } from "@/content/navigatie";
import { adresaSite } from "@/lib/site";
import MachetaDrumFactura, {
  type ContinutMachetaDrum,
} from "./MachetaDrumFactura";
import Rigla11Ani from "./Rigla11Ani";
import s from "./efacturare.module.css";

// ---------------------------------------------------------------------------------------------------------------------
// Contractul
// ---------------------------------------------------------------------------------------------------------------------

export type RandPiata = {
  /** Ancora randului (`#germania`), tinta etichetelor din jurnal. */
  ancora: string;
  tara: string;
  ce: string;
  cand: string;
  format: string;
  /** Cheile surselor din `surse`. */
  surse: readonly string[];
};

export type IntrareJurnal = {
  data: string;
  dataText: string;
  cod: string;
  ancora: string;
  text: string;
  sursa: string;
};

export type ContinutEfacturare = {
  /** Calea paginii (datele structurate ale intrebarilor) si limba lor. */
  cale: string;
  limba: string;
  /** Sursele oficiale, pe chei; randurile, jurnalul si legatura spre ghid le citeaza prin cheie. */
  surse: Readonly<Record<string, Sursa>>;
  erou: {
    fir: NivelFir[];
    /** Eticheta accesibila a firului; lipsa = implicitul din `FirPagina`. */
    etichetaFir?: string;
    titlu: string;
    subtitlu: string;
    butonPlin: Legatura;
    butonContur: Legatura;
  };
  macheta: ContinutMachetaDrum;
  fraza: string;
  mandate: { titlu: string; text: string; batai: string[] };
  tabel: {
    titlu: string;
    text: string;
    capete: string[];
    eticheteSursa: string;
    piete: readonly RandPiata[];
    /** Tara al carei nume e legatura in tabel. */
    ancoraEvidentiata: string;
    titluModificari: string;
    modificari: readonly { text: string }[];
    /** Calendarul `.ics`: numai pe editia care are ruta lui. */
    calendar?: { titlu: string; text: string; buton: string; cale: string };
    verificare: string;
    /** Ziua verificarii, ISO, si scrisa ca pe pagina. */
    dataVerificarii: string;
    dataVerificariiText: string;
    nota: string;
    notaLegatura: Legatura;
  };
  jurnal: {
    eticheta: string;
    titlu: string;
    text: string;
    legatura: string;
    /** Inceputul etichetei accesibile a codului de tara (urmat de cod). */
    prefixTara: string;
    intrari: readonly IntrareJurnal[];
  };
  treiReguli: {
    titlu: string;
    text: string;
    carduri: { iconita: string; titlu: string; text: string }[];
    /** Legatura spre ghidul autoritatii, de sub carduri. */
    ghid: { cheie: string; text: string };
  };
  emiterea: {
    titlu: string;
    text: string;
    paragrafe: string[];
    rezolvare: string;
    legatura: Legatura;
  };
  rigla: {
    titlu: string;
    subtitlu: string;
    fisier: string;
    eticheta: string;
    banda: string;
    nota: string;
    anStart: number;
    aniScala: number;
    aniPastrare: number;
    /** Textul pentru cititorul de ecran al riglei; lipsa = textul romanesc al componentei. */
    descriere?: string;
  };
  casa: {
    titlu: string;
    text: string;
    pasi: { titlu: string; text: string }[];
    legatura: Legatura;
  };
  standarde: { titlu: string; text: string; insigne: string[] };
  intrebari: {
    titlu: string;
    intrebari: { intrebare: string; raspuns: string }[];
  };
};

// ---------------------------------------------------------------------------------------------------------------------
// Implicitul romanesc: exact ce citea pagina din modulele ei
// ---------------------------------------------------------------------------------------------------------------------

function dataInCuvinte(iso: string): string {
  const [an, luna, zi] = iso.split("-").map(Number);
  const luni = [
    "ianuarie",
    "februarie",
    "martie",
    "aprilie",
    "mai",
    "iunie",
    "iulie",
    "august",
    "septembrie",
    "octombrie",
    "noiembrie",
    "decembrie",
  ];
  return zi + " " + luni[luna - 1] + " " + an;
}

export const EFACTURARE_RO: ContinutEfacturare = {
  cale: CALE_EFACTURARE,
  limba: "ro-RO",
  surse: SURSE,
  erou: { fir: FIR_EFACTURARE, ...EROU_EFACTURARE },
  macheta: { ...MACHETA_DRUM, eticheta: "Exemplu" },
  fraza: FRAZA_ANCORA,
  mandate: MANDATE,
  tabel: {
    titlu: TABEL.titlu,
    text: TABEL.text,
    capete: TABEL.capete,
    eticheteSursa: TABEL.eticheteSursa,
    piete: PIETE,
    ancoraEvidentiata: ANCORA_EVIDENTIATA,
    titluModificari: TABEL.titluModificari,
    modificari: MODIFICARI_RECENTE,
    calendar: { ...TABEL.calendar, cale: CALE_CALENDAR },
    verificare: TABEL.verificare,
    dataVerificarii: DATA_VERIFICARII,
    dataVerificariiText: dataInCuvinte(DATA_VERIFICARII),
    nota: TABEL.nota,
    notaLegatura: TABEL.notaLegatura,
  },
  jurnal: {
    ...JURNAL_CAP,
    prefixTara: "Rândul țării în tabel: ",
    intrari: JURNAL,
  },
  treiReguli: {
    ...TREI_REGULI,
    ghid: { cheie: "roGhid", text: "Ghidul ANAF pentru RO e-Factura (2023)" },
  },
  emiterea: EMITEREA,
  rigla: RIGLA,
  casa: CASA,
  standarde: STANDARDE,
  intrebari: INTREBARI_EFACTURARE,
};

type CuContinut = { continut?: ContinutEfacturare };

const ICONITE: Record<string, ReactNode> = {
  timer: <Timer width={20} height={20} strokeWidth={2} aria-hidden="true" />,
  "file-code": (
    <FileCode width={20} height={20} strokeWidth={2} aria-hidden="true" />
  ),
  archive: (
    <Archive width={20} height={20} strokeWidth={2} aria-hidden="true" />
  ),
};

/** Legatura spre documentul oficial, cu sageata externa; se deschide in aceeasi fila. */
function LegaturaSursa({
  sursa,
  text,
  className,
}: {
  sursa: Sursa;
  text: string;
  className?: string;
}) {
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

function sursaDupaCheie(c: ContinutEfacturare, cheie: string): Sursa {
  const su = c.surse[cheie];
  if (su === undefined)
    throw new Error("e-facturare: sursa necunoscuta " + cheie);
  return su;
}

// ---------------------------------------------------------------------------------------------------------------------
// Sectiunile, in ordinea paginii
// ---------------------------------------------------------------------------------------------------------------------

/** §1 Erou pe doua coloane. `butoane` inlocuieste cele doua butoane implicite. */
export function ErouEfacturare({
  continut = EFACTURARE_RO,
  butoane,
}: CuContinut & { butoane?: ReactNode }) {
  const e = continut.erou;
  return (
    <section className={s.erou} aria-labelledby="efacturare-titlu">
      <div className="container-site">
        <div className={s.erouFir}>
          <FirPagina
            niveluri={e.fir.map((n) => ({ text: n.text, cale: n.cale }))}
            {...(e.etichetaFir !== undefined
              ? { eticheta: e.etichetaFir }
              : {})}
          />
        </div>
        <div className={s.erouGrila}>
          <div>
            <h1
              id="efacturare-titlu"
              className={"t-h1-interior " + s.erouTitlu}
            >
              {e.titlu}
            </h1>
            <p className={s.erouSubtitlu}>{e.subtitlu}</p>
            <div className={s.erouButoane}>
              {butoane ?? (
                <>
                  <Buton
                    varianta="plin"
                    marime="plat"
                    sageata
                    legatura={e.butonPlin}
                  >
                    {e.butonPlin.text}
                  </Buton>
                  <Buton
                    varianta="fantoma"
                    marime="plat"
                    legatura={e.butonContur}
                  >
                    {e.butonContur.text}
                  </Buton>
                </>
              )}
            </div>
          </div>
          <MachetaDrumFactura continut={continut.macheta} />
        </div>
      </div>
    </section>
  );
}

/** §2 Fraza-ancora. */
export function FrazaEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  return (
    <section className={s.fraza}>
      <div className="container-site">
        <p className={"t-fraza-ancora " + s.frazaText}>{continut.fraza}</p>
      </div>
    </section>
  );
}

/** §3 Mandatele, in doua batai. */
export function MandateEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const m = continut.mandate;
  return (
    <section className={s.bloc} aria-labelledby="efacturare-mandate">
      <div className="container-site">
        <div className={[s.coloana, s.cutie].join(" ")}>
          <header className={s.cutieCap}>
            <h2 id="efacturare-mandate" className={"t-h2-bloc " + s.cutieTitlu}>
              {m.titlu}
            </h2>
            <p className={s.cutieText}>{m.text}</p>
          </header>
          <ul className={s.batai}>
            {m.batai.map((b) => (
              <li key={b.slice(0, 24)} className={s.bataie}>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** §4 Tabelul pietelor, cu schimbarile recente, calendarul (unde exista), data verificarii si nota. */
export function TabelPiete({ continut = EFACTURARE_RO }: CuContinut) {
  const t = continut.tabel;
  return (
    <section className={s.bloc} aria-labelledby="efacturare-piete">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="efacturare-piete" titlu={t.titlu} text={t.text} />
          <div className={s.tabel} role="table" aria-label={t.titlu}>
            <div className={[s.tabelRand, s.tabelCap].join(" ")} role="row">
              {t.capete.map((c, i) => (
                <span
                  key={c}
                  role="columnheader"
                  className={i === 3 ? s.tabelCapFormat : undefined}
                >
                  {c}
                </span>
              ))}
            </div>
            {t.piete.map((p) => (
              <div
                key={p.ancora}
                id={p.ancora}
                className={s.tabelRand}
                role="row"
              >
                <div role="rowheader">
                  <p className={s.tabelTara}>
                    {p.ancora === t.ancoraEvidentiata ? (
                      <a
                        href={sursaDupaCheie(continut, p.surse[0]).url}
                        className={s.tabelTaraLegatura}
                        rel="noopener noreferrer external"
                      >
                        {p.tara}
                        <ArrowRight
                          width={13}
                          height={13}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
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
                      <LegaturaSursa
                        key={c}
                        sursa={sursaDupaCheie(continut, c)}
                        text={
                          t.eticheteSursa +
                          ": " +
                          sursaDupaCheie(continut, c).eticheta
                        }
                      />
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={s.modificari}>
            <p className={s.modificariTitlu}>{t.titluModificari}</p>
            <ul className={s.modificariLista}>
              {t.modificari.map((m) => (
                <li key={m.text}>{m.text}</li>
              ))}
            </ul>
          </div>

          {t.calendar ? (
            <div className={s.calendar}>
              <div>
                <p className={s.calendarTitlu}>{t.calendar.titlu}</p>
                <p className={s.calendarText}>{t.calendar.text}</p>
              </div>
              <a href={t.calendar.cale} className={s.calendarButon} download>
                <Download
                  width={16}
                  height={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>{t.calendar.buton}</span>
              </a>
            </div>
          ) : null}

          <p className={s.verificare}>
            {t.verificare}{" "}
            <time dateTime={t.dataVerificarii}>{t.dataVerificariiText}</time>
          </p>
          <p className={s.nota}>
            {t.nota} <LegaturaInText legatura={t.notaLegatura} marime={14} />
          </p>
        </div>
      </div>
    </section>
  );
}

/** §5 Jurnalul. */
export function JurnalEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const j = continut.jurnal;
  return (
    <section className={s.jurnal} aria-labelledby="efacturare-jurnal">
      <div className="container-site">
        <div className={s.coloana}>
          <p className={s.jurnalEticheta}>{j.eticheta}</p>
          <CapBloc
            id="efacturare-jurnal"
            titlu={j.titlu}
            text={j.text}
            margineJos={0}
          />
          <ol className={s.jurnalLista}>
            {j.intrari.map((x) => (
              <li key={x.data + x.cod} className={s.jurnalElement}>
                <div className={s.jurnalMeta}>
                  <time className={s.jurnalData} dateTime={x.data}>
                    {x.dataText}
                  </time>
                  <a
                    href={"#" + x.ancora}
                    className={s.jurnalTara}
                    aria-label={j.prefixTara + x.cod}
                  >
                    {x.cod}
                  </a>
                </div>
                <div>
                  <p className={s.jurnalText}>{x.text}</p>
                  <LegaturaSursa
                    sursa={sursaDupaCheie(continut, x.sursa)}
                    text={j.legatura}
                    className={s.jurnalLegatura}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** §6 Trei repere din regula romaneasca. */
export function TreiReguliEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const r = continut.treiReguli;
  return (
    <section
      className={s.bloc}
      aria-labelledby="efacturare-reguli"
      style={{ paddingTop: 0 }}
    >
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="efacturare-reguli" titlu={r.titlu} text={r.text} />
        </div>
        <ul
          className={[s.lat, s.grila3].join(" ")}
          style={{ listStyle: "none", padding: 0, margin: "0 auto" }}
        >
          {r.carduri.map((c) => (
            <li key={c.titlu} className={s.card}>
              <span className={s.cardIconita}>{ICONITE[c.iconita]}</span>
              <h3 className={s.cardTitlu}>{c.titlu}</h3>
              <p className={s.cardText}>{c.text}</p>
            </li>
          ))}
        </ul>
        <p className={s.legaturaCentru}>
          <LegaturaSursa
            sursa={sursaDupaCheie(continut, r.ghid.cheie)}
            text={r.ghid.text}
            className={s.jurnalLegatura}
          />
        </p>
      </div>
    </section>
  );
}

/** §7 Emiterea e jumatate din regula. */
export function EmitereaEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const e = continut.emiterea;
  return (
    <section className={s.bloc} aria-labelledby="efacturare-emitere">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="efacturare-emitere" titlu={e.titlu} text={e.text} />
          <div className={[s.cutie, s.emitere].join(" ")}>
            {e.paragrafe.map((p) => (
              <p key={p.slice(0, 24)} className={s.emitereParagraf}>
                {p}
              </p>
            ))}
            <p className={[s.emitereParagraf, s.emitereRezolvare].join(" ")}>
              {e.rezolvare}
            </p>
            <LegaturaInText legatura={e.legatura} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** §8 Rigla. */
export function RiglaEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const r = continut.rigla;
  return (
    <section className={s.rigla} aria-labelledby="efacturare-rigla">
      <div className="container-site">
        <div className={s.riglaBloc}>
          <header className={s.riglaCap}>
            <h3 id="efacturare-rigla" className={s.riglaTitlu}>
              {r.titlu}
            </h3>
            <p className={s.riglaSubtitlu}>{r.subtitlu}</p>
          </header>
          <Rigla11Ani
            fisier={r.fisier}
            eticheta={r.eticheta}
            banda={r.banda}
            anStart={r.anStart}
            aniScala={r.aniScala}
            aniPastrare={r.aniPastrare}
            {...(r.descriere !== undefined ? { descriere: r.descriere } : {})}
          />
          <p className={s.riglaNota}>{r.nota}</p>
        </div>
      </div>
    </section>
  );
}

/** §9 Ce face 3S cu facturile. */
export function CasaEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const c = continut.casa;
  return (
    <section className={s.bloc} aria-labelledby="efacturare-casa">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="efacturare-casa" titlu={c.titlu} text={c.text} />
        </div>
        <ol
          className={[s.lat, s.grila3].join(" ")}
          style={{ listStyle: "none", padding: 0, margin: "0 auto" }}
        >
          {c.pasi.map((p, i) => (
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
          <LegaturaInText legatura={c.legatura} />
        </p>
      </div>
    </section>
  );
}

/** §10 Standardele. */
export function StandardeEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const t = continut.standarde;
  return (
    <section className={s.bloc} aria-labelledby="efacturare-standarde">
      <div className="container-site">
        <div className={[s.coloana, s.cutie, s.standarde].join(" ")}>
          <div>
            <h2 id="efacturare-standarde" className={s.standardeTitlu}>
              {t.titlu}
            </h2>
            <p className={s.standardeText}>{t.text}</p>
          </div>
          <ul className={s.insigne}>
            {t.insigne.map((i) => (
              <li key={i} className={s.insigna}>
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Datele structurate ale intrebarilor: exact intrebarile si raspunsurile vizibile. */
export function grafIntrebari(
  continut: ContinutEfacturare = EFACTURARE_RO,
  baza: string = adresaSite(),
) {
  const q = continut.intrebari;
  return {
    "@context": "https://schema.org" as const,
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": baza + continut.cale + "#intrebari",
        url: baza + continut.cale,
        name: q.titlu,
        inLanguage: continut.limba,
        isPartOf: { "@id": iduri(baza).site },
        mainEntity: q.intrebari.map((i) => ({
          "@type": "Question",
          name: i.intrebare,
          acceptedAnswer: { "@type": "Answer", text: i.raspuns },
        })),
      },
    ],
  };
}

/** §11 Intrebarile frecvente, cu FAQPage. */
export function IntrebariEfacturare({ continut = EFACTURARE_RO }: CuContinut) {
  const q = continut.intrebari;
  return (
    <section
      className={s.bloc}
      aria-labelledby="efacturare-intrebari"
      id="intrebari"
    >
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="efacturare-intrebari" titlu={q.titlu} />
          <Acordeon
            varianta="e-facturare"
            elemente={q.intrebari.map((i) => ({
              intrebare: i.intrebare,
              raspuns: <p>{i.raspuns}</p>,
            }))}
          />
        </div>
      </div>
      <JsonLd date={grafIntrebari(continut)} />
    </section>
  );
}
