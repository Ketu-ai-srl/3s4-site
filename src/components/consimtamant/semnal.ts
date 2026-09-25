// Semnalul prin care legatura "Setari cookie-uri" din subsol redeschide panoul de setari, pe orice
// pagina, si textul legaturii. Sta intr-un modul separat ca butonul din subsol sa nu traga dupa el
// tot bannerul: butonul e in bucata comuna a layout-ului, bannerul intr-o bucata ceruta numai cand e
// randat (`ConsimtamantLenes`). Textul legaturii nu sta in `texte.ts` din acelasi motiv: un modul
// folosit si de subsol, si de banner ramane intreg in bucata comuna (masurat pe build, 25.09.2026).

export const SEMNAL_DESCHIDE_SETARI = "3s:setari-cookie";

/** Textul legaturii din subsol care redeschide setarile, pe orice pagina. */
export const TEXT_LEGATURA_SUBSOL = "Setări cookie-uri";

/** Cere bannerului sa deschida panoul de setari. */
export function deschideSetarile(): void {
  window.dispatchEvent(new Event(SEMNAL_DESCHIDE_SETARI));
}
