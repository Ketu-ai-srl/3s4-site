"use client";

// Paleta de cautare (Ctrl K): fereastra modala cu un camp de tip combobox si o lista de rezultate.
// Sagetile muta selectia, Enter deschide pagina selectata, Escape si clicul pe fundal inchid, iar
// focusul revine pe elementul care a deschis-o. Derularea paginii e blocata cat e deschisa.
// Continutul vine din `paleta.ts` (functie pura, cu probe), deci din caile care exista.

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ARTICOLE } from "@/content/blog/registru";
import { PALETA, type CaiExistente } from "@/content/navigatie";
import { RUTE } from "@/content/rute";
import Iconita from "@/components/primitive/Iconita";
import { continutPaleta } from "./paleta";
import s from "./PaletaCautare.module.css";

export type PaletaCautareProps = {
  cai: CaiExistente;
  onInchide: () => void;
};

export default function PaletaCautare({ cai, onInchide }: PaletaCautareProps) {
  const router = useRouter();
  const [interogare, setInterogare] = useState("");
  const [selectat, setSelectat] = useState(0);
  const camp = useRef<HTMLInputElement>(null);
  const baza = useId();
  const idLista = baza + "-lista";

  const grupuri = useMemo(() => continutPaleta(interogare, cai, RUTE, ARTICOLE), [interogare, cai]);
  const plate = useMemo(() => grupuri.flatMap((g) => g.elemente), [grupuri]);
  const indiceSelectat = plate.length === 0 ? -1 : Math.min(selectat, plate.length - 1);

  useEffect(() => {
    camp.current?.focus();
    const inainte = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = inainte;
    };
  }, []);

  const deschide = (cale: string) => {
    onInchide();
    router.push(cale);
  };

  const laTasta = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (plate.length > 0) setSelectat((i) => (Math.min(i, plate.length - 1) + 1) % plate.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (plate.length > 0) setSelectat((i) => (Math.min(i, plate.length - 1) - 1 + plate.length) % plate.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ales = plate[indiceSelectat];
      if (ales) deschide(ales.cale);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onInchide();
    } else if (e.key === "Tab") {
      // Singurul element cu focus din fereastra e campul: Tab nu are unde pleca.
      e.preventDefault();
    }
  };

  let indice = -1;
  return (
    <div
      className={s.fundal}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onInchide();
      }}
      data-paleta=""
    >
      <div className={s.panou} role="dialog" aria-modal="true" aria-label={PALETA.eticheta}>
        <div className={s.intrare}>
          <Iconita nume="search" marime={15} contur={1.5} className={s.lupa} />
          <input
            ref={camp}
            className={s.camp}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={idLista}
            aria-autocomplete="list"
            aria-activedescendant={indiceSelectat >= 0 ? baza + "-e" + indiceSelectat : undefined}
            aria-label={PALETA.eticheta}
            placeholder={PALETA.campExemplu}
            value={interogare}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setInterogare(e.target.value);
              setSelectat(0);
            }}
            onKeyDown={laTasta}
          />
          <button type="button" className={s.tastaEsc} onClick={onInchide} aria-label="Închide căutarea">
            {PALETA.tastaInchidere}
          </button>
        </div>
        {plate.length === 0 ? (
          <p className={s.gol} role="status">
            {PALETA.faraRezultate}
          </p>
        ) : (
          <ul id={idLista} className={s.lista} role="listbox" aria-label={PALETA.eticheta}>
            {grupuri.map((g) => (
              <li key={g.titlu} role="presentation">
                <div className={s.grupEticheta} id={baza + "-g-" + g.titlu} aria-hidden="true">
                  {g.titlu}
                </div>
                <ul className={s.grupLista} role="group" aria-labelledby={baza + "-g-" + g.titlu}>
                  {g.elemente.map((el) => {
                    indice += 1;
                    const i = indice;
                    const esteSelectat = i === indiceSelectat;
                    return (
                      <li
                        key={g.titlu + el.cale + el.titlu}
                        id={baza + "-e" + i}
                        role="option"
                        aria-selected={esteSelectat}
                        className={[s.element, esteSelectat ? s.elementSelectat : ""].filter(Boolean).join(" ")}
                        onMouseMove={() => setSelectat(i)}
                        onClick={() => deschide(el.cale)}
                      >
                        <span className={s.elementTitlu}>{el.titlu}</span>
                        <span className={s.elementCale}>{el.cale}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
        <div className={s.subsol}>
          <span className={s.taste}>
            <span className={s.tasta} aria-hidden="true">
              <Iconita nume="chevron-up" marime={11} contur={2} />
            </span>
            <span className={s.tasta} aria-hidden="true">
              <Iconita nume="chevron-down" marime={11} contur={2} />
            </span>
            <span className="doar-cititor">{PALETA.ajutor.sageti}</span>
          </span>
          <span className={s.taste}>
            <span className={s.tasta} aria-hidden="true">
              <Iconita nume="corner-down-left" marime={11} contur={2} />
            </span>
            <span className="doar-cititor">{PALETA.ajutor.enter}</span>
          </span>
          <span className={s.scurtatura}>{PALETA.ajutor.scurtatura}</span>
        </div>
      </div>
    </div>
  );
}
