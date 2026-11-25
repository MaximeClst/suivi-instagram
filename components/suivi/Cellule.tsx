import type { Cellule as C, Ton } from "@/lib/suivi";
import { cn } from "@/lib/utils";

export const TONS: Record<Ton, string> = {
  accent: "text-accent",
  vert: "text-emerald-300",
  rouge: "text-red-400",
};

export const TONS_CHAMP: Record<Ton, string> = {
  accent: "",
  vert: "border-emerald-400/60 bg-emerald-400/10 text-emerald-300",
  rouge: "border-red-500/70 bg-red-500/10 text-red-300",
};

export function Cellule({ cellule }: { cellule: C }) {
  if (cellule.badge)
    return (
      <span
        className={cn(
          "inline-flex rounded px-2 py-0.5 text-xs font-medium",
          cellule.ton === "vert" ? "bg-emerald-400/15 text-emerald-300" : "bg-red-500/15 text-red-400",
        )}
      >
        {cellule.texte}
      </span>
    );
  return <span className={cn("tabular-nums", cellule.ton && TONS[cellule.ton])}>{cellule.texte}</span>;
}

/** Point de départ et objectif d'un indicateur, sous son nom. */
export function DepartObjectif({ depart, objectif }: { depart?: string; objectif?: string }) {
  if (!depart && !objectif) return null;
  return (
    <span className="block text-[11px] text-ink-500">
      {depart && <>Départ {depart}</>}
      {depart && objectif && " · "}
      {objectif && <span className="text-ink-400">objectif {objectif}</span>}
    </span>
  );
}
