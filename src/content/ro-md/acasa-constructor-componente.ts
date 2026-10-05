// Continutul lumii constructorului de pe start, editia `ro-md` (3s.md): textele comune ale panoului,
// numele canalelor, chestionarul, duelul, estimarea si cele 9 scene, cu functiile de text ale editiei.
// Il citeste invelitoarea lenesa a lumii (`ConstructorLumeRoMd.tsx`), deci sta in bucata JS a lumii, nu
// in pachetul paginii. Capul (titlul, intrebarea, industriile) e in `acasa-constructor-cap-componente.ts`.
//
// SURSA TEXTULUI: fisa de continut a paginii, sectiunea Textele componentelor (decizia 53), Constructor (decizia 59,
// forma (a) a intrebarii 2), cheie cu cheie fata de `src/content/acasa-constructor.ts`; status: propus,
// pana la aprobarea pe capturi. Ce lipseste fata de RO, prin forma (a): lista de reguli si randul de
// integrari ale panoului (decizia 43), benzile si toast-urile celor 9 scene, banda canalelor, pista
// termenului din scena Avocatura (zilele si data limita, fara temei: decizia 43). Tipurile din
// `LumeVedere.tsx` au aceste campuri optionale; aici nu se scriu.
//
// CE POATE ARATA O SCENA, si nimic in plus: incarcarea din browser, recunoasterea textului si eticheta de
// tip a documentului, cautarea si raspunsul AI cu sursa indicata, dosarele create de firma si termenul de
// pastrare pus pe dosar. Afirmatiile despre produs au intrarile lor in
// `src/content/afirmatii/ro-md-acasa-constructor.json`; cifrele estimarii sunt ale formulei RO, date ca EXEMPLU.
// DATELE DIN SCENE SUNT FICTIVE (plan D9) si se declara ca exemplu, ca pe RO.
//
// LIMBA: romana editiei /ro, la "tu" (decizia 35); formulele pastreaza `|de` (regula din `limba.ts`),
// datele raman in forma RO (02.09), minutele cu virgula (4,5). Sumele: niciuna in lei (decizia 54).
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
  formatMinute,
  formatTimp,
  indiciTermeneRatate,
  indiciToast,
  minutePeDocument,
  numeFisier,
} from "@/content/acasa-constructor";
import { numarCuDe } from "@/content/limba";
import { CAP_CONSTRUCTOR_RO_MD } from "./acasa-constructor-cap-componente";

export const COMUN_RO_MD: ComunConstructor = {
  schimba: "alege alt domeniu",
  numeSpatiu: "Firma ta",
  tipSpatiu: "Arhivă de exemplu",
  progres: "Arhiva ta",
  reluare: "Reconstruiește arhiva",
  final: {
    titlu: "Vrei să vezi asta pe documentele tale?",
    subRand: "Pilot gratuit de 14 zile, asistat.",
    buton: "Scrie-ne pe WhatsApp"
  },
  anuntGata: "Arhiva de exemplu pentru domeniul „{industrie}” e gata."
};

export const NUME_CANAL_RO_MD: NumeCanalConstructor = {
  email: {
    fraza: "pe e-mail",
    insigna: "e-mail"
  },
  mesaj: {
    fraza: "pe WhatsApp",
    insigna: "WhatsApp"
  },
  hartie: {
    fraza: "prin poștă",
    insigna: "poștă"
  }
};

export const CHESTIONAR_RO_MD: ChestionarConstructor = {
  titlu: "Ce se petrece zilnic cu documentele firmei tale?",
  descriere: "Trei clicuri și un calcul de exemplu îți arată câte ore lunar cer documentele.",
  canale: {
    intrebare: "Cum ajung documentele la firmă?",
    optiuni: [
      {
        cod: "email",
        text: "E-mail"
      },
      {
        cod: "mesaj",
        text: "Mesaje, WhatsApp"
      },
      {
        cod: "hartie",
        text: "Hârtie, prin poștă"
      }
    ]
  },
  volum: {
    intrebare: "Câte documente primești zilnic?",
    optiuni: [
      {
        cod: "v10",
        text: "Până la 10"
      },
      {
        cod: "v50",
        text: "10-50"
      },
      {
        cod: "v99",
        text: "Peste 50"
      }
    ]
  },
  cine: {
    intrebare: "Cine le gestionează acum?",
    optiuni: [
      {
        cod: "eu",
        titlu: "Chiar eu",
        descriere: "Sortatul actelor îmi ia din timpul de conducere"
      },
      {
        cod: "coleg",
        titlu: "Un coleg",
        descriere: "Are alte atribuții, dar ziua îi trece cu sortatul documentelor"
      },
      {
        cod: "nimeni",
        titlu: "Nimeni",
        descriere: "Documentele zac până când cineva le caută în grabă, înainte de termen"
      }
    ]
  },
  confirma: "Confirmă",
  confirmat: "Confirmat"
};

