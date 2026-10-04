// Corpul paginii `/platforma` (fisa platforma.md, sectiunile 1-13; COMPONENTE §4.6), in ordinea
// masurata: eroul cu macheta, fraza-ancora cu pilonii, cardul "problema" cu antet lipit, modelul in
// trei noduri, blocurile numerotate 01-03, comparatia, suveranitatea datelor, cele trei apeluri,
// cazurile, cardul de conformitate si intrebarile frecvente. CTA-ul final il pune pagina.
//
// Abaterile de la referinta, toate din fisa (defecte masurate care nu se copiaza):
//   - diagrama la 390: nodurile au inaltimea continutului, nu baza flex de 180 px pe verticala;
//   - apelurile la 390: grila pe `minmax(0, 1fr)`, derularea ramane in blocul de cod;
//   - etichetele conectorilor si numerele pilonilor: textul de citit trece pe ardezie-5 (4,76:1),
//     numerele raman decor, in pseudo-element, ascunse cititoarelor;
//   - tabelul comparatiei are roluri de tabel explicite, iar randul lui de cap ramane pentru
//     cititoarele de ecran si cand iese din vedere sub 760 px.
//
// Blocurile de cod sunt EXEMPLE ILUSTRATIVE pe gazda rezervata `api.3s.example` (RFC 2606), cu date
// fictive, si o spun in legenda lor; fiecare bloc primeste focus, ca sa se poata derula din
// tastatura cand codul e mai lat decat ecranul.
//
// PE EDITIE: continutul vine pe sectiuni prin `continut`, cu implicitul RO (constantele din
// `src/content/produs/platforma.ts`, nemodificate: tipurile de aici sunt structurale si le accepta).
// `sectiuni` alege ce sectiuni se randeaza, in ordinea fixa a componentei (implicit: toate). Legaturile
// pe care alta editie nu le are sunt optionale in tip si se randeaza conditionat; pe RO exista mereu,
// deci ramura da acelasi DOM. `butoane` inlocuieste butoanele eroului cand editia are alt canal, iar
// cele doua etichete scrise pana acum direct in componenta au implicitul RO.

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import Acordeon from "@/components/primitive/Acordeon";
import Buton from "@/components/primitive/Buton";
import FirPagina, { type NivelFir } from "@/components/primitive/FirPagina";
import LegaturaInText from "@/components/primitive/LegaturaInText";
import Pastila from "@/components/primitive/Pastila";
import {
  APELURI_PLATFORMA,
  BLOC_ARHIVA,
  BLOC_DATE,
  BLOC_INTREBARI,
  CAZURI_PLATFORMA,
  COMPARATIE_PLATFORMA,
  CONFORMITATE_PLATFORMA,
  EROU_PLATFORMA,
  FIR_PLATFORMA,
  INTREBARI_PLATFORMA,
  MACHETA_STRAT,
  MODEL_PLATFORMA,
  PILONI_PLATFORMA,
  PROBLEMA_PLATFORMA,
  SUVERANITATE_PLATFORMA,
} from "@/content/produs/platforma";
import type { Legatura } from "@/content/navigatie";
import type { IconitaProdus as NumeIconita } from "@/content/produs/iconite";
import type { BlocIntrebari } from "@/content/produs/intrebari";
import { CapCentrat, CapNumeratPlatforma } from "./Capete";
import IconitaProdus from "./IconitaProdus";
import MachetaStrat, { type ContinutMachetaStrat } from "./MachetaStrat";
import { nerupt } from "./nerupt";
import s from "./platforma.module.css";

type TitluText = { titlu: string; text: string };
type BlocNumerotat = { numar: string; titlu: string; subtitlu: string };

