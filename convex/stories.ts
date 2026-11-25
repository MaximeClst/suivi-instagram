import { type Infer, v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { verifierAcces } from "./acces";
import { ecran, sticker, visuelType } from "./schema";

const nombre = v.union(v.number(), v.null());
const LIEN = "code-celeste.com/ads";

type Sticker = Infer<typeof sticker>;
const aucun: Sticker = { type: "aucun", libelle: "", reponses: [], lien: "" };
const lien: Sticker = { type: "lien", libelle: "", reponses: [], lien: LIEN };
const sondage = (libelle: string, a: string, b: string): Sticker => ({ type: "sondage", libelle, reponses: [a, b], lien: "" });
const question = (libelle: string): Sticker => ({ type: "question", libelle, reponses: [], lien: "" });

type Story = {
  date: string;
  theme: string;
  visuelType: Infer<typeof visuelType>;
  visuel: string;
  texte: string;
  sticker: Sticker;
  apres: string;
};

/** Stories du 12 au 30/11/2026 (prompt « Ajouter les stories au site de suivi », v1). */
const STORIES: Story[] = [
  {
    date: "2026-11-12",
    theme: "Sondage",
    visuelType: "fond",
    visuel: "Fond uni violet + texte",
    texte: "Question rapide aux artisans du 974 👇",
    sticker: sondage("T'as un site pour ton activité ?", "Oui", "Non, juste Facebook"),
    apres: "Écrire en privé à chaque « Non » : « Salut ! Tu veux que je te montre à quoi ressemblerait ton site ? La 1re page est offerte. »",
  },
  {
    date: "2026-11-13",
    theme: "Relais post + offre",
    visuelType: "partage",
    visuel: "Partage du carrousel Smart Power System",
    texte: "~15 demandes depuis son site. Le tien, il ressemblerait à quoi ?",
    sticker: lien,
    apres: "Répondre à chaque message dans l'heure",
  },
  {
    date: "2026-11-14",
    theme: "Site de la semaine",
    visuelType: "video",
    visuel: "Vidéo 10 s : défilement du site SM Design sur ton téléphone",
    texte: "Site de la semaine : SM Design, BTP 🏗️",
    sticker: aucun,
    apres: "",
  },
  {
    date: "2026-11-15",
    theme: "Conseil 15 s",
    visuelType: "video",
    visuel: "Vidéo face caméra",
    texte: "Ton numéro sur ta page Facebook, il est cliquable ? Sinon tu perds des appels.",
    sticker: question("Tu veux que je vérifie ta page ? Envoie-moi son nom"),
    apres: "Vérifier chaque page reçue et répondre en privé",
  },
  {
    date: "2026-11-16",
    theme: "Relais post",
    visuelType: "partage",
    visuel: "Partage du Reel clim",
    texte: "Nouveau Reel 👆 Clim en panne : le client appelle qui ?",
    sticker: sondage("Tes clients te trouvent comment ?", "Bouche-à-oreille", "Google"),
    apres: "Écrire en privé à chaque « Bouche-à-oreille »",
  },
  {
    date: "2026-11-17",
    theme: "Coulisses",
    visuelType: "photo",
    visuel: "Photo de ton écran : maquette en cours (nom masqué sans accord)",
    texte: "Maquette en cours pour un artisan du 974 🔨",
    sticker: aucun,
    apres: "",
  },
  {
    date: "2026-11-18",
    theme: "Relais post",
    visuelType: "partage",
    visuel: "Partage du carrousel prix",
    texte: "Combien coûte un site ? Ça dépend de ton métier. Envoie-moi PROJET, je te réponds.",
    sticker: lien,
    apres: "Répondre dans l'heure",
  },
  {
    date: "2026-11-19",
    theme: "Preuve",
    visuelType: "capture",
    visuel: "Capture d'un message ou avis client (avec accord)",
    texte: "Message reçu cette semaine 🙏",
    sticker: aucun,
    apres: "",
  },
  {
    date: "2026-11-20",
    theme: "Relais post + offre",
    visuelType: "partage",
    visuel: "Partage du Reel livraison",
    texte: "Le prochain site livré, c'est le tien ? 1re page offerte. Envoie-moi PROJET en message.",
    sticker: lien,
    apres: "Répondre dans l'heure",
  },
  {
    date: "2026-11-21",
    theme: "Site de la semaine",
    visuelType: "video",
    visuel: "Vidéo 10 s : défilement d'un autre site client",
    texte: "Site de la semaine : [métier] à [commune] 👀",
    sticker: aucun,
    apres: "",
  },
  {
    date: "2026-11-22",
    theme: "Conseil 15 s",
    visuelType: "video",
    visuel: "Vidéo face caméra",
    texte: "Tape le nom de ta boîte sur Google. Ce que tu vois, ton client le voit aussi.",
    sticker: sondage("T'as fait le test ?", "Oui, c'est propre", "Oui… c'est pas terrible"),
    apres: "Écrire en privé à chaque « pas terrible »",
  },
  {
    date: "2026-11-23",
    theme: "Relais post",
    visuelType: "partage",
    visuel: "Partage du Reel peintre",
    texte: "Fais le test toi aussi 👆",
    sticker: aucun,
    apres: "",
  },
  {
    date: "2026-11-24",
    theme: "Coulisses",
    visuelType: "video",
    visuel: "Vidéo 10 s chez un client ou en rendez-vous (avec accord)",
    texte: "Rendez-vous chantier aujourd'hui : on prépare les photos de son futur site 📸",
    sticker: aucun,
    apres: "",
  },
  {
    date: "2026-11-25",
    theme: "Relais post",
    visuelType: "partage",
    visuel: "Partage du carrousel avant/après",
    texte: "Avant / après. Tu appelles lequel ?",
    sticker: sondage("", "Avant", "Après"),
    apres: "",
  },
  {
    date: "2026-11-26",
    theme: "Question",
    visuelType: "fond",
    visuel: "Fond uni + texte",
    texte: "Artisan : c'est quoi la question que tes clients te posent TOUJOURS au téléphone ?",
    sticker: question("Champ libre"),
    apres: "Répondre à chaque réponse en privé",
  },
  {
    date: "2026-11-27",
    theme: "Relais post + offre",
    visuelType: "partage",
    visuel: "Partage du Reel témoignage",
    texte: "Merci [prénom] 🙏 Ton tour ? Envoie-moi PROJET en message.",
    sticker: lien,
    apres: "Répondre dans l'heure",
  },
  {
    date: "2026-11-28",
    theme: "Site de la semaine",
    visuelType: "video",
    visuel: "Vidéo 10 s : défilement d'un site client",
    texte: "Site de la semaine : [métier] à [commune] 👀",
    sticker: aucun,
    apres: "",
  },
  {
    date: "2026-11-29",
    theme: "Bilan du mois",
    visuelType: "fond",
    visuel: "Fond uni + texte",
    texte: "En novembre : [X] sites en préparation pour des artisans du 974. Il reste de la place pour décembre.",
    sticker: lien,
    apres: "",
  },
  {
    date: "2026-11-30",
    theme: "Offre",
    visuelType: "fond",
    visuel: "Fond uni + texte",
    texte: "1re page de ton site offerte. Elle te plaît pas ? 0 €. En ligne en 7 jours, paiement en 3 fois.",
    sticker: lien,
    apres: "Répondre dans l'heure",
  },
];

/** Ajoute les stories manquantes (par date), sans toucher à celles déjà présentes ni aux chiffres saisis. */
export const charger = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existantes = new Set((await ctx.db.query("stories").collect()).map((s) => s.date));
    let n = 0;
    for (const s of STORIES) {
      if (existantes.has(s.date)) continue;
      await ctx.db.insert("stories", { ...s, publiee: false, vues: null, reponses: null, messagesPrives: null });
      n++;
    }
    return `${n} stories ajoutées`;
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("stories"),
    patch: v.object({
      theme: v.optional(v.string()),
      visuelType: v.optional(visuelType),
      visuel: v.optional(v.string()),
      texte: v.optional(v.string()),
      sticker: v.optional(sticker),
      apres: v.optional(v.string()),
      publiee: v.optional(v.boolean()),
      vues: v.optional(nombre),
      reponses: v.optional(nombre),
      messagesPrives: v.optional(nombre),
      ecrans: v.optional(v.array(ecran)),
      repartageClient: v.optional(v.union(v.boolean(), v.null())),
      client: v.optional(v.string()),
      voix: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { token, id, patch }) => {
    verifierAcces(token);
    await ctx.db.patch(id, patch);
  },
});

