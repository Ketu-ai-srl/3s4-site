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

import { Check, Link as IconitaLegatura, Lock } from "lucide-react";
import Acordeon from "@/components/primitive/Acordeon";
import Buton from "@/components/primitive/Buton";
import EroulInterior from "@/components/primitive/EroulInterior";
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
import { CapNumeratSecuritate } from "./Capete";
import HartaEuropa from "./HartaEuropa";
import IconitaProdus from "./IconitaProdus";
import Seif from "./Seif";
import VerificareBrowser from "./VerificareBrowser";
import { nerupt } from "./nerupt";
import s from "./securitate.module.css";

function Piloni() {
  return (
    <section className={s.piloni} aria-labelledby="securitate-piloni">
      <div className="container-site">
        <h2 id="securitate-piloni" className="doar-cititor">
          {TITLU_PILONI_SECURITATE}
        </h2>
        <ul className={s.lista + " " + s.piloniGrila}>
          {PILONI_SECURITATE.map((p) => (
            <li key={p.titlu} className={s.card + " " + s.pilon}>
              <span className={s.pilonIconita}>
                <IconitaProdus nume={p.iconita} marime={22} />
              </span>
              <h3 className={s.cardTitlu + " " + s.pilonTitlu}>{nerupt(p.titlu)}</h3>
              <p className={s.cardText}>{nerupt(p.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Infrastructura() {
  const b = BLOC_INFRASTRUCTURA;
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-01">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-01" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <HartaEuropa />
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

function Verificare() {
  return (
    <section className={s.verificare} aria-label="Verificarea conexiunii din browser">
      <div className="container-site">
        <VerificareBrowser />
      </div>
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

function StocareProprie() {
  const b = BLOC_STOCARE_PROPRIE;
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
            <Buton varianta="plin" legatura={b.buton}>
              {b.buton.text}
            </Buton>
            <p className={s.notaMica}>{nerupt(b.nota)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Criptare() {
  const b = BLOC_CRIPTARE;
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

function Acces() {
  const b = BLOC_ACCES;
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

function Ciclu() {
  const b = BLOC_CICLU;
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

function Reglementare() {
  const b = BLOC_REGLEMENTARE;
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

function Originale() {
  const b = BLOC_ORIGINALE;
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-bloc-07">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-bloc-07" numar={b.numar} titlu={b.titlu} subtitlu={b.subtitlu} />
        <ListaControale elemente={b.controale} />
      </div>
    </section>
  );
}

function Raportare() {
  const b = BLOC_RAPORTARE;
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

function Intrebari() {
  const q = INTREBARI_SECURITATE;
  return (
    <section className="sectiune-standard" aria-labelledby="securitate-intrebari">
      <div className="container-site">
        <CapNumeratSecuritate id="securitate-intrebari" numar={q.numar} titlu={q.titlu} centrat />
        <Acordeon varianta="securitate" elemente={q.intrebari} />
      </div>
    </section>
  );
}

export default function PaginaSecuritate() {
  return (
    <>
      <EroulInterior fir={FIR_SECURITATE} titlu={EROU_SECURITATE.titlu} subtitlu={EROU_SECURITATE.subtitlu} />
      <Piloni />
      <Infrastructura />
      <Verificare />
      <StocareProprie />
      <Criptare />
      <Acces />
      <Ciclu />
      <Reglementare />
      <Originale />
      <Raportare />
      <Intrebari />
      <Seif />
    </>
  );
}
