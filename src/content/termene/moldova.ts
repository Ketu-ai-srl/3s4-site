// Termenele de pastrare pentru Republica Moldova, citite la sursa primara pe 25.09.2026.
//
// SURSA: Registrul de stat al actelor juridice (legis.md, Ministerul Justitiei):
//   - Legea contabilitatii si raportarii financiare nr. 287/2017, art. 17 alin. (1): documentele
//     contabile se pastreaza dupa regulile si termenele stabilite de autoritatea arhivelor. Versiunea
//     in vigoare azi e cea din 01.01.2025; modificarea adusa de Legea nr. 86/2026 intra in vigoare la
//     01.01.2027 si nu atinge art. 17 (citita separat);
//   - Ordinul Serviciului de Stat de Arhiva nr. 57/2016 (MO nr. 247-255 din 05.08.2016), cu
//     Indicatorul documentelor-tip si al termenelor lor de pastrare si Instructiunea de aplicare. Fisa
//     actului numeste doua modificari: Ordinul nr. 77/2017 (adauga doar pct. 3.7' in Instructiune, fara
//     termene; textul lui, pe arhiva.gov.md) si Ordinul nr. 38a/2018 (pct. 3.10 si Indicatorul, citit
//     la prima trecere ca art. 261, care nu e printre randurile de aici). Indicatorul e anexa .doc a
//     ordinului; randurile s-au citit celula cu celula. Coloana folosita e cea pentru organizatiile care
//     NU sunt surse de completare a Fondului Arhivistic; unde ea difera de cealalta, randul o spune.
//
// legis.md raspunde cu o verificare de browser (403, Cloudflare) la cererile facute fara browser;
// un om o deschide normal. O unealta automata de legaturi o poate raporta, gresit, ca moarta.
//
// Termenul se calculeaza de la 1 ianuarie al anului urmator celui in care dosarul a fost incheiat
// (Instructiunea, pct. 2.11); "75 ani-V" inseamna 75 de ani minus varsta persoanei la incheierea
// dosarului (acelasi punct).

import type { SursaPrimara, Tara } from "./tipuri";

const LEGEA_287_2017: SursaPrimara = {
  eticheta: "Legea nr. 287/2017, în Registrul de stat al actelor juridice",
  url: "https://www.legis.md/cautare/getResults?doc_id=154725&lang=ro",
};

const INDICATOR_57_2016: SursaPrimara = {
  eticheta: "Ordinul nr. 57/2016 și Indicatorul documentelor-tip, în Registrul de stat al actelor juridice",
  url: "https://www.legis.md/cautare/getResults?doc_id=125078&lang=ro",
};

const INCEPUT_PCT_2_11 =
  "1 ianuarie al anului următor celui în care dosarul a fost încheiat (Instrucțiunea privind aplicarea Indicatorului, pct. 2.11).";

