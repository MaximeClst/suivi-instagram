import { v, type Infer } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { ecran, sticker, visuelType } from "./schema";
import {
  CLIENTS_MONTRES_PUBLICATIONS,
  CLIENTS_MONTRES_STORIES,
  CONCOURS_AJOUT,
  CONCOURS_REMPLACE,
  CONSEILS_MERCREDI,
  PUBLICATIONS_REELS_COURTS,
  PUBLICATIONS_V2,
  SAMEDI_ECRAN_2,
  SAMEDI_SITE_LIVRE,
  SAMEDIS_DECEMBRE,
  SCRIPTS_DECEMBRE,
  SCRIPTS_REELS_COURTS,
  TEXTE_VENDREDI,
  conseil,
  faq,
} from "./scriptsDecembre";

/**
 * Décembre 2026 (prompt « Ajouter décembre 2026 au site de suivi ») : publications, stories,
 * semaines S1–S5, indicateurs et règles propres au mois, points de contrôle.
 * Novembre n'est pas touché. Relançable : n'ajoute que ce qui manque.
 */

const MOIS = "2026-12";
const LIEN = "code-celeste.com/ads";
const vide = { vues: null, nonAbonnes: null, dureeVue: null, partages: null, enregistrements: null, messages: null };

/** `ajout` : publication ajoutée après le premier chargement ; insérée si absente (même date et même accroche A). */
type Pub = Pick<Doc<"publications">, "date" | "pilier" | "format" | "metier" | "accroche" | "cta"> & { accrocheB?: string; ajout?: string };

// v2 du 21/11/2026 (scriptsDecembre.ts). Le 15/12 (annonce du gagnant) est un ajout : inséré s'il manque.
// 22/11/2026, Maxime : 5 posts par semaine → + 7 Reels courts (ajouts), 19 publications.
const PUBLICATIONS: Pub[] = [
  ...PUBLICATIONS_V2.map((p) => (p.date === "2026-12-15" ? { ...p, ajout: "2026-11-21" } : p)),
  ...PUBLICATIONS_REELS_COURTS.map((p) => ({ ...p, ajout: "2026-11-22" })),
].sort((a, b) => a.date.localeCompare(b.date));

/**
 * Publications retirées après le premier chargement (date + accroche A).
 * Supprimées seulement si rien n'y a été saisi (statut « À tourner », aucun chiffre, pas de lien Instagram).
 */
const RETIREES: { date: string; accroche: string }[] = [
  // 21/11 : la v2 remettait le Reel Clim le 10/12 ; Maxime garde « Le camion » (scriptsDecembre.ts).
];

/** Corrections d'une publication déjà chargée : appliquées seulement si elle a encore son ancien texte. */
const CORRECTIONS = [
  {
    date: "2026-12-13",
    avant: { format: "Reel témoignage (plan B : site de la semaine)", metier: "Client filmé", accroche: "[Prénom], [métier] à [commune]" },
    apres: { format: "Reel face caméra · site client", metier: "Client avec accord", accroche: "[Métier] à [commune] ? Regarde ce que ses clients voient maintenant." },
  },
];



const vierge = (r: Doc<"publications">["resultats"]) => !r || Object.values(r).every((x) => x === null);

const SEMAINES = [
  { code: "S1", debut: "2026-11-30", fin: "2026-12-06", tournage: "2026-12-01" },
  { code: "S2", debut: "2026-12-07", fin: "2026-12-13", tournage: "2026-12-08" },
  { code: "S3", debut: "2026-12-14", fin: "2026-12-20", tournage: "2026-12-15" },
  { code: "S4", debut: "2026-12-21", fin: "2026-12-27", tournage: "2026-12-22" },
  { code: "S5", debut: "2026-12-28", fin: "2027-01-03", tournage: "2026-12-29" },
];

export const INDICATEURS_DECEMBRE = [
  { key: "reach_non_followers", label: "Vues des non-abonnés", source: "Tableau de bord pro", depart: "4 167", objectif: "Stable ou en hausse" },
  { key: "reel_watch_time", label: "Durée de vue moyenne des Reels (s)", source: "Statistiques des Reels de la semaine", depart: "2 à 6", objectif: "7 ou plus" },
  { key: "profile_visits", label: "Visites du profil", source: "Tableau de bord pro", depart: "64", objectif: "En hausse" },
  { key: "link_clicks", label: "Clics sur le lien", source: "Tableau de bord pro", depart: "6 % des visites", objectif: "10 % des visites ou plus" },
  { key: "sticker_replies", label: "Réponses aux stickers des stories", source: "Stories de la semaine", depart: "5", objectif: "12 par semaine" },
  { key: "messages_projet", label: "Messages PROJET", source: "Manuel (Insta + Facebook)", depart: "0", objectif: "" },
  { key: "messages_autres", label: "Autres messages", source: "Manuel (Insta + Facebook)", depart: "0", objectif: "" },
  { key: "mockups", label: "Maquettes lancées", source: "Manuel", depart: "", objectif: "" },
  { key: "signed", label: "Clients signés", source: "Manuel", depart: "", objectif: "" },
];

