// Continutul lumii constructorului de pe start, editia `en` (3s.md): textele comune ale panoului,
// numele canalelor, chestionarul, duelul, estimarea si cele 9 scene, cu functiile de text ale editiei.
// Il citeste invelitoarea lenesa a lumii (`ConstructorLumeEn.tsx`), deci sta in bucata JS a lumii, nu
// in pachetul paginii. Capul (titlul, intrebarea, industriile) e in `acasa-constructor-cap-componente.ts`.
//
// SURSA TEXTULUI: fisa de continut a paginii, sectiunea Component copy (decision 53), Constructor (decizia 59,
// forma (a) a intrebarii 2), cheie cu cheie fata de `src/content/acasa-constructor.ts`; status: propus,
// pana la aprobarea pe capturi. Ce lipseste fata de RO, prin forma (a): lista de reguli si randul de
// integrari ale panoului (decizia 43), benzile si toast-urile celor 9 scene, banda canalelor, pista
// termenului din scena Avocatura (zilele si data limita, fara temei: decizia 43). Tipurile din
// `LumeVedere.tsx` au aceste campuri optionale; aici nu se scriu.
//
// CE POATE ARATA O SCENA, si nimic in plus: incarcarea din browser, recunoasterea textului si eticheta de
// tip a documentului, cautarea si raspunsul AI cu sursa indicata, dosarele create de firma si termenul de
// pastrare pus pe dosar. Afirmatiile despre produs au intrarile lor in
// `src/content/afirmatii/en-acasa-constructor.json`; cifrele estimarii sunt ale formulei RO, date ca EXEMPLU.
// DATELE DIN SCENE SUNT FICTIVE (plan D9) si se declara ca exemplu, ca pe RO.
//
// LIMBA: engleza americana; datele din scene in forma americana (6/11), minutele cu punct (4.5), "and"
// inaintea ultimului canal. Sumele: niciuna in lei (decizia 54); estimarea e in ore, data ca exemplu.
//
// TINTA BUTOANELOR (butonul final al panoului si CTA-ul estimarii): legatura WhatsApp a paginii, rezolvata
// pe server si primita de invelitoare (decizia 3: fara cont si fara formular pe 3s.md; decizia 56: fara
// apel). Fara WhatsApp pe domeniu, butonul ramane inert (`Tinta`, `data-tinta-lipsa`).
//
// CALCULUL (formula estimarii, parametrii duelului, numele fisierelor) e cel din modulul RO, importat ca
// functii: aceleasi cifre pe toate editiile. Textele modulului RO nu se folosesc aici.

import type {
  ChestionarConstructor,
  ComunConstructor,
  ContinutLume,
  DuelConstructor,
  EstimareConstructor,
  NumeCanalConstructor,
  ScenariiEditie,
  TintaConstructor,
} from "@/components/constructor/LumeVedere";
import type { CodCanal } from "@/content/acasa";
import {
  PARAMETRI_DUEL,
  ZILE_LUCRATOARE,
  estimare,
  formatTimp,
  indiciTermeneRatate,
  indiciToast,
  minutePeDocument,
  numeFisier,
} from "@/content/acasa-constructor";
import { CAP_CONSTRUCTOR_EN } from "./acasa-constructor-cap-componente";

export const COMUN_EN: ComunConstructor = {
  schimba: "back to sectors",
  numeSpatiu: "Your firm",
  tipSpatiu: "Example archive",
  progres: "Archive",
  reluare: "Rebuild the archive",
  final: {
    titlu: "Want to see this on your documents?",
    subRand: "Free 14-day pilot, assisted.",
    buton: "Message us"
  },
  anuntGata: "The example archive for \"{industrie}\" is ready."
};

export const NUME_CANAL_EN: NumeCanalConstructor = {
  email: {
    fraza: "by email",
    insigna: "email"
  },
  mesaj: {
    fraza: "on WhatsApp",
    insigna: "WhatsApp"
  },
  hartie: {
    fraza: "by post",
    insigna: "post"
  }
};

