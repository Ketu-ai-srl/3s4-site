// Datele structurate puse de layout: graful comun (organizatia si site-ul) pe fiecare pagina, plus
// graful startului (aplicatia cu pretul si intrebarile frecvente) numai pe `/`.
//
// PE EDITIE: graful comun e al editiei de la radacina domeniului (`ro-RO` pe build-ul romanesc, `en` pe cel
// international). Graful startului e romanesc (pret in RON, intrebarile in romana), deci intra numai pe
// `ro-RO`: pe celelalte nu ajunge nici in `<head>`, nici in datele de hidratare ale paginilor.

import { adresaSite, editiaRadacinii } from "@/lib/site";
import { grafAcasa, grafSite, serializeaza } from "./date-structurate";
import JsonLd from "./JsonLd";
import JsonLdPeCale from "./JsonLdPeCale";

export default function DateStructurateSite() {
  const baza = adresaSite();
  const editie = editiaRadacinii().cod;
  return (
    <>
      <JsonLd date={grafSite(baza, editie)} />
      {editie === "ro-RO" ? <JsonLdPeCale cale="/" json={serializeaza(grafAcasa(baza))} /> : null}
    </>
  );
}
