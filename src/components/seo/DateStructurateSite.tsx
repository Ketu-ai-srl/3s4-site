// Datele structurate puse de layout: graful comun (organizatia si site-ul) pe fiecare pagina, plus
// graful startului (aplicatia cu pretul si intrebarile frecvente) numai pe `/`.

import { adresaSite } from "@/lib/site";
import { grafAcasa, grafSite, serializeaza } from "./date-structurate";
import JsonLd from "./JsonLd";
import JsonLdPeCale from "./JsonLdPeCale";

export default function DateStructurateSite() {
  const baza = adresaSite();
  return (
    <>
      <JsonLd date={grafSite(baza)} />
      <JsonLdPeCale cale="/" json={serializeaza(grafAcasa(baza))} />
    </>
  );
}
