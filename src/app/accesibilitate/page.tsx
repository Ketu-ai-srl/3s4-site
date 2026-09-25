// /accesibilitate - declaratia de accesibilitate (sablonul ingust B; fisa accesibilitate.md): bloc de
// 880, titlu, data, apoi sectiuni cu titlu de bloc, paragrafe de cel mult 720 si liste. Se publica
// oricare ar fi operatorul: nu prelucreaza date (plan §9).
//
// Doua abateri de la randarea referintei, amandoua numite acolo ca defecte (juridic__sablon.md §12
// punctul 9): linia cu data are forma intentionata (14 px, 48 px pana la prima sectiune), iar listele
// au marcatorul gri al prozei. Declaratia spune numai ce e masurat sau vizibil in cod; adresa pentru
// semnalari apare numai confirmata, din `config/brand.json` (`adresaMarcii`).

import s from "@/components/juridic/juridic.module.css";
import TextInLinie from "@/components/juridic/TextInLinie";
import FirPagina from "@/components/primitive/FirPagina";
import { metadataPagina } from "@/components/seo/metadata";
import { adresaMarcii } from "@/content/entitate";
import { DATA_DECLARATIE, META_ACCESIBILITATE, declaratieAccesibilitate } from "@/content/juridic/pagini";
import { adresaSite } from "@/lib/site";

const CALE = "/accesibilitate";

export const metadata = metadataPagina({ ...META_ACCESIBILITATE, cale: CALE });

export default function PaginaAccesibilitate() {
  const d = declaratieAccesibilitate(new URL(adresaSite()).host, adresaMarcii());
  return (
    <main className={s.zonaIngusta}>
      <div className="container-site">
        <div className={s.bloc}>
          <FirPagina
            niveluri={[
              { text: "Acasă", cale: "/" },
              { text: d.titlu, cale: CALE },
            ]}
          />
          <header>
            <h1 className={"t-h1-interior " + s.titluDeclaratie}>{d.titlu}</h1>
            <div className={s.dataDeclaratie}>
              <time dateTime={DATA_DECLARATIE}>{d.data}</time>
            </div>
          </header>
          {d.sectiuni.map((sectiune) => (
            <section key={sectiune.id} className={s.sectiuneDeclaratie} data-declaratie={sectiune.id}>
              <h2 className={"t-h2-bloc " + s.titluSectiune}>{sectiune.titlu}</h2>
              {sectiune.paragrafe.map((p, i) => (
                <p key={i} className={s.paragrafDeclaratie}>
                  <TextInLinie text={p} clasaLegatura={s.legaturaDeclaratie} />
                </p>
              ))}
              {sectiune.lista ? (
                <ul className={s.listaDeclaratie}>
                  {sectiune.lista.map((e, i) => (
                    <li key={i}>
                      <TextInLinie text={e} clasaLegatura={s.legaturaDeclaratie} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {(sectiune.dupa ?? []).map((p, i) => (
                <p key={"d" + i} className={s.paragrafDeclaratie}>
                  <TextInLinie text={p} clasaLegatura={s.legaturaDeclaratie} />
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
