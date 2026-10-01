// Documentul subimputerniciti, in engleza americana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 06-subprocessors.en.md, sha256 dd576242a4a9cf1559e51de00e6a039a8d6c843bccd37602bdc38e23eeb98ee0.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import type { DocumentJuridic } from "../tipuri";

export default function subimputernicitiEn(): DocumentJuridic {
  return {
    cheie: "subimputerniciti",
    limba: "en",
    titlu: "Sub-processors of the platform",
    versiune: "2026-10-01",
    introducere: "For the Documents you upload to the 3S Service, your company is, as a rule, the controller of the data, and 3S Demerzel SRL processes them on its behalf, under the [Data Processing Agreement](cale:dpa) (the \"DPA\"). This page shows which other providers take part in the processing, what each does and where the data is. Table A is the Agreed List in Article 7.1 of the DPA. Table B shows the providers that serve the website and our contact channels and that do not receive the Documents uploaded to the Service.",
    sectiuni: [
      {
        cheie: "a", titlu: "A. Sub-processors that receive the Client Documents (the Agreed List)",
        blocuri: [
          { jurisdictie: null, paragrafe: [], tabel: { forma: "cu-antet", titlu: "A. Sub-processors that receive the Client Documents (the Agreed List)", antet: ["No.", "Provider", "What it does", "Where the data is", "Transfer: EU/EEA Clients", "Transfer: Clients in the Republic of Moldova"], randuri: [["1", "The platform provider (the name, in the complete list)", "The application: the accounts, the uploaded files, indexing, search, the answers with the document cited (and the page, where the system can give it)", "[N3: the country]", "[N3: the mechanism]", "[N3: the mechanism]"], ["2", "Amazon Web Services [N3: the contracting entity and who engages it], engaged by the platform provider", "Hosts the platform: the accounts, the uploaded files and the digital archive", "In the European Union, with Frankfurt (Germany) as the primary region; weekly backups in Ireland; processing by artificial intelligence models, in any region of the European Union [N24: the storage, backup and inference regions, confirmed by the platform provider]", "The data stays in the EU/EEA: not an onward transfer within the meaning of the standard clauses", "Transfer to states in the EEA, free (Law No. 195/2024, Article 44(2))"], ["3", "[N3: the text recognition provider]", "Reads scanned pages automatically", "[N3: the country]", "[N3: the mechanism]", "[N3: the mechanism]"], ["4", "[N3: the language model provider]", "Generates the answers and the summaries, citing the document (and the page, where the system can give it)", "[N3: the country]", "[N3: the mechanism]", "[N3: the mechanism]"], ["5", "[N3: the transactional e-mail provider]", "Sends the invitations and the notifications of the Service", "[N3: the country]", "[N3: the mechanism]", "[N3: the mechanism]"]] }, dupa: ["A provider enters this table before it receives data. The complete list, with the name of the providers shown here only by category and with the address and the contact person of each sub-processor, is sent to the Client together with the PDF copy of the DPA and at any time on request, at contact@3s.md (DPA, Articles 7.1 and 7.7).", "**How to read the transfer columns.**"] },
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["**EU/EEA Clients.** A sub-processor in the EU/EEA is not an onward transfer within the meaning of the standard contractual clauses in Decision (EU) 2021/914 (Clause 8.8 and its footnotes). Data reaches a sub-processor outside the EU/EEA only if it is on the Agreed List, with the mechanism shown for it: an adequacy decision of the Commission that covers the transfer (for example the EU-US Framework, for a certified provider) or appropriate safeguards, including the standard clauses (DPA, Article 8.3). The columns concern the providers on the list; remote access by 3S personnel from the Republic of Moldova to the data of EU/EEA Clients, where it takes place, is a transfer to a third country and is dealt with separately in the DPA (Article 8.2 and Annex 2).", "**Clients in the Republic of Moldova.** Transfer to a state in the EEA is free (Law No. 195/2024, Article 44(2)). To other states it requires appropriate safeguards, including the standard clauses approved by the National Center for Personal Data Protection or adopted by the European Commission (Article 46(2)(c)). Commission adequacy decisions are an element the Center takes into account, not an automatic effect (Article 45(2)(d))."] } },
        ],
      },
      {
        cheie: "b", titlu: "B. Other 3S providers, which do not receive the Client Documents",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The providers below serve the website 3s.md and the contact channels (e-mail, WhatsApp, telephone). They are not involved in storing or processing the Documents uploaded to the Service; if they were, they would enter table A before they receive data [N21: confirmation that none of them has access to the Documents uploaded to the Service]. Do not send documents containing personal data of third parties through the contact channels (DPA, Article 3.6)."], tabel: { forma: "cu-antet", titlu: "B. Other 3S providers, which do not receive the Client Documents", antet: ["Provider", "What it does", "Country", "Safeguards for transfer outside the EEA"], randuri: [["A Romanian IT and analytics service provider, our processor", "administers the website server, the contact records, the mailbox and the accounts through which the data passes", "Romania", "the data stays in the EEA; transfer to it is free (Law No. 195/2024, Article 44(2))"], ["A provider of hosting on virtual servers", "hosts the server on which the website runs", "Germany [N23: the host's country, confirmed from the host's contract]", "the data stays in the EEA; transfer to it is free (Law No. 195/2024, Article 44(2))"], ["Cloudflare, Inc.", "the DNS service of the domain 3s.md and forwarding of messages sent to contact@3s.md", "United States", "the EU-US Data Privacy Framework (Decision (EU) 2023/1795) and the standard clauses in the provider's data processing agreement; details, including for people in the Republic of Moldova, in the [Privacy policy](cale:confidentialitate), section 6"], ["Google Ireland Limited or Google LLC", "the 3S mailbox", "Ireland; United States", "the EU-US Framework and, where necessary, standard clauses; details in the Privacy policy, section 6"], ["WhatsApp Ireland Limited or WhatsApp LLC (Meta group)", "messaging on the number +373 68 055 599", "Ireland; United States", "the EU-US Framework; the WhatsApp Business App terms; details in the Privacy policy, section 6"]] }, dupa: ["The other recipients of the data of visitors and of contact persons are in the [Privacy policy](cale:confidentialitate), section 5."] },
        ],
      },
      {
        cheie: "t3", titlu: "Artificial intelligence models",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The Service uses artificial intelligence models to read and search documents. The provider of a model that receives the content of the Documents enters table A, with its country and the transfer mechanism, before it receives any document, and only after 3S has verified in writing that its terms forbid using the documents to train models (DPA, Article 4.5) [N1: confirmation of the model providers' terms]. How the assistant works, in plain terms, is described on the page [Artificial intelligence in 3S services](cale:inteligenta-artificiala)."] },
        ],
      },
      {
        cheie: "t4", titlu: "How we announce changes",
        blocuri: [
          { jurisdictie: null, paragrafe: ["At least 30 days before a new sub-processor receives data or one in table A is replaced, we notify you by e-mail, at the address for notices in the acceptance form (failing that, the Account administrator), and update this page. The notice shows:"], lista: { elemente: ["who it is and in which country the data is;", "which part of the processing it takes over;", "the transfer mechanism;", "the date from which the processing starts and until when you can object to the change."] }, dupa: ["At the date of this version no change has been announced."] },
        ],
      },
      {
        cheie: "t5", titlu: "If you do not agree",
        blocuri: [
          { jurisdictie: null, paragrafe: ["You may object, in writing and on reasonable data protection grounds, up to the date on which the new sub-processor starts processing (DPA, Article 7.3). As long as the objection is not resolved, we do not pass your data to it. We seek a solution together within 30 days at most. If there is none, you may terminate the affected Service without penalty, and the data is returned and erased under Article 13 of the DPA."] },
        ],
      },
      {
        cheie: "t6", titlu: "Questions about the list",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Write to us at contact@3s.md."] },
        ],
      },
    ],
  };
}