/** Continutul paginii, pe sectiuni; constantele RO il satisfac fara editare. */
export type ContinutPaginaPlatforma = {
  fir: NivelFir[];
  erou: { titlu: string; subtitlu: string; butonPrincipal?: Legatura; butonSecundar?: Legatura };
  macheta: ContinutMachetaStrat;
  piloni?: { fraza: string; piloni: { numar: string; iconita: NumeIconita; titlu: string; text: string }[] };
  problema?: { titlu: string; cheie: string; batai: string[] };
  model?: {
    titlu: string;
    metafora: string;
    subtitlu: string;
    noduri: { eticheta: string; descriere: string }[];
    conectori: string[];
  };
  blocDate?: BlocNumerotat & { pasi: TitluText[] };
  blocArhiva?: BlocNumerotat & { randuri: { eticheta: string; valoare: string }[]; legatura?: Legatura };
  blocIntrebari?: BlocNumerotat & { carduri: (TitluText & { iconita: NumeIconita })[] };
  comparatie?: {
    titlu: string;
    subtitlu: string;
    coloane: string[];
    randuri: { dimensiune: string; alternativa: string; noi: string }[];
    nota: string;
    legatura?: Legatura;
    /** Capul ascuns al primei coloane, pentru cititoarele de ecran; implicit RO. */
    etichetaCriteriu?: string;
  };
  suveranitate?: {
    eticheta: string;
    titlu: string;
    subtitlu: string;
    proza: string[];
    evidentiat: string;
    legatura?: Legatura;
    carduri: TitluText[];
  };
  apeluri?: {
    titlu: string;
    subtitlu: string;
    pasi: TitluText[];
    blocuri: { eticheta: string; cod: string }[];
    legenda: string;
    etichetaExemplu: string;
    nota: string;
    legatura?: Legatura;
  };
  cazuri?: { titlu: string; subtitlu: string; cazuri: TitluText[]; legatura?: Legatura };
  conformitate?: {
    titlu: string;
    text: string;
    insigne: string[];
    /** Numele accesibil al listei de insigne; implicit RO. */
    etichetaInsigne?: string;
  };
  intrebari?: BlocIntrebari;
};

/** Sectiunile paginii, in ordinea fixa de randare. */
export const SECTIUNI_PLATFORMA = [
  "erou",
  "piloni",
  "problema",
  "model",
  "blocDate",
  "blocArhiva",
  "blocIntrebari",
  "comparatie",
  "suveranitate",
  "apeluri",
  "cazuri",
  "conformitate",
  "intrebari",
] as const;
export type SectiunePlatforma = (typeof SECTIUNI_PLATFORMA)[number];

/** Implicitul RO: constantele din `src/content/produs/platforma.ts`, neschimbate. */
const CONTINUT_RO: ContinutPaginaPlatforma = {
  fir: FIR_PLATFORMA,
  erou: EROU_PLATFORMA,
  macheta: MACHETA_STRAT,
  piloni: PILONI_PLATFORMA,
  problema: PROBLEMA_PLATFORMA,
  model: MODEL_PLATFORMA,
  blocDate: BLOC_DATE,
  blocArhiva: BLOC_ARHIVA,
  blocIntrebari: BLOC_INTREBARI,
  comparatie: COMPARATIE_PLATFORMA,
  suveranitate: SUVERANITATE_PLATFORMA,
  apeluri: APELURI_PLATFORMA,
  cazuri: CAZURI_PLATFORMA,
  conformitate: CONFORMITATE_PLATFORMA,
  intrebari: INTREBARI_PLATFORMA,
};

/** Sectiunea ceruta in `sectiuni`, fara continut: eroare la construire, nu o sectiune scoasa tacut. */
function ceruta<T>(valoare: T | undefined, sectiune: SectiunePlatforma): T {
  if (valoare === undefined) {
    throw new Error("PaginaPlatforma: sectiunea `" + sectiune + "` e ceruta, dar continutul ei lipseste");
  }
  return valoare;
}

/** Sageata lunga a conectorilor: 40 x 16, contur 1,5. */
function SageataConector({ inversa = false }: { inversa?: boolean }) {
  return (
    <svg
      className={s.sageata + (inversa ? " " + s.sageataInversa : "")}
      width="40"
      height="16"
      viewBox="0 0 40 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {inversa ? <path d="M38 8H3M9 2.5 3 8l6 5.5" /> : <path d="M2 8h35M31 2.5 37 8l-6 5.5" />}
    </svg>
  );
}