export const MOLDOVA: Tara = {
  cod: "md",
  nume: "Republica Moldova",
  randuri: [
    {
      tip: "facturi",
      valoare: "6 ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Legea contabilității și raportării financiare nr. 287/2017, art. 17 alin. (1): documentele contabile se păstrează după termenele stabilite de autoritatea arhivelor. Indicatorul documentelor-tip, aprobat prin Ordinul Serviciului de Stat de Arhivă nr. 57/2016, art. 228: documentele primare, printre care factura și factura fiscală, se păstrează 6 ani; dacă apare un litigiu, până la hotărârea definitivă și irevocabilă.",
      surse: [LEGEA_287_2017, INDICATOR_57_2016],
    },
    {
      tip: "registre",
      valoare: null,
      motiv:
        "Rândul are două termene, iar unul lipsește. Registrele contabile (cartea mare, balanța de verificare) se păstrează 6 ani (Indicatorul, art. 236). Pentru situațiile financiare anuale, Indicatorul cere păstrare permanentă în organizațiile care completează Fondul Arhivistic, iar în coloana celorlalte organizații nu trece niciun termen (art. 224). Înainte să eliminați situațiile financiare, întrebați Agenția Națională a Arhivelor.",
      surse: [INDICATOR_57_2016, LEGEA_287_2017],
    },
    {
      tip: "state",
      valoare: "6-75 de ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicatorul, art. 231: statele (borderourile) de plată a salariului se păstrează 6 ani, iar dacă firma nu ține conturi analitice pentru fiecare salariat, 75 de ani. Conturile analitice ale salariaților (registrele de decontări) se păstrează 75 de ani minus vârsta salariatului la încheierea dosarului (art. 230 și pct. 2.11 din Instrucțiune).",
      surse: [INDICATOR_57_2016],
    },
    // Nota articolului 429 (cu asterisc) are doua parti si amandoua conteaza: actele secundare, 3
    // ani dupa concediere; dosarele pensionarilor, 3 ani sub 2 luni lucrate si 15 peste. Fara a
    // doua, un pensionar de 70 de ani ar primi aici 5 ani, iar Indicatorul ii da 15. Lit. a) si c)
    // cer "Permanent" in organizatiile care completeaza Fondul Arhivistic si nu trec niciun termen
    // in coloana celorlalte. Valoarea scurta ramane regula generala (lit. b) si d)); exceptiile
    // stau in temei, citate.
    {
      tip: "personal",
      valoare: "75 de ani minus vârsta",
      inceput:
        "De la încheierea dosarului; la „75 ani-V”, durata se socotește după vârsta persoanei la acea dată (Instrucțiunea, pct. 2.11).",
      temei:
        "Indicatorul, art. 429 lit. d): dosarele personale ale muncitorilor și ale personalului tehnic-ingineresc (cereri, contracte individuale de muncă, ordine de angajare și de încetare, fișe de post) se păstrează „75 ani-V”, adică 75 de ani minus vârsta pe care o avea persoana la încheierea dosarului; același termen pentru funcționarii publici (lit. b)). Pentru cineva plecat la 40 de ani, dosarul se ține 35 de ani. Nota articolului face o excepție pentru pensionari: „dosare personale ale pensionarilor, ale celor ce au lucrat pînă la 2 luni - 3 ani, mai mult de 2 luni - 15 ani”, adică dosarul unui pensionar se ține 3 ani dacă a lucrat cel mult 2 luni și 15 ani dacă a lucrat mai mult. Potrivit aceleiași note, actele de importanță secundară din dosar, cum sunt certificatele medicale, se păstrează 3 ani după concediere. Dosarele persoanelor cu grade științifice, cu înalte decorații de stat sau titluri onorifice, ale participanților la război (lit. a)) și ale membrilor uniunilor de creație (lit. c)) se păstrează permanent în organizațiile care completează Fondul Arhivistic; pentru celelalte organizații, Indicatorul nu trece un termen.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "declaratii",
      valoare: "6-7 ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicatorul, art. 262: declarațiile entităților privind impozitul pe venit se păstrează 7 ani, iar documentele primare care le justifică, 6 ani (art. 228). Nu am găsit în Indicator un articol separat pentru celelalte declarații fiscale.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "contracte",
      valoare: "6 ani",
      inceput:
        "După expirarea termenului contractului sau după executarea clauzelor lui (Indicatorul, art. 257, nota).",
      temei:
        "Indicatorul, art. 257: contractele și acordurile economice, de achiziții, de operațiuni și de prestări servicii se păstrează 6 ani după expirarea sau executarea lor; contractele de tranzacții valutare, 7 ani.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "extrase",
      valoare: "6 ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicatorul, art. 228: documentele bancare sunt documente primare și se păstrează 6 ani; dacă apare un litigiu, până la hotărârea definitivă și irevocabilă.",
      surse: [INDICATOR_57_2016, LEGEA_287_2017],
    },
  ],
};
