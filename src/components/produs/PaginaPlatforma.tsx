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

import { Check } from "lucide-react";
import Acordeon from "@/components/primitive/Acordeon";
import Buton from "@/components/primitive/Buton";
import FirPagina from "@/components/primitive/FirPagina";
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
  MODEL_PLATFORMA,
  PILONI_PLATFORMA,
  PROBLEMA_PLATFORMA,
  SUVERANITATE_PLATFORMA,
} from "@/content/produs/platforma";
import { CapCentrat, CapNumeratPlatforma } from "./Capete";
import IconitaProdus from "./IconitaProdus";
import MachetaStrat from "./MachetaStrat";
import { nerupt } from "./nerupt";
import s from "./platforma.module.css";

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

function Erou() {
  const e = EROU_PLATFORMA;
  return (
    <section className={s.erou} aria-labelledby="platforma-titlu">
      <div className="container-site">
        <div className={s.erouFir}>
          <FirPagina niveluri={FIR_PLATFORMA} />
        </div>
        <div className={s.erouGrila}>
          <div className={s.erouText}>
            <h1 id="platforma-titlu" className={"t-h1-interior " + s.erouTitlu}>
              {e.titlu}
            </h1>
            <p className={"t-subtitlu-interior " + s.erouSubtitlu}>{e.subtitlu}</p>
            <div className={s.erouActiuni}>
              <Buton varianta="plin" marime="plat" sageata legatura={e.butonPrincipal} className={s.erouButon}>
                {e.butonPrincipal.text}
              </Buton>
              <Buton varianta="fantoma" marime="plat" legatura={e.butonSecundar} className={s.erouButon}>
                {e.butonSecundar.text}
              </Buton>
            </div>
          </div>
          <div className={s.erouVizual}>
            <MachetaStrat />
          </div>
        </div>
      </div>
    </section>
  );
}

function Piloni() {
  const p = PILONI_PLATFORMA;
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

function Problema() {
  const p = PROBLEMA_PLATFORMA;
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

function Model() {
  const m = MODEL_PLATFORMA;
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

function BlocDate() {
  const b = BLOC_DATE;
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

function BlocArhiva() {
  const b = BLOC_ARHIVA;
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
        <p className={s.legaturaSubTabel}>
          <LegaturaInText legatura={b.legatura} />
        </p>
      </div>
    </section>
  );
}

function BlocIntrebari() {
  const b = BLOC_INTREBARI;
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

function Comparatie() {
  const c = COMPARATIE_PLATFORMA;
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-comparatie">
      <div className="container-site">
        <CapCentrat id="platforma-comparatie" titlu={c.titlu} subtitlu={c.subtitlu} />
        <div role="table" aria-labelledby="platforma-comparatie" className={s.card + " " + s.comparatie}>
          <div role="row" className={s.comparatieRand + " " + s.comparatieCap}>
            <span role="columnheader">
              <span className="doar-cititor">Criteriu</span>
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
          {nerupt(c.nota)}{" "}
          <LegaturaInText legatura={c.legatura} marime={16.8} className={s.legaturaInNota} />
        </p>
      </div>
    </section>
  );
}

function Suveranitate() {
  const v = SUVERANITATE_PLATFORMA;
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
            <p>
              <LegaturaInText legatura={v.legatura} className={s.legaturaProza} />
            </p>
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

function Apeluri() {
  const a = APELURI_PLATFORMA;
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
          {a.nota}{" "}
          <LegaturaInText legatura={a.legatura} className={s.legaturaInNota} />
        </p>
      </div>
    </section>
  );
}

function Cazuri() {
  const c = CAZURI_PLATFORMA;
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
        <p className={s.legaturaCentrata}>
          <LegaturaInText legatura={c.legatura} />
        </p>
      </div>
    </section>
  );
}

function Conformitate() {
  const c = CONFORMITATE_PLATFORMA;
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
          <ul className={s.insigne} aria-label="Ce poate arăta 3S">
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

function Intrebari() {
  const q = INTREBARI_PLATFORMA;
  return (
    <section className="sectiune-standard" aria-labelledby="platforma-intrebari">
      <div className="container-site">
        <CapCentrat id="platforma-intrebari" titlu={q.titlu} />
        <Acordeon varianta="platforma" elemente={q.intrebari} />
      </div>
    </section>
  );
}

export default function PaginaPlatforma() {
  return (
    <>
      <Erou />
      <Piloni />
      <Problema />
      <Model />
      <BlocDate />
      <BlocArhiva />
      <BlocIntrebari />
      <Comparatie />
      <Suveranitate />
      <Apeluri />
      <Cazuri />
      <Conformitate />
      <Intrebari />
    </>
  );
}
