// Corpul paginii `/securitate` (fisa securitate.md; COMPONENTE §4.6), in ordinea masurata: eroul
// interior, cei patru piloni, blocurile 01-09 (infrastructura cu harta si verificarea din browser,
// stocarea proprie, criptarea, accesul, ciclul actelor, reglementarea, originalele pe hartie,
// raportarea problemelor, intrebarile frecvente) si seiful. Pagina nu are CTA-ul final inchis:
// seiful ii tine locul.
//
// Specificatiile sunt numai cele din decizia D4c (Amazon, Germania, o regiune; AES-256 si TLS 1.2+);
// insignele spun numai lucruri pe care le spune si restul paginii, fara certificari.
//
// Abaterile de la referinta (defecte masurate care nu se copiaza):
//   - harta: eticheta si reperul in HTML, lizibile la 390;
//   - stocarea proprie: diagrama si beneficiile trec pe o coloana sub 640;
//   - textele mici pe ardezie-4 (2,56:1) trec pe ardezie-5; eticheta cardurilor pe albastru-apasat;
//   - matricea: "nu" e o liniuta desenata, cu textul "Nu" pentru cititoarele de ecran; invelisul
//     derulant primeste focus si nume;
//   - intrebarile frecvente: capul ramane centrat si la 390.
//
// PE EDITIE: continutul vine pe sectiuni prin `continut`, cu implicitul RO (constantele din
// `src/content/produs/securitate.ts`, nemodificate: tipurile de aici sunt structurale si le accepta).
// `sectiuni` alege ce sectiuni se randeaza, in ordinea fixa a componentei (implicit: toate). Slotul
// `verificare` primeste insula verificarii din browser a editiei (implicit `<VerificareBrowser />`,
// invelitoarea RO); butonul stocarii proprii e optional in tip. Eticheta accesibila a sectiunii de
// verificare si cea a firului au implicitul RO.

import type { ReactNode } from "react";
import { Check, Link as IconitaLegatura, Lock } from "lucide-react";
import Acordeon from "@/components/primitive/Acordeon";
import Buton from "@/components/primitive/Buton";
import EroulInterior from "@/components/primitive/EroulInterior";
import type { NivelFir } from "@/components/primitive/FirPagina";
import {
  BLOC_ACCES,
  BLOC_CICLU,
  BLOC_CRIPTARE,
  BLOC_INFRASTRUCTURA,
  BLOC_ORIGINALE,
  BLOC_RAPORTARE,
  BLOC_REGLEMENTARE,
  BLOC_STOCARE_PROPRIE,
  EROU_SECURITATE,
  FIR_SECURITATE,
  INTREBARI_SECURITATE,
  PILONI_SECURITATE,
  TITLU_PILONI_SECURITATE,
  type DreptMatrice,
} from "@/content/produs/securitate";
import type { Legatura } from "@/content/navigatie";
import type { IconitaProdus as NumeIconita } from "@/content/produs/iconite";
import type { BlocIntrebari } from "@/content/produs/intrebari";
import { CapNumeratSecuritate } from "./Capete";
import HartaEuropa, { type ContinutHartaEuropa } from "./HartaEuropa";
import IconitaProdus from "./IconitaProdus";
import Seif from "./Seif";
import VerificareBrowser from "./VerificareBrowser";
import { nerupt } from "./nerupt";
import s from "./securitate.module.css";

type TitluText = { titlu: string; text: string };
type BlocNumerotat = { numar: string; titlu: string; subtitlu: string };

