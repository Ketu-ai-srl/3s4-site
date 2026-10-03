// Pagina de contact a editiei `en` (P10, `/contact`): textul din `src/content/en/contact.ts`, randat prin
// `CorpPagina`. Fara formular (decizia 3): cele doua carduri de canal sunt actiunea paginii, imediat sub capsula,
// in sectiunea "How can I reach 3S?".
//
// Cardurile urmeaza canalele domeniului (`CANALE_JSON`): WhatsApp cu textul precompletat al paginii
// (`[ref:en-contact]`, din modul), cu numarul afisat ca numar de WhatsApp, si e-mailul numai cand domeniul are
// adresa (P-40). Un canal gol nu lasa card. Cardul de telefon si legatura de apel au iesit (decizia 56: fara apeluri
// GSM; apelurile se primesc numai pe WhatsApp).

import type { Metadata } from "next";
import AdresaCopiere from "@/components/canale/AdresaCopiere";
import ButonWhatsApp from "@/components/canale/ButonWhatsApp";
import CardCanal from "@/components/canale/CardCanal";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import CorpPagina from "@/components/continut/CorpPagina";
import TextInLinie from "@/components/juridic/TextInLinie";
import s from "@/components/juridic/juridic.module.css";
import { claseButon } from "@/components/primitive/Buton";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { CANALE, legaturaWhatsApp, numarAfisat } from "@/content/canale";
import { CANALE_PAGINA, DUPA, pagina } from "@/content/en/contact";
import { MICROTEXT } from "@/content/en/home";
import { alegePeCale } from "@/content/navigatie";
import { ETICHETA_WHATSAPP_EN, navigatieEn } from "@/content/navigatie-en";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

export default function PaginaContactEn() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp = href === null ? null : { implicit: href, pagini: [] };
  const posta = navigatieEn().subsol.contact?.email?.legatura ?? null;
  const hrefEmail = posta === null ? null : alegePeCale(posta, pagina.meta.cale);
  const email = hrefEmail === null ? null : { implicit: hrefEmail, pagini: [] };
  const numar = numarAfisat();

  return (
    <main className={s.zonaIngusta}>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": pagina.jsonLd as NodJsonLd[] }} />
      <div className="container-site">
        <div className={s.bloc}>
          <CorpPagina
            pagina={pagina}
            dupaCapsula={
              <section aria-labelledby="canale-titlu" data-canale-contact="">
                <h2 id="canale-titlu">{CANALE_PAGINA.titlu}</h2>
                {whatsapp === null ? null : (
                  <CardCanal titlu={CANALE_PAGINA.whatsapp.titlu} descriere={CANALE_PAGINA.whatsapp.text}>
                    <p>{numar + CANALE_PAGINA.whatsapp.dupaNumar}</p>
                    <ButonWhatsApp legatura={whatsapp} text={ETICHETA_WHATSAPP_EN} />
                    <p>{MICROTEXT}</p>
                  </CardCanal>
                )}
                {email === null ? null : (
                  <CardCanal titlu={CANALE_PAGINA.email.titlu} descriere={CANALE_PAGINA.email.text}>
                    <AdresaCopiere adresa={CANALE.email} copiaza={CANALE_PAGINA.email.copiaza} copiat={CANALE_PAGINA.email.copiat} />
                    <LegaturaCanal legatura={email} canal="email" className={claseButon("contur")}>
                      {CANALE_PAGINA.email.buton}
                    </LegaturaCanal>
                  </CardCanal>
                )}
              </section>
            }
            final={DUPA.map((rand) => (
              <p key={rand}>
                <TextInLinie text={rand} />
              </p>
            ))}
          />
        </div>
      </div>
    </main>
  );
}
