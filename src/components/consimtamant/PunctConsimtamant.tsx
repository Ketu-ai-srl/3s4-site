// Locul bannerului in layout (componenta de server). Decide la construire, prin `stareAnalitica`,
// daca bannerul exista: fara operator numit si complet, sau fara nicio unealta de masurare (ID GA4 sau
// Umami), nu se randeaza nimic. Si nici codul lui nu ajunge in pagina: bannerul se cere ca bucata separata
// de JavaScript numai cand e randat (`ConsimtamantLenes`), iar incarcatoarele (GA4, Umami) abia la accept.
// De aceea, aici bannerul se importa numai ca TIP: un import de valoare l-ar pune in bucata comuna a
// layout-ului, pe fiecare pagina. Proba: tests/browser/comutator.spec.ts, pe JavaScript-ul incarcat de
// fiecare ruta.
//
// LIMBA (`limba`, implicit "ro"): radacina romaneasca il monteaza fara proprietati, layout-ul editiei EN cu
// "en", cel al editiei RO-MD cu "ro". Limba alege setul de texte (`texte.ts`), versiunea informarii si
// adresele politicilor. Engleza cu GA4 si fara Umami opreste construirea (`texteConsimtamant`).
//
// STAREA MASURARII se verifica AICI, la fiecare construire, pe toate cele trei layout-uri radacina:
// `stareMasurare` refuza S-C (analitica proprie pornita fara sa astepte acordul, decizia 13), deci un domeniu
// cu `UMAMI_*` si operator nu se construieste daca `UMAMI_ASTEAPTA_ACORDUL` ar fi fals.
//
// Legaturile spre politici se dau numai catre pagini care exista pe site (`CAI_EXISTENTE`): paginile
// juridice intra in `RUTE` odata cu operatorul (felia `juridic`). Cat timp lipsesc, bannerul arata
// numele politicilor fara legatura, nu legaturi moarte; la productie, poarta juridica cere pagina
// politicii de cookie-uri din clipa in care bannerul e in HTML-ul construit (L-15).

import { CAI_EXISTENTE } from "@/content/cai";
import { caleMd } from "@/content/juridic/md/registru";
import { stareMasurare } from "@/content/juridic/masurare";
import { stareAnalitica, unelteActive, versiuneInformare } from "@/lib/analitica";
import type { LegaturiPolitici } from "./Consimtamant";
import ConsimtamantLenes from "./ConsimtamantLenes";
import { informareConsimtamant, type LimbaBanner } from "./texte";

/** Caile politicilor pe site-ul romanesc, cum le numeste coloana Juridic din contractul de navigatie. */
export const CAI_POLITICI = {
  confidentialitate: "/juridic/confidentialitate",
  cookie: "/juridic/cookies",
} as const;

/**
 * Caile politicilor pe limba. In romana sunt doua randuri de candidati: site-ul romanesc (`/juridic/...`) si
 * editia RO-MD de pe 3s.md (`/ro/juridic/...`, din `config/juridic-rute.json`); un build are numai rutele
 * editiilor lui, deci pe fiecare build exista cel mult una. In engleza, editia EN (`/legal/...`).
 */
export const CAI_POLITICI_PE_LIMBA: Readonly<Record<LimbaBanner, readonly { confidentialitate: string; cookie: string }[]>> = {
  ro: [CAI_POLITICI, { confidentialitate: caleMd("confidentialitate", "ro"), cookie: caleMd("cookie-uri", "ro") }],
  en: [{ confidentialitate: caleMd("confidentialitate", "en"), cookie: caleMd("cookie-uri", "en") }],
};

export function legaturiPolitici(cai: ReadonlySet<string> = CAI_EXISTENTE, limba: LimbaBanner = "ro"): LegaturiPolitici {
  const prima = (cheie: "confidentialitate" | "cookie") =>
    CAI_POLITICI_PE_LIMBA[limba].map((c) => c[cheie]).find((cale) => cai.has(cale)) ?? null;
  return { confidentialitate: prima("confidentialitate"), cookie: prima("cookie") };
}

export default function PunctConsimtamant({ limba = "ro" }: { limba?: LimbaBanner } = {}) {
  stareMasurare();
  const stare = stareAnalitica();
  if (!stare.activa) {
    return null;
  }
  const unelte = unelteActive(stare);
  return (
    <ConsimtamantLenes
      idGa4={stare.idGa4}
      umami={stare.umami}
      versiune={versiuneInformare(limba, unelte)}
      legaturi={legaturiPolitici(CAI_EXISTENTE, limba)}
      informare={informareConsimtamant(limba, unelte)}
    />
  );
}
