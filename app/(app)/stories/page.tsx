"use client";

import { Chargement, PageTitre } from "@/components/Champs";
import { StoryCard } from "@/components/StoryCard";
import { StoryDuJour } from "@/components/StoryDuJour";
import { isoDuJour, plage } from "@/lib/format";
import { useMoisData, useMutations } from "@/lib/hooks/useMois";
import { enRetard, parDate, statsSemaine } from "@/lib/stories";
import { cn } from "@/lib/utils";

export default function StoriesPage() {
  const { data } = useMoisData();
  const { updateStory } = useMutations();

  if (!data) return <Chargement />;

  const aujourdhui = isoDuJour();
  const { semaines } = data;
  const stories = [...data.stories].sort(parDate);
  const publiees = stories.filter((s) => s.publiee).length;
  const messages = stories.reduce((t, s) => t + (s.messagesPrives ?? 0), 0);
  const retards = stories.filter((s) => enRetard(s, aujourdhui)).length;
  const horsSemaines = stories.filter((s) => !semaines.some((sem) => s.date >= sem.debut && s.date <= sem.fin));

  return (
    <main className="space-y-10">
      <PageTitre surtitre={data.mois.label} titre="Stories">
        <p className="text-sm tabular-nums text-ink-400 md:text-right">
          {publiees}/{stories.length} publiées · <span className={cn(messages > 0 && "text-accent")}>{messages} messages reçus</span>
          {retards > 0 && <span className="text-red-400"> · {retards} en retard</span>}
        </p>
      </PageTitre>

      {stories.length === 0 && (
        <p className="rounded border border-dashed border-ink-700 p-8 text-center text-sm text-ink-400">
          Aucune story prévue pour ce mois.
        </p>
      )}

      <StoryDuJour stories={stories} onChange={updateStory} />

      {semaines.map((semaine) => {
        const liste = stories.filter((s) => s.date >= semaine.debut && s.date <= semaine.fin);
        const stats = statsSemaine(stories, semaine);
        if (!stats) return null;
        return (
          <section key={semaine._id} aria-label={`Semaine ${semaine.code}`}>
            <div className="sticky top-14 z-10 -mx-4 border-b border-ink-800 bg-ink/90 px-4 py-3 backdrop-blur md:top-16 md:-mx-8 md:px-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-serif text-xl md:text-2xl">Semaine {semaine.code.replace("S", "")}</h2>
                  <span className="text-xs text-ink-400 md:text-sm">{plage(semaine.debut, semaine.fin)}</span>
                </div>
                <p className="text-xs tabular-nums text-ink-400 md:text-sm">
                  <span className={cn(stats.publiees === stats.total && "text-emerald-300")}>
                    {stats.publiees}/{stats.total} publiées
                  </span>
                  <span className="text-ink-500"> · </span>
                  <span className={cn(stats.messages > 0 && "text-accent")}>{stats.messages} messages reçus</span>
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
              {liste.map((s) => (
                <StoryCard key={s._id} story={s} aujourdhui={aujourdhui} onChange={(patch) => updateStory(s._id, patch)} />
              ))}
            </div>
          </section>
        );
      })}

      {horsSemaines.length > 0 && (
        <section aria-label="Fin du mois">
          <div className="sticky top-14 z-10 -mx-4 border-b border-ink-800 bg-ink/90 px-4 py-3 backdrop-blur md:top-16 md:-mx-8 md:px-8">
            <h2 className="font-serif text-xl md:text-2xl">Fin du mois</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {horsSemaines.map((s) => (
              <StoryCard key={s._id} story={s} aujourdhui={aujourdhui} onChange={(patch) => updateStory(s._id, patch)} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
