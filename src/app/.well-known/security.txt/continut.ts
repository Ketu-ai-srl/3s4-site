// Continutul lui `/.well-known/security.txt` (RFC 9116; constatarea de audit 3S4-F-026), separat de
// `route.ts` ca proba sa-l poata compune cu o data si o adresa date (Next nu permite alte exporturi
// in fisierul rutei).
//
// `Expires` e obligatoriu si nu are voie sa treaca de un an (RFC 9116 §2.5.5); se calculeaza la
// CONSTRUIRE, azi + 180 de zile, deci fiecare build il reimprospateaza si nicio data nu e scrisa de
// mana. Un site neconstruit 180 de zile publica un fisier expirat: e semnalul corect, nu o eroare.
// `Policy` si `Canonical` se compun din `adresaSite()`, deci se muta cu domeniul la lansare.

import { CALE_SECURITATE, EMAIL_SECURITATE } from "@/content/produs/securitate";

export const CALE_SECURITY_TXT = "/.well-known/security.txt";
export const ZILE_VALABILITATE = 180;

export function textSecurity(site: string, acum: Date): string {
  const expira = new Date(acum.getTime() + ZILE_VALABILITATE * 24 * 60 * 60 * 1000);
  return [
    "Contact: mailto:" + EMAIL_SECURITATE,
    "Expires: " + expira.toISOString(),
    "Preferred-Languages: ro, en",
    "Policy: " + site + CALE_SECURITATE,
    "Canonical: " + site + CALE_SECURITY_TXT,
    "",
  ].join("\n");
}