/** Continutul paginii, pe sectiuni; constantele RO il satisfac fara editare. */
export type ContinutPaginaSecuritate = {
  fir: NivelFir[];
  erou: { titlu: string; subtitlu: string };
  piloni?: { titlu: string; elemente: (TitluText & { iconita: NumeIconita })[] };
  infrastructura?: BlocNumerotat & {
    harta: ContinutHartaEuropa;
    specificatii: { termen: string; valoare: string; mono: string | null }[];
  };
  stocareProprie?: BlocNumerotat & {
    noduri: { firma: { eticheta: string; sub: string }; legatura: string; aplicatie: { eticheta: string; sub: string } };
    beneficii: TitluText[];
    buton?: Legatura;
    nota: string;
  };
  criptare?: BlocNumerotat & {
    flux: { noduri: { iconita: NumeIconita; eticheta: string; sub: string | null }[]; legaturi: string[] };
    carduri: (TitluText & { eticheta: string })[];
  };
  acces?: BlocNumerotat & {
    matrice: {
      titlu: string;
      capRol: string;
      drepturi: string[];
      roluri: { nume: string; descriere: string; valori: DreptMatrice[] }[];
      texte: Record<DreptMatrice, string>;
      nota: string;
    };
    controale: TitluText[];
  };
  ciclu?: BlocNumerotat & { pasi: (TitluText & { numar: string; iconita: NumeIconita })[] };
  reglementare?: BlocNumerotat & { insigne: { marca: string; nume: string; nota: string }[]; carduri: TitluText[] };
  originale?: BlocNumerotat & { controale: TitluText[] };
  raportare?: { titlu: string; text: string; lista: string[]; buton: Legatura; nota: string };
  intrebari?: BlocIntrebari & { numar: string };
};

/** Sectiunile paginii, in ordinea fixa de randare. `verificare` si `seif` nu au continut aici. */
export const SECTIUNI_SECURITATE = [
  "erou",
  "piloni",
  "infrastructura",
  "verificare",
  "stocareProprie",
  "criptare",
  "acces",
  "ciclu",
  "reglementare",
  "originale",
  "raportare",
  "intrebari",
  "seif",
] as const;
export type SectiuneSecuritate = (typeof SECTIUNI_SECURITATE)[number];

/** Implicitul RO: constantele din `src/content/produs/securitate.ts`, neschimbate. */
const CONTINUT_RO: ContinutPaginaSecuritate = {
  fir: FIR_SECURITATE,
  erou: EROU_SECURITATE,
  piloni: { titlu: TITLU_PILONI_SECURITATE, elemente: PILONI_SECURITATE },
  infrastructura: BLOC_INFRASTRUCTURA,
  stocareProprie: BLOC_STOCARE_PROPRIE,
  criptare: BLOC_CRIPTARE,
  acces: BLOC_ACCES,
  ciclu: BLOC_CICLU,
  reglementare: BLOC_REGLEMENTARE,
  originale: BLOC_ORIGINALE,
  raportare: BLOC_RAPORTARE,
  intrebari: INTREBARI_SECURITATE,
};

/** Sectiunea ceruta in `sectiuni`, fara continut: eroare la construire, nu o sectiune scoasa tacut. */
function ceruta<T>(valoare: T | undefined, sectiune: SectiuneSecuritate): T {
  if (valoare === undefined) {
    throw new Error("PaginaSecuritate: sectiunea `" + sectiune + "` e ceruta, dar continutul ei lipseste");
  }
  return valoare;
}

