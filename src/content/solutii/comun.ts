// Textele comune ale celor 7 pagini de sector (solutii__sablon.md): butoanele eroului si nota,
// capetele sectiunilor, starile scenei 3D, etichetele cardurilor inainte / dupa si cele doua
// intrebari care se repeta pe fiecare sector (unde stau fisierele, ce face AI-ul).
//
// Lungimile din comentarii sunt ale referintei, pe acelasi rol. Afirmatiile de aici au intrare in
// `src/content/afirmatii/solutii.json`, cu `unde` = acest fisier.

import { CALE_INREGISTRARE, type Legatura } from "@/content/navigatie";
import type { Intrebare } from "./tipuri";

export const SECTOR_COMUN: {
  firSolutii: { text: string; cale: string };
  butonPrincipal: Legatura;
  butonSecundar: Legatura;
  nota: string;
  titluMomente: string;
  titluSchimbare: string;
  stareScena: { haos: string; ordine: string; buton: string };
  titluPasi: string;
  etichetaDemo: string;
  titluInainteDupa: string;
  etichetaInainte: string;
  etichetaDupa: string;
  titluIntrebari: string;
  intrebariComune: [Intrebare, Intrebare];
} = {
  firSolutii: { text: "Soluții", cale: "/solutii" },
  // Rol: incercarea gratuita (buton plin, 16/600). Lungime: 25. Tinta: formularul (cont gratuit).
  butonPrincipal: { text: "Testează gratuit", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
  // Rol: un mesaj catre echipa (buton fantoma). Lungime: 19. Tinta: pagina de contact.
  butonSecundar: { text: "Scrie-ne un mesaj", href: "/contact", ruta: "/contact" },
  // Rol: fara card, fara obligatii (14/400 ardezie-5). Lungime: 26. Afirmatiile: cont fara card
  // (neconfirmat) si pretul de 0 RON (confirmat, D3).
  nota: "Fără card de plată, 0 RON astăzi",
  // Rol: h2 al sinei cu trei momente. Lungime: 39.
  titluMomente: "O săptămână obișnuită, în trei scene",
  // Rol: h2 al benzii cu scena hartiilor. Lungime: 24.
  titluSchimbare: "Când actele ajung în 3S",
  stareScena: {
    // Rol: cipul in starea haos (rosu). Lungime: 24.
    haos: "Fiecare act, în alt loc",
    // Rol: cipul in starea ordine (verde). Lungime: 27.
    ordine: "Toate actele, puse în ordine",
    // Rol: butonul care asaza foile (pastila albastra, cu sageata). Lungime: 15.
    buton: "Pune-le în ordine",
  },
  // Rol: h2 al pasilor. Lungime: 28.
  titluPasi: "Cum lucrezi cu 3S, pas cu pas",
  // Rol: eticheta cardului de cautare (14/600). Lungime: 26. Declara exemplul (plan D9).
  etichetaDemo: "Exemplu de căutare în arhivă",
  // Rol: h2 al cardurilor inainte / dupa. Lungime: 27.
  titluInainteDupa: "Ziua de lucru, înainte și după",
  // Rol: etichetele celor doua carduri (14/600). Lungimi: 6 / 10. Etichete generice de comparatie
  // (fara produs / cu produs), pe numele marcii; nu poarta nicio afirmatie.
  etichetaInainte: "Fără 3S",
  etichetaDupa: "Cu 3S",
  // Rol: h2 al intrebarilor. Lungime: 19.
  titluIntrebari: "Întrebări frecvente",
  intrebariComune: [
    {
      // Rol: unde stau documentele. Lungime: 35; un rand la 1440, doua la 390, ca la referinta
      // (masurat: randul inchis 55 / 76 px).
      intrebare: "Unde stau fișierele pe care le încarci în 3S?",
      // Rol: furnizorul, locul, criptarea (4 randuri la 1440). Lungime: 357. Faptele: D4c (o singura
      // regiune, Germania), criptarea aleasa in D4c (neconfirmata), stocarea proprie (D4b).
      raspuns:
        "Pe serverele Amazon din Germania, într-o singură regiune a Uniunii Europene. Pe disc, fișierele sunt criptate AES-256, iar spre server circulă numai prin TLS, versiunea 1.2 sau una mai nouă. Dacă firma are deja stocarea ei, 3S poate lucra direct pe ea. În aplicație, accesul se dă pe persoană și pe dosar.",
    },
    {
      // Rol: intrebarea despre stratul AI. Raspunsul: 3 randuri la 1440, lungime 323 la referinta.
      // Intrebarea: un rand la 1440, doua la 390, ca la referinta (masurat: 21 / 42 px), scrisa pe un
      // fapt 3S, citirea textului din scanari si poze; raspunsul pleaca de la el, apoi clasarea,
      // canalele si pagina citata, fara exemplul de interogare.
      intrebare: "Cum citește 3S un act scanat sau o poză?",
      raspuns:
        "Scoate textul din imagine, chiar dacă actul vine ca poză sau ca scanare veche, apoi recunoaște ce fel de act este și îl pune în dosarul potrivit. Când îi pui o întrebare, pe web, pe telefon sau pe WhatsApp, răspunde cu actul și cu pagina din care a luat informația, ca să o poți verifica pe original.",
    },
  ],
};