const REGLES: Omit<Doc<"regles">, "_id" | "_creationTime" | "ordre" | "mois">[] = [
  {
    condition: { type: "sous-seuil", k: "reel_watch_time", seuil: 5 },
    conditionLabel: "Durée de vue moyenne sous 5 s",
    probleme: "L'accroche",
    action: "Tester en Trial une ouverture plus directe : métier + commune + problème en 1 phrase",
  },
  {
    condition: { type: "seuil-et-stagne", a: "reel_watch_time", seuil: 5, b: "profile_visits" },
    conditionLabel: "Durée de vue correcte (5 s ou plus), visites du profil stagnent",
    probleme: "La fin du Reel",
    action: "Ajouter « Le reste sur mon profil » à l'écran à 12 s",
  },
  {
    condition: { type: "monte-et-taux-sous", a: "profile_visits", num: "link_clicks", den: "profile_visits", seuil: 0.1 },
    conditionLabel: "Visites du profil en hausse, clics sous 10 % des visites",
    probleme: "La bio ou les épinglés",
    action: "Réécrire la bio et l'épinglé n°1",
  },
  {
    condition: { type: "stagne", k: "sticker_replies" },
    conditionLabel: "Réponses aux stickers : pas de hausse 2 semaines de suite",
    probleme: "La question",
    action: "Passer aux sondages plutôt qu'aux questions ouvertes",
  },
  {
    condition: { type: "cumul-zero-apres", k: "messages_total", apres: "S4" },
    conditionLabel: "0 message reçu fin décembre (cumul après S4)",
    probleme: "L'offre ou le public",
    action: "Revoir l'offre de départ",
  },
];

const CHECKLIST = [
  "Captures du tableau de bord (Accueil, Performance, Activité du profil) sur la période",
  "Statistiques de chaque Reel : vues, part de non-abonnés, durée de vue moyenne, courbe de rétention",
  "Pour chaque test A/B : les deux Trial Reels côte à côte",
  "Nombre de messages reçus et leur source",
  "Routine du samedi : repartages des clients et messages reçus",
  "Ce que je n'ai pas tenu (tournage, stories, horaires)",
];

/** 22/11/2026 : alerte du point de contrôle du 13/12 (passage à 5 posts par semaine). */
const ALERTE_13_12 =
  "Revenir à 3 posts/semaine si tous les posts n'ont pas été tenus ou si les Reels courts font moins de 4 s de durée de vue moyenne";

const CONTROLES: { date: string; titre: string; semaines: string[]; alerte?: string }[] = [
  { date: "2026-12-13", titre: "Dimanche 13/12 (fin S2)", semaines: ["S1", "S2"], alerte: ALERTE_13_12 },
  { date: "2027-01-03", titre: "Dimanche 3/1 (fin S5)", semaines: ["S1", "S2", "S3", "S4", "S5"] },
];

// ——— Stories : une par jour, modèle hebdomadaire ———

type Sticker = Infer<typeof sticker>;
type Story = {
  date: string;
  theme: string;
  visuelType: Infer<typeof visuelType>;
  visuel: string;
  texte: string;
  sticker: Sticker;
  apres: string;
  ecrans?: Infer<typeof ecran>[];
  client?: string;
  voix?: string;
  ordre?: number;
};

const lien: Sticker = { type: "lien", libelle: "", reponses: [], lien: LIEN };
const sondage = (libelle: string, a: string, b: string): Sticker => ({ type: "sondage", libelle, reponses: [a, b], lien: "" });
const question = (libelle: string): Sticker => ({ type: "question", libelle, reponses: [], lien: "" });

const MESSAGE_CLIENT =
  "Avant de publier, prévenir le client et lui demander de repartager : « Salut [prénom] ! Je mets ton site en avant en story aujourd'hui, je t'identifie. Si tu peux la repartager, ça te fait de la pub aussi 💪 »";

/** Client montré en post la même semaine : à ne pas reprendre le samedi. */
const POST_CLIENT_SEMAINE: Record<string, string> = {
  "2026-12-05": "Pas le client du carrousel avant/après du 04/12.",
  "2026-12-19": "Pas le gagnant du concours (coulisses du 18/12).",
  "2026-12-26": "Un client différent des samedis précédents.",
};

const lundi = (date: string): Story => ({
  date,
  theme: "Sondage",
  visuelType: "fond",
  visuel: "Fond uni",
  texte: "Question rapide aux artisans du 974 👇",
  sticker: sondage("Tes clients te trouvent comment ?", "Bouche-à-oreille", "Google"),
  apres: "Écrire à chaque « Bouche-à-oreille »",
});

/** Samedi « site de la semaine » : client, métier et commune remplis quand ils sont connus (SAMEDIS_DECEMBRE). */
function samedi(date: string): Story {
  const connu = SAMEDIS_DECEMBRE[date];
  const mention: Sticker = { type: "mention", libelle: `@${connu?.client ?? "[client]"}`, reponses: [], lien: "" };
  const texte = `Site de la semaine : ${connu?.metierCommune ?? "[métier] à [commune]"} 👀`;
  const video = connu ? `Vidéo 10 s : défilement de ${connu.site} sur ton téléphone.` : "Vidéo du site du client (client différent chaque semaine).";
  return {
    date,
    theme: "Site de la semaine",
    visuelType: "video",
    visuel: connu ? `2 écrans · ${connu.client}` : "2 écrans",
    texte,
    sticker: mention,
    apres: connu ? MESSAGE_CLIENT.replace("prévenir le client", `prévenir ${connu.client}`) : MESSAGE_CLIENT,
    client: connu?.client ?? "",
    ecrans: [
      { visuelType: "video", visuel: `${video} ${SAMEDI_SITE_LIVRE} ${POST_CLIENT_SEMAINE[date] ?? ""}`.trim(), texte, sticker: mention, vues: null },
      { visuelType: "fond", visuel: "Fond uni", texte: SAMEDI_ECRAN_2, sticker: lien, vues: null },
    ],
  };
}

