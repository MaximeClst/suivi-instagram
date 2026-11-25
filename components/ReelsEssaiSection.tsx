"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Trophy } from "lucide-react";
import { BoutonCopier, NumberField } from "@/components/Champs";
import { InstagramResume } from "@/components/Instagram";
import type { Id } from "@/convex/_generated/dataModel";
import { dateCourte, nombre } from "@/lib/format";
import type { ReelEssaiPatch } from "@/lib/hooks/useMois";
import { classer, rappels, type ReelEssai } from "@/lib/reelsEssai";
import { cn } from "@/lib/utils";

const STATUTS: { value: ReelEssai["statut"]; label: string; active: string }[] = [
  { value: "a-preparer", label: "À préparer", active: "bg-white text-ink" },
  { value: "publie", label: "Publié", active: "bg-emerald-300 text-ink" },
  { value: "partage", label: "Partagé à tous", active: "bg-fuchsia-300 text-ink" },
];

const libelle = "text-[11px] uppercase tracking-wide text-ink-400";

type Props = {
  reels: ReelEssai[];
  onChange: (id: Id<"reelsEssai">, patch: ReelEssaiPatch) => void;
};

export function ReelCard({ reel, enTete, onChange }: { reel: ReelEssai; enTete: boolean; onChange: (p: ReelEssaiPatch) => void }) {
  return (
    <article
      className={cn(
        "flex flex-col rounded border border-ink-700 bg-ink-900 p-4 md:p-5",
        reel.statut === "publie" && "border-emerald-400/30",
        reel.statut === "partage" && "border-fuchsia-400/40",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <p className="font-serif text-lg leading-none first-letter:uppercase">{dateCourte(reel.date)}</p>
        <div className="flex shrink-0 items-center gap-1">
          {enTete && (
            <span className="flex items-center gap-1 rounded bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent">
              <Trophy size={12} /> En tête
            </span>
          )}
          <span className="rounded bg-fuchsia-400/15 px-2 py-1 text-[11px] font-medium text-fuchsia-300">Reel d&apos;essai</span>
        </div>
      </header>
      <p className="mt-2 text-xs text-ink-400">
        Trial Reel photo + texte <span className="text-ink-500">·</span> n° {reel.numero}{" "}
        <span className="text-ink-500">·</span> {reel.heure.replace(":", " h ")} <span className="text-ink-500">·</span> CTA
        abonnement
      </p>
      <h3 className="mt-3 font-serif text-xl leading-snug">{reel.nom}</h3>
      <p className="mt-2 truncate font-mono text-[11px] text-ink-500">{reel.fichier}</p>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded border border-ink-700 p-1" role="radiogroup" aria-label="Statut">
        {STATUTS.map((s) => (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={reel.statut === s.value}
            onClick={() => onChange({ statut: s.value })}
            className={cn(
              "rounded px-1 py-2 text-[11px] font-medium leading-tight transition-colors",
              reel.statut === s.value ? s.active : "text-ink-400 hover:bg-ink-800 hover:text-white",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {(
          [
            ["abonnes", "Abonnés gagnés", "Abonnés"],
            ["visitesProfil", "Visites du profil", "Visites"],
            ["vues48h", "Vues à 48 h", "Vues 48 h"],
          ] as const
        ).map(([cle, label, court]) => (
          <label key={cle} className="block min-w-0">
            <span className={cn(libelle, "block truncate")}>
              <span className="sm:hidden">{court}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
            <NumberField
              className="mt-1 h-11 px-2"
              label={`${label} · Reel ${reel.numero}`}
              value={reel[cle]}
              onCommit={(v) => onChange({ [cle]: v })}
            />
          </label>
        ))}
      </div>

      <InstagramResume lien={reel.instagram} reelEssai={reel._id} />

      <details className="group mt-4 rounded border border-ink-800">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs text-ink-400 hover:text-white">
          <span className="group-open:hidden">Voir la légende, la couverture et la musique</span>
          <span className="hidden group-open:inline">Masquer</span>
        </summary>
        <div className="space-y-3 border-t border-ink-800 p-3 text-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className={libelle}>Légende</span>
              <BoutonCopier className="h-7 px-2" texte={reel.legende} />
            </div>
            <p className="mt-1 whitespace-pre-line leading-relaxed">{reel.legende}</p>
          </div>
          <p>
            <span className={libelle}>Couverture · </span>
            {reel.couverture}
          </p>
          <p>
            <span className={libelle}>Musique (dans Instagram) · </span>
            {reel.musique}
          </p>
        </div>
      </details>
    </article>
  );
}

/** Reels d'essai « photo + texte » : catégorie à part, CTA abonnement, mesurés aux abonnés gagnés. */
export function ReelsEssaiSection({ reels, onChange }: Props) {
  if (reels.length === 0) return null;
  const classement = classer(reels);
  const enTete = classement[0];
  const aTraiter = rappels(reels, Date.now());
  const publies = reels.filter((r) => r.statut !== "a-preparer").length;

  return (
    <section aria-labelledby="reels-essai-titre" className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="reels-essai-titre" className="font-serif text-2xl md:text-3xl">
              Reels d&apos;essai
            </h2>
            <span className="rounded bg-fuchsia-400/15 px-2 py-1 text-[11px] font-medium text-fuchsia-300">
              Trial Reel · CTA abonnement
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-ink-400">
            Photo + texte, mardi et jeudi à 18 h 30. Vus seulement par des non-abonnés. Ils sont rangés par date dans
            les semaines ci-dessous et ne comptent ni dans les publications ni dans les PROJET.
          </p>
        </div>
        <p className="text-sm tabular-nums text-ink-400">
          {publies}/{reels.length} diffusés
        </p>
      </div>

      <AnimatePresence initial={false}>
        {aTraiter.map((r) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div role="status" className="flex flex-col gap-3 rounded border border-accent/40 bg-accent/10 p-3 md:flex-row md:items-center md:px-4">
              <BellRing size={18} className="shrink-0 text-accent" />
              <div className="flex-1 text-sm">
                <p className="font-medium">
                  48 h depuis le Reel {r.numero} · {r.nom} : compare et partage le meilleur à tous.
                </p>
                <p className="mt-0.5 text-ink-400">
                  {enTete
                    ? `En tête : Reel ${enTete.numero} · ${enTete.nom} (${nombre(enTete.abonnes)} abonnés gagnés).`
                    : "Saisis les abonnés gagnés pour voir le meilleur."}{" "}
                  Utilise « Partager à tous » dans Instagram, ne le republie jamais.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(r._id, { comparaisonFaite: true })}
                className="h-9 shrink-0 rounded bg-white px-3 text-sm font-medium text-ink"
              >
                C&apos;est fait
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {classement.length > 0 && (
        <div className="rounded border border-ink-700 bg-ink-900">
          <p className={cn(libelle, "border-b border-ink-800 px-4 py-2")}>Classement par abonnés gagnés</p>
          <ol className="divide-y divide-ink-800">
            {classement.map((r, i) => (
              <li key={r._id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className={cn("w-5 font-serif text-lg tabular-nums", i === 0 ? "text-accent" : "text-ink-500")}>{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  Reel {r.numero} · {r.nom}
                  {r.statut === "partage" && <span className="ml-2 text-xs text-fuchsia-300">partagé à tous</span>}
                </span>
                <span className="tabular-nums">
                  <span className="font-medium">{nombre(r.abonnes)}</span>
                  <span className="text-ink-500"> abonnés</span>
                </span>
                <span className="hidden w-28 text-right tabular-nums text-ink-400 sm:inline">{nombre(r.visitesProfil)} visites</span>
                <span className="hidden w-24 text-right tabular-nums text-ink-400 sm:inline">{nombre(r.vues48h)} vues</span>
              </li>
            ))}
          </ol>
        </div>
      )}

    </section>
  );
}
