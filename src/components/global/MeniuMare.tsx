// Panoul meniului mare: foile Functionalitati si Solutii intr-un singur card. Primeste foile deja
// filtrate pe caile existente (Antet.tsx); o foaie fara niciun element vizibil nu ajunge aici.

import Link from "next/link";
import type { ElementMeniu, FoaieMeniu } from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import s from "./MeniuMare.module.css";

export type FoaieVizibila = {
  cheie: string;
  foaie: FoaieMeniu;
};

export type MeniuMareProps = {
  id: string;
  foi: FoaieVizibila[];
  activa: string;
  cale: string;
  onMouseEnter?: () => void;
};

function Element({ element, lider, curent }: { element: ElementMeniu; lider: boolean; curent: boolean }) {
  const clase = [s.element, lider ? s.elementLider : "", curent ? s.elementCurent : ""].filter(Boolean).join(" ");
  return (
    <Link
      href={element.href ?? "/"}
      className={clase}
      aria-current={curent ? "page" : undefined}
      data-element-meniu=""
    >
      <span className={s.cutie} aria-hidden="true">
        <Iconita nume={element.iconita} marime={20} contur={1.75} />
      </span>
      <span className={s.text}>
        <span className={s.titlu}>
          {element.text}
          {element.marcajAi ? <span className={s.marcajAi}>AI</span> : null}
        </span>
        <span className={s.descriere}>{element.descriere}</span>
      </span>
      {lider ? <Iconita nume="arrow-right" marime={14} contur={2} className={s.sageataLider} /> : null}
    </Link>
  );
}

export default function MeniuMare({ id, foi, activa, cale, onMouseEnter }: MeniuMareProps) {
  return (
    <div id={id} className={s.zona} onMouseEnter={onMouseEnter}>
      <div className={s.card}>
        {foi.map(({ cheie, foaie }) => {
          const vizibila = cheie === activa;
          return (
            <div
              key={cheie}
              className={vizibila ? s.foaie : s.foaieAscunsa}
              aria-hidden={vizibila ? undefined : true}
              inert={vizibila ? undefined : true}
              role="group"
              aria-label={foaie.eticheta}
            >
              {foaie.lider ? (
                <div className={s.lider}>
                  <Element element={foaie.lider} lider curent={foaie.lider.href === cale} />
                </div>
              ) : null}
              {foaie.elemente.length > 0 ? (
                <div className={s.grila}>
                  {foaie.elemente.map((e) => (
                    <Element key={e.text} element={e} lider={false} curent={e.href === cale} />
                  ))}
                </div>
              ) : null}
              {foaie.subsol.href ? (
                <div className={s.subsol}>
                  <Link href={foaie.subsol.href} className={s.subsolLegatura}>
                    <span>{foaie.subsol.text}</span>
                    <Iconita nume="arrow-right" marime={14} contur={2} />
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