const MODELE: Record<number, (date: string) => Story> = {
  1: lundi,
  // v2 : on ne montre plus de site en cours → le mardi devient « FAQ en 10 s »
  2: (date) => ({
    date,
    theme: "FAQ en 10 s",
    visuelType: "video",
    visuel: "Face caméra, visage en gros plan, sous-titres incrustés.",
    texte: "[Question fréquente]",
    sticker: question("Pose-moi ta question sur les sites"),
    apres: "Réponse en message dans la journée.",
  }),
  3: (date) => ({
    date,
    theme: "Conseil 15 s",
    visuelType: "video",
    visuel: "Face caméra",
    texte: "[Un conseil applicable tout de suite]",
    sticker: question("Pose-moi ta question sur les sites"),
    apres: "Réponse en message dans la journée.",
  }),
  4: (date) => ({
    date,
    theme: "Relais du Reel",
    visuelType: "partage",
    visuel: "Partage du Reel du jour",
    texte: "Nouveau Reel 👆",
    sticker: sondage("T'as un site ?", "Oui", "Non, juste Facebook"),
    apres: "Écrire à chaque « Non »",
  }),
  5: (date) => ({
    date,
    theme: "Relais + offre",
    visuelType: "partage",
    visuel: "Partage du post du jour, puis fond uni",
    texte: TEXTE_VENDREDI,
    sticker: lien,
    apres: "Répondre dans l'heure",
  }),
  6: (date) => samedi(date),
  0: (date) => ({
    date,
    theme: "Relais du Reel",
    visuelType: "partage",
    visuel: "Partage du post du jour",
    texte: "Nouveau Reel 👆 Ça te parle ?",
    sticker: question("Ta plus grosse galère pour trouver des clients ?"),
    apres: "Répondre à chaque réponse",
  }),
};

/** 22/11/2026, Maxime : 4 stories par semaine (jeudi à dimanche) ; lundi, mardi, mercredi seulement pour le concours (1/12, 15/12). */
const STICKER_DIMANCHE = question("Tu veux que je regarde ta page ? Envoie-moi son nom");
// Pas de mini-audit (Maxime, 21/11 et 22/11) : même suite que les autres stories
const APRES_DIMANCHE = "Réponse en message dans la journée.";
const jourSemaine = (date: string) => new Date(date).getUTCDay();
const sansStory = (date: string) => [1, 2, 3].includes(jourSemaine(date)) && !CONCOURS_REMPLACE[date];

/** Story du dimanche : sticker question « regarde ta page », réponse en message ; le 27/12 reprend le conseil « Le test avant 2027 ». */
function dimanche(story: Story): Story {
  const base = { ...story, sticker: STICKER_DIMANCHE, apres: APRES_DIMANCHE };
  if (story.date !== "2026-12-27") return base;
  const c = CONSEILS_MERCREDI["2026-12-30"];
  return { ...base, theme: "Conseil 15 s", visuelType: "video", visuel: "Face caméra, visage en gros plan, sous-titres incrustés.", texte: c.texte, voix: c.voix };
}

export function storiesDecembre(): Story[] {
  return storiesJourParJour()
    .filter((s) => !sansStory(s.date))
    .map((s) => (jourSemaine(s.date) === 0 ? dimanche(s) : s));
}

function storiesJourParJour(): Story[] {
  const stories: Story[] = [];
  for (let jour = 1; jour <= 31; jour++) {
    const date = `2026-12-${String(jour).padStart(2, "0")}`;
    // Pas de publication les 24, 25 et 31/12 : thème du lundi
    if (["2026-12-24", "2026-12-25", "2026-12-31"].includes(date)) {
      stories.push(lundi(date));
    } else if (date === "2026-12-20") {
      // Férié : relais du carrousel, sans story de vente
      stories.push({
        date,
        theme: "Relais du carrousel (20 décembre, férié)",
        visuelType: "partage",
        visuel: "Partage du carrousel du jour, sans story de vente",
        texte: "Nouveau carrousel 👆 Ça te parle ?",
        sticker: question("Ta plus grosse galère pour trouver des clients ?"),
        apres: "Répondre à chaque réponse",
      });
    } else if (CONCOURS_REMPLACE[date]) {
      stories.push({ date, ...CONCOURS_REMPLACE[date] });
    } else {
      const v2 = faq(date) ?? conseil(date);
      stories.push(v2 ? { date, ...v2 } : MODELE[new Date(date).getUTCDay()](date));
    }
  }
  return stories;
}