export const CHESTIONAR_EN: ChestionarConstructor = {
  titlu: "What happens to your company's documents each day?",
  descriere: "Three clicks, and an example shows the monthly hours spent handling documents.",
  canale: {
    intrebare: "How do documents reach you?",
    optiuni: [
      {
        cod: "email",
        text: "Email"
      },
      {
        cod: "mesaj",
        text: "WhatsApp and chats"
      },
      {
        cod: "hartie",
        text: "On paper, by post"
      }
    ]
  },
  volum: {
    intrebare: "How many documents a day?",
    optiuni: [
      {
        cod: "v10",
        text: "Up to 10"
      },
      {
        cod: "v50",
        text: "10 to 50"
      },
      {
        cod: "v99",
        text: "50 or more"
      }
    ]
  },
  cine: {
    intrebare: "Who handles them today?",
    optiuni: [
      {
        cod: "eu",
        titlu: "I do",
        descriere: "Management time goes into sorting documents"
      },
      {
        cod: "coleg",
        titlu: "A colleague",
        descriere: "Paid for other work, yet spends the day sorting documents"
      },
      {
        cod: "nimeni",
        titlu: "Nobody",
        descriere: "Documents sit untouched until someone hunts for them at a deadline"
      }
    ]
  },
  confirma: "Confirm",
  confirmat: "Confirmed"
};

export const DUEL_EN: DuelConstructor = {
  eticheta: "Simulated day, step by step",
  reluare: "Replay",
  firmaFara: "Files and emails",
  firmaCu: "Everything in 3S",
  nesortate: "untagged:",
  inOrdine: "tagged",
  timpPierdut: "time lost:",
  termeneRatate: "missed deadlines:",
  timpEconomisit: "time saved:",
  faraEticheta: "no tag",
  ai: "AI",
  calm: "Every document has its type tag.",
  cine: {
    eu: "You spend {timp} a day on documents, not clients.",
    coleg: "Your colleague spends {timp} a day searching documents.",
    nimeni: "Documents pile up, and nobody looks at them anymore."
  },
  final: {
    eu: "With {volum} arriving {canale}, 3S saves you {timp} a day.",
    coleg: "With {volum} arriving {canale}, your colleague saves {timp} a day.",
    nimeni: "With {volum} arriving {canale}, any document is one question away."
  },
  volumInCuvinte: {
    v10: "up to 10 documents a day",
    v50: "10-50 documents a day",
    v99: "more than 50 documents a day"
  },
  scor: {
    nesortate: "Untagged",
    timp: "Time",
    termene: "Missed deadlines",
    vs: "vs"
  },
  declaratie: "Example simulation, fictional documents"
};

export const ESTIMARE_EN: EstimareConstructor = {
  eticheta: "The cost of manual handling",
  cifra: "About {ore} hours a month",
  formula: "{docs} documents a day, {k} min each, over {zile} working days (example calculation)",
  manual: "Manual",
  cuProdus: "In 3S",
  morala: {
    eu: "These hours could go to clients rather than files.",
    coleg: "Part of your colleague's salary pays for searching documents.",
    nimeni: "In an audit, a document you cannot find costs more than time."
  },
  buton: "Message us",
  nota: "A person replies, in English or Romanian."
};

