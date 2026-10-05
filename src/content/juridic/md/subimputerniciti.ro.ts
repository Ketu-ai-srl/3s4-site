// Documentul subimputerniciti, in romana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 06-subimputerniciti.ro.md, sha256 09a951bb573ea012743e2be619f6bf740d1316db4fff690cc62f6c7359016fd8.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import type { DocumentJuridic } from "../tipuri";
import type { ContextMd } from "./context";

export default function subimputernicitiRo(c: ContextMd): DocumentJuridic {
  return {
    cheie: "subimputerniciti",
    limba: "ro",
    titlu: "Subîmputerniciții platformei",
    versiune: "2026-10-01",
    introducere: "Pentru Documentele pe care le încărcați în Serviciul 3S, firma dumneavoastră este, de regulă, operatorul datelor, iar 3S Demerzel SRL le prelucrează în numele ei, după [Acordul de prelucrare a datelor](cale:dpa) („DPA”). Pagina arată ce alți furnizori participă la prelucrare, ce face fiecare și unde stau datele. Tabelul A este Lista agreată din Articolul 7.1 al DPA. Tabelul B arată furnizorii care deservesc site-ul și canalele noastre de contact și care nu primesc Documentele încărcate în Serviciu.",
    sectiuni: [
      {
        cheie: "a", titlu: "A. Subîmputerniciții care primesc Documentele Clientului (Lista agreată)",
        blocuri: [
          { jurisdictie: null, paragrafe: [], tabel: { forma: "cu-antet", titlu: "A. Subîmputerniciții care primesc Documentele Clientului (Lista agreată)", antet: ["Nr.", "Furnizorul", "Ce face", "Unde stau datele", "Transfer: Clienți din UE/SEE", "Transfer: Clienți din Republica Moldova"], randuri: [["1", "Furnizorul platformei (denumirea, în lista completă)", "Aplicația: conturile, fișierele încărcate, indexarea, căutarea, răspunsurile cu documentul citat (și pagina, când sistemul o poate da)", "[N3: țara]", "[N3: mecanismul]", "[N3: mecanismul]"], ["2", "Amazon Web Services EMEA SARL (Luxemburg) [N3: entitatea, de confirmat din consola AWS; titularul contului AWS, necompletat], angajat de furnizorul platformei", "Găzduiește platforma: conturile, fișierele încărcate, baza de date, arhiva digitală și copiile de siguranță", "În Uniunea Europeană, cu regiunea principală Frankfurt (Germania); copiile de siguranță săptămânale în Irlanda; prelucrarea prin modelele de inteligență artificială, în oricare regiune din Uniunea Europeană", "Datele rămân în UE/SEE: nu e transfer ulterior în sensul clauzelor standard", "Transfer către state din SEE, liber (Legea nr. 195/2024, art. 44 alin. (2))"], ["3", "Amazon Web Services (Amazon Textract), aceeași entitate ca la rândul 2", "Extrage textul din paginile scanate; fișierele de peste 100 MB sau 5.000 de pagini îi sunt trimise întregi", "Uniunea Europeană, regiunea Frankfurt (Germania) [N1: politica AWS de renunțare pentru serviciile de IA lipsește la 02.10.2026, data activării necompletată; fără ea, AWS poate păstra conținutul trimis la Textract într-o altă regiune (raspunsuri/g3.md, B-26)]", "Datele rămân în UE/SEE: nu e transfer ulterior în sensul clauzelor standard [N1: cât lipsește politica de renunțare, copiile păstrate de AWS într-o altă regiune pot ieși din UE/SEE]", "Transfer către state din SEE, liber (Legea nr. 195/2024, art. 44 alin. (2)) [N1: idem, până la activarea politicii de renunțare]"], ["4", "Amazon Web Services (Amazon Bedrock), aceeași entitate ca la rândul 2; furnizorii modelelor nu primesc documentele", "Generează răspunsurile și rezumatele, cu citarea documentului (și a paginii, când sistemul o poate da)", "Uniunea Europeană, în oricare regiune", "Datele rămân în UE/SEE: nu e transfer ulterior în sensul clauzelor standard", "Transfer către state din SEE, liber (Legea nr. 195/2024, art. 44 alin. (2))"], ["5", "Amazon Web Services (Amazon SES), aceeași entitate ca la rândul 2", "Trimite invitațiile și notificările Serviciului", "Uniunea Europeană, regiunea Frankfurt (Germania)", "Datele rămân în UE/SEE: nu e transfer ulterior în sensul clauzelor standard", "Transfer către state din SEE, liber (Legea nr. 195/2024, art. 44 alin. (2))"]] }, dupa: ["Un furnizor intră în acest tabel înainte să primească date. Lista completă, cu denumirea furnizorilor arătați aici numai prin categorie și cu adresa și persoana de contact ale fiecărui subîmputernicit, se trimite Clientului odată cu copia PDF a DPA și oricând o cere, la " + c.contact.email + " (DPA, Articolele 7.1 și 7.7).", "**Cum citiți coloanele de transfer.**"] },
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["**Clienți din UE/SEE.** Un subîmputernicit din UE/SEE nu e un transfer ulterior în sensul clauzelor contractuale standard din Decizia (UE) 2021/914 (Clauza 8.8 și notele ei de subsol). Datele ajung la un subîmputernicit din afara UE/SEE numai dacă acesta e în Lista agreată, cu mecanismul arătat pentru el: o decizie de adecvare a Comisiei care acoperă transferul (de exemplu Cadrul UE-SUA, pentru un furnizor certificat) sau garanții adecvate, între care clauzele standard (DPA, Articolul 8.3). Coloanele privesc furnizorii din listă; accesul de la distanță al personalului 3S din Republica Moldova la datele Clienților din UE/SEE, dacă are loc, e un transfer către o țară terță și e reglat separat în DPA (Articolul 8.2 și Anexa 2).", "**Clienți din Republica Moldova.** Transferul către un stat din SEE e liber (Legea nr. 195/2024, art. 44 alin. (2)). Către alte state cere garanții adecvate, între care clauzele standard aprobate de Centrul Național pentru Protecția Datelor cu Caracter Personal sau adoptate de Comisia Europeană (art. 46 alin. (2) lit. c)). Deciziile Comisiei privind adecvarea sunt un element de care Centrul ține cont, nu un efect automat (art. 45 alin. (2) lit. d))."] } },
        ],
      },
      {
        cheie: "b", titlu: "B. Alți furnizori 3S, care nu primesc Documentele Clientului",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Furnizorii de mai jos deservesc site-ul " + c.domeniu + " și canalele de contact (e-mail și WhatsApp). Ei nu sunt implicați în stocarea sau în prelucrarea Documentelor încărcate în Serviciu; dacă ar fi, ar intra în tabelul A înainte să primească date [N21: confirmarea că niciunul nu are acces la Documentele încărcate în Serviciu; harta accesului necompletată la 02.10.2026]. Nu trimiteți prin canalele de contact documente care conțin date personale ale unor terți (DPA, Articolul 3.6)."],
            tabel: { forma: "cu-antet", titlu: "B. Alți furnizori 3S, care nu primesc Documentele Clientului", antet: ["Furnizorul", "Ce face", "Țara", "Garanții pentru transferul în afara SEE"], randuri: [["Un furnizor român de servicii IT și de analitică, împuternicitul nostru", "administrează serverul site-ului, evidența contactelor, căsuța de e-mail și conturile prin care trec datele", "România", "datele rămân în SEE; transferul către el e liber (Legea nr. 195/2024, art. 44 alin. (2))"], ["Un furnizor de găzduire pe servere virtuale", "găzduiește serverul pe care rulează site-ul", "Germania", "datele rămân în SEE; transferul către el e liber (Legea nr. 195/2024, art. 44 alin. (2))"], ["Cloudflare, Inc.", "serviciul DNS al domeniului 3s.md și redirecționarea mesajelor trimise la contact@3s.md", "Statele Unite", "Cadrul UE-SUA privind confidențialitatea datelor (Decizia (UE) 2023/1795) și clauzele standard din acordul de prelucrare al furnizorului; detalii, inclusiv pentru persoanele aflate în Republica Moldova, în [Politica de confidențialitate](cale:confidentialitate), secțiunea 6"], ["Google Ireland Limited sau Google LLC", "căsuța de e-mail a 3S", "Irlanda; Statele Unite", "Cadrul UE-SUA și, acolo unde e necesar, clauze standard; detalii în Politica de confidențialitate, secțiunea 6"], ["WhatsApp Ireland Limited sau WhatsApp LLC (grupul Meta)", "mesageria pe numărul +373 60 055 599", "Irlanda; Statele Unite", "Cadrul UE-SUA; termenii WhatsApp Business App; detalii în Politica de confidențialitate, secțiunea 6"]] }, dupa: ["Ceilalți destinatari ai datelor vizitatorilor și ai persoanelor de contact sunt în [Politica de confidențialitate](cale:confidentialitate), secțiunea 5."] },
        ],
      },
      {
        cheie: "t3", titlu: "Modelele de inteligență artificială",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Serviciul folosește modele de inteligență artificială pentru citirea și căutarea în documente. Modelele rulează la Amazon Web Services (tabelul A, rândul 4), iar furnizorii lor nu primesc documentele. Un furnizor de modele sau de recunoaștere a textului intră în tabelul A, cu țara și mecanismul de transfer, înainte să primească vreun document, și numai după ce 3S a verificat în scris că termenii lui interzic folosirea documentelor pentru antrenarea sau îmbunătățirea modelelor (DPA, Articolul 4.5) [N1: confirmat pentru Amazon Bedrock; pentru Amazon Textract opt-out-ul lipsește la 02.10.2026, data activării necompletată; fără politica de renunțare, AWS poate păstra conținutul trimis la Textract într-o altă regiune (raspunsuri/g3.md, B-26)]. Cum funcționează asistentul, pe înțelesul utilizatorului, scrie în pagina [Inteligența artificială în serviciile 3S](cale:inteligenta-artificiala)."] },
        ],
      },
      {
        cheie: "t4", titlu: "Cum anunțăm schimbările",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Cu cel puțin 30 de zile înainte ca un subîmputernicit nou să primească date sau ca unul din tabelul A să fie înlocuit, vă anunțăm prin e-mail, la adresa pentru notificări din formularul de acceptare (în lipsă, administratorului Contului), și actualizăm această pagină. Anunțul arată:"], lista: { elemente: ["cine este și în ce țară stau datele;", "ce parte din prelucrare preia;", "mecanismul de transfer;", "data de la care începe prelucrarea și până când vă puteți opune schimbării."] }, dupa: ["La data acestei versiuni nu există nicio schimbare anunțată."] },
        ],
      },
      {
        cheie: "t5", titlu: "Dacă nu sunteți de acord",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Vă puteți opune, în scris și din motive rezonabile legate de protecția datelor, până la data la care noul subîmputernicit începe prelucrarea (DPA, Articolul 7.3). Cât timp obiecția nu e soluționată, nu îi transmitem datele dumneavoastră; dacă noul subîmputernicit servește o funcție comună a Serviciului (modelele de inteligență artificială sau recunoașterea textului), oprim acea funcție pentru firma dumneavoastră. Căutăm împreună o soluție în cel mult 30 de zile. Dacă nu există una, puteți înceta fără penalități Serviciul afectat, iar datele se returnează și se șterg după Articolul 13 din DPA."] },
        ],
      },
      {
        cheie: "t6", titlu: "Întrebări despre listă",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Ne scrieți la " + c.contact.email + "."] },
        ],
      },
    ],
  };
}
