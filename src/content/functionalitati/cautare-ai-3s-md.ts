// Textele NON-ASCII ale paginii EN `/features/search` a lui 3s.md (perechea RO: `/functionalitati/cautare-ai`).
//
// DE CE STAU AICI, NU IN `src/content/en/features-search.ts`: modulele editiei EN sunt numai ASCII (poarta de limba
// engleza, regula 1, fara exceptie), iar aceste siruri nu sunt engleza:
//   - SCENA e in romana, cu diacritice: intrebarea din erou si din bara de cautare, pasajul citat si randurile
//     desenului "Acum". Registrul confirma numai intrebari in romana; fisa paginii EN (nota 2) alege scena romaneasca
//     si pune traducerea numai in etichetele accesibile, in engleza. Pe pagina, fiecare element care o poarta are
//     `lang="ro"`.
//   - SEMNELE leaga bucatile ASCII ale etichetei eroului si ale puntii, ca pe RO (punctul de mijloc, sageata).
//
// Textul e PROPUS (fisa paginii, "Component copy (decision 53)"), nou, scris pentru 3s.md, nu preluat de pe RO; nu arata
// nicio pagina si niciun punct de articol (citarea pana la pagina e in pilot). Exemplul e fictiv, declarat ca exemplu.
// Pagina RO nu importa modulul.

export const SCENA_CAUTARE_3S_MD = {
  // cautare-ai.ts:43 (terminalul eroului; aceeasi intrebare se scrie din nou in bara de cautare).
  intrebare: "Ce garanție are compresorul din hala 2 și de la ce dată se calculează?",
  // cautare-ai.ts:172.
  citat: "Perioada de garanție a compresorului este de 24 de luni, de la punerea în funcțiune din 28 mai 2024.",
  // cautare-ai.ts:206-209 (desenul "Acum"; spatiul de la capatul inceputului ramane, ca pe RO).
  intrebareScurta: "Ce garanție are compresorul?",
  raspunsInceput: "Garanție de ",
  raspunsAccent: "24 de luni",
  raspunsNota: "din ziua punerii în funcțiune",
} as const;

/** Limba scenei, pentru atributul `lang` al elementelor care o poarta. */
export const LIMBA_SCENEI = "ro";

/** Semnele tipografice care leaga bucatile ASCII ale paginii EN, cu spatiile lor. */
export const SEMNE_3S_MD = {
  mijloc: " · ",
  sageata: " → ",
} as const;
