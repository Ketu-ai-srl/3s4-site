"use client";

// Paleta de cautare (Ctrl K): fereastra modala cu un camp de tip combobox si o lista de rezultate.
// Sagetile muta selectia, Enter deschide pagina selectata, Escape si clicul pe fundal inchid, iar
// focusul revine pe elementul care a deschis-o. Derularea paginii e blocata cat e deschisa.
// Continutul vine din `paleta.ts` (functie pura, cu probe), deci din caile care exista.
//
// PE EDITIE: textele si grupurile vin din contractul editiei (`paleta`, implicit `PALETA`). Pe contractul
// romanesc continutul e exact cel din `paleta.ts`; pe altul, `continutPaletaContract` aplica aceleasi
// reguli peste grupurile contractului (`paleta.ts` citeste numai contractul romanesc).
//
// PE ECRAN TACTIL (fara hover, ca tasta din antet): tastele nu au sens, deci randul de jos cu sagetile, Enter si
// "Ctrl K" nu se arata, iar butonul de inchidere poarta un X in loc de "esc" (aceeasi eticheta accesibila).
//
// EDITIA PAGINII: pe un domeniu cu mai multe editii (3s.md), rezultatele sunt numai ale editiei din care s-a deschis
// paleta (`editiileContractului`): o pagina in engleza nu propune pagini in romana si invers.
//
// ASEZAREA (`src/lib/asezare.ts`): continutul se calculeaza pe cai SURSA; navigarea (`router.push`) si calea
// afisata langa fiecare rezultat folosesc adresa SERVITA (`cuCaiServite`). Pe asezarea `md` coincid.

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ARTICOLE, caleArticol, type ArticolBlog } from "@/content/blog/registru";
import { PALETA, vizibile, type CaiExistente, type ContractPaleta } from "@/content/navigatie";
import { RUTE, editiaRutei, type Ruta } from "@/content/rute";
import type { CodEditie } from "@/lib/editii";
import Iconita from "@/components/primitive/Iconita";
import { continutPaleta, cuCaiServite, normalizeaza, potrivesteInterogarea, type GrupPaletaRezultat } from "./paleta";
import s from "./PaletaCautare.module.css";

/**
 * Editiile paginilor numite de contract (grupurile lui, dupa rutele carora le apartin caile). Contractul unei editii
 * numeste numai pagini ale ei, deci multimea spune din ce editie s-a deschis paleta. `null` cand contractul nu
 * numeste nicio ruta cunoscuta: atunci nu se filtreaza nimic.
 */
export function editiileContractului(paleta: ContractPaleta, rute: readonly Ruta[]): ReadonlySet<CodEditie> | null {
  const cai = new Set(paleta.grupuri.flatMap((g) => g.elemente.map((l) => l.href ?? "")));
  const editii = new Set(rute.filter((r) => cai.has(r.cale)).map(editiaRutei));
  return editii.size === 0 ? null : editii;
}

/**
 * Continutul paletei pentru un contract dat: aceleasi reguli ca `continutPaleta` (fara interogare, grupurile
 * contractului filtrate pe caile existente; cu interogare, paginile contractului, apoi restul rutelor, actiunile
 * si articolele), cu titlurile si elementele din contract. Pe contractul romanesc se foloseste `continutPaleta`.
 */
