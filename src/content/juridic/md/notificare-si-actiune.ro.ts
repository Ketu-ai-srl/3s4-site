// Documentul notificare-si-actiune, in romana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 07-notificare-si-utilizare.ro.md, sha256 9a5b135d235035308b812298a292280580265a9187fa192c5f05186f78ca65c4.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import type { DocumentJuridic } from "../tipuri";

export default function notificareSiActiuneRo(): DocumentJuridic {
  return {
    cheie: "notificare-si-actiune",
    limba: "ro",
    titlu: "Notificare și acțiune",
    versiune: "2026-10-01",
    introducere: "Pagina spune cum ne puteți semnala o informație ilicită stocată în serviciile 3S, cum hotărâm și ce urmează. Serviciile 3S sunt furnizate de 3S Demerzel SRL din Republica Moldova; datele ei sunt în [Informații legale](cale:informatii-legale). Pagina cuprinde și regulile de utilizare acceptabilă a serviciilor și măsurile pe care le putem lua. Face parte din [Termeni și condiții](cale:termeni) (secțiunea 1.6) și pune în aplicare Legea nr. 284/2004 privind serviciile societății informaționale (art. 17 și 25). În măsura în care Regulamentul (UE) 2022/2065 (Regulamentul privind serviciile digitale) se aplică serviciilor 3S de stocare a documentelor clienților, pagina are în vedere și cerințele lui (art. 14, 16, 17 și 18); regulamentul numește informația ilicită „conținut ilegal”. „Client”, „Utilizator” și „zi lucrătoare” au sensul din Termeni.",
    preambul: [
      { jurisdictie: null, paragrafe: ["**Pe scurt** (rezumat fără valoare contractuală; contează textul de mai jos)"], lista: { elemente: ["Notificați o informație ilicită prin e-mail, la contact@3s.md.", "Confirmăm primirea la adresa de la care ați scris și hotărâm fără întârziere nejustificată. Dacă ilegalitatea e evidentă, acționăm imediat.", "Deciziile le iau oameni. Clientul afectat de o măsură primește motivele și poate cere reexaminarea.", "Infracțiunile grave se comunică autorităților.", "Regulile de utilizare acceptabilă sunt în secțiunea 7."] } },
    ],
    sectiuni: [
      {
        cheie: "s1", titlu: "1. Ce facem și ce nu facem",
        blocuri: [
          { jurisdictie: null, paragrafe: ["3S stochează, la cererea clienților, documentele pe care aceștia le încarcă. Clientul stabilește cine are acces la ele (Termeni, secțiunea 5). 3S nu supraveghează informațiile stocate și nu caută în mod activ fapte care ar arăta activități ilicite (Legea nr. 284/2004, art. 14 alin. (3); Regulamentul (UE) 2022/2065, art. 8). Acționăm când primim o notificare sau un ordin al unei instanțe ori al unei autorități și când aflăm altfel despre o informație ilicită.", "Dacă informația în cauză e chiar conținutul 3S (o pagină a acestui site), scrieți la aceeași adresă: îl corectăm sau îl retragem noi (Legea nr. 284/2004, art. 14 alin. (2))."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. Cum notificați o informație ilicită",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Orice persoană sau entitate poate notifica; nu e nevoie de cont. Notificarea se poate face integral electronic, prin e-mail la contact@3s.md, cu subiectul „Notificare - informație ilicită”. Scrieți în ea:"], lista: { numerotata: true, elemente: ["**Motivele.** De ce considerați că informația e ilicită: descrieți pe scurt faptele și, dacă îl cunoașteți, temeiul legal.", "**Locul.** Unde se află informația: adresa URL exactă, dacă există. Dacă nu există, orice element care ne ajută s-o găsim: clientul 3S, contul, numele fișierului, data încărcării.", "**Datele dumneavoastră.** Numele și adresa de e-mail. Nu sunt obligatorii dacă notificarea privește una dintre infracțiunile din art. 3-7 din Directiva 2011/93/UE (abuz sexual asupra copiilor, exploatare sexuală, pornografie infantilă, ademenirea copiilor în scopuri sexuale, instigarea, complicitatea și tentativa la aceste fapte).", "**Declarația.** O propoziție prin care confirmați că, de bună-credință, considerați că informațiile și afirmațiile din notificare sunt exacte și complete."] }, dupa: ["Cu aceste patru elemente putem evalua notificarea cât mai repede. Dacă lipsește ceva, o citim oricum și vă putem cere completări.", "**Notificarea formală după Legea nr. 284/2004.** Legea moldovenească dă un efect aparte notificării scrise, făcute pe propria răspundere de o persoană interesată (art. 17 alin. (3) lit. b)): se aplică procedura de la secțiunea 3, pasul 5. Notificarea formală cuprinde, pe lângă cele patru elemente:"] },
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["declarația, pe propria răspundere, că informația specifică este ilicită, și cererea de a fi eliminată sau de a i se bloca accesul;", "data notificării;", "datele notificatorului: pentru o persoană fizică, numele, prenumele, adresa domiciliului, cetățenia, data și locul nașterii și locul de muncă; pentru o persoană juridică, denumirea, forma juridică, adresa sediului, numele și prenumele administratorului;", "datele destinatarului notificării, adică ale 3S, din [Informații legale](cale:informatii-legale);", "descrierea faptelor contestate și locul lor;", "motivele pentru care informația trebuie eliminată sau blocată, cu probele care dovedesc faptele pretinse;", "copia corespondenței prin care ați cerut autorului informației să o elimine sau să o blocheze, ori probele că autorul nu a putut fi contactat."] }, dupa: ["Legea cere notificare scrisă „(în original)”. Primim notificarea formală și prin e-mail, și în original, prin poștă, la adresa juridică din [Informații legale](cale:informatii-legale). Nu respingem o notificare doar fiindcă n-a venit în original.", "**Atenție.** Notificarea formală se transmite Clientului în întregime, cu datele notificatorului (art. 17 alin. (5)). Dacă nu doriți asta, folosiți notificarea simplă de mai sus: în ea, identitatea dumneavoastră ajunge la Client numai dacă e strict necesar (Regulamentul (UE) 2022/2065, art. 17 alin. (3) lit. b))."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. Ce facem după ce primim notificarea",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { numerotata: true, elemente: ["**Confirmarea.** Dacă ne-ați dat o adresă de e-mail, vă confirmăm primirea fără întârziere.", "**Evaluarea.** O evaluăm cu promptitudine, cu grijă, fără arbitrar și obiectiv (Regulamentul (UE) 2022/2065, art. 16 alin. (6)). Accesăm numai informația specifică vizată de notificare, în măsura necesară pentru decizie (Termeni, secțiunea 6.5). Vă putem cere completări.", "**Cine decide.** Decizia o iau oameni. Nu folosim mijloace automatizate ca să hotărâm dacă o informație e ilicită sau dacă suspendăm un cont. Dacă vom folosi vreodată asemenea mijloace, spunem asta în comunicarea deciziei și pe această pagină.", "**Când acționăm imediat.** Dacă din notificare reiese clar, fără o examinare juridică amănunțită, că informația e ilicită (de pildă, materiale privind abuzul sexual asupra copiilor), sau dacă o instanță ori o autoritate dispune, eliminăm ori blocăm imediat accesul la informația specifică, fără să așteptăm răspunsul Clientului (Legea nr. 284/2004, art. 17 alin. (1)-(3); Regulamentul (UE) 2022/2065, art. 6 și art. 16 alin. (3)).", "**Celelalte cazuri.** Transmitem notificarea Clientului, fără amânări nejustificate, și îi cerem poziția în scris.", "**Decizia.** Vă comunicăm fără întârziere decizia și căile de reexaminare (secțiunea 6). Dacă am folosit mijloace automatizate, o spunem în comunicare.", "**Autoritățile.** Dacă informația ne dă suspiciunea unei infracțiuni cu amenințare la viața sau siguranța unei persoane, informăm prompt autoritățile de aplicare a legii sau autoritățile judiciare din statul ori statele vizate (Regulamentul (UE) 2022/2065, art. 18). Pentru infracțiunile de la secțiunea 4 comunicăm prompt Ministerului Afacerilor Interne informațiile semnalate (Legea nr. 284/2004, art. 25 alin. (1) și (3))."], subelemente: { 4: ["La o notificare formală aplicăm art. 17 alin. (5) din Legea nr. 284/2004. Dacă Clientul se opune în 10 zile lucrătoare de la expedierea notificării, nu suntem obligați să eliminăm informația, iar cel care a notificat poate cere instanței să ne oblige s-o facem. Dacă Clientul e de acord în scris sau nu răspunde în 10 zile lucrătoare, eliminăm ori blocăm accesul fără întârziere.", "La o notificare simplă îi cerem Clientului poziția în același termen de 10 zile lucrătoare și hotărâm după ce o primim sau după expirarea termenului, oricare vine întâi.", "În ambele cazuri putem acționa mai devreme dacă riscul pentru oameni, pentru securitatea serviciului sau pentru alți clienți o cere."] } } },
        ],
      },
      {
        cheie: "s4", titlu: "4. Infracțiunile pentru care sesizăm autoritatea",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Legea nr. 284/2004 (art. 25 alin. (1)) cere să punem la dispoziția publicului un instrument ușor accesibil și vizibil pentru semnalarea activităților care constituie infracțiunile de mai jos din Codul penal al Republicii Moldova. Instrumentul este această pagină, împreună cu adresa contact@3s.md."], lista: { elemente: ["propaganda războiului (art. 140);", "acte de persecuție (art. 169^1);", "hărțuirea sexuală (art. 173);", "ademenirea minorului în scopuri sexuale (art. 175^1);", "încălcarea egalității în drepturi a cetățenilor (art. 176 alin. (2));", "încălcarea drepturilor cetățenilor prin propagarea fascismului, a rasismului și a xenofobiei și prin negarea Holocaustului (art. 176^1 alin. (5));", "încălcarea inviolabilității vieții personale (art. 177 alin. (3));", "violența în familie (art. 201^1 alin. (1) lit. b));", "circulația materialelor privind abuzul sexual asupra unui copil (art. 208^1);", "instigarea în scop terorist sau justificarea publică a terorismului (art. 279^2);", "instigarea la acțiuni violente pe motive de prejudecată (art. 346)."] } },
        ],
      },
      {
        cheie: "s5", titlu: "5. Ce primește Clientul când luăm o măsură",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă, pentru că o informație e ilicită sau încalcă Termenii, o eliminăm, îi blocăm accesul sau îi limităm vizibilitatea, suspendăm ori încetăm serviciul în tot sau în parte sau închidem un Cont, îi trimitem Clientului, cel târziu la data măsurii, o expunere de motive clară și precisă. Ea cuprinde cel puțin (Regulamentul (UE) 2022/2065, art. 17 alin. (3)):"], lista: { elemente: ["ce măsură luăm, cât se întinde (teritorial, dacă e relevant) și cât durează;", "faptele și circumstanțele pe care ne-am sprijinit, inclusiv dacă am hotărât în urma unei notificări sau din proprie inițiativă și, numai dacă e strict necesar, cine a notificat;", "dacă am folosit mijloace automatizate la decizie;", "când informația e ilicită: temeiul juridic și explicația de ce o socotim ilicită;", "când informația încalcă Termenii: temeiul contractual și explicația de ce o socotim incompatibilă cu el;", "căile de reexaminare de la secțiunea 6 și dreptul de a vă adresa instanței."] }, dupa: ["Nu putem trimite expunerea de motive dacă nu cunoaștem datele de contact electronice ale Clientului. Ordinele autorităților urmează secțiunea 9 (Regulamentul (UE) 2022/2065, art. 17 alin. (5))."] },
        ],
      },
      {
        cheie: "s6", titlu: "6. Reexaminarea deciziilor",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Clientul afectat de o măsură și notificatorul a cărui notificare am respins-o pot cere reexaminarea deciziei. Regulile sunt acestea:"], lista: { numerotata: true, elemente: ["Cererea se trimite prin e-mail la contact@3s.md, în cel mult 6 luni de la comunicarea deciziei, cu subiectul „Reexaminare”, cu data deciziei, informația vizată și motivele dumneavoastră.", "Confirmăm primirea fără întârziere.", "Analizăm din nou cazul, pe fond, cu argumentele și probele noi.", "Răspundem motivat, fără întârziere nejustificată.", "Măsura rămâne în vigoare cât durează reexaminarea, dacă nu spunem altfel în confirmarea de primire."] }, dupa: ["Reexaminarea nu vă ia dreptul de a vă adresa oricând instanței. Clientul și Utilizatorii lui, dacă se află sau sunt stabiliți în Uniunea Europeană, pot depune și o plângere la coordonatorul serviciilor digitale din statul în care se află sau sunt stabiliți (Regulamentul (UE) 2022/2065, art. 53); lista coordonatorilor este pe [pagina Comisiei Europene](https://digital-strategy.ec.europa.eu/en/policies/dsa-dscs)."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Reguli de utilizare acceptabilă",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Clientul și Utilizatorii lui folosesc serviciile 3S numai legal și numai în scopul pentru care le oferim. Regulile de mai jos fac parte din Termeni (secțiunile 6.4 și 10).", "**7.1 Ce nu stocați și ce nu faceți cu serviciile:**"], lista: { elemente: ["informații ilicite, mai ales cele de la secțiunea 4, și orice altă informație a cărei stocare sau folosire încalcă legea aplicabilă;", "informații care încalcă drepturile altora: drepturile de proprietate intelectuală, secretul comercial sau protecția datelor personale (Termeni, secțiunea 6.3);", "programe dăunătoare, fișiere făcute ca să afecteze securitatea serviciului sau a altor sisteme și orice încercare de acces neautorizat;", "ocolirea limitelor din ofertă sau a măsurilor de securitate; testele de securitate făcute fără acordul scris al 3S; predarea datelor de acces unor persoane care nu sunt Utilizatori autorizați; revânzarea accesului; folosirea serviciului ca să construiți un produs care îl înlocuiește (Termeni, secțiunile 5 și 12.2);", "orice folosire care afectează funcționarea serviciului pentru alți clienți."] }, dupa: ["**7.2 Asistentul de inteligență artificială.** Clientul și Utilizatorii nu folosesc asistentul:"] },
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["pentru practicile interzise de art. 5 din Regulamentul (UE) 2024/1689;", "ca element al unui sistem destinat unei utilizări enumerate în Anexa III la același regulament, fără acordul scris al 3S (Termeni, secțiunea 7.3);", "ca unic temei al unei decizii cu efecte juridice asupra unei persoane (Regulamentul (UE) 2016/679, art. 22)."] }, dupa: ["Limitele asistentului sunt descrise în [Inteligența artificială în serviciile 3S](cale:inteligenta-artificiala)."] },
        ],
      },
      {
        cheie: "s8", titlu: "8. Măsurile pe care le putem lua",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă informația e ilicită sau regulile din secțiunea 7 sunt încălcate, putem lua una sau mai multe dintre măsurile de mai jos, în ordinea potrivită cazului:"], lista: { elemente: ["avertizarea Clientului, cu cererea de a remedia;", "eliminarea unei informații sau blocarea ori dezactivarea accesului la ea;", "suspendarea, în tot sau în parte, a accesului la Cont sau a serviciului;", "încetarea contractului, după Termeni (secțiunea 9.5);", "sesizarea autorităților, când legea o cere sau o permite."] }, dupa: ["Măsurile sunt proporționale și se opresc la ce e necesar. Ținem seama de gravitatea faptei și de repetarea ei, de intenție, de riscul pentru oameni, pentru securitatea serviciului sau pentru alți clienți, de faptul că informația e vădit ilicită sau nu și de drepturile și interesele legitime ale tuturor celor implicați, inclusiv drepturile fundamentale, cum e libertatea de exprimare (Regulamentul (UE) 2022/2065, art. 14 alin. (4)). Suspendarea pentru neplată urmează secțiunea 10.2 din Termeni."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. Ordinele autorităților",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă o instanță sau o autoritate competentă ne ordonă să acționăm împotriva unei informații ilicite (Regulamentul (UE) 2022/2065, art. 9) ori să dăm informații despre un client (art. 10), ne conformăm în limitele legii. Ordinele se trimit la contact@3s.md, în engleză sau în română (vezi [Informații legale](cale:informatii-legale)). Informăm fără întârziere autoritatea despre efectul dat ordinului. Îl informăm și pe Client despre ordin și despre efectul dat, cu motivele și căile de atac, cel târziu când dăm curs ordinului sau la momentul indicat de autoritate, dacă legea nu ne interzice (art. 9 alin. (5) și art. 10 alin. (5)).", "Informațiile care permit identificarea clienților cu care avem contracte de stocare le comunicăm Ministerului Afacerilor Interne, Serviciului de Informații și Securitate sau Procuraturii Generale, la cererea lor, numai dacă autoritatea deține probe din care rezultă că serviciile sunt folosite pentru activități ilicite (Legea nr. 284/2004, art. 25 alin. (2) și (3))."] },
        ],
      },
      {
        cheie: "s10", titlu: "10. Datele dumneavoastră",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Folosim datele din notificare sau din cererea de reexaminare numai ca să le tratăm și le păstrăm 3 ani de la închiderea cazului, ca să putem dovedi cum am acționat. Notificarea formală se transmite Clientului în întregime (secțiunea 2). Restul e în [Politica de confidențialitate](cale:confidentialitate). Dacă notificarea privește date personale din documentele unui Client, o transmitem și Clientului, care este operatorul acestor date; 3S le prelucrează ca persoană împuternicită, potrivit [acordului de prelucrare a datelor](cale:dpa)."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Modificări",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Modificăm pagina după secțiunea 14 din Termeni. Clienții sunt anunțați prin e-mail despre orice schimbare semnificativă (Regulamentul (UE) 2022/2065, art. 14 alin. (2))."] },
        ],
      },
      {
        cheie: "s12", titlu: "12. Limba",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Pagina există în română și în engleză. Pentru Clienți se aplică secțiunea 17 din Termeni. Pentru ceilalți, versiunea în limba română este cea autentică, iar cea în limba engleză este o traducere."] },
        ],
      },
      {
        cheie: "s13", titlu: "13. Contact",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Notificările și cererile de reexaminare se trimit prin e-mail la contact@3s.md și sunt gratuite. Le primim prin e-mail, ca să putem confirma primirea și păstra dovada; singura excepție e notificarea formală în original, pe care o putem primi și prin poștă (secțiunea 2). Dacă ne scrieți sau ne sunați pe WhatsApp la +373 68 055 599, vă rugăm să repetați notificarea prin e-mail; asta nu ne oprește să acționăm imediat când aflăm de o informație ilicită."] },
        ],
      },
      {
        cheie: "t14", titlu: "Actele citate",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Textele au fost citite pe 30 septembrie 2026."], lista: { elemente: ["[Legea nr. 284/2004 privind serviciile societății informaționale](https://www.legis.md/cautare/getResults?doc_id=150486&lang=ro)", "[Codul penal al Republicii Moldova, nr. 985/2002](https://www.legis.md/cautare/getResults?doc_id=151140&lang=ro)", "[Regulamentul (UE) 2022/2065 (Regulamentul privind serviciile digitale)](https://eur-lex.europa.eu/eli/reg/2022/2065/oj)", "[Directiva 2011/93/UE (combaterea abuzului sexual asupra copiilor, a exploatării sexuale a copiilor și a pornografiei infantile)](https://eur-lex.europa.eu/eli/dir/2011/93/oj)", "[Regulamentul (UE) 2024/1689 (Regulamentul privind inteligența artificială)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)", "[Regulamentul (UE) 2016/679 (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)"] } },
        ],
      },
    ],
  };
}
