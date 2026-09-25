"use client";

// Formularul de contact (COMPONENTE §4.7; enterprise.md §4, contact.md §7). Piesa COMUNA: o folosesc
// `/enterprise` si, in felia conversie, `/contact`. Se pune in pagina prin `SectiuneFormular` (server),
// care decide starea din comutatorul operatorului si randeaza nota de informare.
//
// STARI: editare -> (validare, corector) -> trimitere -> succes | rezerva.
//   - Validarea e in script, fara `required` in HTML (ca la referinta): nume, e-mail si mesaj.
//   - Corectorul: un domeniu de e-mail scris gresit opreste primul clic; al doilea trimite.
//   - `activ = false` (operatorul `null`): dupa validare NU pleaca nicio cerere; langa buton apare
//     mesajul cinstit ca nimic nu s-a trimis si nimic nu s-a salvat.
//   - `activ = true`: cererea merge la `/api/formular`; 2xx -> succes; orice altceva, inclusiv reteaua
//     cazuta -> rezerva (previzualizarea mesajului, trimitere prin aplicatia de e-mail sau copiere).
//
// Analitica: numai evenimentele din lista inchisa (`formular_inceput`, `formular_trimis`), prin
// `trimiteEveniment`, care nu trimite nimic fara GA4 pornit si acceptat. Modulul lui se incarca
// LENES si numai cand serverul spune ca analitica e pornita: cu analitica oprita, codul ei nu are
// voie sa fie in JavaScript-ul paginii (proba comutatorului, tests/browser/comutator.spec.ts).

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Formular } from "@/components/consimtamant/evenimente";
import { CAMPURI, ERORI, FORMULAR } from "@/content/formular";
import CampFormular from "./CampFormular";
import CorectorEmail from "./CorectorEmail";
import { propunereEmail } from "./corector";
import type { StareFormular } from "./stare";
import { CAMPURI_TEXT, valideaza, type CampText, type DateFormular, type Erori } from "./validare";
import s from "./Formular.module.css";

export const CALE_API_FORMULAR = "/api/formular";

export type FormularContactProps = {
  formular: Formular;
  stare: StareFormular;
  exempluMesaj: string;
  /** Inceputul subiectului din previzualizarea de rezerva. */
  subiect: string;
  /** Nota de informare (randata pe server, cu legatura spre politica). */
  informare: ReactNode;
};

type Etapa = "editare" | "trimitere" | "succes" | "rezerva";

const GOL: DateFormular = { nume: "", email: "", telefon: "", companie: "", mesaj: "", marketing: false };

/** Corpul mesajului din previzualizare: cate un camp completat pe rand, apoi mesajul. */
export function corpPrevizualizare(d: DateFormular): string {
  const randuri = (["nume", "email", "telefon", "companie"] as const)
    .filter((c) => d[c].trim() !== "")
    .map((c) => CAMPURI[c].eticheta + ": " + d[c].trim());
  return [...randuri, "", d.mesaj.trim()].join("\n");
}

export function subiectPrevizualizare(subiect: string, d: DateFormular): string {
  return d.companie.trim() === "" ? subiect : subiect + " - " + d.companie.trim();
}

type EvenimentFormular = "formular_inceput" | "formular_trimis";

function eveniment(activa: boolean, nume: EvenimentFormular, formular: Formular) {
  if (!activa) return;
  void import("@/components/consimtamant/evenimente").then(
    (m) => m.trimiteEveniment(nume, { formular }),
    () => undefined,
  );
}

