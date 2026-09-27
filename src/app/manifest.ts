import type { MetadataRoute } from "next";
import { CULOARE_MARCA, FUNDAL_MARCA, NUME_SCURT_MARCA } from "@/components/global/culoare-marca";
import { BRAND } from "@/content/entitate";

// Manifestul aplicatiei web (livrarea S4-5): numele marcii din `config/brand.json`, numele scurt,
// iconitele marcii care stau deja in `src/app` (Next le serveste la aceleasi adrese) si culoarea
// marcii din tokeni (`src/components/global/culoare-marca.ts`). Iconita PNG de 180 px pentru ecranul
// de pornire al telefoanelor o anunta Next singur in `<head>`; manifestul nu o numeste, fiindca
// numele fisierului contine un cuvant din lista fabricii. Doar marca, fara date de firma
// (plan §7, D10). `start_url` e startul; afisarea ramane in navigator, fiindca site-ul e de
// prezentare, nu o aplicatie instalabila.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.nume,
    short_name: NUME_SCURT_MARCA,
    lang: "ro",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: FUNDAL_MARCA,
    theme_color: CULOARE_MARCA,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" },
    ],
  };
}
