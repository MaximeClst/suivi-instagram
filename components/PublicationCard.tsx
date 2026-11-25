"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, FileText, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { NumberField, TextField } from "@/components/Champs";
import { InstagramResume, LienInstagramChamps } from "@/components/Instagram";
import { Resultats } from "@/components/Resultats";
import { dateCourte } from "@/lib/format";
import { libelleCta } from "@/lib/publications";
import type { Publication, PublicationPatch } from "@/lib/hooks/useMois";
import { cn } from "@/lib/utils";

type Pilier = Publication["pilier"];
type Statut = Publication["statut"];

export const PILIERS: Record<Pilier, { label: string; className: string }> = {
  "prise-de-conscience": { label: "Prise de conscience", className: "bg-accent/15 text-accent" },
  objections: { label: "Objections", className: "bg-sky-400/15 text-sky-300" },
  preuves: { label: "Preuves", className: "bg-emerald-400/15 text-emerald-300" },
  "personal-brand": { label: "Personal brand", className: "bg-violet-400/15 text-violet-300" },
};

const STATUTS: { value: Statut; label: string; active: string }[] = [
  { value: "a-preparer", label: "À tourner", active: "bg-white text-ink" },
  { value: "tourne", label: "Tourné", active: "bg-sky-300 text-ink" },
  { value: "publie", label: "Publié", active: "bg-emerald-300 text-ink" },
  { value: "reporte", label: "Reporté", active: "bg-ink-500 text-white" },
];

const libelle = "text-[11px] uppercase tracking-wide text-ink-400";

type Props = {
  publication: Publication;
  onChange: (patch: PublicationPatch) => void;
  onRemove: () => void;
  onOpen: () => void;
};

