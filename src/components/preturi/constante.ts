// Identificatorii paginii de preturi folositi si de componentele de server, si de cele de client.
// Stau intr-un modul fara "use client": o valoare exportata dintr-un modul de client ajunge intr-o
// componenta de server ca referinta, nu ca sir.

/** Titlul lumii pachetelor (h2 "3S Business"), tinta focusului dupa deschidere. */
export const ID_TITLU_LUME = "pachete-titlu";

/** Clasa pusa pe `html` cat se tipareste foaia de oferta (lista de preturi ca PDF). */
export const CLASA_TIPAR = "tipar-oferta-3s";

/** Atributul foii de oferta: singurul copil al lui `body` care ramane la tiparire. */
export const ATRIBUT_FOAIE = "data-foaie-oferta";
