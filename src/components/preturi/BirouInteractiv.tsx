"use client";

// Biroul din primul pliu, INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati ca
// inainte. Da lui `BirouInteractivVedere` textele RO si planurile; vederea nu importa continut, iar alta
// editie isi are invelitoarea ei. Scena, contorul si banda de conturi sunt descrise in vedere.

import { BIROU, PLANURI } from "@/content/preturi";
import BirouInteractivVedere from "./BirouInteractivVedere";

export default function BirouInteractiv({ activ }: { activ: boolean }) {
  return <BirouInteractivVedere activ={activ} continut={BIROU} planuri={PLANURI} />;
}
