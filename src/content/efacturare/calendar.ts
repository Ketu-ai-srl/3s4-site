// Calendarul termenelor (`/instrumente/termene.ics`, decizia §6.6 a planului valului S4): termenele
// romanesti si europene care urmeaza dupa `DATA_VERIFICARII`, fiecare cu sursa oficiala si cu o
// ALARMA. La referinta vizuala jumatate din evenimente n-aveau alarma si niciunul nu era romanesc;
// aici fiecare eveniment are alarma, iar proba o cere.
//
// Forma fisierului: RFC 5545. Evenimente pe zi intreaga (`DTSTART;VALUE=DATE`), deci fara fus
// orar; randuri incheiate cu CRLF si pliate la 75 de octeti; textele evadate (\, ; , si rand nou).
// Continutul e determinist - `DTSTAMP` e ziua verificarii, nu ora construirii - ca doua build-uri
// ale aceluiasi commit sa serveasca acelasi fisier.

import { DATA_VERIFICARII, SURSE, type CheieSursa } from "./surse";

export type Termen = {
  /** Ziua, ISO (AAAA-LL-ZZ). */
  data: string;
  titlu: string;
  descriere: string;
  sursa: CheieSursa;
  /** Cu cate zile inainte suna alarma. */
  alarmaZile: number;
};

const LUNI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

function ultimaZi(an: number, luna: number): string {
  // `luna` e 1-12; ziua 0 a lunii urmatoare e ultima zi a lunii curente.
  const zi = new Date(Date.UTC(an, luna, 0)).getUTCDate();
  return an + "-" + String(luna).padStart(2, "0") + "-" + String(zi).padStart(2, "0");
}

/**
 * Termenele lunare D406 (SAF-T) pe 12 luni: ultima zi calendaristica a lunii urmatoare perioadei
 * de raportare (ghidul ANAF D406). Prima perioada e ultima al carei termen urmeaza dupa ziua
 * verificarii (august 2026, cu termen pe 30 septembrie 2026). Data e cea nominala din ghid; regula
 * de prelungire pentru zilele nelucratoare NU s-a putut verifica la sursa, deci nu se aplica si
 * nu se afirma - descrierea trimite la contabil.
 */
function termeneD406(): Termen[] {
  const lista: Termen[] = [];
  for (let i = 0; i < 12; i++) {
    const perioada = new Date(Date.UTC(2026, 7 + i, 1));
    const termen = new Date(Date.UTC(2026, 8 + i, 1));
    const an = termen.getUTCFullYear();
    const luna = termen.getUTCMonth() + 1;
    lista.push({
      data: ultimaZi(an, luna),
      titlu: "România: D406 (SAF-T) pentru " + LUNI[perioada.getUTCMonth()] + " " + perioada.getUTCFullYear(),
      descriere:
        "Termenul declarației informative D406 pentru contribuabilii cu raportare lunară: ultima zi calendaristică a lunii următoare perioadei de raportare. Data este cea din ghidul ANAF; când pică în weekend sau într-o zi de sărbătoare, confirmați ziua depunerii cu contabilul.",
      sursa: "roSaft",
      alarmaZile: 7,
    });
  }
  return lista;
}

const EUROPENE: Termen[] = [
  {
    data: "2027-01-01",
    titlu: "Germania: se încheie tranziția pentru firmele de peste 800.000 EUR",
    descriere:
      "De la această dată, firmele germane cu cifra de afaceri din anul anterior de peste 800.000 EUR nu mai pot emite facturi pe hârtie sau PDF în locul e-facturii.",
    sursa: "de",
    alarmaZile: 30,
  },
  {
    data: "2027-01-01",
    titlu: "Polonia: se încheie facilitățile tranzitorii KSeF",
    descriere:
      "Facilitățile valabile până la finalul lui 2026 (facturi în afara KSeF sub pragul lunar, bonuri fiscale ca facturi) nu mai sunt disponibile.",
    sursa: "pl",
    alarmaZile: 30,
  },
  {
    data: "2027-09-01",
    titlu: "Franța: emiterea e-facturii pentru IMM-uri și microîntreprinderi",
    descriere: "IMM-urile, firmele foarte mici și microîntreprinderile franceze încep să emită facturi electronice.",
    sursa: "fr",
    alarmaZile: 30,
  },
  {
    data: "2028-01-01",
    titlu: "Germania: e-factura la emitere pentru toate firmele",
    descriere: "Se încheie tranziția și pentru firmele cu cifra de afaceri de cel mult 800.000 EUR.",
    sursa: "de",
    alarmaZile: 30,
  },
  {
    data: "2030-07-01",
    titlu: "UE: facturarea electronică pentru livrările dintre statele membre (ViDA)",
    descriere:
      "Statele membre aplică modificările aduse prin articolul 5 al Directivei (UE) 2025/516 (art. 6 alin. (5)): facturare electronică și raportare digitală pentru livrările intracomunitare.",
    sursa: "ueVida",
    alarmaZile: 30,
  },
];

/** Toate termenele, in ordinea datei. */
export function termene(): Termen[] {
  return [...termeneD406(), ...EUROPENE].sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
}

/** Evadarea textului unei proprietati (RFC 5545, 3.3.11). */
export function evadeaza(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Plierea unui rand la 75 de octeti (RFC 5545, 3.1), fara sa taie un caracter UTF-8. */
export function pliaza(rand: string): string {
  const bucati: string[] = [];
  let curent = "";
  let octeti = 0;
  let limita = 75;
  for (const car of rand) {
    const n = Buffer.byteLength(car, "utf8");
    if (octeti + n > limita) {
      bucati.push(curent);
      curent = " ";
      octeti = 1;
      limita = 75;
    }
    curent += car;
    octeti += n;
  }
  bucati.push(curent);
  return bucati.join("\r\n");
}

function zi(data: string): string {
  return data.replace(/-/g, "");
}

function ziuaUrmatoare(data: string): string {
  const d = new Date(data + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Fisierul .ics complet, cu randurile incheiate in CRLF. */
export function fisierIcs(lista: Termen[] = termene()): string {
  const stamp = zi(DATA_VERIFICARII) + "T000000Z";
  const randuri: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//3S Scan Store Solve//Termene e-facturare//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Termene e-facturare și SAF-T (3S)",
  ];
  for (const t of lista) {
    const s = SURSE[t.sursa];
    randuri.push(
      "BEGIN:VEVENT",
      "UID:" + zi(t.data) + "-" + s.id + "@3s-termene",
      "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + zi(t.data),
      "DTEND;VALUE=DATE:" + zi(ziuaUrmatoare(t.data)),
      "SUMMARY:" + evadeaza(t.titlu),
      "DESCRIPTION:" + evadeaza(t.descriere + "\nSursa: " + s.autoritate + ", " + s.titlu + ". Verificat la " + DATA_VERIFICARII + "."),
      "URL:" + s.url,
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + evadeaza(t.titlu),
      "TRIGGER:-P" + t.alarmaZile + "D",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  randuri.push("END:VCALENDAR");
  return randuri.map(pliaza).join("\r\n") + "\r\n";
}
