"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Copy, FileText, X } from "lucide-react";
import { useState } from "react";
import { TextField } from "@/components/Champs";
import type { Id } from "@/convex/_generated/dataModel";
import { exporterControle } from "@/lib/export";
import { isoDuJour } from "@/lib/format";
import type { MoisData } from "@/lib/hooks/useMois";
import { cn } from "@/lib/utils";

type Props = {
  data: MoisData;
  controle: MoisData["controles"][number];
  onToggle: (id: Id<"controleItems">, coche: boolean) => void;
  onNotes: (notes: string) => void;
};

export function ControleCard({ data, controle, onToggle, onNotes }: Props) {
  const [texte, setTexte] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);
  const faits = controle.items.filter((i) => i.coche).length;
  const total = controle.items.length;
  const passe = controle.date < isoDuJour();

  const copier = async () => {
    if (!texte) return;
    await navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <article className="flex flex-col rounded border border-ink-700 bg-ink-900">
      <header className="border-b border-ink-800 p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl">{controle.titre}</h2>
            <p className="mt-1 text-sm text-ink-400">
              Semaines {controle.semaines[0]} à {controle.semaines.at(-1)}
              {passe && " · passé"}
            </p>
          </div>
          <p className={cn("shrink-0 font-serif text-2xl tabular-nums", faits === total && total > 0 && "text-emerald-300")}>
            {faits}
            <span className="text-base text-ink-400">/{total}</span>
          </p>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-sm bg-ink-700">
          <motion.div
            className="h-full bg-emerald-300"
            animate={{ width: total ? `${(faits / total) * 100}%` : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {controle.alerte && (
          <div role="alert" className="mt-4 flex gap-3 rounded border border-accent/40 bg-accent/10 p-3 text-sm">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent" />
            <p>{controle.alerte}</p>
          </div>
        )}
      </header>

      <ul className="flex-1 divide-y divide-ink-800">
        {controle.items.map((item) => (
          <li key={item._id}>
            <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-ink-800/40 md:px-6">
              <input
                type="checkbox"
                checked={item.coche}
                onChange={(e) => onToggle(item._id, e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent",
                  item.coche ? "border-emerald-300 bg-emerald-300 text-ink" : "border-ink-500",
                )}
              >
                {item.coche && <Check size={14} strokeWidth={3} />}
              </span>
              <span className={cn("text-sm leading-snug", item.coche && "text-ink-400 line-through")}>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-ink-800 p-4 md:p-6">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-ink-400">Notes</span>
          <TextField
            className="mt-1"
            multiline
            rows={4}
            value={controle.notes}
            onCommit={onNotes}
            placeholder="Ce que tu as remarqué, ce qui a été décidé…"
          />
        </label>
        <button
          type="button"
          onClick={() => setTexte(exporterControle(data, controle))}
          className="flex h-11 w-full items-center justify-center gap-2 rounded bg-accent font-medium text-ink transition-opacity hover:opacity-90"
        >
          <FileText size={16} /> Exporter le point de contrôle
        </button>
      </div>

      <AnimatePresence>
        {texte && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
            onClick={() => setTexte(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Export — ${controle.titre}`}
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85dvh] w-full max-w-3xl flex-col rounded border border-ink-700 bg-ink-900"
            >
              <div className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
                <p className="font-serif text-lg">Export — {controle.titre}</p>
                <button
                  type="button"
                  onClick={() => setTexte(null)}
                  aria-label="Fermer"
                  className="grid h-8 w-8 place-items-center rounded text-ink-400 hover:bg-ink-800 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <textarea
                readOnly
                value={texte}
                className="min-h-[50dvh] flex-1 resize-none bg-ink p-4 font-mono text-xs leading-relaxed text-ink-400 outline-none"
              />
              <div className="flex justify-end border-t border-ink-800 p-3">
                <button
                  type="button"
                  onClick={copier}
                  className="flex h-10 items-center gap-2 rounded bg-white px-4 text-sm font-medium text-ink"
                >
                  {copie ? <Check size={16} /> : <Copy size={16} />}
                  {copie ? "Copié" : "Copier le texte"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
