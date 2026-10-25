// Sectiunile paginii "Arhiva e-Factura" (`/ro/e-factura` pe 3s.md, `/e-factura` pe 3s.com.ro), dupa eroul pe care il
// pune pagina. FARA DESIGN NOU: aceleasi clase ca sectiunile paginii /e-facturare (`efacturare.module.css`: blocul,
// coloana de 880, cutia gri, cardurile cu cerc numerotat sau cu iconita, bataile) si aceleasi primitive (`CapBloc`,
// `TabelDate`, acordeonul `e-facturare`). Componentele nu scriu niciun cuvant al lor: tot textul vine din contract
// (`src/content/ro-md/e-factura-componente.ts`).
//
// Nodul FAQPage il pune sectiunea intrebarilor, din intrebarile VIZIBILE, ca pe /e-facturare.

import type { ReactNode } from "react";
import Acordeon from "@/components/primitive/Acordeon";
import CapBloc from "@/components/primitive/CapBloc";
import LegaturaInText from "@/components/primitive/LegaturaInText";
import Pastila from "@/components/primitive/Pastila";
import Iconita from "@/components/primitive/Iconita";
import TabelDate from "@/components/primitive/TabelDate";
import JsonLd from "@/components/seo/JsonLd";
import { iduri } from "@/components/seo/date-structurate";
import type { BLOC_PRETURI_EFACTURA_RO_MD, ContinutArhivaEfactura, FrazaAccent } from "@/content/ro-md/e-factura-componente";
import { adresaSite } from "@/lib/site";
import s from "./efacturare.module.css";

type CuContinut = { continut: ContinutArhivaEfactura };

/** Inceputul ingrosat si restul frazei, lipite exact cum le scrie contractul (restul isi poarta spatiul sau virgula). */
function Fraza({ f }: { f: FrazaAccent }): ReactNode {
  return (
    <>
      <strong>{f.accent}</strong>
      {f.rest}
    </>
  );
}

