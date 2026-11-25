"use client";

import { useState } from "react";
import { NumberField } from "@/components/Champs";
import { MesureInstagram } from "@/components/Instagram";
import { Cellule, DepartObjectif, TONS_CHAMP } from "@/components/suivi/Cellule";
import { Tendance } from "@/components/suivi/Tendance";
import type { Id } from "@/convex/_generated/dataModel";
import { plage } from "@/lib/format";
import type { MoisData } from "@/lib/hooks/useMois";
import type { Valeurs } from "@/lib/regles";
import { lignesCalculees, tonSaisie } from "@/lib/suivi";
import { cn } from "@/lib/utils";

type Props = {
  data: MoisData;
  valeurs: Valeurs;
  courante: number;
  onSet: (semaineId: Id<"semaines">, key: string, valeur: number | null) => void;
};

/** Vue téléphone (portrait) : une carte par semaine, avec un formulaire de saisie. */
export function SuiviSemaineCard({ data, valeurs, courante, onSet }: Props) {
  const [i, setI] = useState(Math.max(courante, 0));
  const semaine = data.semaines[i];
  if (!semaine) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-flow-col gap-1 rounded border border-ink-700 p-1" role="tablist" aria-label="Semaine">
        {data.semaines.map((s, j) => (
          <button
            key={s._id}
            type="button"
            role="tab"
            aria-selected={i === j}
            onClick={() => setI(j)}
            className={cn("rounded py-2 text-sm", i === j ? "bg-white text-ink" : "text-ink-400")}
          >
            {s.code}
          </button>
        ))}
      </div>

      <section className="rounded border border-ink-700 bg-ink-900 p-4">
        <header className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl">{semaine.code}</h2>
          <span className="text-xs text-ink-400">{plage(semaine.debut, semaine.fin)}</span>
        </header>

        <div className="mt-4 space-y-3">
          {data.indicateurs.map((ind) => {
            const valeur = valeurs[ind.key]?.[i] ?? null;
            const ton = tonSaisie(ind.key, valeur);
            return (
              <label key={ind.key} className="grid grid-cols-[1fr_6.5rem_0.75rem] items-center gap-2">
                <span className="text-sm leading-tight">
                  {ind.label}
                  <span className="block text-[11px] text-ink-500">{ind.source}</span>
                  <DepartObjectif depart={ind.depart} objectif={ind.objectif} />
                </span>
                <span>
                  <NumberField
                    className={cn("text-right", ton && TONS_CHAMP[ton])}
                    label={ind.label}
                    value={valeur}
                    onCommit={(v) => onSet(semaine._id, ind.key, v)}
                  />
                  <MesureInstagram
                    mesure={data.mesures.find((m) => m.semaineId === semaine._id && m.indicateurKey === ind.key)}
                  />
                </span>
                <Tendance valeurs={valeurs} k={ind.key} i={i} />
              </label>
            );
          })}
        </div>

        <dl className="mt-5 space-y-2.5 border-t border-ink-800 pt-4 text-sm">
          {lignesCalculees(data, valeurs).map((ligne) => (
            <div key={ligne.label} className="flex items-start justify-between gap-3">
              <dt className="text-ink-400">
                {ligne.label}
                <DepartObjectif depart={ligne.depart} objectif={ligne.objectif} />
              </dt>
              <dd className="shrink-0 text-right">
                <Cellule cellule={ligne.cellules[i]} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
