"use client";

// VEDEREA lumii constructorului (acasa-constructor.md §4-§12): ce apare dupa alegerea unei industrii.
// Nu importa nicio valoare din `src/content/`: textele, functiile de text, calculul si tintele vin in
// `continut`, pus de invelitoarea editiei. Invelitoarea RO e `Lume.tsx` (aceeasi cale si acelasi export
// ca inainte, incarcata lenes din `Constructor`); editiile 3s.md au invelitoarele lor
// (`ConstructorLumeEn.tsx`, `ConstructorLumeRoMd.tsx`). Asa continutul RO, cu sumele in lei, nu intra in
// bucatile JS ale paginilor 3s.md (specificatia de congruenta, §2.3).
//
//   - randul de control (industria aleasa + "inapoi la domenii") si fraza industriei;
//   - panoul cu programul de pasi si, in spatele lui, arborele 3D (montat numai de la 1341 px);
//   - chestionarul, cu duelul si estimarea.
//
// IN DOUA TREPTE, ca primul cadru dupa clic sa nu astepte asezarea panoului (plan §8.4: INP de cel
// mult 200 ms la 390, cu procesorul incetinit de 4 ori). Cu tot panoul in clic, primul cadru venea,
// in 8 din 9 rulari, la 0,35-0,62 s, iar in urma clicului asezarea si modelarea textului duceau cam
// jumatate din sarcina (masurat 25.09). Clicul pune acum pe ecran capul lumii: randul de control,
// fraza si locul panoului, inalt cat fereastra, ca sectiunea urmatoare sa nu urce in cadru.
// Panoul, arborele si chestionarul vin in treapta a doua, ca tranzitie React, dupa primul cadru.
// Cardul intra oricum abia la pasul `start` al programului (~205 ms dupa clic), iar programul se
// socoteste de la CLIC (`momentAlegere`), nu de la montarea panoului: cronologia din fisa nu se
// muta cu treapta a doua. Dupa reparatie, primul clic la 390 cu procesorul x4: 88-200 ms in 17
// rulari (masurat 25.09); proba de browser tine pragul de 200 ms.
//
// La montare focusul trece, fara derulare, pe legatura de schimbare (§4.1). Ea e in capul lumii,
// deci in prima treapta.
//
// CAMPURILE OPTIONALE ale tipurilor de mai jos sunt cele pe care editiile 3s.md nu le au (decizia 59,
// forma (a) a intrebarii 2): lista de reguli si randul de integrari ale panoului (decizia 43), benzile
// si toast-urile scenelor, pista termenului din scena Avocatura. Constanta RO le are pe toate, deci pe
// RO fiecare ramura conditionala da acelasi DOM ca inainte.

import { startTransition, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CapConstructor, CodCanal, CodCine, CodIndustrie, CodVolum, ParametriInregistrare } from "@/content/acasa";
import type {
  Banda,
  DuelIndustrie,
  Estimare,
  FisierDuel,
  ObiectAsigurari,
  ObiectAvocatura,
  ObiectConstructii,
  ObiectConsultanta,
  ObiectContabilitate,
  ObiectImobiliare,
  ObiectIt,
  ObiectLogistica,
  ObiectNotariat,
  OptiuneCine,
} from "@/content/acasa-constructor";
import type { Legatura } from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import Arbore3D from "./Arbore3D";
import Chestionar from "./Chestionar";
import Panou, { semnalGol, type SemnalArbore } from "./Panou";
import { bandaCanalelorActiva, type Raspunsuri } from "./stare";
import s from "./Lume.module.css";
import sp from "./Panou.module.css";

// ---------------------------------------------------------------------------------------------
// Continutul lumii, pe editie (tipuri locale, structurale: constantele RO le satisfac neschimbate)
// ---------------------------------------------------------------------------------------------

/** O tinta de buton: legatura si, pentru un canal de contact, numele lui (`data-canal`). */
export type TintaConstructor = { legatura: Legatura; canal?: "whatsapp" };

export type ComunConstructor = {
  schimba: string;
  numeSpatiu: string;
  tipSpatiu: string;
  progres: string;
  reluare: string;
  /** Titlul listei de reguli; fara el, blocul benzilor nu se randeaza. */
  automatizari?: string;
  /** Randul de compatibilitate; fara el, nu se randeaza. */
  integrari?: { eticheta: string; elemente: { iconita: "server" | "mail"; text: string }[] };
  final: { titlu: string; subRand: string; buton: string };
  anuntGata: string;
};

