// Sectorul imobiliare (fisa `solutii__imobiliare.md`). Scena 3D: trei turnuri. La 390 px e singurul
// sector la care firul de pagina se rupe pe doua randuri (numele lung). Datele din cipuri si din
// cautare sunt fictive, declarate ca exemplu (plan D9).

import type { Sector } from "./tipuri";

export const IMOBILIARE: Sector = {
  cale: "/solutii/imobiliare",
  // Rol: ultimul nivel din fir. Lungime: 41.
  nume: "Agenții imobiliare și administratori de clădiri",
  meta: {
    titlu: "Contracte și acte de clădire, căutate după adresă | 3S",
    descriere:
      "Contractele de închiriere, titlurile de proprietate și actele fiecărei clădiri, găsite după adresă, cu pagina din care vine răspunsul.",
  },
  erou: {
    // Rol: h1, doua randuri (trei la 390). Lungime: 49.
    titlu: "Dosarul fiecărei clădiri, de la titlul de proprietate la chiriaș",
    // Rol: subtitlul (3 randuri la 1440, 6 la 390, ca la referinta). Lungime: 204.
    subtitlu:
      "3S scanează bibliorafturile fiecărei clădiri, leagă fiecare contract de unitatea lui și îți arată din timp ce expiră. Administratorul întreabă pe WhatsApp, chiar din fața clădirii, și primește pe loc actul căutat, cu pagina lui.",
  },
  momente: {
    // Rol: subtitlul sinei. Lungime: 71.
    subtitlu: "Un an obișnuit din viața unui portofoliu de clădiri.",
    lista: [
      {
        // Lungimi: eticheta 20, titlul 41, textul 169, fisierul 31, problema 20.
        eticheta: "La predarea unui spațiu",
        titlu: "Garanția se reține după starea de la intrare",
        text: "Fostul chiriaș pleacă și lasă pereții găuriți. Starea de la început a spațiului e descrisă într-un proces-verbal de acum patru ani, pus într-un biblioraft.",
        fisier: "PV_predare_2022.pdf",
        problema: "În biblioraft",
      },
      {
        // Lungimi: eticheta 22, titlul 38, textul 137, fisierul 18, problema 21.
        eticheta: "La un control de prevenire",
        titlu: "Se cere autorizația de securitate la incendiu",
        text: "Autorizația clădirii și rapoartele de verificare a stingătoarelor au rămas la fostul administrator, care nu mai răspunde la telefon.",
        fisier: "Autorizatie_incendiu_bloc_C.pdf",
        problema: "La fostul administrator",
      },
      {
        // Lungimi: eticheta 37, titlul 29, textul 135, fisierul 27, problema 30.
        eticheta: "La recepția lucrărilor de la fațadă",
        titlu: "Constructorul vrea semnătura",
        text: "Recepția se semnează mâine, iar garanția lucrării e scrisă într-o anexă la contract pe care nimeni din birou nu o mai găsește în dosar.",
        fisier: "Anexa_garantie_fatada.pdf",
        problema: "Anexa nu e în dosar",
      },
    ],
  },
  schimbare: {
    // Rol: paragraful-punte. Lungime: 179.
    punte:
      "Fiecare act ajunge la clădirea și la unitatea lui: cele pe hârtie după scanare, cele din e-mail și din foldere direct. Termenele din contracte le vezi din timp, nu după ce au trecut.",
    // Lungimi: 55 / 50 / 52.
    buline: [
      "Actele fiecărei clădiri și unități, găsite după adresă",
      "Contractele vechi, scanate și căutabile pe pagină",
      "Contractele care expiră și actele care lipsesc, semnalate din timp",
    ],
    formatie: "turnuri",
    samanta: 3307,
    etichetaScena:
      "Animație: foile împrăștiate se așază în trei turnuri de înălțimi diferite, cu câte un act din poveste în fața fiecăruia",
  },
  pasi: {
    // Pasii urmeaza mecanismul 3S: scanarea hartiei, intrebarea pe WhatsApp, semnalarea termenelor.
    lista: [
      {
        // Lungimi: titlul 41, textul 91. Titlul pe doua randuri la 1440 si pe unul la 390, ca la
        // referinta (primii doi pasi ai acestui sector au titluri rupte).
        titlu: "Trimite la scanat actele fiecărei clădiri",
        text: "Bibliorafturile pleacă la scanat și se întorc în 3S așezate pe clădire, cu textul fiecărei pagini.",
      },
      {
        // Lungimi: titlul 41, textul 85.
        titlu: "Întreabă pe WhatsApp, din fața clădirii",
        text: "Administratorul scrie adresa și ce caută, iar 3S îi trimite actul și pagina potrivită.",
      },
      {
        // Lungimi: titlul 27, textul 99.
        titlu: "Termenele vin singure la tine",
        text: "3S îți arată din timp ce contract expiră și ce act lipsește din dosarul unei clădiri sau al unei unități.",
      },
    ],
    demo: {
      // Lungime: 46. Cauta actul din al treilea moment; la 390 interogarea se rupe pe doua randuri.
      interogare: "cât durează garanția pentru fațada refăcută a blocului C",
      rezultat: {
        fisier: "Anexa_garantie_fatada.pdf",
        // Lungime: 33.
        loc: "Bloc C · Lucrări · Fațadă",
        potrivire: "80% potrivire · 1,4 s",
        // Lungime: 174; termenii: 20 si 26. Aici tot doua randuri la 1440 si cinci la 390, ca la referinta.
        fragment:
          "Constructorul răspunde pentru fisurile tencuielii și desprinderile termoizolației [[timp de cinci ani]] de la recepție, iar garanția acoperă manopera și [[materialele înlocuite]], fără cost pentru asociație.",
      },
    },
  },
  inainteDupa: {
    // Lungimi: 61 / 54 / 45.
    inainte: [
      "Un proces-verbal de predare se caută prin bibliorafturi, zile la rând",
      "Autorizațiile clădirii rămân la furnizori sau la foștii administratori",
      "Anexa cu garanția fațadei lipsește la recepție",
    ],
    // Lungimi: 66 / 39 / 42.
    dupa: [
      "Starea spațiului la intrare, găsită după adresă și după unitate",
      "Actele fiecărei clădiri, în dosarul ei",
      "Garanția unei lucrări, găsită cu pagina ei",
    ],
  },
  intrebari: [
    {
      // Lungimi: intrebarea 45, raspunsul 253. O intrebare a sectorului, pe termene.
      intrebare: "Cum aflăm din timp ce contracte expiră?",
      raspuns:
        "3S citește data de expirare din fiecare contract scanat sau încărcat și îți arată din timp ce urmează, pe clădire și pe unitate. Tot acolo vezi ce act lipsește din dosarul unei clădiri, înainte să ți-l ceară cineva.",
    },
    {
      // Lungimi: intrebarea 49, raspunsul 233. O intrebare a sectorului, pe acces.
      intrebare: "Cine din echipă vede actele unei clădiri?",
      raspuns:
        "Accesul se dă pe persoană și pe clădire: administratorul unei clădiri vede dosarul ei, iar un coleg de la contabilitate vede doar ce îi deschizi. Fiecare document deschis se trece în jurnal, cu numele și ora.",
    },
  ],
};
