// Un sir din textele juridice, cu marcajul lui in linie (`src/content/juridic/tipuri.ts`): accentul
// devine `strong`, legatura devine ancora. O legatura spre o ruta a site-ului trece prin `Tinta`, deci
// ramane inerta (acelasi aspect, fara adresa) cat timp ruta nu exista in `RUTE`: nicio legatura moarta.
// `clasaLegatura` stilizeaza ancorele acolo unde textul nu sta in `Proza` (declaratia de accesibilitate).

import type { ReactNode } from "react";
import Tinta from "@/components/primitive/Tinta";
import { fragmenteInLinie } from "@/content/juridic/tipuri";

function legatura(adresa: string, text: string, cheie: number, clasa: string | undefined): ReactNode {
  if (adresa.startsWith("#") || /^(https?:|mailto:)/i.test(adresa)) {
    return (
      <a key={cheie} href={adresa} className={clasa}>
        {text}
      </a>
    );
  }
  const ruta = adresa.split("#")[0].split("?")[0];
  return (
    <Tinta key={cheie} legatura={{ text, href: adresa, ruta }} className={clasa}>
      {text}
    </Tinta>
  );
}

export default function TextInLinie({ text, clasaLegatura }: { text: string; clasaLegatura?: string }) {
  return (
    <>
      {fragmenteInLinie(text).map((f, i) =>
        f.fel === "text" ? (
          f.text
        ) : f.fel === "accent" ? (
          <strong key={i}>{f.text}</strong>
        ) : (
          legatura(f.adresa, f.text, i, clasaLegatura)
        ),
      )}
    </>
  );
}
