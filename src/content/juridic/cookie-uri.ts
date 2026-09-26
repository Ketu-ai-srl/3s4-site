// Politica de cookie-uri, construita COMPLET din comutatorul operatorului si din lista furnizorilor
// (planul valului S4, §9-§10). NEPUBLICATA: o randeaza felia `juridic` in ziua operatorului.
//
// CHEILE SECTIUNILOR (G-MD-08) sunt literele din Legea 284/2004 (RM), art. 10 alin. (2): `2b`-`2h`,
// plus `masuri` pentru masurile organizatorice si tehnice cerute la finalul alineatului. Pagina pune
// cheia in `data-l284`. Pentru Romania temeiul e Legea 506/2004, art. 4 alin. (5) si (6), in
// sectiunea `temei`, pe blocuri de jurisdictie.
//
// Litera a) (codul de inscriere ca operator de date) nu are sectiune, deliberat: registrul a fost
// desfiintat, iar un asemenea cod ar fi o mentiune falsa (G-MD-09).
//
// Cookie-urile si serviciile vin din `furnizori.ts`, aceeasi sursa ca panoul de setari al bannerului:
// ce vede vizitatorul cand alege e ce scrie aici.

import type { Operator } from "@/lib/operator";
import { DESCRIERE_EVENIMENTE, ETICHETA_MD, ETICHETA_RO, verificaOperatorPentruTexte } from "./confidentialitate";
import { COOKIE_ALEGERE, FURNIZORI, furnizoriCategorie } from "./furnizori";
import type { DocumentJuridic, TabelJuridic } from "./tipuri";

/** Cheile sectiunilor cerute de Legea 284/2004 art. 10 alin. (2) lit. b)-h), plus masurile. */
export const CHEI_L284 = ["2b", "2c", "2d", "2e", "2f", "2g", "2h", "masuri"] as const;

/** Data versiunii; felia `juridic` a adaugat tabelul din sectiunea 2b si etichetele de jurisdictie din 2d. */
export const VERSIUNE_COOKIE = "2026-09-25";

/**
 * Tabelul a ce se pastreaza in browser (felia `juridic`, fisa juridic__cookies.md: locul pentru fiecare
 * cookie numit, cu categoria, durata si scopul). Randurile vin din aceeasi sursa ca panoul bannerului.
 */
export function tabelCookie(): TabelJuridic {
  const randuri = [
    { c: COOKIE_ALEGERE, categorie: "Strict necesară" },
    ...furnizoriCategorie("statistica").flatMap((f) => f.cookieuri.map((c) => ({ c, categorie: "Statistică, cu acord" }))),
  ];
  return {
    forma: "cu-antet",
    titlu: "Informațiile păstrate în browser",
    antet: ["Numele", "Categoria", "Cât rămâne", "Pentru ce"],
    randuri: randuri.map(({ c, categorie }) => [{ text: c.nume, detaliu: c.fel }, categorie, c.durata, c.scop]),
  };
}

