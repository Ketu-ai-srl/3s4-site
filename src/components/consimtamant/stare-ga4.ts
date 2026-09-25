// Starea GA4 pe pagina si oprirea lui, FARA adresa scriptului Google (planul valului S4, §8.5).
//
// DE CE E SEPARAT DE `incarcator-ga4.ts`. Incarcatorul, singurul fisier care numeste scriptul
// Google, se cere in pagina numai la accept (`import()` in `Consimtamant.tsx`). Tot ce trebuie
// fara accept - fanionul "pornit" citit de `evenimente.ts`, oprirea la refuz si stergerea
// cookie-urilor - sta aici, ca un refuz sau o pagina care trimite evenimente sa nu aduca in
// browser codul care incarca Google. Proba: tests/browser/comutator.spec.ts, pe JavaScript-ul
// incarcat de fiecare ruta, inainte si dupa accept.
//
// Oprirea pune fanionul de dezactivare al Google (`ga-disable-<ID>`), trece semnalul inapoi pe
// `denied` si sterge cookie-urile `_ga`, deci masurarea se opreste pe loc, fara reincarcare.

type Gtag = (...argumente: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    [fanion: `ga-disable-${string}`]: boolean | undefined;
  }
}

/** Masurarea e pornita acum: acceptata si neretrasa. */
let pornit = false;

/** Masurarea e pornita acum, pe pagina asta. */
export function ga4Pornit(): boolean {
  return pornit;
}

/** O cheama numai incarcatorul, dupa ce a pus scriptul in pagina. */
export function marcheazaGa4Pornit(): void {
  pornit = true;
}

/** Cookie-urile GA4 de pe pagina: `_ga` si `_ga_<cod>`. */
export function numeCookieGa(cookieDocument: string): string[] {
  return cookieDocument
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_"));
}

/** Domeniile pe care ar putea sta un cookie al paginii: gazda si fiecare parinte al ei. */
export function domeniiCookie(gazda: string): string[] {
  const parti = gazda.split(".");
  const domenii: string[] = [];
  for (let i = 0; i < parti.length - 1; i++) domenii.push(parti.slice(i).join("."));
  return domenii;
}

/** Opreste GA4 la refuz sau la retragere si sterge cookie-urile lui. */
export function opresteGa4(id: string): void {
  if (typeof window === "undefined") return;
  window[`ga-disable-${id}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  pornit = false;
  const domenii = domeniiCookie(window.location.hostname);
  for (const nume of numeCookieGa(document.cookie)) {
    document.cookie = nume + "=; Max-Age=0; path=/";
    for (const d of domenii) document.cookie = nume + "=; Max-Age=0; path=/; domain=" + d;
  }
}
