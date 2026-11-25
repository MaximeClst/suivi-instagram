import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { verifierAcces } from "./acces";

const nombre = v.union(v.number(), v.null());

/** Les 6 Reels d'essai validés le 10/11/2026 (production-contenu/sortie/2026-12-trial-texte/README.md). */
const REELS = [
  {
    numero: 1,
    nom: "Lettre ouverte",
    date: "2026-11-12",
    fichier: "01-lettre-ouverte.mp4",
    couverture: "couv-01-lettre-ouverte.png · « Elle garde le client. »",
    legende: `Tu fais le chantier, la grosse boîte garde le client. Abonne-toi : ici, on parle de tes clients à toi.
#artisan974 #btp974 #soustraitance #lareunion`,
    musique: "Calme et posée, un peu grave (piano ou nappe), 70 à 90 BPM.",
  },
  {
    numero: 2,
    nom: "Fausse conversation",
    date: "2026-11-17",
    fichier: "02-fausse-conversation.mp4",
    couverture: "couv-02-fausse-conversation.png · « Il n'a jamais rappelé. »",
    legende: `Juste Facebook, et le client est parti voir ailleurs. Abonne-toi si tu veux que ça t'arrive plus.
#artisan974 #siteweb974 #btp974 #lareunion`,
    musique: "Légère tension, minimaliste, 80 à 95 BPM.",
  },
  {
    numero: 3,
    nom: "Phrase qui se complète",
    date: "2026-11-19",
    fichier: "03-phrase-qui-se-complete.mp4",
    couverture: "couv-03-phrase-qui-se-complete.png · « Celui qu'on trouve. »",
    legende: `Le meilleur, c'est celui qu'on trouve en premier. Abonne-toi : je t'aide à être trouvé.
#artisan974 #btp974 #siteweb974 #lareunion`,
    musique: "Suspense doux qui monte, 85 à 100 BPM.",
  },
  {
    numero: 4,
    nom: "Liste à capturer",
    date: "2026-11-24",
    fichier: "04-liste-a-capturer.mp4",
    couverture: "couv-04-liste-a-capturer.png · « 4 photos de chantier »",
    legende: `Enregistre ce post et prends ces 4 photos sur ton prochain chantier. Abonne-toi pour la suite 👆
#artisan974 #btp974 #chantier974 #lareunion`,
    musique: "Entraînante et légère, lo-fi ou pop, 95 à 110 BPM.",
  },
  {
    numero: 5,
    nom: "POV du soir",
    date: "2026-11-26",
    fichier: "05-pov-du-soir.mp4",
    couverture: "couv-05-pov-du-soir.png · « POV : 19 h »",
    legende: `Ton métier, c'est le chantier. Artisan au 974 ? Abonne-toi.
#artisan974 #btp974 #entrepreneur974 #lareunion`,
    musique: "Lo-fi du soir, calme et chaude, 70 à 85 BPM.",
  },
  {
    numero: 6,
    nom: "Fierté du 974",
    date: "2026-12-03",
    fichier: "06-fierte-974.mp4",
    couverture: "couv-06-fierte-974.png · « Artisans du 974 »",
    legende: `Les artisans péi construisent l'île tous les jours. Artisan péi ? Abonne-toi 🇷🇪
#artisan974 #btp974 #fiertepei #lareunion`,
    musique: "Positive et fière, percussions ou guitare, 100 à 115 BPM (un son péi libre de droits si disponible).",
  },
];

/** Ajoute les Reels d'essai manquants (par numéro), sans toucher aux données déjà saisies. */
export const charger = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existants = new Set((await ctx.db.query("reelsEssai").collect()).map((r) => r.numero));
    let n = 0;
    for (const r of REELS) {
      if (existants.has(r.numero)) continue;
      await ctx.db.insert("reelsEssai", {
        ...r,
        heure: "18:30",
        statut: "a-preparer",
        abonnes: null,
        visitesProfil: null,
        vues48h: null,
        comparaisonFaite: false,
      });
      n++;
    }
    return `${n} Reels d'essai ajoutés`;
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("reelsEssai"),
    patch: v.object({
      date: v.optional(v.string()),
      statut: v.optional(v.union(v.literal("a-preparer"), v.literal("publie"), v.literal("partage"))),
      abonnes: v.optional(nombre),
      visitesProfil: v.optional(nombre),
      vues48h: v.optional(nombre),
      comparaisonFaite: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { token, id, patch }) => {
    verifierAcces(token);
    await ctx.db.patch(id, patch);
  },
});
