"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Alerte } from "@/lib/regles";

export const AVERTISSEMENT =
  "Une seule chose à changer à la fois. Moins de 10 prospects pub par mois = écart non significatif, ne pas conclure.";
export const AVERTISSEMENT_DECEMBRE = "Une seule chose à changer à la fois.";

export function Alertes({
  alertes,
  semaine,
  avertissement = AVERTISSEMENT,
}: {
  alertes: Alerte[];
  semaine: string | null;
  avertissement?: string;
}) {
  return (
    <section aria-labelledby="alertes-titre" className="space-y-3">
      <h2 id="alertes-titre" className="flex items-baseline gap-2 font-serif text-2xl">
        Alertes
        <span className="font-sans text-sm text-ink-400">
          {semaine ? `d'après la semaine ${semaine}` : "aucune donnée saisie"}
        </span>
      </h2>

      <div className="grid gap-3 md:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {alertes.length === 0 && (
            <motion.div
              key="aucune"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded border border-ink-700 bg-ink-900 p-4 text-sm text-ink-400 md:col-span-2"
            >
              <CheckCircle2 size={18} className="text-emerald-300" />
              Aucune règle déclenchée pour l&apos;instant.
            </motion.div>
          )}
          {alertes.map(({ regle }) => (
            <motion.article
              key={regle._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded border border-accent/40 bg-accent/10 p-4"
            >
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-accent">
                <AlertTriangle size={14} /> {regle.conditionLabel}
              </p>
              <p className="mt-2 font-medium">Problème : {regle.probleme}</p>
              <p className="mt-1 text-sm text-ink-400">→ {regle.action}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-sm text-ink-400">{avertissement}</p>
    </section>
  );
}
