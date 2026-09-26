// Piesele statice ale paginilor promo (COMPONENTE.md §4.4, "CarduriPromo"): tipografia comuna, cardul-
// macheta cu rama lui, cardurile primire / automatizare / sistemul national, statisticile haosului,
// declaratia in forma testimonialului si CTA-ul. Componente de server; piesele cu ceas (tastarea,
// numaratoarea, scanarea bonului) stau in fisiere client separate.

import { ArrowRight, Archive, Check, ChevronDown, CloudUpload, Folders, Image as IconitaImagine, Laptop, Paperclip } from "lucide-react";
import type { ReactNode } from "react";
import Sigla from "@/components/primitive/Sigla";
import Tinta from "@/components/primitive/Tinta";
import { CALE_INREGISTRARE } from "@/content/navigatie";
import {
  AUTOMATIZARE,
  ETICHETA_EXEMPLU,
  HAOS,
  PRIMIRE,
  SISTEM_NATIONAL,
  type Atribuire,
  type NumeIconitaHaos,
  type TitluCuAccent,
} from "@/content/promo";
import s from "./promo.module.css";

// --- tipografie --------------------------------------------------------------------------------

export function EtichetaPromo({ children }: { children: ReactNode }) {
  return <span className={s.eticheta}>{children}</span>;
}

export type Accent = "rosu" | "albastru" | "promo";

const CLASA_ACCENT: Record<Accent, string> = {
  rosu: s.accentRosu,
  albastru: s.accentAlbastru,
  promo: s.accentPromo,
};

/** Titlul mare (h1 pe primul ecran, h2 in rest): partea alba, rupere de rand, accentul colorat. */
export function TitluMare({
  titlu,
  accent,
  ca: Ca = "h2",
  strans = false,
}: {
  titlu: TitluCuAccent;
  accent: Accent;
  ca?: "h1" | "h2";
  strans?: boolean;
}) {
  return (
    <Ca className={["t-h1-promo", s.titluMare, strans ? s.titluStrans : ""].filter(Boolean).join(" ")}>
      {titlu.inainte}
      <br />
      <span className={CLASA_ACCENT[accent]}>{titlu.accent}</span>
    </Ca>
  );
}

export function TitluSimplu({ children, accent, strans = false }: { children: ReactNode; accent?: Accent; strans?: boolean }) {
  return (
    <h2 className={["t-h1-promo", s.titluMare, strans ? s.titluStrans : "", accent ? CLASA_ACCENT[accent] : ""].filter(Boolean).join(" ")}>
      {children}
    </h2>
  );
}

export function TitluCard({ children }: { children: ReactNode }) {
  return <h2 className={s.h2}>{children}</h2>;
}

export function Paragraf({ children, mare = false }: { children: ReactNode; mare?: boolean }) {
  return <p className={[s.paragraf, mare ? s.paragrafMare : ""].filter(Boolean).join(" ")}>{children}</p>;
}

/** Indicatorul de derulare: chevron de 20, contur 1,5, alb .12, "bob" 2,5 s (decor; oprit la miscare redusa). */
export function IndiciuDerulare({ text }: { text: string }) {
  return (
    <div className={s.indiciu}>
      <ChevronDown width={20} height={20} strokeWidth={1.5} aria-hidden="true" focusable="false" />
      <span className="doar-cititor">{text}</span>
    </div>
  );
}

// --- cardul-macheta ----------------------------------------------------------------------------

export type CardMachetaProps = {
  children: ReactNode;
  /** Eticheta mono din rama ("produs · modul"); fara ea rama poarta sigla 3S (pagina de scanare). */
  rama?: string;
  /** Eticheta accesibila: ce arata macheta si ca datele sunt fictive (plan D9). */
  declaratie: string;
  /** Eticheta vizibila "exemplu" (plan D11), pe machetele cu nume, sume sau coduri. */
  exemplu?: boolean;
  centrat?: boolean;
  /** Corpul cu padding 20 (pagina de scanare; promo: 17,6). */
  scanare?: boolean;
  corpClassName?: string;
  nume?: string;
};

