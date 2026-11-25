"use client";

import { TextField } from "@/components/Champs";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Props = {
  regles: Doc<"regles">[];
  actives: Set<string>;
  onUpdate: (id: Id<"regles">, patch: { probleme?: string; action?: string }) => void;
};

/** Règles de décision : le diagnostic et l'action sont modifiables, la condition est calculée. */
export function ReglesListe({ regles, actives, onUpdate }: Props) {
  return (
    <section aria-labelledby="regles-titre" className="space-y-3">
      <div>
        <h2 id="regles-titre" className="font-serif text-2xl">Règles de décision</h2>
        <p className="mt-1 text-sm text-ink-400">
          Un indicateur « stagne » s&apos;il ne monte pas (égal ou en baisse) deux semaines de suite.
        </p>
      </div>

      <div className="divide-y divide-ink-800 rounded border border-ink-700 bg-ink-900">
        {regles.map((r) => {
          const active = actives.has(r._id);
          return (
            <div key={r._id} className="grid gap-3 p-4 lg:grid-cols-[1fr_1fr_1.4fr] lg:items-start">
              <p className={cn("flex items-start gap-2 text-sm", active ? "text-accent" : "text-white")}>
                <span
                  className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", active ? "bg-accent" : "bg-ink-700")}
                  aria-label={active ? "Active" : "Inactive"}
                />
                {r.conditionLabel}
              </p>
              <TextField label="Problème" value={r.probleme} onCommit={(probleme) => onUpdate(r._id, { probleme })} />
              <TextField label="Action" multiline value={r.action} onCommit={(action) => onUpdate(r._id, { action })} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
