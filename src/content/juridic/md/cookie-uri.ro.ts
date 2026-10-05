// Documentul cookie-uri, in romana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 03-cookie-uri.ro.md, sha256 783122ed7eab9a14b45666aaf4591957cf068b352987a2b19de3e717c768cb05.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import { alese, daca } from "./context";
import type { ContextMd } from "./context";
import type { DocumentJuridic } from "../tipuri";

export default function cookieUriRo(c: ContextMd): DocumentJuridic {
  return {
    cheie: "cookie-uri",
    limba: "ro",
    titlu: "Politica de cookie-uri",
    versiune: "2026-10-01",
    introducere: "Aici aflați ce informații stochează sau citește site-ul " + c.domeniu + " în browserul dumneavoastră (cookie-uri și stocare locală), cum măsurăm vizitele, cine primește datele și cum vă puteți răzgândi. Datele operatorului sunt în [Informații legale](cale:informatii-legale), iar modul în care prelucrăm datele personale, cu drepturile dumneavoastră complete, în [Politica de confidențialitate](cale:confidentialitate).",
    sectiuni: [
      {
        cheie: "t1", titlu: "Pe scurt",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: alese([daca(c, "s0", "Site-ul nu pune cookie-uri și nu scrie nimic în browserul dumneavoastră. Nu folosim instrumente de măsurare a vizitelor în browser."), daca(c, "banner", "Singura informație pe care o păstrăm în browser fără acordul dumneavoastră este alegerea făcută în bannerul de cookie-uri. O scriem numai după ce ați ales, niciodată la simpla vizită."), daca(c, "umami-b", "Măsurarea vizitelor cu aplicația noastră de statistică (Umami), care nu folosește cookie-uri, pornește numai dacă acceptați statistica."), daca(c, "ga4", "Google Analytics 4, care pune cookie-uri, pornește numai dacă acceptați statistica."), daca(c, "banner", "Puteți refuza cu un singur clic, pe „Refuz tot”, și vă puteți răzgândi oricând din legătura „Setări cookie-uri” din subsolul oricărei pagini."), "Serverul păstrează jurnale de acces (adresa IP, pagina cerută, data și ora). Ele nu se află în browserul dumneavoastră și sunt descrise în politica de confidențialitate."]) } },
        ],
      },
      {
        cheie: "s1", titlu: "1. Pe ce temei",
        blocuri: [
          { jurisdictie: null, paragrafe: ["**Vizitatori din Republica Moldova.** Stocarea de informații în echipamentul dumneavoastră sau accesul la informații stocate acolo se face numai după ce ați primit informații clare și complete despre scopurile prelucrării; fac excepție operațiunile strict necesare pentru un serviciu al societății informaționale pe care l-ați cerut expres (Legea nr. 72/2025 a comunicațiilor electronice, art. 116 alin. (5)-(6)). Informațiile de pe această pagină răspund și art. 10 alin. (2) lit. b)-h) din Legea nr. 284/2004 privind serviciile societății informaționale. Temeiul prelucrării datelor personale este cel din Legea nr. 195/2024 (art. 6-7): consimțământul dumneavoastră sau, acolo unde pagina o spune, interesul nostru legitim.", "**Vizitatori din Uniunea Europeană.** Art. 5 alin. (3) din Directiva 2002/58/CE, în forma dată de Directiva 2009/136/CE, cere consimțământul dumneavoastră, după informare clară și completă, pentru orice stocare de informații sau acces la informații din echipamentul dumneavoastră, cu excepția celor strict necesare pentru un serviciu pe care l-ați cerut expres. Fiecare stat o aplică prin legea lui; în România, de pildă, prin Legea nr. 506/2004, art. 4 alin. (5)-(6)."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["Pe acest site nu stocăm și nu citim informații din browserul dumneavoastră, deci regulile de mai sus nu cer acum niciun acord."] },
          { jurisdictie: null, conditie: ["ga4"], paragrafe: ["Google Analytics 4 pornește numai cu acordul dumneavoastră, indiferent de țara din care ne vizitați."] },
          { jurisdictie: null, conditie: ["umami-b"], paragrafe: ["Aplicația noastră de statistică (Umami) pornește numai cu acordul dumneavoastră, indiferent de țara din care ne vizitați."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. Ce informații păstrăm în browser și de ce",
        blocuri: [
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["Nu păstrăm nicio informație în browserul dumneavoastră și nu citim nimic din el. Nu folosim instrumente de măsurare a vizitelor în browser."] },
          { jurisdictie: null, conditie: ["activ"], paragrafe: ["Tabelul arată tot ce site-ul păstrează sau citește în browserul dumneavoastră, cu durata și rostul fiecărei informații."], tabel: { forma: "cu-antet", titlu: "2. Ce informații păstrăm în browser și de ce", antet: ["Numele", "Categoria", "Cât rămâne", "Pentru ce"], randuri: alese([daca(c, "banner", ["3s-consimtamant, în stocarea locală", "Strict necesară", "Valabilă 6 luni; apoi nu mai e folosită și bannerul reapare. Rămâne în browser până alegeți din nou sau o ștergeți dumneavoastră", "Ține minte ce ați ales în bannerul de cookie-uri, ca să nu vă întrebăm la fiecare pagină. Conține versiunea textului afișat, un identificator aleator al dispozitivului, momentul, alegerea făcută și butonul folosit. Se scrie numai după ce ați ales"]), daca(c, "ga4", ["_ga, cookie", "Statistică, cu acord", "2 ani", "Deosebește vizitatorii între ei, fără nume sau adresă de e-mail"]), daca(c, "ga4", ["_ga_ urmat de codul măsurătorii, cookie", "Statistică, cu acord", "2 ani", "Ține minte sesiunea de navigare în curs"]), daca(c, "umami-b", ["umami.disabled, în stocarea locală, numai citit", "Statistică, cu acord", "Nu îl scriem noi", "Dacă l-ați pus dumneavoastră în browser, măsurarea vă exclude"])]) } },
          { jurisdictie: null, conditie: ["activ", "banner"], paragrafe: ["Identificatorul din alegere e aleator și nu vă leagă de o persoană; îl folosim ca să putem lega o retragere de acordul dat înainte. Pe serverul nostru rămâne un rând de evidență al fiecărei alegeri, descris în politica de confidențialitate (secțiunile 3 și 7)."] },
        ],
      },
      {
        cheie: "s2-t4", titlu: "Măsurarea vizitelor fără cookie (Umami)", nivel: 3, conditie: ["umami"],
        blocuri: [
          { jurisdictie: null, paragrafe: ["Site-ul are o aplicație de statistică, Umami, instalată pe un server administrat de furnizorul nostru de servicii IT; nu folosim pentru asta un serviciu de statistică al altcuiva. Aplicația primește de la browser adresa paginii, cu parametrii din adresă (de pildă cei ai campaniilor), pagina de pe care ați venit, titlul paginii, limba și dimensiunea ecranului. Din datele browserului și din adresa IP, serverul deduce tipul de browser, de sistem și de dispozitiv și locul aproximativ (țara și, dacă poate, regiunea și orașul). Adresa IP nu se salvează în datele măsurării: intră doar în calculul unui cod al vizitei. Codul se calculează din adresa IP, din browser și din identificatorul site-ului, așa că rămâne un pseudonim, iar datele măsurării se tratează ca date personale.", "Pe lângă vizite, măsurăm trei acțiuni: un clic pe un canal de contact (e-mail sau WhatsApp), un clic pe un buton către contact și schimbarea limbii paginii. Nu primim numele, adresa de e-mail sau numărul de telefon al cuiva.", "Măsurarea nu scrie niciun cookie și nimic în stocarea locală a browserului. Din stocarea locală citește doar marcajul umami.disabled, prin care vă puteți exclude singur de la măsurare. Nu vă urmărește de pe un site pe altul și nu pornește dacă browserul trimite semnalul „Do Not Track”. Datele nu se folosesc pentru publicitate și nu se combină cu alte surse. Le păstrăm 13 luni, apoi le ștergem."] },
          { jurisdictie: null, conditie: ["umami-b"], paragrafe: ["Măsurarea pornește numai după ce acceptați statistica și se oprește pe loc când vă retrageți acordul."] },
        ],
      },
      {
        cheie: "s2-t5", titlu: "Google Analytics 4", nivel: 3, conditie: ["ga4"],
        blocuri: [
          { jurisdictie: null, paragrafe: ["Cu acordul dumneavoastră pentru statistică, Google Analytics 4 primește adresa paginii, pagina de pe care ați venit, tipul de dispozitiv și de browser, țara și orașul aproximate din adresa IP, plus acțiunile dintr-o listă închisă: [lista evenimentelor GA4, din codul de la pornire]. Nu primește numele sau adresa de e-mail a cuiva. Semnalele pentru publicitate rămân dezactivate. Datele legate de cookie-uri și de identificatorul dispozitivului se păstrează 2 luni; rapoartele agregate, fără identificatori, rămân în cont."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. Drepturile dumneavoastră",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Puteți cere oricând accesul la date sau ștergerea lor și vă puteți opune prelucrării; lista completă a drepturilor și modul de exercitare sunt în [Politica de confidențialitate](cale:confidentialitate), secțiunea 8. Cererile le primim la " + c.contact.email + "."] },
        ],
      },
      {
        cheie: "s4", titlu: "4. Cui pot ajunge datele",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: alese([daca(c, "s0", "Nu transmitem nimănui informații din browserul dumneavoastră, fiindcă nu păstrăm și nu citim nimic din el."), daca(c, "umami", "Aplicația de statistică (Umami): datele rămân pe serverul pe care rulează, la furnizorul de găzduire descris în politica de confidențialitate, secțiunea 5; nu se transmit unui serviciu de statistică al altcuiva și nu se folosesc pentru publicitate."), daca(c, "ga4", "Google Analytics 4, numai după acordul dumneavoastră: Google Ireland Limited, cu prelucrare și de către Google LLC (Statele Unite). Garanțiile transferului sunt în politica de confidențialitate, secțiunea 6."), daca(c, "banner", "Alegerea din banner rămâne în browserul dumneavoastră; pe server se păstrează doar rândul de evidență descris în politica de confidențialitate."), "Lista tuturor destinatarilor datelor personale este în [Politica de confidențialitate](cale:confidentialitate), secțiunea 5."]) } },
        ],
      },
      {
        cheie: "s5", titlu: "5. Punctul de contact",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Pentru orice întrebare despre cookie-uri scrieți la " + c.contact.email + ", adresa operatorului 3S Demerzel SRL."] },
        ],
      },
      {
        cheie: "s6", titlu: "6. Cum cerem consimțământul",
        blocuri: [
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["La prima vizită, bannerul de cookie-uri spune ce folosim și vă lasă să alegeți între „Accept tot”, „Refuz tot” și „Setări cookie-uri”, trei butoane de aceeași mărime."] },
          { jurisdictie: null, conditie: ["ga4"], paragrafe: ["Până nu alegeți, nu se încarcă niciun script de la Google și nu se scrie niciun cookie."] },
          { jurisdictie: null, conditie: ["umami-b"], paragrafe: ["Până nu alegeți, nu se încarcă scriptul aplicației de statistică."] },
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["În setări, categoria „Statistică” pornește oprită; o porniți numai dumneavoastră. Vă întrebăm din nou după 6 luni sau când se schimbă textul acestei informări. Fiecare alegere lasă pe serverul nostru un rând de evidență, ca să putem dovedi ce ați ales; el este descris în politica de confidențialitate."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["Nu cerem consimțământ, fiindcă nu folosim nimic care să-l ceară; de aceea nu apare niciun banner de cookie-uri."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Dreptul de a refuza",
        blocuri: [
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["Refuzul costă un singur clic, pe „Refuz tot”. Site-ul funcționează la fel și fără statistică: nicio pagină și nicio funcție nu depind de acordul dumneavoastră."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["Nu există nimic de refuzat: nu folosim cookie-uri și nu măsurăm vizitele în browser."] },
        ],
      },
      {
        cheie: "s8", titlu: "8. Cum vă retrageți acordul",
        blocuri: [
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["Legătura „Setări cookie-uri” din subsolul oricărei pagini deschide din nou alegerea. Butonul „Refuz tot” sau oprirea categoriei „Statistică” opresc măsurarea pe loc."] },
          { jurisdictie: null, conditie: ["ga4"], paragrafe: ["Cookie-urile de statistică (_ga și _ga_ urmat de codul măsurătorii) se șterg din browser la retragere."] },
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["Datele site-ului se pot șterge oricând și din setările browserului."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["Nu ați dat niciun acord, deci nu aveți ce retrage."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. Cum protejăm datele",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: alese(["Site-ul se servește prin conexiune criptată (HTTPS).", "Înainte de orice alegere a dumneavoastră, paginile site-ului nu trimit cereri către alte domenii decât al nostru.", daca(c, "banner", "Evidența alegerilor păstrează numai prefixul rețelei; adresa IP completă apare doar în jurnalele de acces ale serverului, descrise în politica de confidențialitate."), daca(c, "umami", "Adresa IP nu se salvează în datele măsurării fără cookie."), daca(c, "ga4", "Semnalele pentru publicitate rămân dezactivate în Google Analytics: nu facem publicitate.")]) } },
        ],
      },
      {
        cheie: "s10", titlu: "10. Legături către alte servicii",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Legăturile către alte servicii, de pildă WhatsApp sau LinkedIn, vă duc în afara site-ului. De la momentul în care le deschideți se aplică regulile acelor servicii, iar noi nu controlăm ce păstrează ele în browserul dumneavoastră."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Modificări",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Versiunea în vigoare este cea de pe această pagină, cu data actualizării de la început."] },
        ],
      },
    ],
  };
}