/** Numele canalelor: in banda canalelor (numai pe RO), in fraza duelului si pe insigna documentului. */
export type NumeCanalConstructor = Record<CodCanal, { banda?: string; fraza: string; insigna: string }>;

export type ChestionarConstructor = {
  titlu: string;
  descriere: string;
  canale: { intrebare: string; optiuni: { cod: CodCanal; text: string }[] };
  volum: { intrebare: string; optiuni: { cod: CodVolum; text: string }[] };
  cine: { intrebare: string; optiuni: OptiuneCine[] };
  confirma: string;
  confirmat: string;
};

export type DuelConstructor = {
  eticheta: string;
  reluare: string;
  firmaFara: string;
  firmaCu: string;
  nesortate: string;
  inOrdine: string;
  timpPierdut: string;
  termeneRatate: string;
  timpEconomisit: string;
  faraEticheta: string;
  ai: string;
  calm: string;
  cine: Record<CodCine, string>;
  final: Record<CodCine, string>;
  volumInCuvinte: Record<CodVolum, string>;
  scor: { nesortate: string; timp: string; termene: string; vs: string };
  declaratie: string;
};

export type EstimareConstructor = {
  eticheta: string;
  cifra: string;
  formula: string;
  manual: string;
  cuProdus: string;
  morala: Record<CodCine, string>;
  buton: string;
  nota: string;
};

/** Campurile pistei termenului din scena Avocatura: fara ele, pista si numaratoarea nu se randeaza. */
type CampTermen = "zileInitial" | "zileCorect" | "dataInitiala" | "dataCorecta";

export type ObiectAvocaturaEditie = Omit<ObiectAvocatura, CampTermen> & Partial<Pick<ObiectAvocatura, CampTermen>>;

/** Duelul unei industrii: fara toast, anuntul automat din dreapta nu apare. */
export type DuelIndustrieEditie = Omit<DuelIndustrie, "toast"> & { toast?: string };

type ObiecteEditie = {
  constructii: ObiectConstructii;
  contabilitate: ObiectContabilitate;
  logistica: ObiectLogistica;
  it: ObiectIt;
  avocatura: ObiectAvocaturaEditie;
  imobiliare: ObiectImobiliare;
  asigurari: ObiectAsigurari;
  notariat: ObiectNotariat;
  consultanta: ObiectConsultanta;
};

export type ScenariuEditie<K extends CodIndustrie = CodIndustrie> = {
  fraza: string;
  durere: string;
  concluzie: string;
  /** Benzile scenei; fara ele, panoul nu are benzi (pe RO, plus banda canalelor). */
  benzi?: Banda[];
  duel: DuelIndustrieEditie;
  obiect: ObiecteEditie[K];
};

export type ScenariiEditie = { [K in CodIndustrie]: ScenariuEditie<K> };

/** Functiile de text ale editiei: sabloane, liste de canale, timpi, benzile de pe ecran. */
export type TextConstructor = {
  completeaza: (sablon: string, valori: Record<string, string | number>) => string;
  listaCanale: (canale: readonly CodCanal[], forma: "fraza") => string;
  formatTimp: (minute: number) => string;
  formatMinute: (minute: number) => string;
  benziPeEcran: (cod: CodIndustrie, canale: readonly CodCanal[] | null) => Banda[];
};

/** Calculul (formula estimarii si parametrii duelului): acelasi pe toate editiile, dat ca exemplu. */
export type CalculConstructor = {
  estimare: (numarCanale: number, volum: CodVolum) => Estimare;
  zileLucratoare: number;
  parametriDuel: Record<CodVolum, { documente: number; pas: number; termene: number[] }>;
  indiciTermeneRatate: (volum: CodVolum) => number[];
  indiciToast: (volum: CodVolum) => number[];
  minutePeDocument: (numarCanale: number) => number;
  numeFisier: (f: FisierDuel, ciclu: number) => string;
};

export type ContinutLume = {
  cap: CapConstructor;
  comun: ComunConstructor;
  numeCanal: NumeCanalConstructor;
  chestionar: ChestionarConstructor;
  duel: DuelConstructor;
  estimare: EstimareConstructor;
  scenarii: ScenariiEditie;
  text: TextConstructor;
  calcul: CalculConstructor;
  /** Butonul final al panoului si CTA-ul estimarii (cu raspunsurile chestionarului). */
  tinte: { final: TintaConstructor; estimare: (p: ParametriInregistrare) => TintaConstructor };
};

