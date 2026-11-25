"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useAction, useMutation } from "convex/react";
import { AlertTriangle, ChevronDown, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { TextField } from "@/components/Champs";
import { useAcces } from "@/components/Providers";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { jjmm, nombre } from "@/lib/format";
import { cn } from "@/lib/utils";

type LienIg = NonNullable<Doc<"publications">["instagram"]>;
type StatsIg = NonNullable<LienIg["statsA"]>;

const libelle = "text-[11px] uppercase tracking-wide text-ink-400";

const heureReunion = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Indian/Reunion",
});

const NOMS_CHAMPS: Record<string, string> = {
  vues48h: "Vues à 48 h",
  vues: "Vues",
  dureeVue: "Durée de vue (s)",
  partages: "Partages",
  enregistrements: "Enregistrements",
};
const nomChamp = (champ: string) => {
  const [v, k] = champ.includes("-") ? champ.split("-") : ["", champ];
  return `${NOMS_CHAMPS[k] ?? k}${v ? ` (${v === "B" ? "B · Trial" : "A"})` : ""}`;
};

/** Bouton « Mettre à jour depuis Instagram » + date et résultat de la dernière synchro. */
export function SynchroInstagram() {
  const token = useAcces();
  const { data: derniere } = useQuery(convexQuery(api.instagram.derniere, { token }));
  const synchroniser = useAction(api.instagram.synchroniser);
  const [enCours, setEnCours] = useState(false);
  const [details, setDetails] = useState(false);

  const lancer = async () => {
    setEnCours(true);
    try {
      await synchroniser({ token });
    } finally {
      setEnCours(false);
    }
  };

  const nonRelies = derniere?.nonRelies ?? [];

  return (
    <section
      aria-label="Synchro Instagram"
      className={cn(
        "rounded border border-ink-700 bg-ink-900 p-3 md:px-4",
        derniere && !derniere.ok && "border-red-500/50 bg-red-500/5",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm">
          <p className="font-medium">Stats Instagram</p>
          <p className="mt-0.5 text-ink-400" role="status">
            {enCours
              ? "Lecture des stats sur Instagram…"
              : !derniere
                ? "Jamais mises à jour. Elles se mettent aussi à jour toutes les 3 heures."
                : derniere.ok
                  ? `Dernière mise à jour : ${heureReunion.format(derniere.fin)}${derniere.origine === "auto" ? " (automatique)" : ""} · ${derniere.misesAJour} chiffre${derniere.misesAJour > 1 ? "s" : ""} remplis`
                  : `Échec le ${heureReunion.format(derniere.fin)} : ${derniere.message}`}
          </p>
          {derniere?.ok && derniere.conflits > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-accent">
              <AlertTriangle size={13} />
              {derniere.conflits} chiffre{derniere.conflits > 1 ? "s" : ""} saisi{derniere.conflits > 1 ? "s" : ""} à la main
              diffère{derniere.conflits > 1 ? "nt" : ""} d&apos;Instagram à cette mise à jour : gardé
              {derniere.conflits > 1 ? "s" : ""}, à vérifier sur les cartes (orange).
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={lancer}
          disabled={enCours}
          className="flex h-9 shrink-0 items-center justify-center gap-2 rounded bg-white px-3 text-sm font-medium text-ink disabled:opacity-60"
        >
          <RefreshCw size={14} className={cn(enCours && "animate-spin")} />
          Mettre à jour depuis Instagram
        </button>
      </div>

      {nonRelies.length > 0 && (
        <div className="mt-3 border-t border-ink-800 pt-2">
          <button
            type="button"
            onClick={() => setDetails((d) => !d)}
            aria-expanded={details}
            className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-white"
          >
            <ChevronDown size={13} className={cn("transition-transform", details && "rotate-180")} />
            {nonRelies.length} post{nonRelies.length > 1 ? "s" : ""} Instagram sans publication sur le site
          </button>
          {details && (
            <ul className="mt-2 space-y-1.5 text-xs">
              {nonRelies.map((p) => (
                <li key={p.permalink} className="flex items-baseline gap-2">
                  <span className="shrink-0 tabular-nums text-ink-400">{jjmm(p.date)}</span>
                  <span className="shrink-0 text-ink-500">{p.type}</span>
                  <a href={p.permalink} target="_blank" rel="noreferrer" className="truncate text-ink-400 underline hover:text-white">
                    {p.legende || "(sans légende)"}
                  </a>
                </li>
              ))}
              <li className="pt-1 text-ink-500">
                Si l&apos;un d&apos;eux est une publication du calendrier, colle son lien dans la carte (crayon → Lien Instagram).
              </li>
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function Stats({ nom, stats, permalink }: { nom?: string; stats: StatsIg; permalink?: string }) {
  const morceaux = [
    `${nombre(stats.vues)} vues`,
    `${nombre(stats.portee)} comptes touchés`,
    stats.dureeVue !== null ? `${String(stats.dureeVue).replace(".", ",")} s de vue moy.` : null,
    `${nombre(stats.partages)} partages`,
    `${nombre(stats.enregistrements)} enreg.`,
    `${nombre(stats.likes)} j'aime`,
    `${nombre(stats.commentaires)} comm.`,
  ].filter(Boolean);
  return (
    <p className="text-xs leading-relaxed text-ink-400">
      {nom && <span className={cn("mr-1.5 font-medium", nom === "B" ? "text-fuchsia-300" : "text-white")}>{nom}</span>}
      {morceaux.join(" · ")}
      {permalink && (
        <a href={permalink} target="_blank" rel="noreferrer" className="ml-1.5 inline-flex items-center gap-0.5 underline hover:text-white">
          voir <ExternalLink size={11} />
        </a>
      )}
    </p>
  );
}

/** Ce qu'Instagram dit d'une publication ou d'un Reel d'essai, et les écarts avec les chiffres saisis. */
export function InstagramResume({
  lien,
  publication,
  reelEssai,
}: {
  lien: LienIg | undefined;
  publication?: Doc<"publications">["_id"];
  reelEssai?: Doc<"reelsEssai">["_id"];
}) {
  const token = useAcces();
  const accepter = useMutation(api.instagram.accepter);
  if (!lien || (!lien.statsA && !lien.statsB && !lien.conflits.length)) return null;
  const deux = !!(lien.statsA && lien.statsB);

  return (
    <div className="mt-3 space-y-1.5 rounded border border-ink-800 bg-ink/40 px-3 py-2">
      <p className={libelle}>
        Instagram{lien.syncAt ? ` · ${heureReunion.format(lien.syncAt)}` : ""}
        {lien.manuel && " · lien collé à la main"}
      </p>
      {lien.statsA && <Stats nom={deux ? "A" : undefined} stats={lien.statsA} permalink={lien.permalinkA} />}
      {lien.statsB && <Stats nom="B" stats={lien.statsB} permalink={lien.permalinkB} />}
      {lien.conflits.map((c) => (
        <div key={c.champ} className="flex flex-wrap items-center justify-between gap-2 rounded border border-accent/40 bg-accent/10 px-2 py-1.5 text-xs">
          <span>
            {nomChamp(c.champ)} : tu as saisi <strong>{nombre(c.manuel)}</strong>, Instagram dit{" "}
            <strong>{nombre(c.instagram)}</strong>. Ton chiffre est gardé.
          </span>
          <button
            type="button"
            onClick={() => accepter({ token, publication, reelEssai, champ: c.champ })}
            className="rounded border border-accent/50 px-2 py-1 text-accent hover:bg-accent hover:text-ink"
          >
            Prendre {nombre(c.instagram)}
          </button>
        </div>
      ))}
    </div>
  );
}

/** En mode modification : coller le lien du post si la correspondance automatique s'est trompée. */
export function LienInstagramChamps({ publication }: { publication: Doc<"publications"> }) {
  const token = useAcces();
  const lier = useMutation(api.instagram.lier);
  const [erreur, setErreur] = useState<string | null>(null);
  const lien = publication.instagram;
  const a = lien?.manuel ? (lien.permalinkA ?? "") : "";
  const b = lien?.manuel ? (lien.permalinkB ?? "") : "";
  const envoyer = async (permalinkA: string, permalinkB: string) => {
    setErreur(null);
    try {
      await lier({ token, id: publication._id, permalinkA, permalinkB });
    } catch {
      setErreur("Colle un lien qui commence par https://www.instagram.com/");
    }
  };
  const avecB = publication.accrocheB !== undefined || /trial|a\/b/i.test(publication.format);

  return (
    <div className="space-y-2">
      <label className="block">
        <span className={libelle}>Lien Instagram{avecB ? " (A)" : ""}</span>
        <TextField
          className="mt-1"
          value={a}
          placeholder={lien?.permalinkA ? `Trouvé tout seul : ${lien.permalinkA}` : "Vide = trouvé tout seul par date"}
          onCommit={(x) => envoyer(x, b)}
        />
      </label>
      {avecB && (
        <label className="block">
          <span className={libelle}>Lien Instagram (B · Trial)</span>
          <TextField
            className="mt-1"
            value={b}
            placeholder={lien?.permalinkB ? `Trouvé tout seul : ${lien.permalinkB}` : "Vide = trouvé tout seul par date"}
            onCommit={(x) => envoyer(a, x)}
          />
        </label>
      )}
      {erreur && <p className="text-xs text-red-400">{erreur}</p>}
    </div>
  );
}

/** Sous un indicateur de la semaine : origine Instagram, ou écart avec le chiffre saisi. */
export function MesureInstagram({ mesure }: { mesure: Doc<"mesures"> | undefined }) {
  const token = useAcces();
  const accepter = useMutation(api.instagram.accepterMesure);
  if (!mesure || mesure.instagram === undefined || mesure.instagram === null) return null;
  if (mesure.valeur === mesure.instagram)
    return <span className="block text-[10px] text-ink-500" title="Chiffre relevé sur Instagram">Instagram</span>;
  return (
    <button
      type="button"
      onClick={() => accepter({ token, id: mesure._id })}
      title="Ton chiffre est gardé. Clique pour prendre celui d'Instagram."
      className="block text-left text-[10px] text-accent underline-offset-2 hover:underline"
    >
      Instagram : {nombre(mesure.instagram)}
    </button>
  );
}
