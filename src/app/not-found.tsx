import Link from "next/link";
import Buton from "@/components/primitive/Buton";
import { RUTE } from "@/content/rute";
import s from "./negasita.module.css";

// Pagina de 404, in directia REF-N: bloc centrat de 640, eticheta albastra, titlul interior,
// un paragraf si un singur buton plin spre pagina de start. Antetul (in pastila) si subsolul vin
// din layout, deci omul ajuns aici are aceleasi drumuri ca pe orice pagina.
//
// Drumurile de sub buton se iau din `RUTE`, nu se scriu de mana: o pagina de 404 care ar trimite
// spre adrese inexistente ar fi chiar defectul pe care il explica. Cat timp singura ruta e cea de
// start (valul S4-1), lista nu se randeaza.
//
// Nu poarta `metadata` proprie: fisierul nu e o ruta, nu intra in harta de site si nu se indexeaza.

const NUMAR_DRUMURI = 4;

export default function PaginaNegasita() {
  const drumuri = RUTE.filter((r) => r.cale !== "/").slice(0, NUMAR_DRUMURI);
  return (
    <main className={s.pagina}>
      <div className="container-site">
        <div className={s.bloc}>
          <p className={"t-eticheta-sectiune " + s.eticheta}>Eroare 404</p>
          <h1 className={"t-h1-interior " + s.titlu}>Pagina nu există</h1>
          <p className={"t-subtitlu-interior " + s.text}>
            Adresa poate fi greșită sau pagina a fost mutată. De pe pagina de start ajungi la tot ce
            face 3S.
          </p>
          <Buton marime="mare" sageata legatura={{ text: "Pagina de start", href: "/", ruta: "/" }}>
            Mergi la pagina de start
          </Buton>
          {drumuri.length > 0 ? (
            <ul className={s.drumuri}>
              {drumuri.map((r) => (
                <li key={r.cale}>
                  <Link href={r.cale} className={s.drum}>
                    {r.scurt}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </main>
  );
}
