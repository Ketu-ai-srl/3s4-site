// Multimea cailor care EXISTA azi pe site: rutele din `RUTE` plus articolele din registrul
// blogului. Din ea isi filtreaza navigatia legaturile (`seVede` din `navigatie.ts`) si tot din ea
// decide `Tinta` daca o legatura din corpul unei pagini se randeaza ca legatura sau inerta.
//
// Se calculeaza o data, la importul modulului: amandoua sursele sunt fisiere comise, deci o
// citire la construire e la fel de buna ca una la fiecare cerere.

import { caiArticole } from "./blog/registru";
import { multimeaCailor, type CaiExistente } from "./navigatie";
import { RUTE } from "./rute";

export const CAI_EXISTENTE: CaiExistente = multimeaCailor(RUTE, caiArticole());