export function CardMacheta({ children, rama, declaratie, exemplu = true, centrat = false, scanare = false, corpClassName, nume }: CardMachetaProps) {
  return (
    <figure className={s.card} data-macheta={nume}>
      <div className={s.rama}>
        {rama ? (
          <>
            <span className={s.punct} aria-hidden="true" />
            <span className={s.ramaText}>{rama}</span>
          </>
        ) : (
          <>
            <Sigla forma="marca" inaltime={18} alt="3S" className={s.ramaSigla} />
            <span className={s.ramaSpatiu} />
          </>
        )}
        {exemplu ? <span className={s.exemplu}>{ETICHETA_EXEMPLU}</span> : null}
      </div>
      <div className={[s.corp, scanare ? s.corpScanare : "", centrat ? s.corpCentrat : "", corpClassName].filter(Boolean).join(" ")}>{children}</div>
      <figcaption className="doar-cititor">{declaratie}</figcaption>
    </figure>
  );
}

// --- haosul ------------------------------------------------------------------------------------

const ICONITE_HAOS: Record<NumeIconitaHaos, typeof Folders> = {
  dosare: Folders,
  poza: IconitaImagine,
  atasament: Paperclip,
  cutie: Archive,
  laptop: Laptop,
};

export function IconiteHaos() {
  return (
    <div className={s.iconite} aria-hidden="true">
      {HAOS.iconite.map((n) => {
        const I = ICONITE_HAOS[n];
        return <I key={n} strokeWidth={1.5} focusable="false" />;
      })}
    </div>
  );
}

export function StatisticiHaos() {
  const lista = HAOS.statistici;
  return (
    <ul className={s.statistici}>
      {lista.flatMap((st, i) => {
        const el = (
          <li key={st.valoare} className={s.statistica}>
            <span className={[s.statisticaValoare, st.rosu ? s.statisticaRosie : ""].filter(Boolean).join(" ")}>{st.valoare}</span>
            <span className={s.statisticaEticheta}>{st.eticheta}</span>
          </li>
        );
        return i === 0 ? [el] : [<li key={"sep" + i} className={s.separator} aria-hidden="true" />, el];
      })}
    </ul>
  );
}

// --- cardurile ---------------------------------------------------------------------------------

export function CardPrimire() {
  return (
    <CardMacheta
      rama={PRIMIRE.rama}
      nume="primire"
      declaratie="Exemplu cu date fictive: un contract încărcat în 3S, recunoscut și așezat singur în dosarul lui."
    >
      <div className={s.depunere}>
        <CloudUpload width={22} height={22} strokeWidth={1.5} aria-hidden="true" focusable="false" />
        <span>{PRIMIRE.depunere}</span>
      </div>
      <div className={s.randAi}>
        <Check width={14} height={14} strokeWidth={3} aria-hidden="true" focusable="false" />
        <div className={s.randAiText}>
          <b className={s.numeFisier}>{PRIMIRE.fisier}</b>
          <small className={s.traseu}>{PRIMIRE.traseu}</small>
        </div>
      </div>
    </CardMacheta>
  );
}

export function CardAutomatizare() {
  const a = AUTOMATIZARE;
  return (
    <CardMacheta
      rama={a.rama}
      nume="automatizare"
      declaratie="Exemplu cu date fictive: o regulă automată din 3S și jurnalul pașilor făcuți de ea."
    >
      <div className={s.regula}>
        <span className={s.regulaEticheta}>{a.daca.eticheta}</span>
        <span className={[s.regulaValoare, s.conditie].join(" ")}>{a.daca.valoare}</span>
      </div>
      <div className={s.sageataJos} aria-hidden="true">
        ↓
      </div>
      <div className={s.regula}>
        <span className={s.regulaEticheta}>{a.atunci.eticheta}</span>
        <span className={[s.regulaValoare, s.actiune].join(" ")}>{a.atunci.valoare}</span>
      </div>
      <ul className={s.jurnal}>
        {a.jurnal.map((j) => (
          <li key={j.ora} className={s.intrare}>
            <span className={s.ora}>{j.ora}</span>
            <span>{j.act} →</span>
            <b>{j.rezultat}</b>
            <span className={s.auto}>{a.eticheteAuto}</span>
          </li>
        ))}
      </ul>
    </CardMacheta>
  );
}