function Erou({
  e,
  fir,
  macheta,
  butoane,
  etichetaFir,
}: {
  e: ContinutPaginaPlatforma["erou"];
  fir: NivelFir[];
  macheta: ContinutMachetaStrat;
  butoane?: ReactNode;
  etichetaFir?: string;
}) {
  return (
    <section className={s.erou} aria-labelledby="platforma-titlu">
      <div className="container-site">
        <div className={s.erouFir}>
          <FirPagina niveluri={fir} {...(etichetaFir !== undefined ? { eticheta: etichetaFir } : {})} />
        </div>
        <div className={s.erouGrila}>
          <div className={s.erouText}>
            <h1 id="platforma-titlu" className={"t-h1-interior " + s.erouTitlu}>
              {e.titlu}
            </h1>
            <p className={"t-subtitlu-interior " + s.erouSubtitlu}>{e.subtitlu}</p>
            <div className={s.erouActiuni}>
              {butoane ?? (
                <>
                  {e.butonPrincipal ? (
                    <Buton varianta="plin" marime="plat" sageata legatura={e.butonPrincipal} className={s.erouButon}>
                      {e.butonPrincipal.text}
                    </Buton>
                  ) : null}
                  {e.butonSecundar ? (
                    <Buton varianta="fantoma" marime="plat" legatura={e.butonSecundar} className={s.erouButon}>
                      {e.butonSecundar.text}
                    </Buton>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <div className={s.erouVizual}>
            <MachetaStrat continut={macheta} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Piloni({ p }: { p: NonNullable<ContinutPaginaPlatforma["piloni"]> }) {
  return (
    <section className={s.piloni} aria-labelledby="platforma-piloni">
      <div className="container-site">
        <h2 id="platforma-piloni" className={"t-fraza-ancora " + s.frazaAncora}>
          {nerupt(p.fraza)}
        </h2>
        <ul className={s.piloniGrila}>
          {p.piloni.map((x) => (
            <li key={x.numar} className={s.card + " " + s.pilon}>
              <span className={s.pilonNumar} data-numar={x.numar} aria-hidden="true" />
              <span className={s.cutieIconita + " " + s.pilonIconita}>
                <IconitaProdus nume={x.iconita} marime={22} />
              </span>
              <h3 className={s.pilonTitlu}>{nerupt(x.titlu)}</h3>
              <p className={s.pilonText}>{nerupt(x.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Problema({ p }: { p: NonNullable<ContinutPaginaPlatforma["problema"]> }) {
  const ultima = p.batai.length - 1;
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-problema">
      <div className="container-site">
        <div className={s.problema}>
          <div className={s.problemaAntet}>
            <h2 id="platforma-problema" className={s.problemaTitlu}>
              {nerupt(p.titlu)}
            </h2>
            <p className={s.problemaCheie}>{nerupt(p.cheie)}</p>
          </div>
          <ol className={s.poveste}>
            {p.batai.map((b, i) => (
              <li key={i} className={s.bataie + (i === ultima ? " " + s.bataieFinala : "")}>
                <span className={s.bataiePunct} aria-hidden="true" />
                <p className={s.bataieText}>{nerupt(b)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Model({ m }: { m: NonNullable<ContinutPaginaPlatforma["model"]> }) {
  const [oameni, miez, acte] = m.noduri;
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-model">
      <div className="container-site">
        <CapCentrat id="platforma-model" titlu={m.titlu} metafora={m.metafora} subtitlu={m.subtitlu} />
        <div className={s.diagrama}>
          <div className={s.card + " " + s.nod}>
            <p className={s.nodEticheta}>{nerupt(oameni.eticheta)}</p>
            <p className={s.nodDescriere}>{nerupt(oameni.descriere)}</p>
          </div>
          <div className={s.conector}>
            <span className={s.conectorEticheta}>{m.conectori[0]}</span>
            <SageataConector />
          </div>
          <div className={s.card + " " + s.nod + " " + s.nodMiez}>
            <p className={s.nodEticheta}>{nerupt(miez.eticheta)}</p>
            <p className={s.nodDescriere}>{nerupt(miez.descriere)}</p>
          </div>
          <div className={s.conector}>
            <SageataConector inversa />
            <span className={s.conectorEticheta}>{m.conectori[1]}</span>
          </div>
          <div className={s.card + " " + s.nod}>
            <p className={s.nodEticheta}>{nerupt(acte.eticheta)}</p>
            <p className={s.nodDescriere}>{nerupt(acte.descriere)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlocDate({ b }: { b: NonNullable<ContinutPaginaPlatforma["blocDate"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-bloc-01">
      <div className="container-site">
        <CapNumeratPlatforma id="platforma-bloc-01" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <ol className={s.pasi}>
          {b.pasi.map((p, i) => (
            <li key={p.titlu} className={s.card + " " + s.pas}>
              <span className={s.cutieIconita + " " + s.pasIndex} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={s.pasTitlu}>{nerupt(p.titlu)}</h3>
              <p className={s.pasText}>{nerupt(p.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BlocArhiva({ b }: { b: NonNullable<ContinutPaginaPlatforma["blocArhiva"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-bloc-02">
      <div className="container-site">
        <CapNumeratPlatforma id="platforma-bloc-02" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <dl className={s.card + " " + s.randuri}>
          {b.randuri.map((r) => (
            <div key={r.eticheta} className={s.rand}>
              <dt className={s.randEticheta}>{r.eticheta}</dt>
              <dd className={s.randValoare}>{nerupt(r.valoare)}</dd>
            </div>
          ))}
        </dl>
        {b.legatura ? (
          <p className={s.legaturaSubTabel}>
            <LegaturaInText legatura={b.legatura} />
          </p>
        ) : null}
      </div>
    </section>
  );
}

function BlocIntrebari({ b }: { b: NonNullable<ContinutPaginaPlatforma["blocIntrebari"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-bloc-03">
      <div className="container-site">
        <CapNumeratPlatforma id="platforma-bloc-03" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <ul className={s.carduri}>
          {b.carduri.map((c) => (
            <li key={c.titlu} className={s.card + " " + s.cardIntrebare}>
              <span className={s.cutieIconita + " " + s.cardIconita}>
                <IconitaProdus nume={c.iconita} marime={20} />
              </span>
              <h3 className={s.cardTitlu}>{nerupt(c.titlu)}</h3>
              <p className={s.cardText}>{nerupt(c.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Comparatie({ c }: { c: NonNullable<ContinutPaginaPlatforma["comparatie"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-comparatie">
      <div className="container-site">
        <CapCentrat id="platforma-comparatie" titlu={c.titlu} subtitlu={c.subtitlu} />
        <div role="table" aria-labelledby="platforma-comparatie" className={s.card + " " + s.comparatie}>
          <div role="row" className={s.comparatieRand + " " + s.comparatieCap}>
            <span role="columnheader">
              <span className="doar-cititor">{c.etichetaCriteriu ?? "Criteriu"}</span>
            </span>
            <span role="columnheader">{c.coloane[0]}</span>
            <span role="columnheader" className={s.comparatieCapNoi}>
              {c.coloane[1]}
            </span>
          </div>
          {c.randuri.map((r) => (
            <div key={r.dimensiune} role="row" className={s.comparatieRand}>
              <span role="rowheader" className={s.comparatieDimensiune}>
                {nerupt(r.dimensiune)}
              </span>
              <span role="cell" className={s.comparatieAlternativa}>
                {nerupt(r.alternativa)}
              </span>
              <span role="cell">
                <span className={s.comparatieNoi}>
                  <Check width={15} height={15} strokeWidth={2.5} aria-hidden="true" focusable="false" />
                  {nerupt(r.noi)}
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className={s.notaComparatie}>
          {nerupt(c.nota)}
          {c.legatura ? " " : null}
          {c.legatura ? <LegaturaInText legatura={c.legatura} marime={16.8} className={s.legaturaInNota} /> : null}
        </p>
      </div>
    </section>
  );
}

function Suveranitate({ v }: { v: NonNullable<ContinutPaginaPlatforma["suveranitate"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-suveranitate">
      <div className="container-site">
        <CapCentrat id="platforma-suveranitate" eticheta={v.eticheta} titlu={v.titlu} subtitlu={v.subtitlu} />
        <div className={s.suveranitateGrila}>
          <div className={s.proza}>
            {v.proza.map((p) => (
              <p key={p.slice(0, 32)} className={s.prozaParagraf}>
                {nerupt(p)}
              </p>
            ))}
            <p className={s.evidentiat}>{nerupt(v.evidentiat)}</p>
            {v.legatura ? (
              <p>
                <LegaturaInText legatura={v.legatura} className={s.legaturaProza} />
              </p>
            ) : null}
          </div>
          <ul className={s.suveranitateCarduri}>
            {v.carduri.map((c) => (
              <li key={c.titlu} className={s.suveranitateCard}>
                <h3 className={s.suveranitateTitlu}>{nerupt(c.titlu)}</h3>
                <p className={s.suveranitateText}>{nerupt(c.text)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Apeluri({ a }: { a: NonNullable<ContinutPaginaPlatforma["apeluri"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-apeluri">
      <div className="container-site">
        <CapCentrat id="platforma-apeluri" titlu={a.titlu} subtitlu={a.subtitlu} />
        <div className={s.apeluriGrila}>
          <ol className={s.apeluriPasi}>
            {a.pasi.map((p, i) => (
              <li key={p.titlu} className={s.apelPas}>
                <span className={s.apelCerc} aria-hidden="true">
                  {i + 1}
                </span>
                <div className={s.apelMeta}>
                  <h3 className={s.apelTitlu}>{nerupt(p.titlu)}</h3>
                  <p className={s.apelText}>{nerupt(p.text)}</p>
                </div>
              </li>
            ))}
          </ol>
          <figure className={s.cod}>
            {a.blocuri.map((b) => (
              <div key={b.eticheta} className={s.codBloc}>
                <pre role="region" tabIndex={0} aria-label={b.eticheta}>
                  <code>{b.cod}</code>
                </pre>
                <span className={s.codEticheta} aria-hidden="true">
                  {a.etichetaExemplu}
                </span>
              </div>
            ))}
            <figcaption className={s.codLegenda}>{nerupt(a.legenda)}</figcaption>
          </figure>
        </div>
        <p className={s.notaApeluri}>
          {a.nota}
          {a.legatura ? " " : null}
          {a.legatura ? <LegaturaInText legatura={a.legatura} className={s.legaturaInNota} /> : null}
        </p>
      </div>
    </section>
  );
}

function Cazuri({ c }: { c: NonNullable<ContinutPaginaPlatforma["cazuri"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-cazuri">
      <div className="container-site">
        <CapCentrat id="platforma-cazuri" titlu={c.titlu} subtitlu={c.subtitlu} />
        <ul className={s.cazuri}>
          {c.cazuri.map((x) => (
            <li key={x.titlu} className={s.caz}>
              <h3 className={s.cazTitlu}>{nerupt(x.titlu)}</h3>
              <p className={s.cazText}>{nerupt(x.text)}</p>
            </li>
          ))}
        </ul>
        {c.legatura ? (
          <p className={s.legaturaCentrata}>
            <LegaturaInText legatura={c.legatura} />
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Conformitate({ c }: { c: NonNullable<ContinutPaginaPlatforma["conformitate"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-conformitate">
      <div className="container-site">
        <div className={s.conformitate}>
          <div>
            <h2 id="platforma-conformitate" className={s.conformitateTitlu}>
              {nerupt(c.titlu)}
            </h2>
            <p className={s.conformitateText}>{nerupt(c.text)}</p>
          </div>
          <ul className={s.insigne} aria-label={c.etichetaInsigne ?? "Ce poate arăta 3S"}>
            {c.insigne.map((x) => (
              <li key={x}>
                <Pastila varianta="insigna">{x}</Pastila>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Intrebari({ q }: { q: NonNullable<ContinutPaginaPlatforma["intrebari"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-intrebari">
      <div className="container-site">
        <CapCentrat id="platforma-intrebari" titlu={q.titlu} />
        <Acordeon varianta="platforma" elemente={q.intrebari} />
      </div>
    </section>
  );
}

export type PaginaPlatformaProps = {
  continut?: ContinutPaginaPlatforma;
  /** Sectiunile de randat; ordinea ramane cea a componentei. Lipsa = toate. */
  sectiuni?: readonly SectiunePlatforma[];
  /** Butoanele eroului, cand editia are alt canal decat cele doua legaturi din continut. */
  butoane?: ReactNode;
  /** Eticheta accesibila a firului, in limba editiei; lipsa = implicitul RO. */
  etichetaFir?: string;
};

export default function PaginaPlatforma({ continut = CONTINUT_RO, sectiuni, butoane, etichetaFir }: PaginaPlatformaProps) {
  const c = continut;
  const are = (k: SectiunePlatforma) => sectiuni === undefined || sectiuni.includes(k);
  return (
    <>
      {are("erou") ? <Erou e={c.erou} fir={c.fir} macheta={c.macheta} butoane={butoane} etichetaFir={etichetaFir} /> : null}
      {are("piloni") ? <Piloni p={ceruta(c.piloni, "piloni")} /> : null}
      {are("problema") ? <Problema p={ceruta(c.problema, "problema")} /> : null}
      {are("model") ? <Model m={ceruta(c.model, "model")} /> : null}
      {are("blocDate") ? <BlocDate b={ceruta(c.blocDate, "blocDate")} /> : null}
      {are("blocArhiva") ? <BlocArhiva b={ceruta(c.blocArhiva, "blocArhiva")} /> : null}
      {are("blocIntrebari") ? <BlocIntrebari b={ceruta(c.blocIntrebari, "blocIntrebari")} /> : null}
      {are("comparatie") ? <Comparatie c={ceruta(c.comparatie, "comparatie")} /> : null}
      {are("suveranitate") ? <Suveranitate v={ceruta(c.suveranitate, "suveranitate")} /> : null}
      {are("apeluri") ? <Apeluri a={ceruta(c.apeluri, "apeluri")} /> : null}
      {are("cazuri") ? <Cazuri c={ceruta(c.cazuri, "cazuri")} /> : null}
      {are("conformitate") ? <Conformitate c={ceruta(c.conformitate, "conformitate")} /> : null}
      {are("intrebari") ? <Intrebari q={ceruta(c.intrebari, "intrebari")} /> : null}
    </>
  );
}
