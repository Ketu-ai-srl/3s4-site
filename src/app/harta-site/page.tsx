// /harta-site - harta site-ului pentru oameni (sablonul ingust B; fisa harta-site.md): antet pe blocul
// de 880, apoi grila automata de grupe pe 1100. Se publica oricare ar fi operatorul: nu prelucreaza
// date (plan §9).
//
// Lista se GENEREAZA la construire din rutele din `RUTE` care intra in harta si din registrul
// blogului (`src/content/juridic/harta.ts`); nimic nu e scris de mana, deci o pagina noua apare aici
// singura, iar una scoasa dispare. Proba: tests/juridic.test.ts si tests/browser/juridic.spec.ts cer
// ca multimea legaturilor de aici sa fie exact multimea rutelor si a articolelor.

import s from "@/components/juridic/juridic.module.css";
import FirPagina from "@/components/primitive/FirPagina";
import Tinta from "@/components/primitive/Tinta";
import { metadataPagina } from "@/components/seo/metadata";
import { ARTICOLE } from "@/content/blog/registru";
import { grupeHarta } from "@/content/juridic/harta";
import { HARTA_PAGINA, META_HARTA } from "@/content/juridic/pagini";
import { rutePentruHarta } from "@/content/rute";

const CALE = "/harta-site";

export const metadata = metadataPagina({ ...META_HARTA, cale: CALE });

export default function PaginaHartaSite() {
  const grupe = grupeHarta(rutePentruHarta(), ARTICOLE);
  return (
    <main className={s.zonaIngusta}>
      <div className="container-site">
        <div className={s.bloc}>
          <FirPagina
            niveluri={[
              { text: "Acasă", cale: "/" },
              { text: HARTA_PAGINA.titlu, cale: CALE },
            ]}
          />
          <header>
            <h1 className={"t-h1-interior " + s.titluIngust}>{HARTA_PAGINA.titlu}</h1>
            <p className={s.subtitlu}>{HARTA_PAGINA.subtitlu}</p>
          </header>
        </div>
        <div className={s.grilaHarta} data-harta-grupe="">
          {grupe.map((g) => (
            <section key={g.titlu} data-grupa={g.titlu}>
              <h2 className={s.grupaTitlu}>{g.titlu}</h2>
              <ul className={s.grupaLista}>
                {g.legaturi.map((l) => (
                  <li key={l.cale} className={s.grupaElement}>
                    <Tinta legatura={{ text: l.text, href: l.cale, ruta: l.cale }} className={s.grupaLegatura}>
                      {l.text}
                    </Tinta>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
