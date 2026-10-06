// Pagina platformei a editiei `ro-MD` (P02, `/ro/platforma` pe 3s.md), transcrisa din fisa ei de continut
// (ro-md/platforma.md), pana la sectiunea de resurse nepublicate. Perechea EN e `/platform` (`../en/platform.ts`).
//
// Pagina servita compune componentele perechii RO (decizia 53) cu textul din `platforma-componente.ts`; modulul de fata
// ramane sursa pentru metadata, nodul WebPage, textul precompletat si registrul de afirmatii.
//
// CE NU INTRA, ca pe EN: hartia si scanarea facuta de 3S (poarta juridica a deciziilor 40-41), asistentul pe WhatsApp
// (d49), functiile negasite in cod (d43), criptarea (d31). Legaturile duc la paginile /ro ale acestei felii; varianta
// conditionata a fisei ("(în engleză)") nu mai e necesara, fiindca tintele exista.
//
// ABATERE DE LA FISA: meta-descrierea incepe cu "Cum preia" in loc de "Vezi cum preia" (159 de caractere, peste
// pragul de 155 al modelului paginilor, `problemePagina`); 154 cu forma scurta, acelasi sens.

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { atributeLimba } from "@/lib/asezare";
import { adresaSite } from "@/lib/site";

/** Caile paginilor citate in proza; stau in constante (poarta de limba citeste proza, nu adresele). */
const CALE_CAUTARE = "/ro/functionalitati/cautare-ai";
const CALE_GHID_MOLDOVA = "/ro/ghiduri/termene-pastrare-moldova";
const CALE_GHID_EFACTURARE = "/ro/ghiduri/arhivare-e-facturi-ue";

const BAZA = adresaSite();
const ID = iduri(BAZA);

const TITLU = "Platforma 3S: arhivă digitală care răspunde cu sursa";
const DESCRIERE =
  "Cum preia 3S documentele, cum stabilești termenul de păstrare pe dosar și cum primești răspunsuri cu sursa. Găzduire în UE, regiunea principală Frankfurt.";

export const pagina: PaginaContinut = {
  cheie: "platform",
  meta: { titlu: TITLU, descriere: DESCRIERE, cale: "/ro/platforma" },
  h1: "Platforma 3S: documente încărcate, răspunsuri cu sursa",
  capsula:
    "3S preia documentele pe care le încarci din browser, inclusiv fișierele pe care le ai deja scanate. Recunoaște fiecare document și consemnează cine îl deschide. Termenul de păstrare îl alegi pe dosar. Apoi pui întrebări, iar fiecare răspuns indică documentul din care provine.",
  sectiuni: [
    {
      cheie: "documente-intrare",
      titlu: "Cum ajung documentele în 3S?",
      blocuri: [
        {
          paragrafe: ["Documentele se încarcă din browser. Fișierele pe care le ai deja scanate intră direct în platformă, fără o etapă intermediară."],
        },
      ],
    },
    {
      cheie: "termen-pastrare",
      titlu: "Pot stabili cât timp se păstrează documentele?",
      blocuri: [
        {
          paragrafe: [
            "Da. Pentru fiecare dosar alegi un termen de păstrare, iar el se aplică tuturor documentelor din dosarul respectiv. Regulile de păstrare diferă de la o țară la alta, de aceea ghidurile noastre indică sursa primară și data verificării: pentru [Republica Moldova](" +
              CALE_GHID_MOLDOVA +
              ") și pentru [arhivarea facturilor electronice în UE](" +
              CALE_GHID_EFACTURARE +
              ").",
          ],
        },
      ],
    },
    {
      cheie: "gasire",
      titlu: "Cum găsesc o informație?",
      blocuri: [
        {
          paragrafe: [
            "Formulezi întrebarea în cuvintele tale. 3S caută cu ajutorul AI în conținutul documentelor și indică sursa fiecărui răspuns, ca să o poți verifica. Întrebările în română sunt disponibile; cele în engleză despre documente redactate în română sunt deocamdată în regim de testare. Pagina [Căutare cu sursa](" +
              CALE_CAUTARE +
              ") arată cum funcționează.",
          ],
        },
      ],
    },
    {
      cheie: "acces",
      titlu: "Cine are acces la documente?",
      blocuri: [
        {
          paragrafe: [
            "Dacă firma are reguli despre cine vede anumite documente, menționează-le în primul mesaj; îți vom spune ce poate face 3S astăzi.",
          ],
        },
      ],
    },
    {
      cheie: "unde-ruleaza",
      titlu: "Unde rulează 3S?",
      blocuri: [
        {
          paragrafe: [
            "3S rulează în Uniunea Europeană, cu regiunea principală Frankfurt. Pagina [Despre 3S și securitate](/ro/securitate#security) numește furnizorul de găzduire și explică ce prevede legislația americană pentru datele administrate de o companie din SUA.",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "ro-md-platforma",
    titluBloc: "Cum ar funcționa 3S pe documentele firmei tale?",
    textWhatsapp:
      "Bună ziua, 3S. Am citit pagina despre platforma 3S [ref:ro-md-platforma]. Aș dori să aflu cum ar funcționa pe documentele firmei noastre.",
    subiectEmail: "Întrebare 3S [ref:ro-md-platforma]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/ro/platforma#webpage",
      url: BAZA + "/ro/platforma",
      name: TITLU,
      description: DESCRIERE,
      inLanguage: atributeLimba("ro-MD").inLanguage,
      isPartOf: { "@id": ID.site },
      about: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/ro/platforma#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/ro/platforma#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: BAZA + "/ro" },
        { "@type": "ListItem", position: 2, name: "Platforma", item: BAZA + "/ro/platforma" },
      ],
    },
  ],
  afirmatii: [
    "ro-md-functii-in-productie",
    "ro-md-trei-pasi-scan-store-solve",
    "ro-md-termene-si-jurnal",
    "ro-md-arhiva-cu-sursa",
    "ro-md-engleza-si-pagina-in-testare",
    "ro-md-ghiduri-cu-surse",
    "ro-md-gazduire-ue-frankfurt",
    "ro-md-amazon-sediu-sua",
    "ro-md-pilot-asistat",
    "ro-md-raspunde-o-persoana",
  ],
};