export default function FormularContact({ formular, stare, exempluMesaj, subiect, informare }: FormularContactProps) {
  const [date, setDate] = useState<DateFormular>(GOL);
  const [erori, setErori] = useState<Erori>({});
  const [etapa, setEtapa] = useState<Etapa>("editare");
  const [propunere, setPropunere] = useState<string | null>(null);
  const [emailConfirmat, setEmailConfirmat] = useState<string | null>(null);
  const [inactiv, setInactiv] = useState(false);
  const [copiere, setCopiere] = useState<"" | "copiat" | "necopiat">("");
  const inceput = useRef(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const id = "formular-" + formular;

  const schimba = (camp: CampText) => (v: string) => {
    setDate((d) => ({ ...d, [camp]: v }));
    setInactiv(false);
    if (erori[camp]) setErori((e) => ({ ...e, [camp]: undefined }));
    if (camp === "email") {
      setPropunere(null);
      setEmailConfirmat(null);
    }
  };

  const laFocus = () => {
    if (inceput.current) return;
    inceput.current = true;
    eveniment(stare.analitica, "formular_inceput", formular);
  };

  const laTrimitere = async (e: FormEvent) => {
    e.preventDefault();
    if (etapa === "trimitere") return;
    const gasite = valideaza(date);
    setErori(gasite);
    const primul = CAMPURI_TEXT.find((c) => gasite[c]);
    if (primul) {
      formRef.current?.querySelector<HTMLElement>("#" + id + "-" + primul)?.focus();
      return;
    }
    const p = propunereEmail(date.email);
    if (p && emailConfirmat !== date.email) {
      setPropunere(p);
      setEmailConfirmat(date.email);
      return;
    }
    setPropunere(null);
    if (!stare.activ) {
      // Operatorul e null: nimic nu pleaca. Nicio cerere, nicio stocare.
      setInactiv(true);
      return;
    }
    setEtapa("trimitere");
    try {
      const raspuns = await fetch(CALE_API_FORMULAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formular, ...date }),
      });
      if (!raspuns.ok) throw new Error("raspuns " + raspuns.status);
      eveniment(stare.analitica, "formular_trimis", formular);
      setEtapa("succes");
    } catch {
      setEtapa("rezerva");
    }
  };

  const copiaza = async () => {
    try {
      await navigator.clipboard.writeText(subiectPrevizualizare(subiect, date) + "\n\n" + corpPrevizualizare(date));
      setCopiere("copiat");
    } catch {
      setCopiere("necopiat");
    }
  };

  const randDirect = stare.adresa ? (
    <p className={s.direct}>
      {FORMULAR.directInainte}{" "}
      <a className={s.directAdresa} href={"mailto:" + stare.adresa}>
        {stare.adresa}
      </a>
    </p>
  ) : null;

  if (etapa === "succes") {
    return (
      <div className={s.card}>
        <div className={s.succes} role="status">
          <span className={s.succesCerc} aria-hidden="true">
            <Check size={28} strokeWidth={2} />
          </span>
          <h3 className={s.succesTitlu}>{FORMULAR.succes.titlu}</h3>
          <p className={s.succesText}>{FORMULAR.succes.text}</p>
          {randDirect}
        </div>
      </div>
    );
  }

  if (etapa === "rezerva") {
    const subiectComplet = subiectPrevizualizare(subiect, date);
    const corp = corpPrevizualizare(date);
    return (
      <div className={s.card}>
        <div className={s.rezerva}>
          <button type="button" className={s.inapoi} onClick={() => setEtapa("editare")}>
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            <span>{FORMULAR.rezerva.inapoi}</span>
          </button>
          <p className={s.rezervaExplicatie} role="alert">
            {FORMULAR.rezerva.explicatie}
          </p>
          <div className={s.previzualizare}>
            <p className={s.previzualizareSubiect}>{subiectComplet}</p>
            <p className={s.previzualizareCorp}>{corp}</p>
          </div>
          <div className={[s.rezervaButoane, stare.adresa ? "" : s.rezervaUnButon].join(" ")}>
            {stare.adresa ? (
              <a
                className={s.butonPlin}
                href={
                  "mailto:" +
                  stare.adresa +
                  "?subject=" +
                  encodeURIComponent(subiectComplet) +
                  "&body=" +
                  encodeURIComponent(corp)
                }
              >
                {FORMULAR.rezerva.deschide}
              </a>
            ) : null}
            <button type="button" className={s.butonContur} onClick={copiaza}>
              {FORMULAR.rezerva.copiaza}
            </button>
          </div>
          {copiere ? (
            <p className={s.indiciu} role="status">
              {copiere === "copiat" ? FORMULAR.rezerva.copiat : FORMULAR.rezerva.necopiat}
            </p>
          ) : null}
          {randDirect}
        </div>
      </div>
    );
  }

  const eroare = (c: CampText) => (erori[c] ? (ERORI[c][erori[c]!] ?? null) : null);
  const camp = (c: Exclude<CampText, "mesaj">) => (
    <CampFormular
      id={id + "-" + c}
      nume={c}
      eticheta={CAMPURI[c].eticheta}
      tip={CAMPURI[c].tip}
      exemplu={CAMPURI[c].exemplu}
      autocomplete={CAMPURI[c].autocomplete}
      obligatoriu={c === "nume" || c === "email"}
      valoare={date[c]}
      laSchimbare={schimba(c)}
      laFocus={laFocus}
      eroare={eroare(c)}
      sub={
        c === "email" && propunere ? (
          <CorectorEmail
            propunere={propunere}
            laAlegere={() => {
              setDate((d) => ({ ...d, email: propunere }));
              setPropunere(null);
              setEmailConfirmat(null);
            }}
          />
        ) : null
      }
    />
  );

  return (
    <div className={s.card}>
      <form ref={formRef} className={s.formular} noValidate onSubmit={laTrimitere} aria-label={FORMULAR.trimite}>
        <div className={s.rand}>
          {camp("nume")}
          {camp("email")}
        </div>
        <div className={s.rand}>
          {camp("telefon")}
          {camp("companie")}
        </div>
        <CampFormular
          id={id + "-mesaj"}
          nume="mesaj"
          eticheta={CAMPURI.mesaj.eticheta}
          tip="textarea"
          exemplu={exempluMesaj}
          autocomplete={CAMPURI.mesaj.autocomplete}
          obligatoriu
          valoare={date.mesaj}
          laSchimbare={schimba("mesaj")}
          laFocus={laFocus}
          eroare={eroare("mesaj")}
          latimePlina
        />
        <label className={s.bifa}>
          <input
            type="checkbox"
            name="marketing"
            checked={date.marketing}
            onFocus={laFocus}
            onChange={(e) => setDate((d) => ({ ...d, marketing: e.target.checked }))}
          />
          <span>{FORMULAR.marketing}</span>
        </label>
        <button type="submit" className={s.trimite} disabled={etapa === "trimitere"}>
          <span>{etapa === "trimitere" ? FORMULAR.trimitere : FORMULAR.trimite}</span>
          <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <p className={s.inactiv} role="status" data-formular-inactiv={inactiv ? "" : undefined}>
          {inactiv ? FORMULAR.inactiv : null}
        </p>
        {informare}
      </form>
    </div>
  );
}
