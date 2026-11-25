"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { AlertTriangle, ChevronDown, Users } from "lucide-react";
import { useAcces } from "@/components/Providers";
import { api } from "@/convex/_generated/api";
import { dateCourte } from "@/lib/format";
import { DELAI_JOURS, PLANNING_SAMEDI, CONTENUS_NOVEMBRE, rotation } from "@/lib/rotation";
import { cn } from "@/lib/utils";

/** Encart du calendrier (décembre et après) : chaque client, ses dates, l'alerte des 30 jours et l'accord. */
export function RotationClients() {
  const token = useAcces();
  const { data } = useQuery(convexQuery(api.rotation.liste, { token }));
  const setAccord = useMutation(api.rotation.setAccord);
  if (!data) return null;

  const lignes = rotation([...CONTENUS_NOVEMBRE, ...data.publications, ...data.stories]);
  const alertes = lignes.filter((l) => l.alerte).length;

  return (
    <details open={alertes > 0} className="group rounded border border-ink-700 bg-ink-800/40">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3 md:px-4 [&::-webkit-details-marker]:hidden">
        <Users size={18} className="shrink-0 text-accent" />
        <span className="flex-1">
          <span className="block text-sm font-medium text-white">Rotation des clients</span>
          <span className="block text-xs text-ink-400">
            {lignes.length} clients montrés ·{" "}
            {alertes ? (
              <span className="text-red-400">
                {alertes} en alerte (moins de {DELAI_JOURS} jours)
              </span>
            ) : (
              `aucun client deux fois en moins de ${DELAI_JOURS} jours`
            )}
          </span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-ink-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-4 border-t border-ink-700 p-3 md:px-4">
        <p className="text-xs text-ink-400">
          <span className="font-medium text-ink-300">Routine du samedi :</span> {PLANNING_SAMEDI}
        </p>

        <ul className="space-y-3">
          {lignes.map((l) => (
            <li
              key={l.client}
              className={cn("rounded border p-3", l.alerte ? "border-red-500/60 bg-red-500/10" : "border-ink-700")}
            >
              <p className={cn("flex items-center gap-2 text-sm font-medium", l.alerte ? "text-red-300" : "text-white")}>
                {l.alerte && <AlertTriangle size={15} className="shrink-0" />}
                {l.client}
              </p>
              {l.alerte && (
                <p className="mt-0.5 text-xs text-red-300">Montré deux fois en moins de {DELAI_JOURS} jours</p>
              )}
              <ul className="mt-2 space-y-2">
                {l.apparitions.map((a) => {
                  const accord = data.accords[a.cle];
                  return (
                    <li key={a.cle + a.contenu} className="flex flex-wrap items-center justify-between gap-2">
                      <span className={cn("min-w-0 text-sm", a.alerte ? "text-red-300" : "text-ink-300")}>
                        <span className="font-medium">{dateCourte(a.date)}</span>{" "}
                        <span className="text-ink-400">· {a.contenu}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-ink-400">Accord obtenu</span>
                        <span className="flex gap-1" role="radiogroup" aria-label={`Accord obtenu · ${l.client} · ${dateCourte(a.date)}`}>
                          {(
                            [
                              [true, "Oui"],
                              [false, "Non"],
                            ] as const
                          ).map(([valeur, label]) => (
                            <button
                              key={label}
                              type="button"
                              role="radio"
                              aria-checked={accord === valeur}
                              onClick={() => setAccord({ token, cle: a.cle, accord: valeur })}
                              className={cn(
                                "h-9 w-12 rounded border text-sm transition-colors",
                                accord === valeur
                                  ? valeur
                                    ? "border-emerald-300 bg-emerald-300 text-ink"
                                    : "border-ink-400 bg-ink-700 text-white"
                                  : "border-ink-700 text-ink-400 hover:text-white",
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-500">
          Novembre compte dans les {DELAI_JOURS} jours. Le plan B et le collage du 30/12 ne sont pas comptés.
        </p>
      </div>
    </details>
  );
}
