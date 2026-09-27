// Culoarea marcii pentru navigator: `theme-color` din viewport (bara navigatorului pe telefon) si
// `theme_color` din manifestul aplicatiei web. Valoarea e a tokenului `--color-albastru` din
// `src/app/globals.css` (accentul marcii pe tot site-ul: butoanele pline, legaturile active), nu un
// hex nou. Tokenii sunt CSS, iar metadata se scrie in TypeScript la construire, deci valoarea sta
// aici o data, iar proba (tests/livrare-marca.test.ts) cere sa fie egala cu tokenul: daca tokenul se
// schimba, proba se inroseste inainte ca manifestul sa ramana pe culoarea veche.

/** Tokenul din care vine culoarea, cum e scris in `globals.css`. */
export const TOKEN_CULOARE_MARCA = "--color-albastru";

/** Valoarea tokenului `--color-albastru`. */
export const CULOARE_MARCA = "#2563eb";

/** Fundalul paginii (tokenul `--color-alb`): fereastra de pornire a aplicatiei web. */
export const FUNDAL_MARCA = "#ffffff";

/** Numele scurt al marcii din manifest: sub iconita, pe ecranul telefonului. */
export const NUME_SCURT_MARCA = "3S";
