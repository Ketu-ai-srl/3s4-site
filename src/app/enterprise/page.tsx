import BandaDrumDocument from "@/components/enterprise/BandaDrumDocument";
import EroulEnterprise from "@/components/enterprise/EroulEnterprise";
import ListaLivrabile from "@/components/enterprise/ListaLivrabile";
import SectiuneFormular from "@/components/formular/SectiuneFormular";
import { metadataPagina } from "@/components/seo/metadata";
import { ANCORA_FORMULAR, CALE_ENTERPRISE, FORMULAR_ENTERPRISE, META_ENTERPRISE } from "@/content/enterprise";

// Pagina /enterprise (enterprise.md; sablonul interior-880, COMPONENTE §3): eroul cu intoarcere,
// banda inchisa cu drumul unui document, lista de livrabile, formularul de contact. Pagina NU are
// CTA-ul final inchis: formularul tine locul lui (masurat). `BreadcrumbList` il pune `FirPagina`.

export const metadata = metadataPagina({
  titlu: META_ENTERPRISE.titlu,
  descriere: META_ENTERPRISE.descriere,
  cale: CALE_ENTERPRISE,
});

export default function Enterprise() {
  const f = FORMULAR_ENTERPRISE;
  return (
    <main>
      <EroulEnterprise />
      <BandaDrumDocument />
      <ListaLivrabile />
      <SectiuneFormular
        formular="enterprise"
        id={ANCORA_FORMULAR}
        eticheta={f.eticheta}
        titlu={f.titlu}
        subtitlu={f.subtitlu}
        exempluMesaj={f.exempluMesaj}
        subiect={f.subiect}
      />
    </main>
  );
}
