// Pagina platformei, editia `en` (P02, `/platform`): textul din `src/content/en/platform.ts`, randat prin `CorpPagina`.
//
// Canalele: butonul WhatsApp poarta textul precompletat al paginii (codul `ref` al paginii, din modul), legatura de
// e-mail apare numai cand domeniul are adresa (`CANALE.email`, P-40), iar microtextul e cel al deciziei 3. Fara
// formular. Organizatia si site-ul in JSON-LD le pune layout-ul; pagina adauga nodurile ei.

import type { Metadata } from "next";
import ButonWhatsApp from "@/components/canale/ButonWhatsApp";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import CorpPagina from "@/components/continut/CorpPagina";
import TextInLinie from "@/components/juridic/TextInLinie";
import s from "@/components/juridic/juridic.module.css";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { CANALE, legaturaWhatsApp } from "@/content/canale";
import { final, pagina } from "@/content/en/platform";
import { INAINTE_DE_EMAIL, MICROTEXT } from "@/content/en/home";
import { alegePeCale, type LegaturaPeCale } from "@/content/navigatie";
import { ETICHETA_WHATSAPP_EN, navigatieEn } from "@/content/navigatie-en";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

function Canal({ whatsapp, email }: { whatsapp: LegaturaPeCale | null; email: LegaturaPeCale | null }) {
  return (
    <div data-canal-pagina="">
      <p>
        <ButonWhatsApp legatura={whatsapp} text={ETICHETA_WHATSAPP_EN} />
      </p>
      <p>{MICROTEXT}</p>
      {email === null ? null : (
        <p>
          {INAINTE_DE_EMAIL}
          <LegaturaCanal legatura={email} canal="email">
            {CANALE.email}
          </LegaturaCanal>
        </p>
      )}
    </div>
  );
}

export default function PaginaPlatformaEn() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp = href === null ? null : { implicit: href, pagini: [] };
  const posta = navigatieEn().subsol.contact?.email?.legatura ?? null;
  const hrefEmail = posta === null ? null : alegePeCale(posta, pagina.meta.cale);
  const email = hrefEmail === null ? null : { implicit: hrefEmail, pagini: [] };

  return (
    <main className={s.zonaIngusta}>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": pagina.jsonLd as NodJsonLd[] }} />
      <div className="container-site">
        <div className={s.bloc}>
          <CorpPagina
            pagina={pagina}
            dupaCapsula={<Canal whatsapp={whatsapp} email={email} />}
            final={
              <section aria-labelledby="cta-final-titlu" data-cta-final="">
                <h2 id="cta-final-titlu">{pagina.cta.titluBloc}</h2>
                <p>
                  <TextInLinie text={final.text} />
                </p>
                <Canal whatsapp={whatsapp} email={email} />
                {final.dupa.map((rand) => (
                  <p key={rand}>
                    <TextInLinie text={rand} />
                  </p>
                ))}
              </section>
            }
          />
        </div>
      </div>
    </main>
  );
}
