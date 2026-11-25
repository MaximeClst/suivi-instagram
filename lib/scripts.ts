import type { Doc } from "@/convex/_generated/dataModel";

type Script = NonNullable<Doc<"publications">["script"]>;

/** Légende à coller sur Instagram : « / » (ancienne notation) devient un vrai retour à la ligne. */
export const legendeACopier = (legende: string) => legende.split(" / ").join("\n").trim();

const sansGuillemets = (texte: string) =>
  texte
    .replace(/[«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Tout le texte de la colonne Voix, dans l'ordre, sans « ».
 * La ligne « Accroche A ou B » est remplacée par l'accroche A, suivie de l'accroche B à part.
 */
export function voixACopier(script: Script): string {
  return (script.plan ?? [])
    .map(({ voix }) => {
      if (/^accroche a ou b$/i.test(voix.trim())) {
        const a = script.accrocheA ? sansGuillemets(script.accrocheA) : "";
        const b = script.accrocheB ? sansGuillemets(script.accrocheB) : "";
        return b ? `${a}\n(ou B : ${b})` : a;
      }
      return sansGuillemets(voix.replace(/^\*\*[AB] :\*\*\s*/, ""));
    })
    .filter(Boolean)
    .join("\n");
}

export const voixStoryACopier = (voix: string) => sansGuillemets(voix);

/** Découpe « **gras** normal » en morceaux, pour afficher le gras des slides. */
export function morceauxGras(texte: string): { texte: string; gras: boolean }[] {
  return texte
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((m) => (m.startsWith("**") && m.endsWith("**") && m.length > 4 ? { texte: m.slice(2, -2), gras: true } : { texte: m, gras: false }));
}

/**
 * Semaine à afficher dans « À tourner cette semaine » : celle qui contient aujourd'hui,
 * sinon la prochaine semaine du mois (avant le début du mois), sinon null (mois terminé).
 */
export function semaineATourner<S extends Pick<Doc<"semaines">, "debut" | "fin">>(semaines: S[], aujourdhui: string) {
  const triees = [...semaines].sort((a, b) => a.debut.localeCompare(b.debut));
  const enCours = triees.find((s) => aujourdhui >= s.debut && aujourdhui <= s.fin);
  if (enCours) return { semaine: enCours, aVenir: false };
  const prochaine = triees.find((s) => s.debut > aujourdhui);
  return prochaine ? { semaine: prochaine, aVenir: true } : null;
}

/** Publications de la semaine au statut « À tourner », et stories avec une voix (conseil face caméra) pas encore publiées. */
export function aTourner(
  semaine: Pick<Doc<"semaines">, "debut" | "fin">,
  publications: Doc<"publications">[],
  stories: Doc<"stories">[],
) {
  const dans = (date: string) => date >= semaine.debut && date <= semaine.fin;
  return {
    publications: publications.filter((p) => dans(p.date) && p.statut === "a-preparer").sort((a, b) => a.date.localeCompare(b.date)),
    stories: stories.filter((s) => dans(s.date) && s.voix && !s.publiee).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
