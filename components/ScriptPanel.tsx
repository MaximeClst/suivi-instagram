"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Clapperboard, NotebookPen, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { BoutonCopier, TextField } from "@/components/Champs";
import { PILIERS } from "@/components/PublicationCard";
import { dateCourte } from "@/lib/format";
import { libelleCta } from "@/lib/publications";
import type { Publication, Script } from "@/lib/hooks/useMois";
import { legendeACopier, morceauxGras, voixACopier } from "@/lib/scripts";
import { cn } from "@/lib/utils";

const REGLES_REELS = [
  "Sous-titres incrustés (la majorité regarde sans le son)",
  "Concurrents floutés",
  "Texte à l'écran en gros, dans le tiers du milieu",
  "Délai à l'écran : « en ligne en 7 jours dès que j'ai tes photos et tes infos »",
];

const libelle = "text-[11px] uppercase tracking-wide text-ink-400";

/** Dimanche précédant la publication : soir de tournage de la semaine (novembre). */
function dimancheAvant(iso: string) {
  const ms = Date.parse(iso);
  const jour = new Date(ms).getUTCDay();
  return new Date(ms - (jour === 0 ? 7 : jour) * 86_400_000).toISOString().slice(0, 10);
}

function Section({ titre, action, children }: { titre: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className={libelle}>{titre}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Texte avec le gras « **…** » des slides. */
export function TexteGras({ texte }: { texte: string }) {
  return (
    <>
      {morceauxGras(texte).map((m, i) =>
        m.gras ? (
          <strong key={i} className="font-semibold text-white">
            {m.texte}
          </strong>
        ) : (
          <span key={i}>{m.texte}</span>
        ),
      )}
    </>
  );
}

type PanelProps = {
  publication: Publication | null;
  onClose: () => void;
  onScript: (script: Script) => void;
  /** Décembre : jour de tournage de la semaine (sinon le dimanche précédent). */
  tournage?: string;
};

export function ScriptPanel({ publication, onClose, onScript, tournage }: PanelProps) {
  return (
    <Volet ouvert={!!publication} onClose={onClose} label={publication?.script?.titre ?? "Script"}>
      {publication && (
        <>
          <EnTete publication={publication} tournage={tournage} onClose={onClose} />
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <FicheScript publication={publication} onScript={onScript} />
          </div>
        </>
      )}
    </Volet>
  );
}

/** Volet plein écran sur téléphone, à droite sur ordinateur. */
export function Volet({
  ouvert,
  onClose,
  label,
  children,
}: {
  ouvert: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [ouvert, onClose]);

  return (
    <AnimatePresence>
      {ouvert && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/60"
          onClick={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-ink-700 bg-ink md:max-w-2xl xl:max-w-3xl"
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BoutonFermer({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded text-ink-400 hover:bg-ink-800 hover:text-white"
    >
      <X size={18} />
    </button>
  );
}

/** Date, pilier, format, métier, appel à l'action. */
export function InfosPublication({ publication, tournage }: { publication: Publication; tournage?: string }) {
  const pilier = PILIERS[publication.pilier];
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-serif text-lg first-letter:uppercase">{dateCourte(publication.date)}</p>
        {publication.heure && <span className="text-xs text-ink-400">{publication.heure.replace(":", " h ")}</span>}
        <span className={cn("rounded px-2 py-1 text-[11px] font-medium", pilier.className)}>{pilier.label}</span>
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400">
        <span>
          {publication.format} <span className="text-ink-500">·</span> {publication.metier}
        </span>
        {publication.cta && (
          <span>
            Appel à l&apos;action :{" "}
            <span className={publication.cta === "PROJET" ? "text-accent" : "text-sky-300"}>{libelleCta(publication.cta, publication.mois)}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5 text-ink-500">
          <Clapperboard size={13} /> À tourner {dateCourte(tournage ?? dimancheAvant(publication.date))}
        </span>
      </p>
    </div>
  );
}

function EnTete({ publication, tournage, onClose }: { publication: Publication; tournage?: string; onClose: () => void }) {
  return (
    <header className="border-b border-ink-800 px-4 pb-4 pt-4 md:px-8 md:pt-6">
      <div className="flex items-start justify-between gap-3">
        <InfosPublication publication={publication} tournage={tournage} />
        <BoutonFermer onClose={onClose} label="Fermer le script" />
      </div>
      <h2 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">{publication.script?.titre ?? publication.accroche}</h2>
    </header>
  );
}

/** Contenu du script : lecture, avec un mode modification. */
export function FicheScript({ publication, onScript }: { publication: Publication; onScript: (script: Script) => void }) {
  const [edition, setEdition] = useState(false);
  const { script } = publication;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEdition((e) => !e)}
          aria-pressed={edition}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded border px-3 text-xs transition-colors",
            edition ? "border-accent bg-accent text-ink" : "border-ink-700 text-ink-400 hover:border-ink-500 hover:text-white",
          )}
        >
          {edition ? <Check size={14} /> : <Pencil size={13} />}
          {edition ? "Terminer" : script ? "Modifier le script" : "Écrire un script"}
        </button>
      </div>
      {edition ? (
        <EditionScript script={script ?? { titre: publication.accroche }} estReel={/reel/i.test(publication.format)} onScript={onScript} />
      ) : (
        <Lecture publication={publication} />
      )}
    </div>
  );
}

function Lecture({ publication }: { publication: Publication }) {
  const { script } = publication;
  const estReel = /reel/i.test(publication.format);
  const decembre = !!publication.cta;

  if (!script)
    return (
      <p className="rounded border border-dashed border-ink-700 p-6 text-center text-sm text-ink-400">
        Pas encore de script pour cette publication.
      </p>
    );

  return (
    <div className="space-y-8">
      {script.avantDePublier && (
        <div className="flex gap-3 rounded border border-accent/40 bg-accent/10 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent" />
          <p>
            <span className="font-medium">Avant de publier : </span>
            {script.avantDePublier}
          </p>
        </div>
      )}

      {script.consignes && decembre && (
        <div className="rounded border border-sky-300/30 bg-sky-300/[0.06] p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-sky-300">
            <NotebookPen size={13} /> Notes
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{script.consignes}</p>
        </div>
      )}

      {(script.accrocheA || script.accrocheB) && (
        <Section titre={script.accrocheB ? "Accroches" : "Accroche"}>
          <div className="grid gap-3 md:grid-cols-2">
            {script.accrocheA && (
              <div className="rounded border border-ink-700 bg-ink-900 p-4">
                <p className="text-xs font-medium text-accent">Accroche A{script.accrocheB ? " · publiée en normal" : ""}</p>
                <p className="mt-2 font-serif text-lg leading-snug">« {script.accrocheA} »</p>
              </div>
            )}
            {script.accrocheB && (
              <div className="rounded border border-fuchsia-400/30 bg-ink-900 p-4">
                <p className="text-xs font-medium text-fuchsia-300">Accroche B · Trial Reel</p>
                <p className="mt-2 font-serif text-lg leading-snug">« {script.accrocheB} »</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {script.plan && script.plan.length > 0 && (
        <Section titre={script.titrePlan ?? "Plan à tourner"} action={<BoutonCopier texte={voixACopier(script)} label="Copier la voix" />}>
          <TableauPlan plan={script.plan} decembre={decembre} />
        </Section>
      )}

      {script.slides && script.slides.length > 0 && (
        <Section titre={`Slides (${script.slides.length})`}>
          <ol className="space-y-2">
            {script.slides.map((s, i) => (
              <li key={i} className="flex gap-3 rounded border border-ink-700 bg-ink-900 p-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-ink-800 text-xs tabular-nums text-ink-400">
                  {i + 1}
                </span>
                <span className="leading-relaxed">
                  <TexteGras texte={s} />
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {script.consignes && !decembre && (
        <Section titre="Consignes">
          <p className="whitespace-pre-line text-sm leading-relaxed">{script.consignes}</p>
        </Section>
      )}

      {script.planB && (
        <Section titre="Plan B">
          <p className="rounded border border-ink-700 p-3 text-sm leading-relaxed text-ink-400">{script.planB}</p>
        </Section>
      )}

      {script.couverture && (
        <Section titre="Couverture">
          <p className="font-serif text-xl">{script.couverture}</p>
        </Section>
      )}

      {script.legende && (
        <Section titre={script.planAlternatif ? "Légende · plan A" : "Légende"} action={<BoutonCopier texte={legendeACopier(script.legende)} label="Copier la légende" />}>
          <p className="whitespace-pre-line rounded border border-ink-700 bg-ink-900 p-4 text-sm leading-relaxed">
            {legendeACopier(script.legende)}
          </p>
        </Section>
      )}

      {script.planAlternatif && (
        <div className="space-y-6 border-t border-dashed border-ink-700 pt-8">
          <Section
            titre={script.planAlternatif.titre}
            action={<BoutonCopier texte={voixACopier({ ...script, plan: script.planAlternatif.plan })} label="Copier la voix" />}
          >
            <TableauPlan plan={script.planAlternatif.plan} decembre={decembre} />
          </Section>
          {script.planAlternatif.legende && (
            <Section
              titre="Légende · plan B"
              action={<BoutonCopier texte={legendeACopier(script.planAlternatif.legende)} label="Copier la légende" />}
            >
              <p className="whitespace-pre-line rounded border border-ink-700 bg-ink-900 p-4 text-sm leading-relaxed">
                {legendeACopier(script.planAlternatif.legende)}
              </p>
            </Section>
          )}
        </div>
      )}

      {estReel && (
        <Section titre="Règles communes des Reels">
          <ul className="space-y-1.5 text-sm text-ink-400">
            {REGLES_REELS.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-500" />
                {r}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

type LignePlan = NonNullable<Script["plan"]>[number];

/** Temps / Image / Voix : tableau sur ordinateur, blocs empilés sur téléphone. */
function TableauPlan({ plan, decembre }: { plan: LignePlan[]; decembre: boolean }) {
  const image = decembre ? "Image" : "Écran";
  return (
    <>
      <table className="hidden w-full border-collapse text-sm md:table">
        <thead>
          <tr className="text-left text-xs text-ink-400">
            <th className="w-20 border-b border-ink-800 py-2 pr-3 font-normal">Temps</th>
            <th className="border-b border-ink-800 px-3 py-2 font-normal">{image}</th>
            <th className="border-b border-ink-800 py-2 pl-3 font-normal">Voix</th>
          </tr>
        </thead>
        <tbody>
          {plan.map((l, i) => (
            <tr key={i} className="align-top">
              <td className="border-b border-ink-800 py-3 pr-3 font-medium tabular-nums text-accent">{l.temps}</td>
              <td className="border-b border-ink-800 px-3 py-3 text-ink-400">{l.ecran}</td>
              <td className="border-b border-ink-800 py-3 pl-3">{l.voix}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ol className="space-y-2 md:hidden">
        {plan.map((l, i) => (
          <li key={i} className="rounded border border-ink-700 bg-ink-900 p-3 text-sm">
            <p className="font-medium tabular-nums text-accent">{l.temps}</p>
            <p className="mt-1.5 text-ink-400">
              <span className="text-[11px] uppercase tracking-wide text-ink-500">{image} · </span>
              {l.ecran}
            </p>
            <p className="mt-1.5">
              <span className="text-[11px] uppercase tracking-wide text-ink-500">Voix · </span>
              {l.voix}
            </p>
          </li>
        ))}
      </ol>
    </>
  );
}

/** Lignes d'un plan, modifiables. */
function EditeurPlan({ plan, onChange, legende }: { plan: LignePlan[]; onChange: (plan: LignePlan[]) => void; legende: string }) {
  const setLigne = (i: number, patch: Partial<LignePlan>) => onChange(plan.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <fieldset className="space-y-3">
      <legend className={libelle}>{legende}</legend>
      {plan.map((l, i) => (
        <div key={i} className="space-y-2 rounded border border-ink-800 p-3">
          <div className="flex items-center gap-2">
            <TextField className="h-10 w-28" label={`Temps, ligne ${i + 1}`} value={l.temps} onCommit={(temps) => setLigne(i, { temps })} />
            <button
              type="button"
              onClick={() => window.confirm("Supprimer cette ligne ?") && onChange(plan.filter((_, j) => j !== i))}
              aria-label={`Supprimer la ligne ${i + 1}`}
              className="ml-auto grid h-9 w-9 place-items-center rounded text-ink-400 hover:bg-ink-800 hover:text-accent"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <TextField multiline label={`Image, ligne ${i + 1}`} placeholder="Image" value={l.ecran} onCommit={(ecran) => setLigne(i, { ecran })} />
          <TextField multiline label={`Voix, ligne ${i + 1}`} placeholder="Voix" value={l.voix} onCommit={(voix) => setLigne(i, { voix })} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...plan, { temps: "", ecran: "", voix: "" }])}
        className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-white"
      >
        <Plus size={14} /> Ajouter une ligne
      </button>
    </fieldset>
  );
}

/** Champ texte facultatif : vide = champ retiré du script. */
const facultatif = (texte: string) => (texte.trim() ? texte : undefined);

function EditionScript({ script, estReel, onScript }: { script: Script; estReel: boolean; onScript: (script: Script) => void }) {
  const maj = (patch: Partial<Script>) => onScript({ ...script, ...patch });
  const plan = script.plan ?? [];

  const champ = (label: string, cle: "titre" | "consignes" | "avantDePublier" | "accrocheA" | "accrocheB" | "couverture" | "legende" | "planB", rows?: number) => (
    <label className="block">
      <span className={libelle}>{label}</span>
      <TextField
        className="mt-1"
        multiline={rows !== undefined}
        rows={rows}
        value={script[cle] ?? ""}
        onCommit={(v) => maj({ [cle]: cle === "titre" ? v : facultatif(v) })}
      />
    </label>
  );

  return (
    <div className="space-y-4">
      {champ("Titre", "titre")}
      {champ("Avant de publier (alerte)", "avantDePublier", 2)}
      {estReel && champ("Accroche A", "accrocheA", 2)}
      {estReel && champ("Accroche B (Trial Reel, vide = pas de B)", "accrocheB", 2)}

      {(estReel || plan.length > 0) && (
        <EditeurPlan plan={plan} onChange={(p) => maj({ plan: p })} legende={`${script.titrePlan ?? "Plan"} : temps / image / voix`} />
      )}

      {(!estReel || script.slides) && (
        <label className="block">
          <span className={libelle}>Slides (une par ligne, **gras** possible)</span>
          <TextField
            className="mt-1"
            multiline
            rows={8}
            value={(script.slides ?? []).join("\n")}
            onCommit={(v) => {
              const slides = v.split("\n").map((s) => s.trim()).filter(Boolean);
              maj({ slides: slides.length ? slides : undefined });
            }}
          />
        </label>
      )}

      {champ(estReel ? "Notes de préparation" : "Consignes", "consignes", 4)}
      {champ("Couverture", "couverture")}
      {champ("Légende (un retour à la ligne = une ligne sur Instagram)", "legende", 6)}

      {script.planAlternatif && (
        <div className="space-y-4 border-t border-dashed border-ink-700 pt-4">
          <EditeurPlan
            plan={script.planAlternatif.plan}
            onChange={(p) => maj({ planAlternatif: { ...script.planAlternatif!, plan: p } })}
            legende={`${script.planAlternatif.titre} : temps / image / voix`}
          />
          <label className="block">
            <span className={libelle}>Légende · {script.planAlternatif.titre}</span>
            <TextField
              className="mt-1"
              multiline
              rows={5}
              value={script.planAlternatif.legende ?? ""}
              onCommit={(v) => maj({ planAlternatif: { ...script.planAlternatif!, legende: facultatif(v) } })}
            />
          </label>
        </div>
      )}
    </div>
  );
}
