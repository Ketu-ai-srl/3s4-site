// Documentul confidentialitate, in romana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 02-confidentialitate.ro.md, sha256 e96a55fa560909027245204efe18f6fc8369dfe43e02cc8f8f6dad7a3c33c0b0.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import { alese, daca } from "./context";
import type { ContextMd } from "./context";
import type { DocumentJuridic } from "../tipuri";

export default function confidentialitateRo(c: ContextMd): DocumentJuridic {
  return {
    cheie: "confidentialitate",
    limba: "ro",
    titlu: "Politica de confidențialitate",
    versiune: "2026-10-01",
    introducere: "Aici aflați ce date personale prelucrează 3S Demerzel SRL prin site-ul 3s.md și în relațiile cu persoanele care ne contactează sau folosesc platforma 3S, pentru ce le folosim, cui le dăm, cât timp le păstrăm și ce drepturi aveți.",
    preambul: [
      { jurisdictie: null, paragrafe: ["Urmăm Legea Republicii Moldova nr. 195/2024 privind protecția datelor cu caracter personal, care transpune Regulamentul (UE) 2016/679 (Regulamentul general privind protecția datelor, GDPR). Pentru persoanele aflate în Uniunea Europeană aplicăm și GDPR. Drepturile din art. 15-22 au aceeași numerotare în ambele acte.", "Politica se adresează vizitatorilor site-ului, persoanelor care ne scriu sau ne sună, persoanelor de contact din firmele pe care le abordăm, utilizatorilor conturilor de client și persoanelor ale căror date se află în documentele încărcate de clienții noștri (secțiunea 15)."] },
    ],
    sectiuni: [
      {
        cheie: "s1", titlu: "1. Cine prelucrează datele",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Operatorul datelor este 3S Demerzel SRL, Republica Moldova. IDNO și adresa juridică: [în curs de înregistrare]; datele complete apar în [Informații legale](cale:informatii-legale).", "Ne găsiți la contact@3s.md, iar pe WhatsApp (mesaje și apeluri) la +373 68 055 599. Cererile privind datele personale se trimit la contact@3s.md.", "Pentru persoanele din Uniunea Europeană, reprezentantul nostru în Uniune (GDPR, art. 27) este [reprezentant în UE: în curs de desemnare]. Reprezentantul poate fi adresat de persoanele vizate și de autoritățile de supraveghere, împreună cu noi sau în locul nostru, în toate chestiunile legate de prelucrare.", "Datele pe care ni le dați direct ajung la noi, în Republica Moldova; ce înseamnă asta pentru persoanele din Uniunea Europeană scrie în secțiunea 6."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. Responsabilul cu protecția datelor",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Nu am desemnat un responsabil cu protecția datelor. Legea îl cere numai în cazurile din art. 37 alin. (1) al Legii nr. 195/2024 și al GDPR (autorități publice, monitorizare sistematică pe scară largă, prelucrare pe scară largă a categoriilor speciale de date), iar noi apreciem că nu ne încadrăm în ele la data acestei pagini. Întrebările despre date le primim la contact@3s.md."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. Ce date prelucrăm, pentru ce și pe ce temei",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Tabelul arată, pentru fiecare situație, ce date prelucrăm, pentru ce și pe ce temei juridic (Legea nr. 195/2024, art. 6 alin. (1); GDPR, art. 6 alin. (1))."], tabel: { forma: "cu-antet", titlu: "3. Ce date prelucrăm, pentru ce și pe ce temei", antet: ["Situația", "Datele", "Scopul", "Temeiul"], randuri: alese([["Vizitați site-ul", "adresa IP, pagina cerută, data și ora, browserul și sistemul de operare", "livrăm paginile, depanăm și apărăm site-ul de abuzuri", "interesul legitim (art. 6 alin. (1) lit. f))"], daca(c, "banner", ["Alegeți în bannerul de cookie-uri", "un identificator aleator al dispozitivului, momentul, versiunea textului afișat, alegerea făcută, butonul folosit, pagina și prefixul rețelei (fără adresa IP completă)", "putem dovedi ce ați ales", "obligația legală de a putea demonstra consimțământul (art. 6 alin. (1) lit. c), coroborat cu art. 7 alin. (1))"]), daca(c, "umami-b", ["Acceptați statistica: măsurarea vizitelor fără cookie", "adresa paginii (cu parametrii din adresă), pagina de pe care ați venit, titlul paginii, limba, dimensiunea ecranului, câteva acțiuni dintr-o listă închisă (un clic pe un canal de contact, un clic pe un buton către contact, schimbarea limbii); browserul, sistemul, dispozitivul și locul aproximativ, deduse din datele browserului și din adresa IP, care nu se salvează", "aflăm ce pagini se citesc și le îmbunătățim", "consimțământul (art. 6 alin. (1) lit. a))"]), daca(c, "ga4", ["Acceptați statistica: Google Analytics 4", "adresa paginii, pagina de pe care ați venit, tipul de dispozitiv și de browser, țara și orașul aproximate din adresa IP, câteva acțiuni dintr-o listă închisă; cookie-urile _ga și _ga_ urmat de codul măsurătorii", "aflăm ce pagini se citesc", "consimțământul (art. 6 alin. (1) lit. a))"]), ["Ne scrieți sau ne sunați (e-mail sau WhatsApp)", "numele, funcția și firma, dacă le comunicați; adresa de e-mail; numărul de telefon (la WhatsApp, și numele de profil); conținutul mesajelor și al atașamentelor; data și ora", "vă răspundem, evaluăm cererea și, dacă o cereți, pregătim o ofertă", "interesul legitim de a răspunde solicitărilor profesionale; demersurile precontractuale făcute la cererea dumneavoastră, când cereți o ofertă (art. 6 alin. (1) lit. b))"], ["Sunteți persoană de contact într-o firmă pe care o abordăm", "numele, funcția, firma, adresa de e-mail sau telefonul profesional, sursa datelor, istoricul contactelor și notițele noastre", "stabilim relații de afaceri cu firme", "interesul legitim de a ține evidența unui contact profesional și de a vă trimite un singur prim mesaj la adresa de e-mail profesională (art. 6 alin. (1) lit. f); secțiunea 9); pentru celelalte mesaje comerciale, consimțământul dumneavoastră (art. 6 alin. (1) lit. a); secțiunea 9)"], ["Aveți un cont de client, deschis prin invitație", "numele, funcția, adresa de e-mail profesională, rolul în cont, jurnalele de autentificare și de securitate ale contului; la acceptarea termenilor: data și ora (UTC), identificatorii contului și ai utilizatorului, numele, funcția și e-mailul reprezentantului, denumirea și IDNO ale firmei, versiunea termenilor și textul casetei bifate, adresa IP și browserul", "executăm contractul; putem dovedi acceptarea termenilor", "executarea contractului (art. 6 alin. (1) lit. b)); pentru dovada acceptării, interesul legitim (art. 6 alin. (1) lit. f))"], ["Încheiem un contract și facturăm", "denumirea firmei, persoana de contact, adresa, codul fiscal sau codul TVA, datele din facturi și plăți", "facturăm și ținem contabilitatea", "executarea contractului și obligațiile legale (art. 6 alin. (1) lit. b) și c))"], ["Ne trimiteți o notificare sau o cerere de reexaminare (pagina Notificare și acțiune)", "numele și adresa de e-mail; conținutul notificării sau al cererii; la notificarea formală, datele cerute de lege (Legea nr. 284/2004, art. 17 alin. (4)); corespondența noastră cu dumneavoastră", "evaluăm notificarea, decidem, comunicăm decizia și putem dovedi cum am acționat", "obligația legală (art. 6 alin. (1) lit. c)): mecanismul și procedura din Regulamentul (UE) 2022/2065, art. 16, și din Legea nr. 284/2004, art. 17; pentru apărarea în litigii, interesul legitim (art. 6 alin. (1) lit. f))"]]) } },
          { jurisdictie: null, conditie: ["linkedin"], paragrafe: ["Dacă vizitați sau interacționați cu pagina 3S de pe LinkedIn, LinkedIn prelucrează datele dumneavoastră după propria politică, iar noi primim numai statistici agregate despre pagină."] },
          { jurisdictie: null, paragrafe: ["Nu vindem datele și nu le folosim pentru publicitate pe alte platforme; marketingul nostru direct este descris în secțiunile 9 și 10. Nu înregistrăm convorbirile telefonice fără acordul dumneavoastră prealabil.", "Ce păstrăm în browserul dumneavoastră și cum funcționează măsurarea vizitelor scrie în [Politica de cookie-uri](cale:cookie-uri)."] },
        ],
      },
      {
        cheie: "s3-t4", titlu: "Sursele datelor despre persoanele de contact din firme", nivel: 3,
        blocuri: [
          { jurisdictie: null, paragrafe: ["Datele vin din surse publice (site-urile firmelor, registre publice, profiluri profesionale de pe LinkedIn), din recomandări ale unor terți cu acordul dumneavoastră sau de la evenimente la care v-ați prezentat. Categoriile de date sunt cele din tabel. Vă informăm despre prelucrare cel târziu la primul mesaj către dumneavoastră (Legea nr. 195/2024, art. 14 alin. (3) lit. b)). Dacă nu vă contactăm în cel mult o lună de la obținerea datelor, le ștergem."] },
        ],
      },
      {
        cheie: "s4", titlu: "4. Interesele legitime",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Ne întemeiem pe interesul legitim pentru:"], lista: { elemente: ["securitatea și buna funcționare a site-ului (jurnalele serverului)", "răspunsul la solicitările profesionale primite", "evidența contactelor profesionale din firme, pentru relații de afaceri, și un singur prim mesaj către ele (secțiunea 9)", "dovada acceptării termenilor și a ofertelor"] }, dupa: ["Am cântărit aceste interese față de drepturile dumneavoastră: colectăm numai datele din tabel; nu le folosim pentru publicitate pe alte platforme, iar datele din jurnalele serverului nu se combină cu alte surse. Vă puteți opune oricând (secțiunea 8; pentru marketingul direct, secțiunea 10)."] },
        ],
      },
      {
        cheie: "s5", titlu: "5. Cine primește datele",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Nu vindem date personale și nu le cedăm nimănui pentru publicitate. Le comunicăm autorităților publice numai când legea o cere. Le primesc, în măsura necesară, următorii destinatari:"], tabel: { forma: "cu-antet", titlu: "5. Cine primește datele", antet: ["Destinatar", "Ce face pentru noi", "Țara", "Ce date primește"], randuri: alese([["Un furnizor român de servicii IT și de analitică, împuternicitul nostru", "administrează serverul site-ului, evidența contactelor, căsuța de e-mail și conturile prin care trec datele", "România", "datele din secțiunea 3, în măsura necesară"], ["Un furnizor de găzduire pe servere virtuale", "găzduiește serverul pe care rulează site-ul", "Germania", "adresele IP și jurnalele serverului"], ["Cloudflare, Inc.", "serviciul DNS al domeniului 3s.md și redirecționarea mesajelor trimise la contact@3s.md", "Statele Unite", "date tehnice ale interogărilor DNS; mesajele trimise la contact@3s.md, cu antetele lor"], ["Google Ireland Limited sau Google LLC", "căsuța de e-mail a 3S", "Irlanda; Statele Unite", "mesajele primite la contact@3s.md"], ["WhatsApp Ireland Limited sau WhatsApp LLC (grupul Meta)", "mesageria pe numărul +373 68 055 599", "Irlanda; Statele Unite", "numărul dumneavoastră, numele de profil, mesajele și fișierele trimise; WhatsApp folosește o parte din date și pentru scopurile proprii (termenii WhatsApp Business App)"], daca(c, "ga4", ["Google Ireland Limited sau Google LLC (Google Analytics 4), numai dacă acceptați statistica", "măsurarea vizitelor", "Irlanda; Statele Unite", "datele din secțiunea 3, rândul „Acceptați statistica: Google Analytics 4”"]), daca(c, "linkedin", ["LinkedIn Ireland Unlimited Company sau LinkedIn Corporation", "pagina 3S de pe LinkedIn", "Irlanda; Statele Unite", "datele lăsate pe pagină; noi primim numai statistici agregate"]), ["Banca și contabilul 3S, după încheierea unui contract", "plăți și contabilitate", "Republica Moldova", "datele de facturare și plată"], ["Clientul 3S vizat de o notificare", "primește notificarea, ca să-și spună poziția", "țara sediului Clientului", "notificarea formală, în întregime, cu datele notificatorului (Legea nr. 284/2004, art. 17 alin. (5)); din notificarea simplă, identitatea notificatorului numai dacă e strict necesar"]]) } },
        ],
      },
      {
        cheie: "s6", titlu: "6. Transferuri în afara Spațiului Economic European",
        blocuri: [
          { jurisdictie: null, paragrafe: ["**Prelucrarea în Republica Moldova.** Datele pe care ni le dați direct ajung la noi, în Republica Moldova. La data ultimei actualizări a paginii, Republica Moldova nu figurează printre țările pentru care Comisia Europeană a adoptat o decizie de adecvare ([lista Comisiei](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en)).", "**Serverele din Germania și furnizorul din România.** Datele stocate pe servere din Germania și cele prelucrate de furnizorul din România rămân în Spațiul Economic European; transferul către ele e liber (Legea nr. 195/2024, art. 44 alin. (2)).", "**Furnizorii din Statele Unite** (Cloudflare, Google, WhatsApp) prelucrează date în Statele Unite. Decizia (UE) 2023/1795 a Comisiei Europene recunoaște un nivel adecvat de protecție pentru datele transferate din Uniune către organizațiile din Statele Unite incluse în lista Cadrului UE-SUA privind confidențialitatea datelor. La data ultimei actualizări a paginii, [lista oficială a Cadrului](https://www.dataprivacyframework.gov/list) arăta participările Google LLC și WhatsApp LLC cu statutul „Active”, iar pe cea a Cloudflare, Inc. cu statutul „Active - Re-certification under Review”. Garanțiile fiecăruia:"], lista: { elemente: ["Cloudflare, Inc.: clauzele contractuale standard adoptate prin Decizia (UE) 2021/914 (modulele 2 și 3) și participarea la Cadrul UE-SUA, din [acordul de prelucrare al furnizorului](https://www.cloudflare.com/cloudflare-customer-dpa/) (pct. 6.2 și 6.4).", "Google: participarea Google LLC la Cadrul UE-SUA și, acolo unde e necesar, clauze contractuale standard, conform [explicațiilor Google](https://policies.google.com/privacy/frameworks).", "WhatsApp: participarea WhatsApp LLC la Cadrul UE-SUA; termenii sunt în [Termenii WhatsApp Business App](https://www.whatsapp.com/legal/WhatsApp-Terms-for-WhatsApp-Business-App)."] }, dupa: ["**Persoanele aflate în Republica Moldova.** Legea nr. 195/2024 permite transferul către state din Spațiul Economic European fără autorizări speciale (art. 44 alin. (2)). Către alte state cere fie o decizie a CNPDCP privind caracterul adecvat al nivelului de protecție (art. 45), fie garanții adecvate, între care clauzele standard de protecție a datelor aprobate de CNPDCP sau adoptate de Comisia Europeană (art. 46 alin. (2) lit. c)). Nu cunoaștem o decizie a CNPDCP privind Statele Unite. Acordul de prelucrare al Cloudflare aplică clauzele standard numai datelor protejate de legile Uniunii Europene, ale Spațiului Economic European, ale Elveției și ale Regatului Unit, iar Google indică și el clauze standard, acolo unde e necesar. Pentru datele protejate numai de legea moldovenească, garanția aplicabilă fiecărui furnizor o stabilim și v-o explicăm la contact@3s.md.", "**Copia garanțiilor.** Textul clauzelor standard e public: [Decizia (UE) 2021/914](https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj). Acordurile furnizorilor sunt la adresele de mai sus. O copie a garanțiilor o puteți cere și la contact@3s.md."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Cât timp păstrăm datele",
        blocuri: [
          { jurisdictie: null, paragrafe: [], tabel: { forma: "cu-antet", titlu: "7. Cât timp păstrăm datele", antet: ["Datele", "Cât timp", "De ce"], randuri: alese([["Jurnalele serverului", "cel mult 30 de zile", "depanare și securitate"], daca(c, "banner", ["Alegerea din bannerul de cookie-uri, în browserul dumneavoastră", "valabilă 6 luni, apoi vă întrebăm din nou (sau mai devreme, când se schimbă textul informării); rămâne în browser până alegeți din nou sau o ștergeți dumneavoastră", "ținem minte alegerea fără să vă întrebăm la fiecare pagină"]), daca(c, "banner", ["Evidența alegerii, pe serverul nostru", "36 de luni de la alegere", "dovada consimțământului; termenul general de prescripție, de 3 ani (Codul civil al Republicii Moldova, art. 391 alin. (1))"]), daca(c, "umami", ["Datele măsurării fără cookie", "13 luni, apoi ștergere", "comparații de la an la an"]), daca(c, "ga4", ["Datele Google Analytics 4 legate de cookie-uri și de identificatorul dispozitivului", "2 luni; rapoartele agregate, fără identificatori, rămân în cont", "cea mai scurtă perioadă oferită de serviciu"]), ["Mesaje fără ofertă", "12 luni de la ultimul mesaj, apoi ștergere", "răspundem și reluăm o conversație"], ["Mesaje care au dus la o ofertă", "36 de luni de la ultimul mesaj, apoi ștergere", "putem dovedi conținutul ofertei într-un eventual litigiu (termenul general de prescripție: 3 ani)"], ["Persoane de contact din firme, abordate, fără răspuns", "12 luni de la primul mesaj, apoi ștergere; dacă vă opuneți, păstrăm numai datele strict necesare ca să nu vă mai contactăm", "evidența relațiilor de afaceri"], ["Persoane de contact din firme, încă neabordate", "cel mult o lună de la obținerea datelor; dacă nu vă contactăm, le ștergem", "informarea se dă în cel mult o lună de la obținerea datelor (art. 14 alin. (3) lit. a))"], ["Cont de client și jurnalul acceptării termenilor", "pe durata contractului și 3 ani după încetare", "executarea contractului; dovada acceptării; prescripția generală"], ["Notificări și cereri de reexaminare, cu datele din ele", "3 ani de la închiderea cazului, apoi ștergere", "putem dovedi cum am acționat; termenul general de prescripție, de 3 ani (Codul civil al Republicii Moldova, art. 391 alin. (1))"], ["Facturi și documente contabile", "termenele prevăzute de legislația Republicii Moldova", "obligație legală"], ["Datele din documentele clienților", "după instrucțiunile clientului și acordul de prelucrare", "secțiunea 15"]]) } },
        ],
      },
      {
        cheie: "s8", titlu: "8. Drepturile dumneavoastră",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Aveți dreptul de acces la date (art. 15), de rectificare (art. 16), de ștergere (art. 17), de restricționare a prelucrării (art. 18), de a afla cui le-am comunicat (art. 19), la portabilitatea datelor (art. 20), de opoziție (art. 21) și de a nu face obiectul unei decizii bazate exclusiv pe prelucrare automată (art. 22). Numerotarea e aceeași în Legea nr. 195/2024 și în GDPR.", "Cererile le trimiteți la contact@3s.md. Vă răspundem fără întârzieri nejustificate, în cel mult o lună de la primire. Pentru cereri complexe, termenul se poate prelungi cu două luni; prelungirea și motivele ei vi le comunicăm în prima lună (Legea nr. 195/2024, art. 12 alin. (3); GDPR, art. 12 alin. (3)). Răspunsul e gratuit; dacă o cerere e în mod vădit nefondată sau excesivă, putem cere o taxă rezonabilă sau o putem refuza, motivat (art. 12 alin. (5)). Dacă avem îndoieli întemeiate despre identitatea dumneavoastră, vă cerem informații suplimentare (art. 12 alin. (6)). Dacă nu dăm curs unei cereri, vă spunem de ce și că puteți depune o plângere și o cerere în instanță (art. 12 alin. (4))."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. Mesaje comerciale și marketing direct",
        blocuri: [
          { jurisdictie: null, paragrafe: ["După înregistrarea societății, vă putem trimite din inițiativa noastră un singur mesaj comercial, la adresa de e-mail profesională, dacă rolul dumneavoastră într-o firmă are legătură cu serviciul 3S. Temeiul este interesul nostru legitim de a stabili relații de afaceri cu firme (Legea nr. 195/2024 și GDPR, art. 6 alin. (1) lit. f)). Mesajul arată de unde avem datele dumneavoastră de contact și cum vă puteți opune (secțiunea 10). Nu trimitem mesaje în serie: dacă nu răspundeți, nu vă mai scriem din inițiativa noastră.", "Celelalte mesaje comerciale din inițiativa noastră, prin e-mail, prin aplicații de mesagerie sau prin telefon, vi le trimitem numai cu consimțământul dumneavoastră prealabil (Legea nr. 284/2004, art. 22 alin. (1); Legea nr. 72/2025, art. 124 alin. (1) și (3)), în afara cazurilor în care legea permite altfel: de pildă, clienților noștri, pentru servicii similare, dacă au posibilitatea clară de a se opune simplu și gratuit (Legea nr. 72/2025, art. 124 alin. (2)). Consimțământul se poate da în orice formă, inclusiv în scris, prin schimb de mesaje electronice sau verbal, iar dovada lui ne revine nouă (Legea nr. 62/2022, art. 26 alin. (4)). Îl puteți retrage oricând, răspunzând la mesaj sau scriind la contact@3s.md.", "Conversațiile pe care le începeți dumneavoastră - prin linkul WhatsApp sau prin e-mail - nu sunt mesaje nesolicitate: vă răspundem.", "Fiecare mesaj comercial arată clar că e o comunicare comercială și în numele cui e trimis (Legea nr. 284/2004, art. 22 alin. (2) lit. a)-b)), are o adresă valabilă la care puteți cere încetarea trimiterii (Legea nr. 72/2025, art. 124 alin. (4)) și trimite la această politică."] },
        ],
      },
      {
        cheie: "s10", titlu: "10. Dreptul de a vă opune marketingului direct",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Aveți dreptul de a vă opune, în orice moment, prelucrării datelor dumneavoastră în scop de marketing direct, inclusiv creării de profiluri, în măsura în care are legătură cu acest marketing. După opoziție nu mai prelucrăm datele în acest scop. Vă puteți opune scriind la contact@3s.md sau răspunzând direct la mesajul primit. Vă amintim acest drept, separat de restul informațiilor, cel târziu la primul mesaj către dumneavoastră (Legea nr. 195/2024, art. 21 alin. (2)-(4); GDPR, art. 21 alin. (2)-(4))."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Retragerea consimțământului",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă prelucrarea se întemeiază pe consimțământul dumneavoastră, îl puteți retrage în orice moment, la fel de simplu cum l-ați dat. Retragerea nu afectează legalitatea prelucrării făcute înainte de ea (Legea nr. 195/2024, art. 7 alin. (3); GDPR, art. 7 alin. (3))."], lista: { elemente: alese(["Pentru mesaje comerciale: răspundeți la mesaj sau scrieți la contact@3s.md.", daca(c, "banner", "Pentru statistică: legătura „Setări cookie-uri” din subsolul oricărei pagini redeschide alegerea, iar „Refuz tot” oprește măsurarea pe loc.")]) } },
        ],
      },
      {
        cheie: "s12", titlu: "12. Plângere la o autoritate de supraveghere",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă socotiți că prelucrarea datelor dumneavoastră încalcă legea, puteți depune o plângere:"], lista: { elemente: ["în Republica Moldova, la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP): str. Serghei Lazo nr. 48, MD-2004, mun. Chișinău; tel. (022) 820 801 (din străinătate: +373 22 820 801); centru@datepersonale.md; [datepersonale.md](https://datepersonale.md). Termenul de prescripție al plângerii este de un an de la data la care ați putut afla de presupusa încălcare, dar nu mai târziu de 3 ani de la încălcare (Legea nr. 195/2024, art. 72);", "în Uniunea Europeană, la autoritatea de supraveghere din statul în care locuiți sau lucrați ori în care a avut loc presupusa încălcare (GDPR, art. 77 alin. (1)); lista autorităților o găsiți la [Comitetul European pentru Protecția Datelor](https://www.edpb.europa.eu/about-edpb/our-members_en). În România, de pildă, autoritatea este ANSPDCP: [dataprotection.ro](https://www.dataprotection.ro), anspdcp@dataprotection.ro."] }, dupa: ["Vă puteți adresa și instanței de judecată (Legea nr. 195/2024, art. 74)."] },
        ],
      },
      {
        cheie: "s13", titlu: "13. Dacă trebuie să ne dați datele",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Nu aveți nicio obligație legală sau contractuală de a ne da date personale prin acest site. Fără datele de contact din mesaj nu vă putem răspunde, iar fără datele necesare contului de client nu putem executa contractul. Măsurarea vizitelor nu e o condiție pentru a folosi site-ul."] },
        ],
      },
      {
        cheie: "s14", titlu: "14. Decizii automate",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Nu luăm decizii bazate exclusiv pe prelucrare automată și nu creăm profiluri care să producă efecte juridice asupra dumneavoastră sau să vă afecteze în mod similar (Legea nr. 195/2024, art. 22; GDPR, art. 22)."] },
        ],
      },
      {
        cheie: "s15", titlu: "15. Clienții și documentele lor",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă sunteți client sau utilizator al unui cont de client:"], lista: { elemente: ["pentru datele contului dumneavoastră (secțiunea 3, rândul „Aveți un cont de client”), operator este 3S Demerzel SRL;", "pentru documentele pe care firma dumneavoastră le încarcă în platformă, operator este clientul, iar 3S este persoană împuternicită: le prelucrează numai pe baza instrucțiunilor documentate ale clientului, în condițiile [acordului de prelucrare a datelor](cale:dpa) (Legea nr. 195/2024, art. 28; GDPR, art. 28). Furnizorii care participă la această prelucrare sunt în pagina [Subîmputerniciții platformei](cale:subimputerniciti)."] }, dupa: ["Dacă datele dumneavoastră apar în documentele unui client al 3S și doriți să vă exercitați drepturile, vă adresați clientului. Dacă ne scrieți nouă, transmitem cererea clientului.", "Dacă socotiți că 3S nu respectă clauzele contractuale standard aplicabile prelucrării documentelor clienților din Uniunea Europeană, puteți trimite o plângere la contact@3s.md; o tratăm fără întârziere (Clauza 11(a) din anexa la Decizia (UE) 2021/914).", "Asistentul cu inteligență artificială al platformei e descris în pagina [Inteligența artificială în serviciile 3S](cale:inteligenta-artificiala)."] },
        ],
      },
      {
        cheie: "s16", titlu: "16. Copii",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Serviciile 3S se adresează profesioniștilor. Nu colectăm în mod intenționat date ale copiilor."] },
        ],
      },
      {
        cheie: "s17", titlu: "17. Securitate",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Aplicăm măsuri tehnice și organizatorice adecvate riscului (Legea nr. 195/2024, art. 32; GDPR, art. 32). Site-ul se servește prin conexiune criptată (HTTPS)."] },
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["Evidența alegerilor din banner păstrează numai prefixul rețelei. Adresa IP completă a cererii apare doar în jurnalele de acces ale serverului (secțiunile 3 și 7)."] },
        ],
      },
      {
        cheie: "s18", titlu: "18. Modificări",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Versiunea în vigoare este cea de pe această pagină, cu data actualizării de la început."] },
        ],
      },
    ],
  };
}