export const DUEL_RO_MD: DuelConstructor = {
  eticheta: "O zi simulată, pas cu pas",
  reluare: "Reluare",
  firmaFara: "Fișiere și e-mailuri",
  firmaCu: "Tot în arhiva 3S",
  nesortate: "fără tip:",
  inOrdine: "etichetate",
  timpPierdut: "timp risipit:",
  termeneRatate: "termene pierdute:",
  timpEconomisit: "timp câștigat:",
  faraEticheta: "fără tip",
  ai: "AI",
  calm: "Fiecare act are eticheta lui de tip.",
  cine: {
    eu: "{timp} pe zi se duc pe documente, nu pe clienți.",
    coleg: "Colegul tău caută prin documente {timp} pe zi.",
    nimeni: "Actele se adună în teancuri și nimeni nu le mai deschide."
  },
  final: {
    eu: "Când primești {volum} {canale}, câștigi {timp} pe zi cu 3S.",
    coleg: "Când primești {volum} {canale}, colegul câștigă {timp} pe zi.",
    nimeni: "Când primești {volum} {canale}, orice act se găsește cu o întrebare."
  },
  volumInCuvinte: {
    v10: "până la 10 acte pe zi",
    v50: "10-50 de acte zilnic",
    v99: "peste 50 de documente pe zi"
  },
  scor: {
    nesortate: "Fără tip",
    timp: "Timp",
    termene: "Termene pierdute",
    vs: "vs"
  },
  declaratie: "Simulare de exemplu, cu documente fictive"
};

export const ESTIMARE_RO_MD: EstimareConstructor = {
  eticheta: "Cât te costă căutatul manual",
  cifra: "≈ {ore|de} ore pe lună",
  formula: "{docs|de} documente zilnic, {k} min pentru fiecare, pe {zile} de zile lucrătoare (calcul de exemplu)",
  manual: "Manual",
  cuProdus: "Cu 3S",
  morala: {
    eu: "Orele acestea pot merge spre clienți în loc de dosare.",
    coleg: "O parte din salariul colegului se duce pe căutatul documentelor.",
    nimeni: "La un control, un act negăsit te costă mai mult decât timpul."
  },
  buton: "Scrie-ne pe WhatsApp",
  nota: "Răspunde o persoană, în română sau engleză."
};

