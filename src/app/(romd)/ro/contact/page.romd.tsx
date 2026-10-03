// Pagina de contact a editiei `ro-MD` (`/ro/contact` pe 3s.md): textul din `src/content/ro-md/contact.ts`, randat
// prin `CorpPagina`, ca pagina de contact EN (`src/app/(en)/contact/page.en.tsx`). Fara formular (decizia 3): cele
// trei carduri de canal sunt actiunea paginii, imediat sub capsula, in sectiunea "Prin ce canale pot contacta 3S?".
//
// Cardurile urmeaza canalele domeniului (`CANALE_JSON`): WhatsApp cu textul precompletat al paginii
// (`[ref:ro-md-contact]`, din modul), e-mailul numai cand domeniul are adresa (P-40), telefonul ca text pe desktop si
// ca legatura `tel:` pe mobil. Un canal gol nu lasa card. Microtextul sta sub carduri, ca in fisa.

import type { Metadata } from "next";
import AdresaCopiere from "@/components/canale/AdresaCopiere";
import ButonWhatsApp from "@/components/canale/ButonWhatsApp";
import CardCanal from "@/components/canale/CardCanal";
import c from "@/components/canale/Canale.module.css";
import Telefon from "@/components/canale/Telefon";
import CorpPagina from "@/components/continut/CorpPagina";
import TextInLinie from "@/components/juridic/TextInLinie";
import s from "@/components/juridic/juridic.module.css";
import { claseButon } from "@/components/primitive/Buton";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { CANALE, legaturaTelefon, legaturaWhatsApp, numarAfisat } from "@/content/canale";
import { ETICHETA_WHATSAPP_RO_MD } from "@/content/navigatie-ro-md";
import { MICROTEXT } from "@/content/ro-md/acasa";
import { CANALE_PAGINA, DUPA, emailContact, pagina } from "@/content/ro-md/contact";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

export default function PaginaContactRoMd() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp = href === null ? null : { implicit: href, pagini: [] };
  const email = emailContact();
  const tel = legaturaTelefon();
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
                    <p>{numar}</p>
                    <ButonWhatsApp legatura={whatsapp} text={ETICHETA_WHATSAPP_RO_MD} />
                  </CardCanal>
                )}
                {email === null ? null : (
                  <CardCanal titlu={CANALE_PAGINA.email.titlu} descriere={CANALE_PAGINA.email.text}>
                    <AdresaCopiere adresa={CANALE.email} copiaza={CANALE_PAGINA.email.copiaza} copiat={CANALE_PAGINA.email.copiat} />
                    <a href={email} className={claseButon("contur")} data-canal="email">
                      {CANALE_PAGINA.email.buton}
                    </a>
                  </CardCanal>
                )}
                {tel === null ? null : (
                  <CardCanal titlu={CANALE_PAGINA.telefon.titlu} descriere={CANALE_PAGINA.telefon.text}>
                    <Telefon text={numar} href={tel} />
                    <span className={c.doarMobil}>
                      <a href={tel} className={claseButon("contur")} data-canal="telefon">
                        {CANALE_PAGINA.telefon.buton}
                      </a>
                    </span>
                  </CardCanal>
                )}
                <p>{MICROTEXT}</p>
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
