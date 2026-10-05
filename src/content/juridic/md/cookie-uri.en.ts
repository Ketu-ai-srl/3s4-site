// Documentul cookie-uri, in engleza americana, pentru operatorul din Republica Moldova (familia md).
// Convertit o singura data din pachetul juridic 3s.md (blocul de text publicabil), cuvant cu cuvant.
// Sursa: 03-cookies.en.md, sha256 dfdc9704e950e8fe37c15bee985398b1f39665c85881c7c24a0a5b2a2e2ecffa.
// Din ziua conversiei modulul e sursa unica a textului: se editeaza aici, iar pachetul ramane arhiva.
// Conditiile (`conditie`, `daca`) si legaturile interne (`cale:<cheie>`) le rezolva `../index.ts`.

import { alese, daca } from "./context";
import type { ContextMd } from "./context";
import type { DocumentJuridic } from "../tipuri";

export default function cookieUriEn(c: ContextMd): DocumentJuridic {
  return {
    cheie: "cookie-uri",
    limba: "en",
    titlu: "Cookie policy",
    versiune: "2026-10-01",
    introducere: "Here you can find out what information the website " + c.domeniu + " stores or reads in your browser (cookies and local storage), how we measure visits, who receives the data and how you can change your mind. The operator's details are in the [Legal notice](cale:informatii-legale), and how we process personal data, with your full rights, in the [Privacy policy](cale:confidentialitate).",
    sectiuni: [
      {
        cheie: "t1", titlu: "In short",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: alese([daca(c, "s0", "The website sets no cookies and writes nothing in your browser. We use no tools that measure visits in the browser."), daca(c, "banner", "The only information we keep in your browser without your consent is the choice you make in the cookie banner. We write it only after you have chosen, never on a simple visit."), daca(c, "umami-b", "Measuring visits with our own analytics application (Umami), which uses no cookies, starts only if you accept statistics."), daca(c, "ga4", "Google Analytics 4, which sets cookies, starts only if you accept statistics."), daca(c, "banner", "You can refuse with a single click, on \"Reject all\", and you can change your mind at any time from the \"Cookie settings\" link in the footer of any page."), "The server keeps access logs (IP address, page requested, date and time). They are not in your browser and are described in the privacy policy."]) } },
        ],
      },
      {
        cheie: "s1", titlu: "1. Legal basis",
        blocuri: [
          { jurisdictie: null, paragrafe: ["**Visitors from the Republic of Moldova.** Storing information in your equipment, or gaining access to information stored there, is done only after you have received clear and complete information about the purposes of the processing; operations strictly necessary for an information society service that you have expressly requested are exempt (Law No. 72/2025 on electronic communications, Article 116(5)-(6)). The information on this page also answers Article 10(2)(b)-(h) of Law No. 284/2004 on information society services. The legal basis for processing personal data is that of Law No. 195/2024 (Articles 6-7): your consent or, where the page says so, our legitimate interest.", "**Visitors from the European Union.** Article 5(3) of Directive 2002/58/EC, as amended by Directive 2009/136/EC, requires your consent, after clear and comprehensive information, for any storing of information or gaining of access to information in your equipment, except what is strictly necessary for a service that you have expressly requested. Each Member State applies it through its own law; in Romania, for example, through Law No. 506/2004, Article 4(5)-(6)."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["On this website we do not store or read information in your browser, so the rules above do not currently require any consent."] },
          { jurisdictie: null, conditie: ["ga4"], paragrafe: ["Google Analytics 4 starts only with your consent, whatever country you visit from."] },
          { jurisdictie: null, conditie: ["umami-b"], paragrafe: ["Our analytics application (Umami) starts only with your consent, whatever country you visit from."] },
        ],
      },
      {
        cheie: "s2", titlu: "2. What we keep in your browser and why",
        blocuri: [
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["We keep no information in your browser and read nothing from it. We use no tools that measure visits in the browser."] },
          { jurisdictie: null, conditie: ["activ"], paragrafe: ["The table shows everything the website stores or reads in your browser, with the duration and purpose of each item."], tabel: { forma: "cu-antet", titlu: "2. What we keep in your browser and why", antet: ["Name", "Category", "How long it stays", "What it is for"], randuri: alese([daca(c, "banner", ["3s-consimtamant, in local storage", "Strictly necessary", "Valid for 6 months; after that it is no longer used and the banner appears again. It stays in your browser until you choose again or delete it yourself", "Remembers what you chose in the cookie banner, so that we do not ask you on every page. It contains the version of the text shown, a random device identifier, the time, the choice made and the button used. It is written only after you have chosen"]), daca(c, "ga4", ["_ga, cookie", "Statistics, with consent", "2 years", "Tells visitors apart, without name or e-mail address"]), daca(c, "ga4", ["_ga_ followed by the measurement code, cookie", "Statistics, with consent", "2 years", "Remembers the current browsing session"]), daca(c, "umami-b", ["umami.disabled, in local storage, read only", "Statistics, with consent", "We do not write it", "If you have put it in your browser yourself, the measurement excludes you"])]) } },
          { jurisdictie: null, conditie: ["activ", "banner"], paragrafe: ["The identifier in the choice is random and does not link you to a person; we use it so that a withdrawal can be linked to the consent given earlier. Our server keeps one evidence row for each choice, described in the privacy policy (sections 3 and 7)."] },
        ],
      },
      {
        cheie: "s2-t4", titlu: "Cookieless visit measurement (Umami)", nivel: 3, conditie: ["umami"],
        blocuri: [
          { jurisdictie: null, paragrafe: ["The website has an analytics application, Umami, installed on a server administered by our IT service provider; we do not use another party's analytics service for this. The application receives from the browser the page address, with the parameters in the address (for example those of campaigns), the page you came from, the page title, the language and the screen size. From the browser data and the IP address, the server infers the type of browser, system and device and the approximate location (the country and, if it can, the region and the city). The IP address is not saved in the measurement data: it is used only to calculate a visit code. The code is calculated from the IP address, the browser and the site identifier, so it remains a pseudonym and the measurement data is treated as personal data.", "Besides visits, we measure three actions: a click on a contact channel (e-mail or WhatsApp), a click on a button leading to contact, and a change of the page language. We do not receive anyone's name, e-mail address or telephone number.", "The measurement writes no cookie and nothing in the browser's local storage. From local storage it reads only the marker umami.disabled, by which you can exclude yourself from the measurement. It does not follow you from one site to another and does not start if the browser sends the \"Do Not Track\" signal. The data is not used for advertising and is not combined with other sources. We keep it for 13 months, then delete it."] },
          { jurisdictie: null, conditie: ["umami-b"], paragrafe: ["The measurement starts only after you accept statistics and stops immediately when you withdraw your consent."] },
        ],
      },
      {
        cheie: "s2-t5", titlu: "Google Analytics 4", nivel: 3, conditie: ["ga4"],
        blocuri: [
          { jurisdictie: null, paragrafe: ["With your consent for statistics, Google Analytics 4 receives the page address, the page you came from, the type of device and browser, the country and city approximated from the IP address, plus the actions from a closed list: [list of GA4 events, taken from the code at launch]. It does not receive anyone's name or e-mail address. The advertising signals stay disabled. Data linked to cookies and to the device identifier is kept for 2 months; aggregated reports, without identifiers, stay in the account."] },
        ],
      },
      {
        cheie: "s3", titlu: "3. Your rights",
        blocuri: [
          { jurisdictie: null, paragrafe: ["You can ask at any time for access to your data or for its erasure, and you can object to the processing; the full list of rights and how to exercise them are in the [Privacy policy](cale:confidentialitate), section 8. We receive requests at " + c.contact.email + "."] },
        ],
      },
      {
        cheie: "s4", titlu: "4. Who the data can reach",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: alese([daca(c, "s0", "We pass no information from your browser to anyone, because we keep and read nothing in it."), daca(c, "umami", "The analytics application (Umami): the data stays on the server where it runs, at the hosting provider described in the privacy policy, section 5; it is not passed to another party's analytics service and is not used for advertising."), daca(c, "ga4", "Google Analytics 4, only after your consent: Google Ireland Limited, with processing also by Google LLC (United States). The safeguards for the transfer are in the privacy policy, section 6."), daca(c, "banner", "The choice in the banner stays in your browser; on the server we keep only the evidence row described in the privacy policy."), "The list of all recipients of personal data is in the [Privacy policy](cale:confidentialitate), section 5."]) } },
        ],
      },
      {
        cheie: "s5", titlu: "5. Contact point",
        blocuri: [
          { jurisdictie: null, paragrafe: ["For any question about cookies, write to " + c.contact.email + ", the address of the operator 3S Demerzel SRL."] },
        ],
      },
      {
        cheie: "s6", titlu: "6. How we ask for consent",
        blocuri: [
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["On your first visit, the cookie banner says what we use and lets you choose between \"Accept all\", \"Reject all\" and \"Cookie settings\", three buttons of the same size."] },
          { jurisdictie: null, conditie: ["ga4"], paragrafe: ["Until you choose, no script from Google is loaded and no cookie is written."] },
          { jurisdictie: null, conditie: ["umami-b"], paragrafe: ["Until you choose, the analytics application's script is not loaded."] },
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["In the settings, the \"Statistics\" category starts switched off; only you switch it on. We ask you again after 6 months or when the text of this notice changes. Each choice leaves an evidence row on our server, so that we can prove what you chose; it is described in the privacy policy."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["We do not ask for consent, because we use nothing that requires it; that is why no cookie banner appears."] },
        ],
      },
      {
        cheie: "s7", titlu: "7. Your right to refuse",
        blocuri: [
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["Refusing costs a single click, on \"Reject all\". The website works the same without statistics: no page and no function depends on your consent."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["There is nothing to refuse: we use no cookies and do not measure visits in the browser."] },
        ],
      },
      {
        cheie: "s8", titlu: "8. How to withdraw your consent",
        blocuri: [
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["The \"Cookie settings\" link in the footer of any page reopens your choice. The \"Reject all\" button, or switching off the \"Statistics\" category, stops the measurement immediately."] },
          { jurisdictie: null, conditie: ["ga4"], paragrafe: ["The statistics cookies (_ga and _ga_ followed by the measurement code) are deleted from your browser on withdrawal."] },
          { jurisdictie: null, conditie: ["banner"], paragrafe: ["You can also delete the site's data at any time from your browser settings."] },
          { jurisdictie: null, conditie: ["s0"], paragrafe: ["You have given no consent, so there is nothing to withdraw."] },
        ],
      },
      {
        cheie: "s9", titlu: "9. How we protect the data",
        blocuri: [
          { jurisdictie: null, paragrafe: [], lista: { elemente: alese(["The website is served over an encrypted connection (HTTPS).", "Before any choice you make, the website's pages send no requests to any domain other than ours.", daca(c, "banner", "The record of choices keeps only the network prefix; the full IP address appears only in the server's access logs, described in the privacy policy."), daca(c, "umami", "The IP address is not saved in the data of the cookieless measurement."), daca(c, "ga4", "The advertising signals stay disabled in Google Analytics: we do not advertise.")]) } },
        ],
      },
      {
        cheie: "s10", titlu: "10. Links to other services",
        blocuri: [
          { jurisdictie: null, paragrafe: ["Links to other services, for example WhatsApp or LinkedIn, take you outside the website. From the moment you open them, the rules of those services apply, and we do not control what they keep in your browser."] },
        ],
      },
      {
        cheie: "s11", titlu: "11. Changes",
        blocuri: [
          { jurisdictie: null, paragrafe: ["The version in force is the one on this page, with the date of the update at the top."] },
        ],
      },
    ],
  };
}