export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bilan: string[] = [];
    if (!(await ctx.db.query("mois").withIndex("by_key", (q) => q.eq("key", MOIS)).unique())) {
      await ctx.db.insert("mois", { key: MOIS, label: "Décembre 2026" });
      bilan.push("mois créé");
    }

    // Semaines : remplace les S0–S4 créées automatiquement si aucun chiffre n'y est saisi
    const semaines = await ctx.db.query("semaines").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    const dejaBonnes = semaines.length === SEMAINES.length && semaines.every((s, i) => s.code === SEMAINES[i].code && s.debut === SEMAINES[i].debut);
    if (!dejaBonnes) {
      for (const s of semaines) {
        const mesure = await ctx.db.query("mesures").withIndex("by_semaine_indicateur", (q) => q.eq("semaineId", s._id)).first();
        if (mesure) throw new Error(`La semaine ${s.code} de décembre a déjà des chiffres : rien n'est remplacé`);
      }
      for (const s of semaines) await ctx.db.delete(s._id);
      for (const [ordre, s] of SEMAINES.entries()) await ctx.db.insert("semaines", { ...s, mois: MOIS, ordre });
      bilan.push("semaines S1–S5");
    }

    // Points de contrôle : remplace ceux créés automatiquement s'ils sont vierges
    const controles = await ctx.db.query("controles").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    const controlesBons = controles.length === 2 && controles.every((c) => CONTROLES.some((x) => x.date === c.date));
    if (!controlesBons) {
      for (const c of controles) {
        const items = await ctx.db.query("controleItems").withIndex("by_controle", (q) => q.eq("controleId", c._id)).collect();
        if (c.notes.trim() || items.some((i) => i.coche)) throw new Error(`Le point de contrôle « ${c.titre} » est déjà rempli : rien n'est remplacé`);
        for (const i of items) await ctx.db.delete(i._id);
        await ctx.db.delete(c._id);
      }
      for (const c of CONTROLES) {
        const controleId = await ctx.db.insert("controles", { mois: MOIS, ...c, notes: "" });
        for (const [ordre, label] of CHECKLIST.entries()) await ctx.db.insert("controleItems", { controleId, label, coche: false, ordre });
      }
      bilan.push("2 points de contrôle");
    }

    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    // Mois vide : tout le calendrier. Sinon : seulement les ajouts absents (les publications modifiées à la main ne sont pas recréées).
    const aInserer =
      publications.length === 0
        ? PUBLICATIONS
        : PUBLICATIONS.filter((p) => p.ajout && !publications.some((x) => x.date === p.date && x.accroche === p.accroche));
    if (aInserer.length) {
      for (const p of aInserer) {
        await ctx.db.insert("publications", {
          date: p.date,
          pilier: p.pilier,
          format: p.format,
          metier: p.metier,
          accroche: p.accroche,
          cta: p.cta,
          ...(p.accrocheB ? { accrocheB: p.accrocheB } : {}),
          mois: MOIS,
          heure: "18:30",
          statut: "a-preparer",
          vues48h: null,
          projetRecus: null,
          resultats: vide,
          ...(p.accrocheB ? { resultatsB: vide } : {}),
          clientMontre: CLIENTS_MONTRES_PUBLICATIONS[p.date] ?? "",
        });
      }
      bilan.push(`${aInserer.length} publication(s)`);
    }

    for (const r of RETIREES) {
      const p = publications.find((x) => x.date === r.date && x.accroche === r.accroche);
      if (!p) continue;
      const touchee = p.statut !== "a-preparer" || p.vues48h !== null || p.projetRecus !== null || !vierge(p.resultats) || !vierge(p.resultatsB) || p.instagram;
      if (touchee) throw new Error(`« ${r.accroche} » (${r.date}) a déjà des données : rien n'est supprimé`);
      await ctx.db.delete(p._id);
      bilan.push(`retirée : ${r.date} ${r.accroche}`);
    }

    for (const c of CORRECTIONS) {
      const p = await ctx.db
        .query("publications")
        .withIndex("by_mois", (q) => q.eq("mois", MOIS).eq("date", c.date))
        .filter((q) => q.eq(q.field("accroche"), c.avant.accroche))
        .first();
      if (p && p.format === c.avant.format && p.metier === c.avant.metier) {
        await ctx.db.patch(p._id, c.apres);
        bilan.push(`corrigée : ${c.date}`);
      }
    }

    // Scripts : ajoutés aux publications qui n'en ont pas (un script modifié sur le site n'est jamais écrasé)
    let scripts = 0;
    for (const p of await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect()) {
      const s = SCRIPTS_DECEMBRE[p.date] ?? (p.format === "Reel court" ? SCRIPTS_REELS_COURTS[p.date] : undefined);
      if (s && !p.script) {
        await ctx.db.patch(p._id, { script: s });
        scripts++;
      }
    }
    if (scripts) bilan.push(`${scripts} scripts`);

    const existantes = new Set(
      (await ctx.db.query("stories").withIndex("by_date", (q) => q.gte("date", "2026-12-01").lte("date", "2026-12-31")).collect()).map((s) => s.date),
    );
    let n = 0;
    for (const s of storiesDecembre()) {
      if (existantes.has(s.date)) continue;
      await ctx.db.insert("stories", { ...s, publiee: false, vues: null, reponses: null, messagesPrives: null, ...(s.ecrans ? { repartageClient: null } : {}) });
      n++;
    }
    if (n) bilan.push(`${n} stories`);

    for (const { date, ordre, story } of CONCOURS_AJOUT) {
      const memeJour = await ctx.db.query("stories").withIndex("by_date", (q) => q.eq("date", date)).collect();
      if (!memeJour.some((x) => x.ordre === ordre)) {
        await ctx.db.insert("stories", { date, ordre, ...story, publiee: false, vues: null, reponses: null, messagesPrives: null });
        bilan.push(`story concours du ${date}`);
      }
    }

    const indicateurs = await ctx.db.query("indicateurs").collect();
    if (!indicateurs.some((i) => i.mois === MOIS)) {
      for (const [ordre, i] of INDICATEURS_DECEMBRE.entries()) await ctx.db.insert("indicateurs", { ...i, mois: MOIS, ordre });
      bilan.push("indicateurs");
    }
    const regles = await ctx.db.query("regles").collect();
    if (!regles.some((r) => r.mois === MOIS)) {
      for (const [ordre, r] of REGLES.entries()) await ctx.db.insert("regles", { ...r, mois: MOIS, ordre });
      bilan.push("règles");
    }

    return bilan.length ? `Décembre : ${bilan.join(", ")}` : "Décembre déjà chargé";
  },
});

