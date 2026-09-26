// Pagina unui articol, `/blog/<slug>` (sablonul blog-articol, blog__articol-sablon.md): bara de
// progres; coloana de 720 cu firul pe 3 niveluri (titlul intreg ca nivel curent), h1, sapoul si randul
// meta (data, echipa, minutele); coperta; caseta de fapte (cand antetul are fapte); corpul in `Proza`;
// sursele din antet (adaos 3S: la referinta sursele nu se arata); caseta CTA de 720; trei articole
// inrudite pe toata latimea containerului.

import FirPagina from "@/components/primitive/FirPagina";
import Iconita from "@/components/primitive/Iconita";
import Buton from "@/components/primitive/Buton";
import Tinta from "@/components/primitive/Tinta";
import JsonLd from "@/components/seo/JsonLd";
import type { ArticolComplet } from "@/content/blog/conducta";
import { CALE_BLOG, caleArticol } from "@/content/blog/registru";
import { ARTICOL, CATEGORII, LISTARE } from "@/content/blog/texte";
import BaraProgres from "./BaraProgres";
import CardArticol from "./CardArticol";
import Coperta from "./Coperta";
import CorpArticol, { InlineArticol } from "./CorpArticol";
import { dateCard } from "./carduri";
import { grafArticol } from "./date-structurate";
import { alegeInrudite, dataRo, minuteText } from "./format";
import s from "./blog.module.css";

/** Id-ul corpului: tinta barei de progres. */
const ID_CORP = "corp-articol";

/** Gazda unei surse, afisata langa ea: cititorul vede unde duce legatura inainte sa apese. */
function gazda(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function PaginaArticol({ articol, toate }: { articol: ArticolComplet; toate: readonly ArticolComplet[] }) {
  const info = CATEGORII[articol.categorie];
  const inrudite = alegeInrudite(toate.map(dateCard), articol);
  const cta = articol.corp.cta;
  return (
    <main className={s.paginaArticol}>
      <BaraProgres tinta={ID_CORP} />
      <article className={s.articol}>
        <div className="container-site">
          <div className={s.coloana}>
            <FirPagina
              niveluri={[
                { text: "Acasă", cale: "/" },
                { text: LISTARE.fir, cale: CALE_BLOG },
                { text: articol.titlu, cale: caleArticol(articol) },
              ]}
            />
            <h1 className={"t-h1-articol " + s.titluArticol}>{articol.titlu}</h1>
            <p className={s.sapou}>{articol.extras}</p>
            <ul className={s.meta}>
              <li>
                <time dateTime={articol.dataPublicarii}>{dataRo(articol.dataPublicarii)}</time>
              </li>
              <li>{ARTICOL.autor}</li>
              <li>{minuteText(articol.minute)}</li>
            </ul>
            <div className={s.coperta}>
              <Coperta titlu={articol.titlu} categorie={articol.categorie} slug={articol.slug} data={articol.dataPublicarii} />
            </div>

            {articol.casetaFapte.length > 0 ? (
              <section className={s.fapte} aria-labelledby="fapte-titlu">
                <p id="fapte-titlu" className={s.fapteTitlu}>
                  {ARTICOL.fapte}
                </p>
                <ul className={s.fapteLista}>
                  {articol.casetaFapte.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div id={ID_CORP} className={s.corp}>
              <CorpArticol corp={articol.corp} />
            </div>

            <section className={s.surse} aria-labelledby="surse-titlu">
              <h2 id="surse-titlu" className={s.surseTitlu}>
                {ARTICOL.surse}
              </h2>
              <ol className={s.surseLista}>
                {articol.surse.map((sursa, i) => (
                  <li key={i}>
                    <a href={sursa.url} rel="noopener" className={s.sursaLegatura}>
                      {sursa.ceSustine}
                    </a>{" "}
                    <span className={s.sursaGazda}>({gazda(sursa.url)})</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </article>

      <div className="container-site">
        <section className={s.cta} aria-labelledby="cta-titlu">
          <p className={s.ctaSupratitlu}>{ARTICOL.cta.supratitlu}</p>
          <h2 id="cta-titlu" className={s.ctaTitlu}>
            {ARTICOL.cta.titlu}
          </h2>
          {cta !== null && cta.length > 0 ? (
            cta.map((p, i) => (
              <p key={i} className={s.ctaText}>
                <InlineArticol copii={p} />
              </p>
            ))
          ) : (
            <p className={s.ctaText}>{ARTICOL.cta.text}</p>
          )}
          <div className={s.ctaActiuni}>
            <Buton varianta="plin" marime="plat" legatura={ARTICOL.cta.buton}>
              {ARTICOL.cta.buton.text}
            </Buton>
            <Tinta legatura={info.legaturaCta} className={s.ctaSecundara}>
              <span>{info.legaturaCta.text}</span>
              <Iconita nume="arrow-right" marime={14} contur={2} />
            </Tinta>
          </div>
        </section>
      </div>

      {inrudite.length > 0 ? (
        <section className={s.inrudite} aria-labelledby="inrudite-titlu">
          <div className="container-site">
            <h2 id="inrudite-titlu" className={"t-h2-bloc " + s.inruditeTitlu}>
              {ARTICOL.inrudite}
            </h2>
            <div className={s.grilaInrudite}>
              {inrudite.map((a) => (
                <CardArticol key={a.slug} articol={a} varianta="inrudit" nivel="h3" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd date={grafArticol(articol, info.nume)} />
    </main>
  );
}
