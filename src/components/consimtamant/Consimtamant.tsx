"use client";

// Bannerul de consimtamant si panoul de setari (forma masurata a sursei: `componente-globale.md` §7,
// in depozitul fabricii; biblioteca sursei se reproduce vizual, nu se importa).
//
// SE RANDEAZA NUMAI cand analitica e pornita (`src/lib/analitica.ts`: operator numit + ID GA4), si
// numai atunci ajunge si codul lui in pagina: `ConsimtamantLenes` il cere ca bucata separata de
// JavaScript, iar incarcatorul GA4 se cere abia la accept (`import()` mai jos). Cu analitica
// oprita, nici bannerul, nici codul lui nu sunt in pagina; proba e tests/browser/comutator.spec.ts,
// pe JavaScript-ul incarcat de fiecare ruta.
//
// CE E CORECT JURIDIC, pe langa forma sursei (Legea 506/2004 art. 4 alin. (5); GDPR art. 4 alin.
// (11) si art. 7; raportul EDPB pe bannere, 17.01.2023):
//   - primul strat are trei butoane de aceeasi marime; "Refuz tot" e buton, langa "Accept tot",
//     nu o legatura ascunsa, si la ACELASI nivel vizual: amandoua pline, in albastrul site-ului
//     (gdprscan SITE-04, "acelasi nivel de vizibilitate"). "Setari cookie-uri" ramane secundar;
//     in panou, la fel: acceptul si refuzul pline, "Salvati setarile" secundar;
//   - singura categorie cu acord ("Statistica") porneste OPRITA; categoria strict necesara nu are
//     caseta, are un indicator blocat, deci nicio caseta nu vine bifata;
//   - nimic de la Google nu se incarca inainte de accept (modul de baza, `incarcator-ga4.ts`), si
//     nici codul care l-ar incarca;
//   - retragerea e la fel de simpla ca acordul: legatura din subsolul oricarei pagini redeschide
//     panoul, iar "Refuz tot" opreste masurarea si sterge cookie-urile ei pe loc;
//   - fiecare alegere lasa un rand de evidenta pe server (`evidenta.ts`), cu versiunea informarii.
//
// Trei abateri de la sursa, deliberate: bannerul NU se ascunde fata de browserele automatizate
// (sursa il ascunde, deci un scaner de conformitate nu l-ar vedea), textele sunt in romana, iar
// refuzul e plin ca acceptul. La sursa numai acceptul e plin si refuzul sta pe ceata albastra, la
// 1,10:1 fata de bannerul alb, cand acceptul are 5,17:1: ierarhia primar/secundar ar trece inaintea
// cerintei ca refuzul sa fie la fel de vizibil (masurat de critic pe copia cu operator, 25.09.2026).
// Proba: tests/browser/comutator.spec.ts, simetria, cu martori pentru fundal si pentru margine.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { COOKIE_ALEGERE, furnizoriCategorie, type CookieDeclarat } from "@/content/juridic/furnizori";
import { urmaresteCta } from "./evenimente";
import { trimiteEvidenta } from "./evidenta";
import { SEMNAL_DESCHIDE_SETARI } from "./semnal";
import { opresteGa4 } from "./stare-ga4";
import { citesteAlegere, idNou, idPastrat, scrieAlegere, type Alegere, type Metoda } from "./stocare";
import { TEXTE_BANNER, TEXTE_PANOU, insignaServicii } from "./texte";
import s from "./Consimtamant.module.css";

/**
 * Porneste GA4 cerand incarcatorul abia acum, la accept. `dorita` e alegerea de ACUM: un refuz dat
 * cat timp bucata inca se descarca o gaseste falsa si incarcatorul nu mai porneste nimic. O bucata
 * care nu se poate descarca lasa masurarea oprita.
 */
function pornesteGa4LaAccept(id: string, dorita: { current: boolean }): void {
  import("./incarcator-ga4")
    .then((m) => {
      if (dorita.current) m.pornesteGa4(id);
    })
    .catch(() => {});
}

/** Adresele politicilor, sau `null` cat timp pagina lor nu exista pe site. */
export type LegaturiPolitici = {
  confidentialitate: string | null;
  cookie: string | null;
};

export type ConsimtamantProps = {
  /** ID-ul de masurare GA4, deja validat pe server. */
  idGa4: string;
  /** Versiunea informarii (`VERSIUNE_INFORMARE`), purtata de fiecare alegere. */
  versiune: string;
  legaturi: LegaturiPolitici;
};

const SERVICII_STATISTICA = furnizoriCategorie("statistica");

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Politica({ href, text, className }: { href: string | null; text: string; className: string }) {
  if (href === null) {
    return <span className={className}>{text}</span>;
  }
  return (
    <a href={href} className={className}>
      {text}
    </a>
  );
}

