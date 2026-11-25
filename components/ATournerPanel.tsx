"use client";

import { Clapperboard, Mic } from "lucide-react";
import { BoutonCopier } from "@/components/Champs";
import { BoutonFermer, FicheScript, InfosPublication, Volet } from "@/components/ScriptPanel";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { dateCourte, isoDuJour, plage } from "@/lib/format";
import type { Publication, Script } from "@/lib/hooks/useMois";
import { aTourner, semaineATourner, voixStoryACopier } from "@/lib/scripts";
import { jourDeTournage } from "@/lib/semaines";

type Props = {
  ouvert: boolean;
  onClose: () => void;
  semaines: Doc<"semaines">[];
  publications: Publication[];
  stories: Doc<"stories">[];
  onScript: (id: Id<"publications">, script: Script) => void;
};

/** Session de tournage : les scripts de la semaine en cours encore « À tourner », l'un sous l'autre. */
export function ATournerPanel({ ouvert, onClose, semaines, publications, stories, onScript }: Props) {
  const choix = semaineATourner(semaines, isoDuJour());
  const elements = choix ? aTourner(choix.semaine, publications, stories) : null;
  const vide = !elements || elements.publications.length + elements.stories.length === 0;

  return (
    <Volet ouvert={ouvert} onClose={onClose} label="À tourner cette semaine">
      <header className="border-b border-ink-800 px-4 pb-4 pt-4 md:px-8 md:pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl leading-tight md:text-3xl">À tourner cette semaine</h2>
            {choix && (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400">
                <span>
                  Semaine {choix.semaine.code.replace("S", "")} · {plage(choix.semaine.debut, choix.semaine.fin)}
                  {choix.aVenir && " (à venir)"}
                </span>
                <span className="flex items-center gap-1.5 text-ink-500">
                  <Clapperboard size={13} /> Tournage {dateCourte(jourDeTournage(choix.semaine))}
                </span>
              </p>
            )}
          </div>
          <BoutonFermer onClose={onClose} label="Fermer « À tourner cette semaine »" />
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
        {vide && (
          <p className="rounded border border-dashed border-ink-700 p-6 text-center text-sm text-ink-400">
            {choix ? "Rien d'autre à tourner cette semaine." : "Le mois est terminé."}
          </p>
        )}

        {elements?.publications.map((p) => (
          <article key={p._id} className="space-y-4 rounded border border-ink-700 bg-ink-900/40 p-4 md:p-5">
            <InfosPublication publication={p} tournage={choix ? jourDeTournage(choix.semaine) : undefined} />
            <h3 className="font-serif text-xl leading-tight md:text-2xl">{p.script?.titre ?? p.accroche}</h3>
            <FicheScript publication={p} onScript={(s) => onScript(p._id, s)} />
          </article>
        ))}

        {elements?.stories.map((s) => (
          <article key={s._id} className="space-y-4 rounded border border-ink-700 bg-ink-900/40 p-4 md:p-5">
            <div>
              <p className="font-serif text-lg first-letter:uppercase">{dateCourte(s.date)}</p>
              <p className="mt-1 text-sm text-ink-400">Story · {s.theme}</p>
            </div>
            <ScriptStory story={s} />
          </article>
        ))}
      </div>
    </Volet>
  );
}

const STICKERS: Record<Doc<"stories">["sticker"]["type"], string> = {
  sondage: "Sondage",
  question: "Question",
  lien: "Lien",
  mention: "Mention",
  "compte-a-rebours": "Compte à rebours",
  aucun: "Aucun",
};

/** Script d'une story face caméra : texte à l'écran, voix, sticker. */
export function ScriptStory({ story }: { story: Doc<"stories"> }) {
  const libelle = "text-[11px] uppercase tracking-wide text-ink-400";
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className={libelle}>Texte à l&apos;écran</p>
        <p className="mt-1.5 font-serif text-xl leading-snug">{story.texte}</p>
      </div>
      {story.voix && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className={`${libelle} flex items-center gap-1.5`}>
              <Mic size={12} /> Voix
            </p>
            <BoutonCopier texte={voixStoryACopier(story.voix)} label="Copier la voix" />
          </div>
          <p className="mt-1.5 leading-relaxed">{story.voix}</p>
        </div>
      )}
      {story.sticker.type !== "aucun" && (
        <div>
          <p className={libelle}>Sticker</p>
          <p className="mt-1.5">
            {STICKERS[story.sticker.type]}
            {story.sticker.libelle &&
              (story.sticker.type === "question" || story.sticker.type === "sondage" ? <> · « {story.sticker.libelle} »</> : <> · {story.sticker.libelle}</>)}
          </p>
        </div>
      )}
      {story.visuel && <p className="text-ink-400">{story.visuel}</p>}
      {story.apres && <p className="text-ink-400">Ensuite : {story.apres}</p>}
    </div>
  );
}
