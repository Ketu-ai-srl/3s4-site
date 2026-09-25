// Termenii si conditiile (`/juridic/termeni`): doua parti in aceeasi pagina, ca in sablonul
// juridic A (fisa juridic__termeni.md) - conditiile de folosire a platformei 3S si, dupa un
// separator cu ancora `#anexa-a`, acordul de prelucrare a datelor clientilor (GDPR art. 28).
//
// CINE E CINE. In anexa, cuvintele au sensul regulamentului: CLIENTUL e operatorul datelor din
// documentele lui, iar FURNIZORUL (firma din `config/operator.json`) e persoana imputernicita de
// operator. De aceea textul spune "furnizorul", nu "operatorul", cand vorbeste despre firma din
// spatele marcii: pe pagina asta, "operator" e clientul.
//
// SURSELE, citite pe 25.09.2026 (src/content/juridic/acte.ts): GDPR art. 4, 28, 32, 33 si 82 pe
// EUR-Lex. Obligatiile din articolul 4 al anexei urmeaza literele a)-h) din art. 28 alin. (3);
// formularea e a noastra, ordinea e a legii.
//
// CE NU SCRIE, deliberat, pana nu decide owner-ul (docs/ziua-operatorului.md): termene in zile sau
// in ore (preaviz, export, stergere, notificare), plafon de raspundere, promisiuni despre jurnale,
// copii de siguranta sau antrenarea modelelor. Unde legea da regula fara cifra ("fara intarzieri
// nejustificate"), textul foloseste regula legii.
//
// TEXTELE SUNT REDACTATE DE NOI si nu sunt validate juridic; le revizuieste un jurist inainte de
// publicare (docs/ziua-operatorului.md, pasul 0).

import type { Operator } from "@/lib/operator";
import { legaturaAct } from "./acte";
import { verificaOperatorPentruTexte } from "./confidentialitate";
import { CAMP_REGISTRU } from "./mentiuni-legale";
import { tabelSubimputerniciti } from "./subimputerniciti";
import type { DocumentJuridic } from "./tipuri";

export const VERSIUNE_TERMENI = "2026-09-25";

/** Ancora anexei; o folosesc legaturile din termeni, din mentiunile legale si din lista subimputernicitilor. */
export const ANCORA_ANEXA = "anexa-a";

function identificare(operator: Operator): string {
  // Cheia registrului vine din mentiunile legale, unde e scrisa o singura data (motivul e acolo).
  const registru = operator[CAMP_REGISTRU];
  return (
    operator.denumire +
    ", cu sediul în " +
    operator.sediu +
    ", " +
    operator.tara +
    (registru === "" ? "" : ", înregistrată în registrul comerțului sub nr. " + registru) +
    (operator.cod_fiscal === "" ? "" : ", cod de identificare fiscală " + operator.cod_fiscal)
  );
}

function asistenta(operator: Operator): string {
  return operator.email + (operator.telefon === "" ? "" : " sau la " + operator.telefon);
}

