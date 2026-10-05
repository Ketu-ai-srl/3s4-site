// Capul constructorului de pe start, editia `en` (3s.md): titlul, subtitlul, intrebarea si
// numele celor 9 industrii, cu iconitele si codurile startului RO. Modul mic, separat de scene: il
// importa invelitoarea din pachetul paginii (`ConstructorEn.tsx` / `ConstructorRoMd.tsx`), iar scenele
// raman in bucata lenesa a lumii, ca pe RO. Textul: fisa de continut a paginii, sectiunea
// Component copy (decision 53), Constructor (decizia 59, forma (a) a intrebarii 2); status: propus, pana la aprobarea pe capturi.

import type { CapConstructor } from "@/content/acasa";

export const CAP_CONSTRUCTOR_EN: CapConstructor = {
  titlu: "Your company's archive in 3S",
  subtitlu: "Pick a sector as an example and see how its documents would be kept and found in 3S.",
  intrebare: "Which sector are you in?",
  industrii: [
    {
      cod: "constructii",
      nume: "Construction",
      iconita: "building-2"
    },
    {
      cod: "contabilitate",
      nume: "Accounting",
      iconita: "calculator"
    },
    {
      cod: "logistica",
      nume: "Logistics",
      iconita: "truck"
    },
    {
      cod: "it",
      nume: "IT and web",
      iconita: "code-xml"
    },
    {
      cod: "avocatura",
      nume: "Law firms",
      iconita: "scale"
    },
    {
      cod: "imobiliare",
      nume: "Real estate",
      iconita: "house"
    },
    {
      cod: "asigurari",
      nume: "Insurance",
      iconita: "shield-check"
    },
    {
      cod: "notariat",
      nume: "Notaries",
      iconita: "file-badge"
    },
    {
      cod: "consultanta",
      nume: "Consulting",
      iconita: "chart-column"
    }
  ]
};