/**
 * v2 du 21/11/2026 : applique la nouvelle stratégie de décembre sur des données déjà chargées.
 * Publications : textes et scripts remplacés (la v1 est écrasée), le 15/12 ajouté ; statuts et résultats gardés.
 * Stories : contenu remplacé (FAQ du mardi, conseils, concours, offres du vendredi et du samedi) ; chiffres gardés.
 * Relançable.
 */
export const appliquerV2 = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bilan: string[] = [];
    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();

    for (const p of PUBLICATIONS_V2) {
      const script = SCRIPTS_DECEMBRE[p.date];
      const existante = publications.find((x) => x.date === p.date);
      const contenu = {
        pilier: p.pilier,
        format: p.format,
        metier: p.metier,
        accroche: p.accroche,
        cta: p.cta,
        accrocheB: p.accrocheB, // undefined = retire l'accroche B
        script,
      };
      if (existante) {
        await ctx.db.patch(existante._id, {
          ...contenu,
          ...(p.accrocheB && !existante.resultatsB ? { resultatsB: vide } : {}),
        });
      } else {
        await ctx.db.insert("publications", {
          ...contenu,
          date: p.date,
          mois: MOIS,
          heure: "18:30",
          statut: "a-preparer",
          vues48h: null,
          projetRecus: null,
          resultats: vide,
          ...(p.accrocheB ? { resultatsB: vide } : {}),
        });
        bilan.push(`ajoutée : ${p.date}`);
      }
    }
    bilan.push(`${PUBLICATIONS_V2.length} publications à jour`);

    // Stories : contenu de la story du jour (ordre absent ou 1)
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_date", (q) => q.gte("date", "2026-12-01").lte("date", "2026-12-31"))
      .collect();
    const duJour = (date: string) => stories.find((s) => s.date === date && (s.ordre === undefined || s.ordre === 1));
    let n = 0;
    for (const story of storiesDecembre()) {
      const s = duJour(story.date);
      if (!s) continue;
      const jour = new Date(story.date).getUTCDay();
      if (CONCOURS_REMPLACE[story.date] || faq(story.date) || conseil(story.date)) {
        // Remplace tout le contenu ; une story concours n'a plus d'écrans ni de client
        await ctx.db.patch(s._id, {
          theme: story.theme,
          visuelType: story.visuelType,
          visuel: story.visuel,
          texte: story.texte,
          sticker: story.sticker,
          apres: story.apres,
          voix: story.voix,
          ecrans: undefined,
          client: undefined,
          repartageClient: undefined,
        });
        n++;
      } else if (jour === 5 && s.theme === "Relais + offre") {
        await ctx.db.patch(s._id, { texte: TEXTE_VENDREDI });
        n++;
      } else if (jour === 6 && s.ecrans && story.ecrans) {
        await ctx.db.patch(s._id, {
          ecrans: s.ecrans.map((e, i) => ({ ...story.ecrans![i], vues: e.vues })),
          sticker: story.sticker,
          texte: story.texte,
        });
        n++;
      }
    }
    // Les stories du 3/12 et du 6/12 qui accompagnent une story concours : la story du jour passe en ordre 1
    for (const { date, ordre, story } of CONCOURS_AJOUT) {
      const s = duJour(date);
      if (s && s.ordre === undefined) await ctx.db.patch(s._id, { ordre: 1 });
      const deja = stories.find((x) => x.date === date && x.ordre === ordre);
      if (deja) await ctx.db.patch(deja._id, story);
      else {
        await ctx.db.insert("stories", { date, ordre, ...story, publiee: false, vues: null, reponses: null, messagesPrives: null });
        bilan.push(`story concours ajoutée : ${date}`);
      }
    }
    bilan.push(`${n} stories à jour`);
    return bilan.join(", ");
  },
});

/**
 * Rotation des clients (prompt du 21/11/2026) : remplit « Client montré » des publications et stories de décembre
 * listées, et met à jour les notes du 4/12 et du 13/12 et les slides 2 à 5 du 30/12. Rien d'autre ne bouge.
 * Un champ déjà rempli à la main n'est pas écrasé.
 */
export const rotationClients = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bilan: string[] = [];
    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    for (const [date, client] of Object.entries(CLIENTS_MONTRES_PUBLICATIONS)) {
      const p = publications.find((x) => x.date === date);
      if (!p) {
        bilan.push(`absente : ${date}`);
        continue;
      }
      const patch: Partial<Doc<"publications">> = {};
      if (!p.clientMontre) patch.clientMontre = client;
      const source = SCRIPTS_DECEMBRE[date];
      if (p.script && (date === "2026-12-04" || date === "2026-12-13")) patch.script = { ...p.script, consignes: source.consignes };
      if (p.script && date === "2026-12-30") patch.script = { ...p.script, slides: source.slides };
      await ctx.db.patch(p._id, patch);
      bilan.push(`${date} : ${p.clientMontre ?? client}`);
    }
    for (const [date, client] of Object.entries(CLIENTS_MONTRES_STORIES)) {
      const stories = await ctx.db.query("stories").withIndex("by_date", (q) => q.eq("date", date)).collect();
      const story = stories.find((s) => s.ordre === undefined || s.ordre === 1);
      if (!story) {
        bilan.push(`story absente : ${date}`);
        continue;
      }
      if (!story.client) await ctx.db.patch(story._id, { client });
      bilan.push(`story ${date} : ${story.client || client}`);
    }
    // Le champ existe sur tous les contenus de décembre : vide là où la rotation ne dit rien (à remplir à la main, ex. plan B du 18/12).
    let vides = 0;
    for (const p of publications) {
      if (p.clientMontre === undefined && !(p.date in CLIENTS_MONTRES_PUBLICATIONS)) {
        await ctx.db.patch(p._id, { clientMontre: "" });
        vides++;
      }
    }
    const stories = await ctx.db.query("stories").withIndex("by_date", (q) => q.gte("date", "2026-12-01").lte("date", "2026-12-31")).collect();
    for (const st of stories) {
      if (st.client === undefined && !(st.date in CLIENTS_MONTRES_STORIES && (st.ordre === undefined || st.ordre === 1))) {
        await ctx.db.patch(st._id, { client: "" });
        vides++;
      }
    }
    bilan.push(`${vides} champs « Client montré » ajoutés vides`);
    return bilan.join(", ");
  },
});