export const SCENARII_EN: ScenariiEditie = {
  constructii: {
    fraza: "On a building site, documents come from the designer, suppliers and inspectors, each by its own route. In 3S you find them with one question.",
    durere: "Revision C of the drawing came in three weeks ago, yet the crew still pours to revision B.",
    concluzie: "Ask for the latest drawing, and the answer cites revision C of September 2.",
    obiect: {
      cod: "PL-204",
      nume: "Structure, level 2",
      veche: {
        numar: "rev. B",
        data: "6/11",
        stare: "older revision",
        retrasa: "replaced by rev. C, 9/2"
      },
      noua: {
        numar: "rev. C",
        data: "9/2",
        stare: "latest revision",
        propunere: "AI answer, check source"
      },
      bara: {
        nume: "Handover folder",
        total: 6,
        contor: "in 3S: {n}/{total}",
        complet: "indexed"
      }
    },
    duel: {
      dosare: [
        "Handovers",
        "Quotes",
        "Drawings",
        "Lab tests",
        "Invoices"
      ],
      fisiere: [
        {
          sablon: "handover_{n}.pdf",
          start: 3
        },
        {
          sablon: "estimate_{n}.xlsx",
          start: 114
        },
        {
          sablon: "facade_plan_R{n}.dwg",
          start: 4
        },
        {
          sablon: "concrete_test_B{n}.pdf",
          start: 25
        },
        {
          sablon: "steel_invoice_{n}.pdf",
          start: 31
        }
      ],
      tipuri: [
        "Minutes",
        "Offer",
        "Other",
        "Report",
        "Invoice"
      ],
      stres: [
        "The new revision is in an email",
        "No test report yet",
        "The designer has the drawing",
        "The supervisor arrives at 10"
      ],
      termeneRatate: [
        "Missed deadline: structural handover",
        "Missed deadline: steel order",
        "Missed deadline: estimate for the client"
      ]
    }
  },
  contabilitate: {
    fraza: "A client's statements, invoices and receipts arrive in pieces all month. In 3S you keep them in one folder per month and find any of them with a question.",
    durere: "The trial balance closes Friday, and the client's statements lack two days.",
    concluzie: "You ask which August statements are in, and the answer cites each one.",
    obiect: {
      client: "Alfa Example",
      perioada: "08/2026",
      celule: [
        {
          eticheta: "Sales invoices",
          valoare: "14"
        },
        {
          eticheta: "Till receipts",
          valoare: "27"
        },
        {
          eticheta: "Bank statements",
          valoare: "20",
          scurta: true
        },
        {
          eticheta: "Purchase invoices",
          valoare: "31"
        },
        {
          eticheta: "Payroll documents",
          valoare: "4"
        }
      ],
      lipsa: "answer: statements Aug 1-13, 16-31",
      propunere: "AI answer, check source",
      termen: "August trial balance closes Friday"
    },
    duel: {
      dosare: [
        "Purchases",
        "Bank",
        "Payroll",
        "Receipts",
        "Returns"
      ],
      fisiere: [
        {
          sablon: "supplier_invoice_F{n}.pdf",
          start: 1042
        },
        {
          sablon: "bank_stmt_{n}.pdf",
          start: 208
        },
        {
          sablon: "payroll_{n}.xlsx",
          start: 7
        },
        {
          sablon: "receipt_{n}.jpg",
          start: 390
        },
        {
          sablon: "VAT_{n}.pdf",
          start: 8
        }
      ],
      tipuri: [
        "Invoice",
        "Other",
        "Report",
        "Receipt",
        "Form"
      ],
      stres: [
        "Receipts sit in an envelope",
        "The statement lacks two days",
        "It all comes via WhatsApp",
        "VAT return due in two days"
      ],
      termeneRatate: [
        "Missed deadline: e-invoice submission",
        "Missed deadline: payroll return",
        "Missed deadline: August VAT return"
      ]
    }
  },
  logistica: {
    fraza: "A trip's documents are created on the road: at loading, in the cab, at unloading, each in someone else's hands. In 3S you find each one by the trip number.",
    durere: "The goods reached Hamburg a week ago, but the trip stays uninvoiced until the receipt arrives.",
    concluzie: "A search for trip 418 finds the receipt once it is uploaded.",
    obiect: {
      cap: "Trip 418 (Chisinau-Hamburg), Ion Example",
      verigi: [
        "CMR note",
        "Packing list",
        "Route sheet",
        "Delivery receipt",
        "Trip invoice"
      ],
      notaFierbinte: "blurry, text unreadable",
      notaBlocata: "receipt not found",
      notaDeblocata: "receipt found",
      coada: "unloaded Aug 29; receipt not uploaded",
      fisier: "receipt_418.pdf",
      propunere: "AI answer, check source"
    },
    duel: {
      dosare: [
        "Orders",
        "PODs",
        "CMRs",
        "Packing",
        "Invoices"
      ],
      fisiere: [
        {
          sablon: "client_order_{n}.pdf",
          start: 530
        },
        {
          sablon: "POD_{n}.pdf",
          start: 77
        },
        {
          sablon: "CMR_{n}.pdf",
          start: 418
        },
        {
          sablon: "packing_{n}.pdf",
          start: 61
        },
        {
          sablon: "trip_invoice_{n}.pdf",
          start: 902
        }
      ],
      tipuri: [
        "Form",
        "Other",
        "Form",
        "Other",
        "Invoice"
      ],
      stres: [
        "Receipt still in the cab",
        "Driver on the road, no signal",
        "Packing list: a blurry photo"
      ],
      termeneRatate: [
        "Missed deadline: invoice for trip 418",
        "Missed deadline: customs for trip 418",
        "Missed deadline: monthly statistics"
      ]
    }
  },
  it: {
    fraza: "Client contracts sit in three different places, each with its own version and annexes. In 3S each client has one folder, and a question shows you which version was signed.",
    durere: "You change the price without knowing if you edit the signed version or a draft.",
    concluzie: "You ask which version was signed, and the answer cites the signed copy and its date.",
    obiect: {
      client: "Beta Example",
      dataInitiala: "07/01/2026",
      dataNoua: "09/15/2026",
      propunere: "AI answer, check source",
      azi: "today",
      vechiInVigoare: "in force",
      vechiInlocuit: "valid until Sep 14",
      nou: "in force",
      set: [
        "Master agreement",
        "SOW",
        "Rates",
        "Licenses",
        "Order"
      ],
      lipsa: 1,
      nota: "folder: 4 of 5 documents uploaded",
      notaFinala: "Beta Example: 5 of 5 uploaded"
    },
    duel: {
      dosare: [
        "Licenses",
        "SOWs",
        "Invoices",
        "DPA",
        "Handover"
      ],
      fisiere: [
        {
          sablon: "server_license_{n}.pdf",
          start: 21
        },
        {
          sablon: "SOW_proposal_{n}.docx",
          start: 9
        },
        {
          sablon: "invoice_IT{n}.pdf",
          start: 715
        },
        {
          sablon: "client_DPA_{n}.pdf",
          start: 48
        },
        {
          sablon: "handover_v{n}.pdf",
          start: 3
        }
      ],
      tipuri: [
        "Certificate",
        "Offer",
        "Invoice",
        "Agreement",
        "Minutes"
      ],
      stres: [
        "The annex is in a chat",
        "Is the signature on v2 or v3?",
        "Client wants an answer today"
      ],
      termeneRatate: [
        "Missed deadline: security audit",
        "Missed deadline: Monday's critical ticket",
        "Missed deadline: sprint handover"
      ]
    }
  },
  avocatura: {
    fraza: "Procedural documents arrive by email and by courier, and the date of receipt stays on an envelope. In 3S you search the text of each act, service date included.",
    durere: "The appeal deadline was counted from memory and lands two weeks after the real one.",
    concluzie: "Ask when the judgment was served, and the answer cites the date on the act.",
    obiect: {
      dosar: "2318/2026, Ion v. Ana Example",
      stampila: "served: 09/03/2026",
      nota: "date read from the act; the lawyer counts the deadline",
      acte: [
        "Defendant's response",
        "Expert report",
        "First-instance judgment"
      ],
      asteptare: "not yet served",
      ancora: "the appeal period runs from service of this judgment"
    },
    duel: {
      dosare: [
        "Judgments",
        "Summons",
        "Claims",
        "Fees",
        "Experts"
      ],
      fisiere: [
        {
          sablon: "judgment_{n}.pdf",
          start: 845
        },
        {
          sablon: "summons_{n}.pdf",
          start: 1207
        },
        {
          sablon: "claim_{n}.pdf",
          start: 318
        },
        {
          sablon: "fee_invoice_{n}.pdf",
          start: 33
        },
        {
          sablon: "expert_report_{n}.pdf",
          start: 64
        }
      ],
      tipuri: [
        "Other",
        "Letter",
        "Other",
        "Invoice",
        "Report"
      ],
      stres: [
        "The judgment's envelope is lost",
        "When did the summons come?",
        "The deadline is in a notebook",
        "Colleague on leave has the report"
      ],
      termeneRatate: [
        "Missed deadline: written submissions",
        "Missed deadline: objections to the report",
        "Missed deadline: proof of court fee"
      ]
    }
  },
  imobiliare: {
    fraza: "A home's documents come from the owner, the bank, the land registry and the owners' association, each by another route. In 3S you find them all by the property address.",
    durere: "Signing is on Thursday, and the tax certificate in the property file is no longer valid.",
    concluzie: "Search the address days before signing, and the certificate's issue date shows up in time.",
    obiect: {
      programare: "Signing Thu 10:30",
      propunere: "AI answer, check source",
      adresa: "12 Linden St., Apt 5 (example)",
      acte: [
        {
          nume: "ID documents",
          stare: "complet"
        },
        {
          nume: "Title deed",
          stare: "complet"
        },
        {
          nume: "Tax certificate",
          stare: "invechit"
        },
        {
          nume: "Association certificate",
          stare: "asteptare"
        },
        {
          nume: "Cadastral plan",
          stare: "asteptare"
        }
      ],
      stari: {
        complet: "uploaded",
        invechit: "check date",
        asteptare: "not uploaded"
      },
      notaInvechit: "issued in June; ask the city hall for a new one",
      lipseste: "to upload: {act}",
      complet: "all documents uploaded"
    },
    duel: {
      dosare: [
        "Mandates",
        "Pre-contracts",
        "Valuation",
        "Leases",
        "Cadastre"
      ],
      fisiere: [
        {
          sablon: "sales_mandate_{n}.pdf",
          start: 17
        },
        {
          sablon: "precontract_{n}.pdf",
          start: 56
        },
        {
          sablon: "valuation_{n}.pdf",
          start: 5
        },
        {
          sablon: "lease_apt{n}.pdf",
          start: 88
        },
        {
          sablon: "cadastral_plan_{n}.pdf",
          start: 4410
        }
      ],
      tipuri: [
        "Agreement",
        "Agreement",
        "Report",
        "Agreement",
        "Other"
      ],
      stres: [
        "The tax certificate has expired",
        "Bank needs valuation tomorrow",
        "Seller can't find the title deed",
        "Notary wants papers today"
      ],
      termeneRatate: [
        "Missed deadline: deposit payment",
        "Missed deadline: signing the pre-contract",
        "Missed deadline: lease renewal"
      ]
    }
  },
  asigurari: {
    fraza: "For a claim, documents come from the client, the garage and the police, each on its own. In 3S you find them all by the claim number.",
    durere: "The car has sat in the garage for two weeks, and the repair payment waits for an authorization that has not come.",
    concluzie: "A search for claim 932 shows from day one which documents are already uploaded.",
    obiect: {
      dosar: "Collision on Aug 28, claim 932",
      returnat: "held at review",
      propunere: "AI answer, check source",
      sloturi: [
        "Driver's statement",
        "Car title",
        "Repair authorization",
        "Driving license",
        "Claim notice"
      ],
      stari: {
        asteptare: "not uploaded",
        complet: "uploaded",
        lipsa: "none"
      },
      zile: "reported Aug 29",
      fotografii: "12 damage photos"
    },
    duel: {
      dosare: [
        "Notices",
        "Surveys",
        "Repairs",
        "Motor",
        "Photos"
      ],
      fisiere: [
        {
          sablon: "claim_notice_{n}.pdf",
          start: 932
        },
        {
          sablon: "assessment_{n}.pdf",
          start: 40
        },
        {
          sablon: "garage_invoice_{n}.pdf",
          start: 75
        },
        {
          sablon: "motor_policy_{n}.pdf",
          start: 6120
        },
        {
          sablon: "damage_photo_{n}.jpg",
          start: 11
        }
      ],
      tipuri: [
        "Form",
        "Report",
        "Invoice",
        "Agreement",
        "Other"
      ],
      stres: [
        "Policy expires on Friday",
        "The garage keeps asking for its money",
        "Where is the repair authorization?",
        "Assessor only on Thursday"
      ],
      termeneRatate: [
        "Missed deadline: settlement offer",
        "Missed deadline: vehicle inspection",
        "Missed deadline: garage payment"
      ]
    }
  },
  notariat: {
    fraza: "Registers go back decades, and duplicates are always needed in a hurry. Once the office's scans are in 3S, an act shows up when you type the names of the parties.",
    durere: "The bank wants a copy of a 2018 deed of gift today; that year's register is in the basement.",
    concluzie: "The 2018 deed of gift shows on screen at once, no trip to the basement.",
    obiect: {
      substituent: "Search by the parties' names",
      cautare: "Viorel Example",
      randuri: [
        {
          numar: "2018/0412",
          parti: "Gift deed, Viorel Example",
          pastrare: "retention: set on the folder"
        },
        {
          numar: "2022/0931",
          parti: "Partition, Ana and Ilie Example",
          pastrare: "retention: set on the folder"
        },
        {
          numar: "2025/0317",
          parti: "Notarial will, Maria Example",
          pastrare: "retention: set on the folder"
        }
      ],
      potrivit: 0,
      gasit: "One act under this name, from 2018, shown at once"
    },
    duel: {
      dosare: [
        "Gifts",
        "Proxies",
        "Estates",
        "Statements",
        "Deeds"
      ],
      fisiere: [
        {
          sablon: "deed_of_gift_{n}.pdf",
          start: 412
        },
        {
          sablon: "proxy_{n}.pdf",
          start: 1107
        },
        {
          sablon: "inheritance_cert_{n}.pdf",
          start: 86
        },
        {
          sablon: "declaration_{n}.pdf",
          start: 230
        },
        {
          sablon: "partition_{n}.pdf",
          start: 519
        }
      ],
      tipuri: [
        "Agreement",
        "Other",
        "Certificate",
        "Form",
        "Agreement"
      ],
      stres: [
        "The old register is in the basement archive",
        "The duplicate is due by noon",
        "The 2016 register is at the bindery"
      ],
      termeneRatate: [
        "Missed deadline: register inventory",
        "Missed deadline: yesterday's duplicate",
        "Missed deadline: copy for the mortgage"
      ]
    }
  },
  consultanta: {
    fraza: "Reports go through several versions, and signatures come on paper. In 3S the signed copy sits in the project folder and is searchable.",
    durere: "The assessment went out nine days ago and is still not invoiced.",
    concluzie: "Ask whether the client signed off, and the answer cites the signed acceptance letter.",
    obiect: {
      nume: "Process audit for Example Ltd",
      trimis: {
        nume: "Initial assessment",
        meta: "delivered September 2",
        fisier: "assessment_v3_final.pdf",
        asteptare: "no client signature uploaded"
      },
      intors: {
        linie: "signed off Sep 11",
        propunere: "AI answer, check source"
      },
      factura: {
        nume: "Stage invoice",
        asteapta: "needs written sign-off",
        activa: "can be issued"
      },
      stare: {
        nume: "client sign-off",
        asteptare: "not uploaded",
        complet: "uploaded"
      }
    },
    duel: {
      dosare: [
        "Sign-offs",
        "Outputs",
        "Payments",
        "Proposals",
        "Mandates"
      ],
      fisiere: [
        {
          sablon: "sign_off_{n}.pdf",
          start: 5
        },
        {
          sablon: "stage_report_{n}.pdf",
          start: 2
        },
        {
          sablon: "invoice_C{n}.pdf",
          start: 301
        },
        {
          sablon: "proposal_{n}.pdf",
          start: 27
        },
        {
          sablon: "consulting_contract_{n}.pdf",
          start: 14
        }
      ],
      tipuri: [
        "Certificate",
        "Report",
        "Invoice",
        "Offer",
        "Agreement"
      ],
      stres: [
        "Signature on a crooked photo",
        "The invoice has waited a week",
        "The sign-off is in an old email"
      ],
      termeneRatate: [
        "Missed deadline: stage 2 delivery",
        "Missed deadline: progress meeting",
        "Missed deadline: client acceptance"
      ]
    }
  }
};

