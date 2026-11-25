"use client";

import { Chargement, PageTitre } from "@/components/Champs";
import { ControleCard } from "@/components/controles/ControleCard";
import { useMoisData, useMutations } from "@/lib/hooks/useMois";

export default function ControlesPage() {
  const { data } = useMoisData();
  const { toggleItem, setNotes } = useMutations();

  if (!data) return <Chargement />;

  return (
    <main className="space-y-8">
      <PageTitre surtitre={data.mois.label} titre="Points de contrôle">
        <p className="max-w-sm text-sm text-ink-400 md:text-right">
          Tout est envoyé en une fois dans le projet Claude, qui ajuste le plan des semaines suivantes.
        </p>
      </PageTitre>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {data.controles.map((c) => (
          <ControleCard key={c._id} data={data} controle={c} onToggle={toggleItem} onNotes={(notes) => setNotes(c._id, notes)} />
        ))}
      </div>
    </main>
  );
}
