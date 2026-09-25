# Afirmatii de confirmat

> Generat automat din `src/content/afirmatii/promo.json`. NU se editeaza de mana:
> se schimba registrul, iar poarta regenereaza fisierul si pica daca difera.

Lista de mai jos e ce trebuie sa bifeze cineva care stie afacerea, inainte de publicare.
Pana atunci, afirmatiile stau pe site ca text redactional, nu ca fapt verificat.

**De confirmat: 8 din 13**

| # | Afirmatia, asa cum apare pe site | Unde |
|---|---|---|
| 1 | Fișierele sunt criptate AES-256 pe disc, iar la transfer circulă prin TLS 1.2 sau mai nou | `src/content/promo.ts` |
| 2 | Arhiva se întreabă pe web sau pe WhatsApp, iar răspunsul vine cu documentul și cu pagina din care e luat | `src/content/promo.ts` |
| 3 | 3S scanează hârtia predată, citește fiecare act, îi recunoaște tipul și îl așază în dosarul potrivit (contractul la contracte, factura la luna ei) | `src/content/promo.ts` |
| 4 | O întrebare scrisă în cuvinte obișnuite găsește contractele după termenul lor (în exemplu, cele care expiră într-o lună) | `src/content/promo.ts` |
| 5 | O regulă automată scrisă o dată trimite actul nou la aprobare, apoi la contabil, și trece fiecare pas în jurnal | `src/content/promo.ts` |
| 6 | Facturile pleacă spre RO e-Factura, sistemul național al ANAF, din arhiva 3S, fără descărcarea și încărcarea manuală a fișierelor XML | `src/content/promo.ts` |
| 7 | Aplicația de telefon îndreaptă fotografia unui bon, citește din ea furnizorul, codul fiscal, suma, data și numărul bonului, chiar și de pe un bon mototolit sau decolorat, și pune fișierul în dosarul lunii | `src/content/promo.ts` |
| 8 | O regulă automată cere aprobarea bonurilor peste o sumă aleasă de firmă, trece în jurnal cine a aprobat și la ce oră, iar filtrul pe lună arată bonurile încă neaprobate | `src/content/promo.ts` |