/**
 * 21/11/2026, Maxime : plus de mini-audit nulle part. Applique aux données de décembre déjà chargées :
 * 17/12 en PROJET (script remplacé par scriptsDecembre.ts), stories du mercredi et du 30/12 sans mini-audit,
 * indicateur « Messages mini-audit » et règle associée retirés (chiffres éventuels reportés dans « Autres messages »),
 * libellé de la checklist mis à jour. Statuts et résultats gardés.
 */
export const retirerMiniAudit = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bilan: string[] = [];
    const p17 = (await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect()).find((p) => p.date === "2026-12-17");
    if (p17) {
      const source = SCRIPTS_DECEMBRE["2026-12-17"];
      await ctx.db.patch(p17._id, { cta: "PROJET", ...(p17.script ? { script: { ...p17.script, titre: source.titre, plan: source.plan, legende: source.legende } } : {}) });
      bilan.push("17/12 en PROJET");
    }

    const stories = await ctx.db.query("stories").withIndex("by_date", (q) => q.gte("date", "2026-12-01").lte("date", "2026-12-31")).collect();
    let n = 0;
    for (const s of stories) {
      const c = conseil(s.date);
      if (c && (s.theme === "Conseil 15 s")) {
        await ctx.db.patch(s._id, { sticker: c.sticker, apres: c.apres, voix: c.voix });
        n++;
      } else if (s.apres === "Mini-audit en message") {
        await ctx.db.patch(s._id, { sticker: question("Pose-moi ta question sur les sites"), apres: "Réponse en message dans la journée." });
        n++;
      }
    }
    bilan.push(`${n} stories`);

    const indicateurs = (await ctx.db.query("indicateurs").collect()).filter((i) => i.mois === MOIS && i.key === "messages_audit");
    const semaines = await ctx.db.query("semaines").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    let reportes = 0;
    for (const s of semaines) {
      const audit = await ctx.db.query("mesures").withIndex("by_semaine_indicateur", (q) => q.eq("semaineId", s._id).eq("indicateurKey", "messages_audit")).first();
      if (!audit) continue;
      if (audit.valeur !== null) {
        const autres = await ctx.db.query("mesures").withIndex("by_semaine_indicateur", (q) => q.eq("semaineId", s._id).eq("indicateurKey", "messages_autres")).first();
        if (autres) await ctx.db.patch(autres._id, { valeur: (autres.valeur ?? 0) + audit.valeur });
        else await ctx.db.insert("mesures", { semaineId: s._id, indicateurKey: "messages_autres", valeur: audit.valeur });
        reportes += audit.valeur;
      }
      await ctx.db.delete(audit._id);
    }
    for (const i of indicateurs) await ctx.db.delete(i._id);
    bilan.push(`indicateur retiré (${reportes} message(s) reporté(s) dans « Autres »)`);

    const regles = (await ctx.db.query("regles").collect()).filter((r) => r.mois === MOIS && r.condition.type === "cumul-superieur");
    for (const r of regles) await ctx.db.delete(r._id);
    bilan.push(`${regles.length} règle retirée`);

    const controles = await ctx.db.query("controles").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    for (const c of controles) {
      const items = await ctx.db.query("controleItems").withIndex("by_controle", (q) => q.eq("controleId", c._id)).collect();
      for (const i of items) {
        if (i.label.includes("mini-audits")) await ctx.db.patch(i._id, { label: "Nombre de messages reçus et leur source" });
      }
    }
    return bilan.join(", ");
  },
});

/**
 * 21/11/2026, Maxime : clients choisis (O Milles Déco le 19/12, Chandelle Émeraude le 26/12, PAP LD en [client 6]),
 * « 10 artisans » le 30/12, métiers et communes connus remplis (4/12, 13/12, 30/12, samedis).
 * Statuts, chiffres et vues gardés. Un « Client montré » modifié à la main (sans crochets) n'est pas écrasé.
 */
