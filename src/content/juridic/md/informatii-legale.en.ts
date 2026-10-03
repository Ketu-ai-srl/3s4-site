// Documentul informatii-legale, in engleza americana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 01-legal-notice.en.md, sha256 8d3cf916ec47237356e1332936f42fe3f67ffa8eb88856095122f1a1b544bcfd.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import { campFirma } from "./context";
import type { ContextMd } from "./context";
import type { DocumentJuridic } from "../tipuri";

export default function informatiiLegaleEn(c: ContextMd): DocumentJuridic {
  return {
    cheie: "informatii-legale",
    limba: "en",
    titlu: "Legal notice",
    versiune: "2026-10-01",
    introducere: "This page states who provides the 3S service and how to contact us. The law of the Republic of Moldova requires this information on the website, in Romanian, with easy, direct and permanent access (Law No. 284/2004 on information society services, Article 12). The authentic version is the Romanian page [Informații legale](cale-ro:informatii-legale); this English text is a courtesy translation.",
    sectiuni: [
      {
        cheie: "s1", titlu: "1. The service provider",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The 3S service is provided by 3S Demerzel SRL, a limited liability company (societate cu răspundere limitată) of the Republic of Moldova."], tabel: { forma: "cu-antet", titlu: "1. The service provider", antet: ["Item", "Details"], randuri: [["Full name, with legal form", "3S Demerzel SRL (limited liability company)"], ["State identification number (IDNO)", campFirma(c, "numar_orc")], ["Tax code", campFirma(c, "cod_fiscal")], ["Registered address (postal address)", campFirma(c, "sediu")], ["E-mail address", campFirma(c, "email")], ["WhatsApp (messages and calls)", campFirma(c, "telefon")], ["VAT number", "[pending registration]"], ["Administrator", "[pending registration]"], ["Country", "Republic of Moldova"]] }, dupa: ["The company is not yet entered in the State Register of Legal Entities, so the details marked \"[pending registration]\" do not exist yet. We fill them in from the State Register extract immediately after registration. Until it is registered we issue no offers, enter into no contracts and open no accounts."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. How to contact us",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Write to contact@3s.md, or call or message us on WhatsApp at +373 68 055 599. A person replies, in English or Romanian."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. The service is for professionals",
        blocuri: [
          { jurisdictie: null, paragrafe: ["3S services are offered to professionals only: companies, sole traders and other persons acting for purposes related to their trade, business or profession. We do not enter into contracts with consumers, meaning natural persons acting for personal purposes."] },
        ],
      },
      {
        cheie: "s4", titlu: "4. Prices, tariffs and commercial terms",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The 3S service is offered in the Starter, Pro, Business and Enterprise packages. The indicative prices of the packages are published in euros (EUR) on the [Pricing](cale:preturi) page. The final tariff is confirmed by a written, individual offer, which, once the company is registered, we send on request. The 3S service is provided online, with no shipping. The preparation and scanning of paper documents and the physical storage of the originals are quoted separately; the conditions and costs of these services are set out in the individual offer.", "Prices exclude VAT; where VAT applies, it is added to the invoice.", "Each offer states:"], lista: { elemente: ["the package and the services offered, with the tariff for each;", "the currency of the tariff (EUR);", "any discounts granted against the indicative price;", "whether the price includes taxes (VAT) or not, and their amount;", "whether the price includes delivery or other costs. Online services carry no delivery costs."] }, dupa: ["Payment is due within 14 days of the invoice date; subscriptions are paid in advance. The offer and the price in it remain valid for 30 days from the date of issue, unless the offer sets another period. The contract is concluded under the [Terms and conditions](cale:termeni)."] },
        ],
      },
      {
        cheie: "s5", titlu: "5. Points of contact for authorities and for users (Digital Services Act)",
        blocuri: [
          { jurisdictie: null, paragrafe: ["To the extent that Regulation (EU) 2022/2065 (the Digital Services Act) applies to 3S's services for storing clients' documents, our points of contact are as follows.", "**Authorities (Article 11).** The authorities of the Member States, the European Commission and the European Board for Digital Services can contact us directly, by electronic means, at contact@3s.md. Languages of communication: English and Romanian.", "**Users of the service (Article 12).** Users can contact us directly and quickly, at their choice, by e-mail (contact@3s.md) or on WhatsApp (+373 68 055 599, messages and calls). The channels are staffed by people.", "**Legal representative in the European Union (Article 13).** 3S Demerzel SRL is not established in the European Union. Our legal representative, once appointed, also receives requests concerning data protection (Regulation (EU) 2016/679, Article 27) and, to the extent that it applies, those under Regulation (EU) 2023/2854 (the Data Act, Article 37(11)). Representative: [EU representative: appointment pending]. The representative's name, postal address, e-mail address and telephone number will appear here once appointed."] },
        ],
      },
      {
        cheie: "s6", titlu: "6. Consumer protection authority",
        blocuri: [
          { jurisdictie: null, paragrafe: ["State Inspectorate for the Supervision of Non-Food Products and Consumer Protection (Inspectoratul de Stat pentru Supravegherea Produselor Nealimentare și Protecția Consumatorilor): telephone 022 515 151 and 022 501 981 (from abroad: +373 22 515 151 and +373 22 501 981); official website: [consumator.gov.md](https://consumator.gov.md). 3S services are not offered to consumers (section 3); the law nevertheless requires these details."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Illegal content",
        blocuri: [
          { jurisdictie: null, paragrafe: ["If you find information in the 3S services that you believe to be illegal, you can report it through the procedure on the page [Notice and action](cale:notificare-si-actiune)."] },
        ],
      },
      {
        cheie: "s8", titlu: "8. Personal data protection",
        blocuri: [
          { jurisdictie: null, paragrafe: ["How we process personal data is described in the [Privacy policy](cale:confidentialitate), and what we store in your browser is described in the [Cookie policy](cale:cookie-uri). The supervisory authority in the Republic of Moldova is the National Center for Personal Data Protection (CNPDCP): [datepersonale.md](https://datepersonale.md), str. Serghei Lazo 48, MD-2004, Chișinău, tel. (022) 820 801 (from abroad: +373 22 820 801), centru@datepersonale.md."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. Language of this page",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The information on this page is published in Romanian, which is the authentic version. The English version is a courtesy translation; if the texts differ, the Romanian text applies."] },
        ],
      },
      {
        cheie: "s10", titlu: "10. Website content",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The texts, drawings and the 3S logo on this website belong to their owners and may not be reproduced without their written consent. Links to other websites lead to pages that we do not control."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Other documents",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: ["[Privacy policy](cale:confidentialitate)", "[Cookie policy](cale:cookie-uri)", "[Terms and conditions](cale:termeni)", "[Data Processing Agreement (DPA)](cale:dpa)", "[Sub-processors of the platform](cale:subimputerniciti)", "[Notice and action](cale:notificare-si-actiune)", "[Artificial intelligence in 3S services](cale:inteligenta-artificiala)"] } },
        ],
      },
    ],
  };
}