/** Site de la semaine (samedis 14, 21 et 28/11) : 2 écrans, un client différent chaque semaine, jamais celui du Reel de la semaine. */
const SITES_SEMAINE: Record<string, { client: string; metierCommune: string; visuel: string }> = {
  "2026-11-14": {
    client: "SM Design",
    metierCommune: "BTP au Tampon",
    visuel:
      "Vidéo 10 s : défilement de www.sm-design.re sur ton téléphone. Vidéo prête : production-contenu/sortie/stories-2026-11-14-site-semaine/story-site-semaine.mp4 (son texte incrusté est l'ancien : écrire le nouveau texte par-dessus ou refaire le rendu).",
  },
  "2026-11-21": {
    client: "PAP LD",
    metierCommune: "peintre à Bras-Panon",
    visuel: "Vidéo 10 s : défilement de www.pap-ld.re sur ton téléphone (pas L2KJ : il est dans le Reel du 16/11).",
  },
  "2026-11-28": {
    client: "L2KJ Services",
    metierCommune: "climaticien à La Possession",
    visuel: "Vidéo 10 s : défilement de www.l2kj-services.re sur ton téléphone (pas PAP LD : il est dans le Reel du 23/11).",
  },
};

export const sitesDeLaSemaine = internalMutation({
  args: {},
  handler: async (ctx) => {
    let n = 0;
    for (const [date, site] of Object.entries(SITES_SEMAINE)) {
      const story = await ctx.db.query("stories").withIndex("by_date", (q) => q.eq("date", date)).first();
      if (!story) continue;
      const ancien = story.ecrans;
      await ctx.db.patch(story._id, {
        theme: "Site de la semaine",
        visuelType: "video",
        visuel: `2 écrans · ${site.client}`,
        texte: `Site de la semaine : ${site.metierCommune} 👀`,
        sticker: { type: "mention", libelle: `@${site.client}`, reponses: [], lien: "" },
        apres: `Avant de publier, prévenir ${site.client} et lui demander de repartager : « Salut [prénom] ! Je mets ton site en avant en story aujourd'hui, je t'identifie. Si tu peux la repartager, ça te fait de la pub aussi 💪 »`,
        ecrans: [
          {
            visuelType: "video",
            visuel: site.visuel,
            texte: `Site de la semaine : ${site.metierCommune} 👀`,
            sticker: { type: "mention", libelle: `@${site.client}`, reponses: [], lien: "" },
            vues: ancien?.[0]?.vues ?? story.vues ?? null,
          },
          {
            visuelType: "fond",
            visuel: "Fond uni (production-contenu/sortie/fonds-stories/)",
            texte: "Tu veux le tien ? 1re page offerte 👇\nou envoie-moi PROJET en message",
            sticker: { type: "lien", libelle: "", reponses: [], lien: LIEN },
            vues: ancien?.[1]?.vues ?? null,
          },
        ],
        repartageClient: story.repartageClient ?? null,
      });
      n++;
    }
    return `${n} stories « Site de la semaine » mises à jour`;
  },
});
