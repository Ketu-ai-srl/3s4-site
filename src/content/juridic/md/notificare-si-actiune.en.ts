// Documentul notificare-si-actiune, in engleza americana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 07-notice-and-acceptable-use.en.md, sha256 06f3a6b691fcde93d85008fed4a4aa09085fb740962f53560bae2206c7fa0a44.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import type { DocumentJuridic } from "../tipuri";
import type { ContextMd } from "./context";

export default function notificareSiActiuneEn(c: ContextMd): DocumentJuridic {
  return {
    cheie: "notificare-si-actiune",
    limba: "en",
    titlu: "Notice and action",
    versiune: "2026-10-07",
    introducere: "This page explains how you can report unlawful information stored in the 3S services, how we decide and what follows. The 3S services are provided by 3S Demerzel SRL of the Republic of Moldova; its details are in the [Legal notice](cale:informatii-legale). The page also contains the acceptable use rules for the services and the measures we may take. It forms part of the [Terms and conditions](cale:termeni) (section 1.6) and implements Law No. 284/2004 on information society services (Articles 17 and 25). To the extent that Regulation (EU) 2022/2065 (the Digital Services Act) applies to 3S's services for storing clients' documents, the page also takes account of its requirements (Articles 14, 16, 17 and 18); the regulation calls unlawful information \"illegal content\". \"Client\", \"User\" and \"working day\" have the meaning given in the Terms.",
    preambul: [
      { jurisdictie: null, paragrafe: ["**In brief** (a summary with no contractual value; the text below governs)"], lista: { elemente: ["You report unlawful information by email, at " + c.contact.email + ".", "We confirm receipt to the address you wrote from and decide without undue delay. If the illegality is obvious, we act immediately.", "People take the decisions. A Client affected by a measure receives the reasons and can ask for a review.", "Serious offenses are reported to the authorities.", "The acceptable use rules are in section 7."] } },
    ],
    sectiuni: [
      {
        cheie: "s1", titlu: "1. What we do and what we do not do",
        blocuri: [
          { jurisdictie: null, paragrafe: ["3S stores, at the request of clients, the documents that they upload. The Client decides who has access to them (Terms, section 5). 3S does not monitor the information stored and does not actively look for facts indicating unlawful activity (Law No. 284/2004, Art. 14(3); Regulation (EU) 2022/2065, Art. 8). We act when we receive a notice or an order from a court or an authority, and when we otherwise learn of unlawful information.", "If the information concerned is 3S's own content (a page of this website), write to the same address: we correct or withdraw it ourselves (Law No. 284/2004, Art. 14(2))."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. How to report unlawful information",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Any person or entity can submit a notice; no account is needed. A notice can be made entirely by electronic means, by email to " + c.contact.email + ", with the subject \"Notice - unlawful information\". Write in it:"], lista: { numerotata: true, elemente: ["**The reasons.** Why you consider the information unlawful: briefly describe the facts and, if you know it, the legal basis.", "**The place.** Where the information is: the exact URL, if there is one. If there is not, any element that helps us find it: the 3S client, the account, the file name, the upload date.", "**Your details.** Your name and email address. They are not mandatory if the notice concerns one of the offenses in Articles 3 to 7 of Directive 2011/93/EU (sexual abuse of children, sexual exploitation, child pornography, solicitation of children for sexual purposes, and incitement, aiding and abetting, and attempt in respect of these).", "**The statement.** A sentence confirming that you have a bona fide belief that the information and allegations in the notice are accurate and complete."] }, dupa: ["With these four elements we can assess the notice as quickly as possible. If something is missing, we read it anyway and may ask you to complete it.", "**Formal notice under Law No. 284/2004.** Moldovan law gives a special effect to a written notice made by an interested person on their own responsibility (Art. 17(3)(b)): the procedure in section 3, step 5 applies. The formal notice contains, in addition to the four elements:"] },
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["the statement, on your own responsibility, that the specific information is unlawful, and the request that it be removed or that access to it be blocked;", "the date of the notice;", "the details of the notifier: for a natural person, surname, first name, home address, citizenship, date and place of birth and place of work; for a legal person, name, legal form, registered office address, and the surname and first name of the administrator;", "the details of the addressee of the notice, that is, of 3S, from the [Legal notice](cale:informatii-legale);", "a description of the contested facts and where they are;", "the reasons why the information should be removed or blocked, with the evidence proving the alleged facts;", "a copy of the correspondence by which you asked the author of the information to remove or block it, or evidence that the author could not be contacted."] }, dupa: ["The law requires a written notice \"(in the original)\". We accept the formal notice both by email and in the original, by post, at the registered address in the [Legal notice](cale:informatii-legale). We do not reject a notice merely because it did not arrive in the original.", "**Please note.** The formal notice is forwarded to the Client in full, with the notifier's details (Art. 17(5)). If you do not want that, use the simple notice described above: in it, your identity reaches the Client only if strictly necessary (Regulation (EU) 2022/2065, Art. 17(3)(b))."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. What we do after receiving the notice",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { numerotata: true, elemente: ["**Confirmation.** If you gave us an email address, we confirm receipt without undue delay.", "**Assessment.** We assess it promptly, diligently, in a non-arbitrary and objective manner (Regulation (EU) 2022/2065, Art. 16(6)). We access only the specific information that the notice concerns, to the extent necessary for the decision (Terms, section 6.5). We may ask you to complete it.", "**Who decides.** People take the decision. We do not use automated means to decide whether information is unlawful or whether to suspend an account. If we ever use such means, we will say so in the communication of the decision and on this page.", "**When we act immediately.** If it is clear from the notice, without a detailed legal examination, that the information is unlawful (for example, material depicting the sexual abuse of children), or if a court or an authority orders it, we remove or block access to the specific information immediately, without waiting for the Client's reply (Law No. 284/2004, Art. 17(1)-(3); Regulation (EU) 2022/2065, Art. 6 and Art. 16(3)).", "**Other cases.** We forward the notice to the Client, without undue delay, and ask for its position in writing.", "**The decision.** We communicate the decision to you without undue delay, together with the possibilities for review (section 6). If we used automated means, we say so in the communication.", "**Authorities.** If the information gives rise to a suspicion of a criminal offense involving a threat to the life or safety of a person, we promptly inform the law enforcement or judicial authorities of the State or States concerned (Regulation (EU) 2022/2065, Art. 18). For the offenses in section 4, we promptly communicate the information reported to us to the Ministry of Internal Affairs (Law No. 284/2004, Art. 25(1) and (3))."], subelemente: { 4: ["For a formal notice we apply Art. 17(5) of Law No. 284/2004. If the Client objects within 10 working days of the dispatch of the notice, we are not obliged to remove the information, and the person who gave notice can ask a court to oblige us to do so. If the Client agrees in writing or does not reply within 10 working days, we remove or block access without delay.", "For a simple notice we ask the Client for its position within the same 10 working days and decide once we have received it or the period has expired, whichever comes first.", "In both cases we may act earlier if the risk to people, to the security of the service or to other clients requires it."] } } },
        ],
      },
      {
        cheie: "s4", titlu: "4. Offenses for which we notify the authority",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Law No. 284/2004 (Art. 25(1)) requires us to make available to the public an easily accessible and visible tool for reporting activities that constitute the offenses below in the Criminal Code of the Republic of Moldova. The tool is this page, together with the address " + c.contact.email + "."], lista: { elemente: ["propaganda for war (Art. 140);", "acts of persecution (Art. 169¹);", "sexual harassment (Art. 173);", "luring of a minor for sexual purposes (Art. 175¹);", "violation of citizens' equality of rights (Art. 176(2));", "violation of citizens' rights through the propagation of fascism, racism and xenophobia and through Holocaust denial (Art. 176¹(5));", "violation of the inviolability of private life (Art. 177(3));", "domestic violence (Art. 201¹(1)(b));", "circulation of material relating to the sexual abuse of a child (Art. 208¹);", "incitement for terrorist purposes or public justification of terrorism (Art. 279²);", "incitement to violent action on grounds of prejudice (Art. 346)."] } },
        ],
      },
      {
        cheie: "s5", titlu: "5. What the Client receives when we take a measure",
        blocuri: [
          { jurisdictie: null, paragrafe: ["If, because information is unlawful or breaches the Terms, we remove it, block access to it or restrict its visibility, suspend or terminate the service in whole or in part, or close an Account, we send the Client, at the latest on the date of the measure, a clear and specific statement of reasons. It contains at least (Regulation (EU) 2022/2065, Art. 17(3)):"], lista: { elemente: ["the measure we take, how far it extends (territorially, where relevant) and how long it lasts;", "the facts and circumstances we relied on, including whether we decided following a notice or on our own initiative and, only if strictly necessary, who gave notice;", "whether we used automated means in the decision;", "where the information is unlawful: the legal ground and the explanation of why we consider it unlawful;", "where the information breaches the Terms: the contractual ground and the explanation of why we consider it incompatible with them;", "the possibilities for review in section 6 and the right to apply to a court."] }, dupa: ["We cannot send the statement of reasons if we do not know the Client's electronic contact details. Orders from authorities follow section 9 (Regulation (EU) 2022/2065, Art. 17(5))."] },
        ],
      },
      {
        cheie: "s6", titlu: "6. Review of decisions",
        blocuri: [
          { jurisdictie: null, paragrafe: ["A Client affected by a measure, and a notifier whose notice we rejected, can ask for the decision to be reviewed. The rules are these:"], lista: { numerotata: true, elemente: ["The request is sent by email to " + c.contact.email + ", within 6 months of communication of the decision, with the subject \"Review\", the date of the decision, the information concerned and your reasons.", "We confirm receipt without undue delay.", "We examine the case again, on the merits, with the new arguments and evidence.", "We reply with reasons, without undue delay.", "The measure stays in force while the review lasts, unless we say otherwise in the confirmation of receipt."] }, dupa: ["A review does not take away your right to apply to a court at any time. A Client or User located or established in the European Union can also lodge a complaint with the Digital Services Coordinator of the State where it is located or established (Regulation (EU) 2022/2065, Art. 53); the list of coordinators is on the [European Commission page](https://digital-strategy.ec.europa.eu/en/policies/dsa-dscs)."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Acceptable use rules",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The Client and its Users use the 3S services only lawfully and only for the purpose for which we offer them. The rules below form part of the Terms (sections 6.4 and 10).", "**7.1 What the Client and its Users do not store and do not do with the services:**"], lista: { elemente: ["unlawful information, especially that in section 4, and any other information whose storage or use breaches the applicable law;", "information that infringes the rights of others: intellectual property rights, trade secrets or personal data protection (Terms, section 6.3);", "malicious software, files made to harm the security of the service or of other systems, and any attempt at unauthorized access;", "circumventing the limits in the offer or the security measures; security tests carried out without 3S's written consent; handing access details to persons who are not authorized Users; reselling access; using the service to build a product that replaces it (Terms, sections 5 and 12.2);", "any use that affects the operation of the service for other clients."] }, dupa: ["**7.2 The artificial intelligence assistant.** The Client and its Users do not use the assistant:"] },
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["for the practices prohibited by Art. 5 of Regulation (EU) 2024/1689;", "as a component of a system intended for a use listed in Annex III to the same regulation, without 3S's written consent (Terms, section 7.3);", "as the sole basis for a decision with legal effects on a person (Regulation (EU) 2016/679, Art. 22)."] }, dupa: ["The assistant's limits are described on the [Artificial intelligence in 3S services](cale:inteligenta-artificiala) page."] },
        ],
      },
      {
        cheie: "s8", titlu: "8. The measures we may take",
        blocuri: [
          { jurisdictie: null, paragrafe: ["If information is unlawful or the rules in section 7 are breached, we may take one or more of the measures below, in the order suited to the case:"], lista: { elemente: ["a warning to the Client, with a request to remedy;", "removal of information, or blocking or disabling access to it;", "suspension, in whole or in part, of access to the Account or of the service;", "termination of the contract, under the Terms (section 9.5);", "reporting to the authorities, where the law requires or permits it."] }, dupa: ["Measures are proportionate and do not go beyond what is necessary. We take into account the gravity of the act and its repetition, intent, the risk to people, to the security of the service or to other clients, whether the information is manifestly unlawful or not, and the rights and legitimate interests of everyone involved, including fundamental rights such as freedom of expression (Regulation (EU) 2022/2065, Art. 14(4)). Suspension for non-payment follows section 10.2 of the Terms."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. Orders from authorities",
        blocuri: [
          { jurisdictie: null, paragrafe: ["If a court or a competent authority orders us to act against unlawful information (Regulation (EU) 2022/2065, Art. 9) or to provide information about a client (Art. 10), we comply within the limits of the law. Orders are sent to " + c.contact.email + ", in English or Romanian (see the [Legal notice](cale:informatii-legale)). We inform the authority without delay of the effect given to the order. We also inform the Client of the order and of the effect given to it, with the reasons and the possibilities for redress, at the latest when we give effect to the order or at the time indicated by the authority, unless the law prohibits it (Art. 9(5) and Art. 10(5)).", "The information that allows the identification of the clients with whom we have storage contracts is communicated to the Ministry of Internal Affairs, the Intelligence and Security Service or the Prosecutor General's Office, at their request, only if the authority holds evidence showing that the services are used for unlawful activities (Law No. 284/2004, Art. 25(2) and (3))."] },
        ],
      },
      {
        cheie: "s10", titlu: "10. Your data",
        blocuri: [
          { jurisdictie: null, paragrafe: ["We use the data in a notice or in a request for review only to deal with it, and we keep it for 3 years from the closing of the case, to be able to prove how we acted. The formal notice is forwarded to the Client in full (section 2). The rest is in the [Privacy policy](cale:confidentialitate). If a notice concerns personal data in a Client's documents, we also forward it to the Client, which is the controller of that data; 3S processes it as a processor, under the [Data Processing Agreement](cale:dpa)."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Changes",
        blocuri: [
          { jurisdictie: null, paragrafe: ["We change this page under section 14 of the Terms. Clients are informed by email of any significant change (Regulation (EU) 2022/2065, Art. 14(2))."] },
        ],
      },
      {
        cheie: "s12", titlu: "12. Language",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The page exists in Romanian and in English. For Clients, section 17 of the Terms applies. For everyone else, the Romanian version is the authentic one, and the English version is a translation."] },
        ],
      },
      {
        cheie: "s13", titlu: "13. Contact",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Notices and requests for review are sent by email to " + c.contact.email + " and are free of charge. We receive them by email, so that we can confirm receipt and keep the evidence; the only exception is the formal notice in the original, which we may also receive by post (section 2). If you write to us or call us on WhatsApp at " + c.contact.telefon + ", please repeat the notice by email; that does not stop us from acting immediately when we learn of unlawful information."] },
        ],
      },
      {
        cheie: "t14", titlu: "Acts cited",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The texts were read on September 30, 2026."], lista: { elemente: ["[Law No. 284/2004 on information society services](https://www.legis.md/cautare/getResults?doc_id=150486&lang=ro)", "[Criminal Code of the Republic of Moldova, No. 985/2002](https://www.legis.md/cautare/getResults?doc_id=151140&lang=ro)", "[Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/eli/reg/2022/2065/oj)", "[Directive 2011/93/EU (combating the sexual abuse and sexual exploitation of children and child pornography)](https://eur-lex.europa.eu/eli/dir/2011/93/oj)", "[Regulation (EU) 2024/1689 (Artificial Intelligence Act)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)", "[Regulation (EU) 2016/679 (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)"] } },
        ],
      },
    ],
  };
}
