"use client";

import { Chargement, PageTitre } from "@/components/Champs";
import { SynchroInstagram } from "@/components/Instagram";
import { AVERTISSEMENT, AVERTISSEMENT_DECEMBRE, Alertes } from "@/components/suivi/Alertes";
import { ReglesListe } from "@/components/suivi/ReglesListe";
import { SuiviSemaineCard } from "@/components/suivi/SuiviSemaineCard";
import { SuiviTable } from "@/components/suivi/SuiviTable";
import { useMoisData, useMutations } from "@/lib/hooks/useMois";
import { evaluer, indexer, semaineCourante } from "@/lib/regles";
import { suiviDecembre } from "@/lib/suivi";

export default function SuiviPage() {
  const { data } = useMoisData();
  const { setMesure, updateRegle } = useMutations();

  if (!data) return <Chargement />;

  const codes = data.semaines.map((s) => s.code);
  const valeurs = indexer(data.semaines, data.mesures);
  const courante = semaineCourante(valeurs, codes.length);
  const alertes = evaluer(data.regles, valeurs, codes);

  return (
    <main className="space-y-10">
      <PageTitre surtitre={data.mois.label} titre="Suivi hebdomadaire">
        <p className="max-w-sm text-sm text-ink-400 md:text-right">
          {data.semaines[0]?.code === "S0"
            ? "À remplir chaque dimanche, avant le tournage. S0 = les 7 jours avant le début du mois."
            : "À remplir chaque dimanche. Point de départ : la semaine du 9 au 14/11."}
        </p>
      </PageTitre>

      <SynchroInstagram />

      <Alertes
        alertes={alertes}
        semaine={courante >= 0 ? codes[courante] : null}
        avertissement={suiviDecembre(data) ? AVERTISSEMENT_DECEMBRE : AVERTISSEMENT}
      />

      <section aria-label="Indicateurs" className="space-y-3">
        <h2 className="font-serif text-2xl">Indicateurs</h2>
        <div className="hidden sm:block">
          <SuiviTable data={data} valeurs={valeurs} courante={courante} onSet={setMesure} />
        </div>
        <div className="sm:hidden">
          <SuiviSemaineCard data={data} valeurs={valeurs} courante={courante} onSet={setMesure} />
          <p className="mt-2 text-center text-xs text-ink-500">Tourne le téléphone pour voir le tableau complet.</p>
        </div>
      </section>

      <ReglesListe regles={data.regles} actives={new Set(alertes.map((a) => a.regle._id))} onUpdate={updateRegle} />
    </main>
  );
}
