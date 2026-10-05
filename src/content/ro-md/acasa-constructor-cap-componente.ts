// Capul constructorului de pe start, editia `ro-md` (3s.md): titlul, subtitlul, intrebarea si
// numele celor 9 industrii, cu iconitele si codurile startului RO. Modul mic, separat de scene: il
// importa invelitoarea din pachetul paginii (`ConstructorEn.tsx` / `ConstructorRoMd.tsx`), iar scenele
// raman in bucata lenesa a lumii, ca pe RO. Textul: fisa de continut a paginii, sectiunea
// Textele componentelor (decizia 53), Constructor (decizia 59, forma (a) a intrebarii 2); status: propus, pana la aprobarea pe capturi.

import type { CapConstructor } from "@/content/acasa";

export const CAP_CONSTRUCTOR_RO_MD: CapConstructor = {
  titlu: "Cum ar arăta arhiva ta în 3S",
  subtitlu: "Alege un domeniu, ca exemplu, și vezi cum ar fi păstrate și găsite actele lui în 3S.",
  intrebare: "În ce domeniu activezi?",
  industrii: [
    {
      cod: "constructii",
      nume: "Construcții",
      iconita: "building-2"
    },
    {
      cod: "contabilitate",
      nume: "Contabilitate",
      iconita: "calculator"
    },
    {
      cod: "logistica",
      nume: "Logistică",
      iconita: "truck"
    },
    {
      cod: "it",
      nume: "IT și web",
      iconita: "code-xml"
    },
    {
      cod: "avocatura",
      nume: "Avocatură",
      iconita: "scale"
    },
    {
      cod: "imobiliare",
      nume: "Imobiliare",
      iconita: "house"
    },
    {
      cod: "asigurari",
      nume: "Asigurări",
      iconita: "shield-check"
    },
    {
      cod: "notariat",
      nume: "Notariat",
      iconita: "file-badge"
    },
    {
      cod: "consultanta",
      nume: "Consultanță",
      iconita: "chart-column"
    }
  ]
};