/** Atributul de canal al unei tinte, numai cand tinta il are (pe RO, niciunul). */
export function atributeCanal(t: TintaConstructor): { "data-canal"?: "whatsapp" } {
  return t.canal ? { "data-canal": t.canal } : {};
}

// ---------------------------------------------------------------------------------------------
// Lumea
// ---------------------------------------------------------------------------------------------

/** Proprietatile pe care `ConstructorVedere` le da lumii, oricare ar fi editia. */
export type PropsLume = {
  industrie: CodIndustrie;
  raspunsuri: Raspunsuri;
  setRaspunsuri: (f: (r: Raspunsuri) => Raspunsuri) => void;
  /** Sectiunea e vizibila macar 15%: altfel programul panoului se opreste. */
  vizibil: boolean;
  laSchimbare: () => void;
  /** `performance.now()` la clicul care a ales industria: de aici se socoteste programul. */
  momentAlegere: number;
  /** Legatura canalului de contact a paginii (editiile 3s.md); invelitoarea RO nu o foloseste. */
  tinta?: string | null;
};

/** Latimea de la care arborele are loc langa panou (§8); sub ea nu se monteaza deloc. */
export const INTERVAL_ARBORE = "(min-width: 1341px)";

function abonareArbore(anunta: () => void): () => void {
  const m = window.matchMedia(INTERVAL_ARBORE);
  m.addEventListener("change", anunta);
  return () => m.removeEventListener("change", anunta);
}

function arboreIncape(): boolean {
  return window.matchMedia(INTERVAL_ARBORE).matches;
}

function faraArbore(): boolean {
  return false;
}

export default function LumeVedere({
  industrie,
  raspunsuri,
  setRaspunsuri,
  vizibil,
  laSchimbare,
  momentAlegere,
  continut,
}: PropsLume & { continut: ContinutLume }) {
  const c = continut;
  const ind = c.cap.industrii.find((i) => i.cod === industrie) ?? c.cap.industrii[0];
  const scenariu = c.scenarii[industrie];
  const benzi = c.text.benziPeEcran(industrie, bandaCanalelorActiva(raspunsuri) ? raspunsuri.canale : null);
  const [reluari, setReluari] = useState(0);
  /** Treapta a doua: panoul, arborele si chestionarul sunt in pagina. */
  const [completa, setCompleta] = useState(false);
  const cuArbore = useSyncExternalStore(abonareArbore, arboreIncape, faraArbore);
  const semnal = useRef<SemnalArbore>(semnalGol());
  const schimba = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    schimba.current?.focus({ preventScroll: true });
    startTransition(() => setCompleta(true));
  }, []);

  const laReluare = useCallback(() => setReluari((r) => r + 1), []);

  return (
    <div className={s.lume} data-industrie-aleasa={industrie} data-lume={completa ? "completa" : "cap"}>
      <div className={s.control}>
        <span className={s.ales}>
          <Iconita nume={ind.iconita} marime={15} contur={1.3} className={s.iconitaAleasa} />
          <span>{ind.nume}</span>
          <button ref={schimba} type="button" className={s.schimba} onClick={laSchimbare}>
            {c.comun.schimba}
          </button>
        </span>
      </div>
      <p className={s.fraza}>{scenariu.fraza}</p>

      {completa ? (
        <>
          <div className={sp.gazdaScena}>
            {cuArbore ? <Arbore3D semnal={semnal} /> : null}
            <Panou
              key={industrie}
              industrie={industrie}
              numeIndustrie={ind.nume}
              scenariu={scenariu}
              benzi={benzi}
              cheie={raspunsuri.rulare * 1000 + reluari}
              activ={vizibil}
              semnal={semnal}
              laReluare={laReluare}
              momentAlegere={momentAlegere}
              continut={c}
            />
          </div>

          <Chestionar industrie={industrie} raspunsuri={raspunsuri} setRaspunsuri={setRaspunsuri} continut={c} />
        </>
      ) : (
        <div className={s.locPanou} aria-hidden="true" data-loc-panou="" />
      )}
    </div>
  );
}
