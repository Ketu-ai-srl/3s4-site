// Scheletul comun al paginilor de referinta EN (G1 `/guides/e-invoice-archiving-eu`, G2
// `/guides/records-retention-moldova`, G3 `/compare/3s-vs-google-and-box`): firul, corpul din modulul paginii
// (`CorpPagina`), CTA-ul de canal din erou, randul cu data verificarii, legatura "Tell us if ... is out of date",
// blocul de final si datele structurate (Article, WebPage, BreadcrumbList, FAQPage).
//
// Dosarul `_referinta` e privat (prefixul `_`): Next nu face rute din el, iar numele fisierului nu e unul special
// al rutelor, deci nici pe build-ul romanesc (unde `tsx` e extensie de pagina) nu devine pagina. Pagina G3 il
// importa din dosarul ghidurilor: acelasi schelet, nu o copie.
//
// TOT TEXTUL vine din modul (`pagina` si `inJur`); componenta nu scrie niciun cuvant al ei, in afara etichetei
// butonului de canal, care e aceeasi peste tot (`ETICHETA_WHATSAPP_EN`).
//
// CANALELE se rezolva aici, pe server, din `CANALE_JSON`, cu textul precompletat al paginii si `ref`-ul ei: fara
// WhatsApp pe domeniu butoanele si legatura de semnalare nu se randeaza, iar linia de e-mail apare numai cand
// domeniul are adresa. Legatura de semnalare are textul ei precompletat, cu acelasi `ref` (fisa paginii).
//
// LEGATURA DE SEMNALARE sta dupa ultima sectiune (sursele), inaintea blocului de final: `CorpPagina` randeaza
// sectiunile dintr-o bucata, iar locul cerut de fisa (dupa jurnalul de modificari, la G1 si G2) ar fi cerut un al
// doilea randator al corpului. Langa surse, cererea "un rand e depasit" sta langa randurile pe care le numeste.
//
// DATELE STRUCTURATE. Nodul Article vine din modul (titlul, descrierea, datele, tarile, citarile); aici primeste
// `@id`, autorul si editorul (organizatia site-ului, prin `@id`) si legatura cu pagina. FAQPage oglindeste
// intrebarile VIZIBILE (titlurile H2 cu semnul intrebarii) cuvant cu cuvant: raspunsul = paragrafele, elementele
// listei si paragrafele de dupa, fara marcaj, fara tabele si fara blocurile etichetate. Titlurile H3 (tabelele
// comparatiei) nu sunt intrebari, deci nu intra.

import ButonWhatsApp from "@/components/canale/ButonWhatsApp";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import { propozitieFaraMarcaj } from "@/components/canale/pe-pagina";
import CorpPagina from "@/components/continut/CorpPagina";
import TextInLinie from "@/components/juridic/TextInLinie";
import s from "@/components/juridic/juridic.module.css";
import b from "@/components/primitive/bloc.module.css";
import f from "@/components/primitive/primitive.module.css";
import Tinta from "@/components/primitive/Tinta";
import JsonLd from "@/components/seo/JsonLd";
import { grafFirAriadnei, iduri, type GrafJsonLd, type NodJsonLd } from "@/components/seo/date-structurate";
import { CANALE, legaturaEmail, legaturaWhatsApp, type Canale } from "@/content/canale";
import { textSimplu } from "@/content/juridic/tipuri";
import type { PaginaContinut, SectiuneComuna } from "@/content/model/tipuri";
import { ETICHETA_WHATSAPP_EN } from "@/content/navigatie-en";
import { adresaSite, urlAbsolut } from "@/lib/site";