export function PublicationCard({ publication, onChange, onRemove, onOpen }: Props) {
  const [edition, setEdition] = useState(false);
  const pilier = PILIERS[publication.pilier];
  const projet = publication.projetRecus ?? 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex flex-col rounded border border-ink-700 bg-ink-900 p-4 md:p-5",
        publication.statut === "publie" && "border-emerald-400/30",
        publication.statut === "reporte" && "opacity-60",
        edition && "border-accent/60",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <p className="font-serif text-lg leading-none first-letter:uppercase">
          {dateCourte(publication.date)}
          {publication.heure && (
            <span className="ml-2 font-sans text-xs text-ink-400">{publication.heure.replace(":", " h ")}</span>
          )}
        </p>
        <div className="flex items-center gap-1">
          <span className={cn("shrink-0 rounded px-2 py-1 text-[11px] font-medium", pilier.className)}>{pilier.label}</span>
          <button
            type="button"
            onClick={() => setEdition((e) => !e)}
            aria-label={edition ? "Terminer la modification" : "Modifier la publication"}
            aria-pressed={edition}
            className={cn(
              "grid h-7 w-7 place-items-center rounded text-ink-400 hover:bg-ink-800 hover:text-white",
              edition && "bg-accent text-ink hover:bg-accent hover:text-ink",
            )}
          >
            {edition ? <Check size={14} /> : <Pencil size={13} />}
          </button>
        </div>
      </header>

      {edition ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={libelle}>Date</span>
              <input
                type="date"
                value={publication.date}
                onChange={(e) => e.target.value && onChange({ date: e.target.value })}
                className="mt-1 h-10 w-full rounded border border-ink-700 bg-ink px-2 text-sm outline-none [color-scheme:dark] focus:border-accent"
              />
            </label>
            <label className="block">
              <span className={libelle}>Pilier</span>
              <select
                value={publication.pilier}
                onChange={(e) => onChange({ pilier: e.target.value as Pilier })}
                className="mt-1 h-10 w-full rounded border border-ink-700 bg-ink px-2 text-sm outline-none focus:border-accent"
              >
                {Object.entries(PILIERS).map(([value, p]) => (
                  <option key={value} value={value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className={libelle}>Format</span>
            <TextField className="mt-1" value={publication.format} onCommit={(format) => onChange({ format })} />
          </label>
          <label className="block">
            <span className={libelle}>Métier</span>
            <TextField className="mt-1" value={publication.metier} onCommit={(metier) => onChange({ metier })} />
          </label>
          {publication.clientMontre !== undefined && (
            <label className="block">
              <span className={libelle}>Client montré</span>
              <TextField
                className="mt-1"
                placeholder="Aucun"
                value={publication.clientMontre}
                onCommit={(clientMontre) => onChange({ clientMontre })}
              />
            </label>
          )}
          <label className="block">
            <span className={libelle}>Accroche{publication.accrocheB !== undefined ? " A" : ""}</span>
            <TextField className="mt-1" multiline value={publication.accroche} onCommit={(accroche) => onChange({ accroche })} />
          </label>
          {publication.accrocheB !== undefined && (
            <label className="block">
              <span className={libelle}>Accroche B (Trial Reel)</span>
              <TextField className="mt-1" multiline value={publication.accrocheB} onCommit={(accrocheB) => onChange({ accrocheB })} />
            </label>
          )}
          {publication.cta && (
            <label className="block">
              <span className={libelle}>Appel à l&apos;action</span>
              <select
                value={publication.cta}
                onChange={(e) => onChange({ cta: e.target.value as NonNullable<Publication["cta"]> })}
                className="mt-1 h-10 w-full rounded border border-ink-700 bg-ink px-2 text-sm outline-none focus:border-accent"
              >
                <option value="PROJET">{libelleCta("PROJET", publication.mois)}</option>
                <option value="Mini-audit">{libelleCta("Mini-audit", publication.mois)}</option>
              </select>
            </label>
          )}
          <LienInstagramChamps publication={publication} />
          <button
            type="button"
            onClick={() => window.confirm("Supprimer cette publication ?") && onRemove()}
            className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-accent"
          >
            <Trash2 size={13} /> Supprimer la publication
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="group -mx-2 mt-1 flex flex-1 flex-col rounded px-2 pb-1 pt-1 text-left transition-colors hover:bg-ink-800/60"
        >
          <span className="text-xs text-ink-400">
            {publication.format} <span className="text-ink-500">·</span> {publication.metier}
          </span>
          <span className="mt-3 flex-1 font-serif text-xl leading-snug text-white">{publication.accroche}</span>
          {publication.clientMontre && (
            <span className="mt-2 text-xs text-ink-400">
              Client montré : <span className="text-ink-300">{publication.clientMontre}</span>
            </span>
          )}
          {publication.accrocheB && (
            <span className="mt-2 text-sm leading-snug text-ink-400">
              <span className="mr-1.5 rounded bg-fuchsia-400/15 px-1.5 py-0.5 text-[11px] font-medium text-fuchsia-300">B</span>
              {publication.accrocheB}
            </span>
          )}
          {publication.cta && (
            <span className="mt-2 text-xs text-ink-400">
              Appel à l&apos;action :{" "}
              <span className={publication.cta === "PROJET" ? "text-accent" : "text-sky-300"}>{libelleCta(publication.cta, publication.mois)}</span>
            </span>
          )}
          <span className="mt-3 flex items-center gap-1.5 text-xs text-ink-400 transition-colors group-hover:text-accent">
            <FileText size={13} />
            {publication.script ? "Voir le script et le plan à tourner" : "Pas encore de script"}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      )}

      <div className="mt-4 grid grid-cols-4 gap-1 rounded border border-ink-700 p-1" role="radiogroup" aria-label="Statut">
        {STATUTS.map((s) => {
          const selected = publication.statut === s.value;
          return (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ statut: s.value })}
              className={cn(
                "rounded py-2 text-[11px] font-medium transition-colors",
                selected ? s.active : "text-ink-400 hover:bg-ink-800 hover:text-white",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {publication.resultats ? (
        <Resultats publication={publication} onChange={onChange} />
      ) : (
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className={libelle}>Vues à 48 h</span>
          <NumberField
            className="mt-1 h-11"
            label="Vues à 48 h"
            value={publication.vues48h}
            onCommit={(vues48h) => onChange({ vues48h })}
          />
        </label>

        <div>
          <span className={libelle}>PROJET reçus</span>
          <div className="mt-1 flex h-11 items-center rounded border border-ink-700 bg-ink">
            <button
              type="button"
              aria-label="Retirer un PROJET"
              disabled={projet === 0}
              onClick={() => onChange({ projetRecus: projet - 1 })}
              className="grid h-full w-11 place-items-center text-ink-400 hover:text-white disabled:opacity-30"
            >
              <Minus size={16} />
            </button>
            <span className={cn("flex-1 text-center text-base tabular-nums", projet > 0 && "text-accent")}>{projet}</span>
            <button
              type="button"
              aria-label="Ajouter un PROJET"
              onClick={() => onChange({ projetRecus: projet + 1 })}
              className="grid h-full w-11 place-items-center text-ink-400 hover:text-white"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      )}

      <InstagramResume lien={publication.instagram} publication={publication._id} />
    </motion.article>
  );
}
