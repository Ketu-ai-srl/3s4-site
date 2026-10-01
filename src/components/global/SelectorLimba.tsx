"use client";

// Selectorul de limba: forma identica cu referinta, cu o singura optiune azi (romana; plan §6.5).
// Deschiderea e numai la clic (trecerea mouse-ului doar coloreaza butonul); Escape si clicul in
// afara il inchid, iar focusul revine pe buton.
//
// PE EDITIE: lista de limbi si eticheta vin din contract (implicit cele romanesti de azi). Cu un contract
// pe editii, optiunile sunt echivalentele paginii curente (`limbiPentruCale`, tabelul din
// `src/content/echivalente.ts`); pe o pagina fara echivalent selectorul nu se randeaza deloc. Pe build-ul
// cu o singura editie lista e fixa, deci selectorul arata ca azi.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ECHIVALENTE } from "@/content/echivalente";
import { LIMBI, SELECTOR_LIMBA, limbiPentruCale, vizibile, type CaiExistente, type Limba } from "@/content/navigatie";
import { editiiBuild } from "@/lib/editii";
import Iconita from "@/components/primitive/Iconita";
import s from "./SelectorLimba.module.css";

export type SelectorLimbaProps = {
  cai: CaiExistente;
  /** In subsol panoul se deschide in sus. */
  directie?: "jos" | "sus";
  className?: string;
  /** Limbile din contractul editiei; implicit lista romaneasca. */
  limbi?: readonly Limba[];
  /** Eticheta accesibila a butonului; implicit cea romaneasca. */
  eticheta?: string;
};

export default function SelectorLimba({
  cai,
  directie = "jos",
  className,
  limbi: limbiContract = LIMBI,
  eticheta = SELECTOR_LIMBA.eticheta,
}: SelectorLimbaProps) {
  const [deschis, setDeschis] = useState(false);
  const zona = useRef<HTMLDivElement>(null);
  const buton = useRef<HTMLButtonElement>(null);
  const idPanou = useId();
  const cale = usePathname() ?? "/";
  const limbiPagina = limbiPentruCale(limbiContract, cale, ECHIVALENTE, editiiBuild());
  const limbi = vizibile(limbiPagina, cai);
  const activa = limbiPagina.find((l) => l.activa) ?? limbiPagina[0];

  useEffect(() => {
    if (!deschis) return;
    const laTasta = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeschis(false);
        buton.current?.focus();
      }
    };
    const laClic = (e: MouseEvent) => {
      if (zona.current && !zona.current.contains(e.target as Node)) {
        setDeschis(false);
      }
    };
    document.addEventListener("keydown", laTasta);
    document.addEventListener("mousedown", laClic);
    return () => {
      document.removeEventListener("keydown", laTasta);
      document.removeEventListener("mousedown", laClic);
    };
  }, [deschis]);

  if (!activa) return null;

  return (
    <div
      ref={zona}
      className={[s.zona, directie === "sus" ? s.subsol : "", className ?? ""].filter(Boolean).join(" ")}
      data-selector-limba=""
    >
      <button
        ref={buton}
        type="button"
        className={[s.buton, deschis ? s.deschis : ""].filter(Boolean).join(" ")}
        aria-expanded={deschis}
        aria-controls={deschis ? idPanou : undefined}
        aria-label={eticheta + ": " + activa.text}
        onClick={() => setDeschis((d) => !d)}
      >
        <span className={s.cod}>{activa.cod}</span>
        <Iconita nume="chevron-down" marime={10} contur={2} className={s.chevron} />
      </button>
      {deschis ? (
        <div id={idPanou} className={[s.panou, directie === "sus" ? s.panouSus : ""].filter(Boolean).join(" ")}>
          <ul className={s.lista}>
            {limbi.map((l) => (
              <li key={l.cod}>
                <Link
                  href={l.href ?? "/"}
                  className={[s.optiune, l.activa ? s.optiuneActiva : ""].filter(Boolean).join(" ")}
                  aria-current={l.activa ? "true" : undefined}
                  lang={l.cod.toLowerCase()}
                  onClick={() => setDeschis(false)}
                >
                  <span>{l.text}</span>
                  {l.activa ? <Iconita nume="check" marime={14} contur={2} /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