type CategorieProps = {
  titlu: string;
  insigna: string;
  insignaPastila: boolean;
  descriere: string;
  serviciu: string;
  cookieuri: CookieDeclarat[];
  /** `null` = categorie blocata (strict necesara), fara caseta. */
  activa: boolean | null;
  onSchimba?: (activa: boolean) => void;
  cheie: string;
};

function Categorie({ titlu, insigna, insignaPastila, descriere, serviciu, cookieuri, activa, onSchimba, cheie }: CategorieProps) {
  const [deschisa, setDeschisa] = useState(false);
  const idTitlu = useId();
  const idDetalii = useId();
  return (
    <div className={s.categorie} data-categorie={cheie}>
      <div className={s.categorieCap}>
        <button
          type="button"
          className={s.categorieButon}
          aria-expanded={deschisa}
          aria-controls={idDetalii}
          onClick={() => setDeschisa((d) => !d)}
        >
          <span className={s.chevron}>
            <Chevron />
          </span>
          <span id={idTitlu} className={s.categorieTitlu}>
            {titlu}
          </span>
        </button>
        <span className={insignaPastila ? s.insignaPastila : s.insignaText}>{insigna}</span>
        {activa === null ? (
          <span className={s.comutatorBlocat} aria-hidden="true" />
        ) : (
          <input
            type="checkbox"
            role="switch"
            className={s.comutator}
            checked={activa}
            onChange={(e) => onSchimba?.(e.target.checked)}
            aria-labelledby={idTitlu}
          />
        )}
      </div>
      <div id={idDetalii} className={s.categorieDetalii} hidden={!deschisa}>
        <p className={s.categorieText}>{descriere}</p>
        <table className={s.tabel}>
          <caption className={s.tabelTitlu}>{serviciu}</caption>
          <thead>
            <tr>
              <th scope="col">{TEXTE_PANOU.coloanaNume}</th>
              <th scope="col">{TEXTE_PANOU.coloanaDurata}</th>
              <th scope="col">{TEXTE_PANOU.coloanaScop}</th>
            </tr>
          </thead>
          <tbody>
            {cookieuri.map((c) => (
              <tr key={c.nume}>
                <td className={s.numeCookie}>{c.nume}</td>
                <td>{c.durata}</td>
                <td>{c.scop}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Consimtamant({ idGa4, versiune, legaturi }: ConsimtamantProps) {
  // `undefined` = inca necitita (pe server si la prima randare); `null` = nicio alegere valabila.
  const [alegere, setAlegere] = useState<Alegere | null | undefined>(undefined);
  const [aparut, setAparut] = useState(false);
  const [statisticaPanou, setStatisticaPanou] = useState(false);
  const panou = useRef<HTMLDialogElement>(null);
  /** Statistica acceptata ACUM; o citeste incarcatorul cand ajunge, ca sa nu porneasca dupa un refuz. */
  const statisticaDorita = useRef(false);
  const idTitlu = useId();
  const idDescriere = useId();
  const idPanou = useId();

  useEffect(() => {
    const pastrata = citesteAlegere(versiune);
    setAlegere(pastrata);
    statisticaDorita.current = pastrata?.statistica === true;
    if (statisticaDorita.current) pornesteGa4LaAccept(idGa4, statisticaDorita);
  }, [idGa4, versiune]);

  // Aparitia: clasa se pune la cadrul urmator, ca tranzitia de 0,25 s sa aiba de unde porni.
  useEffect(() => {
    if (alegere !== null) return;
    const cadru = window.requestAnimationFrame(() => setAparut(true));
    return () => window.cancelAnimationFrame(cadru);
  }, [alegere]);

  const deschidePanou = useCallback(() => {
    setStatisticaPanou(alegere?.statistica ?? false);
    const dialog = panou.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [alegere]);

  useEffect(() => {
    window.addEventListener(SEMNAL_DESCHIDE_SETARI, deschidePanou);
    return () => window.removeEventListener(SEMNAL_DESCHIDE_SETARI, deschidePanou);
  }, [deschidePanou]);

  useEffect(() => {
    if (!alegere?.statistica) return;
    return urmaresteCta();
  }, [alegere]);

  const alege = useCallback(
    (statistica: boolean, metoda: Metoda) => {
      const noua: Alegere = {
        versiune,
        id: alegere?.id ?? idPastrat() ?? idNou(),
        moment: new Date().toISOString(),
        statistica,
        metoda,
      };
      scrieAlegere(noua);
      statisticaDorita.current = statistica;
      if (statistica) pornesteGa4LaAccept(idGa4, statisticaDorita);
      else opresteGa4(idGa4);
      trimiteEvidenta(noua, window.location.pathname);
      setAlegere(noua);
      panou.current?.close();
    },
    [alegere, idGa4, versiune],
  );

  const vizibil = alegere === null;
  const statistica = SERVICII_STATISTICA.flatMap((f) => f.cookieuri);
  const numeServicii = SERVICII_STATISTICA.map((f) => f.serviciu).join(", ");

  return (
    <>
      <section
        className={s.banner + (vizibil && aparut ? " " + s.aparut : "")}
        data-consimtamant=""
        hidden={!vizibil}
        aria-labelledby={idTitlu}
        aria-describedby={idDescriere}
      >
        <div className={s.corp}>
          <div className={s.texte}>
            <h2 id={idTitlu} className={s.titlu}>
              {TEXTE_BANNER.titlu}
            </h2>
            <p id={idDescriere} className={s.descriere}>
              {TEXTE_BANNER.descriere}
            </p>
          </div>
          <div className={s.butoane}>
            <button type="button" className={s.buton + " " + s.butonPlin} data-accept="" onClick={() => alege(true, "accept-tot")}>
              {TEXTE_BANNER.accept}
            </button>
            <button type="button" className={s.buton + " " + s.butonPlin} data-refuz="" onClick={() => alege(false, "refuz-tot")}>
              {TEXTE_BANNER.refuz}
            </button>
            <button type="button" className={s.buton + " " + s.butonDeschis} data-setari="" onClick={deschidePanou}>
              {TEXTE_BANNER.setari}
            </button>
          </div>
        </div>
        <div className={s.picior}>
          <Politica href={legaturi.confidentialitate} text={TEXTE_BANNER.politicaConfidentialitate} className={s.legatura} />
          <Politica href={legaturi.cookie} text={TEXTE_BANNER.politicaCookie} className={s.legatura} />
        </div>
      </section>

      <dialog ref={panou} className={s.panou} aria-labelledby={idPanou} data-consimtamant-setari="">
        <div className={s.panouCap}>
          <h2 id={idPanou} className={s.panouTitlu}>
            {TEXTE_PANOU.titlu}
          </h2>
          <button type="button" className={s.inchide} aria-label={TEXTE_PANOU.inchide} onClick={() => panou.current?.close()}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 4 12 12M12 4 4 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={s.panouCorp}>
          <div className={s.sectiune}>
            <h3 className={s.sectiuneTitlu}>{TEXTE_PANOU.optiuniTitlu}</h3>
            <p className={s.sectiuneText}>{TEXTE_PANOU.optiuniText}</p>
          </div>
          <div className={s.categorii}>
            <Categorie
              cheie="strict-necesare"
              titlu={TEXTE_PANOU.necesareTitlu}
              insigna={TEXTE_PANOU.necesareInsigna}
              insignaPastila={false}
              descriere={TEXTE_PANOU.necesareText}
              serviciu="3S"
              cookieuri={[COOKIE_ALEGERE]}
              activa={null}
            />
            <Categorie
              cheie="statistica"
              titlu={TEXTE_PANOU.statisticaTitlu}
              insigna={insignaServicii(SERVICII_STATISTICA.length)}
              insignaPastila
              descriere={TEXTE_PANOU.statisticaText}
              serviciu={numeServicii}
              cookieuri={statistica}
              activa={statisticaPanou}
              onSchimba={setStatisticaPanou}
            />
          </div>
          <div className={s.informatii}>
            <h3 className={s.informatiiTitlu}>{TEXTE_PANOU.informatiiTitlu}</h3>
            <p className={s.informatiiText}>
              {TEXTE_PANOU.informatiiText}{" "}
              <Politica href={legaturi.cookie} text={TEXTE_PANOU.informatiiLegatura} className={s.legaturaText} />{" "}
              {TEXTE_PANOU.informatiiSi}{" "}
              <Politica href={legaturi.confidentialitate} text={TEXTE_PANOU.informatiiLegatura2} className={s.legaturaText} />.
            </p>
          </div>
        </div>
        <div className={s.panouPicior}>
          <div className={s.piciorStanga}>
            <button type="button" className={s.buton + " " + s.butonPlin} data-accept="" onClick={() => alege(true, "accept-tot")}>
              {TEXTE_BANNER.accept}
            </button>
            <button type="button" className={s.buton + " " + s.butonPlin} data-refuz="" onClick={() => alege(false, "refuz-tot")}>
              {TEXTE_BANNER.refuz}
            </button>
          </div>
          <button type="button" className={s.buton + " " + s.butonDeschis} data-salveaza="" onClick={() => alege(statisticaPanou, "setari")}>
            {TEXTE_PANOU.salveaza}
          </button>
        </div>
      </dialog>
    </>
  );
}
