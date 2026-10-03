// Pagina de start a editiei `ro-MD` (`/ro` pe 3s.md): textul din `src/content/ro-md/acasa.ts`, randat prin
// `CorpPagina`, ca pagina de start EN (`src/app/(en)/page.en.tsx`).
//
// Canalele: butonul WhatsApp poarta textul precompletat al paginii (`[ref:ro-md-acasa]`, din modul), linia de
// e-mail apare numai cand domeniul are adresa (`CANALE.email`, P-40), iar microtextul e cel al deciziei 3. Fara
// formular. Organizatia si site-ul in JSON-LD le pune layout-ul; pagina adauga nodul ei.

import type { Metadata } from "next";
import ButonWhatsApp from "@/components/canale/ButonWhatsApp";
import CorpPagina from "@/components/continut/CorpPagina";
import TextInLinie from "@/components/juridic/TextInLinie";
import s from "@/components/juridic/juridic.module.css";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { CANALE, legaturaWhatsApp } from "@/content/canale";
import { INAINTE_DE_EMAIL, MICROTEXT, emailAcasa, eroSecundar, final, pagina } from "@/content/ro-md/acasa";
import type { LegaturaPeCale } from "@/content/navigatie";
import { ETICHETA_WHATSAPP_RO_MD } from "@/content/navigatie-ro-md";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

function Canal({ whatsapp, email }: { whatsapp: LegaturaPeCale | null; email: string | null }) {
  return (
    <div data-canal-pagina="">
      <p>
        <ButonWhatsApp legatura={whatsapp} text={ETICHETA_WHATSAPP_RO_MD} />
      </p>
      <p>{MICROTEXT}</p>
      {email === null ? null : (
        <p>
          {INAINTE_DE_EMAIL}
          <a href={email} data-canal="email">
            {CANALE.email}
          </a>
        </p>
      )}
    </div>
  );
}

export default function PaginaStartRoMd() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp = href === null ? null : { implicit: href, pagini: [] };
  const email = emailAcasa();

  return (
    <main className={s.zonaIngusta}>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": pagina.jsonLd as NodJsonLd[] }} />
      <div className="container-site">
        <div className={s.bloc}>
          <CorpPagina
            pagina={pagina}
            dupaCapsula={
              <>
                <Canal whatsapp={whatsapp} email={email} />
                <p>
                  <a href={eroSecundar.href}>{eroSecundar.text}</a>
                </p>
              </>
            }
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
