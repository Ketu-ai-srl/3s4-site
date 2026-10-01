// Documentul inteligenta-artificiala, in romana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 08-nota-ia.ro.md, sha256 4f1659c47bffc075e76da38a7bc5ee315244119d8835fe923b1567df94a79e48.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import type { DocumentJuridic } from "../tipuri";

export default function inteligentaArtificialaRo(): DocumentJuridic {
  return {
    cheie: "inteligenta-artificiala",
    limba: "ro",
    titlu: "Inteligența artificială în serviciile 3S",
    versiune: "2026-10-01",
    introducere: "",
    preambul: [
      { jurisdictie: null, paragrafe: ["3S Demerzel SRL este în curs de înregistrare. Până la înregistrare nu emitem oferte, nu încheiem contracte și nu deschidem conturi, deci asistentul descris în această pagină nu este încă oferit clienților. Pagina arată cum va funcționa."] },
      { jurisdictie: null, paragrafe: ["Serviciile 3S, furnizate de 3S Demerzel SRL din Republica Moldova (datele ei sunt în [Informații legale](cale:informatii-legale)), folosesc un asistent de inteligență artificială (IA) care răspunde la întrebări despre documentele Clientului. Pagina spune ce face asistentul, ce limite are și ce se întâmplă cu documentele. Ea completează informarea din chat, fără s-o înlocuiască: asistentul vă spune că e un sistem de IA de la începutul fiecărei conversații (secțiunea 2). Informarea din chat și pagina aceasta au în vedere cerințele de transparență din art. 50 din Regulamentul (UE) 2024/1689 (Regulamentul privind inteligența artificială), în măsura în care se aplică. „Client” și „Utilizator” au sensul din [Termeni și condiții](cale:termeni).", "**Pe scurt** (rezumat fără valoare contractuală; contează textul de mai jos)"], lista: { elemente: ["Asistentul este un sistem de IA, nu un om. Vă spune asta de la începutul fiecărei conversații.", "Răspunsurile sunt generate automat și pot fi incomplete sau greșite. Verificați documentul citat înainte să vă bazați pe ele.", "Indicarea paginii exacte a sursei este în pilot și poate lipsi sau poate fi greșită.", "Documentele dumneavoastră se prelucrează numai ca să furnizăm serviciul, în condițiile acordului de prelucrare a datelor (DPA).", "Puteți oricând vorbi cu un om: contact@3s.md sau +373 68 055 599."] } },
    ],
    sectiuni: [
      {
        cheie: "s1", titlu: "1. Ce este asistentul și ce face",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Asistentul este un sistem de IA. Primește întrebarea unui Utilizator, caută în documentele Clientului și formulează un răspuns în text. Arată sursele pe care se sprijină răspunsul. Nu modifică documentele.", "Destinația lui este căutarea în documentele Clientului și răspunsul la întrebări despre ele. Nu este destinat să evalueze persoane, de pildă la selecția candidaților sau la aprecierea solvabilității, și nu ia decizii în locul dumneavoastră."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. Cum aflați că vorbiți cu un sistem de IA",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Asistentul vă spune de la început, clar, că este un sistem de IA și nu un om:"], lista: { elemente: ["în chatul din browser, printr-un mesaj la deschiderea conversației și printr-o insignă „IA” lângă câmpul de întrebare, vizibilă cât ține conversația;", "pe WhatsApp, dacă oferta include acest canal, în primul mesaj al asistentului și în descrierea profilului."] }, dupa: ["Această pagină completează informarea din chat; nu o înlocuiește (Regulamentul (UE) 2024/1689, art. 50 alin. (1) și (5))."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. Ce este generat de IA",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Textul răspunsurilor este generat automat, pe baza întrebării și a documentelor Clientului. Documentele în sine nu sunt generate de asistent și nu sunt modificate de el. Un răspuns poate sintetiza sau reformula documentele fără să le reproducă; tratați-l ca pe un text generat."] },
        ],
      },
      {
        cheie: "s4", titlu: "4. Limitele răspunsurilor",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["Un răspuns poate fi incomplet, greșit sau formulat imprecis. 3S nu garantează că un răspuns este corect sau complet (Termeni, secțiunea 7.1).", "Riscul e mai mare pe scanări slabe, pe scris de mână, pe ștampile și tabele, pe cifre, date și nume proprii.", "Textul extras din scanări prin recunoaștere optică poate conține erori, iar o eroare de extragere ajunge în răspuns.", "Asistentul vede numai documentele încărcate și indexate în Cont. Nu poate găsi ce lipsește din arhivă, iar lipsa unui document din răspuns nu dovedește că documentul nu există.", "Aceeași întrebare, pusă de două ori, poate primi răspunsuri formulate diferit.", "Asistentul nu dă consultanță juridică, contabilă sau fiscală."] } },
        ],
      },
      {
        cheie: "s5", titlu: "5. Sursele și pagina exactă",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Asistentul indică documentele pe care își sprijină răspunsul. Indicarea paginii exacte din document este în pilot: o testăm împreună cu clienții, iar indicația poate lipsi sau poate fi greșită. Deschideți documentul și verificați înainte să vă bazați pe răspuns (Termeni, secțiunea 7.2)."] },
        ],
      },
      {
        cheie: "s6", titlu: "6. Limba",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Rezultatul depinde de limba documentelor, de limba întrebării și de calitatea scanării. Întrebările în engleză peste documente în română sunt în pilot."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Ce nu permit Termenii",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Termenii (secțiunea 7.3) nu permit folosirea asistentului, fără acordul scris al 3S, ca element al unui sistem destinat unei utilizări enumerate în Anexa III la Regulamentul (UE) 2024/1689, de pildă selecția și evaluarea candidaților la angajare sau evaluarea solvabilității persoanelor fizice, și nici ca unic temei al unei decizii cu efecte juridice asupra unei persoane (Regulamentul (UE) 2016/679, art. 22). Regulile de utilizare acceptabilă sunt și în [Notificare și acțiune](cale:notificare-si-actiune), secțiunea 7.2."] },
        ],
      },
      {
        cheie: "s8", titlu: "8. Documentele dumneavoastră și modelele de IA",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Modelele de IA primesc textul documentelor numai ca să furnizeze serviciul, în condițiile [acordului de prelucrare a datelor](cale:dpa) (DPA). Furnizorii modelelor care primesc documente apar în pagina [Subîmputerniciții platformei](cale:subimputerniciti) înainte să primească documente. Acordul cuprinde și angajamentul 3S privind antrenarea modelelor de IA (art. 4.5). Cum se prelucrează datele personale din documente e descris în DPA și în [Politica de confidențialitate](cale:confidentialitate)."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. Cum ajungeți la un om",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Ne puteți contacta oricând direct, fără să treceți prin asistent: la contact@3s.md sau la +373 68 055 599 (apeluri și WhatsApp). Răspunde un om, în română sau în engleză."] },
        ],
      },
      {
        cheie: "s10", titlu: "10. Cum raportați o problemă",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă asistentul a dat un răspuns greșit, înșelător sau nepotrivit, scrieți la contact@3s.md, cu întrebarea, răspunsul și data și ora conversației; le analizăm. Dacă socotiți că un răspuns conține informații ilicite, folosiți procedura din pagina [Notificare și acțiune](cale:notificare-si-actiune)."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Ce garantăm și ce nu",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Răspunsurile pot fi incomplete sau greșite, Clientul verifică documentul citat și răspunde pentru deciziile pe care le ia pe baza lor. Așa spun Termenii, în secțiunea 7, iar limitele răspunderii sunt în secțiunea 13. Pagina aceasta nu adaugă garanții și nu adaugă obligații pentru Client."] },
        ],
      },
      {
        cheie: "s12", titlu: "12. Limba paginii",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Pagina există în română și în engleză. Versiunea în limba română este cea autentică, iar cea în limba engleză este o traducere; dacă textele diferă, se aplică cel românesc."] },
        ],
      },
      {
        cheie: "t13", titlu: "Actele citate",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Textele au fost citite pe 30 septembrie 2026."], lista: { elemente: ["[Regulamentul (UE) 2024/1689 (Regulamentul privind inteligența artificială)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)", "[Regulamentul (UE) 2016/679 (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)"] } },
        ],
      },
    ],
  };
}
