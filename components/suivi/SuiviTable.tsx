"use client";

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

const cellule = "border-b border-ink-800 px-2 py-2 align-middle";

/** Vue tableau indicateurs × semaines (desktop, tablette et téléphone en paysage). */
export function SuiviTable({ data, valeurs, courante, onSet }: Props) {
  const { semaines, indicateurs } = data;
  const colonne = (i: number) => cn(i === courante && "bg-accent/[0.04]");

  return (
    <div className="overflow-x-auto rounded border border-ink-700 bg-ink-900">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="text-left">
            <th className={cn(cellule, "sticky left-0 z-10 w-[34%] bg-ink-900 pl-4 font-normal text-ink-400")}>Indicateur</th>
            {semaines.map((s, i) => (
              <th key={s._id} className={cn(cellule, colonne(i), "font-normal", i === courante && "border-t-2 border-t-accent")}>
                <span className="block font-serif text-base text-white">{s.code}</span>
                <span className="block text-[11px] text-ink-400">{plage(s.debut, s.fin)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {indicateurs.map((ind) => (
            <tr key={ind.key} className="hover:bg-ink-800/40">
              <th scope="row" className={cn(cellule, "sticky left-0 z-10 bg-ink-900 pl-4 text-left font-normal")}>
                <span className="block text-white">{ind.label}</span>
                <span className="block text-[11px] text-ink-500">{ind.source}</span>
                <DepartObjectif depart={ind.depart} objectif={ind.objectif} />
              </th>
              {semaines.map((s, i) => {
                const valeur = valeurs[ind.key]?.[i] ?? null;
                const ton = tonSaisie(ind.key, valeur);
                return (
                  <td key={s._id} className={cn(cellule, colonne(i))}>
                    <div className="flex items-center gap-1.5">
                      <NumberField
                        className={cn("h-9 text-right", ton && TONS_CHAMP[ton])}
                        label={`${ind.label} ${s.code}`}
                        value={valeur}
                        onCommit={(v) => onSet(s._id, ind.key, v)}
                      />
                      <Tendance valeurs={valeurs} k={ind.key} i={i} />
                    </div>
                    <MesureInstagram
                      mesure={data.mesures.find((m) => m.semaineId === s._id && m.indicateurKey === ind.key)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}

          {lignesCalculees(data, valeurs).map((ligne) => (
            <tr key={ligne.label} className="bg-ink/40">
              <th scope="row" className={cn(cellule, "sticky left-0 z-10 bg-ink-900 pl-4 text-left font-normal text-ink-400")}>
                {ligne.label}
                <DepartObjectif depart={ligne.depart} objectif={ligne.objectif} />
              </th>
              {ligne.cellules.map((c, i) => (
                <td key={semaines[i]._id} className={cn(cellule, colonne(i), "pr-6 text-right")}>
                  <Cellule cellule={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
