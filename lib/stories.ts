import type { Doc } from "@/convex/_generated/dataModel";

export type Story = Doc<"stories">;

/** Date passée et pas publiée : affichée en rouge. */
export const enRetard = (story: Story, aujourdhui: string) => story.date < aujourdhui && !story.publiee;

/** Ordre d'affichage : date, puis `ordre` (0 avant, 1 ou absent = la story du jour, 2 après). */
export const parDate = (a: Pick<Story, "date" | "ordre">, b: Pick<Story, "date" | "ordre">) =>
  a.date.localeCompare(b.date) || (a.ordre ?? 1) - (b.ordre ?? 1);

/** Stories prévues aujourd'hui (parfois deux, ex. concours de Noël), dans l'ordre de publication. */
export const storiesDuJour = (stories: Story[], aujourdhui: string) => stories.filter((s) => s.date === aujourdhui).sort(parDate);

export const storyDuJour = (stories: Story[], aujourdhui: string) => storiesDuJour(stories, aujourdhui)[0] ?? null;

/** Indicateurs de la semaine : stories publiées (sur le nombre prévu, 7 ou plus) et messages privés reçus. null si aucune story prévue. */
export function statsSemaine(stories: Story[], semaine: Pick<Doc<"semaines">, "debut" | "fin">) {
  const dansLaSemaine = stories.filter((s) => s.date >= semaine.debut && s.date <= semaine.fin);
  if (dansLaSemaine.length === 0) return null;
  return {
    publiees: dansLaSemaine.filter((s) => s.publiee).length,
    total: dansLaSemaine.length,
    messages: dansLaSemaine.reduce((total, s) => total + (s.messagesPrives ?? 0), 0),
  };
}