/** §1 De ce nu ajunge SPV-ul: cutia gri, titlul si doua paragrafe. */
export function FereastraSpv({ continut }: CuContinut) {
  const f = continut.fereastra;
  return (
    <section className={s.bloc} aria-labelledby="ef-fereastra">
      <div className="container-site">
        <div className={[s.coloana, s.cutie].join(" ")}>
          <h2 id="ef-fereastra" className={"t-h2-bloc " + s.cutieTitlu}>
            {f.titlu}
          </h2>
          {f.paragrafe.map((p, i) => (
            <p key={p.slice(0, 24)} className={s.cutieText} style={i > 0 ? { marginTop: 12 } : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/** §2 Cum functioneaza: trei carduri cu cerc numerotat (forma pasilor de pe /e-facturare) si nota de sub ele. */
export function PasiEfactura({ continut }: CuContinut) {
  const p = continut.pasi;
  return (
    <section className={s.bloc} aria-labelledby="ef-pasi">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="ef-pasi" titlu={p.titlu} />
        </div>
        <ol className={[s.lat, s.grila3].join(" ")} style={{ listStyle: "none", padding: 0, margin: "0 auto" }}>
          {p.pasi.map((x, i) => (
            <li key={x.accent} className={s.card}>
              <span className={s.cardCerc} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={s.cardTitlu}>{x.accent}</h3>
              <p className={s.cardText}>{x.rest}</p>
            </li>
          ))}
        </ol>
        <p className={[s.nota, s.legaturaCentru].join(" ")}>{p.nota}</p>
      </div>
    </section>
  );
}

/** §3 Ce primesti: carduri cu iconita, fiecare cu fraza intreaga (inceputul ingrosat). */
export function PrimestiEfactura({ continut }: CuContinut) {
  const p = continut.primesti;
  return (
    <section className={s.bloc} aria-labelledby="ef-primesti">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="ef-primesti" titlu={p.titlu} />
        </div>
        <ul className={[s.lat, s.grila3].join(" ")} style={{ listStyle: "none", padding: 0, margin: "0 auto" }}>
          {p.elemente.map((e) => (
            <li key={e.accent} className={s.card}>
              <span className={s.cardIconita}>
                <Iconita nume={e.iconita} marime={20} contur={2} />
              </span>
              <p className={s.cardText}>
                <Fraza f={e} />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** §4 Pentru contabili: cutia gri, titlul si paragraful. */
export function ContabiliEfactura({ continut }: CuContinut) {
  const c = continut.contabili;
  return (
    <section className={s.bloc} aria-labelledby="ef-contabili">
      <div className="container-site">
        <div className={[s.coloana, s.cutie].join(" ")}>
          <h2 id="ef-contabili" className={"t-h2-bloc " + s.cutieTitlu}>
            {c.titlu}
          </h2>
          <p className={s.cutieText}>{c.text}</p>
        </div>
      </div>
    </section>
  );
}

/** §5 Locul datelor: lista in batai, ca mandatele de pe /e-facturare. */
export function LoculDatelorEfactura({ continut }: CuContinut) {
  const l = continut.siguranta;
  return (
    <section className={s.bloc} aria-labelledby="ef-locul-datelor">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="ef-locul-datelor" titlu={l.titlu} />
          <ul className={s.batai}>
            {l.elemente.map((e) => (
              <li key={e.slice(0, 24)} className={s.bataie}>
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** §6 Preturile: tabelul de date cu antet si nota de sub el. */
export function PreturiEfactura({ continut }: CuContinut) {
  const p = continut.preturi;
  return (
    <section className={s.bloc} aria-labelledby="ef-preturi" id="preturi">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="ef-preturi" titlu={p.titlu} />
          <TabelDate
            forma="cu-antet"
            titlu={p.titlu}
            antet={[...p.capete]}
            // Suma si moneda raman pe acelasi rand (spatiu nedespartitor la randare, ca pe pagina de preturi); "/ an" se poate rupe.
            randuri={p.randuri.map((r) => [<strong key="p">{r.pachet}</strong>, r.include, r.pret.replace(" ", "\u00a0")])}
          />
          <p className={s.nota}>{p.nota}</p>
        </div>
      </div>
    </section>
  );
}

/** Datele structurate ale intrebarilor: exact intrebarile si raspunsurile vizibile. */
export function grafIntrebariEfactura(continut: ContinutArhivaEfactura, cale: string, limba: string, baza: string = adresaSite()) {
  const q = continut.intrebari;
  return {
    "@context": "https://schema.org" as const,
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": baza + cale + "#intrebari-e-factura",
        url: baza + cale,
        name: q.titlu,
        inLanguage: limba,
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

/** §7 Intrebarile frecvente, cu FAQPage. */
export function IntrebariArhivaEfactura({ continut, cale, limba }: CuContinut & { cale: string; limba: string }) {
  const q = continut.intrebari;
  return (
    <section className={s.bloc} aria-labelledby="ef-intrebari" id="intrebari-e-factura">
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc id="ef-intrebari" titlu={q.titlu} />
          <Acordeon
            varianta="e-facturare"
            elemente={q.intrebari.map((i) => ({
              intrebare: i.intrebare,
              raspuns: <p>{i.raspuns}</p>,
            }))}
          />
        </div>
      </div>
      <JsonLd date={grafIntrebariEfactura(continut, cale, limba)} />
    </section>
  );
}

/**
 * Blocul "Arhiva e-Factura" de pe pagina de preturi /ro (langa abonamente): pastila de acces timpuriu, capul de bloc,
 * acelasi tabel ca §6 al paginii serviciului, nota si legatura spre pagina. Elementul radacina poarta
 * `data-preturi-efactura`, campul pe care il numara lista de congruenta a perechii (`config/congruenta/p08-ro.json`).
 */
export function BlocPreturiEfactura({ continut }: { continut: typeof BLOC_PRETURI_EFACTURA_RO_MD }) {
  const c = continut;
  return (
    // `div` cu rol de regiune, nu `section`: blocul e o parte a lumii pachetelor, langa grila, nu o sectiune noua a paginii.
    // Proba de congruenta numara radacinile `section` din `<main>` si nu admite una adaugata; blocul se declara acolo ca
    // element nou (campul `[data-preturi-efactura]`, cu clasele lui), in lista P08-RO.
    <div role="region" className={s.bloc} aria-labelledby="ef-bloc-preturi" id="e-factura" data-preturi-efactura="">
      <div className="container-site">
        <div className={s.coloana}>
          <div style={{ marginBottom: 12 }}>
            <Pastila varianta="categorie">{c.eticheta}</Pastila>
          </div>
          <CapBloc id="ef-bloc-preturi" titlu={c.titlu} text={c.text} />
          <TabelDate
            forma="cu-antet"
            titlu={c.titlu}
            antet={[...c.capete]}
            randuri={c.randuri.map((r) => [<strong key="p">{r.pachet}</strong>, r.include, r.pret.replace(" ", "\u00a0")])}
          />
          <p className={s.nota}>{c.nota}</p>
          <p className={s.legaturaCentru} style={{ textAlign: "left", marginTop: 16 }}>
            <LegaturaInText legatura={c.legatura} />
          </p>
        </div>
      </div>
    </div>
  );
}