function Piloni({ p }: { p: NonNullable<ContinutPaginaSecuritate["piloni"]> }) {
  return (
    <section className={s.piloni} aria-labelledby="securitate-piloni">
      <div className="container-site">
        <h2 id="securitate-piloni" className="doar-cititor">
          {p.titlu}
        </h2>
        <ul className={s.lista + " " + s.piloniGrila}>
          {p.elemente.map((x) => (
            <li key={x.titlu} className={s.card + " " + s.pilon}>
              <span className={s.pilonIconita}>
                <IconitaProdus nume={x.iconita} marime={22} />
              </span>
              <h3 className={s.cardTitlu + " " + s.pilonTitlu}>{nerupt(x.titlu)}</h3>
              <p className={s.cardText}>{nerupt(x.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Infrastructura({ b }: { b: NonNullable<ContinutPaginaSecuritate["infrastructura"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-01">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-01" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <HartaEuropa continut={b.harta} />
        <dl className={s.card + " " + s.specificatii}>
          {b.specificatii.map((r) => (
            <div key={r.termen} className={s.specRand}>
              <dt className={s.specTermen}>{r.termen}</dt>
              <dd className={s.specValoare}>
                {r.mono ? <span className={s.mono}>{r.mono}</span> : null}
                {nerupt(r.valoare)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Verificare({ eticheta, insula }: { eticheta: string; insula: ReactNode }) {
  return (
    <section className={s.verificare} aria-label={eticheta}>
      <div className="container-site">{insula}</div>
    </section>
  );
}

function Legatura({ text, iconita, clasa }: { text: string; iconita: "lant" | "lacat"; clasa?: string }) {
  const Desen = iconita === "lant" ? IconitaLegatura : Lock;
  return (
    <div className={s.legatura + (clasa ? " " + clasa : "")}>
      <span className={s.legaturaLinie} aria-hidden="true" />
      <span className={s.insignaLegatura}>
        <Desen width={12} height={12} strokeWidth={2} aria-hidden="true" focusable="false" />
        {nerupt(text)}
      </span>
    </div>
  );
}

function StocareProprie({ b }: { b: NonNullable<ContinutPaginaSecuritate["stocareProprie"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-02">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-02" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <div className={s.card + " " + s.stocare}>
          <div className={s.stocareDiagrama}>
            <div className={s.stocareNod + " " + s.stocareNodFirma}>
              <span className={s.stocareNodIconita}>
                <IconitaProdus nume="cilindru" marime={24} />
              </span>
              <span className={s.nodEticheta}>{b.noduri.firma.eticheta}</span>
              <span className={s.nodSub + " " + s.nodSubMono}>{b.noduri.firma.sub}</span>
            </div>
            <Legatura text={b.noduri.legatura} iconita="lant" />
            <div className={s.stocareNod}>
              <span className={s.stocareNodIconita}>
                <IconitaProdus nume="panou" marime={24} />
              </span>
              <span className={s.nodEticheta}>{b.noduri.aplicatie.eticheta}</span>
              <span className={s.nodSub}>{b.noduri.aplicatie.sub}</span>
            </div>
          </div>
          <ul className={s.lista + " " + s.beneficii}>
            {b.beneficii.map((x) => (
              <li key={x.titlu} className={s.beneficiu}>
                <span className={s.beneficiuBifa} aria-hidden="true">
                  <Check width={16} height={16} strokeWidth={2.5} focusable="false" />
                </span>
                <div className={s.beneficiuText}>
                  <h3 className={s.beneficiuTitlu}>{nerupt(x.titlu)}</h3>
                  <p className={s.beneficiuDescriere}>{nerupt(x.text)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className={s.stocareCta}>
            {b.buton ? (
              <Buton varianta="plin" legatura={b.buton}>
                {b.buton.text}
              </Buton>
            ) : null}
            <p className={s.notaMica}>{nerupt(b.nota)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Criptare({ b }: { b: NonNullable<ContinutPaginaSecuritate["criptare"]> }) {
  const [dispozitiv, servere, stocare] = b.flux.noduri;
  const nod = (n: typeof dispozitiv) => (
    <div className={s.fluxNod}>
      <span className={s.fluxIconita}>
        <IconitaProdus nume={n.iconita} marime={22} />
      </span>
      <span className={s.fluxEticheta}>{n.eticheta}</span>
      {n.sub ? <span className={s.fluxSub}>{n.sub}</span> : null}
    </div>
  );
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-03">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-03" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <div className={s.card + " " + s.flux}>
          {nod(dispozitiv)}
          <Legatura text={b.flux.legaturi[0]} iconita="lacat" clasa={s.fluxLegatura} />
          {nod(servere)}
          <Legatura text={b.flux.legaturi[1]} iconita="lacat" clasa={s.fluxLegatura} />
          {nod(stocare)}
        </div>
        <ul className={s.lista + " " + s.carduri3}>
          {b.carduri.map((c) => (
            <li key={c.eticheta} className={s.card + " " + s.cardSimplu}>
              <span className={s.eticheta}>{c.eticheta}</span>
              <h3 className={s.cardTitlu}>{nerupt(c.titlu)}</h3>
              <p className={s.cardText}>{nerupt(c.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CelulaDrept({ drept, text }: { drept: DreptMatrice; text: string }) {
  if (drept === "da") {
    return (
      <span className={s.drDa}>
        <Check width={16} height={16} strokeWidth={3} aria-hidden="true" focusable="false" />
        <span className="doar-cititor">{text}</span>
      </span>
    );
  }
  if (drept === "limitat") return <span className={s.drLimitat}>{text}</span>;
  return (
    <>
      <span className={s.drNu} aria-hidden="true" />
      <span className="doar-cititor">{text}</span>
    </>
  );
}

function ListaControale({ elemente }: { elemente: { titlu: string; text: string }[] }) {
  return (
    <ul className={s.controale}>
      {elemente.map((c) => (
        <li key={c.titlu} className={s.card + " " + s.control}>
          <h3 className={s.controlTitlu}>{nerupt(c.titlu)}</h3>
          <p className={s.cardText}>{nerupt(c.text)}</p>
        </li>
      ))}
    </ul>
  );
}

function Acces({ b }: { b: NonNullable<ContinutPaginaSecuritate["acces"]> }) {
  const m = b.matrice;
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-04">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-04" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <div className={s.matriceInvelis} role="region" aria-label={m.titlu} tabIndex={0}>
          <table className={s.matrice}>
            <caption className="doar-cititor">{m.titlu}</caption>
            <thead>
              <tr>
                <th scope="col" className={s.matriceRol}>
                  {m.capRol}
                </th>
                {m.drepturi.map((d) => (
                  <th key={d} scope="col">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.roluri.map((r) => (
                <tr key={r.nume}>
                  <th scope="row">
                    <span className={s.rolNume}>{r.nume}</span>
                    <span className={s.rolDescriere}>{r.descriere}</span>
                  </th>
                  {r.valori.map((v, i) => (
                    <td key={m.drepturi[i]}>
                      <CelulaDrept drept={v} text={m.texte[v]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={s.matriceNota}>{nerupt(m.nota)}</p>
        </div>
        <ListaControale elemente={b.controale} />
      </div>
    </section>
  );
}

function Ciclu({ b }: { b: NonNullable<ContinutPaginaSecuritate["ciclu"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-05">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-05" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <ol className={s.card + " " + s.cronologie}>
          {b.pasi.map((p) => (
            <li key={p.numar} className={s.cronologiePas}>
              <span className={s.cronologieCerc} data-numar={p.numar} aria-hidden="true" />
              <div className={s.cronologieContinut}>
                <span className={s.cronologieIconita}>
                  <IconitaProdus nume={p.iconita} marime={18} />
                </span>
                <h3 className={s.cronologieTitlu}>{nerupt(p.titlu)}</h3>
                <p className={s.cronologieText}>{nerupt(p.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Reglementare({ b }: { b: NonNullable<ContinutPaginaSecuritate["reglementare"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-06">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-06" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <ul className={s.insigne}>
          {b.insigne.map((x) => (
            <li key={x.marca} className={s.card + " " + s.insigna}>
              <span className={s.insignaMarca}>{x.marca}</span>
              <span className={s.insignaNume}>{x.nume}</span>
              <span className={s.insignaNota}>{x.nota}</span>
            </li>
          ))}
        </ul>
        <ul className={s.lista + " " + s.carduri2}>
          {b.carduri.map((c) => (
            <li key={c.titlu} className={s.card + " " + s.cardSimplu}>
              <h3 className={s.cardTitlu}>{nerupt(c.titlu)}</h3>
              <p className={s.cardText}>{nerupt(c.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Originale({ b }: { b: NonNullable<ContinutPaginaSecuritate["originale"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-07">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-07" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <ListaControale elemente={b.controale} />
      </div>
    </section>
  );
}

function Raportare({ b }: { b: NonNullable<ContinutPaginaSecuritate["raportare"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-08">
      <div className="container-site">
        <div className={s.card + " " + s.raportare}>
          <div>
            <span className={s.raportareNumar} data-numar="08" aria-hidden="true" />
            <h2 id="securitate-bloc-08" className={s.raportareTitlu}>
              {nerupt(b.titlu)}
            </h2>
            <p className={s.raportareText}>{nerupt(b.text)}</p>
            <ul className={s.raportareLista}>
              {b.lista.map((x) => (
                <li key={x}>{nerupt(x)}</li>
              ))}
            </ul>
          </div>
          <div className={s.raportareActiune}>
            <Buton varianta="plin" legatura={b.buton}>
              {b.buton.text}
            </Buton>
            <p className={s.raportareNota}>{nerupt(b.nota)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intrebari({ q }: { q: NonNullable<ContinutPaginaSecuritate["intrebari"]> }) {
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-intrebari">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-intrebari" numar={q.numar} titlu={q.titlu} centrat />
        <Acordeon varianta="securitate" elemente={q.intrebari} />
      </div>
    </section>
  );
}

export type PaginaSecuritateProps = {
  continut?: ContinutPaginaSecuritate;
  /** Sectiunile de randat; ordinea ramane cea a componentei. Lipsa = toate. */
  sectiuni?: readonly SectiuneSecuritate[];
  /** Insula verificarii din browser, pe editie; lipsa = invelitoarea RO. */
  verificare?: ReactNode;
  /** Numele accesibil al sectiunii de verificare; lipsa = implicitul RO. */
  etichetaVerificare?: string;
  /** Eticheta accesibila a firului, in limba editiei; lipsa = implicitul RO. */
  etichetaFir?: string;
};

export default function PaginaSecuritate({
  continut = CONTINUT_RO,
  sectiuni,
  verificare,
  etichetaVerificare = "Verificarea conexiunii din browser",
  etichetaFir,
}: PaginaSecuritateProps) {
  const c = continut;
  const are = (k: SectiuneSecuritate) => sectiuni === undefined || sectiuni.includes(k);
  return (
    <>
      {are("erou") ? (
        <EroulInterior
          fir={c.fir}
          titlu={c.erou.titlu}
          subtitlu={c.erou.subtitlu}
          {...(etichetaFir !== undefined ? { etichetaFir } : {})}
        />
      ) : null}
      {are("piloni") ? <Piloni p={ceruta(c.piloni, "piloni")} /> : null}
      {are("infrastructura") ? <Infrastructura b={ceruta(c.infrastructura, "infrastructura")} /> : null}
      {are("verificare") ? <Verificare eticheta={etichetaVerificare} insula={verificare ?? <VerificareBrowser />} /> : null}
      {are("stocareProprie") ? <StocareProprie b={ceruta(c.stocareProprie, "stocareProprie")} /> : null}
      {are("criptare") ? <Criptare b={ceruta(c.criptare, "criptare")} /> : null}
      {are("acces") ? <Acces b={ceruta(c.acces, "acces")} /> : null}
      {are("ciclu") ? <Ciclu b={ceruta(c.ciclu, "ciclu")} /> : null}
      {are("reglementare") ? <Reglementare b={ceruta(c.reglementare, "reglementare")} /> : null}
      {are("originale") ? <Originale b={ceruta(c.originale, "originale")} /> : null}
      {are("raportare") ? <Raportare b={ceruta(c.raportare, "raportare")} /> : null}
      {are("intrebari") ? <Intrebari q={ceruta(c.intrebari, "intrebari")} /> : null}
      {are("seif") ? <Seif /> : null}
    </>
  );
}
