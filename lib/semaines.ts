import type { Doc } from "@/convex/_generated/dataModel";

/** Un élément du calendrier : une des publications du mois ou un Reel d'essai. */
export type Element =
  | { type: "publication"; date: string; publication: Doc<"publications"> }
  | { type: "reel"; date: string; reel: Doc<"reelsEssai"> };

export type SemaineAvecElements = {
  semaine: Doc<"semaines"> | null; // null = éléments hors des semaines du mois
  elements: Element[];
};

/**
 * Range publications et Reels d'essai par semaine, dans l'ordre chronologique
 * (une semaine sans élément est ignorée). Les Reels d'essai hors des semaines ne sont pas affichés :
 * ils appartiennent à un autre mois.
 */
export function groupBySemaine(
  semaines: Doc<"semaines">[],
  publications: Doc<"publications">[],
  reels: Doc<"reelsEssai">[] = [],
): SemaineAvecElements[] {
  const dans = (date: string, s: Doc<"semaines">) => date >= s.debut && date <= s.fin;
  const elements: Element[] = [
    ...publications.map((p) => ({ type: "publication" as const, date: p.date, publication: p })),
    ...reels.filter((r) => semaines.some((s) => dans(r.date, s))).map((r) => ({ type: "reel" as const, date: r.date, reel: r })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const groupes: SemaineAvecElements[] = semaines.map((semaine) => ({
    semaine,
    elements: elements.filter((e) => dans(e.date, semaine)),
  }));
  const hors = elements.filter((e) => !semaines.some((s) => dans(e.date, s)));
  if (hors.length) groupes.push({ semaine: null, elements: hors });
  return groupes.filter((g) => g.elements.length > 0);
}

/** Jour de tournage : celui de la semaine s'il est fixé (mardi en décembre), sinon le dimanche précédent. */
export function jourDeTournage(semaine: Doc<"semaines">) {
  if (semaine.tournage) return semaine.tournage;
  return new Date(Date.parse(semaine.debut) - 86_400_000).toISOString().slice(0, 10);
}
