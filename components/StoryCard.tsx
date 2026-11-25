"use client";

import { motion } from "framer-motion";
import { Camera, Check, Image as ImageIcon, Mic, MonitorSmartphone, Pencil, Repeat2, Type, Video } from "lucide-react";
import { useState } from "react";
import { BoutonCopier, NumberField, TextField } from "@/components/Champs";
import { dateCourte } from "@/lib/format";
import type { StoryPatch } from "@/lib/hooks/useMois";
import { voixStoryACopier } from "@/lib/scripts";
import { enRetard, type Story } from "@/lib/stories";
import { cn } from "@/lib/utils";

const VISUELS: Record<Story["visuelType"], { label: string; icon: typeof Camera }> = {
  photo: { label: "Photo", icon: Camera },
  video: { label: "Vidéo courte", icon: Video },
  fond: { label: "Fond uni avec texte", icon: Type },
  capture: { label: "Capture d'écran", icon: MonitorSmartphone },
  partage: { label: "Partage du post du jour", icon: Repeat2 },
};

const STICKERS: Record<Story["sticker"]["type"], string> = {
  sondage: "Sondage",
  question: "Question",
  lien: "Lien",
  mention: "Mention",
  "compte-a-rebours": "Compte à rebours",
  aucun: "Aucun sticker",
};

const libelle = "text-[11px] uppercase tracking-wide text-ink-400";
const select = "mt-1 h-10 w-full rounded border border-ink-700 bg-ink px-2 text-sm outline-none focus:border-accent";

type Props = {
  story: Story;
  aujourdhui: string;
  onChange: (patch: StoryPatch) => void;
  /** Encart « Story du jour » : texte plus grand, pas de date répétée. */
  duJour?: boolean;
};

