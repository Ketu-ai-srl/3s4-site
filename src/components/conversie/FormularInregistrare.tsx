"use client";

// Formularul de cont nou (COMPONENTE §4.11 "FormularInregistrare"; inregistrare.md §2b), insula de
// browser. Pagina (server) ii da starea din comutatorul operatorului, etichetele codurilor venite din
// constructor si nodurile cu legaturi (termenii, nota de informare, ajutorul), randate prin `Tinta`.
//
// STARI: editare -> (validare la trimitere, corector de domeniu) -> inactiv | trimitere -> succes | eroare.
//   - Validarea se face la trimitere, nu la parasirea campului (ca la referinta); campurile gresite
//     primesc `aria-invalid`, mesajul legat prin `aria-describedby`, iar focusul sare pe primul.
//   - La parola, indiciul insusi devine eroarea (acelasi rand, rosu).
//   - Corectorul de e-mail (piesa inghetata): primul clic cu un domeniu scris gresit nu trimite.
//   - Operator `null` (azi): nicio cerere; langa buton apare mesajul cinstit.
//   - Cu operator: cererea pleaca la `/api/formular`, pe contractul lui, FARA parola (`inregistrare.ts`).
//
// Analitica: numai `formular_inceput` si `formular_trimis`, din lista inchisa, cu modulul incarcat
// lenes si numai cand serverul spune ca analitica e pornita (ca in formularul de contact).

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import CorectorEmail from "@/components/formular/CorectorEmail";
import { propunereEmail } from "@/components/formular/corector";
import type { StareFormular } from "@/components/formular/stare";
import { INREGISTRARE } from "@/content/conversie";
import {
  corpCerere,
  GOL_INREGISTRARE,
  primaEroare,
  rezumatConstructor,
  valideazaInregistrare,
  type CampInregistrare,
  type DateInregistrare,
  type EroriInregistrare,
  type EticheteConstructor,
  type RezumatConstructor,
} from "./inregistrare";
import s from "./inregistrare.module.css";

export const CALE_API = "/api/formular";

type Etapa = "editare" | "trimitere" | "succes" | "eroare";

function eveniment(activa: boolean, nume: "formular_inceput" | "formular_trimis") {
  if (!activa) return;
  void import("@/components/consimtamant/evenimente").then(
    (m) => m.trimiteEveniment(nume, { formular: "inregistrare" }),
    () => undefined,
  );
}

export type FormularInregistrareProps = {
  stare: StareFormular;
  etichete: EticheteConstructor;
  /** Textul bifei de termeni, cu legatura (randat pe server). */
  termeni: ReactNode;
  /** Nota de informare, cu legatura spre politica (randata pe server). */
  informare: ReactNode;
  /** Legatura de ajutor de sub nota (randata pe server). */
  ajutor: ReactNode;
};

