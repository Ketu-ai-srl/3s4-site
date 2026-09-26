import PaginaInregistrare from "@/components/conversie/PaginaInregistrare";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_INREGISTRARE, META_INREGISTRARE } from "@/content/conversie";

// Pagina /inregistrare (felia conversie; inregistrare.md, sablonul autentificare-centrata). Tinta
// butonului plin de pe fiecare pagina si a tuturor tintelor externe ale referintei (plan D4c).
// Trimiterea e INACTIVA cat timp `config/operator.json` e null (plan §9), cu mesajul cinstit langa
// buton; in ziua operatorului pleaca la `/api/formular`, fara parola. `BreadcrumbList` il pune
// `FirPagina`.

export const metadata = metadataPagina({
  titlu: META_INREGISTRARE.titlu,
  descriere: META_INREGISTRARE.descriere,
  cale: CALE_INREGISTRARE,
});

export default function Inregistrare() {
  return (
    <main>
      <PaginaInregistrare />
    </main>
  );
}
