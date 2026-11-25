"use client";

import { NumberField } from "@/components/Champs";
import type { Publication } from "@/lib/hooks/useMois";
import { estReel } from "@/lib/publications";
import { cn } from "@/lib/utils";

type R = NonNullable<Publication["resultats"]>;


/** Durée de vue moyenne : rouge sous 5 s, vert à 7 s ou plus. */
export const couleurDuree = (s: number | null | undefined) =>
  s === null || s === undefined ? undefined : s < 5 ? "rouge" : s >= 7 ? "vert" : undefined;

const CHAMPS: { cle: keyof R; label: string; court: string; reelSeulement?: boolean }[] = [
  { cle: "vues", label: "Vues", court: "Vues" },
  { cle: "nonAbonnes", label: "Non-abonnés (%)", court: "Non-abo. %" },
  { cle: "dureeVue", label: "Durée de vue moy. (s)", court: "Durée (s)", reelSeulement: true },
  { cle: "partages", label: "Partages", court: "Partages" },
  { cle: "enregistrements", label: "Enregistrements", court: "Enreg." },
  { cle: "messages", label: "Messages reçus", court: "Messages" },
];

const libelle = "text-[11px] uppercase tracking-wide text-ink-400";

/** Résultats d'une publication ; Reel avec Trial : versions A et B côte à côte. */
export function Resultats({
  publication,
  onChange,
}: {
  publication: Publication;
  onChange: (patch: { resultats?: R; resultatsB?: R }) => void;
}) {
  const a = publication.resultats;
  if (!a) return null;
  const b = publication.resultatsB;
  const reel = estReel(publication);
  const champs = CHAMPS.filter((c) => reel || !c.reelSeulement);
  const versions = [
    { nom: "A", valeurs: a, set: (r: R) => onChange({ resultats: r }) },
    ...(b ? [{ nom: "B · Trial", valeurs: b, set: (r: R) => onChange({ resultatsB: r }) }] : []),
  ];

  return (
    <div className="mt-3">
      <div className={cn("grid items-center gap-x-2 gap-y-1.5", b ? "grid-cols-[1fr_5.5rem_5.5rem]" : "grid-cols-[1fr_7rem]")}>
        <span className={libelle}>Résultats</span>
        {versions.map((v) => (
          <span key={v.nom} className={cn(libelle, "text-right", v.nom !== "A" && "text-fuchsia-300")}>
            {b ? v.nom : ""}
          </span>
        ))}
        {champs.map((c) => (
          <Ligne key={c.cle} label={c.label} court={c.court}>
            {versions.map((v) => {
              const valeur = v.valeurs[c.cle];
              const couleur = c.cle === "dureeVue" ? couleurDuree(valeur) : undefined;
              return (
                <NumberField
                  key={v.nom}
                  className={cn(
                    "h-10 px-2 text-right",
                    couleur === "rouge" && "border-red-500/70 bg-red-500/10 text-red-300",
                    couleur === "vert" && "border-emerald-400/60 bg-emerald-400/10 text-emerald-300",
                  )}
                  label={`${c.label} · version ${v.nom}`}
                  value={valeur}
                  onCommit={(x) => v.set({ ...v.valeurs, [c.cle]: x })}
                />
              );
            })}
          </Ligne>
        ))}
      </div>
    </div>
  );
}

function Ligne({ label, court, children }: { label: string; court: string; children: React.ReactNode }) {
  return (
    <>
      <span className="truncate text-xs text-ink-400" title={label}>
        <span className="sm:hidden">{court}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
      {children}
    </>
  );
}