export default function FormularInregistrare({ stare, etichete, termeni, informare, ajutor }: FormularInregistrareProps) {
  const t = INREGISTRARE;
  const [date, setDate] = useState<DateInregistrare>(GOL_INREGISTRARE);
  const [erori, setErori] = useState<EroriInregistrare>({});
  const [etapa, setEtapa] = useState<Etapa>("editare");
  const [vizibila, setVizibila] = useState(false);
  const [propunere, setPropunere] = useState<string | null>(null);
  const [emailConfirmat, setEmailConfirmat] = useState<string | null>(null);
  const [inactiv, setInactiv] = useState(false);
  const [rezumat, setRezumat] = useState<RezumatConstructor | null>(null);
  const inceput = useRef(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Parametrii constructorului se citesc dupa hidratare: HTML-ul servit e acelasi pentru toti.
  useEffect(() => {
    setRezumat(rezumatConstructor(new URLSearchParams(window.location.search), etichete));
  }, [etichete]);

  const id = (c: string) => "inregistrare-" + c;

  const schimba = (camp: CampInregistrare) => (v: string) => {
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
    eveniment(stare.analitica, "formular_inceput");
  };

  const laTrimitere = async (ev: FormEvent) => {
    ev.preventDefault();
    if (etapa === "trimitere") return;
    const gasite = valideazaInregistrare(date);
    setErori(gasite);
    const primul = primaEroare(gasite);
    if (primul) {
      formRef.current?.querySelector<HTMLElement>("#" + id(primul))?.focus();
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
      // Operatorul e null: nimic nu pleaca, nimic nu se salveaza.
      setInactiv(true);
      return;
    }
    setEtapa("trimitere");
    try {
      const raspuns = await fetch(CALE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          corpCerere(date, rezumat, {
            mesajCerere: t.mesajCerere,
            mesajUtilizator: t.mesajUtilizator,
            domeniu: t.rezumat.domeniu,
            canale: t.rezumat.canale,
            volum: t.rezumat.volum,
            cine: t.rezumat.cine,
          }),
        ),
      });
      if (!raspuns.ok) throw new Error("raspuns " + raspuns.status);
      eveniment(stare.analitica, "formular_trimis");
      setEtapa("succes");
    } catch {
      setEtapa("eroare");
    }
  };

  if (etapa === "succes") {
    return (
      <div className={s.succes} role="status">
        <span className={s.succesCerc} aria-hidden="true">
          <Check size={28} strokeWidth={2} />
        </span>
        <h2 className={s.succesTitlu}>{t.succes.titlu}</h2>
        <p className={s.succesText}>{t.succes.text}</p>
      </div>
    );
  }

  const mesaj = (c: CampInregistrare | "termeni") => {
    const cod = erori[c];
    return cod ? t.erori[cod] : null;
  };

  const camp = (
    c: Exclude<CampInregistrare, "parola">,
    tip: "text" | "email" | "tel",
    obligatoriu: boolean,
    sub?: ReactNode,
  ) => {
    const eroare = mesaj(c);
    const cfg = t.campuri[c];
    return (
      <div className={s.grup}>
        <label htmlFor={id(c)} className={s.eticheta}>
          {cfg.eticheta}
        </label>
        <input
          id={id(c)}
          name={c}
          type={tip}
          value={date[c]}
          placeholder={cfg.exemplu}
          autoComplete={cfg.autocomplete}
          onChange={(e) => schimba(c)(e.target.value)}
          onFocus={laFocus}
          aria-invalid={eroare ? true : undefined}
          aria-required={obligatoriu ? true : undefined}
          aria-describedby={eroare ? id(c) + "-eroare" : undefined}
          className={[s.camp, eroare ? s.campEroare : ""].filter(Boolean).join(" ")}
        />
        {eroare ? (
          <p id={id(c) + "-eroare"} className={s.eroare}>
            {eroare}
          </p>
        ) : null}
        {sub}
      </div>
    );
  };

  const eroareParola = mesaj("parola");
  const eroareTermeni = mesaj("termeni");

  return (
    <form ref={formRef} className={s.formular} noValidate onSubmit={laTrimitere} aria-label={t.buton}>
      {rezumat ? (
        <div className={s.rezumat} data-rezumat-constructor="">
          <p className={s.rezumatTitlu}>{t.rezumat.titlu}</p>
          <dl className={s.rezumatLista}>
            {rezumat.industrie ? (
              <div>
                <dt>{t.rezumat.domeniu}</dt>
                <dd>{rezumat.industrie}</dd>
              </div>
            ) : null}
            {rezumat.canale ? (
              <div>
                <dt>{t.rezumat.canale}</dt>
                <dd>{rezumat.canale.join(", ")}</dd>
              </div>
            ) : null}
            {rezumat.volum ? (
              <div>
                <dt>{t.rezumat.volum}</dt>
                <dd>{rezumat.volum}</dd>
              </div>
            ) : null}
            {rezumat.cine ? (
              <div>
                <dt>{t.rezumat.cine}</dt>
                <dd>{rezumat.cine}</dd>
              </div>
            ) : null}
          </dl>
          <p className={s.rezumatNota}>{t.rezumat.nota}</p>
        </div>
      ) : null}

      <div className={s.randNume}>
        {camp("prenume", "text", true)}
        {camp("nume", "text", true)}
      </div>
      <div className={s.randContact}>
        {camp(
          "email",
          "email",
          true,
          propunere ? (
            <CorectorEmail
              propunere={propunere}
              laAlegere={() => {
                setDate((d) => ({ ...d, email: propunere }));
                setPropunere(null);
                setEmailConfirmat(null);
              }}
            />
          ) : null,
        )}
        {camp("telefon", "tel", false)}
      </div>
      {camp("utilizator", "text", true)}

      <div className={s.grup}>
        <label htmlFor={id("parola")} className={s.eticheta}>
          {t.campuri.parola.eticheta}
        </label>
        <div className={s.parolaInvelis}>
          <input
            id={id("parola")}
            name="parola"
            type={vizibila ? "text" : "password"}
            value={date.parola}
            autoComplete={t.campuri.parola.autocomplete}
            onChange={(e) => schimba("parola")(e.target.value)}
            onFocus={laFocus}
            aria-invalid={eroareParola ? true : undefined}
            aria-required
            aria-describedby={id("parola") + "-indiciu"}
            className={[s.camp, s.campParola, eroareParola ? s.campEroare : ""].filter(Boolean).join(" ")}
          />
          <button
            type="button"
            className={s.ochi}
            onClick={() => setVizibila((v) => !v)}
            aria-label={vizibila ? t.ascundeParola : t.arataParola}
            aria-pressed={vizibila}
            aria-controls={id("parola")}
          >
            {vizibila ? <EyeOff size={20} strokeWidth={1.7} aria-hidden /> : <Eye size={20} strokeWidth={1.7} aria-hidden />}
          </button>
        </div>
        <p id={id("parola") + "-indiciu"} className={eroareParola ? s.indiciuEroare : s.indiciu}>
          {eroareParola ?? t.indiciuParola}
        </p>
      </div>

      <div className={s.grupBife}>
        <label className={s.bifa}>
          <input
            id={id("termeni")}
            type="checkbox"
            name="termeni"
            checked={date.termeni}
            onFocus={laFocus}
            onChange={(e) => {
              const bifat = e.target.checked;
              setDate((d) => ({ ...d, termeni: bifat }));
              setInactiv(false);
              if (bifat) setErori((er) => ({ ...er, termeni: undefined }));
            }}
            aria-invalid={eroareTermeni ? true : undefined}
            aria-required
            aria-describedby={eroareTermeni ? id("termeni") + "-eroare" : undefined}
          />
          <span>{termeni}</span>
        </label>
        {eroareTermeni ? (
          <p id={id("termeni") + "-eroare"} className={s.eroareBifa}>
            {eroareTermeni}
          </p>
        ) : null}
        <label className={s.bifa}>
          <input
            type="checkbox"
            name="marketing"
            checked={date.marketing}
            onFocus={laFocus}
            onChange={(e) => {
              const bifat = e.target.checked;
              setDate((d) => ({ ...d, marketing: bifat }));
            }}
          />
          <span>{t.marketing}</span>
        </label>
      </div>

      <button type="submit" className={s.trimite} disabled={etapa === "trimitere"}>
        <span>{etapa === "trimitere" ? t.trimitere : t.buton}</span>
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <p className={s.inactiv} role="status" data-formular-inactiv={inactiv ? "" : undefined}>
        {inactiv ? t.inactiv : null}
      </p>
      {etapa === "eroare" ? (
        <p className={s.eroareTrimitere} role="alert">
          {t.eroareTrimitere}
        </p>
      ) : null}
      <p className={s.nota}>{t.nota}</p>
      {informare}
      <p className={s.ajutor}>{ajutor}</p>
    </form>
  );
}