export function continutPaletaContract(
  paleta: ContractPaleta,
  interogare: string,
  cai: CaiExistente,
  rute: readonly Ruta[],
  articole: readonly ArticolBlog[],
): GrupPaletaRezultat[] {
  if (paleta === PALETA) {
    return continutPaleta(interogare, cai, rute, articole);
  }
  const q = normalizeaza(interogare);
  const potriveste = (...campuri: string[]) => potrivesteInterogarea(q, ...campuri);
  const [grupPagini, grupActiuni] = paleta.grupuri;
  const pagini = vizibile(grupPagini?.elemente ?? [], cai).map((l) => ({ titlu: l.text, cale: l.href ?? "/" }));
  const actiuni = vizibile(grupActiuni?.elemente ?? [], cai).map((l) => ({ titlu: l.text, cale: l.href ?? "/" }));
  if (q === "") {
    return [
      { titlu: grupPagini?.titlu ?? "", elemente: pagini },
      { titlu: grupActiuni?.titlu ?? "", elemente: actiuni },
    ].filter((g) => g.elemente.length > 0);
  }
  const dinContract = new Set(pagini.map((p) => p.cale));
  // Numai rutele editiei contractului: pe 3s.md, paleta de pe o pagina EN nu propune pagini RO si invers.
  const editii = editiileContractului(paleta, rute);
  const toatePaginile = [
    ...pagini.map((p) => ({ ...p, descriere: rute.find((r) => r.cale === p.cale)?.descriere ?? "" })),
    ...rute
      .filter((r) => cai.has(r.cale) && !dinContract.has(r.cale) && (editii === null || editii.has(editiaRutei(r))))
      .map((r) => ({ titlu: r.scurt, cale: r.cale, descriere: r.descriere })),
  ];
  return [
    {
      titlu: grupPagini?.titlu ?? "",
      elemente: toatePaginile.filter((p) => potriveste(p.titlu, p.descriere, p.cale)).map(({ titlu, cale }) => ({ titlu, cale })),
    },
    { titlu: grupActiuni?.titlu ?? "", elemente: actiuni.filter((a) => potriveste(a.titlu, a.cale)) },
    {
      titlu: paleta.grupArticole,
      elemente: articole
        .filter((a) => cai.has(caleArticol(a)) && potriveste(a.titlu, a.extras))
        .map((a) => ({ titlu: a.titlu, cale: caleArticol(a) })),
    },
  ].filter((g) => g.elemente.length > 0);
}

export type PaletaCautareProps = {
  cai: CaiExistente;
  /** Contractul paletei; implicit cel romanesc. */
  paleta?: ContractPaleta;
  onInchide: () => void;
};

export default function PaletaCautare({ cai, paleta = PALETA, onInchide }: PaletaCautareProps) {
  const router = useRouter();
  const [interogare, setInterogare] = useState("");
  const [selectat, setSelectat] = useState(0);
  const camp = useRef<HTMLInputElement>(null);
  const baza = useId();
  const idLista = baza + "-lista";

  const grupuri = useMemo(() => cuCaiServite(continutPaletaContract(paleta, interogare, cai, RUTE, ARTICOLE), RUTE), [paleta, interogare, cai]);
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
      if (ales) deschide(ales.servita);
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
      <div className={s.panou} role="dialog" aria-modal="true" aria-label={paleta.eticheta}>
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
            aria-label={paleta.eticheta}
            placeholder={paleta.campExemplu}
            value={interogare}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setInterogare(e.target.value);
              setSelectat(0);
            }}
            onKeyDown={laTasta}
          />
          <button type="button" className={s.tastaEsc} onClick={onInchide} aria-label={paleta.inchide}>
            <span className={s.tastaEscText}>{paleta.tastaInchidere}</span>
            <Iconita nume="x" marime={16} contur={2} className={s.tastaEscIconita} />
          </button>
        </div>
        {plate.length === 0 ? (
          <p className={s.gol} role="status">
            {paleta.faraRezultate}
          </p>
        ) : (
          <ul id={idLista} className={s.lista} role="listbox" aria-label={paleta.eticheta}>
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
                        onClick={() => deschide(el.servita)}
                      >
                        <span className={s.elementTitlu}>{el.titlu}</span>
                        <span className={s.elementCale}>{el.servita}</span>
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
            <span className="doar-cititor">{paleta.ajutor.sageti}</span>
          </span>
          <span className={s.taste}>
            <span className={s.tasta} aria-hidden="true">
              <Iconita nume="corner-down-left" marime={11} contur={2} />
            </span>
            <span className="doar-cititor">{paleta.ajutor.enter}</span>
          </span>
          <span className={s.scurtatura}>{paleta.ajutor.scurtatura}</span>
        </div>
      </div>
    </div>
  );
}
