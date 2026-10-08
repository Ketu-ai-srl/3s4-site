// Documentul subimputerniciti, in engleza americana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 06-subprocessors.en.md, sha256 f714577f736014f50754beeb93232dc93a09ecc6fa206f54062dd72f4d0f6ff8.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import type { DocumentJuridic } from "../tipuri";
import type { ContextMd } from "./context";

export default function subimputernicitiEn(c: ContextMd): DocumentJuridic {
  return {
    cheie: "subimputerniciti",
    limba: "en",
    titlu: "Sub-processors of the platform",
    versiune: "2026-10-07",
    introducere: "For the Documents you upload to the 3S Service, your company is, as a rule, the controller of the data, and 3S Demerzel SRL processes them on its behalf, under the [Data Processing Agreement](cale:dpa) (the \"DPA\"). This page shows which other providers take part in the processing, what each does and where the data is. Table A is the Agreed List in Article 7.1 of the DPA. Table B shows the providers that serve the website and our contact channels and that do not receive the Documents uploaded to the Service.",
    sectiuni: [
      {
        cheie: "a", titlu: "A. Sub-processors that receive the Client Documents (the Agreed List)",
        blocuri: [
          { jurisdictie: null, paragrafe: [], tabel: { forma: "cu-antet", titlu: "A. Sub-processors that receive the Client Documents (the Agreed List)", antet: ["No.", "Provider", "What it does", "Where the data is", "Transfer: EU/EEA Clients", "Transfer: Clients in the Republic of Moldova"], randuri: [["1", "The platform provider (the name, in the complete list)", "The application: the accounts, the uploaded files, indexing, search, the answers with the document cited (and the page, where the system can give it)", "In the infrastructure in row 2 (European Union); the country from which the provider accesses the data, in the complete list", "In the complete list, according to the provider's country", "In the complete list, according to the provider's country"], ["2", "Amazon Web Services (the contracting entity, in the complete list), engaged by the platform provider", "Hosts the platform: the accounts, the uploaded files, the database, the digital archive and the backups", "In the European Union, with Frankfurt (Germany) as the primary region; weekly backups in Ireland; processing by artificial intelligence models, in any region of the European Union", "The data stays in the EU/EEA: not an onward transfer within the meaning of the standard clauses", "Transfer to states in the EEA, free (Law No. 195/2024, Article 44(2))"], ["3", "Amazon Web Services (Amazon Textract), the same entity as in row 2", "Extracts the text from scanned pages; files over 100 MB or 5,000 pages are sent to it whole", "European Union, Frankfurt region (Germany); the copies Amazon Web Services may keep to improve the service may be in another region (DPA, Article 4.5)", "The processing takes place in the EU/EEA and is not an onward transfer within the meaning of the standard clauses; text recognition runs for a Client only after the Amazon Web Services opt-out policy applies (DPA, Article 4.5)", "Transfer to states in the EEA, free (Law No. 195/2024, Article 44(2)); for the copies under DPA, Article 4.5, the same reservation as in the previous column"], ["4", "Amazon Web Services (Amazon Bedrock), the same entity as in row 2; the model providers do not receive the documents", "Generates the answers and the summaries, citing the document (and the page, where the system can give it)", "European Union, any region", "The data stays in the EU/EEA: not an onward transfer within the meaning of the standard clauses", "Transfer to states in the EEA, free (Law No. 195/2024, Article 44(2))"], ["5", "Amazon Web Services (Amazon SES), the same entity as in row 2", "Sends the invitations and the notifications of the Service", "European Union, Frankfurt region (Germany)", "The data stays in the EU/EEA: not an onward transfer within the meaning of the standard clauses", "Transfer to states in the EEA, free (Law No. 195/2024, Article 44(2))"]] }, dupa: ["A provider enters this table before it receives data. The complete list, with the name of the providers shown here only by category and with the address and the contact person of each sub-processor, is sent to the Client together with the offer and the DPA and at any time on request, at " + c.contact.email + " (DPA, Articles 7.1 and 7.7).", "**How to read the transfer columns.**"] },
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["**EU/EEA Clients.** A sub-processor in the EU/EEA is not an onward transfer within the meaning of the standard contractual clauses in Decision (EU) 2021/914 (Clause 8.8 and its footnotes). Data reaches a sub-processor outside the EU/EEA only if it is on the Agreed List, with the mechanism shown for it: an adequacy decision of the Commission that covers the transfer (for example the EU-US Framework, for a certified provider) or appropriate safeguards, including the standard clauses (DPA, Article 8.3). The columns concern the providers on the list; remote access by 3S personnel from the Republic of Moldova to the data of EU/EEA Clients, where it takes place, is a transfer to a third country and is dealt with separately in the DPA (Article 8.2 and Annex 2).", "**Clients in the Republic of Moldova.** Transfer to a state in the EEA is free (Law No. 195/2024, Article 44(2)). To other states it requires appropriate safeguards, including the standard clauses approved by the National Center for Personal Data Protection or adopted by the European Commission (Article 46(2)(c)). Commission adequacy decisions are an element the Center takes into account, not an automatic effect (Article 45(2)(d))."] } },
        ],
      },
      {
        cheie: "b", titlu: "B. Other 3S providers, which do not receive the Client Documents",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The providers below serve the website " + c.domeniu + " and the contact channels (e-mail and WhatsApp). 3S does not entrust them with storing or processing the Documents uploaded to the Service; a provider entrusted with them would enter table A before it receives data. Do not send documents containing personal data of third parties through the contact channels (DPA, Article 3.6)."],
            tabel: { forma: "cu-antet", titlu: "B. Other 3S providers, which do not receive the Client Documents", antet: ["Provider", "What it does", "Country", "Safeguards for transfer outside the EEA"], randuri: [["A Romanian IT and analytics service provider, our processor", "administers the website server, the contact records, the mailbox and the accounts through which the data passes", "Romania", "the data stays in the EEA; transfer to it is free (Law No. 195/2024, Article 44(2))"], ["A provider of hosting on virtual servers", "hosts the server on which the website runs", "Germany", "the data stays in the EEA; transfer to it is free (Law No. 195/2024, Article 44(2))"], ["Cloudflare, Inc.", "the DNS service of the domain 3s.md and forwarding of messages sent to contact@3s.md", "United States", "the EU-US Data Privacy Framework (Decision (EU) 2023/1795) and the standard clauses in the provider's data processing agreement; details, including for people in the Republic of Moldova, in the [Privacy policy](cale:confidentialitate), section 6"], ["Google Ireland Limited or Google LLC", "the 3S mailbox", "Ireland; United States", "the EU-US Framework and, where necessary, standard clauses; details in the Privacy policy, section 6"], ["WhatsApp Ireland Limited or WhatsApp LLC (Meta group)", "messaging on the number +373 60 055 599", "Ireland; United States", "the EU-US Framework; the WhatsApp Business App terms; details in the Privacy policy, section 6"]] }, dupa: ["The other recipients of the data of visitors and of contact persons are in the [Privacy policy](cale:confidentialitate), section 5."] },
        ],
      },
      {
        cheie: "t3", titlu: "Artificial intelligence models",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The Service uses artificial intelligence models to read and search documents. The models run at Amazon Web Services (table A, row 4), and their providers do not receive the documents. For text recognition (table A, row 3), the Amazon Web Services documentation provides that Amazon Textract may use and store the content it processes to improve the service, including in another region, unless the account holder applies the Amazon Web Services opt-out policy for such use; text recognition is turned on for your company only after this policy applies and we have confirmed it to you in writing, and on request we turn it off (DPA, Article 4.5). A new provider of models or of text recognition enters table A, with the country and the transfer mechanism, before it receives any document, and only after 3S has verified in writing that its terms forbid using the documents to train or improve models (DPA, Article 4.5). How the assistant works, in plain terms, is described on the page [Artificial intelligence in 3S services](cale:inteligenta-artificiala)."] },
        ],
      },
      {
        cheie: "t4", titlu: "How we announce changes",
        blocuri: [
          { jurisdictie: null, paragrafe: ["At least 30 days before a new sub-processor receives data or one in table A is replaced, we notify you by e-mail, at the address for notices in the accepted offer (failing that, the Account administrator), and update this page. The notice shows:"], lista: { elemente: ["who it is and in which country the data is;", "which part of the processing it takes over;", "the transfer mechanism;", "the date from which the processing starts and until when you can object to the change."] }, dupa: ["At the date of this version no change has been announced."] },
        ],
      },
      {
        cheie: "t5", titlu: "If you do not agree",
        blocuri: [
          { jurisdictie: null, paragrafe: ["You may object, in writing and on reasonable data protection grounds, up to the date on which the new sub-processor starts processing (DPA, Article 7.3). As long as the objection is not resolved, we do not pass your data to it; if the new sub-processor serves a common function of the Service (the artificial intelligence models or text recognition), we stop that function for your company. We seek a solution together within 30 days at most. If there is none, you may terminate the affected Service without penalty, and the data is returned and erased under Article 13 of the DPA."] },
        ],
      },
      {
        cheie: "t6", titlu: "Questions about the list",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Write to us at " + c.contact.email + "."] },
        ],
      },
    ],
  };
}
