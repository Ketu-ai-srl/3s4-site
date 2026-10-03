// Scheletul comun al paginilor de produs EN (P03 `/features/search`, P04 `/features/whatsapp`): firul, corpul
// din modulul paginii (`CorpPagina`), CTA-ul de canal din erou si blocul de final, plus datele structurate ale
// paginii (WebPage, BreadcrumbList, FAQPage).
//
// Dosarul `_produs` e privat (prefixul `_`): Next nu face rute din el, iar numele fisierului nu e unul special
// al rutelor, deci nici pe build-ul romanesc (unde `tsx` e extensie de pagina) nu devine pagina.
//
// TOT TEXTUL vine din modul (`pagina` si `inJur`); componenta nu scrie niciun cuvant al ei, in afara etichetei
// butonului de canal, care e aceeasi peste tot (`ETICHETA_WHATSAPP_EN`).
//
// CANALELE se rezolva aici, pe server, din `CANALE_JSON`, cu textul precompletat al paginii si `ref`-ul ei:
// fara WhatsApp pe domeniu butonul nu se randeaza, iar linia de e-mail apare numai cand domeniul are adresa.
// Legaturile spre pagini care nu exista inca in build (`/platform`, `/pricing`, `/about`, `/contact`, ghidul de
// comparatie) trec prin `Tinta` si raman inerte pana apare ruta.
//
// STILUL PARAGRAFELOR DE SUB BUTON (microtextul, linia de e-mail) vine din `produs.module.css`, propriu scheletului:
// clasa cutiei CTA inchise, imprumutata inainte, avea culoarea gandita pentru fundal inchis si dadea 1,48:1 pe alb.
// Proba: `tests/browser/contrast-microtext-en.spec.ts`.
//
// FAQPage oglindeste intrebarile VIZIBILE cuvant cu cuvant: se scrie din sectiunile modulului (titlurile cu
// semnul intrebarii; raspunsul = paragrafele, elementele listei si paragrafele de dupa, fara marcaj), fara
// tabele si fara exemplul etichetat. Nu aduce rezultate imbogatite in Google din 7 mai 2026; il emitem, ca pe
// paginile romanesti, pentru motoarele care il citesc.

import ButonWhatsApp from "@/components/canale/ButonWhatsApp";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import { propozitieFaraMarcaj } from "@/components/canale/pe-pagina";
import CorpPagina from "@/components/continut/CorpPagina";
import TextInLinie from "@/components/juridic/TextInLinie";
import s from "@/components/juridic/juridic.module.css";
import f from "@/components/primitive/primitive.module.css";
import Tinta from "@/components/primitive/Tinta";
import JsonLd from "@/components/seo/JsonLd";
import { grafFirAriadnei, iduri, type GrafJsonLd, type NodJsonLd } from "@/components/seo/date-structurate";
import { CANALE, legaturaEmail, legaturaWhatsApp, type Canale } from "@/content/canale";
import { textSimplu } from "@/content/juridic/tipuri";
import type { PaginaContinut, SectiuneComuna } from "@/content/model/tipuri";
import { ETICHETA_WHATSAPP_EN } from "@/content/navigatie-en";
import { adresaSite, urlAbsolut } from "@/lib/site";
import r from "./produs.module.css";

/** Textele din jurul corpului, exportate de modulul paginii langa `pagina`. */
export type InJurProdus = {
  fir: readonly { text: string; cale: string }[];
  etichetaFir: string;
  /** Legatura secundara din erou, cu marcaj in linie; `null` = niciuna. */
  legaturaSecundara: string | null;
  microtext: string;
  /** Inceputul liniei de e-mail ("Or write to"), urmat de adresa domeniului. */
  inainteDeEmail: string;
  final: { paragrafe: readonly string[]; veziSi: string };
};

const SALUT = "Hello 3S, ";

/** Raspunsul vizibil al unei sectiuni-intrebare: paragrafele, lista si paragrafele de dupa, fara tabele si exemple. */
export function raspunsVizibil(sectiune: SectiuneComuna): string {
  const bucati: string[] = [];
  for (const bloc of sectiune.blocuri) {
    if (bloc.eticheta) continue;
    bucati.push(...bloc.paragrafe, ...(bloc.lista?.elemente ?? []), ...(bloc.dupa ?? []));
  }
  return bucati.map(textSimplu).join(" ");
}

