// Tema globalelor pe o pagina: `inchisa` trece antetul, sertarul si subsolul pe varianta inchisa
// (paginile de functionalitate si cele doua promo; functionalitati__sablon.md §1.2, §1.5).
//
// De ce un marcaj in pagina si nu o proprietate: antetul si subsolul stau in layout, iar layout-ul
// nu stie ce pagina randeaza. Pagina pune marcajul, iar CSS-ul globalelor il citeste cu `:has()`:
// fara JavaScript, fara clipire la incarcare si fara o lista de cai scrisa in antet.
//
//     <TemaPagina tema="inchisa" />   // oriunde in pagina

export default function TemaPagina({ tema }: { tema: "inchisa" }) {
  return <span hidden data-tema-pagina={tema} />;
}