/** Ordinea canalelor in fraza duelului (aceeasi ca pe RO). */
const ORDINE_CANALE: readonly CodCanal[] = ["email", "mesaj", "hartie"];

/** `{cheie}` intr-un sablon; engleza n-are forma cu "de" a numeralului romanesc. */
export function completeazaEn(sablon: string, valori: Record<string, string | number>): string {
  return sablon.replace(/\{(\w+)\}/g, (tot: string, k: string) => (k in valori ? String(valori[k]) : tot));
}

/** Canalele in fraza duelului: virgula intre ele si "and" inaintea ultimului. */
export function listaCanaleEn(canale: readonly CodCanal[]): string {
  const texte = ORDINE_CANALE.filter((c) => canale.includes(c)).map((c) => NUME_CANAL_EN[c].fraza);
  if (texte.length <= 1) return texte.join("");
  return texte.slice(0, -1).join(", ") + " and " + texte[texte.length - 1];
}

/** Minutele cu punct zecimal: 4.5. */
export function formatMinuteEn(minute: number): string {
  return String(minute);
}

/** Continutul lumii, cu tinta butoanelor: legatura WhatsApp a paginii (sau `null`, fara canal pe domeniu). */
export function continutLumeEn(whatsapp: string | null): ContinutLume {
  const tinta = (text: string): TintaConstructor => ({
    legatura: { text, href: whatsapp, ruta: null },
    canal: "whatsapp",
  });
  return {
    cap: CAP_CONSTRUCTOR_EN,
    comun: COMUN_EN,
    numeCanal: NUME_CANAL_EN,
    chestionar: CHESTIONAR_EN,
    duel: DUEL_EN,
    estimare: ESTIMARE_EN,
    scenarii: SCENARII_EN,
    text: { completeaza: completeazaEn, listaCanale: listaCanaleEn, formatTimp, formatMinute: formatMinuteEn, benziPeEcran: () => [] },
    calcul: {
      estimare,
      zileLucratoare: ZILE_LUCRATOARE,
      parametriDuel: PARAMETRI_DUEL,
      indiciTermeneRatate,
      indiciToast,
      minutePeDocument,
      numeFisier,
    },
    tinte: { final: tinta(COMUN_EN.final.buton), estimare: () => tinta(ESTIMARE_EN.buton) },
  };
}
