// SEGMENT TEMPORAR al editiei `en` (fundatia editiilor, `src/lib/editii.ts`). Next 15.5 adauga pagina de
// negasit globala (`src/app/global-not-found.en.tsx`) numai cand build-ul are macar o pagina app
// (`createPagesMapping` din `next/dist/build/entries.js`). Pana la prima pagina EN, build-ul cu `en` n-ar
// avea niciuna, iar 404-ul ar veni din routerul pages, cu `<html>` fara `lang`.
//
// Segmentul asta e acea pagina si nu serveste nimic: `generateStaticParams` nu da nicio cale, iar
// `dynamicParams = false` refuza orice alta, deci fiecare adresa raspunde 404 din pagina de negasit EN, cu
// `<html lang="en">`. Costul: serverul jurnalizeaza `NoFallbackError` la fiecare adresa de un singur segment.
// Caile statice (rutele de sistem, paginile care vor veni) au prioritate fata de un segment dinamic.
//
// SE STERGE odata cu prima pagina EN, masurand ca 404-ul ramane in engleza. Pe build-ul romanesc
// fisierul nu e compilat (`.en.tsx` nu e extensie de pagina acolo).

export const dynamicParams = false;

export function generateStaticParams(): { negasit: string }[] {
  return [];
}

export default function SegmentNegasit() {
  return null;
}
