"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StoryCard } from "@/components/StoryCard";
import type { Id } from "@/convex/_generated/dataModel";
import { dateCourte, isoDuJour } from "@/lib/format";
import type { StoryPatch } from "@/lib/hooks/useMois";
import { storiesDuJour, type Story } from "@/lib/stories";

type Props = {
  stories: Story[];
  onChange: (id: Id<"stories">, patch: StoryPatch) => void;
  /** Sur l'accueil : lien vers la page Stories. */
  lienStories?: boolean;
};

/** Encart « Story du jour » : affiché seulement si une story est prévue aujourd'hui. */
export function StoryDuJour({ stories, onChange, lienStories }: Props) {
  const mois = useSearchParams().get("mois");
  const aujourdhui = isoDuJour();
  const duJour = storiesDuJour(stories, aujourdhui);
  if (duJour.length === 0) return null;

  return (
    <section aria-labelledby="story-du-jour" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="story-du-jour" className="flex items-baseline gap-2 font-serif text-2xl">
          Story du jour
          <span className="font-sans text-sm text-ink-400 first-letter:uppercase">{dateCourte(aujourdhui)}</span>
        </h2>
        {lienStories && (
          <Link
            href={`/stories${mois ? `?mois=${mois}` : ""}`}
            className="flex shrink-0 items-center gap-1 text-sm text-ink-400 hover:text-accent"
          >
            Toutes <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className={duJour.length > 1 ? "grid gap-3 md:grid-cols-2" : "md:max-w-2xl"}>
        {duJour.map((story) => (
          <StoryCard key={story._id} story={story} aujourdhui={aujourdhui} duJour onChange={(patch) => onChange(story._id, patch)} />
        ))}
      </div>
    </section>
  );
}