export const majClientsDecembre = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bilan: string[] = [];
    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    for (const date of ["2026-12-04", "2026-12-13", "2026-12-30"]) {
      const p = publications.find((x) => x.date === date);
      const v2 = PUBLICATIONS_V2.find((x) => x.date === date);
      if (!p || !v2) continue;
      const source = SCRIPTS_DECEMBRE[date];
      const client = CLIENTS_MONTRES_PUBLICATIONS[date];
      await ctx.db.patch(p._id, {
        metier: v2.metier,
        accroche: v2.accroche,
        ...(client && (!p.clientMontre || p.clientMontre.includes("[client") || p.clientMontre.includes("Smart Power System")) ? { clientMontre: client } : {}),
        ...(p.script
          ? {
              script: {
                ...p.script,
                ...(source.accrocheA ? { accrocheA: source.accrocheA } : {}),
                ...(source.plan ? { plan: source.plan } : {}),
                ...(source.slides ? { slides: source.slides } : {}),
                ...(source.legende ? { legende: source.legende } : {}),
              },
            }
          : {}),
      });
      bilan.push(date);
    }
    for (const date of Object.keys(SAMEDIS_DECEMBRE)) {
      const story = (await ctx.db.query("stories").withIndex("by_date", (q) => q.eq("date", date)).collect()).find((s) => s.ordre === undefined || s.ordre === 1);
      if (!story) continue;
      const modele = samedi(date);
      await ctx.db.patch(story._id, {
        visuel: modele.visuel,
        texte: modele.texte,
        sticker: modele.sticker,
        apres: modele.apres,
        client: !story.client || story.client.includes("[client") ? modele.client : story.client,
        ecrans: modele.ecrans?.map((e, i) => ({ ...e, vues: story.ecrans?.[i]?.vues ?? null })),
      });
      bilan.push(`story ${date}`);
    }
    return bilan.join(", ");
  },
});

/**
 * 22/11/2026, Maxime : décembre passe à 5 posts et 4 stories par semaine. Sur des données déjà chargées :
 * - supprime les stories du lundi, mardi et mercredi (sauf le concours du 1/12 et du 15/12), seulement si rien n'y est saisi ;
 * - dimanche : sticker « Tu veux que je regarde ta page ? » et « Réponse en message dans la journée. » ; le 27/12 reprend le conseil « Le test avant 2027 » ;
 * - objectif « Réponses aux stickers » = 12 par semaine ;
 * - 7 Reels courts ajoutés avec leur script (19 publications) ;
 * - alerte du point de contrôle du 13/12.
 * Rien d'autre ne bouge. Relançable.
 */
export const cinqPostsParSemaine = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bilan: string[] = [];
    const stories = await ctx.db.query("stories").withIndex("by_date", (q) => q.gte("date", "2026-12-01").lte("date", "2026-12-31")).collect();

    const aSupprimer = stories.filter((s) => sansStory(s.date));
    const remplies = aSupprimer.filter((s) => s.publiee || s.vues !== null || s.reponses !== null || s.messagesPrives !== null);
    if (remplies.length) throw new Error(`Stories déjà remplies, rien n'est supprimé : ${remplies.map((s) => s.date).join(", ")}`);
    for (const s of aSupprimer) await ctx.db.delete(s._id);
    if (aSupprimer.length) bilan.push(`${aSupprimer.length} stories supprimées`);

    const modeles = new Map(storiesDecembre().map((s) => [s.date, s]));
    let dimanches = 0;
    for (const s of stories) {
      if (jourSemaine(s.date) !== 0 || (s.ordre !== undefined && s.ordre !== 1)) continue;
      const m = modeles.get(s.date);
      if (!m) continue;
      await ctx.db.patch(s._id, {
        sticker: m.sticker,
        apres: m.apres,
        ...(s.date === "2026-12-27" ? { theme: m.theme, visuelType: m.visuelType, visuel: m.visuel, texte: m.texte, voix: m.voix } : {}),
      });
      dimanches++;
    }
    bilan.push(`${dimanches} stories du dimanche`);

    const stickers = (await ctx.db.query("indicateurs").collect()).find((i) => i.mois === MOIS && i.key === "sticker_replies");
    if (stickers && stickers.objectif !== "12 par semaine") {
      await ctx.db.patch(stickers._id, { objectif: "12 par semaine" });
      bilan.push("objectif stickers 12/semaine");
    }

    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    let ajoutees = 0;
    for (const p of PUBLICATIONS_REELS_COURTS) {
      if (publications.some((x) => x.date === p.date && x.accroche === p.accroche)) continue;
      await ctx.db.insert("publications", {
        ...p,
        mois: MOIS,
        heure: "18:30",
        statut: "a-preparer",
        vues48h: null,
        projetRecus: null,
        resultats: vide,
        clientMontre: "",
        script: SCRIPTS_REELS_COURTS[p.date],
      });
      ajoutees++;
    }
    bilan.push(`${ajoutees} Reels courts ajoutés`);

    const c13 = (await ctx.db.query("controles").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect()).find((c) => c.date === "2026-12-13");
    if (c13 && c13.alerte !== ALERTE_13_12) {
      await ctx.db.patch(c13._id, { alerte: ALERTE_13_12 });
      bilan.push("alerte du 13/12");
    }
    return `Décembre : ${bilan.join(", ")}`;
  },
});

const ALERTE_13_12_V3 =
  "Revenir à 3-4 posts/semaine si les posts n'ont pas été tenus, si la portée non-abonnés moyenne par Reel est sous celle de novembre, ou si les Reels A font moins de 4 s de durée de vue moyenne";

/**
 * 25/11/2026, Maxime : décembre passe à 4-5 Reels + 2 carrousels par semaine et 1 à 3 stories par semaine.
 * Scripts réécrits avec les gabarits A, B, C (`recherche-decembre/scripts-decembre-brouillon.md`), CTA « Commente MAQUETTE ».
 * Les données (patchs, ajouts, stories retirées) sont calculées hors du code et passées en argument. Relançable :
 * les ajouts ne sont faits que s'ils manquent, aucune story déjà remplie n'est supprimée.
 */
