// Cheia IndexNow a domeniului, din `INDEXNOW_KEY`, separata de `route.ts` ca proba sa o poata chema cu o
// valoare data (Next nu permite alte exporturi in fisierul unei rute).
//
// Protocolul (https://www.indexnow.org/documentation, citit pe 2026-09-30): cheia are cel putin 8 si cel
// mult 128 de caractere, si poate contine numai litere mici (a-z), litere mari (A-Z), cifre (0-9) si
// cratima (-). Ea NU e un secret: motoarele de cautare o citesc dintr-un fisier public al domeniului, ca
// sa verifice ca cel care trimite adresele stapaneste domeniul. Fisierul-cheie e `/indexnow.txt`, iar
// locul lui se da la trimitere prin `keyLocation` (FAQ: "you may use another public location",
// https://www.indexnow.org/faq); `scripts/indexnow.mjs` il da.
//
// `scripts/indexnow.mjs` are aceeasi expresie, scrisa a doua oara: un script `.mjs` rulat cu `node` nu
// poate importa un modul TypeScript. Proba (`tests/multi-domeniu-indexnow.test.ts`) le cere sa dea acelasi
// raspuns pe aceleasi valori.

/** Forma cheii: 8-128 de caractere din a-z, A-Z, 0-9 si cratima. */
export const FORMA_CHEIE = /^[A-Za-z0-9-]{8,128}$/;

/**
 * Cheia din mediu, sau `null` cand variabila lipseste sau e goala (atunci `/indexnow.txt` raspunde 404).
 * O valoare care nu are forma cheii opreste construirea, ca o greseala de tastare sa nu ajunga intr-un
 * fisier pe care motoarele il resping fara sa spuna de ce. Mesajul nu repeta valoarea.
 */
export function cheieIndexNow(valoare: string | undefined = process.env.INDEXNOW_KEY): string | null {
  const v = (valoare ?? "").trim();
  if (v === "") {
    return null;
  }
  if (!FORMA_CHEIE.test(v)) {
    throw new Error(
      "INDEXNOW_KEY trebuie sa aiba intre 8 si 128 de caractere, doar litere a-z A-Z, cifre si cratima (are " + v.length + " caractere)",
    );
  }
  return v;
}
