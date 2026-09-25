// Incarcatorul GA4, in modul DE BAZA al Consent Mode v2 (planul valului S4, §8.5; cercetarea
// publicitate-si-masurare, §2.1): nimic de la Google nu exista in pagina inainte de acceptul
// categoriei "statistica" - niciun script, nicio cerere, niciun cookie. Dupa accept, semnalele
// pornesc pe `denied`, iar numai `analytics_storage` trece pe `granted`; cele trei semnale de
// publicitate raman refuzate, fiindca 3S nu face publicitate si bannerul nu intreaba de ea.
//
// ACESTA E SINGURUL FISIER DIN src/ CARE NUMESTE ADRESA SCRIPTULUI GOOGLE. Poarta juridica (C-01)
// il excepteaza pe nume, cu motivul scris acolo; un al doilea fisier cu aceeasi adresa inroseste
// poarta. Nici codul lui nu ajunge in pagina inainte de accept: `Consimtamant.tsx` il cere cu
// `import()` abia la accept, deci sta intr-o bucata separata de JavaScript. Oprirea si fanionul
// "pornit" sunt in `stare-ga4.ts`, ca un refuz sa nu-l aduca in pagina. Cererea insasi si bucata se
// masoara in browser: tests/browser/comutator.spec.ts dovedeste ca pleaca numai dupa accept si
// niciodata dupa refuz.
//
// Setarile, si de ce:
//   - `cookie_domain` = gazda paginii: implicitul Google pune cookie-ul pe domeniul de nivel cel mai
//     inalt, adica pe TOATE subdomeniile unui domeniu partajat;
//   - `allow_google_signals` si `allow_ad_personalization_signals` = false: fara date de publicitate.
// Evenimentele automate ale masurarii imbunatatite (derulare, clicuri spre alte site-uri, cautare,
// descarcari, video, formulare) nu se pot opri de aici: se opresc din fluxul web al proprietatii GA4
// (docs/ziua-operatorului.md, pasul 5), altfel lista de evenimente n-ar mai fi inchisa.

import { marcheazaGa4Pornit } from "./stare-ga4";

const ADRESA_SCRIPT = "https://www.googletagmanager.com/gtag/js?id=";

/** Scriptul a fost pus in pagina (o singura data pe incarcare de pagina). */
let scriptPus = false;

/** Porneste GA4 dupa accept. Idempotent: al doilea apel doar reconfirma semnalul. */
export function pornesteGa4(id: string): void {
  if (typeof window === "undefined") return;
  window[`ga-disable-${id}`] = false;
  if (!window.gtag) {
    window.dataLayer = window.dataLayer ?? [];
    // gtag cere obiectul `arguments`, nu o lista: asa il citeste scriptul Google din dataLayer.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }
  window.gtag("consent", "update", { analytics_storage: "granted" });
  if (!scriptPus) {
    window.gtag("js", new Date());
    window.gtag("config", id, {
      cookie_domain: window.location.hostname,
      cookie_flags: "SameSite=Lax;Secure",
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = ADRESA_SCRIPT + encodeURIComponent(id);
    script.dataset.analitica = "ga4";
    document.head.appendChild(script);
    scriptPus = true;
  }
  marcheazaGa4Pornit();
}
