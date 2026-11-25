"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";
import { PageTitre } from "@/components/Champs";
import { isoDuJour, jjmm, nombre } from "@/lib/format";
import type { Publication } from "@/lib/hooks/useMois";
import { messages, prevues, suitLesMessages, vues as vuesDe } from "@/lib/publications";
import { cn } from "@/lib/utils";

const SEGMENT: Record<Publication["statut"], string> = {
  "a-preparer": "bg-ink-700",
  tourne: "bg-sky-300",
  publie: "bg-emerald-300",
  reporte: "bg-ink-500",
};

const JOUR = 86_400_000;

/** Le carrousel avis clients dépend d'avis écrits reçus une semaine avant sa date. */
function rappelAvis(publications: Publication[]) {
  const avis = publications.find((p) => /avis clients/i.test(p.format));
  if (!avis || avis.statut === "tourne" || avis.statut === "publie") return null;
  const deadline = new Date(Date.parse(avis.date) - 7 * JOUR).toISOString().slice(0, 10);
  const jours = Math.round((Date.parse(deadline) - Date.parse(isoDuJour())) / JOUR);
  return { deadline, jours };
}

function Stat({ valeur, total, label, accent }: { valeur: string; total?: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded border border-ink-700 bg-ink-900 px-4 py-3">
      <p className="flex items-baseline gap-1.5">
        <span className={cn("font-serif text-3xl tabular-nums md:text-4xl", accent && "text-accent")}>{valeur}</span>
        {total && <span className="text-sm text-ink-400">/ {total}</span>}
      </p>
      <p className="mt-1 text-xs text-ink-400">{label}</p>
    </div>
  );
}

export function CalendrierHeader({ mois, publications }: { mois: string; publications: Publication[] }) {
  const publiees = publications.filter((p) => p.statut === "publie").length;
  const projet = publications.reduce((t, p) => t + messages(p), 0);
  const vues = publications.reduce((t, p) => t + vuesDe(p), 0);
  const parMessages = suitLesMessages(publications);
  const rappel = rappelAvis(publications);
  const triees = [...publications].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <header className="space-y-5">
      <PageTitre surtitre={mois} titre="Calendrier">
        <div className="grid grid-cols-3 gap-2 md:w-[28rem] md:gap-3">
          <Stat valeur={String(publiees)} total={String(prevues(publications).length)} label="publiées" />
          <Stat valeur={String(projet)} label={parMessages ? "messages reçus" : "PROJET reçus"} accent={projet > 0} />
          <Stat valeur={nombre(vues)} label={parMessages ? "vues" : "vues à 48 h"} />
        </div>
      </PageTitre>

      <div className="flex gap-1" aria-hidden>
        {triees.map((p) => (
          <motion.span key={p._id} layout className={cn("h-1.5 flex-1 rounded-sm transition-colors", SEGMENT[p.statut])} />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {rappel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div role="status" className="flex items-start gap-3 rounded border border-accent/40 bg-accent/10 p-3 md:items-center md:px-4">
              <MessageSquareQuote size={18} className="mt-0.5 shrink-0 text-accent md:mt-0" />
              <div className="text-sm md:flex md:flex-1 md:items-center md:justify-between md:gap-4">
                <p className="font-medium">Avis clients à recevoir avant le {jjmm(rappel.deadline)}</p>
                <p className="mt-0.5 text-ink-400 md:mt-0">
                  {rappel.jours > 0
                    ? `Encore ${rappel.jours} jour${rappel.jours > 1 ? "s" : ""}`
                    : rappel.jours === 0
                      ? "C'est aujourd'hui"
                      : "Échéance passée : prévoir le plan B du carrousel"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
