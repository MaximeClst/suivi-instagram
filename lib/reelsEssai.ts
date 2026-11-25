import type { Doc } from "@/convex/_generated/dataModel";

export type ReelEssai = Doc<"reelsEssai">;

const H48 = 48 * 3_600_000;

/** Moment de publication, à l'heure de La Réunion (UTC+4, pas d'heure d'été). */
export function publieA(reel: Pick<ReelEssai, "date" | "heure">) {
  return Date.parse(`${reel.date}T${reel.heure}:00+04:00`);
}

const diffuse = (r: ReelEssai) => r.statut === "publie" || r.statut === "partage";

/** Classement des Reels diffusés : abonnés gagnés, puis visites du profil, puis vues. */
export function classer(reels: ReelEssai[]) {
  return reels
    .filter((r) => diffuse(r) && r.abonnes !== null)
    .sort(
      (a, b) =>
        (b.abonnes ?? 0) - (a.abonnes ?? 0) ||
        (b.visitesProfil ?? 0) - (a.visitesProfil ?? 0) ||
        (b.vues48h ?? 0) - (a.vues48h ?? 0),
    );
}

/** Reels publiés depuis au moins 48 h dont la comparaison n'a pas encore été faite. */
export function rappels(reels: ReelEssai[], maintenant: number) {
  return reels.filter((r) => r.statut === "publie" && !r.comparaisonFaite && maintenant >= publieA(r) + H48);
}