export function termeni(operator: Operator): DocumentJuridic {
  verificaOperatorPentruTexte(operator);
  const gdpr = legaturaAct("gdpr");
  return {
    titlu: "Termeni și condiții",
    versiune: VERSIUNE_TERMENI,
    introducere:
      "**Două părți, un singur acord:** mai jos sunt condițiile de folosire a platformei 3S, iar la final [Anexa A](#" +
      ANCORA_ANEXA +
      ") arată cum sunt prelucrate datele personale din documentele pe care le încărcați. Contul se deschide numai cu acceptarea amândurora.",
    sectiuni: [
      {
        cheie: "furnizor",
        titlu: "Cine oferă platforma",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Platforma 3S e oferită de " +
                identificare(operator) +
                " (furnizorul). Toate datele lui de identificare sunt în [Mențiuni legale](/juridic/informatii-legale).",
            ],
          },
        ],
      },
      {
        cheie: "serviciu",
        titlu: "Ce face platforma",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "3S primește actele firmei, scanate sau încărcate direct, le ține într-o arhivă digitală și răspunde la întrebări despre ele cu documentul din care vine răspunsul, în browser și pe WhatsApp. Ce cuprinde fiecare pachet scrie pe [pagina de prețuri](/preturi).",
            ],
          },
        ],
      },
      {
        cheie: "cont",
        titlu: "Contul și folosirea lui",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Contul îl deschide cineva care are dreptul să reprezinte firma clientului. Clientul hotărăște cine din echipa lui folosește contul și răspunde pentru documentele pe care le încarcă.",
              "**Nu sunt permise:**",
            ],
            lista: {
              elemente: [
                "încărcarea unor documente pe care clientul nu are dreptul să le prelucreze;",
                "încercările de a intra în conturile sau în arhivele altor clienți;",
                "testele de securitate și încărcările automate masive făcute fără acordul scris al furnizorului;",
                "revânzarea accesului fără un contract cu furnizorul.",
              ],
            },
          },
        ],
      },
      {
        cheie: "disponibilitate",
        titlu: "Disponibilitate",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Platforma funcționează continuu, în afara lucrărilor de mentenanță și a incidentelor tehnice. Lucrările planificate se anunță în cont înainte să înceapă.",
            ],
          },
        ],
      },
      {
        cheie: "pret",
        titlu: "Prețul",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Astăzi toate pachetele costă 0 RON. Un preț nou se aplică unui cont numai după ce îl anunțăm și după ce clientul îl acceptă.",
            ],
          },
        ],
      },
      {
        cheie: "date",
        titlu: "Datele personale",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Datele vizitatorilor site-ului sunt tratate după [Politica de confidențialitate](/juridic/confidentialitate). Pentru documentele încărcate în platformă, clientul decide ce se face cu ele, iar furnizorul le prelucrează numai în numele lui, după [Anexa A](#" +
                ANCORA_ANEXA +
                ").",
            ],
          },
        ],
      },
      {
        cheie: "asistenta",
        titlu: "Asistență",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Întrebările despre cont și despre platformă le primim la " + asistenta(operator) + "."],
          },
        ],
      },
      {
        cheie: "licenta",
        titlu: "Licența aplicației",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Ce drepturi primește clientul asupra aplicației și ce nu are voie să facă cu ea scrie în [Licența aplicației](/juridic/licenta-software).",
            ],
          },
        ],
      },
      {
        cheie: "raspundere",
        titlu: "Răspunderea",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Furnizorul răspunde pentru serviciu în limitele legii și ale acestor termeni. Nu răspunde pentru conținutul documentelor încărcate de client și nici pentru hotărârile luate pe baza unui răspuns fără verificarea documentului citat lângă el.",
            ],
          },
        ],
      },
      {
        cheie: "modificari",
        titlu: "Schimbarea termenilor",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Versiunea în vigoare e cea publicată aici, cu data ei. O schimbare care atinge drepturile clientului se anunță în cont și pe e-mail înainte să se aplice.",
            ],
          },
        ],
      },
      {
        cheie: "lege",
        titlu: "Legea și instanța",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Termenii sunt guvernați de legea română. Neînțelegerile se rezolvă întâi prin discuție directă, apoi la instanța competentă de la sediul furnizorului.",
            ],
          },
        ],
      },

      // ---- Partea a doua: anexa ------------------------------------------------------------
      {
        cheie: "anexa",
        titlu: "Anexa A. Acordul de prelucrare a datelor",
        ancoraInainte: ANCORA_ANEXA,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Acordul se aplică din ziua în care clientul acceptă termenii. Părțile lui sunt:"],
            lista: {
              elemente: [
                "**clientul**, firma care își deschide contul și hotărăște de ce încarcă documentele: este operatorul datelor;",
                "**furnizorul**, " +
                  operator.denumire +
                  ", care păstrează și prelucrează documentele numai ca să ofere serviciul: este persoana împuternicită de operator.",
              ],
            },
            dupa: [
              "Acordul se încheie în temeiul art. 28 din " +
                gdpr +
                ". Pentru clienții din Republica Moldova, trimiterile la regulament se citesc ca trimiteri la prevederile corespunzătoare din Legea nr. 195/2024 privind protecția datelor cu caracter personal.",
            ],
          },
        ],
      },
      {
        cheie: "art-1",
        titlu: "Articolul 1. Definiții",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Termenii au sensul din art. 4 al regulamentului. Cei folosiți cel mai des:"],
            lista: {
              elemente: [
                "**date personale:** orice informație despre o persoană fizică identificată sau identificabilă, de pildă un nume sau un cod personal dintr-un contract încărcat;",
                "**prelucrare:** orice operațiune cu date personale, de la încărcare, păstrare și căutare până la ștergere;",
                "**persoană vizată:** omul despre care vorbesc datele, de pildă semnatarul unui contract sau angajatul dintr-un stat de plată;",
                "**subîmputernicit:** alt furnizor, pe care furnizorul îl folosește pentru o parte din prelucrare;",
                "**încălcarea securității datelor:** un incident care duce, accidental sau ilegal, la distrugerea, pierderea, modificarea sau divulgarea datelor ori la accesul neautorizat la ele.",
              ],
            },
          },
        ],
      },
      {
        cheie: "art-2",
        titlu: "Articolul 2. Ce se prelucrează, cum și cât timp",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "**Obiectul:** păstrarea, indexarea și căutarea fișierelor trimise de client în contul lui 3S.",
              "**Natura:** stocarea fișierelor, extragerea textului din ele, căutarea și afișarea răspunsurilor împreună cu documentul din care provin.",
              "**Scopul:** numai furnizarea serviciului către client.",
              "**Durata:** cât timp clientul are cont, plus timpul necesar returnării și ștergerii datelor de la articolul 8.",
            ],
          },
        ],
      },
      {
        cheie: "art-3",
        titlu: "Articolul 3. Datele și persoanele vizate",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Clientul alege documentele pe care le încarcă, deci și datele personale din ele. De obicei acestea sunt:"],
            lista: {
              elemente: [
                "date de identificare și de contact din contracte, facturi și corespondență;",
                "date despre angajații clientului, din actele de personal;",
                "date despre clienții, furnizorii și partenerii clientului;",
                "datele utilizatorilor contului: numele, adresa de e-mail și rolul din cont.",
              ],
            },
            dupa: [
              "Date din categoriile speciale, de pildă despre sănătate, se încarcă numai dacă clientul are un temei legal pentru ele.",
            ],
          },
        ],
      },
      {
        cheie: "art-4",
        titlu: "Articolul 4. Obligațiile furnizorului",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Furnizorul:"],
            lista: {
              numerotata: true,
              elemente: [
                "prelucrează datele numai după instrucțiunile scrise ale clientului, inclusiv cele despre transferuri în afara Uniunii Europene, afară de cazul în care legea îl obligă altfel; atunci îl anunță pe client înainte, dacă legea permite;",
                "se asigură că oamenii care au acces la date s-au obligat să păstreze confidențialitatea lor;",
                "aplică măsurile de securitate de la articolul 6;",
                "folosește subîmputerniciți numai în condițiile de la articolul 5;",
                "îl ajută pe client, prin mijloace tehnice și organizatorice, să răspundă cererilor persoanelor vizate;",
                "îl ajută pe client să își îndeplinească obligațiile de la art. 32-36 din regulament: securitatea, notificarea incidentelor și evaluarea impactului;",
                "la încheierea serviciului, returnează sau șterge datele, la alegerea clientului, după articolul 8;",
                "pune la dispoziția clientului informațiile care arată că acordul e respectat și permite auditurile de la articolul 9;",
                "îl anunță imediat pe client dacă, după părerea lui, o instrucțiune primită încalcă legislația privind protecția datelor.",
              ],
            },
          },
        ],
      },
      {
        cheie: "art-5",
        titlu: "Articolul 5. Subîmputerniciții",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Clientul îi dă furnizorului o autorizație generală scrisă să folosească subîmputerniciții din tabel. Fiecare are, prin contract, aceleași obligații de protecție a datelor, iar furnizorul răspunde față de client pentru ei (art. 28 alin. (2) și (4) din regulament).",
            ],
            tabel: tabelSubimputerniciti(),
            dupa: [
              "Lista la zi e în [Subîmputerniciții platformei](/juridic/subimputerniciti). Înainte ca un subîmputernicit nou să primească date, furnizorul îl anunță pe client, care se poate opune în termenul din anunț.",
            ],
          },
        ],
      },
      {
        cheie: "art-6",
        titlu: "Articolul 6. Securitatea",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Furnizorul aplică măsuri tehnice și organizatorice potrivite riscului (art. 32 din regulament), între care:"],
            lista: {
              elemente: [
                "**Găzduire în Uniunea Europeană:** platforma rulează la Amazon Web Services, într-o singură regiune din Germania.",
                "**Criptare:** fișierele sunt criptate AES-256 pe disc și circulă numai prin conexiuni TLS 1.2 sau mai noi.",
                "**Arhive despărțite:** fiecare client își vede numai arhiva lui, iar fiecare utilizator are în cont rolul dat de client.",
                "**Confidențialitate:** cei care lucrează cu datele s-au obligat să le păstreze secrete.",
              ],
            },
          },
        ],
      },
      {
        cheie: "art-7",
        titlu: "Articolul 7. Incidentele de securitate",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Furnizorul îl anunță pe client **fără întârzieri nejustificate** după ce află de o încălcare a securității datelor (art. 33 alin. (2) din regulament), ca acesta să poată anunța la timp autoritatea de supraveghere.",
              "Anunțul cuprinde, pe cât se poate de la început:",
            ],
            lista: {
              elemente: [
                "ce s-a întâmplat, ce fel de date și ce persoane sunt atinse și, estimat, câte;",
                "cine poate da mai multe informații;",
                "urmările probabile;",
                "ce s-a făcut și ce se mai face ca urmările să fie limitate.",
              ],
            },
            dupa: ["Ce nu se știe la primul anunț se comunică pe măsură ce se află."],
          },
        ],
      },
      {
        cheie: "art-8",
        titlu: "Articolul 8. La încheierea contului",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Când contul se închide sau contractul încetează:"],
            lista: {
              numerotata: true,
              elemente: [
                "furnizorul **returnează** datele, dacă clientul cere asta, într-o formă pe care o poate folosi;",
                "apoi le **șterge** din platformă, împreună cu copiile existente;",
                "păstrează numai datele pe care legea îl obligă să le păstreze, și numai cât îl obligă.",
              ],
            },
          },
        ],
      },
      {
        cheie: "art-9",
        titlu: "Articolul 9. Informații și audit",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Furnizorul pune la dispoziția clientului informațiile care arată că acordul e respectat. Clientul, sau un auditor mandatat de el, poate face un audit, inclusiv o inspecție, anunțată în scris din timp.",
              "Auditul nu are acces la datele altor clienți, iar cei care îl fac se obligă să păstreze confidențialitatea.",
            ],
          },
        ],
      },
      {
        cheie: "art-10",
        titlu: "Articolul 10. Răspunderea",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Fiecare parte răspunde pentru prejudiciul produs de propria încălcare a acordului sau a legislației privind protecția datelor, în condițiile art. 82 din " +
                gdpr +
                ".",
              "Furnizorul răspunde ca persoană împuternicită numai dacă nu și-a îndeplinit obligațiile pe care regulamentul i le dă sau dacă a lucrat în afara instrucțiunilor legale ale clientului.",
            ],
          },
        ],
      },
      {
        cheie: "art-11",
        titlu: "Articolul 11. Durata acordului",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Acordul durează cât contul clientului. Obligațiile de confidențialitate și cele de returnare și ștergere a datelor continuă până sunt îndeplinite.",
            ],
          },
        ],
      },
      {
        cheie: "art-12",
        titlu: "Articolul 12. Legea, instanța și schimbarea acordului",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "**Legea aplicabilă:** legea română și regulamentul european de protecție a datelor.",
              "**Instanța:** cea competentă de la sediul furnizorului.",
              "**Clauzele nule:** dacă o prevedere e declarată nulă, celelalte rămân valabile.",
              "**Modificări:** acordul se schimbă numai cu anunț în cont și pe e-mail, ca termenii.",
              "**Contact:** întrebările despre acord le primim la " + operator.email + ".",
            ],
          },
        ],
      },
    ],
  };
}
