// Pagina de contact a editiei `ro-MD` (`/ro/contact` pe 3s.md), transcrisa din fisa ei de continut aprobata, pana
// la sectiunea de resurse nepublicate. Fara formular (decizia 3): cele doua carduri de canal sunt actiunea paginii,
// imediat sub capsula, in sectiunea "Prin ce canale pot contacta 3S?", deci pagina nu are bloc de final separat.
// Adresarea e "tu" (decizia 35); paragraful despre asistentul pe WhatsApp a iesit (decizia 49). Decizia 56
// (03.10.2026): fara apeluri GSM - cardul "Telefon" a iesit, WhatsApp primeste mesaje si apeluri, iar numarul ramane
// afisat ca numar de WhatsApp.
//
// VARIANTELE CONDITIONATE ale fisei se aleg din cod (aceleasi optiuni ca pagina de start, `./acasa.ts`):
//   - e-mailul (P-40): titlul, meta-descrierea si capsula numesc adresa, iar cardul de e-mail se randeaza, numai
//     cand domeniul are adresa (`CANALE.email` nevid); adresa vine din canale, nu e scrisa aici;
//   - sectiunea "Unde gasesc datele firmei?" apare numai dupa inregistrarea firmei operatoare (`OPERATOR_JSON` fara
//     `model`), ca intrebarea "Cine opereaza 3S?" de pe pagina de start;
//   - fraza despre paginile in romana numeste paginile juridice numai cand rutele lor RO-MD exista.
//
// CE NU INTRA, cu motivul: fraza despre oferta separata de pregatire, scanare si pastrare fizica (in "Ce informatii
// sa includ" si la finalul lui "Ce urmeaza") ramane deoparte, ca pe paginile EN, pana se deschide poarta juridica a
// deciziei 40; se publica varianta fisei de dinaintea portii. Randul "Poti consulta si ..." e randul de final al
// paginii (ca "See also" pe pagina EN de contact), deci ramane si cand sectiunea despre datele firmei nu apare.

import { iduri } from "@/components/seo/date-structurate";
import { CANALE, legaturaEmail } from "@/content/canale";
import { caleMd } from "@/content/juridic/md/registru";
import type { PaginaContinut, SectiuneComuna } from "@/content/model/tipuri";
import { ruteJuridiceRoMd } from "@/content/rute-ro-md";
import { adresaSite } from "@/lib/site";
import { OPTIUNI_BUILD, type OptiuniPagina } from "./acasa";

/** Optiunile paginii de contact: cele ale paginii de start, plus existenta paginilor juridice RO-MD. */
export type OptiuniContact = OptiuniPagina & {
  /** Paginile juridice RO-MD exista (rutele lor sunt in manifest). */
  juridicRo: boolean;
};

export const OPTIUNI_CONTACT_BUILD: OptiuniContact = { ...OPTIUNI_BUILD, juridicRo: ruteJuridiceRoMd().length > 0 };

/** Sectiunea cardurilor de canal: titlul si textele fiecarui card, ca in fisa. */
export const CANALE_PAGINA = {
  titlu: "Prin ce canale pot contacta 3S?",
  whatsapp: {
    titlu: "WhatsApp",
    /** Dupa numarul afisat pe card: in romana numarul ramane singur (fisa, decizia 56). */
    dupaNumar: "",
    text: "Este canalul principal de contact, pentru mesaje și pentru apeluri. Mesajul sau apelul ajunge direct la o persoană din echipa 3S.",
  },
  email: {
    titlu: "E-mail",
    text: "Este potrivit pentru solicitări detaliate sau pentru cazurile în care preferi corespondența prin e-mail.",
    buton: "Trimite un e-mail",
    copiaza: "Copiază adresa",
    // Starea de dupa copiere nu are text in fisa; e numai confirmarea butonului, randata dupa P-40.
    copiat: "Adresa a fost copiată",
  },
} as const;

/** Randul de final al paginii. */
export const DUPA: readonly string[] = [
  "Poți consulta și [prețurile](/pricing) (în engleză), [informațiile despre 3S și securitate](/about) (în engleză) și [modul de funcționare a platformei](/platform) (în engleză) sau te poți întoarce la [pagina de start](/ro).",
];

const BAZA = adresaSite();
const ID = iduri(BAZA);
const LEGAL = caleMd("informatii-legale", "ro");
const NUMAR = "+373 60 055 599";

/** Corpul e-mailului precompletat, ca in fisa (randurile noi se scriu `\r\n`). */
const CORP_EMAIL = "Bună ziua, 3S,\r\n\r\nAm citit pagina de contact. Aș dori să întreb despre un pilot.\r\n\r\nArhiva mea (hârtie, scanări sau fișiere) și țara:\r\n";

function titlu(o: OptiuniContact): string {
  return o.email === "" ? "Contact 3S: WhatsApp, mesaje și apeluri" : "Contact 3S: WhatsApp și e-mail";
}

function descriere(o: OptiuniContact): string {
  return o.email === ""
    ? "Contactează 3S pe WhatsApp (mesaj sau apel), la " + NUMAR + ". Descrie pe scurt arhiva firmei. Îți răspunde un membru al echipei, în română sau în engleză."
    : "Contactează 3S pe WhatsApp (mesaj sau apel), la " + NUMAR + ", ori prin e-mail, la " + o.email + ". Îți răspunde un membru al echipei, în română sau în engleză.";
}

