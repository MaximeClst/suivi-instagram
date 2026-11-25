"use client";

import { usePathname, useRouter } from "next/navigation";
import { useListeMois, useMoisCourant, useMutations } from "@/lib/hooks/useMois";

const NOMS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const AJOUTER = "__ajouter";

function moisSuivant(key: string) {
  const [a, m] = key.split("-").map(Number);
  return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`;
}

export function MoisSelector() {
  const { data: liste } = useListeMois();
  const courant = useMoisCourant();
  const { creerMois } = useMutations();
  const router = useRouter();
  const pathname = usePathname();

  if (!liste?.length || !courant) return null;
  const suivant = moisSuivant(liste[liste.length - 1].key);
  const [annee, m] = suivant.split("-").map(Number);

  const onChange = async (valeur: string) => {
    if (valeur === AJOUTER) {
      if (!window.confirm(`Créer ${NOMS[m - 1]} ${annee} ? Les semaines et les points de contrôle seront générés.`)) return;
      await creerMois(suivant);
      valeur = suivant;
    }
    router.push(`${pathname}?mois=${valeur}`);
  };

  return (
    <select
      aria-label="Mois"
      value={courant}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded border border-ink-700 bg-ink-900 px-2 text-sm outline-none focus:border-accent"
    >
      {liste.map((mois) => (
        <option key={mois.key} value={mois.key}>
          {mois.label}
        </option>
      ))}
      <option value={AJOUTER}>+ Ajouter {NOMS[m - 1]} {annee}</option>
    </select>
  );
}