export const SCENARII_RO_MD: ScenariiEditie = {
  constructii: {
    fraza: "Pe șantier, documentele sosesc de la proiectant, furnizori și inspectori, pe căi diferite. În 3S le găsești pe toate cu o întrebare.",
    durere: "Revizia C a planșei a sosit acum trei săptămâni, iar echipa toarnă în continuare după revizia B.",
    concluzie: "Întrebi care e ultima planșă, iar răspunsul indică revizia C, din 2 septembrie.",
    obiect: {
      cod: "PL-204",
      nume: "Structura etajului 2",
      veche: {
        numar: "rev. B",
        data: "11.06",
        stare: "revizie mai veche",
        retrasa: "înlocuită pe 02.09"
      },
      noua: {
        numar: "rev. C",
        data: "02.09",
        stare: "ultima revizie",
        propunere: "răspuns AI, vezi sursa"
      },
      bara: {
        nume: "Dosarul recepției",
        total: 6,
        contor: "în 3S: {n}/{total}",
        complet: "indexat"
      }
    },
    duel: {
      dosare: [
        "Recepții",
        "Oferte",
        "Planșe",
        "Încercări",
        "Facturi"
      ],
      fisiere: [
        {
          sablon: "proces_verbal_{n}.pdf",
          start: 3
        },
        {
          sablon: "oferta_pret_{n}.xlsx",
          start: 114
        },
        {
          sablon: "plansa_fatada_R{n}.dwg",
          start: 4
        },
        {
          sablon: "incercare_beton_B{n}.pdf",
          start: 25
        },
        {
          sablon: "factura_otel_{n}.pdf",
          start: 31
        }
      ],
      tipuri: [
        "Proces-verbal",
        "Ofertă",
        "Altele",
        "Raport",
        "Factură"
      ],
      stres: [
        "Revizia nouă stă într-un e-mail",
        "Încercarea n-a sosit",
        "Planșa bună e la proiectant",
        "Dirigintele sosește la ora 10"
      ],
      termeneRatate: [
        "Termen pierdut: recepția structurii",
        "Termen pierdut: comanda de oțel",
        "Termen pierdut: oferta pentru beneficiar"
      ]
    }
  },
  contabilitate: {
    fraza: "Extrasele, facturile și bonurile unui client vin fragmentat, toată luna. În 3S le ții într-un dosar pe lună și găsești oricare dintre ele cu o întrebare.",
    durere: "Balanța se închide vineri, dar extrasele clientului nu acoperă două zile.",
    concluzie: "Întrebi ce extrase pe august ai, iar răspunsul indică fiecare document.",
    obiect: {
      client: "Alfa Exemplu",
      perioada: "08/2026",
      celule: [
        {
          eticheta: "Facturi emise",
          valoare: "14"
        },
        {
          eticheta: "Bonuri fiscale",
          valoare: "27"
        },
        {
          eticheta: "Extrase bancare",
          valoare: "20",
          scurta: true
        },
        {
          eticheta: "Facturi primite",
          valoare: "31"
        },
        {
          eticheta: "Acte de salarizare",
          valoare: "4"
        }
      ],
      lipsa: "răspuns: extrase pe 1-13 și 16-31 august",
      propunere: "răspuns AI, vezi sursa",
      termen: "balanța pentru august se închide vineri"
    },
    duel: {
      dosare: [
        "Achiziții",
        "Bancă",
        "Personal",
        "Bonuri",
        "Declarații"
      ],
      fisiere: [
        {
          sablon: "factura_furnizor_F{n}.pdf",
          start: 1042
        },
        {
          sablon: "extras_bancar_{n}.pdf",
          start: 208
        },
        {
          sablon: "salarizare_{n}.xlsx",
          start: 7
        },
        {
          sablon: "bon_fiscal_{n}.jpg",
          start: 390
        },
        {
          sablon: "TVA_{n}.pdf",
          start: 8
        }
      ],
      tipuri: [
        "Factură",
        "Altele",
        "Raport",
        "Chitanță",
        "Formular"
      ],
      stres: [
        "Bonurile stau într-un plic",
        "Din extras lipsesc două zile",
        "Totul sosește pe WhatsApp",
        "TVA se depune poimâine"
      ],
      termeneRatate: [
        "Termen pierdut: facturile electronice",
        "Termen pierdut: raportul salarial",
        "Termen pierdut: TVA pe august"
      ]
    }
  },
  logistica: {
    fraza: "Actele unei curse apar pe parcurs: la încărcare, în cabină, la descărcare, fiecare la alt om. În 3S găsești fiecare act după numărul cursei.",
    durere: "Marfa e la Hamburg de o săptămână, iar cursa nu se poate factura fără recepția semnată.",
    concluzie: "Căutarea cursei 418 găsește recepția imediat ce e încărcată.",
    obiect: {
      cap: "Cursa 418 (Chișinău-Hamburg), Ion Exemplu",
      verigi: [
        "CMR",
        "Colisajul",
        "Foaia de parcurs",
        "Recepția la client",
        "Factura cursei"
      ],
      notaFierbinte: "neclară, text ilizibil",
      notaBlocata: "recepția negăsită",
      notaDeblocata: "e în arhivă",
      coada: "descărcată pe 29.08, recepția neîncărcată",
      fisier: "receptie_418.pdf",
      propunere: "răspuns AI, vezi sursa"
    },
    duel: {
      dosare: [
        "Comenzi",
        "Livrări",
        "CMR",
        "Colisaje",
        "Facturi"
      ],
      fisiere: [
        {
          sablon: "comanda_{n}.pdf",
          start: 530
        },
        {
          sablon: "aviz_livrare_{n}.pdf",
          start: 77
        },
        {
          sablon: "CMR_{n}.pdf",
          start: 418
        },
        {
          sablon: "colete_{n}.pdf",
          start: 61
        },
        {
          sablon: "factura_cursa_{n}.pdf",
          start: 902
        }
      ],
      tipuri: [
        "Formular",
        "Altele",
        "Formular",
        "Altele",
        "Factură"
      ],
      stres: [
        "Recepția a rămas în cabină",
        "Șoferul e pe traseu, fără semnal",
        "Colisajul e o poză neclară"
      ],
      termeneRatate: [
        "Termen pierdut: factura cursei 418",
        "Termen pierdut: vama cursei 418",
        "Termen pierdut: statistica lunară"
      ]
    }
  },
  it: {
    fraza: "Contractele cu clienții sunt împrăștiate în trei locuri, fiecare cu versiunea și anexele lui. În 3S fiecare client are un dosar, iar o întrebare îți arată versiunea semnată.",
    durere: "Schimbi prețul fără să știi dacă pornești de la versiunea semnată sau de la o ciornă.",
    concluzie: "Întrebi ce versiune s-a semnat, iar răspunsul indică exemplarul semnat și data lui.",
    obiect: {
      client: "Beta Exemplu",
      dataInitiala: "01.07.2026",
      dataNoua: "15.09.2026",
      propunere: "răspuns AI, vezi sursa",
      azi: "azi",
      vechiInVigoare: "în vigoare",
      vechiInlocuit: "valabil până pe 14.09",
      nou: "în vigoare",
      set: [
        "Contract-cadru",
        "SOW",
        "Tarife",
        "Licențe",
        "Comandă"
      ],
      lipsa: 1,
      nota: "dosar: 4 din 5 acte încărcate",
      notaFinala: "Beta Exemplu: 5 din 5 încărcate"
    },
    duel: {
      dosare: [
        "Licențe",
        "SOW",
        "Facturi",
        "DPA",
        "Predări"
      ],
      fisiere: [
        {
          sablon: "licenta_server_{n}.pdf",
          start: 21
        },
        {
          sablon: "propunere_SOW_{n}.docx",
          start: 9
        },
        {
          sablon: "factura_IT{n}.pdf",
          start: 715
        },
        {
          sablon: "DPA_client_{n}.pdf",
          start: 48
        },
        {
          sablon: "pv_predare_v{n}.pdf",
          start: 3
        }
      ],
      tipuri: [
        "Certificat",
        "Ofertă",
        "Factură",
        "Contract",
        "Proces-verbal"
      ],
      stres: [
        "Anexa stă pe un chat",
        "S-a semnat v2 sau v3?",
        "Clientul cere răspuns azi"
      ],
      termeneRatate: [
        "Termen pierdut: auditul de securitate",
        "Termen pierdut: tichetul critic de luni",
        "Termen pierdut: predarea sprintului"
      ]
    }
  },
  avocatura: {
    fraza: "Actele de procedură sosesc prin curier sau pe e-mail, iar ziua primirii o arată doar plicul. În 3S cauți în textul fiecărui act, inclusiv data comunicării.",
    durere: "Termenul de apel a fost socotit din memorie și cade cu două săptămâni după cel real.",
    concluzie: "Întrebi când s-a comunicat sentința, iar răspunsul indică data de pe act.",
    obiect: {
      dosar: "2318/2026, Ion c. Ana Exemplu",
      stampila: "comunicată la 03.09.2026",
      nota: "data citită de pe act; termenul îl socotește avocatul",
      acte: [
        "Întâmpinarea",
        "Raportul expertului",
        "Sentința primei instanțe"
      ],
      asteptare: "încă necomunicată",
      ancora: "termenul de apel curge de la comunicarea sentinței"
    },
    duel: {
      dosare: [
        "Hotărâri",
        "Citații",
        "Acțiuni",
        "Onorarii",
        "Expertize"
      ],
      fisiere: [
        {
          sablon: "hotarare_{n}.pdf",
          start: 845
        },
        {
          sablon: "citatie_{n}.pdf",
          start: 1207
        },
        {
          sablon: "cerere_{n}.pdf",
          start: 318
        },
        {
          sablon: "factura_onorariu_{n}.pdf",
          start: 33
        },
        {
          sablon: "raport_expertiza_{n}.pdf",
          start: 64
        }
      ],
      tipuri: [
        "Altele",
        "Scrisoare",
        "Altele",
        "Factură",
        "Raport"
      ],
      stres: [
        "Plicul cu hotărârea s-a rătăcit",
        "Când a sosit citația?",
        "Termenul e scris într-un carnet",
        "Raportul e la un coleg în concediu"
      ],
      termeneRatate: [
        "Termen pierdut: concluziile scrise",
        "Termen pierdut: obiecțiile la expertiză",
        "Termen pierdut: dovada taxei de stat"
      ]
    }
  },
  imobiliare: {
    fraza: "Pentru o locuință, proprietarul, banca, cadastrul și asociația trimit fiecare actele lor, pe căi diferite. În 3S le găsești pe toate după adresa imobilului.",
    durere: "Semnarea e joi, dar certificatul fiscal din dosarul apartamentului a expirat.",
    concluzie: "Cauți adresa cu câteva zile înainte, iar data de emitere a certificatului apare la timp.",
    obiect: {
      programare: "Semnarea, joi 10:30",
      propunere: "răspuns AI, vezi sursa",
      adresa: "Str. Teilor 12, ap. 5 (exemplu)",
      acte: [
        {
          nume: "Actele de identitate",
          stare: "complet"
        },
        {
          nume: "Actul de proprietate",
          stare: "complet"
        },
        {
          nume: "Certificatul fiscal",
          stare: "invechit"
        },
        {
          nume: "Certificatul asociației",
          stare: "asteptare"
        },
        {
          nume: "Planul cadastral",
          stare: "asteptare"
        }
      ],
      stari: {
        complet: "încărcat",
        invechit: "vezi data",
        asteptare: "neîncărcat"
      },
      notaInvechit: "emis în iunie; cere unul nou de la primărie",
      lipseste: "neîncărcat: {act}",
      complet: "toate actele încărcate"
    },
    duel: {
      dosare: [
        "Mandate",
        "Antecontracte",
        "Evaluări",
        "Chirii",
        "Cadastru"
      ],
      fisiere: [
        {
          sablon: "mandat_vanzare_{n}.pdf",
          start: 17
        },
        {
          sablon: "antecontract_{n}.pdf",
          start: 56
        },
        {
          sablon: "raport_evaluare_{n}.pdf",
          start: 5
        },
        {
          sablon: "locatiune_{n}.pdf",
          start: 88
        },
        {
          sablon: "plan_cadastral_{n}.pdf",
          start: 4410
        }
      ],
      tipuri: [
        "Contract",
        "Contract",
        "Raport",
        "Contract",
        "Altele"
      ],
      stres: [
        "Certificatul fiscal e expirat",
        "Banca vrea evaluarea mâine",
        "Vânzătorul nu-și găsește actul",
        "Notarul cere actele azi"
      ],
      termeneRatate: [
        "Termen pierdut: plata avansului",
        "Termen pierdut: semnarea antecontractului",
        "Termen pierdut: prelungirea chiriei"
      ]
    }
  },
  asigurari: {
    fraza: "Într-un dosar de daună, actele sosesc separat: de la client, din service, de la poliție. În 3S le găsești pe toate după numărul dosarului de daună.",
    durere: "Mașina așteaptă în service de două săptămâni, pentru că plata reparației depinde de o autorizație care întârzie.",
    concluzie: "Căutarea după dosarul 932 îți arată din prima zi ce acte sunt deja încărcate.",
    obiect: {
      dosar: "Coliziune din 28.08, dosarul 932",
      returnat: "oprit la verificare",
      propunere: "răspuns AI, vezi sursa",
      sloturi: [
        "Declarația șoferului",
        "Talonul",
        "Autorizația de reparație",
        "Permisul șoferului",
        "Avizul de daună"
      ],
      stari: {
        asteptare: "neîncărcat",
        complet: "încărcat",
        lipsa: "gol"
      },
      zile: "avizată pe 29.08",
      fotografii: "12 poze ale daunei"
    },
    duel: {
      dosare: [
        "Avizări",
        "Constatări",
        "Reparații",
        "CASCO",
        "Poze"
      ],
      fisiere: [
        {
          sablon: "avizare_dauna_{n}.pdf",
          start: 932
        },
        {
          sablon: "constatare_{n}.pdf",
          start: 40
        },
        {
          sablon: "factura_service_{n}.pdf",
          start: 75
        },
        {
          sablon: "polita_auto_{n}.pdf",
          start: 6120
        },
        {
          sablon: "foto_dauna_{n}.jpg",
          start: 11
        }
      ],
      tipuri: [
        "Formular",
        "Raport",
        "Factură",
        "Contract",
        "Altele"
      ],
      stres: [
        "Polița auto expiră vineri",
        "Service-ul își cere banii zilnic",
        "Unde e autorizația de reparație?",
        "Evaluatorul vine abia joi"
      ],
      termeneRatate: [
        "Termen pierdut: oferta de despăgubire",
        "Termen pierdut: inspecția auto",
        "Termen pierdut: plata către service"
      ]
    }
  },
  notariat: {
    fraza: "Biroul păstrează registre vechi de zeci de ani, iar duplicatele sunt cerute mereu urgent. Când scanările făcute de birou sunt în 3S, actul apare imediat ce scrii numele părților.",
    durere: "Banca cere până diseară copia unei donații din 2018, aflată în registrul din subsol.",
    concluzie: "Donația din 2018 apare imediat pe ecran, fără drum la subsol.",
    obiect: {
      substituent: "Caută după numele părților",
      cautare: "Viorel Exemplu",
      randuri: [
        {
          numar: "2018/0412",
          parti: "Donație · Viorel Exemplu",
          pastrare: "termen de păstrare: pe dosar"
        },
        {
          numar: "2022/0931",
          parti: "Partaj · Ana și Ilie Exemplu",
          pastrare: "termen de păstrare: pe dosar"
        },
        {
          numar: "2025/0317",
          parti: "Testament autentic · Maria Exemplu",
          pastrare: "termen de păstrare: pe dosar"
        }
      ],
      potrivit: 0,
      gasit: "Un singur act cu acest nume, din 2018, găsit pe loc"
    },
    duel: {
      dosare: [
        "Donații",
        "Procuri",
        "Succesiuni",
        "Declarații",
        "Partaje"
      ],
      fisiere: [
        {
          sablon: "contract_donatie_{n}.pdf",
          start: 412
        },
        {
          sablon: "procura_{n}.pdf",
          start: 1107
        },
        {
          sablon: "succesiune_{n}.pdf",
          start: 86
        },
        {
          sablon: "declaratie_{n}.pdf",
          start: 230
        },
        {
          sablon: "act_partaj_{n}.pdf",
          start: 519
        }
      ],
      tipuri: [
        "Contract",
        "Altele",
        "Certificat",
        "Formular",
        "Contract"
      ],
      stres: [
        "Registrul vechi stă în arhiva de la subsol",
        "Duplicatul trebuie eliberat până la prânz",
        "Registrul din 2016 e la legătorie"
      ],
      termeneRatate: [
        "Termen pierdut: inventarul registrelor",
        "Termen pierdut: duplicatul de ieri",
        "Termen pierdut: copia pentru ipotecă"
      ]
    }
  },
  consultanta: {
    fraza: "Un raport are mai multe versiuni, iar semnăturile sosesc pe hârtie. În 3S exemplarul semnat stă în dosarul proiectului, ușor de găsit.",
    durere: "Diagnoza e predată de nouă zile, iar factura încă nu poate pleca.",
    concluzie: "Întrebi dacă clientul a semnat acordul, iar răspunsul indică exemplarul semnat.",
    obiect: {
      nume: "Auditul proceselor la Exemplu SRL",
      trimis: {
        nume: "Diagnoza de pornire",
        meta: "predată la 2 septembrie",
        fisier: "diagnoza_v3_final.pdf",
        asteptare: "semnătura clientului neîncărcată"
      },
      intors: {
        linie: "semnată la 11.09",
        propunere: "răspuns AI, vezi sursa"
      },
      factura: {
        nume: "Factura etapei",
        asteapta: "cere acordul scris",
        activa: "se poate emite"
      },
      stare: {
        nume: "acordul clientului",
        asteptare: "neîncărcat",
        complet: "încărcat"
      }
    },
    duel: {
      dosare: [
        "Acorduri",
        "Livrabile",
        "Încasări",
        "Oferte",
        "Mandate"
      ],
      fisiere: [
        {
          sablon: "acord_client_{n}.pdf",
          start: 5
        },
        {
          sablon: "raport_etapa_{n}.pdf",
          start: 2
        },
        {
          sablon: "factura_C{n}.pdf",
          start: 301
        },
        {
          sablon: "oferta_{n}.pdf",
          start: 27
        },
        {
          sablon: "contract_consultanta_{n}.pdf",
          start: 14
        }
      ],
      tipuri: [
        "Certificat",
        "Raport",
        "Factură",
        "Ofertă",
        "Contract"
      ],
      stres: [
        "Semnătura e pe o poză strâmbă",
        "Factura zace de o săptămână",
        "Acordul stă într-un e-mail vechi"
      ],
      termeneRatate: [
        "Termen pierdut: livrarea etapei 2",
        "Termen pierdut: ședința de progres",
        "Termen pierdut: acordul clientului"
      ]
    }
  }
};

