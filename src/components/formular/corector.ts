// Corectorul de adresa de e-mail (enterprise.md §4, contact.md §7): cand domeniul adresei seamana cu
// unul foarte folosit, dar nu e identic, primul clic pe trimitere NU trimite si arata o propunere;
// al doilea clic trimite adresa asa cum e scrisa.
//
// "Seamana" = distanta de editare cel mult 2 (inserare, stergere, inlocuire sau doua litere vecine
// inversate), pe domeniul intreg. O adresa pe un domeniu necunoscut nu primeste propunere: corectorul
// prinde greseli de tastare pe domeniile mari, nu judeca domeniile firmelor.

/**
 * Domeniile de posta cele mai folosite in Romania si in Republica Moldova. Lista cuprinde si
 * domeniile reale aflate la 1-2 editari de unul mare (ymail.com, email.ro, yandex.ru): un domeniu de
 * pe lista nu primeste niciodata propunere, deci adresele corecte de acolo nu sunt contrazise.
 */
export const DOMENII_CUNOSCUTE = [
  "gmail.com",
  "ymail.com",
  "email.ro",
  "yandex.ru",
  "yahoo.com",
  "yahoo.ro",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
  "proton.me",
  "mail.ru",
  "mail.md",
] as const;

/** Distanta de editare cu transpozitii vecine (Damerau, varianta restransa). */
export function distanta(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Adresa corectata, sau `null` cand domeniul e corect, necunoscut sau adresa nu are forma. */
export function propunereEmail(adresa: string): string | null {
  const v = adresa.trim();
  const at = v.lastIndexOf("@");
  if (at <= 0 || at === v.length - 1) return null;
  const local = v.slice(0, at);
  const domeniu = v.slice(at + 1).toLowerCase();
  if ((DOMENII_CUNOSCUTE as readonly string[]).includes(domeniu)) return null;
  let cel: string | null = null;
  let min = 3;
  for (const cunoscut of DOMENII_CUNOSCUTE) {
    const dist = distanta(domeniu, cunoscut);
    if (dist < min) {
      min = dist;
      cel = cunoscut;
    }
  }
  return cel === null ? null : local + "@" + cel;
}
