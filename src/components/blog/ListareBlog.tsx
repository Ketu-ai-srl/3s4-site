"use client";

// Lista de pe `/blog` (blog.md §A3): cautarea, pastilele de filtru, contorul, grila si „mai multe
// articole". Singura insula client a blogului, pe langa bara de progres.
//
// HTML-UL SERVIT e starea initiala: primele 9 carduri, fara filtru, deci un cititor fara JavaScript
// vede aceleasi carduri. Pastilele sunt legaturi reale spre LISTAREA filtrata (`/blog?categorie=<c>`),
// nu spre paginile categoriilor: tranzitia de vedere a site-ului (piesa globala) preia in faza de
// captura orice clic pe o legatura interna spre ALT pathname si navigheaza ea, deci o pastila spre
// `/blog/categorie/<c>` ducea pe alt sablon in loc sa filtreze, pentru oricine nu cere miscare redusa.
// Cu acelasi pathname tranzitia nu intervine, iar filtrul de mai jos ruleaza.
//
// ABATERI DE LA REFERINTA, cu motivul (COMPONENTE.md §5):
//   - clicul pe o pastila FILTREAZA pe loc si scrie categoria in adresa (`?categorie=`); la referinta
//     clicul schimba doar adresa, iar filtrul se aplica abia la reincarcare (defect masurat, 3b);
//   - cautarea potriveste si FARA diacritice (o interogare fara ele gaseste titlul scris cu ele;
//     decizia din fisa, 3g) si are eticheta accesibila (la referinta lipseste);
//   - contorul e o regiune `aria-live`: cine foloseste un cititor de ecran afla cate articole a gasit;
//   - dupa „mai multe articole" focusul trece pe primul card nou, nu ramane pe un buton care dispare.
// Clicul cu Ctrl, Shift, Alt sau rotita pe o pastila deschide listarea filtrata, ca orice legatura.
//
// RASPUNSUL LA APASARE (bugetul INP, 200 ms la 390 cu procesorul incetinit de 4 ori). Masurat pe 25.09:
// „mai multe articole" randa cardurile noi, le aseza si muta focusul in ACELASI task cu clicul, deci
// cadrul de dupa clic astepta 91-113 ms de scripturi, din care 53-76 ms asezare fortata. Acum:
//   - campul de cautare si pastila apasata se actualizeaza IMEDIAT (starea urgenta), iar lista se
//     filtreaza pe valorile amanate (`useDeferredValue`), deci o litera nu asteapta grila;
//   - pagina urmatoare si revenirea la prima pagina sunt tranzitii (`startTransition`): cadrul de
//     dupa apasare nu mai poarta randarea si asezarea cardurilor;
//   - cardurile sunt memorate: se randeaza doar cele noi sau mutate. Obiectele articolelor vin
//     neschimbate din `filtreaza`, deci comparatia superficiala a proprietatilor e suficienta.
// Contorul si starea goala urmeaza valorile amanate, ca sa descrie lista care se vede.

import { memo, startTransition, useDeferredValue, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Buton from "@/components/primitive/Buton";
import { CALE_BLOG, PARAMETRU_CATEGORIE, caleFiltru, esteCategorie, type CategorieBlog } from "@/content/blog/registru";
import { LISTARE } from "@/content/blog/texte";
import CardArticol from "./CardArticol";
import { contorGasite, filtreaza, type DateCard } from "./format";
import s from "./blog.module.css";

const CardListare = memo(CardArticol);

/** Cate carduri se arata la incarcare si cate se adauga la fiecare apasare (blog.md 3d, 3f). */
export const PE_PAGINA = 9;

export type PastilaCategorie = { slug: CategorieBlog; nume: string; cale: string };

export type ListareBlogProps = {
  articole: DateCard[];
  categorii: PastilaCategorie[];
};

function faraModificatori(e: MouseEvent<HTMLAnchorElement>): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

export default function ListareBlog({ articole, categorii }: ListareBlogProps) {
  const [interogare, setInterogare] = useState("");
  const [categorie, setCategorie] = useState<CategorieBlog | null>(null);
  const [pagini, setPagini] = useState(1);
  const focusDupaIncarcare = useRef<number | null>(null);
  const grila = useRef<HTMLDivElement | null>(null);

  // Categoria din adresa, la acces direct: aceeasi stare ca dupa un clic pe pastila.
  useEffect(() => {
    const dinAdresa = new URLSearchParams(window.location.search).get(PARAMETRU_CATEGORIE);
    if (esteCategorie(dinAdresa) && categorii.some((c) => c.slug === dinAdresa)) setCategorie(dinAdresa);
  }, [categorii]);

  const cautare = useDeferredValue(interogare);
  const categorieFiltrata = useDeferredValue(categorie);
  const potrivite = useMemo(() => filtreaza(articole, cautare, categorieFiltrata), [articole, cautare, categorieFiltrata]);
  const vizibile = potrivite.slice(0, pagini * PE_PAGINA);
  const filtrat = cautare.trim() !== "" || categorieFiltrata !== null;

  useEffect(() => {
    const index = focusDupaIncarcare.current;
    if (index === null) return;
    focusDupaIncarcare.current = null;
    grila.current?.querySelector<HTMLElement>('[data-card-index="' + index + '"]')?.focus();
  }, [pagini]);

  const alegeCategoria = (e: MouseEvent<HTMLAnchorElement>, c: CategorieBlog | null) => {
    if (!faraModificatori(e)) return;
    e.preventDefault();
    setCategorie(c);
    startTransition(() => setPagini(1));
    window.history.replaceState(window.history.state, "", caleFiltru(c));
  };

  const incarcaMaiMulte = () => {
    focusDupaIncarcare.current = vizibile.length;
    startTransition(() => setPagini((p) => p + 1));
  };

  return (
    <div className={s.lista}>
      <div className={s.cautare}>
        <label htmlFor="cautare-blog" className="doar-cititor">
          {LISTARE.etichetaCautare}
        </label>
        <svg className={s.cautareLupa} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id="cautare-blog"
          type="search"
          className={s.cautareCamp}
          placeholder={LISTARE.campExemplu}
          value={interogare}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setInterogare(e.target.value);
            startTransition(() => setPagini(1));
          }}
        />
      </div>

      <nav aria-label={LISTARE.etichetaPastile}>
        <ul className={s.pastileL}>
          <li>
            <a
              href={CALE_BLOG}
              className={s.pastilaL}
              aria-current={categorie === null ? "true" : undefined}
              onClick={(e) => alegeCategoria(e, null)}
            >
              {LISTARE.toate}
            </a>
          </li>
          {categorii.map((c) => (
            <li key={c.slug}>
              <a
                href={c.cale}
                className={s.pastilaL}
                aria-current={categorie === c.slug ? "true" : undefined}
                onClick={(e) => alegeCategoria(e, c.slug)}
              >
                {c.nume}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p className={filtrat ? s.contorL : s.contorAscuns} aria-live="polite">
        {filtrat ? contorGasite(potrivite.length) : ""}
      </p>

      {potrivite.length === 0 ? (
        <p className={s.gol}>{LISTARE.gol}</p>
      ) : (
        <div className={s.grilaL} ref={grila}>
          {vizibile.map((a, i) => (
            <CardListare key={a.slug} articol={a} varianta="L" index={i} />
          ))}
        </div>
      )}

      {potrivite.length > vizibile.length ? (
        <div className={s.maiMulte}>
          <Buton varianta="contur" className={s.butonMaiMulte} onClick={incarcaMaiMulte}>
            {LISTARE.maiMulte}
          </Buton>
        </div>
      ) : null}
    </div>
  );
}
