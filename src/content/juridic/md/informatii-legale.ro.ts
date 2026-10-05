// Documentul informatii-legale, in romana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 01-informatii-legale.ro.md, sha256 0beee026d9c15ba2d75ec25878631f2918c4289b84d2cbef77aed7e4ddc457c6.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import { campFirma } from "./context";
import type { ContextMd } from "./context";
import type { DocumentJuridic } from "../tipuri";

export default function informatiiLegaleRo(c: ContextMd): DocumentJuridic {
  return {
    cheie: "informatii-legale",
    limba: "ro",
    titlu: "Informații legale",
    versiune: "2026-10-01",
    introducere: "Pagina spune cine furnizează serviciul 3S și cum ne puteți contacta. Legea Republicii Moldova cere aceste informații pe site, în limba română, cu acces ușor, direct și permanent (Legea nr. 284/2004 privind serviciile societății informaționale, art. 12).",
    sectiuni: [
      {
        cheie: "s1", titlu: "1. Furnizorul serviciului",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Serviciul 3S este furnizat de 3S Demerzel SRL, societate cu răspundere limitată din Republica Moldova."], tabel: { forma: "cu-antet", titlu: "1. Furnizorul serviciului", antet: ["Element", "Date"], randuri: [["Denumirea completă, cu forma juridică", "3S Demerzel SRL (societate cu răspundere limitată)"], ["Numărul de identificare de stat (IDNO)", campFirma(c, "numar_orc")], ["Codul fiscal", campFirma(c, "cod_fiscal")], ["Adresa juridică (adresa poștală)", campFirma(c, "sediu")], ["Adresa de poștă electronică", campFirma(c, "email")], ["WhatsApp (mesaje și apeluri)", campFirma(c, "telefon")], ["Codul TVA", "[în curs de înregistrare]"], ["Administrator", "[în curs de înregistrare]"], ["Țara", "Republica Moldova"]] }, dupa: ["Societatea nu este încă înscrisă în Registrul de stat al persoanelor juridice, deci datele marcate „[în curs de înregistrare]” nu există încă. Le completăm din extrasul din Registrul de stat imediat după înregistrare. Până la înregistrare nu emitem oferte, nu încheiem contracte și nu deschidem conturi."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. Cum ne contactați",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Ne scrieți la contact@3s.md sau ne sunați ori ne scrieți pe WhatsApp la +373 60 055 599. Răspunde un om, în română sau în engleză."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. Serviciul se adresează profesioniștilor",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Serviciile 3S se adresează exclusiv profesioniștilor: societăți, întreprinzători individuali și alte persoane care acționează în scopuri legate de activitatea lor de întreprinzător sau profesională. Nu încheiem contracte cu consumatori, adică cu persoane fizice care acționează în scopuri personale."] },
        ],
      },
      {
        cheie: "s4", titlu: "4. Prețuri, tarife și condiții comerciale",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Serviciul 3S se oferă în pachetele Starter, Pro, Business și Enterprise. Prețurile orientative ale pachetelor sunt publicate în euro (EUR) pe pagina [Prețuri](cale:preturi). Tariful final îl confirmă oferta scrisă și individuală, pe care, după înregistrarea societății, o trimitem la cerere. Serviciul 3S se prestează online, fără expediere. Pregătirea și scanarea documentelor pe hârtie și păstrarea fizică a originalelor se ofertează separat; condițiile și costurile acestor servicii se stabilesc în oferta individuală.", "Prețurile nu includ TVA; acolo unde se aplică TVA, aceasta se adaugă pe factură.", "Fiecare ofertă arată:"], lista: { elemente: ["pachetul și serviciile oferite, cu tariful fiecăruia;", "moneda tarifului (EUR);", "reducerile acordate față de prețul orientativ, dacă există;", "dacă prețul include sau nu taxele (TVA) și valoarea lor;", "dacă prețul include cheltuieli de livrare sau alte cheltuieli. Serviciile online nu au cheltuieli de livrare."] }, dupa: ["Termenul de plată este de 14 zile de la data facturii; abonamentele se plătesc în avans. Oferta și prețul din ea rămân valabile 30 de zile de la emitere, dacă oferta nu prevede alt termen. Contractul se încheie în condițiile din [Termeni și condiții](cale:termeni)."] },
        ],
      },
      {
        cheie: "s5", titlu: "5. Puncte de contact pentru autorități și pentru utilizatori (Regulamentul privind serviciile digitale)",
        blocuri: [
          { jurisdictie: null, paragrafe: ["În măsura în care Regulamentul (UE) 2022/2065 (Regulamentul privind serviciile digitale) se aplică serviciilor 3S de stocare a documentelor clienților, punctele noastre de contact sunt cele de mai jos.", "**Autorități (art. 11).** Autoritățile statelor membre, Comisia Europeană și Comitetul european pentru servicii digitale ne pot contacta direct, prin mijloace electronice, la contact@3s.md. Limbile de comunicare: engleza și româna.", "**Utilizatorii serviciului (art. 12).** Utilizatorii ne pot contacta direct și rapid, la alegere, prin e-mail (contact@3s.md) sau pe WhatsApp (+373 60 055 599, mesaje și apeluri). Canalele sunt deservite de oameni.", "**Reprezentant legal în Uniunea Europeană (art. 13).** 3S Demerzel SRL nu este stabilită în Uniunea Europeană. Reprezentantul nostru legal, odată desemnat, primește și solicitările privind protecția datelor (Regulamentul (UE) 2016/679, art. 27) și, în măsura în care se aplică, cele din Regulamentul (UE) 2023/2854 (Regulamentul privind datele, art. 37 alin. (11)). Reprezentant: [reprezentant în UE: în curs de desemnare]. Numele, adresa poștală, adresa de e-mail și numărul de telefon ale reprezentantului apar aici după desemnare."] },
        ],
      },
      {
        cheie: "s6", titlu: "6. Autoritatea pentru protecția consumatorilor",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Inspectoratul de Stat pentru Supravegherea Produselor Nealimentare și Protecția Consumatorilor: telefon 022 515 151 și 022 501 981 (din străinătate: +373 22 515 151 și +373 22 501 981); pagina web oficială: [consumator.gov.md](https://consumator.gov.md). Serviciile 3S nu se adresează consumatorilor (secțiunea 3); legea cere totuși aceste date."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Conținut ilicit",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Dacă găsiți în serviciile 3S informații despre care credeți că sunt ilicite, ne puteți sesiza prin procedura din pagina [Notificare și acțiune](cale:notificare-si-actiune)."] },
        ],
      },
      {
        cheie: "s8", titlu: "8. Protecția datelor personale",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Cum prelucrăm datele personale scrie în [Politica de confidențialitate](cale:confidentialitate), iar ce păstrăm în browserul dumneavoastră scrie în [Politica de cookie-uri](cale:cookie-uri). Autoritatea de supraveghere din Republica Moldova este Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP): [datepersonale.md](https://datepersonale.md), str. Serghei Lazo nr. 48, MD-2004, mun. Chișinău, tel. (022) 820 801 (din străinătate: +373 22 820 801), centru@datepersonale.md."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. Limba acestei pagini",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Informațiile din pagină sunt publicate în limba română, care este versiunea autentică. Versiunea în limba engleză este o traducere de curtoazie; dacă textele diferă, se aplică cel românesc."] },
        ],
      },
      {
        cheie: "s10", titlu: "10. Conținutul site-ului",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Textele, desenele și sigla 3S de pe acest site aparțin titularilor lor și nu se reproduc fără acordul lor scris. Legăturile spre alte site-uri duc la pagini pe care nu le controlăm."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Alte documente",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["[Politica de confidențialitate](cale:confidentialitate)", "[Politica de cookie-uri](cale:cookie-uri)", "[Termeni și condiții](cale:termeni)", "[Acordul de prelucrare a datelor (DPA)](cale:dpa)", "[Subîmputerniciții platformei](cale:subimputerniciti)", "[Notificare și acțiune](cale:notificare-si-actiune)", "[Inteligența artificială în serviciile 3S](cale:inteligenta-artificiala)"] } },
        ],
      },
    ],
  };
}