export function politicaCookie(operator: Operator): DocumentJuridic {
  verificaOperatorPentruTexte(operator);
  const statistica = furnizoriCategorie("statistica");
  const statisticaCookie = statistica.flatMap((f) => f.cookieuri);
  const evenimente = Object.values(DESCRIERE_EVENIMENTE).join("; ");
  return {
    titlu: "Politica de cookie-uri",
    versiune: VERSIUNE_COOKIE,
    introducere:
      "Aici aflați ce informații stochează sau citește site-ul în browserul dumneavoastră, de ce, cine le primește și cum vă puteți răzgândi. Datele operatorului și drepturile complete sunt în politica de confidențialitate.",
    sectiuni: [
      {
        cheie: "temei",
        titlu: "Pe ce temei",
        blocuri: [
          {
            jurisdictie: "ro",
            paragrafe: [
              "Pentru vizitatorii din România și din Uniunea Europeană, orice informație stocată sau citită din browser, în afara celor strict necesare, se folosește numai cu acordul dumneavoastră, cerut după ce ați primit informațiile de mai jos (Legea nr. 506/2004, art. 4 alin. (5); excepția pentru ce e strict necesar, art. 4 alin. (6)).",
            ],
          },
          {
            jurisdictie: "md",
            paragrafe: [
              "Pentru vizitatorii din Republica Moldova, informațiile de mai jos răspund art. 10 alin. (2) lit. b)-h) din Legea nr. 284/2004 privind comerțul electronic, iar cookie-urile care permit identificarea se folosesc numai cu consimțământ, potrivit Legii nr. 195/2024.",
            ],
          },
        ],
      },
      {
        cheie: "2b",
        titlu: "Ce informații colectăm și de ce",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Strict necesară, fără acord, e numai " +
                COOKIE_ALEGERE.nume +
                ". Cu acordul dumneavoastră pentru statistică se adaugă " +
                statisticaCookie.map((c) => c.nume).join(" și ") +
                ", care rămân cel mult " +
                [...new Set(statisticaCookie.map((c) => c.durata))].join(" sau ") +
                ". Tabelul arată fiecare informație, cu durata și rostul ei.",
            ],
            tabel: tabelCookie(),
            dupa: [
              "Cu acordul pentru statistică, Google Analytics 4 primește adresa paginii, pagina de pe care ați venit, tipul de dispozitiv și de browser, țara și orașul aproximate din adresa IP, plus acțiunile din lista închisă: " +
                evenimente +
                ". Nu primește numele, adresa de e-mail sau ce scrieți în formulare.",
            ],
          },
        ],
      },
      {
        cheie: "2c",
        titlu: "Drepturile dumneavoastră",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Puteți cere oricând accesul la date sau ștergerea lor și vă puteți opune prelucrării; lista completă a drepturilor și modul de exercitare sunt în politica de confidențialitate. Cererile le primim la " +
                operator.email +
                ".",
            ],
          },
        ],
      },
      {
        cheie: "2d",
        titlu: "Cui pot ajunge datele",
        blocuri: [
          {
            jurisdictie: "ro",
            eticheta: ETICHETA_RO,
            paragrafe: statistica.map(
              (f) => f.serviciu + ", numai după acordul dumneavoastră: " + f.destinatar + ". " + f.transferUe,
            ),
          },
          {
            jurisdictie: "md",
            eticheta: ETICHETA_MD,
            paragrafe: statistica.map((f) => f.serviciu + ": " + f.transferMd),
          },
          {
            jurisdictie: null,
            paragrafe: [
              "Alegerea din banner rămâne în browserul dumneavoastră; pe server se păstrează doar rândul de evidență descris în politica de confidențialitate. Lista tuturor destinatarilor: " +
                FURNIZORI.map((f) => f.destinatar).join("; ") +
                ".",
            ],
          },
        ],
      },
      {
        cheie: "2e",
        titlu: "Punctul de contact",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Pentru orice întrebare despre cookie-uri scrieți la " + operator.email + ", adresa operatorului " + operator.denumire + ".",
            ],
          },
        ],
      },
      {
        cheie: "2f",
        titlu: "Cum cerem consimțământul",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "La prima vizită, bannerul de cookie-uri spune ce folosim și vă lasă să alegeți între Accept tot, Refuz tot și Setări cookie-uri, trei butoane de aceeași mărime. Până nu alegeți, nu se încarcă nimic de la Google și nu se scrie niciun cookie.",
              "În setări, categoria Statistică pornește oprită; o porniți numai dumneavoastră. Vă întrebăm din nou după 6 luni sau când se schimbă textul acestei informări.",
            ],
          },
        ],
      },
      {
        cheie: "2g",
        titlu: "Dreptul de a refuza",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Refuzul costă un singur clic, pe Refuz tot. Site-ul funcționează la fel și fără statistică: nicio pagină și nicio funcție nu depind de acordul dumneavoastră.",
            ],
          },
        ],
      },
      {
        cheie: "2h",
        titlu: "Cum vă retrageți acordul",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Legătura Setări cookie-uri din subsolul oricărei pagini deschide din nou alegerea. Refuz tot sau oprirea categoriei Statistică opresc măsurarea pe loc și șterg cookie-urile de statistică din browser. Datele site-ului se pot șterge oricând și din setările browserului.",
            ],
          },
        ],
      },
      {
        cheie: "masuri",
        titlu: "Cum protejăm datele",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Site-ul se servește prin HTTPS. Fonturile sunt găzduite pe același domeniu cu site-ul, deci nu pleacă nicio cerere către un serviciu de fonturi al altcuiva. Înainte de acordul dumneavoastră, paginile nu contactează niciun terț; lucrul acesta se verifică automat, la fiecare versiune a site-ului, înainte de publicare.",
              "Evidența alegerilor păstrează doar prefixul rețelei, nu adresa IP completă, iar codul de statistică nu primește date de publicitate: semnalele de publicitate rămân refuzate.",
            ],
          },
        ],
      },
    ],
  };
}
