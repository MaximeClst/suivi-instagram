"use client";

import { Clapperboard } from "lucide-react";
import { dateCourte, isoDuJour } from "@/lib/format";
import type { MoisData } from "@/lib/hooks/useMois";
import { cn } from "@/lib/utils";

const JOUR = 86_400_000;

/** Prochain tournage de la semaine (mardi) dans les 6 jours, ou aujourd'hui. */
export function prochainTournage(semaines: MoisData["semaines"], aujourdhui: string) {
  const limite = new Date(Date.parse(aujourdhui) + 6 * JOUR).toISOString().slice(0, 10);
  return semaines.map((s) => s.tournage).find((t): t is string => !!t && t >= aujourdhui && t <= limite) ?? null;
}

function Bandeau({ icone: Icone, titre, detail, lien }: { icone: typeof Clapperboard; titre: string; detail: string; lien?: React.ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded border border-accent/40 bg-accent/10 p-3 md:items-center md:px-4">
      <Icone size={18} className="mt-0.5 shrink-0 text-accent md:mt-0" />
      <div className="flex-1 text-sm md:flex md:items-center md:justify-between md:gap-4">
        <p className="font-medium">{titre}</p>
        <p className="mt-0.5 text-ink-400 md:mt-0">
          {detail} {lien}
        </p>
      </div>
    </div>
  );
}

/** Rappels du mois : tournage du mardi. */
export function Rappels({ data, className }: { data: MoisData; className?: string }) {
  const aujourdhui = isoDuJour();
  const tournage = prochainTournage(data.semaines, aujourdhui);
  if (!tournage) return null;
  const semaine = data.semaines.find((s) => s.tournage === tournage);
  const nb = semaine ? data.publications.filter((p) => p.date >= semaine.debut && p.date <= semaine.fin).length : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <Bandeau
        icone={Clapperboard}
        titre={tournage === aujourdhui ? "Tournage de la semaine aujourd'hui" : `Tournage de la semaine : ${dateCourte(tournage)}`}
        detail={`2 h, les ${nb} publications de la semaine.`}
      />
    </div>
  );
}