function sectiuni(o: OptiuniContact): SectiuneComuna[] {
  return [
    {
      cheie: "primul-mesaj",
      titlu: "Ce informații să includ în primul mesaj?",
      blocuri: [
        {
          paragrafe: ["Pentru o primă discuție sunt suficiente următoarele informații:"],
          lista: {
            elemente: [
              "tipul arhivei: documente pe hârtie, scanări, fișiere electronice sau o combinație a acestora;",
              "țara în care se află documentele;",
              "limba în care sunt redactate;",
              "informațiile pe care vrei să le regăsești sau întrebările la care ai nevoie de răspuns.",
            ],
          },
          dupa: [
            "Dacă documentele sunt păstrate în mai multe aplicații sau pe mai multe servere de rețea, menționează și acest lucru. Pentru documentele pe hârtie, precizează volumul aproximativ (de exemplu, numărul de dosare sau de cutii) și starea lor.",
            "Nu trimite documente sau date cu caracter personal în primul mesaj. Documentele se transmit numai după ce accepți Acordul de prelucrare a datelor.",
          ],
        },
      ],
    },
    {
      cheie: "dupa-primul-mesaj",
      titlu: "Ce urmează după primul mesaj?",
      blocuri: [
        {
          paragrafe: [
            "Îți răspundem și îți punem câteva întrebări despre arhivă. Apoi îți prezentăm un exemplu de răspuns, împreună cu documentul din care provine. Dacă soluția corespunde nevoilor firmei, îți propunem un pilot gratuit de 30 de zile pe documentele tale. Stabilim în scris documentele incluse, volumul acestora și întrebările pe care dorești să le testezi, iar pilotul începe după ce accepți Termenii și condițiile, precum și Acordul de prelucrare a datelor.",
          ],
        },
      ],
    },
    {
      cheie: "limba",
      titlu: "În ce limbă pot scrie?",
      blocuri: [
        {
          paragrafe: [
            "Poți scrie în română sau în engleză. Dacă preferi o convorbire, sună-ne pe WhatsApp, la " +
              NUMAR +
              "; la acest număr primim apeluri numai prin WhatsApp. " +
              (o.juridicRo
                ? "Pe lângă această pagină, în română sunt disponibile pagina de start și paginile juridice; celelalte pagini ale site-ului sunt deocamdată numai în engleză."
                : "Pe lângă această pagină, în română este disponibilă pagina de start; celelalte pagini ale site-ului sunt deocamdată numai în engleză."),
          ],
        },
      ],
    },
    ...(o.operator
      ? [
          {
            cheie: "datele-firmei",
            titlu: "Unde găsesc datele firmei?",
            blocuri: [{ paragrafe: ["Datele firmei care operează 3S sunt publicate pe pagina [Informații legale](" + LEGAL + ")."] }],
          },
        ]
      : []),
  ];
}

/** Pagina `/ro/contact`, cu variantele alese din optiuni. */
export function paginaContact(o: OptiuniContact = OPTIUNI_CONTACT_BUILD): PaginaContinut {
  const t = titlu(o);
  const d = descriere(o);
  return {
    cheie: "contact",
    meta: { titlu: t, descriere: d, cale: "/ro/contact" },
    h1: "Contactează echipa 3S",
    capsula:
      "Poți contacta echipa 3S pe WhatsApp, prin mesaj sau apel, la " +
      NUMAR +
      (o.email === "" ? "" : ", ori prin e-mail, la " + o.email) +
      ". Descrie-ne arhiva firmei (documente pe hârtie, scanări sau fișiere electronice) și țara în care se află. Îți răspunde o persoană din echipă, în română sau în engleză. Nu este nevoie să completezi un formular sau să îți creezi un cont.",
    sectiuni: sectiuni(o),
    cta: {
      ref: "ro-md-contact",
      titluBloc: "Contactează echipa 3S",
      textWhatsapp: "Bună ziua, 3S. Am citit pagina de contact [ref:ro-md-contact]. Aș dori să întreb despre un pilot.",
      subiectEmail: "Întrebare 3S [ref:ro-md-contact]",
    },
    jsonLd: [
      {
        "@type": "WebPage",
        "@id": BAZA + "/ro/contact#webpage",
        url: BAZA + "/ro/contact",
        name: t,
        description: d,
        inLanguage: "ro-MD",
        isPartOf: { "@id": ID.site },
        mainEntity: { "@id": ID.organizatie },
        breadcrumb: { "@id": BAZA + "/ro/contact#breadcrumb" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": BAZA + "/ro/contact#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: BAZA + "/ro" },
          { "@type": "ListItem", position: 2, name: "Contact", item: BAZA + "/ro/contact" },
        ],
      },
    ],
    afirmatii: ["ro-md-canale-de-contact", "ro-md-raspunde-o-persoana", "ro-md-arhiva-cu-sursa", "ro-md-pilot-asistat", "ro-md-functii-in-productie"],
  };
}

/** Legatura `mailto:` a paginii, sau `null` inainte de P-40 (domeniul fara adresa). */
export function emailContact(email: string = CANALE.email): string | null {
  const p = paginaContact({ ...OPTIUNI_CONTACT_BUILD, email });
  return legaturaEmail(p.cta.ref, p.cta.subiectEmail, CORP_EMAIL, { ...CANALE, email });
}

export const pagina: PaginaContinut = paginaContact();