function Sticker({ sticker }: { sticker: Story["sticker"] }) {
  if (sticker.type === "aucun") return <p className="text-sm text-ink-400">Aucun</p>;
  return (
    <div className="text-sm">
      <p>
        <span className="font-medium">{STICKERS[sticker.type]}</span>
        {sticker.libelle && (sticker.type === "mention" || sticker.type === "compte-a-rebours") && <span className="text-ink-400"> · {sticker.libelle}</span>}
        {sticker.libelle && sticker.type !== "mention" && sticker.type !== "compte-a-rebours" && <span className="text-ink-400"> · « {sticker.libelle} »</span>}
        {sticker.type === "lien" && <span className="text-ink-400"> → {sticker.lien}</span>}
      </p>
      {sticker.type === "sondage" && sticker.reponses.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {sticker.reponses.map((r) => (
            <span key={r} className="rounded border border-ink-700 bg-ink px-2.5 py-1 text-xs">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type StickerT = Story["sticker"];
type Ecran = NonNullable<Story["ecrans"]>[number];

function StickerEdition({ sticker: s, onChange }: { sticker: StickerT; onChange: (sticker: StickerT) => void }) {
  const setSticker = (patch: Partial<StickerT>) => onChange({ ...s, ...patch });
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={libelle}>Sticker</span>
          <select
            className={select}
            value={s.type}
            onChange={(e) => {
              const type = e.target.value as StickerT["type"];
              setSticker({
                type,
                reponses: type === "sondage" ? (s.reponses.length ? s.reponses : ["", ""]) : [],
                lien: type === "lien" ? s.lien || "code-celeste.com/ads" : "",
              });
            }}
          >
            {Object.entries(STICKERS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {s.type === "lien" ? (
          <label className="block">
            <span className={libelle}>Lien</span>
            <TextField className="mt-1" value={s.lien} onCommit={(lien) => setSticker({ lien })} />
          </label>
        ) : (
          s.type !== "aucun" && (
            <label className="block">
              <span className={libelle}>{s.type === "mention" ? "Compte mentionné" : s.type === "compte-a-rebours" ? "Jusqu'à quand" : "Question"}</span>
              <TextField className="mt-1" value={s.libelle} onCommit={(l) => setSticker({ libelle: l })} />
            </label>
          )
        )}
      </div>
      {s.type === "sondage" && (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <label key={i} className="block">
              <span className={libelle}>Réponse {i + 1}</span>
              <TextField
                className="mt-1"
                value={s.reponses[i] ?? ""}
                onCommit={(r) => setSticker({ reponses: [0, 1].map((j) => (j === i ? r : (s.reponses[j] ?? ""))) })}
              />
            </label>
          ))}
        </div>
      )}
    </>
  );
}

function VisuelSelect({ value, onChange }: { value: Story["visuelType"]; onChange: (v: Story["visuelType"]) => void }) {
  return (
    <select className={select} value={value} onChange={(e) => onChange(e.target.value as Story["visuelType"])}>
      {Object.entries(VISUELS).map(([v, info]) => (
        <option key={v} value={v}>
          {info.label}
        </option>
      ))}
    </select>
  );
}

function Edition({ story, onChange }: { story: Story; onChange: (patch: StoryPatch) => void }) {
  const ecrans = story.ecrans;
  const setEcran = (i: number, patch: Partial<Ecran>) =>
    ecrans && onChange({ ecrans: ecrans.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={libelle}>Thème</span>
          <TextField className="mt-1" value={story.theme} onCommit={(theme) => onChange({ theme })} />
        </label>
        {!ecrans && (
          <label className="block">
            <span className={libelle}>Visuel</span>
            <VisuelSelect value={story.visuelType} onChange={(visuelType) => onChange({ visuelType })} />
          </label>
        )}
      </div>
      {ecrans ? (
        ecrans.map((e, i) => (
          <fieldset key={i} className="space-y-3 rounded border border-ink-800 p-3">
            <legend className="px-1 text-xs font-medium text-accent">Écran {i + 1}</legend>
            <label className="block">
              <span className={libelle}>Visuel</span>
              <VisuelSelect value={e.visuelType} onChange={(visuelType) => setEcran(i, { visuelType })} />
            </label>
            <label className="block">
              <span className={libelle}>Consigne du visuel</span>
              <TextField className="mt-1" multiline value={e.visuel} onCommit={(visuel) => setEcran(i, { visuel })} />
            </label>
            <label className="block">
              <span className={libelle}>Texte de l&apos;écran</span>
              <TextField className="mt-1" multiline rows={3} value={e.texte} onCommit={(texte) => setEcran(i, { texte })} />
            </label>
            <StickerEdition sticker={e.sticker} onChange={(sticker) => setEcran(i, { sticker })} />
          </fieldset>
        ))
      ) : (
        <>
          <label className="block">
            <span className={libelle}>Consigne du visuel</span>
            <TextField className="mt-1" value={story.visuel} onCommit={(visuel) => onChange({ visuel })} />
          </label>
          <label className="block">
            <span className={libelle}>Texte de la story</span>
            <TextField className="mt-1" multiline rows={3} value={story.texte} onCommit={(texte) => onChange({ texte })} />
          </label>
          {story.voix !== undefined && (
            <label className="block">
              <span className={libelle}>Voix (face caméra)</span>
              <TextField className="mt-1" multiline rows={4} value={story.voix} onCommit={(voix) => onChange({ voix })} />
            </label>
          )}
          <StickerEdition sticker={story.sticker} onChange={(sticker) => onChange({ sticker })} />
        </>
      )}
      <label className="block">
        <span className={libelle}>Ce que je fais après</span>
        <TextField className="mt-1" multiline value={story.apres} onCommit={(apres) => onChange({ apres })} />
      </label>
    </div>
  );
}

/** Un écran (ou la story entière) : visuel, texte à copier, sticker. */
function Contenu({
  numero,
  visuelType,
  visuel,
  texte,
  sticker,
  grand,
}: {
  numero?: number;
  visuelType: Story["visuelType"];
  visuel: string;
  texte: string;
  sticker: StickerT;
  grand?: boolean;
}) {
  const info = VISUELS[visuelType];
  const Icone = info.icon ?? ImageIcon;
  const n = (i: number) => (numero ? "" : `${i} · `);
  return (
    <div className={cn("space-y-4", numero && "rounded border border-ink-800 p-3")}>
      {numero && <p className="text-xs font-medium text-accent">Écran {numero}</p>}
      <div>
        <p className={libelle}>{n(1)}Visuel à préparer</p>
        <p className="mt-1.5 flex items-start gap-2 text-sm">
          <Icone size={16} className="mt-0.5 shrink-0 text-accent" />
          <span>
            <span className="font-medium">{info.label}</span>
            {visuel && <span className="text-ink-400"> · {visuel}</span>}
          </span>
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className={libelle}>{n(2)}Texte à écrire</p>
          <BoutonCopier texte={texte} />
        </div>
        <p className={cn("mt-1.5 whitespace-pre-line font-serif leading-snug", grand ? "text-2xl" : "text-lg")}>{texte}</p>
      </div>
      <div>
        <p className={libelle}>{n(3)}Sticker</p>
        <div className="mt-1.5">
          <Sticker sticker={sticker} />
        </div>
      </div>
    </div>
  );
}

export function StoryCard({ story, aujourdhui, onChange, duJour }: Props) {
  const [edition, setEdition] = useState(false);
  const retard = enRetard(story, aujourdhui);
  const reponsesLabel =
    story.sticker.type === "sondage" ? "Réponses sondage" : story.sticker.type === "question" ? "Réponses question" : "Réponses";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex flex-col rounded border bg-ink-900 p-4 md:p-5",
        retard ? "border-red-500/60 bg-red-500/[0.04]" : story.publiee ? "border-emerald-400/30" : "border-ink-700",
        duJour && !retard && !story.publiee && "border-accent/50",
        edition && "border-accent/60",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {!duJour && <p className="font-serif text-lg leading-none first-letter:uppercase">{dateCourte(story.date)}</p>}
          <p className={cn("text-sm text-ink-400", !duJour && "mt-1.5")}>{story.theme}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {retard && <span className="rounded bg-red-500/15 px-2 py-1 text-[11px] font-medium text-red-400">Non publiée</span>}
          {story.publiee && (
            <span className="rounded bg-emerald-400/15 px-2 py-1 text-[11px] font-medium text-emerald-300">Publiée</span>
          )}
          <button
            type="button"
            onClick={() => setEdition((e) => !e)}
            aria-label={edition ? "Terminer la modification" : "Modifier la story"}
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
        <Edition story={story} onChange={onChange} />
      ) : (
        <div className="mt-4 flex-1 space-y-4">
          {story.ecrans ? (
            story.ecrans.map((e, i) => <Contenu key={i} numero={i + 1} {...e} grand={duJour} />)
          ) : (
            <Contenu
              visuelType={story.visuelType}
              visuel={story.visuel}
              texte={story.texte}
              sticker={story.sticker}
              grand={duJour}
            />
          )}

          {story.voix && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className={cn(libelle, "flex items-center gap-1.5")}>
                  <Mic size={12} /> Voix ({story.theme.startsWith("FAQ") ? "10–15 s" : "≈ 15 s"})
                </p>
                <BoutonCopier texte={voixStoryACopier(story.voix)} label="Copier la voix" />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed">{story.voix}</p>
            </div>
          )}

          {story.apres && (
            <div>
              <p className={libelle}>{story.ecrans ? "Ensuite" : "4 · Ensuite"}</p>
              <p className="mt-1.5 text-sm leading-relaxed">{story.apres}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 space-y-3 border-t border-ink-800 pt-4">
        <button
          type="button"
          role="switch"
          aria-checked={story.publiee}
          onClick={() => onChange({ publiee: !story.publiee })}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded border text-sm font-medium transition-colors",
            story.publiee
              ? "border-emerald-300 bg-emerald-300 text-ink"
              : "border-ink-700 text-ink-400 hover:border-ink-500 hover:text-white",
          )}
        >
          {story.publiee && <Check size={16} />}
          {story.publiee ? "Publiée" : "Marquer comme publiée"}
        </button>
        {story.client !== undefined && (
          <label className="flex items-center gap-3">
            <span className={cn(libelle, "shrink-0")}>{story.date >= "2026-12" ? "Client montré" : "Client choisi"}</span>
            <TextField
              className="h-10"
              label={`${story.date >= "2026-12" ? "Client montré" : "Client choisi"} · story du ${dateCourte(story.date)}`}
              placeholder="Nom du client"
              value={story.client}
              onCommit={(client) => onChange({ client })}
            />
          </label>
        )}
        {story.ecrans ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {story.ecrans.map((e, i) => (
                <label key={i} className="block min-w-0">
                  <span className={cn(libelle, "block truncate")}>Vues écran {i + 1}</span>
                  <NumberField
                    className="mt-1 h-11 px-2"
                    label={`Vues écran ${i + 1} · story du ${dateCourte(story.date)}`}
                    value={e.vues}
                    onCommit={(vues) =>
                      story.ecrans && onChange({ ecrans: story.ecrans.map((x, j) => (j === i ? { ...x, vues } : x)) })
                    }
                  />
                </label>
              ))}
              <label className="block min-w-0">
                <span className={cn(libelle, "block truncate")} title="Messages reçus">
                  <span className="sm:hidden">Messages</span>
                  <span className="hidden sm:inline">Messages reçus</span>
                </span>
                <NumberField
                  className="mt-1 h-11 px-2"
                  label={`Messages reçus · story du ${dateCourte(story.date)}`}
                  value={story.messagesPrives}
                  onCommit={(messagesPrives) => onChange({ messagesPrives })}
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className={libelle}>Repartage client</span>
              <div className="flex gap-1" role="radiogroup" aria-label="Repartage client">
                {(
                  [
                    [true, "Oui"],
                    [false, "Non"],
                  ] as const
                ).map(([valeur, label]) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={story.repartageClient === valeur}
                    onClick={() => onChange({ repartageClient: story.repartageClient === valeur ? null : valeur })}
                    className={cn(
                      "h-9 w-14 rounded border text-sm transition-colors",
                      story.repartageClient === valeur
                        ? valeur
                          ? "border-emerald-300 bg-emerald-300 text-ink"
                          : "border-ink-400 bg-ink-700 text-white"
                        : "border-ink-700 text-ink-400 hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["vues", "Vues", "Vues"],
              ["reponses", reponsesLabel, "Réponses"],
              ["messagesPrives", "Messages reçus", "Messages"],
            ] as const
          ).map(([cle, label, court]) => (
            <label key={cle} className="block min-w-0">
              <span className={cn(libelle, "block truncate")} title={label}>
                <span className="sm:hidden">{court}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              <NumberField
                className="mt-1 h-11 px-2"
                label={`${label} · story du ${dateCourte(story.date)}`}
                value={story[cle]}
                onCommit={(v) => onChange({ [cle]: v })}
              />
            </label>
          ))}
        </div>
        )}
      </div>
    </motion.article>
  );
}
