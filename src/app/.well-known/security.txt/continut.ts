// Continutul lui `/.well-known/security.txt` (RFC 9116; constatarea de audit 3S4-F-026), separat de
// `route.ts` ca proba sa-l poata compune cu o data si o adresa date (Next nu permite alte exporturi
// in fisierul rutei).
//
// `Expires` e obligatoriu si nu are voie sa treaca de un an (RFC 9116 §2.5.5); se calculeaza la
// CONSTRUIRE, azi + 180 de zile, deci fiecare build il reimprospateaza si nicio data nu e scrisa de
// mana. Un site neconstruit 180 de zile publica un fisier expirat: e semnalul corect, nu o eroare.
// `Policy` si `Canonical` se compun din `adresaSite()`, deci se muta cu domeniul la lansare.
//
// PE DOMENIU (felia metadata-hreflang): `Contact` vine din canalele domeniului (`CANALE.emailSecuritate`,
// implicit adresa de azi), `Preferred-Languages` urmeaza editia de la radacina (`ro, en` pe build-ul romanesc,
// `en, ro` pe cel international), iar `Policy` se scrie numai cand pagina de securitate a editiei exista in
// `RUTE`. Campul e optional (RFC 9116 §2.5.7); o legatura spre o pagina care raspunde 404 ar fi mai rea decat
// lipsa lui. Site-ul international n-are inca pagina de securitate, deci acolo campul lipseste.

import { CANALE } from "@/content/canale";
import { CALE_SECURITATE } from "@/content/produs/securitate";
import { RUTE } from "@/content/rute";
import type { CodEditie } from "@/lib/editii";
import { editiaRadacinii } from "@/lib/site";

export const CALE_SECURITY_TXT = "/.well-known/security.txt";
export const ZILE_VALABILITATE = 180;

/** Pagina de securitate a fiecarei editii de la radacina; `null` = editia n-are inca una. */
export const PAGINA_SECURITATE: Readonly<Record<CodEditie, string | null>> = {
  "ro-RO": CALE_SECURITATE,
  en: null,
  "ro-MD": null,
};

/** Limbile preferate pentru rapoarte, pe editia de la radacina. */
const LIMBI_PREFERATE: Readonly<Record<CodEditie, string>> = {
  "ro-RO": "ro, en",
  en: "en, ro",
  "ro-MD": "ro, en",
};

export type OptiuniSecurity = {
  /** Editia de la radacina; implicit, cea a build-ului. */
  editie?: CodEditie;
  /** Adresa raportarilor; implicit, `CANALE.emailSecuritate`. */
  email?: string;
  /** Caile care exista pe domeniu; implicit, `RUTE`. */
  cai?: readonly string[];
};

export function textSecurity(site: string, acum: Date, optiuni: OptiuniSecurity = {}): string {
  const editie = optiuni.editie ?? editiaRadacinii().cod;
  const email = optiuni.email ?? CANALE.emailSecuritate;
  const cai = optiuni.cai ?? RUTE.map((r) => r.cale);
  const politica = PAGINA_SECURITATE[editie];
  const expira = new Date(acum.getTime() + ZILE_VALABILITATE * 24 * 60 * 60 * 1000);
  return [
    "Contact: mailto:" + email,
    "Expires: " + expira.toISOString(),
    "Preferred-Languages: " + LIMBI_PREFERATE[editie],
    ...(politica !== null && cai.includes(politica) ? ["Policy: " + site + politica] : []),
    "Canonical: " + site + CALE_SECURITY_TXT,
    "",
  ].join("\n");
}
