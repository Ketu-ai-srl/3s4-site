import PaginaContact from "@/components/conversie/PaginaContact";
import SectiuneFormular from "@/components/formular/SectiuneFormular";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import { metadataPagina } from "@/components/seo/metadata";
import { ANCORA_FORMULAR_CONTACT, CALE_CONTACT, CONTACT, META_CONTACT } from "@/content/conversie";

// Pagina /contact (felia conversie; contact.md, sablonul interior-880). Corpul e in `PaginaContact`,
// formularul e piesa inghetata a feliei enterprise-formular (`SectiuneFormular`, cu comutatorul
// operatorului), iar CTA-ul final e cel comun. `BreadcrumbList` il pune `FirPagina`; pagina nu are
// intrebari frecvente, deci nici `FAQPage`.

export const metadata = metadataPagina({
  titlu: META_CONTACT.titlu,
  descriere: META_CONTACT.descriere,
  cale: CALE_CONTACT,
});

export default function Contact() {
  const f = CONTACT.formular;
  return (
    <main>
      <PaginaContact />
      <SectiuneFormular
        formular="contact"
        id={ANCORA_FORMULAR_CONTACT}
        eticheta={f.eticheta}
        titlu={f.titlu}
        subtitlu={f.subtitlu}
        exempluMesaj={f.exempluMesaj}
        subiect={f.subiect}
      />
      <CtaFinalInchis />
    </main>
  );
}