export const appliquerV3 = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const bilan: string[] = [];
    for (const { id, patch } of data.patches as { id: Id<"publications">; patch: Partial<Doc<"publications">> }[]) {
      await ctx.db.patch(id, patch);
    }
    bilan.push(`${data.patches.length} publications mises à jour`);

    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    let ajoutees = 0;
    for (const p of data.inserts as Pick<Doc<"publications">, "date" | "accroche">[]) {
      if (publications.some((x) => x.date === p.date && x.accroche === p.accroche)) continue;
      await ctx.db.insert("publications", { ...(p as Doc<"publications">), mois: MOIS, statut: "a-preparer", vues48h: null, projetRecus: null, resultats: vide });
      ajoutees++;
    }
    bilan.push(`${ajoutees} publications ajoutées`);

    const aSupprimer = (await Promise.all((data.storiesSupprimees as Id<"stories">[]).map((id) => ctx.db.get(id)))).filter((s) => s !== null);
    const remplies = aSupprimer.filter((s) => s.publiee || s.vues !== null || s.reponses !== null || s.messagesPrives !== null);
    if (remplies.length) throw new Error(`Stories déjà remplies, rien n'est supprimé : ${remplies.map((s) => s.date).join(", ")}`);
    for (const s of aSupprimer) await ctx.db.delete(s._id);
    bilan.push(`${aSupprimer.length} stories supprimées`);
    for (const { id, patch } of data.storiesPatches as { id: Id<"stories">; patch: Partial<Doc<"stories">> }[]) {
      if (await ctx.db.get(id)) await ctx.db.patch(id, patch);
    }

    const stickers = (await ctx.db.query("indicateurs").collect()).find((i) => i.mois === MOIS && i.key === "sticker_replies");
    if (stickers && stickers.objectif !== "4 par semaine") {
      await ctx.db.patch(stickers._id, { objectif: "4 par semaine" });
      bilan.push("objectif stickers 4/semaine");
    }
    const c13 = (await ctx.db.query("controles").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect()).find((c) => c.date === "2026-12-13");
    if (c13 && c13.alerte !== ALERTE_13_12_V3) {
      await ctx.db.patch(c13._id, { alerte: ALERTE_13_12_V3 });
      bilan.push("alerte du 13/12");
    }
    return `Décembre v3 : ${bilan.join(", ")}`;
  },
});

/**
 * 25/11/2026 (2), Maxime : répartition des piliers de novembre (≈ 1/3 prise de conscience, 1/3 preuves,
 * 1/6 objections & offre, 1/6 personal brand) appliquée à décembre ; manifeste et « mon histoire » ajoutés,
 * doublons reportés ; vues de novembre ramenées aux seules valeurs de la synchro ; Reels d'essai retirés.
 * Données calculées hors du code. Relançable.
 */
export const appliquerV4 = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    for (const { id, patch } of data.patches as { id: Id<"publications">; patch: Partial<Doc<"publications">> }[]) {
      await ctx.db.patch(id, patch);
    }
    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    let ajoutees = 0;
    for (const p of data.inserts as Pick<Doc<"publications">, "date" | "accroche">[]) {
      if (publications.some((x) => x.date === p.date && x.accroche === p.accroche)) continue;
      await ctx.db.insert("publications", { ...(p as Doc<"publications">), mois: MOIS, statut: "a-preparer", vues48h: null, projetRecus: null, resultats: vide });
      ajoutees++;
    }
    let essais = 0;
    for (const id of data.reelsEssaiSupprimes as Id<"reelsEssai">[]) {
      if (await ctx.db.get(id)) {
        await ctx.db.delete(id);
        essais++;
      }
    }
    return `Décembre v4 : ${data.patches.length} publications modifiées, ${ajoutees} ajoutées, ${essais} Reels d'essai retirés`;
  },
});

/**
 * 25/11/2026 (3), Maxime : leviers de croissance (créole 3/12, « Je note ta page » 14/12, tier list 22/12,
 * CTA NOTE sur les Reels de prise de conscience, collaborations clients, CTA abonnement, story volontaires du 10/12).
 * Données : `recherche-decembre/scripts-leviers-croissance.md`. Relançable.
 */
export const appliquerV5 = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    for (const { id, patch } of data.patches as { id: Id<"publications">; patch: Partial<Doc<"publications">> }[]) {
      await ctx.db.patch(id, patch);
    }
    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", MOIS)).collect();
    let ajoutees = 0;
    for (const p of data.inserts as Pick<Doc<"publications">, "date" | "accroche">[]) {
      if (publications.some((x) => x.date === p.date && x.accroche === p.accroche)) continue;
      await ctx.db.insert("publications", { ...(p as Doc<"publications">), mois: MOIS, statut: "a-preparer", vues48h: null, projetRecus: null, resultats: vide });
      ajoutees++;
    }
    let stories = 0;
    for (const s of data.storiesAjout as Doc<"stories">[]) {
      const memeJour = await ctx.db.query("stories").withIndex("by_date", (q) => q.eq("date", s.date)).collect();
      if (memeJour.some((x) => x.theme === s.theme)) continue;
      await ctx.db.insert("stories", s);
      stories++;
    }
    return `Décembre v5 : ${data.patches.length} publications modifiées, ${ajoutees} ajoutées, ${stories} story ajoutée`;
  },
});