/** Datele structurate ale paginii, pe adresa site-ului. */
export function grafPagina(pagina: PaginaContinut, inJur: InJurProdus, baza: string = adresaSite()): GrafJsonLd {
  const url = urlAbsolut(pagina.meta.cale, baza);
  const site = { "@id": iduri(baza).site };
  const fir = grafFirAriadnei(
    inJur.fir.map((n) => ({ nume: n.text, cale: n.cale })),
    baza,
  )["@graph"][0];
  const webPage = pagina.jsonLd.find((n) => n["@type"] === "WebPage");
  if (webPage === undefined) throw new Error(pagina.cheie + ": modulul nu are nodul WebPage");
  const intrebari = pagina.sectiuni.filter((sec) => sec.titlu.trim().endsWith("?"));
  const noduri: NodJsonLd[] = [
    {
      ...webPage,
      "@type": "WebPage",
      "@id": url + "#pagina",
      url,
      isPartOf: site,
      breadcrumb: { "@id": fir["@id"] },
    },
    fir,
    {
      "@type": "FAQPage",
      "@id": url + "#intrebari",
      url,
      inLanguage: "en",
      isPartOf: site,
      mainEntity: intrebari.map((sec) => ({
        "@type": "Question",
        name: sec.titlu,
        acceptedAnswer: { "@type": "Answer", text: raspunsVizibil(sec) },
      })),
    },
  ];
  return { "@context": "https://schema.org", "@graph": noduri };
}

function Chevron() {
  return (
    <svg className={f.firSeparator} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M6 4 L10 8 L6 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Butonul WhatsApp, microtextul si (numai cu adresa pe domeniu) linia de e-mail. */
function BlocCanale({ pagina, inJur, canale }: { pagina: PaginaContinut; inJur: InJurProdus; canale: Canale }) {
  const { ref, textWhatsapp, subiectEmail } = pagina.cta;
  const wa = legaturaWhatsApp(ref, textWhatsapp, canale);
  const corp =
    "Hello 3S,\r\n\r\n" +
    propozitieFaraMarcaj({ cale: pagina.meta.cale, ref, text: textWhatsapp }, SALUT) +
    "\r\n\r\nMy archive (paper, scans or files) and country:\r\n";
  const email = legaturaEmail(ref, subiectEmail, corp, canale);
  return (
    <div data-canale-pagina={ref}>
      <ButonWhatsApp legatura={wa === null ? null : { implicit: wa, pagini: [] }} text={ETICHETA_WHATSAPP_EN} />
      <p className={r.ctaText}>{inJur.microtext}</p>
      {email === null ? null : (
        <p className={r.ctaText}>
          {inJur.inainteDeEmail}{" "}
          <LegaturaCanal legatura={{ implicit: email, pagini: [] }} canal="email">
            {canale.email}
          </LegaturaCanal>
        </p>
      )}
    </div>
  );
}

export default function PaginaProdus({ pagina, inJur, canale = CANALE }: { pagina: PaginaContinut; inJur: InJurProdus; canale?: Canale }) {
  return (
    <main className={s.zonaIngusta}>
      <div className="container-site">
        <div className={s.bloc}>
          <nav aria-label={inJur.etichetaFir}>
            <ol className={f.fir}>
              {inJur.fir.map((n, i) =>
                i === inJur.fir.length - 1 ? (
                  <li key={n.cale} className={f.firElement}>
                    <span className={f.firCurent} aria-current="page">
                      {n.text}
                    </span>
                  </li>
                ) : (
                  <li key={n.cale} className={f.firElement}>
                    <Tinta legatura={{ text: n.text, href: n.cale, ruta: n.cale }} className={f.firLegatura}>
                      {n.text}
                    </Tinta>
                    <Chevron />
                  </li>
                ),
              )}
            </ol>
          </nav>
          <CorpPagina
            pagina={pagina}
            dupaCapsula={
              <>
                <BlocCanale pagina={pagina} inJur={inJur} canale={canale} />
                {inJur.legaturaSecundara === null ? null : (
                  <p>
                    <TextInLinie text={inJur.legaturaSecundara} />
                  </p>
                )}
              </>
            }
            final={
              <section data-cta-final={pagina.cta.ref}>
                <h2>{pagina.cta.titluBloc}</h2>
                {inJur.final.paragrafe.map((p, i) => (
                  <p key={i}>
                    <TextInLinie text={p} />
                  </p>
                ))}
                <BlocCanale pagina={pagina} inJur={inJur} canale={canale} />
                <p>
                  <TextInLinie text={inJur.final.veziSi} />
                </p>
              </section>
            }
          />
          <JsonLd date={grafPagina(pagina, inJur)} />
        </div>
      </div>
    </main>
  );
}
