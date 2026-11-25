import { AVERTISSEMENT, AVERTISSEMENT_DECEMBRE } from "@/components/suivi/Alertes";
import { dateCourte, nombre } from "@/lib/format";
import type { MoisData } from "@/lib/hooks/useMois";
import { classer } from "@/lib/reelsEssai";
import { messages, suitLesMessages, vues } from "@/lib/publications";
import { evaluer, indexer, type Valeurs } from "@/lib/regles";
import { lignesCalculees, suiviDecembre } from "@/lib/suivi";

type Controle = MoisData["controles"][number];

const STATUTS = { "a-preparer": "À tourner", tourne: "Tourné", publie: "Publié", reporte: "Reporté" } as const;
const REEL_STATUTS = { "a-preparer": "À préparer", publie: "Publié", partage: "Partagé à tous" } as const;

/** Texte récapitulatif à copier-coller dans la conversation Claude. */
export function exporterControle(data: MoisData, controle: Controle) {
  const semaines = data.semaines.filter((s) => controle.semaines.includes(s.code));
  const codes = semaines.map((s) => s.code);
  const valeurs: Valeurs = indexer(semaines, data.mesures);
  const alertes = evaluer(data.regles, valeurs, codes);
  const fin = semaines.at(-1)?.fin ?? controle.date;
  const ligne = (serie: (number | string)[]) => codes.map((c, i) => `${c} ${serie[i]}`).join(" · ");

  const lignes = [
    `# Point de contrôle — ${controle.titre} — ${data.mois.label}`,
    "",
    `## Indicateurs (${codes[0]} → ${codes.at(-1)})`,
    ...data.indicateurs.map((ind) => `- ${ind.label} : ${ligne(codes.map((_, i) => nombre(valeurs[ind.key]?.[i])))}`),
    ...lignesCalculees(data, valeurs, semaines).map((l) => `- ${l.label} : ${ligne(l.cellules.map((c) => c.texte))}`),
    "",
    `## Alertes actives${alertes.length ? ` (semaine ${alertes[0].semaine})` : ""}`,
    ...(alertes.length
      ? alertes.map(({ regle }) => `- ${regle.conditionLabel} → problème : ${regle.probleme}. Action : ${regle.action}`)
      : ["- Aucune"]),
    suiviDecembre(data) ? AVERTISSEMENT_DECEMBRE : AVERTISSEMENT,
    "",
    "## Publications jusqu'au " + dateCourte(fin),
    ...[...data.publications]
      .filter((p) => p.date <= fin)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => {
        if (!p.resultats)
          return `- ${dateCourte(p.date)} · ${p.format} · ${p.metier} · « ${p.accroche} » — ${STATUTS[p.statut]}, ${nombre(p.vues48h)} vues à 48 h, ${p.projetRecus ?? 0} PROJET`;
        const r = (x: NonNullable<typeof p.resultats>) =>
          `${nombre(x.vues)} vues, ${nombre(x.nonAbonnes)} % non-abonnés${/^reel/i.test(p.format) ? `, ${nombre(x.dureeVue)} s de vue moyenne` : ""}, ${nombre(x.partages)} partages, ${nombre(x.enregistrements)} enregistrements, ${nombre(x.messages)} messages`;
        return [
          `- ${dateCourte(p.date)} · ${p.format} · ${p.metier} · « ${p.accroche} » · CTA ${p.cta ?? "–"} — ${STATUTS[p.statut]}`,
          `  - A : ${r(p.resultats)}`,
          ...(p.resultatsB ? [`  - B (Trial) « ${p.accrocheB ?? ""} » : ${r(p.resultatsB)}`] : []),
        ].join("\n");
      }),
    ...(suitLesMessages(data.publications)
      ? [
          "",
          `Total : ${nombre(data.publications.filter((p) => p.date <= fin).reduce((t, p) => t + vues(p), 0))} vues, ${data.publications.filter((p) => p.date <= fin).reduce((t, p) => t + messages(p), 0)} messages reçus via les posts`,
        ]
      : []),
    ...(data.reelsEssai.some((r) => r.date <= fin)
      ? [
          "",
          "## Reels d'essai (Trial Reels, CTA abonnement, hors PROJET)",
          ...data.reelsEssai
            .filter((r) => r.date <= fin)
            .map(
              (r) =>
                `- ${dateCourte(r.date)} · Reel ${r.numero} « ${r.nom} » — ${REEL_STATUTS[r.statut]}, ${nombre(r.abonnes)} abonnés gagnés, ${nombre(r.visitesProfil)} visites du profil, ${nombre(r.vues48h)} vues à 48 h`,
            ),
          ...(classer(data.reelsEssai).length
            ? [`En tête : Reel ${classer(data.reelsEssai)[0].numero} (${nombre(classer(data.reelsEssai)[0].abonnes)} abonnés gagnés)`]
            : []),
        ]
      : []),
    "",
    ...(controle.alerte ? [`⚠️ Alerte : ${controle.alerte}`, ""] : []),
    "## Checklist",
    ...controle.items.map((i) => `- [${i.coche ? "x" : " "}] ${i.label}`),
    "",
    "## Notes",
    controle.notes.trim() || "(aucune)",
  ];

  return lignes.join("\n");
}
