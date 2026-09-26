// Punctul pe care il interogheaza cardul de verificare din pagina de securitate
// (`src/components/produs/VerificareBrowser.tsx`): un raspuns mic, calculat la fiecare cerere si
// niciodata pus in cache, ca timpul masurat de browser sa fie al unui drum real pana la server.
//
// Nu citeste si nu intoarce nimic despre cel care intreaba (fara adresa, fara antete, fara
// cookie-uri) si nu scrie nimic in jurnal: raspunsul e acelasi pentru oricine.

export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(
    { stare: "ok" },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