/** Textele din jurul corpului, exportate de modulul paginii langa `pagina`. */
export type InJurReferinta = {
  fir: readonly { text: string; cale: string }[];
  etichetaFir: string;
  microtext: string;
  /** Inceputul liniei de e-mail ("Or write to"), urmat de adresa domeniului. */
  inainteDeEmail: string;
  /** Randul de sub CTA-ul eroului, cu data verificarii (marcaj in linie permis). */
  verificare: string;
  /** Legatura "Tell us if ... is out of date": eticheta si textul ei precompletat (cu `[ref:<ref>]` al paginii). */
  semnalare: { text: string; textWhatsapp: string };
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

/** Intrebarile paginii: sectiunile H2 al caror titlu se termina cu semnul intrebarii. */
export function intrebariVizibile(pagina: PaginaContinut): SectiuneComuna[] {
  return pagina.sectiuni.filter((sec) => (sec.nivel ?? 2) === 2 && sec.titlu.trim().endsWith("?"));
}

/** Datele structurate ale paginii, pe adresa site-ului. */
export function grafReferinta(pagina: PaginaContinut, inJur: InJurReferinta, baza: string = adresaSite()): GrafJsonLd {
  const url = urlAbsolut(pagina.meta.cale, baza);
  const id = iduri(baza);
  const fir = grafFirAriadnei(
    inJur.fir.map((n) => ({ nume: n.text, cale: n.cale })),
    baza,
  )["@graph"][0];
  const articol = pagina.jsonLd.find((n) => n["@type"] === "Article");
  const webPage = pagina.jsonLd.find((n) => n["@type"] === "WebPage");
  if (articol === undefined) throw new Error(pagina.cheie + ": modulul nu are nodul Article");
  if (webPage === undefined) throw new Error(pagina.cheie + ": modulul nu are nodul WebPage");
  const noduri: NodJsonLd[] = [
    {
      ...articol,
      "@type": "Article",
      "@id": url + "#articol",
      mainEntityOfPage: { "@id": url + "#pagina" },
      author: { "@id": id.organizatie },
      publisher: { "@id": id.organizatie },
    },
    {
      ...webPage,
      "@type": "WebPage",
      "@id": url + "#pagina",
      url,
      isPartOf: { "@id": id.site },
      breadcrumb: { "@id": fir["@id"] },
    },
    fir,
    {
      "@type": "FAQPage",
      "@id": url + "#intrebari",
      url,
      inLanguage: "en",
      isPartOf: { "@id": id.site },
      mainEntity: intrebariVizibile(pagina).map((sec) => ({
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
function BlocCanale({ pagina, inJur, canale }: { pagina: PaginaContinut; inJur: InJurReferinta; canale: Canale }) {
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
      <p className={b.ctaText}>{inJur.microtext}</p>
      {email === null ? null : (
        <p className={b.ctaText}>
          {inJur.inainteDeEmail}{" "}
          <LegaturaCanal legatura={{ implicit: email, pagini: [] }} canal="email">
            {canale.email}
          </LegaturaCanal>
        </p>
      )}
    </div>
  );
}

/** Legatura "Tell us if ... is out of date": pe WhatsApp, cu textul ei si `ref`-ul paginii; fara canal, nimic. */
function Semnalare({ pagina, inJur, canale }: { pagina: PaginaContinut; inJur: InJurReferinta; canale: Canale }) {
  const wa = legaturaWhatsApp(pagina.cta.ref, inJur.semnalare.textWhatsapp, canale);
  if (wa === null) return null;
  return (
    <p data-semnalare={pagina.cta.ref}>
      <LegaturaCanal legatura={{ implicit: wa, pagini: [] }} canal="whatsapp">
        {inJur.semnalare.text}
      </LegaturaCanal>
    </p>
  );
}

export default function PaginaReferinta({
  pagina,
  inJur,
  canale = CANALE,
}: {
  pagina: PaginaContinut;
  inJur: InJurReferinta;
  canale?: Canale;
}) {
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
                <p data-verificare="">
                  <TextInLinie text={inJur.verificare} />
                </p>
              </>
            }
            final={
              <>
                <Semnalare pagina={pagina} inJur={inJur} canale={canale} />
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
              </>
            }
          />
          <JsonLd date={grafReferinta(pagina, inJur)} />
        </div>
      </div>
    </main>
  );
}
