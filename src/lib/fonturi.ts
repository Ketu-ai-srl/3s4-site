// Fonturile layout-urilor EDITIILOR (`(en)`, `(romd)`, pagina de negasit EN): aceleasi declaratii `next/font`
// ca in layout-ul romanesc (`src/app/layout.tsx`), deci aceleasi variabile CSS si acelasi aspect. Layout-ul
// romanesc ramane cu declaratiile lui (unificarea e o curatenie ulterioara); pe build-ul romanesc modulul nu e
// importat de nimic, deci nu schimba nimic acolo.
//
// Fonturile sunt gazduite de site: `next/font` le descarca la construire si le serveste de pe acelasi domeniu,
// fara nicio cerere catre un tert (poarta C-01).

import { JetBrains_Mono, Marck_Script, Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  variable: "--fnt-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jakartaItalic = Plus_Jakarta_Sans({
  variable: "--fnt-jakarta-italic",
  subsets: ["latin", "latin-ext"],
  style: ["italic"],
  display: "swap",
  preload: false,
});

const mono = JetBrains_Mono({
  variable: "--fnt-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mana = Marck_Script({
  variable: "--fnt-mana",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  preload: false,
});

/** Clasele care definesc variabilele de font, de pus pe `<html>`. */
export const CLASE_FONTURI = [jakarta.variable, jakartaItalic.variable, mono.variable, mana.variable].join(" ");
