import { tendance, type Valeurs } from "@/lib/regles";
import { cn } from "@/lib/utils";

/** Flèche ↑ ↓ → par rapport à la semaine précédente. Pour le coût par prospect, baisser est bon. */
export function Tendance({ valeurs, k, i }: { valeurs: Valeurs; k: string; i: number }) {
  const t = tendance(valeurs, k, i);
  if (!t) return <span className="w-3" aria-hidden />;
  const inverse = k === "ad_cost_per_lead";
  const bon = t === "→" ? null : (t === "↑") !== inverse;
  return (
    <span
      title={t === "↑" ? "En hausse" : t === "↓" ? "En baisse" : "Stable"}
      className={cn("w-3 text-center text-xs", bon === null ? "text-ink-400" : bon ? "text-emerald-300" : "text-accent")}
    >
      {t}
    </span>
  );
}

export function Objectif({ valeur }: { valeur: number | null }) {
  if (valeur === null) return <span className="text-xs text-ink-500">–</span>;
  const ok = valeur >= 1;
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-xs font-medium",
        ok ? "bg-emerald-400/15 text-emerald-300" : "bg-red-500/15 text-red-400",
      )}
    >
      {ok ? "Atteint" : "Non atteint"}
    </span>
  );
}
