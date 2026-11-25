"use client";

import { Clapperboard } from "lucide-react";
import { PublicationCard } from "@/components/PublicationCard";
import { ReelCard } from "@/components/ReelsEssaiSection";
import type { Id } from "@/convex/_generated/dataModel";
import { dateCourte, plage } from "@/lib/format";
import type { PublicationPatch, ReelEssaiPatch } from "@/lib/hooks/useMois";
import { messages, suitLesMessages } from "@/lib/publications";
import { jourDeTournage, type SemaineAvecElements } from "@/lib/semaines";
import { cn } from "@/lib/utils";

type Props = {
  groupe: SemaineAvecElements;
  onChange: (id: Id<"publications">, patch: PublicationPatch) => void;
  onRemove: (id: Id<"publications">) => void;
  onOpen: (id: Id<"publications">) => void;
  onChangeReel: (id: Id<"reelsEssai">, patch: ReelEssaiPatch) => void;
  /** Reel d'essai en tête du classement (badge). */
  reelEnTete?: Id<"reelsEssai">;
};

export function SemaineSection({ groupe: { semaine, elements }, onChange, onRemove, onOpen, onChangeReel, reelEnTete }: Props) {
  const publications = elements.flatMap((e) => (e.type === "publication" ? [e.publication] : []));
  const reels = elements.flatMap((e) => (e.type === "reel" ? [e.reel] : []));
  const publiees = publications.filter((p) => p.statut === "publie").length;
  const projet = publications.reduce((total, p) => total + messages(p), 0);
  const unite = suitLesMessages(publications) ? (projet > 1 ? "messages" : "message") : "PROJET";
  const complete = publications.length > 0 && publiees === publications.length;
  const reelsDiffuses = reels.filter((r) => r.statut !== "a-preparer").length;
  const titre = semaine ? `Semaine ${semaine.code.replace("S", "")}` : "Hors semaines";

  return (
    <section aria-label={titre}>
      <div className="sticky top-14 z-10 -mx-4 border-b border-ink-800 bg-ink/90 px-4 py-3 backdrop-blur md:top-16 md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-serif text-xl md:text-2xl">{titre}</h2>
            {semaine && <span className="text-xs text-ink-400 md:text-sm">{plage(semaine.debut, semaine.fin)}</span>}
            {semaine && (
              <span className="flex items-center gap-1.5 text-xs text-ink-500">
                <Clapperboard size={13} />
                Tournage {dateCourte(jourDeTournage(semaine))}
                {semaine.tournage && ` · 2 h, les ${publications.length} publications`}
              </span>
            )}
          </div>
          <p className="text-xs tabular-nums text-ink-400 md:text-sm">
            {publications.length > 0 && (
              <>
                <span className={cn(complete && "text-emerald-300")}>
                  {publiees}/{publications.length} publiées
                </span>
                <span className="text-ink-500"> · </span>
                <span className={cn(projet > 0 && "text-accent")}>{projet} {unite}</span>
              </>
            )}
            {reels.length > 0 && (
              <>
                {publications.length > 0 && <span className="text-ink-500"> · </span>}
                <span className="text-fuchsia-300">
                  {reelsDiffuses}/{reels.length} Reel{reels.length > 1 ? "s" : ""} d&apos;essai
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {elements.map((e) =>
          e.type === "publication" ? (
            <PublicationCard
              key={e.publication._id}
              publication={e.publication}
              onChange={(patch) => onChange(e.publication._id, patch)}
              onRemove={() => onRemove(e.publication._id)}
              onOpen={() => onOpen(e.publication._id)}
            />
          ) : (
            <ReelCard
              key={e.reel._id}
              reel={e.reel}
              enTete={e.reel._id === reelEnTete}
              onChange={(patch) => onChangeReel(e.reel._id, patch)}
            />
          ),
        )}
      </div>
    </section>
  );
}
