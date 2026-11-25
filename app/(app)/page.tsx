"use client";

import { Clapperboard, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { ATournerPanel } from "@/components/ATournerPanel";
import { CalendrierHeader } from "@/components/CalendrierHeader";
import { Chargement } from "@/components/Champs";
import { SynchroInstagram } from "@/components/Instagram";
import { Rappels } from "@/components/Rappels";
import { ReelsEssaiSection } from "@/components/ReelsEssaiSection";
import { RotationClients } from "@/components/RotationClients";
import { ScriptPanel } from "@/components/ScriptPanel";
import { SemaineSection } from "@/components/SemaineSection";
import { StoryDuJour } from "@/components/StoryDuJour";
import type { Id } from "@/convex/_generated/dataModel";
import { useMoisData, useMutations } from "@/lib/hooks/useMois";
import { classer } from "@/lib/reelsEssai";
import { groupBySemaine, jourDeTournage } from "@/lib/semaines";

export default function CalendrierPage() {
  const { data } = useMoisData();
  const { updatePublication, removePublication, createPublication, updateReelEssai, updateStory, setScript } = useMutations();
  const [ouverte, setOuverte] = useState<Id<"publications"> | null>(null);
  const [tournage, setTournage] = useState(false);
  const fermer = useCallback(() => setOuverte(null), []);
  const fermerTournage = useCallback(() => setTournage(false), []);

  if (!data) return <Chargement />;

  const ajouter = () => {
    const derniere = [...data.publications].sort((a, b) => b.date.localeCompare(a.date))[0];
    createPublication(derniere?.date ?? data.semaines[1]?.debut ?? `${data.mois.key}-01`);
  };

  const publication = data.publications.find((p) => p._id === ouverte) ?? null;
  const semaine = publication && data.semaines.find((s) => publication.date >= s.debut && publication.date <= s.fin);
  // Scripts de tournage par semaine : à partir de décembre 2026 (novembre ne change pas)
  const vueTournage = data.mois.key >= "2026-12";

  return (
    <main className="space-y-10">
      <CalendrierHeader mois={data.mois.label} publications={data.publications} />

      {vueTournage && (
        <button
          type="button"
          onClick={() => setTournage(true)}
          className="-mt-4 flex h-12 w-full items-center justify-center gap-2 rounded border border-accent/50 bg-accent/10 text-sm font-medium text-white transition-colors hover:bg-accent/20 md:w-auto md:px-5"
        >
          <Clapperboard size={16} className="text-accent" /> À tourner cette semaine
        </button>
      )}

      <SynchroInstagram />

      <Rappels data={data} />

      <StoryDuJour stories={data.stories} onChange={updateStory} lienStories />

      {vueTournage && <RotationClients />}

      <ReelsEssaiSection reels={data.reelsEssai} onChange={updateReelEssai} />

      <div className="space-y-10">
        {groupBySemaine(data.semaines, data.publications, data.reelsEssai).map((groupe) => (
          <SemaineSection
            key={groupe.semaine?._id ?? "hors"}
            groupe={groupe}
            onChange={updatePublication}
            onRemove={removePublication}
            onOpen={setOuverte}
            onChangeReel={updateReelEssai}
            reelEnTete={classer(data.reelsEssai)[0]?._id}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={ajouter}
        className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-ink-700 py-4 text-sm text-ink-400 transition-colors hover:border-accent hover:text-white"
      >
        <Plus size={16} /> Ajouter une publication
      </button>

      <ScriptPanel
        publication={publication}
        onClose={fermer}
        onScript={(script) => publication && setScript(publication._id, script)}
        tournage={semaine?.tournage ? jourDeTournage(semaine) : undefined}
      />

      {vueTournage && (
        <ATournerPanel
          ouvert={tournage}
          onClose={fermerTournage}
          semaines={data.semaines}
          publications={data.publications}
          stories={data.stories}
          onScript={setScript}
        />
      )}
    </main>
  );
}