export function CardSistemNational() {
  const n = SISTEM_NATIONAL;
  return (
    <CardMacheta
      rama={n.rama}
      nume="sistem-national"
      centrat
      declaratie="Exemplu cu date fictive: drumul unei facturi din 3S până în sistemul RO e-Factura."
    >
      <span className={s.documentTitlu}>{n.document}</span>
      <ol className={s.pasi}>
        {n.pasi.map((p) => (
          <li key={p} className={s.pasiRand}>
            <span className={s.pas}>{p}</span>
            <span className={s.sageataDreapta} aria-hidden="true">
              {" "}→
            </span>
          </li>
        ))}
        <li>
          <span className={[s.pas, s.pasOk].join(" ")}>{n.final} ✓</span>
        </li>
      </ol>
    </CardMacheta>
  );
}

// --- declaratia (forma testimonialului) --------------------------------------------------------

/**
 * Forma testimonialului (ghilimeaua, fraza italica, atribuirea), fara persoana si fara citat (plan §6.3):
 * fraza e declaratia marcii, deci sta intr-un `p`, nu intr-un `blockquote`, iar ghilimeaua e decor.
 */
export function Declaratie({
  fraza,
  atribuire,
  initiala,
  scanare = false,
}: {
  fraza: string;
  atribuire: Atribuire;
  initiala?: string;
  scanare?: boolean;
}) {
  return (
    <>
      <span className={[s.ghilimea, scanare ? s.ghilimeaScanare : ""].filter(Boolean).join(" ")} aria-hidden="true">
        &quot;
      </span>
      <p className={s.fraza}>{fraza}</p>
      <div className={s.atribuire}>
        {initiala ? (
          <span className={s.avatar} aria-hidden="true">
            {initiala}
          </span>
        ) : null}
        <div className={s.atribuireText}>
          <b className={[s.atribuireNume, scanare ? s.atribuireNumeScanare : ""].filter(Boolean).join(" ")}>{atribuire.nume}</b>
          <span className={[s.atribuireRol, scanare ? s.atribuireRolScanare : ""].filter(Boolean).join(" ")}>{atribuire.rol}</span>
        </div>
      </div>
    </>
  );
}

// --- CTA ---------------------------------------------------------------------------------------

/**
 * CTA-ul de la capat: titlul (h2 cu forma titlului CTA; la referinta al doilea h1 al paginii), paragraful,
 * butonul spre crearea contului prin `Tinta` (inert cat timp `/inregistrare` nu e in RUTE) si nota fina.
 */
export function CtaPromo({
  titlu,
  paragraf,
  buton,
  nota,
  scanare = false,
}: {
  titlu: ReactNode;
  paragraf: string;
  buton: string;
  nota: string;
  scanare?: boolean;
}) {
  return (
    <>
      <h2 className={["t-h1-cta-promo", s.ctaTitlu, scanare ? s.titluStrans : ""].filter(Boolean).join(" ")}>{titlu}</h2>
      <p className={s.paragraf}>{paragraf}</p>
      <Tinta
        legatura={{ text: buton, href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE }}
        className={[s.buton, scanare ? s.butonScanare : ""].filter(Boolean).join(" ")}
      >
        <span>{buton}</span>
        <ArrowRight width={18} height={18} strokeWidth={2} aria-hidden="true" focusable="false" />
      </Tinta>
      <small className={s.nota}>{nota}</small>
    </>
  );
}
