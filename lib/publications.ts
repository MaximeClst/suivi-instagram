import type { Doc } from "@/convex/_generated/dataModel";

type P = Pick<Doc<"publications">, "resultats" | "resultatsB" | "projetRecus" | "vues48h">;

/** Publications prévues : les reportées (en réserve) ne comptent pas dans « X / N publiées ». */
export const prevues = <T extends Pick<Doc<"publications">, "statut">>(publications: T[]) =>
  publications.filter((p) => p.statut !== "reporte");

export const estReel = (p: Pick<Doc<"publications">, "format">) => /^reel/i.test(p.format);

/** Messages reçus (décembre : A + B) ou PROJET (novembre). */
export const messages = (p: P) =>
  p.resultats ? (p.resultats.messages ?? 0) + (p.resultatsB?.messages ?? 0) : (p.projetRecus ?? 0);

/** Vues (décembre : A + B) ou vues à 48 h (novembre). */
export const vues = (p: P) => (p.resultats ? (p.resultats.vues ?? 0) + (p.resultatsB?.vues ?? 0) : (p.vues48h ?? 0));

/** Le mois suit les messages (décembre et après) plutôt que les PROJET. */
export const suitLesMessages = (publications: P[]) => publications.some((p) => p.resultats);

/** Mot-clé affiché pour le CTA : décembre 2026 et après, PROJET devient MAQUETTE et Mini-audit devient NOTE. */
export function libelleCta(cta: "PROJET" | "Mini-audit" | undefined, mois: string): string {
  if (!cta) return "";
  if (mois < "2026-12") return cta;
  return cta === "PROJET" ? "MAQUETTE" : "NOTE";
}