/** Ordinea canalelor in fraza duelului (aceeasi ca pe RO). */
const ORDINE_CANALE: readonly CodCanal[] = ["email", "mesaj", "hartie"];

/**
 * `{cheie}` intr-un sablon; `{cheie|de}` scrie numarul urmat de "de" cand forma literara o cere
 * (regula din `limba.ts`, aceeasi ca pe RO).
 */
export function completeazaRoMd(sablon: string, valori: Record<string, string | number>): string {
  return sablon.replace(/\{(\w+)(\|de)?\}/g, (tot: string, k: string, de?: string) => {
    if (!(k in valori)) return tot;
    const v = valori[k];
    return de && typeof v === "number" ? numarCuDe(v) : String(v);
  });
}

/** Canalele in fraza duelului: virgula intre ele si "si" inaintea ultimului. */
export function listaCanaleRoMd(canale: readonly CodCanal[]): string {
  const texte = ORDINE_CANALE.filter((c) => canale.includes(c)).map((c) => NUME_CANAL_RO_MD[c].fraza);
  if (texte.length <= 1) return texte.join("");
  return texte.slice(0, -1).join(", ") + " și " + texte[texte.length - 1];
}

/** Continutul lumii, cu tinta butoanelor: legatura WhatsApp a paginii (sau `null`, fara canal pe domeniu). */
export function continutLumeRoMd(whatsapp: string | null): ContinutLume {
  const tinta = (text: string): TintaConstructor => ({
    legatura: { text, href: whatsapp, ruta: null },
    canal: "whatsapp",
  });
  return {
    cap: CAP_CONSTRUCTOR_RO_MD,
    comun: COMUN_RO_MD,
    numeCanal: NUME_CANAL_RO_MD,
    chestionar: CHESTIONAR_RO_MD,
    duel: DUEL_RO_MD,
    estimare: ESTIMARE_RO_MD,
    scenarii: SCENARII_RO_MD,
    text: { completeaza: completeazaRoMd, listaCanale: listaCanaleRoMd, formatTimp, formatMinute, benziPeEcran: () => [] },
    calcul: {
      estimare,
      zileLucratoare: ZILE_LUCRATOARE,
      parametriDuel: PARAMETRI_DUEL,
      indiciTermeneRatate,
      indiciToast,
      minutePeDocument,
      numeFisier,
    },
    tinte: { final: tinta(COMUN_RO_MD.final.buton), estimare: () => tinta(ESTIMARE_RO_MD.buton) },
  };
}
